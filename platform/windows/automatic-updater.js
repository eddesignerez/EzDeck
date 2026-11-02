import { readFile, mkdir, writeFile, rename, rm } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { randomUUID } from 'node:crypto';
import { createWindowsUpdater, newerVersion } from './updater.js';

export async function createAutomaticWindowsUpdater(options) {
  const file = join(options.directory, 'preferences.json');
  let automatic = true;
  try {
    const settings = JSON.parse(await readFile(file, 'utf8'));
    automatic = settings.automatic === true;
  } catch (error) {
    // A missing first-run preference preserves the previous automatic behavior.
    // Invalid/unreadable preferences fail closed instead of opting the user in.
    if (error.code !== 'ENOENT') automatic = false;
  }
  const updater = createWindowsUpdater(options);
  let previousInstallation = null;
  try {
    const result = JSON.parse(await readFile(join(options.directory,'last-result.json'),'utf8'));
    if(result.stage === 'failed' && newerVersion(result.version,options.current)) previousInstallation = {version:result.version,failed:true};
  } catch { /* No completed handoff has reported a failure. */ }
  let writes = Promise.resolve();
  const snapshot = () => ({ ...updater.snapshot(), automatic, previousInstallation,
    ...(!automatic ? {status:'disabled',latest:null,error:null} : {}) });
  async function check() {
    if (automatic) await updater.check();
    return snapshot();
  }
  function setAutomatic(enabled) {
    if (typeof enabled !== 'boolean') return Promise.reject(Error('Opção inválida'));
    const change = writes.then(async () => {
      const temporary = `${file}.${randomUUID()}.tmp`;
      await mkdir(dirname(file), {recursive:true});
      try {
        await writeFile(temporary, JSON.stringify({automatic:enabled}), {flag:'wx',mode:0o600});
        await rename(temporary,file);
      } finally { await rm(temporary,{force:true}); }
      automatic = enabled;
      return check();
    });
    writes = change.catch(() => {});
    return change;
  }
  async function install() {
    if (!automatic) throw Error('Busca automática desativada');
    return updater.install();
  }
  return {snapshot,check,setAutomatic,install,apply:updater.apply};
}
