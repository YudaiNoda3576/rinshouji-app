/**
 * 漢数字→数値変換（過去帳の月・日向け。1〜31 の範囲を想定）。
 */
import { toHalfWidthDigits, trimAll } from './text.js';

const DIGIT: Readonly<Record<string, number>> = {
  〇: 0, 零: 0, 一: 1, 二: 2, 三: 3, 四: 4, 五: 5,
  六: 6, 七: 7, 八: 8, 九: 9,
};

/**
 * 「十七」→17、「二十三」→23、「三十」→30 のような 1〜99 の漢数字を数値化。
 * 半角/全角アラビア数字もそのまま解釈する。判別不能は null。
 */
export function parseKanjiNumber(raw: string): number | null {
  const value = trimAll(raw);
  if (value === '') return null;

  const arabic = toHalfWidthDigits(value);
  if (/^\d+$/.test(arabic)) {
    return Number.parseInt(arabic, 10);
  }

  if (!/^[〇零一二三四五六七八九十]+$/.test(value)) {
    return null;
  }
  return parsePureKanji(value);
}

function parsePureKanji(value: string): number | null {
  const tenIndex = value.indexOf('十');
  if (tenIndex === -1) {
    // 十を含まない: 一桁の並び（通常 1 文字）。
    return sumDigits(value);
  }

  const tensPart = value.slice(0, tenIndex);
  const onesPart = value.slice(tenIndex + 1);
  const tens = tensPart === '' ? 1 : (DIGIT[tensPart] ?? null);
  if (tens === null) return null;

  let ones = 0;
  if (onesPart !== '') {
    const o = sumDigits(onesPart);
    if (o === null) return null;
    ones = o;
  }
  return tens * 10 + ones;
}

function sumDigits(value: string): number | null {
  let acc = 0;
  for (const ch of value) {
    const d = DIGIT[ch];
    if (d === undefined) return null;
    acc = acc * 10 + d;
  }
  return acc;
}

export interface MonthDayParse {
  readonly value: number | null;
  /** 「十一　十七」等の複数値が入っていた場合 true（先頭を採用）。 */
  readonly multiple: boolean;
  /** 変換不能（干支表記等）の場合 true。 */
  readonly unparsable: boolean;
}

/**
 * 月・日欄の解釈。全角スペース区切りで複数値が入る場合は先頭を採用し multiple=true。
 */
export function parseMonthOrDay(raw: string): MonthDayParse {
  const value = trimAll(raw);
  if (value === '') {
    return { value: null, multiple: false, unparsable: false };
  }
  const tokens = value.split(/[\s　]+/).filter((t) => t !== '');
  const multiple = tokens.length > 1;
  const head = tokens[0] ?? '';
  const parsed = parseKanjiNumber(head);
  return {
    value: parsed,
    multiple,
    unparsable: parsed === null,
  };
}
