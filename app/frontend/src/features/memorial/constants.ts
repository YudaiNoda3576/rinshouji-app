// 過去帳（memorial register）の定数とサンプルデータ。

import type { MemorialEntry } from './types';

export const KAIMYO_PREFIXES = ['釈', '釈尼', ''];
export const KAIMYO_RANKS = ['居士', '大姉', '信士', '信女', '童子', '童女'];

// 新規登録ダイアログの選択肢（関連檀家）。
export const DIALOG_FAMILIES = [
  '佐藤家',
  '田中家',
  '高橋家',
  '山本家',
  '鈴木家',
  '伊藤家',
  '渡辺家',
  '中村家',
  '小林家',
  '加藤家',
  '吉田家',
  '山田家',
];

// 新規登録ダイアログの選択肢（続柄）。
export const DIALOG_RELATIONS = [
  '戸主',
  '父',
  '母',
  '祖父',
  '祖母',
  '曾祖父',
  '曾祖母',
  '長男',
  '長女',
  '次男',
  '次女',
  '伯父',
  '伯母',
];

// Deterministic dataset of 18 memorial entries
export const MEMORIAL_ENTRIES: MemorialEntry[] = [
  { id: 'K-0019', kaimyo: '釈 浄信 信士',       prefix: '釈',   name: '浄信',     rank: '信士', secular: '佐藤 文蔵',   age: 78, deceased: '2019-06-18', family: '佐藤家', familyId: 'F-0124', relation: '父',     sect: 0, anniversary: '七回忌',     nextDate: '2026-06-18', notes: '生前は寺の世話人を長く務める。' },
  { id: 'K-0022', kaimyo: '釈尼 妙心 大姉',     prefix: '釈尼', name: '妙心',     rank: '大姉', secular: '佐藤 千鶴',   age: 72, deceased: '2013-05-22', family: '佐藤家', familyId: 'F-0124', relation: '母',     sect: 0, anniversary: '十三回忌',   nextDate: '2026-05-22', notes: '十三回忌、本堂にて勤める。' },
  { id: 'K-0027', kaimyo: '釈 道幸 居士',       prefix: '釈',   name: '道幸',     rank: '居士', secular: '高橋 元次郎', age: 84, deceased: '1994-05-29', family: '高橋家', familyId: 'F-0131', relation: '祖父',   sect: 1, anniversary: '三十三回忌', nextDate: '2026-05-29', notes: '三十三回忌、年忌納め予定。' },
  { id: 'K-0034', kaimyo: '釈 浄観 信士',       prefix: '釈',   name: '浄観',     rank: '信士', secular: '田中 正三',   age: 81, deceased: '2014-05-22', family: '田中家', familyId: 'F-0118', relation: '父',     sect: 0, anniversary: '十三回忌',   nextDate: '2026-05-22', notes: '十三回忌、本堂にて勤める。' },
  { id: 'K-0038', kaimyo: '釈尼 妙円 大姉',     prefix: '釈尼', name: '妙円',     rank: '大姉', secular: '伊藤 八重',   age: 89, deceased: '2025-08-04', family: '伊藤家', familyId: 'F-0165', relation: '祖母',   sect: 0, anniversary: '一周忌',     nextDate: '2026-08-04', notes: '初盆を兼ねて勤める。' },
  { id: 'K-0041', kaimyo: '釈 浄安 信士',       prefix: '釈',   name: '浄安',     rank: '信士', secular: '吉田 為三郎', age: 73, deceased: '2010-07-11', family: '吉田家', familyId: 'F-0215', relation: '祖父',   sect: 0, anniversary: '十七回忌',   nextDate: '2026-07-11', notes: '— ' },
  { id: 'K-0045', kaimyo: '釈 道清 居士',       prefix: '釈',   name: '道清',     rank: '居士', secular: '中村 太郎',   age: 76, deceased: '2020-09-02', family: '中村家', familyId: 'F-0182', relation: '父',     sect: 0, anniversary: '七回忌',     nextDate: '2026-09-02', notes: '七回忌、9月初旬に予定。' },
  { id: 'K-0049', kaimyo: '釈尼 妙香 信女',     prefix: '釈尼', name: '妙香',     rank: '信女', secular: '小林 富江',   age: 81, deceased: '2002-04-09', family: '小林家', familyId: 'F-0193', relation: '祖母',   sect: 2, anniversary: '二十五回忌', nextDate: '2026-04-09', notes: '春彼岸に併修。' },
  { id: 'K-0053', kaimyo: '釈 浄真 居士',       prefix: '釈',   name: '浄真',     rank: '居士', secular: '山本 一平',   age: 87, deceased: '1987-10-23', family: '山本家', familyId: 'F-0140', relation: '曾祖父', sect: 1, anniversary: '三十三回忌', nextDate: '2020-10-23', notes: '年忌納め済。' },
  { id: 'K-0058', kaimyo: '釈尼 妙照 信女',     prefix: '釈尼', name: '妙照',     rank: '信女', secular: '山本 トモ',   age: 79, deceased: '2006-03-15', family: '山本家', familyId: 'F-0140', relation: '祖母',   sect: 1, anniversary: '二十一回忌', nextDate: '2026-03-15', notes: '— ' },
  { id: 'K-0062', kaimyo: '釈 道明 信士',       prefix: '釈',   name: '道明',     rank: '信士', secular: '渡辺 庄助',   age: 91, deceased: '1972-11-08', family: '渡辺家', familyId: 'F-0170', relation: '曾祖父', sect: 1, anniversary: '五十回忌',   nextDate: '2022-11-08', notes: '年忌納め済。記録のみ。' },
  { id: 'K-0067', kaimyo: '釈 浄久 信士',       prefix: '釈',   name: '浄久',     rank: '信士', secular: '山田 久蔵',   age: 88, deceased: '1956-12-30', family: '山田家', familyId: 'F-0228', relation: '高祖父', sect: 4, anniversary: '五十回忌',   nextDate: '2006-12-30', notes: '初代戸主。年忌納め済。' },
  { id: 'K-0073', kaimyo: '釈 道俊 居士',       prefix: '釈',   name: '道俊',     rank: '居士', secular: '加藤 俊雄',   age: 72, deceased: '2023-02-11', family: '加藤家', familyId: 'F-0201', relation: '父',     sect: 3, anniversary: '三回忌',     nextDate: '2026-02-11', notes: '三回忌、本年初に勤める。' },
  { id: 'K-0079', kaimyo: '釈尼 妙信 大姉',     prefix: '釈尼', name: '妙信',     rank: '大姉', secular: '鈴木 信子',   age: 84, deceased: '2018-10-04', family: '鈴木家', familyId: 'F-0152', relation: '母',     sect: 2, anniversary: '七回忌',     nextDate: '2024-10-04', notes: '昨年勤め済。' },
  { id: 'K-0084', kaimyo: '釈 浄空 童子',       prefix: '釈',   name: '浄空',     rank: '童子', secular: '佐藤 正彦',   age: 8,  deceased: '1953-04-12', family: '佐藤家', familyId: 'F-0124', relation: '伯父',   sect: 0, anniversary: '七十三回忌', nextDate: '2026-04-12', notes: '幼くして亡くなる。家系記録参照。' },
  { id: 'K-0089', kaimyo: '釈 道源 居士',       prefix: '釈',   name: '道源',     rank: '居士', secular: '田中 源右衛門', age: 80, deceased: '1898-06-04', family: '田中家', familyId: 'F-0118', relation: '高祖父', sect: 0, anniversary: '百二十八回忌', nextDate: '2026-06-04', notes: '田中家中興の祖。' },
  { id: 'K-0094', kaimyo: '釈尼 妙寿 大姉',     prefix: '釈尼', name: '妙寿',     rank: '大姉', secular: '高橋 トシ',   age: 95, deceased: '2024-11-28', family: '高橋家', familyId: 'F-0131', relation: '祖母',   sect: 1, anniversary: '三回忌',     nextDate: '2026-11-28', notes: '三回忌、秋に予定。' },
  { id: 'K-0098', kaimyo: '釈 浄海 信士',       prefix: '釈',   name: '浄海',     rank: '信士', secular: '中村 海三',   age: 69, deceased: '1996-01-19', family: '中村家', familyId: 'F-0182', relation: '祖父',   sect: 0, anniversary: '三十一回忌', nextDate: '2026-01-19', notes: '— ' },
];
