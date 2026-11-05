# Especificação de Design — Landing Page do EzDeck (EzDS)

**Estado:** `CONFIRMADO`  
**Fonte Visual Canônica:** EzDesignSystem (`ezds`) integrado à identidade visual original do EzDeck  
**Última revisão:** 2026-10-27  

---

## 1. Fundamentos Visuais e Tokens Semânticos

A paleta une os tokens do **EzDS** com a identidade marcante do **EzDeck** (tons escuros de obsidiana/vidro fosco com brilho quente de âmbar/laranja terracota no tema escuro, e o estilo editorial Jeton no tema claro).

### Tema Escuro (Padrão: Dark Obsidian & Terracotta Glow)

| Token CSS | Valor | Aplicação |
| --- | --- | --- |
| `--color-action` | `#fa8537` | Cor primária de destaque (Laranja Âmbar EzDeck) |
| `--color-action-hover` | `#ff9a57` | Hover e foco em elementos de ação |
| `--color-action-glow` | `rgba(250, 133, 55, 0.35)` | Halo de iluminação tátil nos slots do Deck |
| `--color-surface` | `#120703` | Superfície base de fundo da página |
| `--color-surface-2` | `#220e06` | Superfície elevada para cards e seções |
| `--color-surface-card` | `linear-gradient(145deg, rgba(63, 35, 25, 0.76), rgba(20, 11, 8, 0.88))` | Cards com efeito de vidro fosco (glassmorphism) |
| `--color-text` | `#fff7f0` | Texto principal com alta legibilidade |
| `--color-text-muted` | `#d9b7a3` | Texto secundário, legendas e descrições |
| `--color-border` | `rgba(245, 177, 132, 0.22)` | Bordas sutis de cards e divisórias |
| `--color-border-glow` | `rgba(250, 133, 55, 0.55)` | Bordas ativas e estados de hover |
| `--color-success` | `#22c55e` | Status online, confirmação e segurança |
| `--color-warning` | `#f59e0b` | Avisos de configuração de rede |

### Tema Claro (Light Jeton Editorial)

| Token CSS | Valor | Aplicação |
| --- | --- | --- |
| `--color-action` | `#f73b20` | Vermelho alaranjado dinâmico |
| `--color-action-hover` | `#d82810` | Hover no tema claro |
| `--color-action-glow` | `rgba(247, 59, 32, 0.2)` | Halo suave |
| `--color-surface` | `#ffffff` | Fundo branco limpo |
| `--color-surface-2` | `#fdedea` | Fundo suave em tom quente |
| `--color-surface-card` | `#ffffff` | Cards com sombra delicada |
| `--color-text` | `#360802` | Texto profundo de alto contraste |
| `--color-text-muted` | `rgba(54, 8, 2, 0.65)` | Texto complementar |
| `--color-border` | `rgba(54, 8, 2, 0.12)` | Linhas e divisórias leves |
| `--color-border-glow` | `#f73b20` | Borda em foco e hover |

---

## 2. Tipografia e Escala de Espaçamento

- **Família de Fontes:** `Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`
- **Monospace (códigos e portas):** `"JetBrains Mono", Consolas, monospace`
- **Escala Modular:**
  - `Hero Title`: `clamp(2.4rem, 5vw, 4rem)` (peso 800)
  - `Heading 2`: `clamp(1.8rem, 3.5vw, 2.6rem)` (peso 700)
  - `Heading 3`: `1.25rem` a `1.5rem` (peso 600)
  - `Body Text`: `1rem` (16px base, line-height 1.6)
  - `Small / Badges`: `0.85rem` (peso 600, uppercase ou pill)
- **Raios de Arredondamento (Border-Radius):**
  - Botões e inputs: `12px`
  - Cards e containers: `20px` a `28px`
  - Slots e botões de atalho: `18px` a `22px`
  - Pílulas (badges): `999px`

---

## 3. Estados Obrigatórios de Componentes

1. **Normal / Repouso**: Cores de superfície com borda e contraste calibrados.
2. **Hover**: Elevação sutil com translateY(-2px), aumento de intensidade da borda e iluminação periférica.
3. **Active / Pressed**: Simulação do afundamento do botão físico do Stream Deck com transform scale(0.96) e flash de brilho.
4. **Foco Visível (`:focus-visible`)**: Contorno duplo ou outline de 3px com anel de foco destacado para acessibilidade motora e visual.
5. **Disabled**: Opacidade 0.45 com cursor not-allowed.

---

## 4. Layout e Grid Responsivo (Mobile-First)

- **Mobile (< 768px)**: Coluna única fluida, espaçamentos compactos de 16px, botões touch-friendly com área mínima de 44x44px. Grade do deck ajustada para manter os 8 botões visíveis e utilizáveis.
- **Tablet (768px - 1024px)**: Grid 8 colunas, cards em 2 colunas.
- **Desktop (> 1024px)**: Grid 12 colunas, largura máxima do container em 1240px, visualização simultânea do hero, simulação do deck e benefícios.
