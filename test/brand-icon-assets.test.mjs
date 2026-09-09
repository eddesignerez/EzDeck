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

test("o ícone EzDeck sincroniza Mac, PWA, docs e Android", () => {
  const outputs = new Map([
    ["public/icon-dock-iOS-Default-1024@1x.png", 1024],
    ["public/icon-192.png", 192],
    ["public/icon-512.png", 512],
    ["docs/public/dokke-icon.png", 512],
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

  assert.deepEqual(
    createHash("sha256").update(readFileSync(path.join(root, "docs/public/dokke-icon.png"))).digest("hex"),
    createHash("sha256").update(readFileSync(path.join(root, "public/icon-512.png"))).digest("hex"),
    "o ícone exibido no README deve usar o artwork Default atual",
  );
});

test("os ícones Android usam o artwork atual do EzDeck", () => {
  for (const [relativePath, expectedHash] of expectedAndroidIconHashes) {
    const actualHash = createHash("sha256")
      .update(readFileSync(path.join(root, relativePath)))
      .digest("hex");
    assert.equal(actualHash, expectedHash, `${relativePath} ainda usa artwork antigo`);
  }
});

test("o AppIcon do macOS contém todas as escalas e o icns regenerado", () => {
  const iconset = path.join(root, "mac", "AppIcon.iconset");
  const scales = new Map([
    ["icon_16x16.png", 16],
    ["icon_16x16@2x.png", 32],
    ["icon_32x32.png", 32],
    ["icon_32x32@2x.png", 64],
    ["icon_128x128.png", 128],
    ["icon_128x128@2x.png", 256],
    ["icon_256x256.png", 256],
    ["icon_256x256@2x.png", 512],
    ["icon_512x512.png", 512],
    ["icon_512x512@2x.png", 1024],
  ]);

  for (const [name, size] of scales) {
    assert.deepEqual(pngDimensions(path.join(iconset, name)), { width: size, height: size });
  }

  const icns = readFileSync(path.join(root, "mac", "AppIcon.icns"));
  assert.equal(icns.subarray(0, 4).toString("ascii"), "icns");
});

test("o fallback legado do Mac usa o mesmo ícone EzDeck", () => {
  const iconset = path.join(root, "mac", "AppIcon.iconset");
  assert.deepEqual(
    readFileSync(path.join(iconset, "icon_512x512.png")),
    readFileSync(path.join(root, "public", "icon-512.png"))
  );
  assert.deepEqual(
    readFileSync(path.join(iconset, "icon_512x512@2x.png")),
    readFileSync(path.join(root, "public", "icon-dock-iOS-Default-1024@1x.png"))
  );
});
