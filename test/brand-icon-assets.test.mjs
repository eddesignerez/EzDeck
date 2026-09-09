import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourceIcon = path.join(root, "assets", "branding", "ezdeck-icon", "EzDeck.L.png");

const expectedAndroidIconHashes = new Map([
  ["android/app/src/main/res/mipmap-mdpi/ic_launcher.png", "69842dfeaeab2d833a3c5ff9e8072b42e3afa5ffa3400519bf3d6596c651e1bd"],
  ["android/app/src/main/res/mipmap-hdpi/ic_launcher.png", "9a969b8366c048db0dd396d1f916051135a5a982cc55fb6d7b61eb5108c95ffb"],
  ["android/app/src/main/res/mipmap-xhdpi/ic_launcher.png", "8da759765dfe6a26e5df918569b13740e36ff7d9437d2eacd9ec75953b4444c2"],
  ["android/app/src/main/res/mipmap-xxhdpi/ic_launcher.png", "bed1d4e98db57b76c18fc71d5ea639bfa3b93a47a61d84c1e178a79ecc6aee7a"],
  ["android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png", "3696dd95d8f44f8ed99e8b6708ab926cf181da24bce0fca4e4d43d23a3136d77"],
]);

function pngDimensions(filePath) {
  const png = readFileSync(filePath);
  assert.deepEqual([...png.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10]);
  return {
    width: png.readUInt32BE(16),
    height: png.readUInt32BE(20),
  };
}

test("a fonte visual do EzDeck fica versionada no projeto", () => {
  assert.deepEqual(pngDimensions(sourceIcon), { width: 256, height: 256 });
});
test("o ícone EzDeck sincroniza PWA e Android", () => {
  const outputs = new Map([
    ["public/icon-dock-iOS-Default-1024@1x.png", 1024],
    ["public/icon-192.png", 192],
    ["public/icon-512.png", 512],
    ["android/app/src/main/res/mipmap-mdpi/ic_launcher.png", 48],
    ["android/app/src/main/res/mipmap-hdpi/ic_launcher.png", 72],
    ["android/app/src/main/res/mipmap-xhdpi/ic_launcher.png", 96],
    ["android/app/src/main/res/mipmap-xxhdpi/ic_launcher.png", 144],
    ["android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png", 192],
  ]);

  for (const [relativePath, size] of outputs) {
    assert.ok(existsSync(path.join(root, relativePath)), `${relativePath} ausente`);
    assert.deepEqual(pngDimensions(path.join(root, relativePath)), { width: size, height: size });
  }

});

test("os ícones Android usam o artwork atual do EzDeck", () => {
  for (const [relativePath, expectedHash] of expectedAndroidIconHashes) {
    const actualHash = createHash("sha256")
      .update(readFileSync(path.join(root, relativePath)))
      .digest("hex");
    assert.equal(actualHash, expectedHash, `${relativePath} ainda usa artwork antigo`);
  }
});
