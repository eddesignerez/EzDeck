# EzDeck

Local shortcut panel for controlling a Windows computer from Android, a tablet, or a browser. EzDeck is an independent Windows/Android adaptation inspired by [Dokke](https://github.com/felipenalves/Dokke); original MIT credits are preserved.

## Install

Download `EzDeck-Setup.exe` from the official EzDeck release, run it, and open the desktop shortcut. The Android/PWA companion connects through PIN, WebSocket, and local-network discovery.

## Develop

Requires Windows 10/11 and Node.js 20+:

```powershell
git clone https://github.com/eddesignerez/EzDeck.git
cd EzDeck
npm ci
.\windows\run-dev.ps1
```

See the [user manual](MANUAL_DE_USO.md) and [mind map](MAPA_MENTAL.md). Do not expose the local port to the internet.
