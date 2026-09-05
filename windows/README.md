# Dokke para Windows — preview de desenvolvimento

Esta pasta permite usar o Windows como host e o Android como painel estilo
Stream Deck. O servidor, a PWA e o APK usam o mesmo protocolo do Dokke; o
adaptador Windows encontra atalhos do Menu Iniciar e só abre caminhos que ele
mesmo inventariou.

Ainda não há instalador `.exe` nem shell desktop Electron. Para testar pelo
código-fonte, use Windows 10/11 e Node.js 20 ou superior:

```powershell
npm ci
.\windows\run-dev.ps1
```

Se o PowerShell impedir scripts locais, rode apenas nesta sessão:

```powershell
Set-ExecutionPolicy -Scope Process Bypass
.\windows\run-dev.ps1
```

O console mostra a URL da rede local e o PIN. No Android, instale o APK já
existente ou abra a URL no Chrome e escolha **Adicionar à tela inicial**. O
APK procura o host automaticamente pela rede local; a URL é útil no primeiro
pareamento ou se o Wi-Fi bloquear broadcast UDP.

O Windows Firewall pode perguntar se o Node/Dokke pode usar redes privadas:
permita apenas em **redes privadas** para que o celular consiga conectar. Não
exponha a porta 3000 na internet.

## O que funciona neste preview

- inventário dos atalhos `.lnk` e `.appref-ms` do Menu Iniciar do usuário e do sistema;
- adicionar/remover favoritos pelo companion Android/PWA;
- abrir um item do inventário e tentar trazer a janela em execução para frente;
- ícone real por aplicativo quando o Windows o disponibiliza, com fallback visual da PWA;
- PIN, WebSocket e descoberta UDP existentes.

O próximo passo para uma versão distribuível é criar o shell Electron, bandeja
e instalador que embute o runtime Node — sem exigir Node.js do usuário final.
