import { createHash } from 'node:crypto';
import { mkdir, mkdtemp, open, rm } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { spawn } from 'node:child_process';

const REPO = 'https://github.com/eddesignerez/EzDeck';
const MAX_EXE = 160 * 1024 * 1024;
const REDIRECT_HOSTS = new Set(['github.com', 'release-assets.githubusercontent.com', 'objects.githubusercontent.com']);
export function stableVersion(raw) {
  return typeof raw === 'string' && /^v?\d+\.\d+\.\d+$/.test(raw) && raw.replace(/^v/, '').split('.').every(n => Number.isSafeInteger(Number(n))) ? raw.replace(/^v/, '') : null;
}
export function newerVersion(remote, current) {
  const a = stableVersion(remote), b = stableVersion(current);
  if (!a || !b) return false;
  const aa = a.split('.').map(Number), bb = b.split('.').map(Number);
  for (let i = 0; i < 3; i++) if (aa[i] !== bb[i]) return aa[i] > bb[i];
  return false;
}

async function githubFetch(url, { fetcher, signal }) {
  for (let n = 0; n < 6; n++) {
    const parsed = new URL(url);
    if (parsed.protocol !== 'https:' || parsed.username || parsed.password || (parsed.port && parsed.port !== '443') || !REDIRECT_HOSTS.has(parsed.hostname)) throw Error('Destino de atualização inválido');
    const response = await fetcher(url, { redirect: 'manual', signal });
    if ([301, 302, 303, 307, 308].includes(response.status)) {
      const next = response.headers.get('location');
      await response.body?.cancel();
      if (!next) throw Error('Download indisponível');
      url = new URL(next, url).href;
      continue;
    }
    if (!response.ok) { await response.body?.cancel(); throw Error('Não foi possível consultar o GitHub'); }
    return response;
  }
  throw Error('Redirecionamento de atualização inválido');
}

export function createWindowsUpdater({ current, root, directory, fetcher = fetch, launch, now = Date.now } = {}) {
  let latest = null, checkedAt = null, checking = null, installing = false, staged = null;
  let status = 'checking', error = null;
  const snapshot = () => ({ current, latest: latest && { version: latest, available: newerVersion(latest, current) }, status, error });
  async function check() {
    if (checking) return checking;
    if (checkedAt !== null && now() - checkedAt < 10 * 60 * 1000) return snapshot();
    checking = (async () => {
      const controller = new AbortController(), timer = setTimeout(() => controller.abort(), 5000);
      try {
        const response = await fetcher(`${REPO}/releases/latest`, { redirect: 'manual', signal: controller.signal });
        const location = response.headers.get('location') || '';
        await response.body?.cancel();
        const prefix = `${REPO}/releases/tag/`;
        const tag = location.startsWith(prefix) ? location.slice(prefix.length) : location.startsWith('/eddesignerez/EzDeck/releases/tag/') ? location.slice('/eddesignerez/EzDeck/releases/tag/'.length) : null;
        if (![301,302,303,307,308].includes(response.status) || !stableVersion(tag)) throw Error('Não foi possível consultar o GitHub');
        latest = stableVersion(tag); checkedAt = now(); error = null;
        if (!installing) status = newerVersion(latest, current) ? 'available' : 'current';
      } catch { error = 'Não foi possível buscar atualizações. Tente novamente mais tarde.'; if (!installing) status = 'error'; }
      finally { clearTimeout(timer); checking = null; }
      return snapshot();
    })();
    return checking;
  }
  async function install() {
    if (installing) throw Error('A atualização já está em andamento');
    await check();
    if (installing) throw Error('A atualização já está em andamento');
    if (error) throw Error('Não foi possível confirmar a atualização no GitHub');
    if (!latest || !newerVersion(latest, current)) throw Error('Nenhuma atualização disponível');
    installing = true; staged = null; status = 'downloading'; error = null;
    const tag = `v${latest}`, controller = new AbortController(), timer = setTimeout(() => controller.abort(), 120000);
    let folder;
    try {
      const base = `${REPO}/releases/download/${tag}/`;
      const sums = await githubFetch(`${base}SHA256SUMS.txt`, { fetcher, signal: controller.signal });
      // Release metadata is public, bounded and never executable.
      let sumText = '';
      for await (const chunk of sums.body) { sumText += Buffer.from(chunk).toString('utf8'); if (sumText.length > 16384) throw Error('Verificação da atualização inválida'); }
      const lines = sumText.split(/\r?\n/).map(line => line.match(/^([a-fA-F0-9]{64})\s+\*?EzDeck-Setup\.exe\s*$/)).filter(Boolean);
      if (lines.length !== 1) throw Error('Verificação da atualização indisponível');
      const expected = lines[0][1].toLowerCase();
      await mkdir(directory, { recursive: true });
      folder = await mkdtemp(join(directory, 'download-'));
      const installer = join(folder, 'EzDeck-Setup.exe');
      const response = await githubFetch(`${base}EzDeck-Setup.exe`, { fetcher, signal: controller.signal });
      if (Number(response.headers.get('content-length')) > MAX_EXE) throw Error('Atualização maior que o permitido');
      const file = await open(installer, 'wx');
      const hash = createHash('sha256'); let size = 0, prefix = Buffer.alloc(0);
      try {
        for await (const chunk of response.body) {
          const bytes = Buffer.from(chunk); size += bytes.length;
          if (size > MAX_EXE) { controller.abort(); throw Error('Atualização maior que o permitido'); }
          if (prefix.length < 2) prefix = Buffer.concat([prefix, bytes]).subarray(0, 2);
          hash.update(bytes); await file.writeFile(bytes);
        }
      } finally { await file.close(); }
      if (size < 1024 || prefix.toString('ascii') !== 'MZ' || hash.digest('hex') !== expected) throw Error('O arquivo baixado não passou na verificação');
      staged = { installer, expected, version: latest }; status = 'ready';
      return { version: latest };
    } catch (e) {
      installing = false; checkedAt = null; status = 'error'; error = 'Não foi possível preparar a atualização. Nenhum instalador foi executado.';
      if (folder) await rm(folder, { recursive: true, force: true });
      throw Error(error);
    } finally { clearTimeout(timer); }
  }
  async function apply() {
    try {
      if (!staged) throw Error('Atualização não preparada');
      if (!launch && resolve(process.execPath).toLowerCase() !== resolve(root, 'runtime', 'node.exe').toLowerCase()) throw Error('A atualização precisa ser iniciada pelo EzDeck instalado');
      // Same process-scoped policy as the trusted desktop launcher. This does
      // not change machine policy or suppress Windows installer security UI.
      const args = ['-NoLogo','-NoProfile','-NonInteractive','-ExecutionPolicy','Bypass','-File', join(root, 'windows', 'apply-update.ps1'), '-Installer', staged.installer, '-ExpectedHash', staged.expected, '-HostPid', String(process.pid), '-DesktopPid', String(process.ppid), '-InstallRoot', resolve(root)];
      const child = launch ? await launch(args) : spawn('powershell.exe', args, { detached: true, windowsHide: true, stdio: 'ignore' });
      if (!launch) await new Promise((resolve, reject) => { child.once('spawn', resolve); child.once('error', reject); });
      child?.unref?.(); status = 'installing';
    } catch (e) {
      installing = false; staged = null; checkedAt = null; status = 'error';
      error = 'Não foi possível iniciar a instalação. Abra o EzDeck instalado e tente novamente.';
      throw Error(error);
    }
  }
  return { check, snapshot, install, apply };
}
