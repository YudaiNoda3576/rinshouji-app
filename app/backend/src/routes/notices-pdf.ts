import { Hono } from "hono";
import { pool } from "../db.js";
import { renderNoticesPdf } from "../lib/pdf/render.js";
import type { NoticeInputForPdf } from "../lib/pdf/render.js";
import type { NoticeAddress } from "../lib/pdf/variables.js";

// POST /api/notices/pdf 専用ルート。notices.ts（参照系のみ）とはファイルを分ける。
export const noticesPdfRoute = new Hono();

const MAX_NOTICES = 500; // 一括生成の上限（無制限な負荷を避けるための上限）。

interface NoticePdfRequestBody {
  notices?: unknown;
  templateBody?: unknown;
}

function asStringOrNull(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

function asNonEmptyString(value: unknown): string | null {
  return typeof value === "string" && value !== "" ? value : null;
}

/**
 * リクエスト body の notices[] 1件を検証し、PDF 生成に必要な形へ変換する。
 * frontend の NoticeCase（features/notices/types.ts）と契約が一致すること。
 * 不正な要素があれば null を返す（呼び出し側で 400 にする）。
 */
function parseNoticeInput(raw: unknown): NoticeInputForPdf | null {
  if (typeof raw !== "object" || raw === null) {
    return null;
  }
  const r = raw as Record<string, unknown>;

  const kaimyo = asNonEmptyString(r.kaimyo);
  const secularName = asNonEmptyString(r.secularName);
  const kaiki = asNonEmptyString(r.kaiki);
  if (kaimyo === null || secularName === null || kaiki === null) {
    return null;
  }

  const familyName = asStringOrNull(r.familyName);
  const familyHead = asStringOrNull(r.familyHead);
  const targetDate = asStringOrNull(r.targetDate);

  const targetYearRaw = r.targetYear;
  if (typeof targetYearRaw !== "number" || !Number.isInteger(targetYearRaw)) {
    return null;
  }

  const householdIdRaw = r.householdId;
  let householdId: number | null = null;
  if (householdIdRaw !== null && householdIdRaw !== undefined) {
    if (typeof householdIdRaw !== "number" || !Number.isInteger(householdIdRaw) || householdIdRaw <= 0) {
      return null;
    }
    householdId = householdIdRaw;
  }

  return {
    kaimyo,
    secularName,
    familyName,
    familyHead,
    kaiki,
    targetDate,
    targetYear: targetYearRaw,
    householdId,
  };
}

// ---------------------------------------------------------------------
// POST /api/notices/pdf
//   body: { notices: NoticeCase[], templateBody: string }
//   1件1ページの単一 PDF(application/pdf) を返す。
//   住所は notices に含まれないため、householdId から households を補完する。
// ---------------------------------------------------------------------
noticesPdfRoute.post("/pdf", async (c) => {
  let body: NoticePdfRequestBody;
  try {
    body = (await c.req.json()) as NoticePdfRequestBody;
  } catch {
    return c.json({ error: "リクエストボディが不正です" }, 400);
  }

  if (!Array.isArray(body.notices) || body.notices.length === 0) {
    return c.json({ error: "notices は1件以上の配列で指定してください" }, 400);
  }
  if (body.notices.length > MAX_NOTICES) {
    return c.json({ error: `notices は最大${MAX_NOTICES}件までです` }, 400);
  }
  if (typeof body.templateBody !== "string") {
    return c.json({ error: "templateBody は文字列で指定してください" }, 400);
  }

  const notices: NoticeInputForPdf[] = [];
  for (const raw of body.notices) {
    const parsed = parseNoticeInput(raw);
    if (parsed === null) {
      return c.json({ error: "notices の要素に不正な項目があります" }, 400);
    }
    notices.push(parsed);
  }

  const householdIds = [...new Set(notices.map((n) => n.householdId).filter((id): id is number => id !== null))];

  const addressByHouseholdId = new Map<number, NoticeAddress>();
  if (householdIds.length > 0) {
    const { rows } = await pool.query(
      `SELECT id, postal_code, address_1, address_2 FROM households WHERE id = ANY($1::bigint[])`,
      [householdIds],
    );
    for (const row of rows) {
      addressByHouseholdId.set(Number(row.id), {
        postalCode: row.postal_code,
        address1: row.address_1,
        address2: row.address_2,
      });
    }
  }

  const pdf = await renderNoticesPdf(notices, body.templateBody, addressByHouseholdId);

  return c.body(pdf, 200, {
    "Content-Type": "application/pdf",
    "Content-Disposition": 'attachment; filename="notices.pdf"',
  });
});
