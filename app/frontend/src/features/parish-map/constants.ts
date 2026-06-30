// 檀家地図のサンプルデータ・地図ジオメトリ定数。

import { TEMPLE_SECTS } from '@/constants/temple';
import type { MapDistrict, MapFamily, MapPoint } from './types';

// Stylized lon/lat-ish coords (SVG units 0..1000 x 0..700) within a stylized 品川区 map
export const MAP_FAMILIES: MapFamily[] = [
  { id: 'F-0124', name: '佐藤家', head: '佐藤 一彦',  addr: '南品川3-12-4',  x: 540, y: 420, sect: 0, zone: 0, lastVisit: '2026-05-11', scheduled: '七回忌',     district: '南品川' },
  { id: 'F-0118', name: '田中家', head: '田中 修',    addr: '北品川1-8-2',   x: 600, y: 250, sect: 0, zone: 1, lastVisit: '2026-04-22', scheduled: '十三回忌',   district: '北品川' },
  { id: 'F-0131', name: '高橋家', head: '高橋 義信',  addr: '東大井2-3-15',  x: 720, y: 470, sect: 1, zone: 0, lastVisit: '2026-05-08', scheduled: '三十三回忌', district: '東大井' },
  { id: 'F-0140', name: '山本家', head: '山本 道夫',  addr: '西大井1-1-1',   x: 380, y: 480, sect: 1, zone: 2, lastVisit: '2026-05-04', scheduled: null,         district: '西大井' },
  { id: 'F-0152', name: '鈴木家', head: '鈴木 健一',  addr: '荏原2-8-9',     x: 250, y: 380, sect: 2, zone: 1, lastVisit: '2026-03-30', scheduled: null,         district: '荏原' },
  { id: 'F-0165', name: '伊藤家', head: '伊藤 京子',  addr: '戸越4-15-1',    x: 320, y: 460, sect: 0, zone: 3, lastVisit: '2026-02-18', scheduled: '一周忌',     district: '戸越' },
  { id: 'F-0170', name: '渡辺家', head: '渡辺 静江',  addr: '平塚1-2-3',     x: 290, y: 320, sect: 1, zone: 0, lastVisit: '2025-12-23', scheduled: null,         district: '平塚' },
  { id: 'F-0182', name: '中村家', head: '中村 純一',  addr: '豊町3-4-5',     x: 410, y: 540, sect: 0, zone: 4, lastVisit: '2026-04-30', scheduled: '七回忌',     district: '豊町' },
  { id: 'F-0193', name: '小林家', head: '小林 麗子',  addr: '中延5-1-22',    x: 340, y: 560, sect: 2, zone: 1, lastVisit: '2026-03-12', scheduled: null,         district: '中延' },
  { id: 'F-0201', name: '加藤家', head: '加藤 信吾',  addr: '旗の台2-6-7',   x: 280, y: 580, sect: 3, zone: 4, lastVisit: '2026-05-09', scheduled: null,         district: '旗の台' },
  { id: 'F-0215', name: '吉田家', head: '吉田 とき子',addr: '小山3-9-1',     x: 230, y: 480, sect: 0, zone: 0, lastVisit: '2026-04-12', scheduled: '十七回忌',   district: '小山' },
  { id: 'F-0228', name: '山田家', head: '山田 健作',  addr: '西品川1-1-1',   x: 470, y: 380, sect: 4, zone: 2, lastVisit: '2026-04-25', scheduled: null,         district: '西品川' },
  { id: 'F-0241', name: '森家',   head: '森 弘',      addr: '大井1-14-2',    x: 660, y: 390, sect: 0, zone: 0, lastVisit: '2026-04-08', scheduled: null,         district: '大井' },
  { id: 'F-0247', name: '池田家', head: '池田 美佐',  addr: '勝島2-5-8',     x: 820, y: 410, sect: 0, zone: 1, lastVisit: '2025-11-30', scheduled: null,         district: '勝島' },
  { id: 'F-0253', name: '岡本家', head: '岡本 道久',  addr: '八潮5-2-1',     x: 870, y: 540, sect: 1, zone: 2, lastVisit: '2026-02-04', scheduled: '七回忌',     district: '八潮' },
  { id: 'F-0260', name: '藤田家', head: '藤田 みち',  addr: '東品川4-3-7',   x: 720, y: 320, sect: 0, zone: 0, lastVisit: '2026-05-02', scheduled: null,         district: '東品川' },
  { id: 'F-0266', name: '内田家', head: '内田 剛',    addr: '広町1-2-1',     x: 510, y: 290, sect: 0, zone: 0, lastVisit: '2026-03-22', scheduled: null,         district: '広町' },
  { id: 'F-0274', name: '坂本家', head: '坂本 千恵',  addr: '東五反田2-6-3', x: 460, y: 200, sect: 1, zone: 3, lastVisit: '2026-04-15', scheduled: '三回忌',     district: '東五反田' },
];

// 浄妙寺 (the temple) sits in 南品川
export const TEMPLE_POS: MapPoint = { x: 580, y: 380 };

export const MAP_SECTS = TEMPLE_SECTS;
export const SECT_COLORS: string[] = [
  'var(--temple-purple)',
  'var(--temple-blue)',
  'var(--temple-red)',
  'var(--temple-green)',
  '#B26A00',
];

// Stylized district polygons (very approximate, hand-drawn)
export const DISTRICTS: MapDistrict[] = [
  { name: '北品川',   d: 'M 540 180 L 720 200 L 720 290 L 540 290 Z' },
  { name: '東品川',   d: 'M 720 200 L 840 220 L 870 340 L 720 290 Z' },
  { name: '南品川',   d: 'M 540 290 L 720 290 L 720 420 L 540 420 Z' },
  { name: '大井',     d: 'M 720 290 L 870 340 L 870 460 L 720 420 Z' },
  { name: '勝島',     d: 'M 870 340 L 940 380 L 920 470 L 870 460 Z' },
  { name: '八潮',     d: 'M 870 460 L 920 470 L 920 580 L 820 600 Z' },
  { name: '西大井',   d: 'M 320 410 L 470 420 L 470 540 L 320 540 Z' },
  { name: '荏原・戸越',d: 'M 180 320 L 320 320 L 320 540 L 180 540 Z' },
  { name: '中延・旗の台',d: 'M 180 540 L 470 540 L 470 620 L 200 620 Z' },
  { name: '小山',     d: 'M 180 410 L 320 410 L 320 540 L 180 540 Z' },
  { name: '東大井',   d: 'M 540 420 L 720 420 L 720 530 L 540 530 Z' },
  { name: '広町',     d: 'M 470 240 L 540 240 L 540 320 L 470 320 Z' },
  { name: '東五反田', d: 'M 380 170 L 540 180 L 540 240 L 380 240 Z' },
];

// Major roads
export const ROADS: string[] = [
  'M 100 380 L 940 380',          // 山手通り (east-west)
  'M 470 60 L 470 660',           // 第一京浜 (north-south)
  'M 100 480 L 920 510',           // 中原街道
  'M 720 60 L 720 660',           // 国道15号
];

// Tokyo Bay shoreline (right edge)
export const SHORE = 'M 940 60 L 940 660 L 1000 660 L 1000 60 Z';
// 目黒川 (river — meandering)
export const RIVER = 'M 100 200 Q 300 240 460 280 Q 600 320 760 320 Q 880 320 940 300';
