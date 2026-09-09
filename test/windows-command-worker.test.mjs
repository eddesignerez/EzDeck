import test from 'node:test';
import assert from 'node:assert/strict';
import { createCommandWorker } from '../platform/windows/command-worker.js';
import { KEYBOARD_WARMUP } from '../platform/windows/shortcuts.js';
import { runPowerShell } from '../platform/windows/apps.js';

test('Windows executor preserves arguments, reuses compiled keyboard helper and survives an action error', {skip:process.platform!=='win32'}, async t=>{
  const worker=createCommandWorker();t.after(()=>worker.close());
  const start=performance.now();
  await runPowerShell('[int]42');
  const oldMs=performance.now()-start;
  await worker.run(KEYBOARD_WARMUP);
  const values=['á espaços',"$(throw 'unsafe')",'a&b','single\'quote','double"quote'];
  const result=await worker.run('ConvertTo-Json -InputObject @($args) -Compress',values);
  assert.deepEqual(JSON.parse(result.stdout),values);
  await assert.rejects(worker.run("throw 'teste controlado'"),/teste controlado/);
  const durations=[];
  for(let i=0;i<5;i++){
    const before=performance.now();
    const result=await worker.run("[Runtime.InteropServices.Marshal]::SizeOf([type][EzDeckKeyboard+INPUT])");
    durations.push(Math.round(performance.now()-before));
    assert.equal(Number(result.stdout.trim()),process.arch==='x64'?40:28);
  }
  t.diagnostic(JSON.stringify({oldProcessMs:Math.round(oldMs),warmCommandMs:durations}));
});
