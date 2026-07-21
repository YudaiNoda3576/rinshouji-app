import { BLANK_A4_PDF } from "@pdfme/common";
import type { Template } from "@pdfme/common";

import { NOTICE_FONT_NAME } from "./font.js";

// 送付状フィールド名。generate() の inputs はこのキーで値を渡す。
export const NOTICE_FIELDS = {
  date: "date",
  temple: "temple",
  postal: "postal",
  address: "address",
  recipient: "recipient",
  body: "body",
} as const;

const FONT_COLOR = "#1a1a1a";

// text スキーマ共通のデフォルト値（@pdfme/schemas の text プラグインが要求する必須項目）。
const textDefaults = {
  type: "text",
  fontName: NOTICE_FONT_NAME,
  alignment: "left" as const,
  verticalAlignment: "top" as const,
  characterSpacing: 0,
  fontColor: FONT_COLOR,
  backgroundColor: "",
  rotate: 0,
  opacity: 1,
};

// 年忌案内 送付状テンプレート（A4縦・単一ページ）。
// 宛名ブロック(〒・住所・戸主名様) + 本文ブロック の2部構成。
// 1件 = 1ページ。複数件は generate() の inputs 配列に1件ずつ積み、同一テンプレートを
// 繰り返し適用することで単一PDFにまとめる（1件1ページ）。
export function buildNoticeTemplate(): Template {
  return {
    basePdf: BLANK_A4_PDF,
    schemas: [
      [
        {
          ...textDefaults,
          name: NOTICE_FIELDS.date,
          content: "",
          position: { x: 130, y: 20 },
          width: 60,
          height: 6,
          fontSize: 10,
          lineHeight: 1,
          alignment: "right",
        },
        {
          ...textDefaults,
          name: NOTICE_FIELDS.temple,
          content: "",
          position: { x: 130, y: 27 },
          width: 60,
          height: 6,
          fontSize: 10,
          lineHeight: 1,
          alignment: "right",
        },
        {
          ...textDefaults,
          name: NOTICE_FIELDS.postal,
          content: "",
          position: { x: 20, y: 45 },
          width: 100,
          height: 6,
          fontSize: 11,
          lineHeight: 1,
        },
        {
          ...textDefaults,
          name: NOTICE_FIELDS.address,
          content: "",
          position: { x: 20, y: 52 },
          width: 140,
          height: 12,
          fontSize: 11,
          lineHeight: 1.4,
        },
        {
          ...textDefaults,
          name: NOTICE_FIELDS.recipient,
          content: "",
          position: { x: 20, y: 68 },
          width: 140,
          height: 12,
          fontSize: 16,
          lineHeight: 1,
        },
        {
          ...textDefaults,
          name: NOTICE_FIELDS.body,
          content: "",
          position: { x: 20, y: 90 },
          width: 170,
          height: 185,
          fontSize: 11,
          lineHeight: 1.9,
        },
      ],
    ],
  };
}
