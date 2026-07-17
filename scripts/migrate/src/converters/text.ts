/**
 * 文字列正規化の基礎ヘルパ。
 * すべて非破壊（入力を書き換えず新しい文字列を返す）。
 */

/** 全角数字→半角数字。 */
export function toHalfWidthDigits(value: string): string {
  return value.replace(/[０-９]/g, (ch) =>
    String.fromCharCode(ch.charCodeAt(0) - 0xfee0),
  );
}

/** 全角英字→半角英字（墓地区分コード等の判定補助）。 */
export function toHalfWidthAlnum(value: string): string {
  return toHalfWidthDigits(value).replace(/[Ａ-Ｚａ-ｚ]/g, (ch) =>
    String.fromCharCode(ch.charCodeAt(0) - 0xfee0),
  );
}

/** 前後空白（全角スペース含む）を除去。 */
export function trimAll(value: string | null | undefined): string {
  return (value ?? '').replace(/^[\s　]+|[\s　]+$/g, '');
}

/** 実質空（トリム後に空文字）か。 */
export function isBlank(value: string | null | undefined): boolean {
  return trimAll(value) === '';
}

/** 全角/半角スペース区切りでトークン分割（空要素除去）。 */
export function tokenize(value: string): string[] {
  return trimAll(value)
    .split(/[\s　]+/)
    .filter((t) => t !== '');
}

/** 文字列から最初の整数を抽出（全角対応）。無ければ null。 */
export function extractInt(value: string): number | null {
  const m = toHalfWidthDigits(value).match(/-?\d+/);
  if (m === null) return null;
  const n = Number.parseInt(m[0], 10);
  return Number.isNaN(n) ? null : n;
}
