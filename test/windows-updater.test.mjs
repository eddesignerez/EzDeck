import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdtemp, mkdir, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createWindowsUpdater, newerVersion, stableVersion, windowsInstallerName } from '../platform/windows/updater.js';
import { chromium } from 'playwright';
import { startServer } from '../server.js';
import { createAutomaticWindowsUpdater } from '../platform/windows/automatic-updater.js';
import { writeFile } from 'node:fs/promises';

async function fixture(t, overrides = {}) {
  const directory = await mkdtemp(join(tmpdir(), 'ezdeck-update-test-'));
  t.after(() => rm(directory, {recursive:true,force:true}));
  const bytes = Buffer.alloc(2048, 42); bytes.write('MZ');
  const hash = createHash('sha256').update(bytes).digest('hex');
  const requests = [], launches = [];
  const fetcher = async url => {
    requests.push(url);
    if (url.endsWith('/releases/latest')) return new Response(null, {status:302,headers:{location:'https://github.com/eddesignerez/EzDeck/releases/tag/v0.2.13'}});
    if (url.endsWith('/SHA256SUMS.txt')) return new Response(`${hash}  EzDeck0213-Setup.exe\n${hash}  EzDeck-Setup.exe\n`);
    if (url.endsWith('/EzDeck0213-Setup.exe')) return new Response(bytes);
    throw Error('Unexpected URL');
  };
  const updater = createWindowsUpdater({current:'0.2.12', root:directory, directory, fetcher, launch:async args => {launches.push(args)}, ...overrides});
  return {updater, requests, launches, bytes, hash, directory};
}

test('Windows updater compares stable versions numerically and rejects injected tags', () => {
  assert.equal(stableVersion('v0.2.13'), '0.2.13');
  for (const bad of ['v1.2.3/evil', '1.2.3-beta', '1.2.3;cmd', 'https://example.com', null]) assert.equal(stableVersion(bad), null);
  assert.equal(newerVersion('0.2.13','0.2.12'), true);
  assert.equal(newerVersion('0.10.0','0.9.9'), true);
  assert.equal(newerVersion('0.2.12','0.2.12'), false);
  assert.equal(newerVersion('0.2.11','0.2.12'), false);
  assert.equal(windowsInstallerName('0.2.15'), 'EzDeck0215-Setup.exe');
});

test('startup check does not download or launch an installer and shares concurrent checks', async t => {
  const f = await fixture(t);
  await Promise.all([f.updater.check(),f.updater.check()]);
  assert.equal(f.requests.length,1);
  assert.equal(f.updater.snapshot().latest.version,'0.2.13');
  assert.equal(f.updater.snapshot().status,'available');
  assert.equal(f.launches.length,0);
});

test('consented download verifies SHA256 before invoking the installed update helper', async t => {
  const f = await fixture(t);
  assert.deepEqual(await f.updater.install(),{version:'0.2.13'});
  assert.equal(f.launches.length,0);
  await f.updater.apply();
  assert.equal(f.launches.length,1);
  const args = f.launches[0];
  assert.equal(args[args.indexOf('-ExpectedHash')+1],f.hash);
  const installer = args[args.indexOf('-Installer')+1];
  assert.deepEqual(await readFile(installer),f.bytes);
  assert.equal(f.updater.snapshot().status,'installing');
  assert.ok(f.requests.every(url => url.startsWith('https://github.com/eddesignerez/EzDeck/releases/')));
});

test('concurrent install requests cannot prepare or launch two installers', async t => {
  const f = await fixture(t);
  const results = await Promise.allSettled([f.updater.install(), f.updater.install()]);
  assert.equal(results.filter(x => x.status === 'fulfilled').length,1);
  assert.equal(f.requests.filter(url => url.endsWith('/EzDeck0213-Setup.exe')).length,1);
});

