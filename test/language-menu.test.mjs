import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const [index, windows, extra, androidIndex, androidExtra] = await Promise.all([
  readFile(new URL("../public/index.html", import.meta.url), "utf8"),
  readFile(new URL("../public/windows.html", import.meta.url), "utf8"),
  readFile(new URL("../public/i18n-extra.js", import.meta.url), "utf8"),
  readFile(new URL("../android/app/src/main/assets/public/index.html", import.meta.url), "utf8"),
  readFile(new URL("../android/app/src/main/assets/public/i18n-extra.js", import.meta.url), "utf8"),
]);

test("seletor de idioma fica disponível no navegador, Windows e APK", () => {
  for (const code of ["es", "ja", "it", "fr", "de", "zh-CN", "vi", "ko", "ar"]) {
    assert.match(extra, new RegExp(`(?:^|[,{])\\s*["']?${code}`));
  }
  assert.match(index, /languageMenu/);
  assert.match(index, /ezdeck-locale/);
  assert.match(windows, /language-menu/);
  assert.match(androidIndex, /i18n-extra\.js/);
  assert.equal(androidExtra, extra);
});
