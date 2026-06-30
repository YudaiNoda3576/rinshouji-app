// parishioners（檀家管理）のサンプルデータ・定数・整形ヘルパー。

import type { Member, ParishFamily } from './types';

export const RELATIONS = ['戸主', '妻', '長男', '長女', '次男', '母', '父', '祖母', '祖父', '養子'];
export const KAMON = ['五三桐', '左三巴', '丸に橘', '下り藤', '丸に梅鉢', '違い鷹の羽', '九曜', '蔦', '花菱', '井桁'];
export const ZONES = ['本堂裏', '東墓地', '西墓地', '旧墓地', '新区画'];

export const PARISH_FAMILIES: ParishFamily[] = [
  { id: 'F-0124', name: '佐藤', head: '佐藤 一彦', members: 5, lastVisit: '2026-05-11', joined: 1972, addr: '東京都品川区南品川3-12-4', phone: '03-3458-XXXX', sect: 0, kamon: 0, zone: 0, ancestors: 6, scheduled: '七回忌 (2026-06-18)' },
  { id: 'F-0118', name: '田中', head: '田中 修', members: 3, lastVisit: '2026-04-22', joined: 1965, addr: '東京都品川区北品川1-8-2', phone: '03-3471-XXXX', sect: 0, kamon: 1, zone: 1, ancestors: 4, scheduled: '十三回忌 (2026-05-22)' },
  { id: 'F-0131', name: '高橋', head: '高橋 義信', members: 4, lastVisit: '2026-05-08', joined: 1984, addr: '東京都品川区東大井2-3-15', phone: '03-3762-XXXX', sect: 1, kamon: 2, zone: 0, ancestors: 8, scheduled: '三十三回忌 (2026-05-29)' },
  { id: 'F-0140', name: '山本', head: '山本 道夫', members: 6, lastVisit: '2026-05-04', joined: 1958, addr: '東京都品川区西大井1-1-1', phone: '03-3777-XXXX', sect: 1, kamon: 3, zone: 2, ancestors: 11, scheduled: null },
  { id: 'F-0152', name: '鈴木', head: '鈴木 健一', members: 4, lastVisit: '2026-03-30', joined: 1991, addr: '東京都品川区荏原2-8-9', phone: '03-3782-XXXX', sect: 2, kamon: 4, zone: 1, ancestors: 3, scheduled: null },
  { id: 'F-0165', name: '伊藤', head: '伊藤 京子', members: 2, lastVisit: '2026-02-18', joined: 2003, addr: '東京都品川区戸越4-15-1', phone: '03-3792-XXXX', sect: 0, kamon: 5, zone: 3, ancestors: 5, scheduled: '一周忌 (2026-08-04)' },
  { id: 'F-0170', name: '渡辺', head: '渡辺 静江', members: 3, lastVisit: '2025-12-23', joined: 1948, addr: '東京都品川区平塚1-2-3', phone: '03-3781-XXXX', sect: 1, kamon: 6, zone: 0, ancestors: 14, scheduled: null },
  { id: 'F-0182', name: '中村', head: '中村 純一', members: 5, lastVisit: '2026-04-30', joined: 1977, addr: '東京都品川区豊町3-4-5', phone: '03-3781-XXXX', sect: 0, kamon: 7, zone: 4, ancestors: 7, scheduled: '七回忌 (2026-09-02)' },
  { id: 'F-0193', name: '小林', head: '小林 麗子', members: 4, lastVisit: '2026-03-12', joined: 1988, addr: '東京都品川区中延5-1-22', phone: '03-3783-XXXX', sect: 2, kamon: 8, zone: 1, ancestors: 6, scheduled: null },
  { id: 'F-0201', name: '加藤', head: '加藤 信吾', members: 3, lastVisit: '2026-05-09', joined: 2010, addr: '東京都品川区旗の台2-6-7', phone: '03-3786-XXXX', sect: 3, kamon: 9, zone: 4, ancestors: 2, scheduled: null },
  { id: 'F-0215', name: '吉田', head: '吉田 とき子', members: 2, lastVisit: '2026-04-12', joined: 1960, addr: '東京都品川区小山3-9-1', phone: '03-3781-XXXX', sect: 0, kamon: 0, zone: 0, ancestors: 9, scheduled: '十七回忌 (2026-07-11)' },
  { id: 'F-0228', name: '山田', head: '山田 健作', members: 5, lastVisit: '2026-04-25', joined: 1973, addr: '東京都品川区西品川1-1-1', phone: '03-3450-XXXX', sect: 4, kamon: 1, zone: 2, ancestors: 8, scheduled: null },
];

export function buildMembers(seedName: string): Member[] {
  return [
    { name: seedName + ' 一彦', relation: '戸主', age: 62, deceased: false, status: 'active' },
    { name: seedName + ' 千恵子', relation: '妻', age: 58, deceased: false, status: 'active' },
    { name: seedName + ' 拓也', relation: '長男', age: 32, deceased: false, status: 'active' },
    { name: seedName + ' 美咲', relation: '長女', age: 28, deceased: false, status: 'active' },
    { name: seedName + ' 文蔵', relation: '父', age: null, deceased: true, kaimyo: '釈 浄信 信士', date: '2019-06-18' },
    { name: seedName + ' 千鶴', relation: '母', age: null, deceased: true, kaimyo: '釈尼 妙心 大姉', date: '2013-05-22' },
  ].slice(0, 6);
}

export const daysAgo = (iso: string): number => {
  const t = new Date(2026, 4, 11);
  const d = new Date(iso);
  return Math.round((t.getTime() - d.getTime()) / (24 * 3600 * 1000));
};

export const fmtRelativeDate = (iso: string): string => {
  const days = daysAgo(iso);
  if (days <= 0) return '本日';
  if (days === 1) return '昨日';
  if (days < 7) return days + '日前';
  if (days < 30) return Math.floor(days / 7) + '週間前';
  if (days < 365) return Math.floor(days / 30) + 'ヶ月前';
  return Math.floor(days / 365) + '年以上前';
};
