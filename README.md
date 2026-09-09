# EzDeck

Painel local de atalhos para usar um computador Windows a partir de Android, tablet ou navegador. Transforme um celular antigo em um controle no estilo Stream Deck: escolha os aplicativos no computador e abra ou foque cada um pela tela auxiliar.

## Estado atual

O EzDeck está em preview, com janela nativa do Windows, ícone na bandeja e cadastro de aplicativos e atalhos de teclado. O instalador `EzDeck-Setup.exe` já inclui o runtime necessário: quem instala não precisa instalar Node.js. O companion Android/PWA usa PIN, WebSocket e descoberta automática pela rede local.

## Instalar no Windows

Baixe `EzDeck-Setup.exe` na página de Releases, execute-o e use o atalho criado na Área de Trabalho. O app é instalado em `%LOCALAPPDATA%\EzDeck`, preservando as configurações em `%APPDATA%\EzDeck` durante atualizações.

Enquanto o instalador não tiver certificado de assinatura de código do Windows, o SmartScreen pode pedir confirmação antes da primeira execução. Baixe o arquivo apenas pela Release oficial do EzDeck.

## Desenvolver no Windows

Requer Windows 10/11 e Node.js 20 ou mais recente:

```powershell
git clone https://github.com/eddesignerez/EzDeck.git
cd EzDeck
npm ci
.\windows\run-dev.ps1
```

A janela mostra a URL da rede local e o PIN. Você também pode abri-la com dois cliques em **EzDeck.vbs**. Cadastre apps e teclas nessa janela; feche-a para manter o EzDeck na bandeja ou use **Desligar EzDeck** para encerrar. Veja os detalhes em [Windows](windows/README.md).

Abra o companion no Android e digite o PIN na primeira conexão. O Android procura hosts EzDeck com UDP, mas você também pode abrir a URL manualmente no Chrome e escolher **Adicionar à tela inicial**.

Permita a rede apenas no perfil **Privado** caso o Firewall do Windows peça autorização. Não exponha a porta 3100 para a internet.

## Arquitetura

```text
Windows (EzDeck host)  ←→  HTTP + WebSocket + UDP  ←→  Android / PWA
```

O adaptador Windows lê atalhos do Menu Iniciar e programas cadastrados pela janela local. O Android só aciona itens desse inventário; o cadastro de caminhos e teclas exige acesso local e um token exclusivo da janela. O protocolo usa `ezdeck:discover` e o endpoint `/health` identifica o serviço como `EzDeck`.

## Origem, créditos e macOS

EzDeck é uma adaptação independente para Windows e Android inspirada no projeto [Dokke](https://github.com/felipenalves/Dokke), de Felipe Alves, sob licença MIT. A licença MIT e os créditos originais são preservados em [LICENSE](LICENSE). EzDeck não é afiliado, endossado nem sincronizado automaticamente com o Dokke.

Para uma versão para macOS, baixe o projeto original [Dokke](https://github.com/felipenalves/Dokke). Este repositório concentra apenas o host Windows e os clientes Android/PWA.

## Assinatura e releases

Os binários públicos serão gerados no GitHub Actions e a política de release está em [CODE_SIGNING_POLICY.md](CODE_SIGNING_POLICY.md). Enquanto um instalador não tiver assinatura de código, o Windows pode apresentar um aviso do SmartScreen: baixe somente pela Release oficial do EzDeck.
