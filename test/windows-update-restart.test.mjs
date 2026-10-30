import test from 'node:test';
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';

test('Windows update retries the launcher only when the panel does not start', {skip:process.platform !== 'win32'}, async () => {
  const script = fileURLToPath(new URL('./windows-update-restart.test.ps1', import.meta.url));
  const {stdout} = await promisify(execFile)('powershell.exe', ['-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass', '-File', script], {timeout:15000, windowsHide:true});
  assert.match(stdout, /Restart scenarios: 3 passed/);
});
