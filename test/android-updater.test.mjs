import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const read = path => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const html = read('public/index.html');
const native = read('android/app/src/main/java/com/eddesignerez/ezdeck/MainActivity.kt');
const fn = html.slice(html.indexOf('  function checkVersion(attempt){'), html.indexOf('  function boot()', html.indexOf('  function checkVersion(attempt){')));

test('native startup lookup replaces only the new APK banner, preserving older APKs', () => {
  for (const bridge of [{ handlesUpdates: () => true }, { appVersion: () => '0.2.11' }, undefined]) {
    let requests = 0;
    const context = { window: { EzDeckAndroid: bridge }, hideUpBanner() {}, $: () => null,
      fetch() { requests++; return new Promise(() => {}); } };
    vm.runInNewContext(`${fn}\ncheckVersion();`, context);
    assert.equal(requests, bridge?.handlesUpdates ? 0 : 1);
  }
});

test('bundled APK keeps the same companion update compatibility', () => {
  assert.equal(html, read('android/app/src/main/assets/public/index.html'));
});

test('update completion remains bound to consent, installed identity and signature', () => {
  assert.match(native, /intent\?\.action != DownloadManager\.ACTION_DOWNLOAD_COMPLETE/);
  assert.match(native, /id <= 0 \|\| id != updateDownloadId/);
  assert.match(native, /putString\("version", version\)\.putLong\("downloadId", id\)/);
  assert.match(native, /archive\.packageName != packageName/);
  assert.match(native, /archiveVersion != expected/);
  assert.match(native, /archiveCode <= installedCode/);
  assert.match(native, /installedSigs\.isNotEmpty\(\) && installedSigs == archiveSigs/);
  assert.match(native, /if \(uri == null \|\| !validateDownloadedApk\(uri\)\)/);
  assert.match(native, /if \(installDownloadedApk\(uri\)\) clearUpdateDownload\(\)/);
});
