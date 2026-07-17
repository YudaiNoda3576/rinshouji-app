import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import type { Font } from "@pdfme/common";

// 送付状 PDF に埋め込む和文フォント。
// Noto Serif JP（SIL Open Font License 1.1。同梱・埋め込み自由）を
// app/backend/assets/fonts/ に同梱し、subset: true で使用グリフのみ埋め込む。
// 入手方法・ライセンスの詳細は assets/fonts/OFL.txt 及び実装報告を参照。
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FONT_PATH = path.resolve(__dirname, "../../../assets/fonts/NotoSerifJP-Regular.ttf");

export const NOTICE_FONT_NAME = "NotoSerifJP";

let cachedFont: Font | null = null;

/**
 * pdfme の generate() に渡す Font 設定を返す（初回のみディスクから読み込み、以降はキャッシュ）。
 * fallback: true にすることで、フォント未指定のスキーマや未対応グリフのフォールバック先にもなる。
 */
export function loadNoticeFont(): Font {
  if (cachedFont) {
    return cachedFont;
  }
  const data = readFileSync(FONT_PATH);
  cachedFont = {
    [NOTICE_FONT_NAME]: { data, fallback: true, subset: true },
  };
  return cachedFont;
}
