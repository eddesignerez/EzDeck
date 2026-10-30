import { randomBytes } from 'node:crypto';
import { NATIVE_MENU_SCRIPT } from './native-menu.js';
import { createCommandWorker } from './command-worker.js';

export function createRemoteMenu({ listAppProcesses, run, now = Date.now, ttlMs = 60000 } = {}) {
  if (typeof listAppProcesses !== 'function') throw Error('Inventário de apps abertos obrigatório');
  let worker, current = null, queue = Promise.resolve(), timer, pending = 0;
  const execute = run || ((...args) => { worker ||= createCommandWorker(); return worker.run(...args); });
  const serial = fn => {
    if (pending >= 8) return Promise.reject(Error('Menu ocupado'));
    pending++;
    const next = queue.then(fn).finally(() => { pending--; });
    queue = next.catch(() => {}); return next;
  };
  const token = () => randomBytes(24).toString('hex');
  async function native(op, args = []) {
    const result = await execute(NATIVE_MENU_SCRIPT, [op, ...args]);
    return JSON.parse(result.stdout || '{}');
  }
  async function closeNative() { clearTimeout(timer); current = null; await native('close'); }
  function requireSession(owner, session) {
    if (!current || current.owner !== owner || current.session !== session || now() >= current.expires) throw Error('Menu expirado ou indisponível');
    return current;
  }
  function frame(reply) {
    if (reply.Closed) { clearTimeout(timer); current = null; return { closed: true }; }
    if (!Number.isInteger(reply.Width) || !Number.isInteger(reply.Height) || reply.Width < 40 || reply.Width > 1000 || reply.Height < 20 || reply.Height > 1600 || typeof reply.Png !== 'string' || reply.Png.length > 4 * 1024 * 1024) throw Error('Menu inválido');
    const image = Buffer.from(reply.Png, 'base64');
    if (image.subarray(0, 8).toString('hex') !== '89504e470d0a1a0a') throw Error('Imagem de menu inválida');
    return { session: current.session, width: reply.Width, height: reply.Height, image: `data:image/png;base64,${reply.Png}` };
  }
  return {
    open(owner, name) { return serial(async () => {
      if (typeof owner !== 'string' || !owner || typeof name !== 'string' || name.length > 200) throw Error('Aplicativo inválido');
      if (current && current.owner !== owner && now() < current.expires) throw Error('Menu em uso por outro dispositivo');
      const app = (await listAppProcesses({ nativeMenu: true })).find(a => a.name === name && Number.isInteger(a.pid) && a.pid > 0);
      if (!app) throw Error('O aplicativo não está mais aberto');
      await closeNative();
      current = { owner, session: token(), expires: now() + ttlMs };
      try {
        const result = frame(await native('open', [app.displayName || app.name, app.appUserModelId || '', String(app.pid)]));
        if (result.closed) throw Error('O menu nativo não está disponível');
        timer = setTimeout(() => serial(closeNative).catch(() => {}), ttlMs); timer.unref?.();
        return result;
      } catch (e) { await closeNative().catch(() => {}); throw e; }
    }); },
    frame(owner, session) { return serial(async () => { requireSession(owner, session); return frame(await native('frame')); }); },
    tap(owner, session, x, y) { return serial(async () => {
      requireSession(owner, session);
      if (![x,y].every(value => typeof value === 'number' && Number.isFinite(value) && value >= 0 && value < 1)) throw Error('Toque inválido');
      return frame(await native('tap', [String(x), String(y)]));
    }); },
    dismiss(owner, session) { return serial(async () => { requireSession(owner, session); await closeNative(); return { closed: true }; }); },
    async close() { if (current || worker) await serial(closeNative).catch(() => {}); worker?.close(); },
  };
}
