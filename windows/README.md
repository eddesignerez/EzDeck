# EzDeck para Windows — janela e bandeja

## Usar a janela do Windows

Com as dependências instaladas (`npm ci`), dê dois cliques em **EzDeck.vbs**,
na raiz do projeto. O comando `.\windows\run-dev.ps1` também abre a janela.
O painel de cartões roda dentro da janela nativa do EzDeck pelo WebView2, sem
abrir Chrome ou Edge e sem exibir barra de endereço.
Se o servidor anterior estiver rodando no terminal, pressione **Ctrl+C** nele
antes de iniciar a nova versão. A porta padrão é **3100**.

- A janela de configuração usa o mesmo visual de cartões do painel Android.
  Arraste um app da biblioteca para uma posição vazia e arraste os cartões para
  mudar de posição. Arrastar até **Remover** tira o botão do painel.
- O botão `⌨` cria atalhos como `Ctrl+C`, `Win+Shift+S`, `VolumeMute` e
  `MediaPlayPause`. Escolha uma imagem PNG, JPG ou WebP para criar um ícone
  personalizado do atalho. As teclas vão para a janela ativa no Windows.
- O botão `＋` permite escolher arquivos `.exe`, `.lnk`, `.appref-ms`, `.bat`
  ou `.cmd` locais. A biblioteca também inclui os aplicativos instalados pela
  Microsoft Store quando o Windows os expõe em **Iniciar**.
- A janela mostra o código de pareamento e os endereços para abrir no Android.
  Os botões aparecem no aparelho conectado automaticamente.

As teclas são enviadas para a **janela ativa no Windows**. O Windows pode
bloquear a automação de programas executados como administrador. Esta versão
não implementa sequências de macros, pausas ou comandos de terminal.

Fechar a janela ou usar **Minimizar para bandeja** mantém o servidor funcionando.
Dê dois cliques no ícone da bandeja para abrir a configuração novamente.
**Desligar EzDeck**, na janela ou no menu da bandeja, encerra o servidor e libera
a porta. Os cadastros ficam em `%APPDATA%\EzDeck` para a próxima abertura.

Para usar outra porta: `.\windows\run-dev.ps1 -Port 3200`.
O modo básico de console fica disponível com `.\windows\run-dev.ps1 -Console`,
sem a janela e o cadastro de teclas.

## Verificar

```powershell
node --test test/windows-platform.test.mjs test/windows-desktop.test.mjs
powershell.exe -NoProfile -STA -ExecutionPolicy Bypass -File windows/verify-desktop.ps1
```

O segundo comando inicia a janela com um host isolado na porta 3197, confirma
que o painel de cartões foi servido e encerra o processo.

## Instalação pelo código-fonte

Esta pasta permite usar o Windows como host e o Android como painel estilo
Stream Deck. O servidor, a PWA e o APK usam o mesmo protocolo do EzDeck; o
adaptador Windows encontra atalhos do Menu Iniciar e só abre caminhos que ele
mesmo inventariou.

Para instalar sem Node.js, use `EzDeck-Setup.exe` publicado na Release. O
instalador leva o runtime necessário, instala em `%LOCALAPPDATA%\EzDeck` e
cria o atalho na Área de Trabalho. Ele também registra **EzDeck** em
**Configurações → Aplicativos → Aplicativos instalados** e no **Painel de
Controle → Programas e Recursos**. Ao desinstalar, o app, o atalho e a opção
de iniciar com o Windows são removidos; os seus botões e configurações em
`%APPDATA%\EzDeck` são preservados para uma futura reinstalação. Para desenvolver pelo código-fonte, use
Windows 10/11 e Node.js 20 ou superior:

```powershell
npm ci
.\windows\run-dev.ps1
```

Se o PowerShell impedir scripts locais, rode apenas nesta sessão:

```powershell
Set-ExecutionPolicy -Scope Process Bypass
.\windows\run-dev.ps1
```

A janela mostra a URL da rede local e o PIN. No Android, instale o APK já
existente ou abra a URL no Chrome e escolha **Adicionar à tela inicial**. O
APK procura o host automaticamente pela rede local; a URL é útil no primeiro
pareamento ou se o Wi-Fi bloquear broadcast UDP.

O Windows Firewall pode perguntar se o Node/EzDeck pode usar redes privadas:
permita apenas em **redes privadas** para que o celular consiga conectar. Não
exponha a porta 3100 na internet.

## O que funciona neste preview

- inventário dos atalhos `.lnk` e `.appref-ms` do Menu Iniciar do usuário e do sistema;
- adicionar/remover favoritos pelo companion Android/PWA;
- abrir um item do inventário e tentar trazer a janela em execução para frente;
- ícone real por aplicativo quando o Windows o disponibiliza, com fallback visual da PWA;
- PIN, WebSocket e descoberta UDP existentes.

O instalador já embute o runtime Node. Para distribuição pública sem alertas do
SmartScreen, ele ainda precisa ser assinado com um certificado de código do
Windows. O APK Android também deve ser gerado como Release assinada antes de
ser publicado.
