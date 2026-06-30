// 設定 (settings) ドメインの型定義。

// 設定ナビゲーションの項目。
export interface SettingsNavItem {
  key: string;
  label: string;
  icon: string;
}

// 各セクション共通の props。
export interface SectionProps {
  onChange: () => void;
}

// 予定種別（設定画面で編集する形）。schedule の種別ストアと構造互換。
export interface SettingsEventKind {
  key: string;
  label: string;
  color: string;
  tint?: string;
  dark?: string;
  builtin?: boolean;
}

// 寺院情報フォーム。開山年は編集により文字列化されうる。
export interface TempleInfo {
  name: string;
  nameKana: string;
  sect: string;
  abbot: string;
  founded: string | number;
  zip: string;
  addr: string;
  phone: string;
  fax: string;
  email: string;
  web: string;
}

// 法要種別の行。数値項目は編集により文字列化されうる。
export interface ServiceRow {
  name: string;
  fuse: string;
  duration: string | number;
  slot: string | number;
}

// 案内テンプレートのチャンネル。
export type TemplateChannel = 'mail' | 'line';

// 案内テンプレート。
export interface TemplateItem {
  id: string;
  name: string;
  channel: TemplateChannel;
}

// 寺務員の権限。
export type StaffPerm = 'admin' | 'staff' | 'readonly';

// 寺務員。
export interface StaffMember {
  name: string;
  role: string;
  email: string;
  perm: StaffPerm;
  last: string;
}

// 権限の表示情報。
export interface StaffRoleInfo {
  label: string;
  color: string;
  tint: string;
}

// 外部連携の状態。
export type IntegrationStatus = 'connected' | 'off';

// 外部連携アイコンの種別。
export type IntegrationIcon = 'line' | 'mail' | 'map' | 'cal';

// 通知設定。
export interface NotificationSettings {
  todayVisits: boolean;
  upcomingKaiki: boolean;
  responseAlert: boolean;
  weeklyReport: boolean;
  method: string;
  digestTime: string;
}
