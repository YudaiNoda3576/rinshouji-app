// parishioners（檀家管理）ドメインの型。

// Pill で使う配色キー。
export type PillColor = 'blue' | 'purple' | 'green' | 'gray';

// 檀家家1件分の情報。
export interface ParishFamily {
  id: string;
  name: string;
  head: string;
  members: number;
  lastVisit: string;
  joined: number;
  addr: string;
  phone: string;
  sect: number;
  kamon: number;
  zone: number;
  ancestors: number;
  scheduled: string | null;
}

// 家族構成の1名分。
export interface Member {
  name: string;
  relation: string;
  age: number | null;
  deceased: boolean;
  status?: string;
  kaimyo?: string;
  date?: string;
}

// 新規檀家登録ダイアログのフォーム値（onSave が受け取る）。
export interface NewParishForm {
  name: string;
  head: string;
  sect: number;
  members: number;
  addr: string;
  phone: string;
  zone: number;
  note: string;
}
