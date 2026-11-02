# Windows update correction 0.2.18

## Failure and correction

The previous updater treated Node's child-process `spawn` event as proof that
the installation helper was running. On the affected Windows machine, detached
Windows PowerShell exited with code zero before executing the script. The host
then shut down without an installer taking over.

The helper now starts through the Windows GUI script host with the native
Windows PowerShell module path. The host waits for a validated, operation-scoped
ready receipt and writes a commit before it shuts down. Missing, stale or failed
receipts keep the host alive. Installer hashes and process identities remain
mandatory.

The helper releases process handles after waiting for exit, before replacing the
runtime executable. The real upgrade test reproduced a sharing violation before
this correction. The installer now waits for a fresh desktop navigation marker,
the expected installed version, and a responding local host before returning
success. Quiet-mode errors are logged and returned instead of blocking on a
modal dialog. The handoff records its stages and final outcome locally.

## Reproduction and validation

Run the normal suite with `npm test`. On Windows, build the installer and run:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File windows/package-installer.ps1
node scripts/verify-windows-upgrade.mjs dist/EzDeck0218-Setup.exe
```

The full-cycle harness uses a separate application directory, data directory,
port, and WebView profile. Its wrapper redirects only its own HKCU installation
registration to a unique test key, then executes the unchanged installer. The
download source is a fixture so the candidate can be tested before publication.
Existing real EzDeck registration and shortcuts must remain unchanged.

Acceptance requires the real panel to request the upgrade, the old processes to
exit, the release payload to replace the fixture, a new panel to show 0.2.18,
the host to respond, and six configuration/pairing files to retain their hashes.
The existing session must still be accepted. The receipt explicitly identifies
fixture transport; this is not proof of a GitHub download.

## Existing installations

An older updater that never starts its helper cannot repair itself merely by
discovering a newer release. Run the corrected installer once over that existing
installation, without uninstalling or deleting the data directory. Thereafter
the corrected automatic-update flow is available. Keep this one-time recovery
distinct from a verified automatic upgrade using the published GitHub assets.
