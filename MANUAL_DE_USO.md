# Manual de uso do EzDeck

O EzDeck transforma um computador Windows em um painel de atalhos que pode ser
acionado por Android, tablet, iPhone, iPad ou qualquer navegador na mesma rede.

## 1. Instale e abra o host Windows

1. Baixe `EzDeck-Setup.exe` na [Release oficial](https://github.com/eddesignerez/EzDeck/releases).
2. Execute o instalador e abra o atalho **EzDeck** criado na Área de Trabalho.
3. Se o Firewall do Windows perguntar, permita o acesso apenas em **redes privadas**.
4. Mantenha a janela aberta para configurar o painel ou envie-a para a bandeja.

> Enquanto o instalador não tiver assinatura de código, o Windows pode exibir
> um aviso do SmartScreen. Baixe somente pela Release oficial.

## 2. Conecte um celular ou tablet

1. Conecte o computador e o aparelho ao mesmo Wi-Fi.
2. No EzDeck Windows, veja o endereço mostrado após **Acesso:** e o PIN de quatro dígitos.
3. No Android, abra o APK EzDeck. Ele tenta encontrar o computador automaticamente.
4. Se a descoberta não funcionar, digite o IP e a porta mostrados na janela do Windows.
5. Informe o PIN quando solicitado.

Também é possível abrir o endereço no Chrome, Safari ou outro navegador e
adicionar a página à tela inicial. Isto é útil para iPhone e iPad.

## 3. Monte o painel

- **Arraste** um aplicativo da biblioteca à esquerda para uma posição vazia.
- **Arraste** cartões já adicionados para reorganizá-los.
- Use o **X** do cartão para removê-lo do painel.
- Use `＋ Página` para criar outra página e `− Página` para remover a última
  página vazia.
- Clique em um cartão para alterar o ícone, quando essa opção estiver disponível.
- Use `⌨` para criar um atalho de teclado, como `Ctrl+C` ou `Win+Shift+S`.
- Use `＋` para cadastrar um arquivo local, como `.exe`, `.lnk`, `.bat` ou `.cmd`.

As teclas são enviadas à janela que estiver ativa no Windows. Programas abertos
como administrador podem bloquear esse tipo de automação.

## 4. Ajustes do host

- Clique no **PIN** para escolher manualmente um código de quatro números.
- Clique em **AUTO** para gerar outro PIN.
- Clique em **PORTA** para escolher outra porta; a mudança entra em vigor quando
  o EzDeck reinicia.
- Marque **Iniciar com Windows** se quiser que o host abra junto com o sistema.
- O botão de sol/lua troca entre os modos claro e escuro.
- Fechar a janela pelo botão de bandeja mantém o host ativo. Use **Desligar
  EzDeck** para encerrar completamente e liberar a porta.

## 5. Dicas de conexão

- Confirme que ambos os aparelhos estão na mesma rede local; rede de convidados
  costuma bloquear a descoberta automática.
- Se a descoberta falhar, use o IP e a porta exibidos no Windows.
- Não exponha a porta do EzDeck para a internet e não compartilhe o PIN.
- Ao trocar de Wi-Fi, abra novamente o EzDeck ou informe o novo endereço no APK.

## 6. Atualização e desinstalação

- Faça atualizações instalando uma nova Release por cima da anterior.
- Em **Configurações → Aplicativos → Aplicativos instalados**, escolha EzDeck
  para desinstalar.
- O desinstalador oferece a opção de apagar também botões, ícones e configurações.
  Sem marcar essa opção, os dados ficam preservados para uma futura reinstalação.

## Compatibilidade

- Host: Windows 10 ou 11.
- Android: Android 5.0 ou superior.
- Navegador: Chrome, Edge, Safari e navegadores modernos na mesma rede local.

Veja também o [mapa mental do funcionamento](MAPA_MENTAL.md).
