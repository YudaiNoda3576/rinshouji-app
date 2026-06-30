// 設定画面の定数（ナビゲーション・アイコン・年忌一覧）。

import * as React from 'react';

import type { SettingsNavItem } from './types';

export const SETTINGS_NAV: SettingsNavItem[] = [
  { key: 'temple',     label: '寺院情報',         icon: 'temple' },
  { key: 'services',   label: '法要・お布施',     icon: 'service' },
  { key: 'kinds',      label: '予定種別',         icon: 'kinds' },
  { key: 'templates',  label: '案内テンプレート', icon: 'template' },
  { key: 'staff',      label: '寺務員・権限',     icon: 'staff' },
  { key: 'integration',label: '外部連携',         icon: 'plug' },
  { key: 'notifications', label: '通知設定',      icon: 'bell' },
  { key: 'data',       label: 'データ・バックアップ', icon: 'data' },
  { key: 'security',   label: 'アカウント・セキュリティ', icon: 'lock' },
];

export const SVC_ICON: Record<string, React.ReactElement> = {
  temple: (<svg viewBox="0 0 24 24"><path d="M12 2 L22 6 L12 10 L2 6 Z"/><path d="M4 10 V20 H20 V10"/><path d="M9 14 V20 M15 14 V20"/></svg>),
  service: (<svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>),
  kinds: (<svg viewBox="0 0 24 24"><circle cx="13.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="10.5" r="2.5"/><circle cx="8.5" cy="7.5" r="2.5"/><circle cx="6.5" cy="12.5" r="2.5"/><path d="M12 22a10 10 0 1 1 10-10 4 4 0 0 1-4 4h-2a2 2 0 0 0-1 4 1.5 1.5 0 0 1-1.5 2 8 8 0 0 1-1.5 0"/></svg>),
  template: (<svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" x2="15" y1="13" y2="13"/><line x1="9" x2="15" y1="17" y2="17"/></svg>),
  staff: (<svg viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>),
  plug: (<svg viewBox="0 0 24 24"><path d="M9 2v6M15 2v6"/><path d="M5 8h14v3a7 7 0 0 1-14 0z"/><path d="M12 18v4"/></svg>),
  bell: (<svg viewBox="0 0 24 24"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>),
  data: (<svg viewBox="0 0 24 24"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>),
  lock: (<svg viewBox="0 0 24 24"><rect width="18" height="11" x="3" y="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>),
};

export const KAIKI_YEARS: number[] = [1, 3, 7, 13, 17, 23, 27, 33, 50];
