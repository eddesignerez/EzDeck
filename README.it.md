# EzDeck

Pannello locale di scorciatoie per controllare un computer Windows da Android, tablet o browser. EzDeck è un adattamento indipendente per Windows e Android ispirato a [Dokke](https://github.com/felipenalves/Dokke), con crediti MIT originali conservati.

![Logo EzDeck](public/ezdeck-logo.png)

## Cosa include

- Host Windows nativo con icona nell’area di notifica, PIN, porta configurabile, avvio con Windows e collegamento sul desktop.
- APK Android e PWA per browser con rilevamento nella rete locale, associazione tramite PIN e aggiornamenti WebSocket.
- Pulsanti per app, siti e scorciatoie da tastiera; icone personalizzate, più pagine, trascinamento e temi chiaro/scuro.
- Undici lingue dell’interfaccia. La lingua scelta nell’host Windows viene usata anche da Android e browser.

## Installazione

Scarica `EzDeck-Setup.exe` dalla release ufficiale, eseguilo e usa il collegamento sul desktop. Il companion Android/PWA si collega tramite PIN, WebSocket e rilevamento della rete locale.

Consulta il [manuale](MANUAL_DE_USO.md) e la [mappa mentale](MAPA_MENTAL.md). Non esporre la porta locale a Internet.

## Documentazione e sviluppo

Il [manuale](MANUAL_DE_USO.md) descrive installazione, associazione e risoluzione dei problemi; la [mappa mentale](MAPA_MENTAL.md) riassume host, client e rete locale. Per sviluppare servono Windows 10/11 e Node.js 20+: `git clone https://github.com/eddesignerez/EzDeck.git`, `npm ci`, poi `.\windows\run-dev.ps1`.

## Uso completo

1. Scarica `EzDeck-Setup.exe` dalle [Release ufficiali](https://github.com/eddesignerez/EzDeck/releases), installalo e apri **EzDeck** dal Desktop. Il runtime è incluso, quindi Node.js non serve all’utente.
2. Se Windows Firewall lo chiede, consenti l’app solo su **reti private**. Chiudere la finestra manda l’host nell’area di notifica; **Spegni EzDeck** lo arresta completamente.
3. Collega PC e telefono/tablet alla stessa Wi‑Fi. Usa l’indirizzo dopo **Accesso** e il PIN di quattro cifre. L’APK prova a trovare l’host; se fallisce inserisci IP e porta manualmente.
4. Puoi anche aprire l’indirizzo in Chrome, Safari o Edge e aggiungerlo alla schermata Home; è consigliato per iPhone/iPad.

## Creare e sincronizzare il pannello

- Trascina le app negli spazi vuoti, riordina le schede con il drag e usa la **X** per rimuoverle.
- Usa `+ Pagina` per aggiungere una pagina e `− Pagina` per rimuovere l’ultima pagina vuota.
- Il pulsante tastiera crea comandi come `Ctrl+C`; `+` aggiunge `.exe`, `.lnk`, `.bat` o `.cmd`.
- Fai clic su una scheda per l’icona personalizzata e premi **Salva** per inviare le modifiche ad Android/PWA.

I comandi vanno alla finestra Windows attiva; app eseguite come amministratore possono bloccare l’automazione.

## Impostazioni, sicurezza e compatibilità

- **PIN** imposta il codice, **AUTO** ne crea uno e **PORTA** cambia al riavvio.
- Attiva **Avvia con Windows**, usa sole/luna per il tema e scegli la lingua solo nell’host Windows; Android/PWA la rispecchia.
- Non condividere il PIN né esporre la porta a Internet. Se cambia la rete, riapri EzDeck o usa il nuovo indirizzo.
- Compatibile con Windows 10/11, Android 5.0 o successivo e browser moderni sulla stessa rete.

Per sviluppare servono Windows 10/11 e Node.js 20+: `git clone https://github.com/eddesignerez/EzDeck.git`, `npm ci`, `.\windows\run-dev.ps1`.

## Crediti

EzDeck è un adattamento indipendente Windows/Android ispirato a [Dokke](https://github.com/felipenalves/Dokke) di Felipe Alves, sotto licenza MIT. Licenza e crediti originali sono in [LICENSE](LICENSE). Per macOS, scarica Dokke originale.
