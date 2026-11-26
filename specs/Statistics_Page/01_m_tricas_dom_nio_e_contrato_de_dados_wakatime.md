# 01 — Domínio, Métricas e Contrato de Dados (WakaTime)

> **Escopo deste arquivo:** Fonte única de verdade para o **Agente Orquestrador** e referência compartilhada entre os subagentes de Back-end e Front-end. Contém apenas regras de negócio, métricas avaliadas por recrutadores, destaque de AI e o contrato JSON entre camadas.

---

## 1. Objetivo de Negócio e Modos de Visualização

A página de estatísticas do portfólio deve demonstrar **maturidade de engenharia, consistência, domínio da stack e uso estratégico de Inteligência Artificial** (AI-assisted engineering) — evitando exibir apenas horas brutas sem contexto.

Toda a página opera sob **dois modos selecionáveis pelo usuário**:
1. **`last_30_days`** (Padrão inicial): Ritmo atual, stack recente e uso recente de IA.
2. **`all_time`**: Consistência de longo prazo, histórico acumulado e evolução geral.

---

## 2. Métricas Prioritárias e Regras de Cálculo

### A. Visão Geral (`overview`)
* **Tempo Total Ativo (`totalSeconds` / `totalTimeText`):** Tempo codando no período.
* **Média Diária (`dailyAverageSeconds` / `dailyAverageText`):** Indicador de regularidade sustentável (valorizado acima de picos isolados).
* **Dias Ativos (`activeDays`):** Quantidade de dias com atividade registrada no período.
* **Projeto Destaque (`topProject`):** Projeto #1 em tempo dedicado (desde que público/permitido).

### B. Engenharia Assistida por IA (`aiMetrics`)
* **Linhas Assistidas por IA (`aiAdditions` / `aiDeletions`):** Volume de código gerado/refatorado com IA.
* **Linhas Autorais (`humanAdditions` / `humanDeletions`):** Volume de código escrito/editado manualmente.
* **Taxa de Participação de IA (`aiSharePercent`):**
  $$\text{aiSharePercent} = \left( \frac{\text{aiAdditions}}{\text{aiAdditions} + \text{humanAdditions}} \right) \times 100$$
  *(Se o denominador for $0$, retornar `0`.)*
* **Dias com Uso de IA (`aiActiveDays`):** Contagem de dias em que houve atividade com assistentes de IA.
* **Ferramentas/Editores de IA (`tools`):** Editores e agentes usados no fluxo (ex.: Cursor, VS Code + Copilot, Claude Code) com percentual e tempo.

### C. Stack Técnica (`languages`)
* Top 6 a 8 linguagens ordenadas por `percent` decrescente + agrupamento `"Outras"` para o restante, validando na prática a stack do currículo.

### D. Projetos e Entregas (`projects`)
* Lista ordenada por tempo dedicado, cruzando esforço com entregas reais do portfólio.
* **Regra de Privacidade:** Projetos confidenciais/internos nunca devem expor nomes reais; devem ser filtrados ou agrupados sob `"Projetos Privados"`.

### E. Série Temporal (`timeline`) & Ambiente (`environment`)
* **Série Temporal (`timeline`):** Evolução cronológica separando tempo tradicional (`codingSeconds`) e tempo assistido por IA (`aiCodingSeconds`).
  * Em `last_30_days`: granularidade **diária** (30 pontos).
  * Em `all_time`: granularidade **mensal** (agregada por `YYYY-MM`).
* **Ambiente (`environment`):** Distribuição percentual de `editors` e `operatingSystems`.

---

## 3. Contrato JSON Compartilhado (Back-end $\rightarrow$ Front-end)

Endpoint interno exposto pelo back-end do portfólio:
`GET /api/wakatime?range={last_30_days|all_time}`

```json
{
  "range": "last_30_days",
  "updatedAt": "2026-11-25T17:00:00Z",
  "overview": {
    "totalTimeText": "84 hrs 20 mins",
    "totalSeconds": 303600,
    "dailyAverageText": "2 hrs 48 mins",
    "dailyAverageSeconds": 10080,
    "activeDays": 26,
    "topProject": {
      "name": "portfolio-v2",
      "timeText": "32 hrs 10 mins",
      "percent": 38.1
    }
  },
  "aiMetrics": {
    "hasAiData": true,
    "aiAdditions": 4250,
    "aiDeletions": 1120,
    "humanAdditions": 6890,
    "humanDeletions": 2340,
    "aiSharePercent": 38.15,
    "aiActiveDays": 22,
    "tools": [
      { "name": "Cursor", "percent": 64.2, "timeText": "54 hrs 05 mins" },
      { "name": "VS Code", "percent": 35.8, "timeText": "30 hrs 15 mins" }
    ]
  },
  "languages": [
    { "name": "TypeScript", "percent": 48.5, "timeText": "40 hrs 54 mins" },
    { "name": "Python", "percent": 24.0, "timeText": "20 hrs 14 mins" }
  ],
  "projects": [
    {
      "name": "portfolio-v2",
      "percent": 38.1,
      "timeText": "32 hrs 10 mins",
      "isPrivate": false
    }
  ],
  "timeline": [
    {
      "date": "2026-11-01",
      "totalSeconds": 9600,
      "codingSeconds": 6200,
      "aiCodingSeconds": 3400
    }
  ],
  "environment": {
    "editors": [
      { "name": "Cursor", "percent": 64.2, "timeText": "54 hrs 05 mins" }
    ],
    "operatingSystems": [
      { "name": "Linux", "percent": 78.0, "timeText": "65 hrs 46 mins" }
    ]
  }
}
```