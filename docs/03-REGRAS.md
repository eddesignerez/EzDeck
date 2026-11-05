# Regras de Desenvolvimento — Landing Page do EzDeck

**Estado:** `CONFIRMADO`  
**Fonte de Autoridade:** SkillWatch / EzWatch (7 Princípios Não-Negociáveis e Skill `ezds` + `ezhuman`)  
**Última revisão:** 2026-10-27  

---

## 1. Convenções e 7 Princípios Não-Negociáveis

1. **Segurança antes de instalar / publicar**: Nenhuma dependência não auditada; código estático puro sem injeção dinâmica de scripts externos.
2. **Sem segredos no repositório**: Zero chaves de API, senhas, tokens ou dados pessoais embutidos nos arquivos.
3. **Não declarar pronto sem teste real**: Toda funcionalidade interativa (simulador, alternador de tema, links) deve ser testada e verificada em navegador real.
4. **Verificador ≠ Implementador**: Revisão estrutural independente de código, contraste e layout responsivo.
5. **O usuário aprova a entrega**: Estado final `CONCLUIDO` depende da validação humana.
6. **Fato ≠ Hipótese**: O que é capacidade real do EzDeck v0.2.13 (ex.: 5 páginas de 8 slots, OBS WS, UDP discovery) é citado como fato comprovado; o que não existe não é inventado.
7. **Menor mudança suficiente**: Código conciso, limpo e performático, preservando as marcas e convenções originais.

---

## 2. Padrões de Redação e Copywriting (`ezhuman`)

- **Tom de voz**: Direto, honesto, prático, acolhedor e entusiasta de produtividade.
- **Proibição de "AI Slop"**: Não utilizar jargões corporativos vazios (como "revolucionando o ecossistema holístico de sinergia entre dispositivos").
- **Foco em benefícios tangíveis**:
  - Economia de mais de R$ 1.000 em relação a hardware físico de deck.
  - Reutilização inteligente de celulares antigos que virariam lixo eletrônico.
  - Privacidade incondicional: dados e comandos trafegam exclusivamente na rede Wi-Fi de casa/estúdio.
  - Facilidade: instalar o `.exe` e já sair usando.

---

## 3. Diretrizes de Acessibilidade (WCAG 2.2 AA)

- **Contraste Mínimo**: Relação de contraste de cores de no mínimo `4.5:1` para texto normal e `3:1` para texto grande e botões de ação.
- **Navegação por Teclado**: Todos os elementos interativos (links, botões, slots do simulador) devem ter `:focus-visible` claramente delineado com anel de foco destacado.
- **Rótulos e ARIA**: Todos os ícones decorativos ou botões possuem atributos `aria-label`, `role` e estados `aria-expanded` / `aria-checked` devidamente gerenciados.
- **Redução de Movimento**: Suporte à media query `@media (prefers-reduced-motion: reduce)` desabilitando animações e transições quando solicitado pelo usuário no sistema operacional.
