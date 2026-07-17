/**
 * 世帯カラムの enum 正規化・family_name 導出・家族メンバの注記分離。
 */
import { tokenize, trimAll } from './text.js';

const RELATION_TYPES = new Set(['檀家', '信徒', '檀徒', '他寺', 'その他']);

/** 関係区分の正規化。「壇徒」→「檀徒」。想定外値は null。 */
export function normalizeRelationType(raw: string): {
  value: string | null;
  corrected: boolean;
  unknown: boolean;
} {
  const value = trimAll(raw);
  if (value === '') return { value: null, corrected: false, unknown: false };
  if (value === '壇徒') return { value: '檀徒', corrected: true, unknown: false };
  if (RELATION_TYPES.has(value)) return { value, corrected: false, unknown: false };
  return { value: null, corrected: false, unknown: true };
}

const HANNYA = new Set(['組', '郵送', 'なし']);
const SEJIKI = new Set(['組', '郵送', 'なし', '不要']);

/** 般若。組/郵送/なし のみ許容、空・想定外→null。 */
export function normalizeHannya(raw: string): string | null {
  const value = trimAll(raw);
  return HANNYA.has(value) ? value : null;
}

/** 施食。組/郵送/なし/不要 を許容、空・想定外→null。 */
export function normalizeSejiki(raw: string): string | null {
  const value = trimAll(raw);
  return SEJIKI.has(value) ? value : null;
}

export interface IhaiParse {
  readonly value: 'あり' | 'なし' | null;
  /** 「なし「」→なし、「？？」→null 等のゆれ補正をした場合 true。 */
  readonly corrected: boolean;
}

/** 位牌区分。「なし「」→なし、「？？」→NULL。 */
export function normalizeIhai(raw: string): IhaiParse {
  const value = trimAll(raw);
  if (value === '' ) return { value: null, corrected: false };
  if (value === 'あり') return { value: 'あり', corrected: false };
  if (value === 'なし') return { value: 'なし', corrected: false };
  if (value === 'なし「') return { value: 'なし', corrected: true };
  if (value === '？？' || value === '??') return { value: null, corrected: true };
  return { value: null, corrected: true };
}

/**
 * family_name 導出。
 * - 氏名が複数トークン → 先頭トークン（姓）。
 * - 単一トークン／欠損 → 前戸主1〜4 の先頭トークンで補完。
 * - いずれも不能 → null（要目視）。
 */
export function deriveFamilyName(
  fullName: string,
  formerHeads: readonly string[],
): { value: string | null; fromFormer: boolean; needsReview: boolean } {
  const tokens = tokenize(fullName);
  if (tokens.length >= 2) {
    return { value: tokens[0]!, fromFormer: false, needsReview: false };
  }
  for (const former of formerHeads) {
    const ft = tokenize(former);
    if (ft.length >= 2) {
      return { value: ft[0]!, fromFormer: true, needsReview: false };
    }
  }
  return { value: null, fromFormer: false, needsReview: true };
}

export interface FamilyMember {
  readonly name: string;
  readonly note: string | null;
}

/**
 * 家族1 の注記分離。「舘里美（ﾀﾁｻﾄﾐ、健蔵の娘）」→ name=舘里美 / note=注記。
 * 「：」「／」「（」以降を注記として切り出す（姓名自体は分割しない）。
 */
export function splitFamilyMember(raw: string): FamilyMember | null {
  const value = trimAll(raw);
  if (value === '') return null;

  const sep = value.search(/[（(：／]/);
  if (sep === -1) {
    return { name: value, note: null };
  }
  const name = trimAll(value.slice(0, sep));
  const note = trimAll(value.slice(sep).replace(/[（(）)]/g, ' '));
  return {
    name: name === '' ? value : name,
    note: note === '' ? null : note.slice(0, 255),
  };
}
