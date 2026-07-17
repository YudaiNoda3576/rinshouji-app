// 年忌案内の日付フォーマット・残日数計算の純関数。
// （旧モック定数 TODAY への依存は廃止し、実行時の今日を基準にする）

import type { NoticeCase } from './types';

export const fmtDate = (iso: string): string => {
  const d = new Date(iso);
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
};

export const fmtMonth = (iso: string): string => {
  const d = new Date(iso);
  return `${d.getFullYear()}年${d.getMonth() + 1}月`;
};

// 基準日（今日のローカル0時）から iso 日付までの残日数（負値=経過）。
export const daysUntil = (iso: string, today: Date = new Date()): number => {
  const base = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const t = new Date(iso);
  return Math.round((t.getTime() - base.getTime()) / 86_400_000);
};

type DeathDateSource = Pick<NoticeCase, 'deathDate' | 'deathYear' | 'deathMonth' | 'deathDay'>;

// 没年月日の表示（不完全日付は「不詳」表記で補う）。
export const fmtDeathDate = (c: DeathDateSource): string => {
  if (c.deathDate) return fmtDate(c.deathDate);
  if (c.deathMonth != null) return `${c.deathYear}年${c.deathMonth}月（日不詳）`;
  return `${c.deathYear}年（月日不詳）`;
};

type TargetSource = Pick<NoticeCase, 'targetDate' | 'targetYear'>;

// 実施日の表示（没月日欠損の場合は実施年のみ確定＝「月日未定」）。
export const fmtTargetDate = (c: TargetSource): string =>
  c.targetDate ? fmtDate(c.targetDate) : `${c.targetYear}年（月日未定）`;
