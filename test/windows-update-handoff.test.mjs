import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,writeFile,readFile,rm,mkdir,copyFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {spawn} from 'node:child_process';
import {once,EventEmitter} from 'node:events';
import {setTimeout as delay} from 'node:timers/promises';
import {confirmUpdateHandoff} from '../platform/windows/update-handoff.js';

async function fixture(t){
 const folder=await mkdtemp(join(tmpdir(),'ezdeck-handoff-'));
 t.after(()=>rm(folder,{recursive:true,force:true}));
 return {folder,statusFile:join(folder,'handoff.json'),commitFile:join(folder,'commit.json'),operationId:'test-operation',version:'0.2.18',timeoutMs:180};
}
test('a spawned helper exiting successfully without a ready receipt cannot authorize shutdown',async t=>{
 const f=await fixture(t),child=new EventEmitter();
 const result=confirmUpdateHandoff({...f,child});child.emit('exit',0);
 await assert.rejects(result,/não confirmou/);
 await assert.rejects(readFile(f.commitFile),{code:'ENOENT'});
});
test('stale receipts and a helper validation error never commit an update',async t=>{
 const f=await fixture(t);
 await writeFile(f.statusFile,JSON.stringify({operationId:'old',version:f.version,pid:123,stage:'ready'}));
 await assert.rejects(confirmUpdateHandoff(f),/não confirmou/);
 await writeFile(f.statusFile,JSON.stringify({operationId:f.operationId,version:f.version,pid:123,stage:'failed',errorCode:'validation'}));
 await assert.rejects(confirmUpdateHandoff(f),/recusou/);
 await assert.rejects(readFile(f.commitFile),{code:'ENOENT'});
});
test('only the matching validated helper receives the host commit',async t=>{
 const f=await fixture(t);
 await writeFile(f.statusFile,JSON.stringify({operationId:f.operationId,version:f.version,pid:123,stage:'ready'}));
 await confirmUpdateHandoff(f);
 assert.deepEqual(JSON.parse(await readFile(f.commitFile,'utf8')),{operationId:f.operationId,version:f.version});
});
test('native update launcher executes PowerShell and survives its Node parent exiting',{skip:process.platform!=='win32',timeout:15000},async t=>{
 const f=await fixture(t),root=join(f.folder,'App with spaces & apostrophe'),marker=join(f.folder,'finished.txt');
 await mkdir(join(root,'windows'),{recursive:true});
 await copyFile(new URL('../windows/launch-update.vbs',import.meta.url),join(root,'windows','launch-update.vbs'));
 const script=join(root,'helper.ps1');
 await writeFile(script,`param([string]$Marker)\n$ErrorActionPreference='Stop'\nStart-Sleep -Milliseconds 900\n$null=Get-FileHash -LiteralPath $PSCommandPath -Algorithm SHA256\n$null=Get-CimInstance Win32_Process -Filter "ProcessId=$PID"\n[IO.File]::WriteAllText($Marker,'executed')\n`);
 const moduleUrl=new URL('../platform/windows/update-handoff.js',import.meta.url).href;
 const parent=spawn(process.execPath,['--input-type=module','-e',`import {launchUpdateHelper} from ${JSON.stringify(moduleUrl)};const p=await launchUpdateHelper(${JSON.stringify(root)},['-NoLogo','-NoProfile','-NonInteractive','-ExecutionPolicy','Bypass','-File',${JSON.stringify(script)},'-Marker',${JSON.stringify(marker)}]);p.unref();process.exit(0);`],{stdio:'ignore',windowsHide:true});
 const [code]=await once(parent,'exit');assert.equal(code,0);
 const end=Date.now()+8000;let result;
 while(Date.now()<end){result=await readFile(marker,'utf8').catch(()=>null);if(result)break;await delay(100)}
 assert.equal(result,'executed','PowerShell must run even after the Node parent exits');
});
