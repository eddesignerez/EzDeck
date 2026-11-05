# Matriz de Tarefas Rastreável — Landing Page do EzDeck

**Última atualização:** 2026-10-27  
**Regra:** Nenhum item fica `CONCLUIDO` sem evidência de aceite verificada.

---

## 1. Fase Base (Governança e Design System)

| ID | Item | Prioridade | Estado | Dependências | Aceite / Evidência | Dono |
| --- | --- | --- | --- | --- | --- | --- |
| `BASE-01` | Elaborar PRD com foco em streamers, gamers e devs | P0 | `VERIFICADO` | Nenhuma | `landing/docs/01-PRD.md` aprovado | Edu |
| `BASE-02` | Definir arquitetura técnica estática ultraperformática | P0 | `VERIFICADO` | `BASE-01` | `landing/docs/02-TRD.md` aprovado | Edu |
| `BASE-03` | Estabelecer regras de segurança e 7 princípios | P0 | `VERIFICADO` | `BASE-01` | `landing/docs/03-REGRAS.md` aprovado | Edu |
| `BASE-04` | Especificar design system EzDS (Dark & Light anti-FOUC) | P0 | `VERIFICADO` | `BASE-01` | `landing/docs/04-DESIGN.md` aprovado | Edu |

---

## 2. Fase Implementação da Landing Page

| ID | Item | Prioridade | Estado | Dependências | Aceite / Evidência | Dono |
| --- | --- | --- | --- | --- | --- | --- |
| `LAND-01` | Header com Logo, navegação, seletor de tema e CTA | P0 | `CONCLUIDO` | `BASE-04` | Renderização do menu, alternância instantânea Dark/Light | Edu |
| `LAND-02` | Hero Section com mockup visual e botões de download | P0 | `CONCLUIDO` | `BASE-04` | Visual do deck, chamadas para `EzDeck-Setup.exe` e APK | Edu |
| `LAND-03` | Simulador funcional de Stream Deck no navegador | P0 | `CONCLUIDO` | `LAND-02` | 8 botões clicáveis, troca de páginas 1 a 5, feedback de ação | Edu |
| `LAND-04` | Seção passo a passo (1: Baixe, 2: Pareie PIN, 3: Arraste) | P0 | `CONCLUIDO` | `BASE-01` | 3 cards sequenciais ilustrados | Edu |
| `LAND-05` | Grid Bento de Diferenciais (100% Local, Zero Node, etc.) | P0 | `CONCLUIDO` | `BASE-04` | 6 cards com ícones e explicações técnicas | Edu |
| `LAND-06` | Tabela Comparativa (EzDeck vs Físico vs Outros) | P1 | `CONCLUIDO` | `BASE-01` | Tabela comparando custo, nuvem, latência e compatibilidade | Edu |
| `LAND-07` | FAQ interativo e footer com links de documentação | P1 | `CONCLUIDO` | `BASE-03` | 6 perguntas sanadas e links de políticas/licença | Edu |
| `LAND-08` | Verificação de contraste, anti-FOUC e testes de responsividade | P0 | `CONCLUIDO` | `LAND-01..07` | Suíte de verificação sem erros em desktop e mobile | Edu |