test('corrupt download never launches and permits a retry', async t => {
  let downloads=0;
  const f = await fixture(t, {fetcher:async url => {
    if(url.endsWith('/latest')) return new Response(null,{status:302,headers:{location:'/eddesignerez/EzDeck/releases/tag/v0.2.13'}});
    if(url.endsWith('SHA256SUMS.txt')) return new Response(`${'0'.repeat(64)}  EzDeck0213-Setup.exe`);
    downloads++; return new Response(Buffer.alloc(2048));
  }});
  await assert.rejects(f.updater.install(),/Nenhum instalador/);
  await assert.rejects(f.updater.apply(),/Não foi possível iniciar/);
  await assert.rejects(f.updater.install(),/Nenhum instalador/);
  assert.equal(downloads,2); assert.equal(f.launches.length,0);
});

test('redirect to an untrusted host is rejected before contacting that host', async t => {
  const seen=[];
  const f=await fixture(t,{fetcher:async url=>{
    seen.push(url);
    return new Response(null,{status:302,headers:{location:url.endsWith('/latest')?'/eddesignerez/EzDeck/releases/tag/v0.2.13':'https://example.org/installer.exe'}});
  }});
  await assert.rejects(f.updater.install());
  assert.equal(seen.length,2); assert.equal(f.launches.length,0);
});

test('failed helper launch keeps the app running and allows a new preparation', async t => {
  const f=await fixture(t,{launch:async()=>{throw Error('not available')}});
  await f.updater.install(); await assert.rejects(f.updater.apply());
  assert.equal(f.updater.snapshot().status,'error');
  await f.updater.install(); assert.equal(f.updater.snapshot().status,'ready');
});

test('offline startup and another repository release do not authorize an installer', async t => {
  for (const fetcher of [async()=>{throw Error('offline')},async()=>new Response(null,{status:302,headers:{location:'https://github.com/other/app/releases/tag/v9.0.0'}})]) {
    const f=await fixture(t,{fetcher});
    assert.equal((await f.updater.check()).status,'error');
    await assert.rejects(f.updater.install()); assert.equal(f.launches.length,0);
  }
});

test('Windows update controls require desktop secret and same origin before shutdown', async t => {
  const f=await fixture(t);
  const token='update-test-only-abcdefghijklmnopqrstuvwxyz'; let installs=0,applies=0,stops=0;
  const server=await startServer({port:0,dataDir:f.directory,config:{pinned:[]},obs:null,windowsHost:{token,updater:{snapshot:()=>({status:'available'}),check:async()=>({status:'available'}),install:async()=>{installs++;return {version:'0.2.13'}},apply:async()=>{applies++}},shutdown:()=>{stops++}}});
  t.after(()=>server.close()); const base=`http://127.0.0.1:${server.port}`;
  assert.equal((await fetch(`${base}/api/windows/update/install`,{method:'POST'})).status,403);
  assert.equal((await fetch(`${base}/api/windows/update/install`,{method:'POST',headers:{'X-EzDeck-Host':token,Origin:'https://evil.example'}})).status,403);
  assert.equal(installs,0);
  assert.equal((await fetch(`${base}/api/windows/update`,{headers:{'X-EzDeck-Host':token}})).status,200);
  assert.equal(installs,0);
  assert.equal((await fetch(`${base}/api/windows/update/install`,{method:'POST',headers:{'X-EzDeck-Host':token,Origin:base}})).status,200);
  await new Promise(resolve=>setImmediate(resolve));
  assert.equal(installs,1);assert.equal(applies,1);assert.equal(stops,1);
});

test('Windows UI asks permission and cancel never submits an installation', async t => {
  const browser=await chromium.launch({headless:true,channel:process.platform==='win32'?'msedge':undefined});t.after(()=>browser.close());
  const page=await browser.newPage(); const script=await readFile(new URL('../public/windows-updates.js',import.meta.url),'utf8');
  let installs=0;
  await page.route('http://ezdeck.test/**',async route=>{
    if(route.request().url().includes('/api/windows/update')) {
      if(route.request().url().endsWith('/install')) installs++;
      return route.fulfill({contentType:'application/json',body:JSON.stringify({automatic:true,status:'available',latest:{version:'0.2.13',available:true}})});
    }
    return route.fulfill({contentType:'text/html',body:'<div id="windows-preferences"></div>'});
  });
  await page.goto('http://ezdeck.test/?token=test'); await page.addScriptTag({content:script});
  await page.getByRole('button',{name:'Atualizar agora'}).waitFor();
  page.once('dialog',dialog=>dialog.dismiss());
  await page.getByRole('button',{name:'Atualizar agora'}).click(); assert.equal(installs,0);
  page.once('dialog',dialog=>dialog.accept());
  await page.getByRole('button',{name:'Atualizar agora'}).click();
  await page.getByText('Instalando a atualização. O EzDeck será reaberto.').waitFor(); assert.equal(installs,1);
});

