@echo off
setlocal
title Encerrar EzDeck

echo Encerrando somente os processos do EzDeck...
powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -Command "$count = 0; foreach ($item in @(Get-CimInstance Win32_Process -ErrorAction SilentlyContinue)) { if ($item.Name -in @('node.exe','powershell.exe','wscript.exe') -and $item.CommandLine -match '(EzDeck\\|windows\\host\.mjs)') { Stop-Process -Id $item.ProcessId -Force -ErrorAction SilentlyContinue; Write-Host ('Encerrado: ' + $item.Name + ' (' + $item.ProcessId + ')'); $count++ } }; if ($count -eq 0) { Write-Host 'Nenhum processo do EzDeck foi encontrado.' }"

echo.
echo Pronto. Agora voce pode abrir EzDeck.vbs novamente.
pause
