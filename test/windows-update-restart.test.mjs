import test from 'node:test';
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';
import {mkdtemp, mkdir, writeFile, rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createServer} from 'node:net';

test('desktop follows host exit after startup and can reopen on the same port', {skip:process.platform !== 'win32'}, async t => {
  const directory=await mkdtemp(join(tmpdir(),'ezdeck-update-lifecycle-'));
  t.after(()=>rm(directory,{recursive:true,force:true}));
  await mkdir(join(directory,'updates'));
  await writeFile(join(directory,'updates','preferences.json'),JSON.stringify({automatic:false}));
  const socket=createServer();
  await new Promise(resolve=>socket.listen(0,'127.0.0.1',resolve));
  const port=socket.address().port;
  await new Promise(resolve=>socket.close(resolve));
  const script=fileURLToPath(new URL('./windows-update-lifecycle.test.ps1',import.meta.url));
  const {stdout}=await promisify(execFile)('powershell.exe',['-NoProfile','-NonInteractive','-ExecutionPolicy','Bypass','-File',script,'-TestDirectory',directory,'-TestPort',String(port)],{timeout:45000,windowsHide:true});
  assert.match(stdout,/Update lifecycle: close and reopen passed/);
});

test('Windows update retries the launcher only when the panel does not start', {skip:process.platform !== 'win32'}, async () => {
  const script = fileURLToPath(new URL('./windows-update-restart.test.ps1', import.meta.url));
  const {stdout} = await promisify(execFile)('powershell.exe', ['-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass', '-File', script], {timeout:15000, windowsHide:true});
  assert.match(stdout, /Restart scenarios: 3 passed/);
});