test('unchecked automatic preference persists across host restarts and makes no GitHub request', async t => {
  const f=await fixture(t);let requests=0;
  const options={current:'0.2.12',root:f.directory,directory:f.directory,fetcher:async()=>{requests++;throw Error('offline')}};
  const first=await createAutomaticWindowsUpdater(options);
  assert.equal(first.snapshot().automatic,true);
  await first.setAutomatic(false);
  const restarted=await createAutomaticWindowsUpdater(options);
  assert.equal((await restarted.check()).status,'disabled');
  assert.equal(restarted.snapshot().automatic,false);
  await assert.rejects(restarted.install(),/desativada/); assert.equal(requests,0);
  await assert.rejects(restarted.setAutomatic('false'),/inválida/);
});

test('checking the preference starts a lookup and disabling hides its result', async t => {
  const f=await fixture(t); let resolveLookup,requests=0;
  await writeFile(join(f.directory,'preferences.json'),JSON.stringify({automatic:false}));
  const updater=await createAutomaticWindowsUpdater({current:'0.2.12',root:f.directory,directory:f.directory,
    fetcher:()=>{requests++;return new Promise(resolve=>{resolveLookup=resolve})}});
  const enable=updater.setAutomatic(true);
  while(!resolveLookup) await new Promise(resolve=>setImmediate(resolve));
  resolveLookup(new Response(null,{status:302,headers:{location:'/eddesignerez/EzDeck/releases/tag/v0.2.13'}}));
  assert.equal((await enable).latest.available,true);assert.equal(requests,1);
  await updater.setAutomatic(false); await updater.check();
  assert.equal(updater.snapshot().latest,null);assert.equal(requests,1);
});

