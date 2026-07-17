/**
 * 施主欄の「氏名 + 続柄」分割。
 * 標準形は 3 トークン（姓 名 続柄）。末尾トークンを故人続柄として切り出す。
 */
import { tokenize, trimAll } from './text.js';

/** 続柄として認識する語彙（過去帳実データの末尾トークンから採録）。 */
export const RELATION_WORDS: ReadonlySet<string> = new Set([
  '父', '母', '妻', '夫', '祖父', '祖母', '曾祖父', '曾祖母',
  '養父', '養母', '養祖父', '養祖母', '義父', '義母', '舅', '姑',
  '子', '息子', '娘', '倅', '長男', '次男', '二男', '三男', '四男', '五男',
  '長女', '次女', '二女', '三女', '四女', '孫', '曾孫',
  '兄', '弟', '姉', '妹', '義兄', '義弟', '義姉', '義妹',
  '伯父', '伯母', '叔父', '叔母', '甥', '姪',
  '従兄', '従弟', '従姉', '従妹', '養子', '嫁', '婿',
  '妻の母', '妻の父', '夫の母', '夫の父', 'こと', '方', '姉の子',
]);

export type SponsorStatus = 'ok' | 'uncertain' | 'no-relation' | 'unsplittable';

export interface SponsorParse {
  readonly name: string | null;
  readonly relation: string | null;
  readonly status: SponsorStatus;
}

/**
 * - 末尾トークンが続柄語彙 → 分割（status=ok）。
 * - 3 トークン以上で末尾が語彙外 → 続柄と推定し分割（status=uncertain・要確認）。
 * - 2 トークンで末尾が語彙外 → 続柄なしの姓名とみなす（status=no-relation）。
 * - 1 トークン（スペースなし）→ 分割不能（status=unsplittable）。
 * 氏名はスペースを除いて連結する（例「河合　博元」→「河合博元」）。
 */
export function splitSponsor(raw: string): SponsorParse {
  const value = trimAll(raw);
  if (value === '') return { name: null, relation: null, status: 'no-relation' };

  const tokens = tokenize(value);
  if (tokens.length === 1) {
    return { name: value, relation: null, status: 'unsplittable' };
  }

  const last = tokens[tokens.length - 1]!;
  const head = tokens.slice(0, -1).join('');

  if (RELATION_WORDS.has(last)) {
    return { name: head, relation: last, status: 'ok' };
  }
  if (tokens.length >= 3) {
    return { name: head, relation: last, status: 'uncertain' };
  }
  return { name: tokens.join(''), relation: null, status: 'no-relation' };
}
