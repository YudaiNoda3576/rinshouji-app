// ルート横断で使う入力検証ヘルパー。

/**
 * URL パスパラメータの数値 ID を検証する。
 * 正の整数でなければ null を返す（呼び出し側で 400 にする）。
 */
export function parseId(raw: string): number | null {
  if (!/^\d+$/.test(raw)) {
    return null;
  }
  const parsed = Number.parseInt(raw, 10);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : null;
}

/**
 * クエリ文字列の真偽値パラメータ（例: includeInactive=true）を検証する。
 */
export function parseBooleanFlag(raw: string | undefined): boolean {
  return raw === "true";
}

export interface DeathDateInput {
  deathYear?: number | null;
  deathMonth?: number | null;
  deathDay?: number | null;
}

export interface DeathDateResult {
  deathDate: string | null;
  error: string | null;
}

/**
 * death_year/month/day が揃っている場合のみ death_date ('YYYY-MM-DD') を導出する。
 * 実在しない日付（2/30 等）はエラーを返す。年月日のいずれかが欠けている場合は
 * 導出せず null を返す（エラーにはしない）。
 */
export function buildDeathDate(input: DeathDateInput): DeathDateResult {
  const { deathYear, deathMonth, deathDay } = input;
  if (deathYear === null || deathYear === undefined) {
    return { deathDate: null, error: null };
  }
  if (deathMonth === null || deathMonth === undefined) {
    return { deathDate: null, error: null };
  }
  if (deathDay === null || deathDay === undefined) {
    return { deathDate: null, error: null };
  }

  if (
    !Number.isInteger(deathYear) ||
    !Number.isInteger(deathMonth) ||
    !Number.isInteger(deathDay)
  ) {
    return { deathDate: null, error: "没年月日は整数で指定してください" };
  }

  const date = new Date(Date.UTC(deathYear, deathMonth - 1, deathDay));
  const isRealDate =
    date.getUTCFullYear() === deathYear &&
    date.getUTCMonth() === deathMonth - 1 &&
    date.getUTCDate() === deathDay;

  if (!isRealDate) {
    return { deathDate: null, error: "没年月日が実在の日付ではありません" };
  }

  const yyyy = String(deathYear).padStart(4, "0");
  const mm = String(deathMonth).padStart(2, "0");
  const dd = String(deathDay).padStart(2, "0");
  return { deathDate: `${yyyy}-${mm}-${dd}`, error: null };
}
