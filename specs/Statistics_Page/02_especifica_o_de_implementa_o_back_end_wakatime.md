# 02 — Especificação de Implementação Back-end (WakaTime BFF)

> **Escopo deste arquivo:** Instruções exclusivas para o **Subagente de Back-end**. Consultar `01-wakatime-metrics-contract.md` para o schema exato de saída e regras de negócio.

---

## 1. Responsabilidade e Segurança

* Criar uma rota interna/BFF `GET /api/wakatime` aceitando o query param `range` (`last_30_days` ou `all_time`, default: `last_30_days`).
* **Autenticação WakaTime:** Enviar o header `Authorization: Basic {base64(WAKATIME_API_KEY)}` exclusivamente no servidor. Nunca expor `WAKATIME_API_KEY` ao cliente.
* **Base URL externa:** `https://wakatime.com/api/v1`

---

## 2. Endpoints Externos da WakaTime a Consumir

Para cada requisição de `range`, consolidar em paralelo (`Promise.allSettled`) os seguintes endpoints:

### A. `Stats` (Fonte Primária)
* **URL:** `GET /users/current/stats/{range}` (onde `{range}` é `last_30_days` ou `all_time`).
* **Extrair de `data`:**
  * `human_readable_total`, `total_seconds`
  * `human_readable_daily_average`, `daily_average`
  * `days_including_holidays` (ou contagem de dias ativos)
  * `languages[]`, `projects[]`, `editors[]`, `operating_systems[]`, `categories[]`
  * Campos de IA: `ai_additions`, `ai_deletions`, `human_additions`, `human_deletions`

### B. `Summaries` (Série Temporal)
* **URL:** `GET /users/current/summaries?start={YYYY-MM-DD}&end={YYYY-MM-DD}`
* **Janela de datas:**
  * Se `range === "last_30_days"`: `start` = hoje menos 30 dias; `end` = hoje. Retornar array diário (`YYYY-MM-DD`).
  * Se `range === "all_time"`: `start` = data inicial da conta (obtida de `stats/all_time` em `data.start` ou últimos 12–24 meses caso o intervalo seja muito longo); `end` = hoje. **Agrupar os itens por mês (`YYYY-MM`)** somando `totalSeconds`, `codingSeconds` e `aiCodingSeconds`.
* **Mapeamento por item de `data[]`:**
  * `totalSeconds`: `item.grand_total.total_seconds`
  * `aiCodingSeconds`: `total_seconds` da entrada em `item.categories[]` cujo `name === "AI Coding"` (default `0`).
  * `codingSeconds`: `total_seconds` da entrada em `item.categories[]` cujo `name === "Coding"` (default `0`).

### C. `Insights` (Padrões de IA e Consistência)
* **URL:** `GET /users/current/insights/ai_days/{range}`
* **Extrair:** Total de dias com atividade de IA no período para preencher `aiMetrics.aiActiveDays` (fallback: contar dias em `Summaries` onde `aiCodingSeconds > 0` ou `ai_additions > 0`).

---

## 3. Regras de Transformação, Sanitização e Resiliência

1. **Sanitização de Projetos Privados:**
   * Ler lista de nomes/prefixos privados via variável de ambiente (ex.: `WAKATIME_PRIVATE_PROJECTS="empresa-,cliente-x"`).
   * Somar `total_seconds` e `percent` de todos os projetos correspondentes em um único item `{ "name": "Projetos Privados", "isPrivate": true, ... }`.
   * Garantir que `overview.topProject` selecione o primeiro projeto com `isPrivate === false` (ou `"Projetos Privados"` caso não haja público).
2. **Normalização de Linguagens:**
   * Manter as Top 7 linguagens; agrupar o restante em `"Outras"` somando `percent` e `total_seconds`.
3. **Graceful Degradation para Campos de IA:**
   * Se a conta WakaTime ainda não possuir dados de `ai_additions` (campos ausentes ou `0`), definir `aiMetrics.hasAiData = false` sem quebrar a resposta.
4. **Estratégia de Cache:**
   * Cachear resposta normalizada por `range`:
     * `last_30_days`: TTL de **3 a 6 horas** (`Cache-Control: s-maxage=10800, stale-while-revalidate=3600`).
     * `all_time`: TTL de **12 a 24 horas** (`Cache-Control: s-maxage=43200, stale-while-revalidate=7200`).
   * Se `stats` estiver em processamento na WakaTime (HTTP `202 Accepted`), retornar último snapshot em cache ou payload de estado `isSyncing: true`.