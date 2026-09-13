# EzDeck

Panel local de accesos directos para controlar un ordenador Windows desde Android, una tableta o un navegador. EzDeck es una adaptación independiente para Windows y Android inspirada en [Dokke](https://github.com/felipenalves/Dokke), con los créditos MIT originales.

![Logotipo de EzDeck](public/ezdeck-logo.png)

## Qué incluye

- Host nativo para Windows con bandeja del sistema, PIN, puerto configurable, inicio con Windows y acceso directo de escritorio.
- APK Android y PWA para navegador, con descubrimiento en la red local, emparejamiento por PIN y actualizaciones por WebSocket.
- Botones para aplicaciones, sitios web y atajos de teclado; iconos personalizados, varias páginas, arrastrar y soltar y temas claro/oscuro.
- Once idiomas de interfaz. El idioma elegido en EzDeck para Windows se refleja en Android y en el navegador.

## Instalación

Descarga `EzDeck-Setup.exe` desde la versión oficial, ejecútalo y usa el acceso directo del escritorio. El compañero Android/PWA se conecta mediante PIN, WebSocket y descubrimiento en la red local.

Consulta el [manual de uso](MANUAL_DE_USO.md) y el [mapa mental](MAPA_MENTAL.md). No expongas el puerto local a Internet.

## Uso completo

1. Descarga `EzDeck-Setup.exe` desde las [Releases oficiales](https://github.com/eddesignerez/EzDeck/releases), instálalo y abre **EzDeck** desde el Escritorio. El runtime está incluido; no necesitas instalar Node.js.
2. Permite el acceso solo en **redes privadas** si lo pide el Firewall. El cierre de la ventana envía el host a la bandeja; **Apagar EzDeck** lo detiene por completo.
3. Conecta el PC y el móvil/tableta a la misma Wi‑Fi. Usa la dirección después de **Acceso** y el PIN de cuatro dígitos. El APK intenta descubrir el host; si falla, introduce la IP y el puerto manualmente.
4. También puedes abrir esa dirección en Chrome, Safari o Edge y añadirla a la pantalla de inicio; es la opción recomendada para iPhone/iPad.

## Crear y sincronizar el panel

- Arrastra aplicaciones a espacios vacíos, arrastra tarjetas para ordenarlas y usa la **X** para quitarlas.
- Usa `+ Página` para crear otra página y `− Página` para quitar la última vacía.
- El botón de teclado crea comandos como `Ctrl+C`; `+` añade archivos `.exe`, `.lnk`, `.bat` o `.cmd`.
- Haz clic en una tarjeta para cambiar su icono y pulsa **Guardar** para enviar los cambios a Android/PWA.

Los comandos se envían a la ventana Windows activa; aplicaciones abiertas como administrador pueden bloquear la automatización.

## Ajustes, seguridad y compatibilidad

- **PIN** define el código, **AUTO** crea uno nuevo y **PUERTO** cambia al reiniciar EzDeck.
- Activa **Iniciar con Windows**, usa sol/luna para el tema y selecciona el idioma solo en el host Windows; Android/PWA lo refleja.
- No compartas el PIN ni expongas el puerto a Internet. Si cambia la red, abre de nuevo EzDeck o usa la nueva dirección.
- Compatible con Windows 10/11, Android 5.0 o superior y navegadores modernos en la misma red.

Para desarrollar se requiere Windows 10/11 y Node.js 20+: `git clone https://github.com/eddesignerez/EzDeck.git`, `npm ci` y `.\windows\run-dev.ps1`.

## Documentación

El [manual de uso](MANUAL_DE_USO.md) explica instalación, emparejamiento y solución de problemas. El [mapa mental](MAPA_MENTAL.md) resume el host Windows, los clientes y la red local.

## Créditos

EzDeck es una adaptación independiente para Windows/Android inspirada en [Dokke](https://github.com/felipenalves/Dokke), de Felipe Alves, bajo licencia MIT. La licencia y créditos originales se conservan en [LICENSE](LICENSE). Para macOS, descarga Dokke original.
