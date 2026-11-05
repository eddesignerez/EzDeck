# TRD / Arquitetura — Landing Page do EzDeck

**Estado:** `CONFIRMADO`  
**Responsável técnico:** Edu (eddesignerez) / SkillWatch & EzWatch  
**Última revisão:** 2026-10-27  

---

## 1. Escopo Técnico da Landing Page

A landing page foi concebida como uma aplicação estática ultrarrápida, sem dependências de frameworks pesados (Zero React/Vue/Webpack de build), garantindo carregamento instantâneo (< 300ms), compatibilidade total com navegadores modernos e facilidade de publicação em qualquer servidor estático (GitHub Pages, Cloudflare Pages, Netlify ou empacotada no próprio instalador).

| Camada | Responsabilidade | Tecnologia / Versão | Contrato / Entrada e Saída | Estado |
| --- | --- | --- | --- | --- |
| **Apresentação (UI)** | Estrutura semântica, acessibilidade e SEO | HTML5 semântico (tags `header`, `main`, `section`, `nav`, `footer`) | Documento W3C válido, tags OpenGraph e meta tags | `CONFIRMADO` |
| **Estilização (EzDS)** | Tokens semânticos, grid responsivo, transições e temas | CSS3 Puro (CSS Custom Properties, Grid 4/8/12, Flexbox, Anti-FOUC) | Sem pré-processadores; suporte a `prefers-color-scheme` | `CONFIRMADO` |
| **Interatividade** | Simulador do Deck, troca de tema, troca de idioma, acordeão de FAQ | JavaScript Vanilla ES2022 | Sem bibliotecas externas; executa em sandbox estático | `CONFIRMADO` |
| **Ativos Visuais** | Logos oficiais, ícones de atalho e favicons | PNG otimizado, ICO, SVGs inline | Carregamento local via pasta `assets/` | `CONFIRMADO` |

---

## 2. Relação com a Arquitetura do EzDeck Host

A landing page espelha e explica com exatidão a arquitetura do projeto principal:

```text
+--------------------------------------------------------------------------+
|                            WINDOWS 10 / 11                               |
|                                                                          |
|   +-----------------------+              +---------------------------+   |
|   |   EzDeck Host App     |              |     Janela de Ajustes     |   |
|   |  (Node 20 runtime     | <----------> |       (WebView2 UI        |   |
|   |   embutido no .exe)   |              |     com bandeja/systray)  |   |
|   +-----------+-----------+              +---------------------------+   |
|               |                                                          |
|       HTTP :3100 + WebSocket + UDP Broadcast (ezdeck:discover)           |
+---------------+----------------------------------------------------------+
                |
                |  (Somente Rede Local / Wi-Fi Privado - Zero Nuvem)
                |
+---------------+----------------------------------------------------------+
|               |                         |                                |
|   +-----------v-----------+   +---------v-------------+                  |
|   |     Android App       |   |   Navegador Web / PWA |                  |
|   | (APK nativo 5.0+,     |   | (iPhone, iPad, Edge,  |                  |
|   |  descoberta UDP auto) |   |  Chrome, tela cheia)  |                  |
|   +-----------------------+   +-----------------------+                  |
|                      CLIENTES COMPANION                                  |
+--------------------------------------------------------------------------+
```

---

## 3. Segurança e Diretrizes da Landing Page

1. **Privacidade e Proteção de Dados**:
   - Zero scripts de telemetria externa, analytics invasivos ou rastreadores de terceiros.
   - Todo o armazenamento é feito via `localStorage` estritamente para a preferência de tema (`dark` / `light`) e idioma (`pt-BR`, `en`, etc.).
2. **Prevenção Anti-FOUC (Flash of Unstyled Content)**:
   - Script síncrono inline no `<head>` que define imediatamente o atributo `data-theme` na tag `<html>` antes da primeira renderização da página.
3. **Resiliência e Ausência de Quebra de Rede**:
   - A página funciona 100% offline após ser baixada. Nenhuma fonte ou dependência bloqueia a renderização se o usuário estiver sem internet.

---

## 4. Estrutura de Diretórios da Landing Page

```text
landing/
├── index.html           # Documento HTML5 principal com SEO e semântica completa
├── style.css            # Estilos com tokens de design EzDS (dark & light)
├── script.js            # Interatividade do simulador, troca de tema e idiomas
├── assets/              # Logotipos, ícones e recursos visuais do EzDeck
│   ├── ezdeck-logo.png
│   ├── icon-512.png
│   ├── icon-192.png
│   ├── ezdeck.ico
│   └── donate-qr.png
└── docs/                # Os 6 documentos de governança EzStartKit
    ├── 01-PRD.md
    ├── 02-TRD.md
    ├── 03-REGRAS.md
    ├── 04-DESIGN.md
    ├── 05-TAREFAS.md
    └── 06-MEMORIA.md
```
