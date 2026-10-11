import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const [packageJson, publicVersion, androidGradle, signingPolicy, installerScript] = await Promise.all([
  readFile(new URL("../package.json", import.meta.url), "utf8"),
  readFile(new URL("../public/version.json", import.meta.url), "utf8"),
  readFile(new URL("../android/app/build.gradle", import.meta.url), "utf8"),
  readFile(new URL("../CODE_SIGNING_POLICY.md", import.meta.url), "utf8"),
  readFile(new URL("../windows/package-installer.ps1", import.meta.url), "utf8"),
]);

test("todos os metadados apontam para a release v0.2.10", () => {
  assert.equal(JSON.parse(packageJson).version, "0.2.10");
  assert.deepEqual(JSON.parse(publicVersion), { tag: "v0.2.10", apkVersion: "0.2.10" });
  assert.match(androidGradle, /versionCode = 13/);
  assert.match(androidGradle, /versionName = "0\.2\.10"/);
  assert.match(signingPolicy, /GitHub Actions/);
  assert.match(installerScript, /DisplayVersion", "__EZDECK_VERSION__"/);
  assert.match(installerScript, /\.Replace\('__EZDECK_VERSION__', \$displayVersion\)/);
});
