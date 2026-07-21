/**
 * 半角カナ→全角カナ変換、および俗名に結合された半角カナの分離。
 */
import { trimAll } from './text.js';

const HALF_TO_FULL: Readonly<Record<string, string>> = {
  ｱ: 'ア', ｲ: 'イ', ｳ: 'ウ', ｴ: 'エ', ｵ: 'オ',
  ｶ: 'カ', ｷ: 'キ', ｸ: 'ク', ｹ: 'ケ', ｺ: 'コ',
  ｻ: 'サ', ｼ: 'シ', ｽ: 'ス', ｾ: 'セ', ｿ: 'ソ',
  ﾀ: 'タ', ﾁ: 'チ', ﾂ: 'ツ', ﾃ: 'テ', ﾄ: 'ト',
  ﾅ: 'ナ', ﾆ: 'ニ', ﾇ: 'ヌ', ﾈ: 'ネ', ﾉ: 'ノ',
  ﾊ: 'ハ', ﾋ: 'ヒ', ﾌ: 'フ', ﾍ: 'ヘ', ﾎ: 'ホ',
  ﾏ: 'マ', ﾐ: 'ミ', ﾑ: 'ム', ﾒ: 'メ', ﾓ: 'モ',
  ﾔ: 'ヤ', ﾕ: 'ユ', ﾖ: 'ヨ',
  ﾗ: 'ラ', ﾘ: 'リ', ﾙ: 'ル', ﾚ: 'レ', ﾛ: 'ロ',
  ﾜ: 'ワ', ｦ: 'ヲ', ﾝ: 'ン',
  ｧ: 'ァ', ｨ: 'ィ', ｩ: 'ゥ', ｪ: 'ェ', ｫ: 'ォ',
  ｬ: 'ャ', ｭ: 'ュ', ｮ: 'ョ', ｯ: 'ッ', ｰ: 'ー',
  '｡': '。', '｢': '「', '｣': '」', '､': '、', '･': '・',
};

const HALF_KANA_RE = /[｡-ﾟ]/;

/** 半角カナ（濁点・半濁点結合を含む）→全角カナ。それ以外の文字は保持。 */
export function halfToFullKana(value: string): string {
  let out = '';
  for (const ch of value) {
    if (ch === 'ﾞ') {
      out = addDakuten(out, '゙');
    } else if (ch === 'ﾟ') {
      out = addDakuten(out, '゚');
    } else {
      out += HALF_TO_FULL[ch] ?? ch;
    }
  }
  return out.normalize('NFC');
}

function addDakuten(out: string, mark: string): string {
  if (out === '') return mark;
  const base = out.slice(0, -1);
  const last = out.slice(-1);
  return `${base}${last}${mark}`;
}

export interface SecularName {
  readonly name: string | null;
  readonly kana: string | null;
  /** 括弧・特殊記号を含み目視確認が望ましい場合 true。 */
  readonly needsReview: boolean;
}

/**
 * 俗名欄の分離。「康一ﾔｽｲﾁ」→ name=康一 / kana=ヤスイチ。
 * 先頭の非半角カナ部分を氏名、末尾の半角カナ列をフリガナとして扱う。
 */
export function splitSecularName(raw: string): SecularName {
  const value = trimAll(raw);
  if (value === '') return { name: null, kana: null, needsReview: false };

  const firstKana = value.search(HALF_KANA_RE);
  if (firstKana === -1) {
    return { name: value, kana: null, needsReview: false };
  }

  const namePart = trimAll(stripBrackets(value.slice(0, firstKana)));
  const kanaPart = trimAll(stripBrackets(value.slice(firstKana)));
  const kana = kanaPart === '' ? null : halfToFullKana(kanaPart);
  const needsReview = /[（(）)]/.test(value);
  return {
    name: namePart === '' ? null : namePart,
    kana,
    needsReview,
  };
}

function stripBrackets(value: string): string {
  return value.replace(/[（(）)]/g, ' ');
}
