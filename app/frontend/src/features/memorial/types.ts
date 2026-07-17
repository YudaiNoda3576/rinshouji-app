// 過去帳（memorial register）ドメインの型。
// `deceased_persons` API（GET/POST/PUT /api/deceased, GET /api/households）契約に対応する。

// 法要記録の種別（モックタイムライン用）。
export type ServiceKind = 'funeral' | 'memorial';

// 過去帳一覧の1件（GET /api/deceased のレスポンス要素）。
export interface DeceasedListItem {
  id: string;
  householdId: string | null;
  familyName: string | null;
  kaimyo: string;
  secularName: string;
  relationToHead: string | null;
  deathYear: number | null;
  deathMonth: number | null;
  deathDay: number | null;
  deathDate: string | null; // 3項目すべて揃った場合のみ非NULL（ISO日付）
  deathWarekiRaw: string | null;
  ageAtDeath: number | null;
  legacyDistrict1: string | null;
  legacyDistrict2: string | null;
}

// 過去帳詳細（GET /api/deceased/:id のレスポンス。一覧項目 + 詳細専用項目）。
export interface DeceasedDetail extends DeceasedListItem {
  kaimyoNote: string | null;
  secularNameKana: string | null;
  sponsorName: string | null;
  noticeNote: string | null;
  note: string | null;
  legacyHouseNo: string | null;
}

// 檀家セレクト用の最小情報（GET /api/households の要素。他フィールドは無視する）。
export interface HouseholdOption {
  id: string;
  familyName: string;
}

// 新規登録・編集ダイアログのフォーム値（入力は文字列で保持し、送信直前に payload へ変換する）。
export interface DeceasedForm {
  householdId: string | null;
  householdFamilyName: string | null; // 選択中の家名（select 表示専用。null = 関連檀家なし）
  kaimyo: string;
  kaimyoNote: string;
  secularName: string;
  secularNameKana: string;
  deathYear: string;
  deathMonth: string;
  deathDay: string;
  deathWarekiRaw: string;
  ageAtDeath: string;
  sponsorName: string;
  relationToHead: string;
  noticeNote: string;
  note: string;
  legacyDistrict1: string;
  legacyDistrict2: string;
}

// API へ送信する payload（POST /api/deceased, PUT /api/deceased/:id 共通）。
export interface DeceasedPayload {
  householdId?: string | null;
  kaimyo: string;
  kaimyoNote?: string | null;
  secularName: string;
  secularNameKana?: string | null;
  deathYear?: number | null;
  deathMonth?: number | null;
  deathDay?: number | null;
  deathWarekiRaw?: string | null;
  ageAtDeath?: number | null;
  sponsorName?: string | null;
  relationToHead?: string | null;
  noticeNote?: string | null;
  note?: string | null;
  legacyDistrict1?: string | null;
  legacyDistrict2?: string | null;
}

// 法要記録（タイムライン1件分。将来機能までのモック表示）。
export interface ServiceHistoryItem {
  label: string;
  dateLabel: string;
  kind: ServiceKind;
  done: boolean;
}

// 年忌マイルストーン定義（§4.3 の12種）。
export interface AnniversaryMilestone {
  label: string;
  n: number; // 没年からの経過年数
}

// 「次の年忌」導出結果。
export type NextAnniversaryStatus = 'upcoming' | 'done' | 'monthDayUnknown';

export interface NextAnniversary {
  label: string;
  n: number;
  year: number;
  date: string | null; // 月日確定時のみ ISO 日付
  daysUntil: number | null; // 月日確定時のみ、基準日からの日数（負値=経過）
  status: NextAnniversaryStatus;
}

// 没年月日の表示結果（§4.2）。
export interface DeathDateDisplay {
  text: string;
  // 和暦が元号省略表記だった場合の原文注記（詳細画面のみで表示する）。
  warekiOriginalNote?: string;
}
