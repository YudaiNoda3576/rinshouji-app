// visits（お参り記録）ドメインの型。

// Pill / StatusDot で使う配色キー。
export type PillColor = 'blue' | 'purple' | 'green' | 'gray';

// お参りの種別（月命日・年忌法要など）。
export interface VisitKind {
  key: string;
  label: string;
  color: PillColor;
}

// お参りの状態（完了・予定・中止）。
export interface VisitStatus {
  key: string;
  label: string;
  color: PillColor;
}

// 1件のお参り記録。
export interface Visit {
  id: string;
  date: Date;
  hour: number;
  min: number;
  name: string;
  family: string;
  kind: VisitKind;
  status: VisitStatus;
  offering: number;
  note: string;
  handler: string;
}

// 新規登録ダイアログのフォーム値（onSave が受け取る）。
export interface NewVisitForm {
  family: string;
  name: string;
  date: string;
  time: string;
  kind: string;
  offering: string;
  note: string;
}
