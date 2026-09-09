import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,rm,readFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createStartup} from '../platform/windows/startup.js';
import {createCommandWorker} from '../platform/windows/command-worker.js';

test('startup checkbox creates a real Windows shortcut with icon and removes only its own link',{skip:process.platform!=='win32'},async t=>{
 const directory=await mkdtemp(join(tmpdir(),'ezdeck-startup-'));
 const worker=createCommandWorker();
 t.after(async()=>{worker.close();await rm(directory,{recursive:true,force:true})});
 const root=join(import.meta.dirname,'..');
 const startup=createStartup({root,appData:directory,run:worker.run});
 assert.equal(await startup.enabled(),false);
 assert.equal(await startup.set(true),true);
 const link=join(directory,'Microsoft','Windows','Start Menu','Programs','Startup','EzDeck.lnk');
 const result=await worker.run('$s=New-Object -ComObject WScript.Shell;$l=$s.CreateShortcut($args[0]);@{target=$l.TargetPath;arguments=$l.Arguments;icon=$l.IconLocation;directory=$l.WorkingDirectory}|ConvertTo-Json -Compress',[link]);
 const saved=JSON.parse(result.stdout);
 assert.match(saved.target,/System32\\wscript.exe$/i);
 assert.equal(saved.arguments,'"'+join(root,'EzDeck.vbs')+'"');
 assert.equal(saved.directory,root);
 assert.match(saved.icon,/ezdeck.ico,0$/i);
 assert.equal(await startup.set(false),false);
 assert.equal(await startup.set(false),false);
});

test('native panel never blocks WebView initialization or navigates before readiness',async()=>{
 const code=await readFile(new URL('../windows/desktop.ps1',import.meta.url),'utf8');
 assert.doesNotMatch(code,/\.GetAwaiter\(\)\.GetResult\(\)/);
 assert.match(code,/CreationProperties=\$properties/);
 assert.match(code,/\$script:navigationUrl/);
 assert.doesNotMatch(code,/\.GetNewClosure\(\)/);
 assert.match(code,/\$lifecycle\.restartPort=\$requestedPort/);
});
