import { readFile, writeFile, rename, mkdir, stat, unlink } from "node:fs/promises";
import { dirname, extname, join, win32 } from "node:path";
import { randomUUID } from "node:crypto";
import { parseShortcut, sendShortcut } from "./shortcuts.js";
import { runPowerShell } from "./apps.js";

// O Menu Iniciar pode mudar a capitalização do nome (por exemplo, WhatsApp /
// WhatsApp). A sobreposição escolhida pelo usuário não pode depender disso.
const sameName = (left, right) => String(left || "").trim().toLocaleLowerCase("pt-BR") === String(right || "").trim().toLocaleLowerCase("pt-BR");

export function createCustomActions({ file, run = runPowerShell }) {
  let queue = Promise.resolve();
  let cached = null;
  const copy = items => items.map(item => ({ ...item }));
  async function list() {
    if (cached) return copy(cached);
    try {
      const value = JSON.parse(await readFile(file, "utf8"));
      if (!Array.isArray(value)) throw new Error("Cadastro de ações inválido");
      cached = value;
      return copy(cached);
    }
    catch (error) { if (error.code === "ENOENT") { cached = []; return []; } throw error; }
  }
  function save(input) {
    const pending = queue.then(async () => {
      const title = typeof input?.title === "string" ? input.title.trim() : "";
      if (!title || title.length > 70 || /[\x00-\x1f\x7f]/.test(title)) throw new Error("Informe um nome de até 70 caracteres");
      let action;
      if (input.type === "shortcut") {
        action = { name: `Teclado · ${title}`, title, type: "shortcut", combo: parseShortcut(input.combo).combo };
      } else if (input.type === "app") {
        const path = typeof input.path === "string" ? input.path.trim() : "";
        if (!win32.isAbsolute(path) || path.startsWith("\\\\") || ![".exe", ".lnk", ".appref-ms", ".bat", ".cmd"].includes(extname(path).toLowerCase())) throw new Error("Selecione um .exe, .lnk, .bat ou .cmd local");
        if (!(await stat(path)).isFile()) throw new Error("O arquivo selecionado não existe");
        action = { name: `App · ${title}`, title, type: "app", path };
      } else throw new Error("Tipo de ação inválido");
      const items = await list();
      const index = items.findIndex(item => item.name.toLowerCase() === action.name.toLowerCase());
      if (index >= 0) {
        // Atualizar um atalho não deve apagar o ícone que o usuário escolheu.
        action.name = items[index].name;
        if (items[index].icon) action.icon = items[index].icon;
        items[index] = action;
      }
      else { if (items.length >= 200) throw new Error("Limite de 200 ações cadastradas"); items.push(action); }
      await mkdir(dirname(file), { recursive: true });
      const temporary = `${file}.${randomUUID()}.tmp`;
      await writeFile(temporary, JSON.stringify(items, null, 2), { mode: 0o600 });
      await rename(temporary, file);
      cached = copy(items);
      return action;
    });
    queue = pending.catch(() => {});
    return pending;
  }
  return {
    list, save,
    async remove(name) {
      const pending = queue.then(async () => {
        const items = await list();
        // Primeiro remove uma ação criada pelo usuário. Se não existir, remove
        // apenas a sobreposição de ícone de um app do Windows.
        const action = items.find(item => item.type !== "icon" && sameName(item.name, name))
          || items.find(item => item.type === "icon" && sameName(item.target, name));
        if (!action) return { removed: false };
        const removed = action.type === "icon"
          ? [action]
          : items.filter(item => sameName(item.name, action.name) || (item.type === "icon" && sameName(item.target, action.name)));
        const keep = items.filter(item => !removed.includes(item));
        const temporary = `${file}.${randomUUID()}.tmp`;
        await writeFile(temporary, JSON.stringify(keep, null, 2), { mode: 0o600 });
        await rename(temporary, file);
        cached = copy(keep);
        await Promise.all(removed.filter(item => item.icon).map(item => unlink(join(dirname(file), item.icon)).catch(() => {})));
        return { removed: true, type: action.type };
      });
      queue = pending.catch(() => {});
      return pending;
    },
    async activate(name) {
      const action = (await list()).find(item => item.name === name);
      if (!action) return false;
      if (action.type === "shortcut") await sendShortcut(action.combo, run);
      else await run("Start-Process -FilePath $args[0]", [action.path]);
      return true;
    },
    async setIcon(name, dataUrl) {
      if (typeof dataUrl !== "string") throw new Error("Ícone inválido");
      const match = dataUrl.match(/^data:image\/(png|jpeg|webp);base64,([A-Za-z0-9+/=]+)$/);
      if (!match) throw new Error("Use uma imagem PNG, JPG ou WebP");
      const bytes = Buffer.from(match[2], "base64");
      if (!bytes.length || bytes.length > 1_500_000) throw new Error("O ícone deve ter no máximo 1,5 MB");
      const items = await list();
      // Mantém uma sobreposição para apps do próprio Windows sem duplicá-los
      // na biblioteca de apps personalizados.
      let action = items.find(item => sameName(item.name, name)) || items.find(item => item.type === "icon" && sameName(item.target, name));
      if (!action) { action = { name: `__icon__:${name}`, type: "icon", target: name }; items.push(action); }
      const extension = match[1] === "jpeg" ? "jpg" : match[1];
      const relative = join("icons", `${randomUUID()}.${extension}`);
      await mkdir(join(dirname(file), "icons"), { recursive: true });
      await writeFile(join(dirname(file), relative), bytes, { mode: 0o600 });
      action.icon = relative;
      const temporary = `${file}.${randomUUID()}.tmp`;
      await writeFile(temporary, JSON.stringify(items, null, 2), { mode: 0o600 });
      await rename(temporary, file);
      cached = copy(items);
      return action;
    },
    async getIcon(name) {
      const items = await list();
      const action = items.find(item => sameName(item.name, name)) || items.find(item => item.type === "icon" && sameName(item.target, name));
      if (!action?.icon) return null;
      try { return await readFile(join(dirname(file), action.icon)); } catch { return null; }
    },
    async inventory() {
      return (await list()).filter(action => action.type !== "icon").map(action => ({ name: action.name, icon: action.type === "app" || Boolean(action.icon), ...(action.path ? { path: action.path } : {}), ...(action.icon ? { customIcon: true } : {}) }));
    },
  };
}
