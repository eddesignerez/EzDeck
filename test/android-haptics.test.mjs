import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const source = await readFile(new URL("../android/app/src/main/java/com/eddesignerez/ezdeck/MainActivity.kt", import.meta.url), "utf8");
const manifest = await readFile(new URL("../android/app/src/main/AndroidManifest.xml", import.meta.url), "utf8");
const web = await readFile(new URL("../public/index.html", import.meta.url), "utf8");
const androidWeb = await readFile(new URL("../android/app/src/main/assets/public/index.html", import.meta.url), "utf8");

test("APK expõe haptic contextual pelo bridge sem forçar vibração", () => {
  assert.match(source, /fun performHapticFeedback\(\)/);
  assert.match(source, /HapticFeedbackConstants\.CONTEXT_CLICK/);
  assert.match(source, /HapticFeedbackConstants\.VIRTUAL_KEY/);
  assert.match(source, /web\.performHapticFeedback\(constant\)/);
  assert.doesNotMatch(manifest, /android\.permission\.VIBRATE/, "o feedback deve respeitar as configurações do sistema");
});

test("APK mantém o login responsivo e deixa o sistema controlar a orientação", () => {
  assert.doesNotMatch(manifest, /android:screenOrientation=/);
  assert.match(manifest, /android:configChanges="orientation\|screenSize\|keyboardHidden"/);
  assert.match(source, /fun setLoginResponsive\(\)/, "a ponte nativa deve manter o login livre para girar");
  assert.doesNotMatch(source, /ActivityInfo\.SCREEN_ORIENTATION_PORTRAIT/, "o login não deve forçar retrato");
  assert.match(source, /ActivityInfo\.SCREEN_ORIENTATION_UNSPECIFIED/, "o sensor do dispositivo deve controlar a orientação");
  assert.match(web, /@media \(orientation: landscape\)/, "o login deve ter layout para paisagem");
  assert.match(web, /setLoginResponsive/, "a interface deve pedir o modo responsivo ao bridge");
});

test("APK identifica a ponte nativa e nunca recarrega a interface por broadcast", () => {
  for (const page of [web, androidWeb]) {
    assert.match(page, /window\.EzDeckAndroid/, "a ponte nativa deve identificar o WebView mesmo com user-agent diferente");
    assert.match(page, /if \(IS_ANDROID_WEBVIEW\) return;/, "alterações recebidas não devem chamar location.reload no APK");
  }
});

test("APK reduz composição visual somente em dispositivos Android com pouca RAM", () => {
  assert.match(source, /fun isLowPowerDevice\(\): Boolean/);
  assert.match(source, /isLowRamDevice/);
  for (const page of [web, androidWeb]) {
    assert.match(page, /android-low-power/, "o WebView deve ter um modo estável para aparelhos modestos");
    assert.match(page, /isLowPowerDevice/, "a página deve consultar a classificação nativa do aparelho");
  }
});

test("APK mantém a tela acesa enquanto a Activity está visível", () => {
  assert.match(source, /window\.addFlags\(WindowManager\.LayoutParams\.FLAG_KEEP_SCREEN_ON\)/);
});
