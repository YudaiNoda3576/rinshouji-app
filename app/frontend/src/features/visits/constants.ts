// visits（お参り記録）のサンプルデータ・定数・整形ヘルパー。

import { WEEKDAYS } from '@/constants/temple';

import type { Visit, VisitKind, VisitStatus } from './types';

export const VISITORS = [
  '佐藤 千恵子','田中 一郎','高橋 美和','山本 義信','鈴木 道夫','伊藤 京子','渡辺 静江','中村 純一',
  '小林 麗子','加藤 信吾','吉田 とき子','山田 健作','佐々木 史','松本 紀子','井上 幸雄','木村 義行',
  '清水 美智子','林 慶介','斎藤 久子','池田 直樹','岡田 結花','石川 弘','前田 信子','藤田 善男',
];
export const FAMILIES = ['佐藤家','田中家','高橋家','山本家','鈴木家','伊藤家','渡辺家','中村家','小林家','加藤家','吉田家','山田家'];
export const KINDS: VisitKind[] = [
  { key: 'monthly',   label: '月命日',     color: 'blue' },
  { key: 'memorial',  label: '年忌法要',   color: 'purple' },
  { key: 'obon',      label: 'お盆',       color: 'green' },
  { key: 'higan',     label: 'お彼岸',     color: 'green' },
  { key: 'visit',     label: '一般参拝',   color: 'gray' },
];
export const STATUS: VisitStatus[] = [
  { key: 'done',      label: '完了',       color: 'green' },
  { key: 'scheduled', label: '予定',       color: 'blue' },
  { key: 'cancelled', label: '中止',       color: 'gray' },
];

// Deterministic-ish data
export function buildVisits(): Visit[] {
  const arr: Visit[] = [];
  const base = new Date(2026, 4, 11); // May 11, 2026
  for (let i = 0; i < 28; i++) {
    const k = KINDS[i % KINDS.length];
    const s = i < 3 ? STATUS[1] : (i % 9 === 0 ? STATUS[2] : STATUS[0]);
    const d = new Date(base);
    d.setDate(base.getDate() - (i - 3));
    const hour = 8 + (i * 3) % 9;
    const min = (i * 17) % 60;
    arr.push({
      id: 'V-' + (1024 + i),
      date: d,
      hour, min,
      name: VISITORS[i % VISITORS.length] + ' 様',
      family: FAMILIES[i % FAMILIES.length],
      kind: k,
      status: s,
      offering: [5000, 10000, 30000, 50000, 0][i % 5],
      note: ['','お茶のご用意あり。','ご家族3名でご来寺。','読経のみ。','次回ご予約あり。'][i % 5],
      handler: ['寺務員 太郎','寺務員 花子','住職'][i % 3],
    });
  }
  return arr;
}

export const fmtJDate = (d: Date): string => {
  return `${d.getMonth()+1}月${d.getDate()}日(${WEEKDAYS[d.getDay()]})`;
};
export const fmtYen = (n: number): string => n === 0 ? '—' : '¥' + n.toLocaleString();
export const fmtTime = (h: number, m: number): string => `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
export const isToday = (d: Date): boolean => {
  const t = new Date(2026, 4, 11);
  return d.getFullYear() === t.getFullYear() && d.getMonth() === t.getMonth() && d.getDate() === t.getDate();
};
