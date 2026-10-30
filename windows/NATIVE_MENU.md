# Menu nativo no companion

Dois dedos sobre o mesmo cartão em Apps Abertos solicitam o menu da barra de tarefas do Windows. Um toque abre o aplicativo e segurar continua reorganizando os cartões. Movimentos com dois dedos não abrem o menu. Shift+F10 oferece o mesmo acesso por teclado.

O Windows identifica o botão na barra de tarefas pelo inventário local, incluindo a identidade do aplicativo quando disponível. Os rótulos acessíveis podem incluir sufixos localizados como “- 1 janela em execução” e “fixado”; botões da bandeja são excluídos. O host abre o menu real e envia somente a imagem delimitada desse menu. Tocar na imagem executa a opção correspondente no Windows. Não há lista de ações recriada pelo companion. Aplicativos sem botão na barra de tarefas, agrupamentos ambíguos ou menus ocultos retornam indisponibilidade, sem clicar em outro aplicativo.

As operações exigem o pareamento existente, verificação de origem, sessão opaca vinculada ao dispositivo, coordenadas relativas limitadas e expiração de 60 segundos. Nenhum caminho, script, HWND ou coordenada do desktop é aceito do cliente. A fila possui limite de oito solicitações pendentes. Não há captura do desktop inteiro.

O instalador inicia o launcher que cria o atalho com ICO próprio em Programs, Desktop e na pasta do app. A desinstalação remove o atalho de Programs. Apps Abertos usa também o ICO embarcado para EzDeck quando falta uma fonte de ícone no inventário.

## Validação

Os testes automatizados cobrem gesto e ponte HTTP com menu simulado, ausência de ativação/arraste acidental, origem inválida, isolamento entre dispositivos, expiração, coordenadas, logo própria, atalhos e compilação do helper no Windows.

A captura e interação com o menu real precisam de validação interativa no Windows e no Xiaomi. Confirmar posição/tamanho, texto e opções idênticas ao clique direito na barra de tarefas; testar uma opção não destrutiva, fechamento, menu indisponível e aplicativo agrupado. Não publicar como funcionalmente validado antes dessa etapa.

Na versão 0.2.15, a identificação do botão considera os rótulos observados no Windows 11 e evita o ícone da bandeja. Um teste direto do helper a partir do terminal identificou o botão do ChatGPT, mas não confirmou a captura do menu no desktop; a causa exata desta falha ainda não foi isolada. A compilação e o teste simulado não comprovam funcionamento no Xiaomi. Testar a combinação Windows instalado + APK no aparelho antes de declarar o gesto corrigido.
