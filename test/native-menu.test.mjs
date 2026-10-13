import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {chromium} from 'playwright';
import {createRemoteMenu} from '../platform/windows/remote-menu.js';
import {startServer} from '../server.js';
import {createWindowsIconService} from '../platform/windows/apps.js';
import {writeFile} from 'node:fs/promises';
import {createCommandWorker} from '../platform/windows/command-worker.js';
import {NATIVE_MENU_SCRIPT} from '../platform/windows/native-menu.js';

const frame={Width:180,Height:100,Png:'iVBORw0KGgo='};
test('native Windows helper compiles without opening menus or injecting input',{skip:process.platform!=='win32'},async()=>{
  const worker=createCommandWorker();
  try{assert.equal(JSON.parse((await worker.run(NATIVE_MENU_SCRIPT,['ready'])).stdout).Ready,true);}finally{worker.close();}
});
test('EzDeck running through wscript uses its own logo even without a Start menu shortcut',async()=>{
  let source;
  const icons=createWindowsIconService({listInstalledApps:async()=>[],listAppProcesses:async()=>[{name:'EzDeck',pid:123,path:'C:/Windows/System32/wscript.exe'}],convertIcon:async(path,output)=>{source=path;await writeFile(output,Buffer.from('icon'));}});
  assert.equal((await icons.getIconPng('EzDeck')).toString(),'icon');
  assert.match(source.replaceAll('\\','/'),/ezdeck\.ico$/);
});
test('native menu validates inventory, session owner, coordinates and expiry',async()=>{
  let clock=100, calls=[];
  const menu=createRemoteMenu({listAppProcesses:async()=>[{name:'App',pid:123}],now:()=>clock,ttlMs:1000,run:async(script,args)=>{calls.push(args);return {stdout:JSON.stringify(args[0]==='close'?{Closed:true}:frame)};}});
  try{
    await assert.rejects(menu.open('device','not installed'));
    const opened=await menu.open('device','App');
    assert.equal(calls.find(args=>args[0]==='open')[3],'123');
    await assert.rejects(menu.tap('other',opened.session,.5,.5));
    await assert.rejects(menu.open('other','App'));
    for(const x of [-1,1,NaN,Infinity,'0.5']) await assert.rejects(menu.tap('device',opened.session,x,.5));
    assert.equal((await menu.tap('device',opened.session,.5,.5)).session,opened.session);
    clock+=1001; await assert.rejects(menu.frame('device',opened.session));
  }finally{await menu.close();}
});
test('Windows launcher and uninstaller include the Start menu shortcut and branded icon',async()=>{
  const launcher=await readFile(new URL('../EzDeck.vbs',import.meta.url),'utf8');
  const installer=await readFile(new URL('../windows/package-installer.ps1',import.meta.url),'utf8');
  assert.match(launcher,/SpecialFolders\("Programs"\)/);
  assert.match(launcher,/link.IconLocation = fs.BuildPath\(root, "ezdeck.ico"\)/);
  assert.match(installer,/RemoveLink\(Environment.SpecialFolder.Programs, "EzDeck.lnk"\)/);
});
test('two-finger tap opens real-menu bridge once, never activates or reorders; image tap executes',async t=>{
  let opened=0,activated=0,tapped=0;
  const png='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a3ioAAAAASUVORK5CYII=';
  const server=await startServer({port:0,config:{pinned:[]},obs:null,remoteMenu:{
    open:async(owner,name)=>{assert.equal(name,'App');opened++;return {session:'test',image:png,width:180,height:100};},
    frame:async()=>({closed:true}),tap:async(owner,session,x,y)=>{assert.equal(session,'test');assert.ok(x>=0&&x<1&&y>=0&&y<1);tapped++;return {closed:true};},dismiss:async()=>({closed:true}),close:async()=>{},
  },platform:{appTools:{listInstalledApps:async()=>[],listAppProcesses:async()=>[{name:'App',pid:123}]},iconService:{getIconPng:async()=>null},actions:{activateApp:async()=>{activated++;}}}});
  let browser;
  t.after(async()=>{await browser?.close();await server.close();});
  browser=await chromium.launch({headless:true,channel:process.platform==='win32'?'msedge':undefined});
  const page=await browser.newPage({viewport:{width:900,height:405},hasTouch:true});
  await page.goto(`http://127.0.0.1:${server.port}`);
  await page.locator('#deck .dcard').waitFor();
  await page.locator('#vdots .d').nth(1).click();
  await page.waitForFunction(()=>document.body.classList.contains('is-recents')&&!document.body.classList.contains('swiping'));
  const box=await page.locator('#deck .dcard').boundingBox();
  const points=[{x:box.x+box.width*.4,y:box.y+box.height*.4,id:1},{x:box.x+box.width*.6,y:box.y+box.height*.4,id:2}];
  const cdp=await page.context().newCDPSession(page);
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:points});
  await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  await page.locator('.native-app-menu img').waitFor({state:'visible'});
  assert.equal(opened,1);assert.equal(activated,0);assert.equal(await page.locator('.recents-drag-ghost').count(),0);
  await page.locator('.native-app-menu img').click();
  await page.waitForFunction(()=>!document.querySelector('.native-app-menu').open);
  assert.equal(tapped,1);
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:points});
  await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:points.map(point=>({...point,x:point.x+30}))});
  await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  await page.waitForTimeout(100);
  assert.equal(opened,1,'two-finger movement is not a menu tap');
  assert.equal(activated,0);
  const response=await fetch(`http://127.0.0.1:${server.port}/api/native-menu`,{method:'POST',headers:{Origin:'https://evil.example','Content-Type':'application/json'},body:JSON.stringify({action:'open',name:'App'})});
  assert.equal(response.status,403);
});
