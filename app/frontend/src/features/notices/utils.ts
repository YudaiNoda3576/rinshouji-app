// 年忌案内の日付フォーマット・残日数計算の純関数。

import { TODAY } from './constants';

export const fmtDate = (iso: string): string => {
  const d = new Date(iso);
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
};

export const fmtMonth = (iso: string): string => {
  const d = new Date(iso);
  return `${d.getFullYear()}年${d.getMonth() + 1}月`;
};

export const daysUntil = (iso: string): number => {
  const t = new Date(iso);
  return Math.round((t.getTime() - TODAY.getTime()) / (1000 * 60 * 60 * 24));
};
