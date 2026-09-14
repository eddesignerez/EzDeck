# Política de privacidade do EzDeck

_Última atualização: 14 de setembro de 2026_

## Resumo

O EzDeck foi projetado para funcionar na rede local. Ele não possui conta online, telemetria, publicidade, analytics nem serviço próprio em nuvem.

## Dados e comunicação

- O host Windows guarda localmente as configurações do painel, como aplicativos escolhidos, atalhos, ícones personalizados, idioma, porta e preferência de inicialização.
- O companion Android/PWA guarda somente as preferências necessárias para reencontrar o host escolhido.
- Para controlar o computador, o dispositivo conectado troca dados com o host EzDeck pela rede local: endereço IP, estado do painel, nomes e ícones dos itens, e comandos acionados pelo usuário.
- O PIN é usado para pareamento e autenticação na rede local. Ele não é enviado a um serviço externo pelo EzDeck.

## O que o EzDeck não faz

O EzDeck não envia automaticamente informações pessoais, inventário de aplicativos, comandos, ícones ou dados de uso para servidores do projeto ou de terceiros. A comunicação externa ocorre apenas quando a pessoa usuária abre deliberadamente um site ou aplicativo externo a partir de um item configurado no painel.

## Armazenamento e remoção

No Windows, os dados do host ficam em `%APPDATA%\EzDeck`. O instalador oferece a opção de remover esses dados ao desinstalar. No Android, os dados podem ser removidos nas configurações do sistema ao limpar os dados do aplicativo ou desinstalá-lo.

## Rede e segurança

Use o EzDeck apenas em uma rede confiável. Não exponha a porta do EzDeck à internet. Caso o Firewall do Windows solicite acesso, permita somente em redes privadas.

## Contato

Relate problemas de privacidade ou segurança pela página de issues do repositório oficial: <https://github.com/eddesignerez/EzDeck/issues>.
