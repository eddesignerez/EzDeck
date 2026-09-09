# AGENTS.md — EzDeck

Estas regras complementam o `AGENTS.md` do repositório pai. O Dokke é um
repositório aninhado e tem ciclo próprio de teste, release e publicação.

## Escopo

- O EzDeck roda o host no Windows e entrega a PWA/APK para Android, iPhone,
  iPad e navegador na rede local.
- O Windows é o host. Não reintroduzir pacote, scripts ou dependências macOS.
- Não misturar commits deste repositório com o monorepo pai.

## Desenvolvimento e verificação

- Trabalhar em `develop`; `main` é reservado para release.
- Transferências para `main` acontecem por PR autorizado; o trabalho normal
  permanece em `develop`.
- Após mudanças Node/PWA, rodar `npm test`.
- Alterações Android devem ser verificadas no dispositivo real quando o
  comportamento depender de WebView, teclado, viewport, ADB ou descoberta.
- Não aumentar timeout nem alterar expectativa para esconder falha: investigar
  a causa e manter o teste focado no contrato real.

## Segurança e release

- Nunca commitar PIN real, token, senha, keystore ou credencial de instalação.
- Não editar `SECURITY.md` para resolver uma tarefa comum.
- Não publicar APK Debug. Release exige `npm test`, assinatura do APK e
  geração do instalador Windows. Conferir o APK com `keytool -printcert
  -jarfile` e publicar SHA-256 dos artefatos entregues.
- Não fazer commit, push, PR, deploy ou release sem pedido explícito do Felipe.
- Preservar alterações de outros agentes; revisar `git status` antes de editar
  e commitar somente o conjunto autorizado.
