// 檀家地図の日付整形・距離計算ユーティリティ。

export const fmtParishDate = (iso: string): string => {
  const d = new Date(iso);
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
};

export const monthsSince = (iso: string): number => {
  const t = new Date('2026-05-12');
  const d = new Date(iso);
  return Math.round((t.getTime() - d.getTime()) / (1000 * 60 * 60 * 24 * 30));
};

// 地区ラベルの x 座標（path の最初の M 値 + 30）。
export const districtLabelX = (d: string): number => {
  const m = d.match(/M (\d+)/);
  return (m ? Number(m[1]) : 0) + 30;
};

// 地区ラベルの y 座標（path の最初の L 終点 y 値 + 14）。
export const districtLabelY = (d: string): number => {
  const m = d.match(/L \d+ (\d+)/);
  return (m ? Number(m[1]) : 0) + 14;
};
