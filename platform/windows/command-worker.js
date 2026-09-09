import { spawn } from 'node:child_process';
import { createInterface } from 'node:readline';

// Private stdin pipe: only trusted, bundled scripts are submitted by the host.
// Browser requests can select registered actions, never supply script text.
const LOOP = String.raw`
$ErrorActionPreference='Stop'
[Console]::InputEncoding=New-Object System.Text.UTF8Encoding
[Console]::OutputEncoding=New-Object System.Text.UTF8Encoding
while($null -ne ($line=[Console]::ReadLine())) {
  $request=$null
  try {
    $request=ConvertFrom-Json $line
    $watch=[Diagnostics.Stopwatch]::StartNew()
    $arguments=@($request.args)
    $output= & ([scriptblock]::Create($request.script)) @arguments | Out-String
    $response=@{id=$request.id;ok=$true;stdout=[string]$output;elapsedMs=$watch.Elapsed.TotalMilliseconds}
  } catch { $response=@{id=$request.id;ok=$false;error=$_.Exception.Message} }
  [Console]::WriteLine(($response|ConvertTo-Json -Compress -Depth 8))
}
`;

export function createCommandWorker({ timeoutMs = 10000 } = {}) {
  let child=null, serial=0, closed=false;
  const pending=new Map();
  function start() {
    if (closed) throw new Error('Executor encerrado');
    if (child) return child;
    const process=spawn('powershell.exe',['-NoLogo','-NoProfile','-NonInteractive','-EncodedCommand',Buffer.from(LOOP,'utf16le').toString('base64')],{windowsHide:true,stdio:['pipe','pipe','pipe']});
    child=process;
    const fail=error=>{
      if(child!==process) return;
      child=null;
      for(const [id,task] of pending){clearTimeout(task.timer);task.reject(error);pending.delete(id);}
    };
    process.on('error',fail);
    process.on('exit',()=>fail(new Error('Executor do Windows foi encerrado')));
    process.stdin.on('error',()=>{});
    process.stderr.on('data',()=>{});
    const lines=createInterface({input:process.stdout});
    lines.on('line',line=>{
      let reply;try{reply=JSON.parse(line)}catch{return}
      const task=pending.get(reply.id);if(!task)return;
      pending.delete(reply.id);clearTimeout(task.timer);
      if(reply.ok)task.resolve({stdout:reply.stdout||'',elapsedMs:reply.elapsedMs});
      else task.reject(new Error(reply.error||'O Windows recusou o comando'));
    });
    return process;
  }
  function run(script,args=[]) {
    return new Promise((resolve,reject)=>{
      const process=start(),id=++serial;
      const timer=setTimeout(()=>{
        // Do not retry an uncertain action; it might already have executed.
        process.kill();
        reject(new Error('O Windows não confirmou o comando a tempo'));
      },timeoutMs);
      pending.set(id,{resolve,reject,timer});
      process.stdin.write(JSON.stringify({id,script,args})+'\n');
    });
  }
  return {run,close(){closed=true;if(child)child.kill();}};
}
