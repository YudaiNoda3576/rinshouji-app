// 年忌案内テンプレートの変数差し込み。
//
// 変数一覧（9種、二重波括弧 {{ }}）は frontend の
// features/notices/components/TemplateSettingsDialog.tsx の VARS 配列と対応させること。
//   frontend: const VARS = ['{{戸主名}}', '{{戒名}}', '{{俗名}}', '{{法要日}}', '{{年忌}}',
//                            '{{寺院名}}', '{{住職名}}', '{{家名}}', '{{住所}}'];
// フロントは変数の一覧表示のみを担い、実際の置換（変数 -> 実値）はこのファイル（サーバ側）で行う。
// 変数を追加・変更する場合は、必ず TemplateSettingsDialog.tsx の VARS も合わせて更新すること。

// 寺院名・住職名は設定機能が未実装のため、frontend（NoticeDetail.tsx の便箋プレビュー "青苔山
// 浄妙寺" / "住職"）と同じ値を暫定的にハードコードする。設定画面ができ次第、DB/設定値に置き換える。
export const TEMPLE_NAME = "青苔山 浄妙寺";
export const PRIEST_NAME = "住職";

export interface NoticeAddress {
  postalCode: string | null;
  address1: string | null;
  address2: string | null;
}

// POST /api/notices/pdf の body.notices 1件から、変数差し込みに必要な項目のみを抜き出した型。
// frontend の NoticeCase（features/notices/types.ts）のスーパーセットを受け取る想定。
export interface NoticeForPdf {
  kaimyo: string;
  secularName: string;
  familyName: string | null;
  familyHead: string | null;
  kaiki: string;
  targetDate: string | null;
  targetYear: number;
}

// 実施日の表示（frontend の utils.ts fmtTargetDate と同じ規約：月日未定なら「実施年（月日未定）」）。
function formatTargetDate(notice: Pick<NoticeForPdf, "targetDate" | "targetYear">): string {
  if (notice.targetDate === null) {
    return `${notice.targetYear}年（月日未定）`;
  }
  const d = new Date(notice.targetDate);
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
}

// 住所の1行表示（〒付き）。郵便番号・住所ともに無ければ空文字。
function formatAddress(address: NoticeAddress): string {
  const postal = address.postalCode ? `〒${address.postalCode}` : "";
  const lines = [address.address1, address.address2].filter(
    (v): v is string => v !== null && v.trim() !== "",
  );
  const body = lines.join("");
  return [postal, body].filter((v) => v !== "").join(" ");
}

/**
 * NoticeCase(+住所) から、テンプレート変数({{戸主名}} 等)の実値マップを組み立てる。
 * キーは二重波括弧を含まない変数名（例: "戸主名"）。
 */
export function buildNoticeVariables(
  notice: NoticeForPdf,
  address: NoticeAddress,
): Record<string, string> {
  return {
    戸主名: notice.familyHead ?? notice.familyName ?? "ご遺族",
    戒名: notice.kaimyo,
    俗名: notice.secularName,
    法要日: formatTargetDate(notice),
    年忌: notice.kaiki,
    寺院名: TEMPLE_NAME,
    住職名: PRIEST_NAME,
    家名: notice.familyName ?? "",
    住所: formatAddress(address),
  };
}

/**
 * テンプレ本文中の {{変数名}} を実値に置換する。
 * 未知の変数名（VARS に無いもの等）は置換せずそのまま残す（サイレントに消さない）。
 */
export function fillTemplate(body: string, vars: Record<string, string>): string {
  return body.replace(/\{\{\s*([^{}]+?)\s*\}\}/g, (whole, key: string) => {
    const value = vars[key];
    return value !== undefined ? value : whole;
  });
}
