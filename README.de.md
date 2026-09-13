# EzDeck

Lokales Shortcut-Panel zur Steuerung eines Windows-Computers von Android, Tablet oder Browser. EzDeck ist eine unabhängige Windows/Android-Anpassung, inspiriert von [Dokke](https://github.com/felipenalves/Dokke); die ursprünglichen MIT-Hinweise bleiben erhalten.

![EzDeck-Logo](public/ezdeck-logo.png)

## Enthaltene Funktionen

- Nativer Windows-Host mit Tray-Symbol, PIN, konfigurierbarem Port, Autostart und Desktop-Verknüpfung.
- Android-APK und Browser-PWA mit LAN-Erkennung, PIN-Kopplung und WebSocket-Aktualisierungen.
- Schaltflächen für Apps, Websites und Tastenkürzel; eigene Symbole, mehrere Seiten, Drag-and-drop sowie helles und dunkles Design.
- Elf Oberflächensprachen. Die Auswahl im Windows-Host wird von Android und Browser übernommen.

## Installation

Lade `EzDeck-Setup.exe` aus dem offiziellen Release herunter, starte es und öffne die Desktop-Verknüpfung. Die Android/PWA-Begleit-App verbindet sich über PIN, WebSocket und lokale Netzwerkerkennung.

Siehe [Handbuch](MANUAL_DE_USO.md) und [Mindmap](MAPA_MENTAL.md). Den lokalen Port nicht ins Internet freigeben.

## Dokumentation und Entwicklung

Das [Handbuch](MANUAL_DE_USO.md) beschreibt Installation, Kopplung und Fehlerbehebung; die [Mindmap](MAPA_MENTAL.md) erklärt Host, Clients und lokales Netzwerk. Für die Entwicklung werden Windows 10/11 und Node.js 20+ benötigt: `git clone https://github.com/eddesignerez/EzDeck.git`, `npm ci`, dann `.\windows\run-dev.ps1`.

## Vollständige Nutzung

1. Lade `EzDeck-Setup.exe` aus den [offiziellen Releases](https://github.com/eddesignerez/EzDeck/releases), installiere es und öffne **EzDeck** auf dem Desktop. Die Laufzeit ist enthalten; Node.js wird für Benutzer nicht benötigt.
2. Erlaube die App bei der Windows-Firewall nur in **privaten Netzwerken**. Das Schließen des Fensters verschiebt den Host in die Taskleiste; **EzDeck beenden** stoppt ihn vollständig.
3. Verbinde PC und Telefon/Tablet mit demselben WLAN. Nutze Adresse nach **Zugang** und die vierstellige PIN. Das APK sucht den Host automatisch; sonst IP und Port eingeben.
4. Die Adresse kann auch in Chrome, Safari oder Edge geöffnet und zum Startbildschirm hinzugefügt werden; empfohlen für iPhone/iPad.

## Panel erstellen und synchronisieren

- Apps in freie Plätze ziehen, Karten per Drag-and-drop sortieren und mit **X** entfernen.
- Mit `+ Seite` wird eine Seite erstellt, mit `− Seite` die letzte leere Seite entfernt.
- Die Tastatur-Schaltfläche erstellt Befehle wie `Ctrl+C`; `+` fügt `.exe`, `.lnk`, `.bat` oder `.cmd` hinzu.
- Auf eine Karte klicken, um ein eigenes Symbol zu wählen, dann **Speichern** drücken und Änderungen an Android/PWA senden.

Tastaturbefehle gehen an das aktive Windows-Fenster. Als Administrator gestartete Apps können die Automatisierung blockieren.

## Einstellungen, Sicherheit und Kompatibilität

- **PIN** setzt den Code, **AUTO** erzeugt einen neuen und **PORT** wechselt nach einem Neustart.
- **Mit Windows starten** aktivieren, Sonne/Mond für das Thema nutzen und die Sprache nur im Windows-Host wählen; Android/PWA übernimmt sie.
- PIN nicht teilen und Port nicht ins Internet freigeben. Bei Netzwechsel EzDeck erneut öffnen oder die neue Adresse verwenden.
- Kompatibel mit Windows 10/11, Android 5.0 oder neuer sowie modernen Browsern im selben Netzwerk.

Entwicklung: Windows 10/11 und Node.js 20+, dann `git clone https://github.com/eddesignerez/EzDeck.git`, `npm ci`, `.\windows\run-dev.ps1`.

## Credits

EzDeck ist eine unabhängige Windows/Android-Anpassung, inspiriert von [Dokke](https://github.com/felipenalves/Dokke) von Felipe Alves, unter MIT-Lizenz. Lizenz und ursprüngliche Credits bleiben in [LICENSE](LICENSE). Für macOS bitte das originale Dokke laden.
