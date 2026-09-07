import { runPowerShell } from "./apps.js";

const MODIFIERS = { Ctrl: 0x11, Alt: 0x12, Shift: 0x10, Win: 0x5b };
const KEYS = { Enter: 13, Tab: 9, Space: 32, Escape: 27, Backspace: 8, Delete: 46, Insert: 45, Home: 36, End: 35, PageUp: 33, PageDown: 34, Left: 37, Up: 38, Right: 39, Down: 40, PrintScreen: 44, VolumeMute: 173, VolumeDown: 174, VolumeUp: 175, MediaNext: 176, MediaPrevious: 177, MediaStop: 178, MediaPlayPause: 179 };
for (let n = 1; n <= 24; n++) KEYS[`F${n}`] = 111 + n;
for (const c of "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789") KEYS[c] = c.charCodeAt(0);

export function parseShortcut(value) {
  if (typeof value !== "string" || value.length > 80) throw new Error("Atalho de teclado inválido");
  const parts = value.split("+").map(part => part.trim());
  const key = parts.pop();
  if (!Object.hasOwn(KEYS, key) || parts.some(p => !Object.hasOwn(MODIFIERS, p)) || new Set(parts).size !== parts.length) throw new Error("Use Ctrl, Alt, Shift ou Win e uma tecla válida");
  return { combo: [...Object.keys(MODIFIERS).filter(p => parts.includes(p)), key].join("+"), codes: [...parts.map(p => MODIFIERS[p]), KEYS[key]] };
}

// SendInput injects key-down and key-up together. No command or script text
// comes from a client; only allowlisted numeric virtual key codes reach C#.
const SEND_KEYS = `Add-Type @'
using System;
using System.Runtime.InteropServices;
public static class EzDeckKeyboard {
  [StructLayout(LayoutKind.Sequential)] public struct INPUT { public uint type; public UNION data; }
  [StructLayout(LayoutKind.Explicit)] public struct UNION { [FieldOffset(0)] public KEYBDINPUT keyboard; [FieldOffset(0)] public MOUSEINPUT mouse; }
  [StructLayout(LayoutKind.Sequential)] public struct KEYBDINPUT { public ushort vk, scan; public uint flags, time; public UIntPtr extra; }
  [StructLayout(LayoutKind.Sequential)] public struct MOUSEINPUT { public int x,y; public uint mouseData,flags,time; public UIntPtr extra; }
  [DllImport("user32.dll", SetLastError=true)] public static extern uint SendInput(uint count, INPUT[] inputs, int size);
  public static void Send(ushort[] keys) {
    INPUT[] inputs=new INPUT[keys.Length*2];
    for(int i=0;i<keys.Length;i++) {
      uint extended=(keys[i]>=33 && keys[i]<=46 || keys[i]==91 || keys[i]>=173) ? 1u : 0u;
      inputs[i].type=1; inputs[i].data.keyboard.vk=keys[i]; inputs[i].data.keyboard.flags=extended;
      int j=inputs.Length-1-i; inputs[j].type=1; inputs[j].data.keyboard.vk=keys[i]; inputs[j].data.keyboard.flags=extended|2u;
    }
    if(SendInput((uint)inputs.Length,inputs,Marshal.SizeOf(typeof(INPUT)))!=inputs.Length) {
      INPUT[] release=new INPUT[keys.Length]; Array.Copy(inputs,keys.Length,release,0,keys.Length);
      SendInput((uint)release.Length,release,Marshal.SizeOf(typeof(INPUT)));
      throw new Exception("Windows bloqueou o atalho. Verifique se o aplicativo de destino está elevado.");
    }
  }
}
'@
[EzDeckKeyboard]::Send([UInt16[]]($args[0] -split ','))`;

export async function sendShortcut(combo, run = runPowerShell) {
  await run(SEND_KEYS, [parseShortcut(combo).codes.join(",")]);
}
