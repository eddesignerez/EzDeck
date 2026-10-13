# Menu nativo no companion

Dois dedos sobre o mesmo cartão em Apps Abertos solicitam o menu da barra de tarefas do Windows. Um toque abre o aplicativo e segurar continua reorganizando os cartões. Movimentos com dois dedos não abrem o menu. Shift+F10 oferece o mesmo acesso por teclado.

O Windows identifica o botão na barra de tarefas pelo inventário local, abre o menu real e envia somente a imagem delimitada desse menu. Tocar na imagem executa a opção correspondente no Windows. Não há lista de ações recriada pelo companion. Menus de aplicativos sem um botão identificável, agrupamentos ambíguos ou menus ocultos retornam indisponibilidade, sem clicar em outro aplicativo.

As operações exigem o pareamento existente, verificação de origem, sessão opaca vinculada ao dispositivo, coordenadas relativas limitadas e expiração de 60 segundos. Nenhum caminho, script, HWND ou coordenada do desktop é aceito do cliente. A fila possui limite de oito solicitações pendentes. Não há captura do desktop inteiro.

O instalador inicia o launcher que cria o atalho com ICO próprio em Programs, Desktop e na pasta do app. A desinstalação remove o atalho de Programs. Apps Abertos usa também o ICO embarcado para EzDeck quando falta uma fonte de ícone no inventário.

## Validação

Os testes automatizados cobrem gesto e ponte HTTP com menu simulado, ausência de ativação/arraste acidental, origem inválida, isolamento entre dispositivos, expiração, coordenadas, logo própria, atalhos e compilação do helper no Windows.

A captura e interação com o menu real precisam de validação interativa no Windows e no Xiaomi. Confirmar posição/tamanho, texto e opções idênticas ao clique direito na barra de tarefas; testar uma opção não destrutiva, fechamento, menu indisponível e aplicativo agrupado. Não publicar como funcionalmente validado antes dessa etapa.

Empacotamento planejado como versão de teste 0.2.14. O usuário autorizou envio ao GitHub, sem instalar no Windows ou Android. A validação interativa continua pendente; não promover a versão a estável nem substituir a versão usada pela atualização automática antes dessa validação. A release estável 0.2.13 e os aplicativos instalados permanecem preservados.
