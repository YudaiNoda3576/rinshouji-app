import { generate } from "@pdfme/generator";
import { text } from "@pdfme/schemas";

import { loadNoticeFont } from "./font.js";
import { buildNoticeTemplate, NOTICE_FIELDS } from "./template.js";
import { buildNoticeVariables, fillTemplate } from "./variables.js";
import type { NoticeAddress, NoticeForPdf } from "./variables.js";

export interface NoticeInputForPdf extends NoticeForPdf {
  householdId: number | null;
}

const EMPTY_ADDRESS: NoticeAddress = { postalCode: null, address1: null, address2: null };

function formatDateLabel(d: Date): string {
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
}

/**
 * 案内配列 + テンプレ本文から、1件1ページの単一PDF(application/pdf相当のバイト列)を生成する。
 * 住所は呼び出し側（route）で householdId から解決済みのマップを渡す。
 */
export async function renderNoticesPdf(
  notices: NoticeInputForPdf[],
  templateBody: string,
  addressByHouseholdId: Map<number, NoticeAddress>,
): Promise<Uint8Array<ArrayBuffer>> {
  const dateLabel = formatDateLabel(new Date());

  const inputs = notices.map((notice) => {
    const address =
      notice.householdId !== null
        ? (addressByHouseholdId.get(notice.householdId) ?? EMPTY_ADDRESS)
        : EMPTY_ADDRESS;
    const vars = buildNoticeVariables(notice, address);

    return {
      [NOTICE_FIELDS.date]: dateLabel,
      [NOTICE_FIELDS.temple]: vars["寺院名"],
      [NOTICE_FIELDS.postal]: address.postalCode ? `〒${address.postalCode}` : "",
      [NOTICE_FIELDS.address]: [address.address1 ?? "", address.address2 ?? ""].join(""),
      [NOTICE_FIELDS.recipient]: `${vars["戸主名"]} 様`,
      [NOTICE_FIELDS.body]: fillTemplate(templateBody, vars),
    };
  });

  return generate({
    template: buildNoticeTemplate(),
    inputs,
    plugins: { text },
    options: { font: loadNoticeFont() },
  });
}
