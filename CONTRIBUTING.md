# Contribuindo com o EzDeck

O EzDeck é construído em comunidade. Você pode ajudar relatando um problema, sugerindo uma feature ou enviando código.

## Onde comentar

- **Bug reproduzível:** abra uma [Issue](https://github.com/eddesignerez/EzDeck/issues/new?template=bug_report.yml) e informe a versão, o sistema/dispositivo e os passos para reproduzir.
- **Ideia ou feature:** abra uma [Discussion em Ideas](https://github.com/eddesignerez/EzDeck/discussions/categories/ideas). Explique o problema antes de propor a solução.
- **Dúvida, instalação ou ajuda:** use as [Discussions](https://github.com/eddesignerez/EzDeck/discussions).
- **Mudança de código:** leia as instruções abaixo e envie um Pull Request.

Antes de começar uma mudança grande, abra uma Discussion para alinhar o caminho com a comunidade.

## Preparar o ambiente

Requisitos: Windows 10/11 e Node.js 20 ou mais recente. Mudanças do Android exigem o Android SDK.

```sh
npm install
npm test
```

Para trabalhar na página pública:

```sh
cd docs
npm install
npm run dev
npm run build
```

## Onde cada coisa fica

- `server.js`, `auth.js`, `platform/windows/`: servidor e API local.
- `public/`: PWA servida aos dispositivos.
- `windows/`: host nativo e empacotamento do instalador Windows.
- `android/`: cliente Android.
- `test/`: testes automatizados.

## Pull Requests

- Explique o problema e como você verificou a solução.
- Mantenha o escopo pequeno e fácil de revisar.
- Não inclua PIN, keystore, tokens, logs pessoais ou APK Debug como release.
- Não altere a versão sem combinar a próxima release.
