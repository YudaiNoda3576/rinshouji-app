// 過去帳（memorial register）の純関数ユーティリティ。

import type { MemorialEntry, ServiceHistoryItem } from './types';

// Service history per entry (memorial services performed)
export function getServiceHistory(entry: MemorialEntry): ServiceHistoryItem[] {
  // Standard anniversaries: 1, 3, 7, 13, 17, 23, 27, 33, 37, 50回忌
  const deathYear = new Date(entry.deceased).getFullYear();
  const cur = 2026;
  const milestones = [
    { n: 1, label: '一周忌' },
    { n: 3, label: '三回忌' },
    { n: 7, label: '七回忌' },
    { n: 13, label: '十三回忌' },
    { n: 17, label: '十七回忌' },
    { n: 23, label: '二十三回忌' },
    { n: 27, label: '二十七回忌' },
    { n: 33, label: '三十三回忌' },
    { n: 50, label: '五十回忌' },
  ];
  const out: ServiceHistoryItem[] = [];
  // Funeral (葬儀)
  out.push({ label: '葬儀', date: entry.deceased, kind: 'funeral', done: true });
  for (const m of milestones) {
    // 三回忌 is actually 2 years after death (満2年), but use elapsed for demo
    const yearOfService = deathYear + (m.n === 1 ? 1 : m.n - 1);
    if (yearOfService > cur + 1) break;
    out.push({
      label: m.label,
      date: yearOfService + '-' + entry.deceased.slice(5),
      kind: 'memorial',
      done: yearOfService < cur || (yearOfService === cur && new Date(yearOfService + '-' + entry.deceased.slice(5)) < new Date(2026, 4, 11)),
    });
  }
  return out;
}

export const fmtJpDate = (iso: string): string => {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  return `${y}年${parseInt(m, 10)}月${parseInt(d, 10)}日`;
};

export const fmtJpDateShort = (iso: string): string => {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  return `${y}.${m}.${d}`;
};

// Era conversion (rough) for ceremonial feeling
export function toEra(iso: string): string {
  const y = parseInt(iso.slice(0, 4), 10);
  let era: string;
  let n: number;
  if (y >= 2019) { era = '令和'; n = y - 2018; }
  else if (y >= 1989) { era = '平成'; n = y - 1988; }
  else if (y >= 1926) { era = '昭和'; n = y - 1925; }
  else if (y >= 1912) { era = '大正'; n = y - 1911; }
  else { era = '明治'; n = y - 1867; }
  const nl = n === 1 ? '元' : String(n);
  const m = parseInt(iso.slice(5, 7), 10);
  const d = parseInt(iso.slice(8, 10), 10);
  return `${era}${nl}年${m}月${d}日`;
}

export const yearsUntil = (iso: string): number => {
  const t = new Date(2026, 4, 11);
  const d = new Date(iso);
  const diff = (d.getTime() - t.getTime()) / (24 * 3600 * 1000);
  return Math.round(diff);
};
