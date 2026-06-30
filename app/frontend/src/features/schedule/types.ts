// 予定管理 (schedule) ドメインの型定義。

// イベント種別（基本）。
export interface EventKind {
  key: string;
  label: string;
  color: string;
}

// 種別から派生した配色付き種別。
export interface DerivedEventKind extends EventKind {
  tint: string;
  dark: string;
}

// key -> 種別 のマップ。
export type KindMap = Record<string, DerivedEventKind>;

// カレンダー上の予定。
export interface ScheduleEvent {
  id: string;
  date: string;
  time: string;
  dur: number;
  kind: string;
  title: string;
  family?: string;
  familyId?: string;
  kaimyo?: string;
  loc?: string;
  priest?: string;
  attendees?: number;
  notes?: string;
  recurring?: string;
}

// カレンダーの表示モード。
export type ViewMode = 'day' | 'week' | 'month';

// 新規/編集ダイアログのモード。
export type ScheduleDialogMode = 'edit' | 'new';

// ダイアログ内部のフォーム状態。
export interface ScheduleFormValues {
  kind: string;
  title: string;
  date: string;
  time: string;
  endTime: string;
  family: string;
  loc: string;
  priest: string;
  attendees: number;
  notes: string;
}

// onSave に渡されるフォーム（dur を含む）。
export interface NewScheduleForm extends ScheduleFormValues {
  dur: number;
}
