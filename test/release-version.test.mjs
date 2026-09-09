import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const [packageJson, publicVersion, androidGradle, signingPolicy] = await Promise.all([
  readFile(new URL("../package.json", import.meta.url), "utf8"),
  readFile(new URL("../public/version.json", import.meta.url), "utf8"),
  readFile(new URL("../android/app/build.gradle", import.meta.url), "utf8"),
  readFile(new URL("../CODE_SIGNING_POLICY.md", import.meta.url), "utf8"),
]);

test("todos os metadados apontam para a release v0.2.8", () => {
  assert.equal(JSON.parse(packageJson).version, "0.2.8");
  assert.deepEqual(JSON.parse(publicVersion), { tag: "v0.2.8", apkVersion: "0.2.8" });
  assert.match(androidGradle, /versionCode = 11/);
  assert.match(androidGradle, /versionName = "0\.2\.8"/);
  assert.match(signingPolicy, /GitHub Actions/);
});
