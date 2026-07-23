// 環境変数の読み取りを一箇所に集約する。ハードコードを避けるための唯一の参照点。

const DEFAULT_PORT = 3000;

function readPort(): number {
  const raw = process.env.PORT;
  if (raw === undefined || raw === "") {
    return DEFAULT_PORT;
  }
  const parsed = Number.parseInt(raw, 10);
  if (Number.isNaN(parsed) || parsed <= 0) {
    throw new Error(`環境変数 PORT が不正です: "${raw}"`);
  }
  return parsed;
}

function readDatabaseUrl(): string {
  const raw = process.env.DATABASE_URL;
  if (raw === undefined || raw === "") {
    throw new Error("環境変数 DATABASE_URL が未設定です");
  }
  return raw;
}

// Neon 等のマネージド Postgres は TLS 必須のため、DATABASE_SSL=true で SSL 接続を有効化する。
function readDatabaseSsl(): boolean {
  return process.env.DATABASE_SSL === "true";
}

export const env = {
  port: readPort(),
  databaseUrl: readDatabaseUrl(),
  databaseSsl: readDatabaseSsl(),
} as const;
