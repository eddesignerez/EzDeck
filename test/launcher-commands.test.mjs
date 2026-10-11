import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
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

test("tela de apps abertos mostra o nome legível sob cada ícone", async t => {
  const platform = {
    appTools: {
      listInstalledApps: async () => [],
      listAppProcesses: async () => [
        { name: "Google Chrome", pid: 11 },
        { name: "Configurações do Windows", pid: 12 },
      ],
    },
    iconService: { getIconPng: async () => null },
    actions: { activateApp: async () => {} },
  };
  const server = await startServer({ port: 0, config: { pinned: [] }, platform, obs: null });
  t.after(() => server.close());
  const browser = await chromium.launch({ headless: true, channel: process.platform === "win32" ? "msedge" : undefined });
  t.after(() => browser.close());
  const page = await browser.newPage({ viewport: { width: 900, height: 700 } });
  await page.goto(`http://127.0.0.1:${server.port}/`);
  await page.waitForFunction(() => document.querySelectorAll("#screenRecents .dcard .dname").length === 2);
  assert.deepEqual(await page.locator("#screenRecents .dcard .dname").allTextContents(), ["Google Chrome", "Configurações do Windows"]);
  await page.evaluate(() => document.body.classList.add("is-recents"));
  assert.equal(await page.locator("#screenRecents .ttitle").textContent(), "Apps Abertos");
  const recentsLayout = await page.locator("#addAppsRecents").evaluate(button => {
    const box = button.getBoundingClientRect();
    return { top: box.top, right: innerWidth - box.right };
  });
  assert.ok(recentsLayout.top < 40, "o botão + APP deve ficar no topo da tela de abertos");
  assert.ok(recentsLayout.right <= 24, "o botão + APP deve ficar alinhado à direita");
  const titleLayout = await page.locator("#screenRecents .thead").evaluate(header => {
    const title = header.querySelector(".ttitle").getBoundingClientRect();
    return { centerOffset: Math.abs((title.left + title.width / 2) - innerWidth / 2), justifyContent: getComputedStyle(header).justifyContent };
  });
  assert.ok(titleLayout.centerOffset < 1, "Apps Abertos deve permanecer centralizado");
  assert.equal(titleLayout.justifyContent, "center");
  const labelLayout = await page.locator("#screenRecents .dcard").first().evaluate(card => {
    const label = card.querySelector(".dname");
    const icon = card.querySelector(".aglass");
    return {
      labelHeight: label.getBoundingClientRect().height,
      isBelowIcon: label.getBoundingClientRect().top >= icon.getBoundingClientRect().bottom,
      clamp: getComputedStyle(label).webkitLineClamp,
    };
  });
  assert.ok(labelLayout.labelHeight > 0, "o nome deve ocupar espaço visível abaixo do ícone");
  assert.equal(labelLayout.isBelowIcon, true);
  assert.equal(labelLayout.clamp, "2", "nomes longos devem ocupar no máximo duas linhas");
});

test("APK empacota botões que acompanham cada tela e mantém Apps Abertos centralizado", async () => {
  const bundled = await readFile(new URL("../android/app/src/main/assets/public/index.html", import.meta.url), "utf8");
  assert.match(bundled, /"recents\.title": "Apps Abertos"/);
  assert.match(bundled, /id="addAppsRecents"/);
  assert.match(bundled, /#screenRecents \.add-apps\{/);
  assert.doesNotMatch(bundled, /body\.is-recents \.thead/);
  assert.match(bundled, /\.dcard \.dname\{[\s\S]*?-webkit-line-clamp: 2/);
});
