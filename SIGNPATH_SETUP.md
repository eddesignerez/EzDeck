# Assinar releases do EzDeck com SignPath Foundation

Este guia prepara o instalador Windows para assinatura de código pelo SignPath Foundation. A assinatura reduz os avisos do Windows e demonstra que o arquivo publicado veio do processo oficial de release.

> A adesão ao SignPath Foundation é avaliada pelo próprio SignPath. O EzDeck só deve solicitar o programa quando o repositório estiver público, sob licença OSI/MIT, mantido ativamente e sem finalidade comercial incompatível com os termos do programa.

## 1. Publicar e proteger o repositório

1. No GitHub, deixe `eddesignerez/EzDeck` público.
2. Abra **Settings → Rules → Rulesets** e proteja `main`: pull request obrigatório, testes obrigatórios e aprovação de pelo menos um mantenedor.
3. Ative autenticação em dois fatores para cada mantenedor.
4. Mantenha [CODE_SIGNING_POLICY.md](CODE_SIGNING_POLICY.md) no repositório. Ele descreve exatamente como os binários são construídos e publicados.

## 2. Solicitar a assinatura

1. Acesse [SignPath Foundation](https://signpath.org/) e inicie a solicitação para o projeto open source.
2. Informe o endereço público do repositório, a licença MIT e a política de assinatura acima.
3. Explique que EzDeck é uma adaptação independente para Windows/Android inspirada no [Dokke](https://github.com/felipenalves/Dokke), com atribuição e licença MIT preservadas. Para macOS, o projeto recomendado é o Dokke original.
4. Aguarde a aprovação e crie, no painel SignPath, o projeto, a política de assinatura e a configuração do artefato ZIP do GitHub Actions.

## 3. Criar os segredos do GitHub

Em **Settings → Secrets and variables → Actions**, crie estes segredos com os valores fornecidos pelo SignPath:

- `SIGNPATH_API_TOKEN`
- `SIGNPATH_ORGANIZATION_ID`
- `SIGNPATH_PROJECT_SLUG`
- `SIGNPATH_SIGNING_POLICY_SLUG`

Para gerar o APK assinado na mesma automação, crie também:

- `EZDECK_RELEASE_KEYSTORE_BASE64`
- `EZDECK_RELEASE_STORE_PASSWORD`
- `EZDECK_RELEASE_KEY_ALIAS`
- `EZDECK_RELEASE_KEY_PASSWORD`

No computador que guarda a chave Android, gere o primeiro segredo sem mostrar o resultado na tela:

```powershell
[Convert]::ToBase64String([IO.File]::ReadAllBytes('C:\caminho\para\ezdeck-release.jks')) | Set-Clipboard
```

Cole-o diretamente no campo de segredo do GitHub. Nunca envie esse conteúdo em chat, issue, commit ou e-mail.

## 4. Produzir uma release

1. Leve a versão revisada para `main` por pull request.
2. Abra **Actions → Build signed release artifacts → Run workflow**.
3. Marque **Build the signed Android APK** para gerar o APK e **Send the Windows installer to SignPath** para pedir a assinatura do instalador.
4. Aguarde a aprovação configurada no ambiente `release` e, se exigido, no SignPath.
5. Baixe os artefatos `EzDeck-Android-release` e `EzDeck-Setup-signed` quando a execução terminar.
6. Crie a GitHub Release, anexe somente os artefatos assinados e publique o checksum SHA-256 de cada arquivo.

O workflow está em [`.github/workflows/release.yml`](.github/workflows/release.yml). Ele não publica uma Release automaticamente: a publicação final continua sob controle do mantenedor.