test('real Windows panel places both checkboxes on the same row and restores the update preference', async t => {
  const f=await fixture(t);let automatic=true,manualRequests=0,updateStatus='current';
  const token='layout-update-test-abcdefghijklmnopqrstuvwxyz';
  const platform={appTools:{listInstalledApps:async()=>[],listAppProcesses:async()=>[]},actions:{activateApp:async()=>{}},iconService:{getIconPng:async()=>null}};
  const snapshot=()=>({current:'0.2.12',automatic,status:automatic?updateStatus:'disabled',latest:updateStatus==='available'?{version:'0.2.13',available:true}:null});
  const server=await startServer({port:0,dataDir:f.directory,config:{pinned:[]},obs:null,platform,windowsHost:{token,
    updater:{snapshot,setAutomatic:async value=>{automatic=value;return snapshot()}},startup:{enabled:async()=>false},actions:{list:async()=>[]}}});
  t.after(()=>server.close());const browser=await chromium.launch({headless:true,channel:process.platform==='win32'?'msedge':undefined});t.after(()=>browser.close());
  const page=await browser.newPage({viewport:{width:1326,height:862}});
  page.on('request',req=>{if(req.url().endsWith('/update/check'))manualRequests++});
  const base=`http://127.0.0.1:${server.port}`;
  await page.goto(`${base}/windows.html?token=${token}`);
  const checkbox=page.getByRole('checkbox',{name:'Atualização Automatica',exact:true});
  await page.waitForFunction(()=>document.querySelector('#automatic-updates')?.disabled===false);
  assert.equal(await checkbox.isChecked(),true);
  assert.equal(await page.getByRole('button',{name:'Buscar atualização',exact:true}).count(),0);
  const a=await page.locator('#start-with-windows').boundingBox(),b=await checkbox.boundingBox();
  assert.ok(Math.abs(a.y-b.y)<2,'the two checkboxes must align on the same row');
  assert.ok(b.x>a.x,'automatic updates belongs beside startup');
  await page.waitForFunction(()=>document.querySelector('#software-version').textContent);
  const version=await page.locator('#software-version').boundingBox();
  assert.ok(Math.abs((version.y+version.height/2)-(a.y+a.height/2))<2,'version belongs on the checkbox row');
  const trash=await page.locator('#trash').boundingBox();
  assert.ok(a.y-(trash.y+trash.height)<25,'footer must not leave an oversized gap below the trash area');
  assert.equal(await page.getByText('EzDeck atualizado',{exact:true}).count(),0);
  assert.equal(await page.locator('#software-version').getAttribute('data-update-state'),'current');
  assert.equal(await page.locator('#software-version').evaluate(el=>getComputedStyle(el).color),'rgb(19, 122, 54)');
  await mkdir(join(import.meta.dirname,'../.test-artifacts'),{recursive:true});
  await page.screenshot({path:join(import.meta.dirname,'../.test-artifacts/windows-update-checkbox.png')});
  await page.locator('#theme-toggle').click();
  assert.equal(await page.locator('#software-version').evaluate(el=>getComputedStyle(el).color),'rgb(102, 220, 144)');
  await page.screenshot({path:join(import.meta.dirname,'../.test-artifacts/windows-update-footer-current.png')});
  updateStatus='available';await page.reload();
  await page.waitForFunction(()=>document.querySelector('#software-version')?.dataset.updateState==='available');
  assert.equal(await page.locator('#software-version').evaluate(el=>getComputedStyle(el).color),'rgb(255, 211, 106)');
  assert.equal(await page.locator('#software-version').textContent(),'0.2.12','show installed version, not latest version');
  await page.screenshot({path:join(import.meta.dirname,'../.test-artifacts/windows-update-footer-available.png')});
  await checkbox.uncheck();await page.waitForFunction(()=>!document.querySelector('#automatic-updates').disabled);
  await page.reload();await page.waitForFunction(()=>!document.querySelector('#automatic-updates').disabled);
  assert.equal(await checkbox.isChecked(),false);assert.equal(manualRequests,0);
  assert.equal(await page.locator('#software-version').getAttribute('data-update-state'),'unknown');
});

test('invalid preference fails closed without network access', async t => {
  const f=await fixture(t);await writeFile(join(f.directory,'preferences.json'),'{invalid');
  const updater=await createAutomaticWindowsUpdater({current:'0.2.12',root:f.directory,directory:f.directory,fetcher:()=>{throw Error('Must not request')}});
  assert.equal((await updater.check()).automatic,false);
});

test('update preference route is guarded, validates booleans and removes manual check route', async t => {
  const f=await fixture(t);const token='update-preference-test-abcdefghijklmnopqrstuvwxyz';let changes=0;
  const updater=await createAutomaticWindowsUpdater({current:'0.2.12',root:f.directory,directory:f.directory});
  const server=await startServer({port:0,dataDir:f.directory,config:{pinned:[]},obs:null,windowsHost:{token,updater:{...updater,setAutomatic:async value=>{changes++;return updater.setAutomatic(value)}}}});
  t.after(()=>server.close());const base=`http://127.0.0.1:${server.port}`;
  const request=(body,headers={})=>fetch(`${base}/api/windows/update/preferences`,{method:'POST',headers:{'Content-Type':'application/json',...headers},body});
  assert.equal((await request('{"automatic":false}')).status,403);
  assert.equal((await request('{"automatic":false}',{'X-EzDeck-Host':token,Origin:'https://evil.test'})).status,403);
  assert.equal((await request('{"automatic":"false"}',{'X-EzDeck-Host':token})).status,400);
  assert.equal((await request('{bad',{'X-EzDeck-Host':token})).status,400);
  const result=await request('{"automatic":false}',{'X-EzDeck-Host':token});
  assert.equal(result.status,200); assert.equal((await result.json()).automatic,false); assert.equal(changes,1);
  assert.equal((await fetch(`${base}/api/windows/update/check`,{method:'POST',headers:{'X-EzDeck-Host':token}})).status,404);
});
