// 寺院ドメインの共有定数。

// 主要な宗派（フォーム・フィルタ既定）。
export const TEMPLE_SECTS = ['浄土真宗', '曹洞宗', '日蓮宗', '真言宗', '天台宗'] as const;

// 設定画面などで使う拡張版（宗派の選択肢）。
export const TEMPLE_SECTS_EXTENDED = [
  '浄土真宗',
  '曹洞宗',
  '日蓮宗',
  '真言宗',
  '天台宗',
  '臨済宗',
  '時宗',
  '黄檗宗',
] as const;

export type TempleSect = (typeof TEMPLE_SECTS_EXTENDED)[number];

// 曜日表記（日曜始まり）。
export const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土'] as const;
