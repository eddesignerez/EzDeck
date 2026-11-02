import { readFile, writeFile } from 'node:fs/promises';
import { setTimeout as delay } from 'node:timers/promises';
import { spawn } from 'node:child_process';
import { join } from 'node:path';

export async function launchUpdateHelper(root, args) {
  const system32 = join(process.env.SystemRoot || 'C:\\Windows', 'System32');
  const executable = join(system32, 'wscript.exe');
  const child = spawn(executable, ['//B', '//Nologo', join(root, 'windows', 'launch-update.vbs'), ...args], {
    detached: true, windowsHide: true, stdio: 'ignore',
    // PowerShell 7 module paths inherited from a terminal can shadow the
    // Windows PowerShell 5.1 utility module and make Get-FileHash disappear.
    // These bundled helpers need only the native Windows modules.
    env: {...process.env, PSModulePath:join(system32,'WindowsPowerShell','v1.0','Modules')},
  });
  await new Promise((resolve, reject) => { child.once('spawn', resolve); child.once('error', reject); });
  return child;
}

// Process creation is not proof that PowerShell executed the helper. Keep the
// old host alive until validation and a receipt for this unique operation.
export async function confirmUpdateHandoff({child, statusFile, commitFile, operationId, version, timeoutMs = 15000}) {
  let launchError = null;
  const onError = error => { launchError = error; };
  const onExit = code => { if (code !== 0) launchError = Error('O inicializador da atualização encerrou com erro'); };
  child?.on?.('error', onError); child?.on?.('exit', onExit);
  try {
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
      if (launchError) throw launchError;
      let receipt;
      try { receipt = JSON.parse((await readFile(statusFile, 'utf8')).replace(/^\uFEFF/, '')); }
      catch (error) { if (error.code !== 'ENOENT' && !(error instanceof SyntaxError)) throw error; }
      if (receipt?.operationId === operationId && receipt.version === version) {
        if (receipt.stage === 'failed') throw Error('O auxiliar recusou a atualização: ' + (receipt.errorCode || 'validation'));
        if (receipt.stage === 'ready' && Number.isInteger(receipt.pid) && receipt.pid > 0) {
          await writeFile(commitFile, JSON.stringify({operationId, version}), {flag:'wx',mode:0o600});
          return;
        }
      }
      await delay(50);
    }
    throw Error('O auxiliar de atualização não confirmou a inicialização');
  } finally {
    child?.removeListener?.('error', onError); child?.removeListener?.('exit', onExit);
    child?.on?.('error', () => {}); child?.unref?.();
  }
}
