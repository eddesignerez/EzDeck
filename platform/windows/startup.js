import { access, unlink, mkdir } from 'node:fs/promises';
import { join, dirname } from 'node:path';

export function createStartup({ root, run, appData=process.env.APPDATA }) {
  const link=join(appData,'Microsoft','Windows','Start Menu','Programs','Startup','EzDeck.lnk');
  async function enabled(){try{await access(link);return true}catch{return false}}
  return {
    enabled,
    async set(value){
      if(typeof value!=='boolean')throw new Error('Opção de inicialização inválida');
      if(value){
        await mkdir(dirname(link),{recursive:true});
        await run(`$shell=New-Object -ComObject WScript.Shell; $link=$shell.CreateShortcut($args[0]); $link.TargetPath=Join-Path $env:WINDIR 'System32\\wscript.exe'; $link.Arguments='"'+$args[1]+'"'; $link.WorkingDirectory=$args[2]; $link.IconLocation=$args[3]+',0'; $link.Description='Iniciar EzDeck com Windows'; $link.Save()`,[link,join(root,'EzDeck.vbs'),root,join(root,'ezdeck.ico')]);
      }else{await unlink(link).catch(error=>{if(error.code!=='ENOENT')throw error})}
      return enabled();
    }
  };
}
