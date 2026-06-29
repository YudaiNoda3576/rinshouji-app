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

export const env = {
  port: readPort(),
} as const;
