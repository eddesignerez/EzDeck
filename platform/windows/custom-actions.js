import { readFile, writeFile, rename, mkdir, stat } from "node:fs/promises";
import { dirname, extname, join, win32 } from "node:path";
import { randomUUID } from "node:crypto";
import { parseShortcut, sendShortcut } from "./shortcuts.js";
import { runPowerShell } from "./apps.js";

export function createCustomActions({ file, run = runPowerShell }) {
  let queue = Promise.resolve();
  async function list() {
    try { const value = JSON.parse(await readFile(file, "utf8")); if (!Array.isArray(value)) throw new Error("Cadastro de ações inválido"); return value; }
    catch (error) { if (error.code === "ENOENT") return []; throw error; }
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
      return action;
    });
    queue = pending.catch(() => {});
    return pending;
  }
  return {
    list, save,
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
      const action = items.find(item => item.name === name);
      if (!action) throw new Error("Ação não encontrada");
      const extension = match[1] === "jpeg" ? "jpg" : match[1];
      const relative = join("icons", `${randomUUID()}.${extension}`);
      await mkdir(join(dirname(file), "icons"), { recursive: true });
      await writeFile(join(dirname(file), relative), bytes, { mode: 0o600 });
      action.icon = relative;
      const temporary = `${file}.${randomUUID()}.tmp`;
      await writeFile(temporary, JSON.stringify(items, null, 2), { mode: 0o600 });
      await rename(temporary, file);
      return action;
    },
    async getIcon(name) {
      const action = (await list()).find(item => item.name === name);
      if (!action?.icon) return null;
      try { return await readFile(join(dirname(file), action.icon)); } catch { return null; }
    },
    async inventory() {
      return (await list()).map(action => ({ name: action.name, icon: action.type === "app" || Boolean(action.icon), ...(action.path ? { path: action.path } : {}), ...(action.icon ? { customIcon: true } : {}) }));
    },
  };
}
