# Regras Estritas — Subagente 1 (Auditoria, Realocação e Tradução de Textos)

> **Escopo exclusivo:** Este documento define os limites de atuação do **Subagente 1**. Sua única responsabilidade é auditar, padronizar, realocar e traduzir textos da interface para `locales/en.json` e `locales/pt.json`.

---

## 1. O que Você DEVE Fazer

1. **Auditar Textos Existentes:**
   * Inspecionar `locales/en.json`, `locales/pt.json` e todos os componentes/páginas do front-end em busca de:
     * Textos fixos (hardcoded) em português ou inglês na interface.
     * Expressões condicionais de idioma inline, como `{isPt ? '...' : '...'}` ou semelhantes.
2. **Centralizar nos Arquivos de Locales:**
   * Organizar todas as chaves de tradução de forma semântica e hierárquica (ex.: `navbar.*`, `home.*`, `experiences.*`, `statistics.*`, `curriculo.*`, `common.*`) em **`locales/en.json`** e **`locales/pt.json`**.
   * Garantir **100% de paridade de chaves** entre `en.json` e `pt.json` (nenhuma chave pode existir em apenas um dos arquivos).
   * Garantir traduções naturais, técnicas e fiéis ao contexto de portfólio profissional em inglês (`en.json`) e português (`pt.json`).
3. **Substituir Textos nos Componentes:**
   * Substituir strings literais e ternários `{isPt ? '...' : '...'}` pela chamada de tradução (`t('chave.aqui')` via `useTranslation()`), mantendo exatamente a mesma estrutura HTML/JSX e classes CSS ao redor do texto.

---

## 2. O que é ESTRITAMENTE PROIBIDO Fazer

* **PROIBIDO alterar lógica de negócio ou fluxo de dados:** Não modifique chamadas de API, estados (`useState`), efeitos (`useEffect`), filtros, cálculos, ordenações, rotas ou regras de validação.
* **PROIBIDO implementar ou alterar a lógica do seletor de idioma (`ENG` / `POR`):** Não crie handlers de clique para trocar idioma, não configure `localStorage` ou inicialização do `i18n` (isso é responsabilidade exclusiva do Subagente 2).
* **PROIBIDO alterar o visual / front-end dos botões de idioma (`ENG` / `POR`) ou de qualquer layout:** Não altere classes Tailwind, arquivos `.css`, estrutura de tags, ícones ou posicionamento de elementos.
* **PROIBIDO alterar dados dinâmicos de domínio/back-end:** Não traduza nem modifique payloads vindos de APIs (ex.: dados retornados pela API do WakaTime ou registros cadastrados no back-end). Traduza apenas rótulos, títulos, placeholders, mensagens de estado vazio/erro e textos estáticos da UI.
* **PROIBIDO remover exports ou quebrar assinaturas de componentes/props existentes.**

---

## 3. Critérios de Aceite para Validação pelo Orquestrador

Antes de encerrar sua execução, verifique:
1. `locales/en.json` e `locales/pt.json` são arquivos JSON sintaticamente válidos.
2. Todas as chaves presentes em `en.json` existem em `pt.json` e vice-versa, sem valores vazios (`""`).
3. Nenhum arquivo de estilo (`.css`) ou lógica de estado/roteamento foi modificado indevidamente.
4. O código compila sem erros de sintaxe ou imports quebrados nos arquivos tocados.