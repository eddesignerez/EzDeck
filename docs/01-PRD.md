# PRD — Landing Page do EzDeck

**Estado:** `CONFIRMADO`  
**Responsável pelo produto:** Edu (eddesignerez) / SkillWatch & EzWatch  
**Última revisão:** 2026-10-27  

---

## 1. Problema

| Campo | Registro |
| --- | --- |
| **Problema** | Decks de atalhos físicos dedicados (como Elgato Stream Deck) são caros (R$ 900 a R$ 1.800+), ocupam espaço fixo na mesa e exigem hardware proprietário. Por outro lado, muitos usuários e streamers possuem smartphones ou tablets antigos parados na gaveta que poderiam servir perfeitamente como controles secundários, mas faltam soluções para Windows que sejam 100% locais, sem cadastro na nuvem, rápidas de parear e que não exijam conhecimento técnico (como instalar Node.js ou compilar código). |
| **Evidência/origem** | Repositório `eddesignerez/EzDeck` (fork/evolução independente inspirada no Dokke), tickets de usabilidade, necessidade de apresentar com clareza o instalador `EzDeck-Setup.exe` e o companion Android/PWA. |
| **Impacto** | Sem uma landing page clara e persuasiva, criadores de conteúdo, streamers, desenvolvedores e usuários cotidianos de Windows deixam de descobrir que podem ter um deck de 40 atalhos com latência de milissegundos sem gastar nada. |

---

## 2. Público e Contexto

| Público / Papel | Necessidade | Contexto de Uso | Requisitos de Acessibilidade e Idioma |
| --- | --- | --- | --- |
| **Streamers e Criadores de Conteúdo** | Trocar de cenas no OBS, mutar microfone, tocar vinhetas e disparar atalhos durante lives. | Setup com 1 ou 2 monitores e celular/tablet apoiado na mesa ao lado do teclado. | WCAG 2.2 AA (alto contraste, botões grandes com feedback visual e tátil). |
| **Gamers e Entusiastas de Simulação** | Atalhos rápidos para Discord, Spotify, captura de tela (`Win+Shift+S`) e macros de teclado. | Durante gameplay, sem precisar minimizar janelas cheias. | Suporte a toque rápido em telas de baixa resolução (Android 5.0+). |
| **Desenvolvedores e Profissionais de TI** | Abrir terminais, disparar scripts `.bat`/`.cmd`, compilações e alternar áreas de trabalho. | Durante home-office com computador Windows 10/11. | Idioma primário pt-BR, com suporte a EN, ES e JA. |

---

## 3. Primeira Versão (MVP da Landing Page)

| Resultado / Fluxo | Valor | Critério de Aceite Mensurável | Prioridade |
| --- | --- | --- | --- |
| **Apresentação de Alto Impacto** | Transmitir em menos de 5 segundos a proposta de valor do EzDeck. | Hero com visual do Stream Deck, chamada direta, badges de versão (`v0.2.13`) e semântica humana (`ezhuman`). | `P0` |
| **Simulador Interativo do Deck** | Permitir que o visitante teste o funcionamento da grade 4x2 diretamente na página antes de baixar. | Clique/toque nos botões aciona feedback luminoso e notificação simulada de ação do Windows em < 50ms. | `P0` |
| **Download e Guia de 3 Passos** | Direcionar o usuário para o instalador oficial `EzDeck-Setup.exe` e APK Android/PWA. | Links claros para releases oficiais no GitHub com instruções contra bloqueio do SmartScreen/Firewall. | `P0` |
| **Grid Bento de Recursos** | Detalhar segurança 100% local, suporte a 5 páginas (40 slots), zero Node.js necessário. | 6 cards visuais bem categorizados respeitando os tokens de design do EzDS. | `P0` |
| **Alternador de Tema e Idioma** | Consistência visual entre modo escuro (Dark Obsidian) e modo claro (Light Jeton). | Anti-FOUC no `<head>`, persistência em `localStorage`, contraste validado. | `P1` |
| **Tabela Comparativa e FAQ** | Eliminar todas as dúvidas e objeções técnicas (rede privada, portas, latência, privacidade). | Tabela EzDeck vs Deck Físico vs Outros Apps + 6 perguntas respondidas com clareza. | `P1` |

---

## 4. Fora do Escopo

- Sistema de login ou telemetria em nuvem (o EzDeck é 100% local e privado).
- Compilação remota de executáveis ou APIs pagas de terceiros.
- Loja proprietária de plugins pagos.

---

## 5. Requisitos Estáveis (Rastreamento SkillWatch)

| ID do Requisito | Obrigação Observável | Cenário e Resultado Esperado | ID do Aceite | Prioridade | Dono | Estado |
| --- | --- | --- | --- | --- | --- | --- |
| `REQ-LAND-001` | Header com identidade visual e navegação rápida | Dado acesso desktop ou mobile, exibir logo oficial, versão, links de âncoras e botão de download fixo. | `ACE-001` | P0 | Edu | `CONFIRMADO` |
| `REQ-LAND-002` | Hero Section com mockup visual interativo | Exibir mensagem clara de valor e representação tátil do painel EzDeck com 8 botões. | `ACE-002` | P0 | Edu | `CONFIRMADO` |
| `REQ-LAND-003` | Simulador funcional de Deck em navegador | O usuário clica em botões do simulador e vê o painel responder com feedback sonoro/visual. | `ACE-003` | P0 | Edu | `CONFIRMADO` |
| `REQ-LAND-004` | Seção explicativa em 3 passos | Passo a passo visual de instalação do host, pareamento via PIN e montagem dos botões. | `ACE-004` | P0 | Edu | `CONFIRMADO` |
| `REQ-LAND-005` | Matriz Bento de Recursos | Explicar 100% offline, 40 atalhos, zero Node.js, OBS integrado e descoberta UDP. | `ACE-005` | P0 | Edu | `CONFIRMADO` |
| `REQ-LAND-006` | FAQ e Superação de Objeções | Explicar aviso de SmartScreen, firewall em rede privada e suporte a iOS via PWA. | `ACE-006` | P1 | Edu | `CONFIRMADO` |
| `REQ-LAND-007` | Suporte a Tema Claro/Escuro (EzDS) | Script anti-FOUC, persistência no navegador, paleta obsidian/âmbar e jeton light. | `ACE-007` | P1 | Edu | `CONFIRMADO` |
