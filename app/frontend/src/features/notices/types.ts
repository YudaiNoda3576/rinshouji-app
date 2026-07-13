// 年忌案内ドメインの型。

export type NoticeStatusKey = 'pending' | 'sent' | 'confirmed' | 'declined';

export type NoticePriority = 'high' | 'medium' | 'low';

export type NoticeChannel = 'mail';

// 案内テンプレート（郵送/メール系のみ。channel 概念は廃止）。
export interface NoticeTemplate {
  id: string;
  name: string;
  body: string;
}

export interface NoticeKaiki {
  years: number;
  label: string;
}

export interface NoticeStatusInfo {
  label: string;
  dot: string;
  tint: string;
  dark: string;
}

export interface NoticeCase {
  id: string;
  kaimyo: string;
  secular: string;
  family: string;
  familyId: string;
  familyHead: string;
  phone: string;
  deathDate: string;
  kaiki: string;
  targetDate: string;
  priority: NoticePriority;
  status: NoticeStatusKey;
  sentVia: NoticeChannel | null;
  sentAt: string | null;
  responseAt: string | null;
  assignee: string;
}

export type NoticePeriod = '1y' | '6m' | 'next3m';

export type NoticeStatusFilter = NoticeStatusKey | 'all';

export type NoticeGroupBy = 'month' | 'family' | 'status';
