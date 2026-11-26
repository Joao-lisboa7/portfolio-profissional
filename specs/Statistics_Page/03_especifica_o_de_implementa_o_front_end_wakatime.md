# 03 — Especificação de Implementação Front-end (Página de Estatísticas)

> **Escopo deste arquivo:** Instruções exclusivas para o **Subagente de Front-end**. Consultar `01-wakatime-metrics-contract.md` para o contrato JSON consumido de `/api/wakatime`.

---

## 1. Fluxo de Dados e Controle de Período

* **Fonte de dados:** Consumir exclusivamente `GET /api/wakatime?range={range}`.
* **Estado Global da Página (`range`):**
  * Valores: `"last_30_days"` (inicial) | `"all_time"`.
  * Renderizar um **Seletor Segmentado (Segmented Control / Tabs)** fixo no cabeçalho da página: `"Últimos 30 dias"` vs. `"Todo o período"`.
  * Ao alternar o seletor, atualizar todos os blocos abaixo exibindo *skeleton loaders* nos cards/gráficos durante o fetch e mantendo o layout estável (sem *layout shift*).

---

## 2. Arquitetura Visual e Seções da Página

Organizar a página em **5 blocos verticais** orientados à leitura rápida de recrutadores e líderes técnicos:

### Bloco 1: Cabeçalho + KPIs Principais (Grid 4 Cards)
1. **Tempo Ativo (`overview.totalTimeText`):** Exibir tempo formatado e badge com `overview.activeDays` dias ativos.
2. **Média Diária (`overview.dailyAverageText`):** Destacar regularidade diária no período selecionado.
3. **Colaboração com IA (`aiMetrics.aiSharePercent`%):** Exibir percentual de código assistido por IA + subtítulo comparando `aiAdditions` vs. `humanAdditions` linhas.
4. **Projeto Foco (`overview.topProject.name`):** Exibir o projeto principal, tempo dedicado (`topProject.timeText`) e link direto para o card/repositório do projeto no portfólio (quando correspondente).

### Bloco 2: Destaque — AI-Assisted Engineering
* **Condicional (`aiMetrics.hasAiData`):**
  * **Quando `true`:**
    1. **Gráfico Comparativo (Donut ou Barra Segmentada):** `aiAdditions` (Código Assistido por IA) vs. `humanAdditions` (Código Autoral / Revisado).
    2. **Gráfico de Evolução Temporal (`timeline`):** Barras empilhadas ou área comparando `aiCodingSeconds` vs. `codingSeconds` ao longo do período (eixo X formatado por dia em `last_30_days` e por mês/ano em `all_time`).
    3. **Ferramentas & Ecossistema (`aiMetrics.tools`):** Lista/badges com percentual e tempo de uso dos editores/agentes de IA + indicador de `aiActiveDays` dias com uso de IA.
    4. **Nota Contextual:** Microcopy discreta comunicando que a IA é empregada para aceleração de arquitetura, testes e refatoração sob revisão humana rigorosa.
  * **Quando `false`:** Exibir apenas a lista de ferramentas/editores (`environment.editors`) sem quebrar o layout.

### Bloco 3: Stack Técnica na Prática (`languages`)
* **Componente:** Gráfico de barras horizontais ordenadas por `percent`.
* **Conteúdo por linha:** Nome da linguagem, cor identificadora, `percent%` e `timeText`.

### Bloco 4: Projetos & Entregas (`projects`)
* **Componente:** Lista de cards/linhas com barra de progresso relativa.
* **Conteúdo por item:** Nome do projeto, `timeText`, `percent%` e, se `isPrivate === false` e existir match no portfólio/GitHub, link discreto para inspeção do código/case. Itens com `isPrivate === true` devem exibir um ícone de cadeado indicando trabalho confidencial/corporativo.

### Bloco 5: Consistência e Ambiente (`timeline` + `environment`)
* **Consistência de Atividade:** Gráfico de barras ou heatmap de `timeline[].totalSeconds` mostrando frequência de codificação no período.
* **Ambiente de Trabalho (Compacto):** Duas colunas/badges discretas para `environment.editors` e `environment.operatingSystems`.

---

## 3. Requisitos de UI/UX e Tratamento de Estados

* **Formatação de Unidades:** Converter segundos de `timeline` para horas/minutos legíveis nos tooltips dos gráficos (ex.: `2h 40m`).
* **Estados de Erro e Sincronização:**
  * Exibir banner discreto de aviso se a API retornar erro, mantendo dados em cache/fallback se disponíveis.
  * Exibir timestamp de última atualização (`updatedAt`) no rodapé da página para transparência técnica.
* **Responsividade:** Grids devem colapsar de 4 colunas (desktop) $\rightarrow$ 2 colunas (tablet) $\rightarrow$ 1 coluna (mobile), com gráficos redimensionáveis via container fluido.