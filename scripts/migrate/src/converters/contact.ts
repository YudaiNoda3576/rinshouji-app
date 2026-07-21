/**
 * 連絡先（電話・携帯・郵便番号）のクレンジング。
 */
import { toHalfWidthDigits, trimAll } from './text.js';

const FULLY_INVALID = /^[?*？＊]+$/;
const HAS_INVALID_MARK = /[?*？＊]/;

export interface CleanResult {
  readonly value: string | null;
  /** 完全無効値で NULL 化した場合 true。 */
  readonly invalid: boolean;
  /** 部分欠損等で原文を保持した場合 true。 */
  readonly kept: boolean;
}

/**
 * 固定電話。「***」「???」等の完全無効→NULL、部分欠損（?混じり）→原文保持。
 * 改行や併記で複数番号が入り 20 桁を超える場合は先頭の番号のみ採用する
 * （原文は import_records.raw_data に残るため喪失しない）。
 */
export function cleanPhone(raw: string): CleanResult {
  const value = trimAll(raw);
  if (value === '') return { value: null, invalid: false, kept: false };
  if (FULLY_INVALID.test(value)) return { value: null, invalid: true, kept: false };

  if (value.length > 20 || /[\n\r]/.test(value)) {
    const m = toHalfWidthDigits(value).match(/\d[\d-]*\d/);
    const first = m !== null ? m[0] : value;
    return { value: first.slice(0, 20), invalid: false, kept: true };
  }
  if (HAS_INVALID_MARK.test(value)) return { value, invalid: false, kept: true };
  return { value, invalid: false, kept: false };
}

export interface MobileResult {
  readonly value: string | null;
  /** prefix 除去・複数番号から主番号抽出等、原文から整形した場合 true。 */
  readonly altered: boolean;
}

/**
 * 携帯電話。「恭広：090-…」の名前 prefix を除去し、「／」区切りの複数番号は
 * 主（先頭）番号を採用する。番号を抽出できない場合は原文を保持。
 */
export function cleanMobile(raw: string): MobileResult {
  const value = trimAll(raw);
  if (value === '') return { value: null, altered: false };

  const first = value.split(/[／/]/)[0] ?? value;
  const afterPrefix = first.includes('：')
    ? first.slice(first.lastIndexOf('：') + 1)
    : first.includes(':')
      ? first.slice(first.lastIndexOf(':') + 1)
      : first;

  const numberMatch = toHalfWidthDigits(afterPrefix).match(/[\d](?:[\d-]*\d)?/);
  if (numberMatch === null) {
    return { value, altered: false };
  }
  const cleaned = numberMatch[0];
  return { value: cleaned, altered: cleaned !== value };
}

/**
 * 郵便番号。全角数字→半角、7 桁は XXX-XXXX へ整形。
 * 数字を含まない「***」「???」→NULL、部分値（「486-」等）は原文保持。
 */
export function cleanPostal(raw: string): CleanResult {
  const value = trimAll(raw);
  if (value === '') return { value: null, invalid: false, kept: false };

  const half = toHalfWidthDigits(value);
  if (!/\d/.test(half)) return { value: null, invalid: true, kept: false };

  const digits = half.replace(/[^\d]/g, '');
  if (digits.length === 7) {
    return { value: `${digits.slice(0, 3)}-${digits.slice(3)}`, invalid: false, kept: false };
  }
  if (/^\d{3}-\d{4}$/.test(half)) {
    return { value: half, invalid: false, kept: false };
  }
  return { value: half, invalid: false, kept: true };
}
