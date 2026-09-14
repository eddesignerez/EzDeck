# Preparação para SignPath Foundation

Este documento registra o que já está pronto e o que exige ação do responsável pelo repositório antes de solicitar assinatura gratuita para o instalador Windows.

## Estado atual

| Item | Estado | Observação |
| --- | --- | --- |
| Repositório público | Pronto | `eddesignerez/EzDeck` é público. |
| Licença aberta | Pronto | MIT preservada com atribuição ao Dokke. |
| Política de assinatura | Pronto | Consulte [CODE_SIGNING_POLICY.md](CODE_SIGNING_POLICY.md). |
| Política de privacidade | Pronto | Consulte [PRIVACY.md](PRIVACY.md). |
| Build reproduzível pelo GitHub Actions | Pronto | O workflow [release.yml](.github/workflows/release.yml) compila o instalador a partir da `main`. |
| Testes automáticos | Pronto no código | O workflow de testes roda em `develop`, `main` e pull requests para `main`. |
| Fork técnico reconhecido pelo GitHub | Pendente | O repositório atual é uma adaptação pública com crédito ao Dokke, mas não aparece como fork técnico no GitHub. Consulte a SignPath antes de solicitar a assinatura. |
| Proteção da branch `main` | Pronto | Pull request, teste aprovado e conversas resolvidas são exigidos; force-push e exclusão estão bloqueados. |
| 2FA de mantenedores | Pendente | Cada pessoa com acesso de escrita deve usar autenticação em dois fatores. |
| Conta e aprovação SignPath | Pendente | A inscrição e cada aprovação de assinatura são feitas pelo responsável do projeto. |

## Passos para o responsável

1. Ative 2FA na conta GitHub e confirme que todos os mantenedores também a utilizam.
2. Quando houver outro mantenedor, ajuste a proteção de `main` em **Settings → Branches** para exigir ao menos uma aprovação. Atualmente a branch já exige pull request, teste aprovado e conversas resolvidas.
3. Abra a solicitação em <https://signpath.org/apply.html>. Informe que o EzDeck é uma adaptação independente, de código aberto, inspirada no Dokke e com créditos preservados.
4. Pergunte explicitamente se a estrutura atual — repositório independente, público e com atribuição ao Dokke — é elegível. Se eles exigirem fork técnico, siga a orientação deles antes de configurar a assinatura.
5. Após a aprovação, crie no ambiente GitHub `release` os segredos recebidos da SignPath:
   - `SIGNPATH_API_TOKEN`
   - `SIGNPATH_ORGANIZATION_ID`
   - `SIGNPATH_PROJECT_SLUG`
   - `SIGNPATH_SIGNING_POLICY_SLUG`
6. Em cada versão Windows, execute **Build signed release artifacts** com `sign_windows` marcado. Revise e aprove o pedido na SignPath; depois publique somente o artefato `EzDeck-Setup-signed` na release.

## Limites importantes

- Não inclua tokens, certificados ou senhas em issues, commits, arquivos de configuração ou releases.
- A assinatura SignPath é para o instalador Windows. O APK Android usa a chave Android de release, configurada separadamente.
- Uma assinatura válida prova a origem do artefato produzido pelo fluxo aprovado; ela não substitui revisão de código, testes ou atualização de dependências.
