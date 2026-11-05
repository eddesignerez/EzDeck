// Run on Windows with an already built release installer. The release installer
// executes unchanged inside a process-local HKCU override; real registration,
// shortcuts and user data must remain unchanged. Download transport alone is a
// fixture so a candidate can be tested before it is public/latest on GitHub.
import assert from 'node:assert/strict';
import {mkdir,cp,readFile,writeFile,open,readdir} from 'node:fs/promises';
import {join,resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawn,execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {createHash,randomUUID} from 'node:crypto';
import {createServer} from 'node:net';
import {setTimeout as delay} from 'node:timers/promises';
import {chromium} from 'playwright';
if(process.platform!=='win32')throw Error('Windows required');
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const version=JSON.parse(await readFile(join(root,'package.json'),'utf8')).version;
const candidate=resolve(process.argv[2]||join(root,'dist',`EzDeck${version.replaceAll('.','')}-Setup.exe`));
const prior=version.split('.');prior[2]=String(Number(prior[2])-1);const previousVersion=prior.join('.');
// Optionally exercise an actual previous installation instead of relabeling
// the candidate tree. The input folder is copied and never mutated.
const priorRoot=process.argv[3] ? resolve(process.argv[3]) : null;
if(priorRoot) assert.equal(JSON.parse(await readFile(join(priorRoot,'package.json'),'utf8')).version,previousVersion,'baseline version must be the preceding release');
const folder=join(root,'.test-artifacts','upgrade-e2e-'+Date.now()),app=join(folder,'EzDeck'),roaming=join(folder,'roaming'),data=join(roaming,'EzDeck');
await mkdir(app,{recursive:true});await mkdir(join(data,'updates'),{recursive:true});
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const candidateHash=hash(await readFile(candidate));
const run=promisify(execFile);
const nativeEnv={...process.env,PSModulePath:join(process.env.SystemRoot,'System32','WindowsPowerShell','v1.0','Modules')};
async function ps(code){return (await run('powershell.exe',['-NoLogo','-NoProfile','-NonInteractive','-ExecutionPolicy','Bypass','-EncodedCommand',Buffer.from(code,'utf16le').toString('base64')],{windowsHide:true,timeout:15000,env:nativeEnv})).stdout.trim()}
const registrationScript=String.raw`$r=Get-ItemProperty 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Uninstall\EzDeck';$links=@();foreach($d in @([Environment]::GetFolderPath('Desktop'),[Environment]::GetFolderPath('Programs'))){$f=Join-Path $d 'EzDeck.lnk';if(!(Test-Path -LiteralPath $f)){throw 'Existing shortcuts required for this isolated fixture'};$links+=(Get-FileHash -LiteralPath $f).Hash};@{version=$r.DisplayVersion;root=$r.InstallLocation;links=$links}|ConvertTo-Json -Compress`;
const registrationBefore=JSON.parse(await ps(registrationScript));
for(const name of ['public','platform','windows','node_modules/ws'])await cp(join(priorRoot||root,name),join(app,name),{recursive:true});
for(const name of ['server.js','config.js','config.json','auth.js','obs.js','obs-ws.js','package.json','ezdeck.ico','EzDeck.vbs'])await cp(join(priorRoot||root,name),join(app,name));
await mkdir(join(app,'runtime'));await cp(priorRoot?join(priorRoot,'runtime','node.exe'):process.execPath,join(app,'runtime','node.exe'));
if(!priorRoot){const pkg=JSON.parse(await readFile(join(app,'package.json'),'utf8'));pkg.version=previousVersion;await writeFile(join(app,'package.json'),JSON.stringify(pkg));}
const wrapper=join(folder,`EzDeck${version.replaceAll('.','')}-Setup.exe`),source=join(folder,'IsolatedInstaller.cs');
const registryTestKey='Software\\EzDeckUpgradeTest_'+randomUUID().replaceAll('-','');
await writeFile(source,`using System;using System.Reflection;using System.Runtime.InteropServices;using Microsoft.Win32;
class IsolatedInstaller {
 [DllImport("advapi32.dll",CharSet=CharSet.Unicode)]static extern int RegCreateKeyEx(IntPtr key,string sub,int reserved,string cls,int options,int access,IntPtr security,out IntPtr result,out int disposition);
 [DllImport("advapi32.dll")]static extern int RegOverridePredefKey(IntPtr key,IntPtr newKey);
 [DllImport("advapi32.dll")]static extern int RegCloseKey(IntPtr key);
 [STAThread]static void Main(){IntPtr hkcu=new IntPtr(unchecked((int)0x80000001)),isolated;int disposition;string key=${JSON.stringify(registryTestKey)};
  if(RegCreateKeyEx(hkcu,key,0,null,0,0xF003F,IntPtr.Zero,out isolated,out disposition)!=0)throw new Exception("Cannot create isolated test registration");
  try{if(RegOverridePredefKey(hkcu,isolated)!=0)throw new Exception("Cannot isolate registration");Assembly.LoadFile(${JSON.stringify(candidate)}).EntryPoint.Invoke(null,new object[0]);}
  finally{RegOverridePredefKey(hkcu,IntPtr.Zero);RegCloseKey(isolated);Registry.CurrentUser.DeleteSubKeyTree(key,false);}
 }
}`);
await run(join(process.env.WINDIR,'Microsoft.NET','Framework64','v4.0.30319','csc.exe'),['/nologo','/target:winexe',`/out:${wrapper}`,source],{windowsHide:true});
const wrapperHash=hash(await readFile(wrapper)),filename=`EzDeck${version.replaceAll('.','')}-Setup.exe`;
await writeFile(join(app,'fixture-download.mjs'),`import {readFile} from 'node:fs/promises';export async function fetcher(url){
if(url.endsWith('/releases/latest'))return new Response(null,{status:302,headers:{location:'/eddesignerez/EzDeck/releases/tag/v${version}'}});
if(url.endsWith('/SHA256SUMS.txt'))return new Response('${wrapperHash}  ${filename}');
if(url.endsWith('/${filename}')){const bytes=await readFile(${JSON.stringify(wrapper)});return new Response(bytes,{headers:{'content-length':String(bytes.length)}})}
throw Error('Unexpected fixture download');}`);
let host=await readFile(join(app,'windows','host.mjs'),'utf8');
host="import {fetcher} from '../fixture-download.mjs';\n"+host.replace("directory: join(directory, 'updates') });","directory: join(directory, 'updates'), fetcher });");
assert.ok(host.includes("directory: join(directory, 'updates'), fetcher"));await writeFile(join(app,'windows','host.mjs'),host);
async function freePort(){const s=createServer();await new Promise(r=>s.listen(0,'127.0.0.1',r));const p=s.address().port;await new Promise(r=>s.close(r));return p}
const port=await freePort(),debugPort=await freePort();
await writeFile(join(data,'settings.json'),JSON.stringify({port}));
await writeFile(join(data,'updates','preferences.json'),JSON.stringify({automatic:true}));
await writeFile(join(data,'windows-actions.json'),'[]');
const output=await open(join(folder,'desktop-process.log'),'w');
const desktop=spawn('powershell.exe',['-NoLogo','-NoProfile','-STA','-ExecutionPolicy','Bypass','-File',join(app,'windows','desktop.ps1')],{cwd:app,windowsHide:true,env:{...nativeEnv,APPDATA:roaming,EZDECK_DATA_DIR:data,WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS:`--remote-debugging-port=${debugPort} --remote-debugging-address=127.0.0.1`},stdio:['ignore',output.fd,output.fd]});
await output.close();
const protectedNames=['config.json','.j5-pin','j5-sessions.json','settings.json','windows-actions.json','updates/preferences.json'];
async function fingerprints(){return Object.fromEntries(await Promise.all(protectedNames.map(async n=>[n,hash(await readFile(join(data,n)))])))}
async function waitFor(check,milliseconds,label){const end=Date.now()+milliseconds;while(Date.now()<end){const value=await check();if(value)return value;await delay(150)}throw Error('Timed out: '+label)}
async function connectPanel(){return waitFor(async()=>{try{return await chromium.connectOverCDP(`http://127.0.0.1:${debugPort}`,{timeout:1000})}catch{return null}},30000,'WebView')}
async function panel(browser){return waitFor(()=>Promise.resolve(browser.contexts().flatMap(c=>c.pages()).find(p=>p.url().includes('/windows.html'))),10000,'panel navigation')}
let browser,page,afterBrowser,afterPage,lockHolder;
const receipt={candidateHash,previousVersion,version,folder,baseline:priorRoot||'candidate tree labeled with the previous version',transport:'fixture',installer:'unchanged release executable with process-local test registry',success:false};
try{
 browser=await connectPanel();page=await panel(browser);
 await page.waitForFunction(v=>document.querySelector('#software-version')?.textContent===v,previousVersion);
 const pin=(await readFile(join(data,'.j5-pin'),'utf8')).trim();
 const auth=await fetch(`http://127.0.0.1:${port}/api/auth`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({pin})});
 assert.equal(auth.status,200);const cookie=auth.headers.get('set-cookie')?.split(';')[0];assert.ok(cookie);
 const before=await fingerprints();
 const markerBefore=JSON.parse(await readFile(join(data,'desktop-ready.json'),'utf8'));
 // Optional real Windows sharing violation for testing the installer's retry.
 // Only the isolated copy is locked, and the holder releases it automatically.
 const lockMs=Number(process.env.EZDECK_TEST_LOCK_MS||0);
 if(lockMs){
   assert.ok(Number.isInteger(lockMs)&&lockMs>0&&lockMs<=30000,'invalid fixture lock duration');
   const lockScript=join(folder,'hold-runtime-lock.ps1');
   await writeFile(lockScript,String.raw`param([string]$Target,[int]$Milliseconds)
$f=[IO.File]::Open($Target,[IO.FileMode]::Open,[IO.FileAccess]::Read,[IO.FileShare]::Read)
try{[Console]::Out.WriteLine('locked');Start-Sleep -Milliseconds $Milliseconds}finally{$f.Dispose()}`);
   lockHolder=spawn('powershell.exe',['-NoProfile','-NonInteractive','-ExecutionPolicy','Bypass','-File',lockScript,join(app,'runtime','node.exe'),String(lockMs)],{windowsHide:true,env:nativeEnv,stdio:['ignore','pipe','pipe']});
   await new Promise((resolve,reject)=>{
     const timeout=setTimeout(()=>reject(Error('Fixture file lock was not acquired')),5000);
     lockHolder.once('error',error=>{clearTimeout(timeout);reject(error)});
     lockHolder.once('exit',code=>{if(code!==0){clearTimeout(timeout);reject(Error('Fixture file lock failed'))}});
     lockHolder.stdout.once('data',()=>{clearTimeout(timeout);resolve()});
   });
   receipt.fixtureLockMilliseconds=lockMs;
 }
 page.once('dialog',d=>d.accept());await page.getByRole('button',{name:'Atualizar agora'}).click();
 const result=await waitFor(async()=>{
   for(const name of await readdir(join(data,'updates'))){
     if(!name.startsWith('download-'))continue;
     const handoff=await readFile(join(data,'updates',name,'handoff.json'),'utf8').then(JSON.parse,()=>null);
     if(handoff?.stage==='failed')throw Error('Helper failed at '+handoff.errorCode);
     if(handoff?.stage==='installing'&&lockHolder&&lockHolder.exitCode===null)receipt.lockObservedDuringInstall=true;
   }
   const state=await readFile(join(data,'updates','last-result.json'),'utf8').then(JSON.parse,()=>null);
   if(state?.stage==='failed')throw Error('Installer failed at '+state.errorCode);
   return state?.stage==='complete'?state:null;
 },120000,'automatic update complete');
 assert.equal(result.version,version);
 if(lockHolder)assert.equal(receipt.lockObservedDuringInstall,true,'the installer must encounter the controlled lock');
 const marker=JSON.parse(await readFile(join(data,'desktop-ready.json'),'utf8'));
 assert.notEqual(marker.pid,markerBefore.pid);assert.equal(marker.version,version);assert.equal(marker.root.toLowerCase(),app.toLowerCase());
 assert.deepEqual(await fingerprints(),before,'settings and pairing files must remain byte-identical');
 const installed=JSON.parse(await readFile(join(app,'package.json'),'utf8'));assert.equal(installed.version,version);
 assert.equal((await readFile(join(app,'windows','host.mjs'),'utf8')).replaceAll('\r\n','\n'),(await readFile(join(root,'windows','host.mjs'),'utf8')).replaceAll('\r\n','\n'),'release host must match source apart from CRLF/LF and remove the fixture downloader');
 const health=await fetch(`http://127.0.0.1:${port}/health`).then(r=>r.json());assert.equal(health.service,'EzDeck');
 const paired=await fetch(`http://127.0.0.1:${port}/api/config`,{headers:{Cookie:cookie}});assert.equal(paired.status,200);
 afterBrowser=await connectPanel();afterPage=await panel(afterBrowser);
 await afterPage.waitForFunction(v=>document.querySelector('#software-version')?.textContent===v,version);
 await afterPage.screenshot({path:join(folder,'reopened-version.png')});
 assert.deepEqual(JSON.parse(await ps(registrationScript)),registrationBefore,'real installation registration and shortcuts must not change');
 Object.assign(receipt,{success:true,protectedFiles:protectedNames.length,pairedSessionAccepted:true,reopenedPid:marker.pid,stage:result.stage});
 console.log(JSON.stringify(receipt));
}catch(error){receipt.error=error.message;console.error(error.message);process.exitCode=1}
finally{
 if(lockHolder&&lockHolder.exitCode===null)lockHolder.kill();
 const active=afterPage||page;
 if(active)await active.evaluate(async()=>{const token=new URL(location.href).searchParams.get('token');await fetch('/api/windows/shutdown',{method:'POST',headers:{'X-EzDeck-Host':token}})}).catch(()=>{});
 await delay(1200);
 if(afterBrowser)await afterBrowser.close().catch(()=>{});if(browser)await browser.close().catch(()=>{});
 // Only fixture processes whose executable/command belongs to this exact root.
 await ps(`$root='${app.replaceAll("'","''")}';$fixture='${folder.replaceAll("'","''")}';Get-CimInstance Win32_Process|Where-Object{($_.Name -eq 'node.exe' -and $_.ExecutablePath -eq (Join-Path $root 'runtime\\node.exe')) -or ($_.Name -eq 'powershell.exe' -and $_.CommandLine -and $_.CommandLine.Contains($fixture)) -or ($_.Name -eq '${filename}' -and $_.ExecutablePath -and $_.ExecutablePath.StartsWith($fixture+'\\'))}|ForEach-Object{$p=Get-CimInstance Win32_Process -Filter ('ProcessId='+$_.ProcessId);if($p -and $p.CreationDate -eq $_.CreationDate){Stop-Process -Id $_.ProcessId -Force -ErrorAction Stop}};[Microsoft.Win32.Registry]::CurrentUser.DeleteSubKeyTree('${registryTestKey}', $false)`).catch(error=>{receipt.cleanupError=error.message;process.exitCode=1});
 await writeFile(join(folder,'receipt.json'),JSON.stringify(receipt,null,2));
 await writeFile(join(root,'.test-artifacts','upgrade-e2e-latest.json'),JSON.stringify(receipt,null,2));
}
