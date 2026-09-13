import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const [index, windows, extra, windowsI18n, mobileI18n, androidIndex, androidExtra, androidMobile] = await Promise.all([
  readFile(new URL("../public/index.html", import.meta.url), "utf8"),
  readFile(new URL("../public/windows.html", import.meta.url), "utf8"),
  readFile(new URL("../public/i18n-extra.js", import.meta.url), "utf8"),
  readFile(new URL("../public/windows-i18n.js", import.meta.url), "utf8"),
  readFile(new URL("../public/mobile-i18n.js", import.meta.url), "utf8"),
  readFile(new URL("../android/app/src/main/assets/public/index.html", import.meta.url), "utf8"),
  readFile(new URL("../android/app/src/main/assets/public/i18n-extra.js", import.meta.url), "utf8"),
  readFile(new URL("../android/app/src/main/assets/public/mobile-i18n.js", import.meta.url), "utf8"),
]);

test("Windows controla o idioma compartilhado; navegador e APK só o refletem", () => {
  for (const code of ["es", "ja", "it", "fr", "de", "zh-CN", "vi", "ko", "ar"]) {
    assert.match(extra, new RegExp(`(?:^|[,{])\\s*["']?${code}`));
  }
  assert.doesNotMatch(index, /id="languageMenu"/);
  assert.match(windows, /language-menu/);
  assert.match(windows, /windows-i18n\.js/);
  assert.match(windowsI18n, /flagSvg/);
  assert.match(windowsI18n, /Iniciar com Windows/);
  assert.match(windowsI18n, /localizePageLabel/);
  assert.match(mobileI18n, /command\.confirmed/);
  assert.match(index, /applyHostLanguage/);
  assert.match(index, /document\.documentElement\.dir = "ltr"/);
  assert.match(index, /upDownload" data-i18n="update\.download/);
  assert.match(androidIndex, /i18n-extra\.js/);
  assert.match(androidIndex, /mobile-i18n\.js/);
  assert.equal(androidExtra, extra);
  assert.equal(androidMobile, mobileI18n);
});
