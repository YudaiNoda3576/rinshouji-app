// 設定画面の純関数ユーティリティ。

import type { SettingsEventKind } from './types';

// 種別から配色（tint / dark）を導出する。既に導出済みならそれを使う。
export function deriveSet(k: SettingsEventKind): { tint: string; dark: string } {
  if (k.tint && k.dark) return { tint: k.tint, dark: k.dark };
  return {
    tint: `color-mix(in oklab, ${k.color} 16%, white)`,
    dark: `color-mix(in oklab, ${k.color} 78%, black)`,
  };
}
