/**
 * 故人まわりの小さめの変換（享年、備考仕分け、家番正規化）。
 */
import { extractInt, toHalfWidthDigits, trimAll } from './text.js';

export interface AgeParse {
  readonly value: number | null;
  /** 「？」等で数値化できず NULL にした場合 true。 */
  readonly dropped: boolean;
  /** 「37日」「1年8ヶ月」等、年齢以外の情報として note へ回すべき原文。 */
  readonly noteText: string | null;
}

/**
 * 享年。「54？」→54、「？」「死産」「当才」→NULL。
 * 「37日」「1ヶ月」等の乳児表記は年齢化せず原文を note へ。
 */
export function parseAge(raw: string): AgeParse {
  const value = trimAll(raw);
  if (value === '') return { value: null, dropped: false, noteText: null };

  const half = toHalfWidthDigits(value);
  // 「日・ヶ月・時間・年（複合）」等の期間表記は享年に採用しない。
  if (/[日月年時歳才]/.test(half) && /ヶ月|日|時間|才|当|\d年/.test(half)) {
    // 「54？」のような純粋な数値+記号は下で拾うため、期間語を含む場合のみ note 送り。
    if (/ヶ月|日|時間|当才|当歳/.test(half)) {
      return { value: null, dropped: true, noteText: value };
    }
  }
  const pure = half.match(/^(\d+)\s*[？?]?$/);
  if (pure !== null) {
    return { value: Number.parseInt(pure[1]!, 10), dropped: false, noteText: null };
  }
  if (/^[？?]+$/.test(half) || /死産/.test(half)) {
    return { value: null, dropped: true, noteText: value };
  }
  const n = extractInt(half);
  if (n !== null) {
    return { value: n, dropped: false, noteText: value };
  }
  return { value: null, dropped: true, noteText: value };
}

export interface BikoRouting {
  readonly note: string | null;
  readonly noticeNote: string | null;
  readonly kaimyoNote: string | null;
  /** 複数カテゴリに該当し目視確認が望ましい場合 true。 */
  readonly multiCategory: boolean;
}

const KAIMYO_KEYS = /変体仮名|外字|逆修|戒名|草冠|口二つ|旧字|異体字|離す|変体/;
const NOTICE_KEYS = /案内|喪主/;

/**
 * 過去帳「備考」をキーワードで note / notice_note / kaimyo_note に仕分ける。
 * 機械判別が難しいものは note に集約し multiCategory=true で警告に回す。
 */
export function routeBiko(raw: string): BikoRouting {
  const value = trimAll(raw);
  if (value === '') {
    return { note: null, noticeNote: null, kaimyoNote: null, multiCategory: false };
  }

  const isKaimyo = KAIMYO_KEYS.test(value);
  const isNotice = NOTICE_KEYS.test(value);
  const multi = isKaimyo && isNotice;

  if (multi) {
    // 複数カテゴリは分離が曖昧なため note に集約し警告する。
    return { note: value, noticeNote: null, kaimyoNote: null, multiCategory: true };
  }
  if (isKaimyo) {
    return { note: null, noticeNote: null, kaimyoNote: value, multiCategory: false };
  }
  if (isNotice) {
    return { note: null, noticeNote: value, kaimyoNote: null, multiCategory: false };
  }
  return { note: value, noticeNote: null, kaimyoNote: null, multiCategory: false };
}

export interface HouseNoParse {
  /** legacy_house_no へ格納する正規化値（数字は 4 桁ゼロ詰め、テキストは原文）。 */
  readonly legacy: string | null;
  /** FK 突合キー（数字のみ）。突合不可（8888/削除/空）は null。 */
  readonly matchKey: string | null;
  /** 8888（要ヒアリングの特殊家番）か。 */
  readonly is8888: boolean;
}

/** 過去帳の家番を正規化。末尾「*」除去、削除/離檀/抹消はテキスト保持。 */
export function parseHouseNo(raw: string): HouseNoParse {
  const value = trimAll(raw).replace(/[*＊]+$/, '');
  if (value === '') return { legacy: null, matchKey: null, is8888: false };

  const half = toHalfWidthDigits(value);
  if (/^\d+$/.test(half)) {
    const key = half.padStart(4, '0');
    const is8888 = key === '8888';
    return { legacy: key, matchKey: is8888 ? null : key, is8888 };
  }
  // 削除・離檀・抹消 等のテキスト家番。
  return { legacy: value.slice(0, 10), matchKey: null, is8888: false };
}
