import test from 'node:test';
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {startServer} from '../server.js';

for(const touch of [false,true])test(`launcher ${touch?'touch':'mouse'} sends one command, shows pending and confirmation without waiting for icons`,async t=>{
  let calls=0,release;
  const gate=new Promise(resolve=>release=resolve);
  t.after(()=>release());
  const platform={appTools:{listInstalledApps:async()=>[{name:'Teste',path:'test.exe',icon:false}],listAppProcesses:async()=>[]},iconService:{getIconPng:async()=>null},actions:{activateApp:async()=>{calls++;await gate}}};
  const server=await startServer({port:0,config:{pinned:['Teste']},platform,obs:null});
  t.after(()=>server.close());
  const browser=await chromium.launch({headless:true,channel:process.platform==='win32'?'msedge':undefined});
  t.after(()=>browser.close());
  const page=await browser.newPage({viewport:{width:900,height:700},hasTouch:touch});
  await page.goto(`http://127.0.0.1:${server.port}/`);
  const tile=page.locator('.atile[data-name="Teste"]');await tile.waitFor();
  const before=Date.now();
  if(touch)await tile.tap();else await tile.click();
  await page.waitForFunction(()=>document.getElementById('command-notice').textContent==='Enviando…');
  assert.equal(calls,1);
  t.diagnostic(`click to server + UI observation: ${Date.now()-before} ms`);
  release();
  await page.waitForFunction(()=>document.getElementById('command-notice').textContent.includes('confirmado'));
  assert.equal(calls,1);
  assert.ok((await page.evaluate(()=>window.ezdeckLastCommand)).roundTripMs>=0);
});
