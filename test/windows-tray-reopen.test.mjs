import test from 'node:test';
import assert from 'node:assert/strict';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {mkdtemp, mkdir, writeFile, rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createServer} from 'node:net';

test('shortcut restores the tray window twice without replacing its host or data', {skip:process.platform !== 'win32'}, async t => {
  const directory=await mkdtemp(join(tmpdir(),'ezdeck-tray-reopen-'));
  // WebView releases its profile handles asynchronously after the form closes.
  t.after(()=>rm(directory,{recursive:true,force:true,maxRetries:5,retryDelay:200}));
  await mkdir(join(directory,'updates'));
  await writeFile(join(directory,'updates','preferences.json'),JSON.stringify({automatic:false}));
  const socket=createServer();
  await new Promise(resolve=>socket.listen(0,'127.0.0.1',resolve));
  const port=socket.address().port;
  await new Promise(resolve=>socket.close(resolve));
  const script=fileURLToPath(new URL('./windows-tray-reopen.test.ps1',import.meta.url));
  const {stdout}=await promisify(execFile)('powershell.exe',[
    '-NoProfile','-NonInteractive','-ExecutionPolicy','Bypass','-File',script,
    '-TestDirectory',directory,'-TestPort',String(port),
  ],{timeout:45000,windowsHide:true,env:{...process.env,
    // PowerShell 7's inherited paths can shadow the Windows PowerShell modules.
    PSModulePath:join(process.env.SystemRoot,'System32','WindowsPowerShell','v1.0','Modules'),
  }});
  assert.match(stdout,/Tray reopen: two restores, same host, unchanged data, clean shutdown/);
});
