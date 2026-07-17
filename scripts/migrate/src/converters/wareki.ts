/**
 * 和暦日付の解釈。
 * - 墓地入金欄（「42, 6,13」「H3, 5,」「令和6.9.9」等）→ DATE。
 * - 没年月日の DATE 導出（西暦 + 月 + 日が揃う場合のみ）。
 */
import { toHalfWidthDigits, trimAll } from './text.js';

interface EraDef {
  readonly base: number; // 元年に対応する西暦
  readonly max: number; // 元号の最終年（概算）
}

const ERA_BY_LETTER: Readonly<Record<string, EraDef>> = {
  M: { base: 1868, max: 45 },
  T: { base: 1912, max: 15 },
  S: { base: 1926, max: 64 },
  H: { base: 1989, max: 31 },
  R: { base: 2019, max: 99 },
};

const ERA_BY_JP: ReadonlyArray<readonly [RegExp, EraDef]> = [
  [/明治/, ERA_BY_LETTER.M!],
  [/大正/, ERA_BY_LETTER.T!],
  [/昭和/, ERA_BY_LETTER.S!],
  [/平成/, ERA_BY_LETTER.H!],
  [/令和/, ERA_BY_LETTER.R!],
];

export interface PaidOnParse {
  /** YYYY-MM-DD。年月日が揃い妥当な場合のみ。 */
  readonly date: string | null;
  /** 元号省略の西暦≤31年で昭和/平成/令和の判別が曖昧な場合 true。 */
  readonly ambiguous: boolean;
  /** 元号省略のため昭和と仮定して補完した場合 true。 */
  readonly assumedShowa: boolean;
}

/**
 * 墓地入金欄を DATE へ。年月日が揃わない・変換不能なら date=null（原文は別途保持）。
 */
export function parsePaidOn(raw: string): PaidOnParse {
  const value = trimAll(raw);
  if (value === '') return { date: null, ambiguous: false, assumedShowa: false };

  const era = detectEra(value);
  const nums = extractNumbers(value);
  if (nums.length < 3) {
    return { date: null, ambiguous: false, assumedShowa: false };
  }
  const [rawYear, month, day] = nums as [number, number, number];

  let gregorianYear: number;
  let ambiguous = false;
  let assumedShowa = false;
  if (era !== null) {
    gregorianYear = era.base + rawYear - 1;
  } else if (rawYear >= 1900) {
    gregorianYear = rawYear; // 既に西暦
  } else if (rawYear > 31) {
    gregorianYear = ERA_BY_LETTER.S!.base + rawYear - 1; // 昭和確定
    assumedShowa = true;
  } else {
    // 昭和/平成/令和いずれもあり得る。推測せず原文のみ保持。
    return { date: null, ambiguous: true, assumedShowa: false };
  }

  const iso = buildDate(gregorianYear, month, day);
  if (iso === null) return { date: null, ambiguous, assumedShowa: false };
  return { date: iso, ambiguous, assumedShowa };
}

function detectEra(value: string): EraDef | null {
  const upper = value.toUpperCase();
  const letter = upper.match(/[MTSHR]/);
  if (letter !== null) return ERA_BY_LETTER[letter[0]] ?? null;
  for (const [re, def] of ERA_BY_JP) {
    if (re.test(value)) return def;
  }
  return null;
}

function extractNumbers(value: string): number[] {
  const half = toHalfWidthDigits(value).replace(/[MTSHRmtshr平成昭和令和大正明治]/g, ' ');
  return (half.match(/\d+/g) ?? []).map((n) => Number.parseInt(n, 10));
}

/** 年月日が妥当な実在日なら YYYY-MM-DD、そうでなければ null。 */
export function buildDate(
  year: number,
  month: number,
  day: number,
): string | null {
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  const d = new Date(Date.UTC(year, month - 1, day));
  if (
    d.getUTCFullYear() !== year ||
    d.getUTCMonth() !== month - 1 ||
    d.getUTCDate() !== day
  ) {
    return null; // 2/30 等の非実在日
  }
  const mm = String(month).padStart(2, '0');
  const dd = String(day).padStart(2, '0');
  return `${year}-${mm}-${dd}`;
}
