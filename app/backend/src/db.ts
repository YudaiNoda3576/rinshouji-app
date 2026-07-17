import { Pool, types } from "pg";
import { env } from "./config/env.js";

// DATE 列 (OID 1082) はサーバーのローカルタイムゾーンに依存する Date オブジェクトへ
// 変換されると日付がずれる恐れがあるため、'YYYY-MM-DD' の文字列のまま受け取る。
types.setTypeParser(1082, (value: string) => value);

// PostgreSQL 接続プール。アプリ全体で単一のプールを共有する。
export const pool = new Pool({ connectionString: env.databaseUrl });

/**
 * BIGINT/BIGSERIAL 列は node-postgres が精度保持のため文字列で返すため、
 * API 応答（JSON の数値）へ変換するための共通ヘルパー。
 * null/undefined はそのまま null を返す。
 */
export function toNum(value: string | number | null | undefined): number | null {
  if (value === null || value === undefined) {
    return null;
  }
  return typeof value === "number" ? value : Number(value);
}
