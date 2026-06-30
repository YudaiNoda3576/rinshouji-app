// 過去帳（memorial register）ドメインの型。

// 法要記録の種別。
export type ServiceKind = 'funeral' | 'memorial';

// 過去帳エントリ（戒名と年忌の記録）。
export interface MemorialEntry {
  id: string;
  kaimyo: string;
  prefix: string;
  name: string;
  rank: string;
  secular: string;
  age: number;
  deceased: string;
  family: string;
  familyId: string;
  relation: string;
  sect: number;
  anniversary: string;
  nextDate: string;
  notes: string;
}

// 法要記録（タイムライン1件分）。
export interface ServiceHistoryItem {
  label: string;
  date: string;
  kind: ServiceKind;
  done: boolean;
}

// 新規登録ダイアログの入力フォーム（onSave で渡す）。
export interface NewMemorialForm {
  prefix: string;
  name: string;
  rank: string;
  secular: string;
  age: string;
  deceased: string;
  family: string;
  relation: string;
  sect: number;
  notes: string;
}
