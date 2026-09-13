# EzDeck

Languages: [Português](README.md) · **English** · [Español](README.es.md) · [日本語](README.ja.md) · [Italiano](README.it.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [简体中文](README.zh-CN.md) · [Tiếng Việt](README.vi.md) · [한국어](README.ko.md) · [العربية](README.ar.md)

EzDeck is a local shortcut panel for controlling a Windows computer from an Android phone, tablet, iPhone, iPad, or modern browser on the same network. Turn an unused device into a Stream Deck-style controller: choose apps and shortcuts on Windows, then open or focus them remotely.

![EzDeck logo](public/ezdeck-logo.png)

## What it includes

- Native Windows host with tray icon, desktop shortcut, optional start-with-Windows, PIN and configurable port.
- Android APK and installable PWA with automatic local-network discovery, PIN pairing and WebSocket updates.
- App, website and keyboard-shortcut buttons, custom icons, multiple pages, drag-and-drop ordering and light/dark themes.
- Eleven interface languages. Choose the language in the Windows EzDeck; connected Android/PWA clients follow that choice.

## Install on Windows

1. Download `EzDeck-Setup.exe` from the [official Releases page](https://github.com/eddesignerez/EzDeck/releases).
2. Run the installer and open the **EzDeck** shortcut created on the Desktop.
3. If Windows Firewall asks, allow the application only on **Private networks**.
4. Keep the window open to configure the panel. Closing it sends EzDeck to the tray; use **Shut down EzDeck** to stop it completely.

The installer includes the required runtime, so end users do not need to install Node.js. Settings are stored in `%APPDATA%\EzDeck` and can be kept or deleted during uninstall.

> Until the Windows installer has a code-signing certificate, SmartScreen may show a warning. Download only from the official EzDeck Release.

## Connect Android, tablet, or browser

1. Connect the Windows computer and the device to the same Wi-Fi or local network.
2. In EzDeck for Windows, note the address after **Access** and the four-digit PIN.
3. Open the EzDeck APK. It tries to discover the host automatically.
4. If discovery does not work, enter the Windows IP address and port shown by EzDeck.
5. Enter the PIN on first connection.

You can also open the same address in Chrome, Safari, Edge, or another modern browser and choose **Add to Home Screen**. This is the recommended browser path for iPhone and iPad.

## Build the panel

- Drag an app from the library onto an empty panel slot.
- Drag existing cards to reorder them; use the **X** on a card to remove it.
- Use `+ Page` for another page and `− Page` to remove the last empty page.
- Use the keyboard button to create shortcuts such as `Ctrl+C` or `Win+Shift+S`.
- Use `+` to add a local `.exe`, `.lnk`, `.bat`, or `.cmd` file.
- Click a card to choose a custom icon when that option is available.
- Press **Save** to publish panel changes to connected devices.

Keyboard commands are sent to the active Windows window. Applications running as administrator can block this type of automation.

## Windows settings and security

- Click **PIN** to set a four-digit code, or **AUTO** to generate a new one.
- Click **PORT** to choose another port; the new port takes effect after EzDeck restarts.
- Enable **Start with Windows** to launch the host when you sign in.
- Use the sun/moon button to switch between light and dark mode.
- The language is selected only in the Windows host; Android/PWA mirrors it.
- Keep all devices on the same local network. If discovery fails, use the IP address and port displayed by the host.
- Do not expose EzDeck's port to the internet and do not share the PIN.

## Compatibility and development

- Host: Windows 10 or Windows 11.
- Android: Android 5.0 or newer.
- Browser: current Chrome, Edge, Safari, and other modern browsers on the same network.

Development requires Windows 10/11 and Node.js 20+:

```powershell
git clone https://github.com/eddesignerez/EzDeck.git
cd EzDeck
npm ci
.\windows\run-dev.ps1
```

See the [Portuguese user manual](MANUAL_DE_USO.md) and [mind map](MAPA_MENTAL.md) for the complete workflow.

## Origin and credits

EzDeck is an independent Windows/Android adaptation inspired by [Dokke](https://github.com/felipenalves/Dokke), by Felipe Alves, under the MIT license. Original license and credits are preserved in [LICENSE](LICENSE). EzDeck is not affiliated with, endorsed by, or automatically synchronized with Dokke.

For a macOS version, download the original [Dokke project](https://github.com/felipenalves/Dokke). This repository focuses on the Windows host and Android/PWA clients.
