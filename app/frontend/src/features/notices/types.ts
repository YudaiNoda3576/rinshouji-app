// 年忌案内ドメインの型。
// NoticeCase は GET /api/notices（過去帳 deceased_persons からの機械導出）のレスポンス契約に対応する。

export type NoticeStatusKey = 'pending' | 'sent' | 'confirmed' | 'declined';

// 案内テンプレート（郵送/メール系のみ。channel 概念は廃止）。
export interface NoticeTemplate {
  id: string;
  name: string;
  body: string;
}

export interface NoticeStatusInfo {
  label: string;
  dot: string;
  tint: string;
  dark: string;
}

// GET /api/notices の1件（故人 × 年忌マイルストーン）。
//
// 【未永続化】送付状態を保存するテーブルは未設計のため、API は常に status='pending'
// （未送付）を返す。画面上の状態変更（送付済・出席確認など）は NoticesPage の
// ローカル state による上書き表示のみで、リロードすると消える。
export interface NoticeCase {
  id: string; // "<deceasedId>-<n>"（故人 × マイルストーンで一意）
  deceasedId: number;
  kaimyo: string;
  secularName: string;
  familyName: string | null; // 孤立故人（関連檀家なし）は null
  householdId: number | null;
  familyHead: string | null; // 世帯主名（household_members role='head'）
  phone: string | null;
  deathDate: string | null; // 年月日が揃う場合のみ 'YYYY-MM-DD'
  deathYear: number;
  deathMonth: number | null;
  deathDay: number | null;
  kaiki: string; // 回忌名（例 '七回忌'）
  targetDate: string | null; // 実施日。没月日欠損時は null（実施年のみ確定）
  targetYear: number; // 実施年 = death_year + n
  status: NoticeStatusKey;
}

export type NoticePeriod = '1y' | '6m' | 'next3m';

export type NoticeStatusFilter = NoticeStatusKey | 'all';

export type NoticeGroupBy = 'month' | 'family' | 'status';
