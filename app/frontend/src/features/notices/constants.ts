// 年忌案内の表示定数。
// （旧モックデータ NOTICE_CASES / TODAY は API 接続化に伴い削除。データは GET /api/notices から取得する）

import type { NoticeStatusInfo, NoticeStatusKey } from './types';

export const NOTICE_STATUS: Record<NoticeStatusKey, NoticeStatusInfo> = {
  pending:   { label: '未送付', dot: '#9CA3AF', tint: 'hsl(210 11% 96%)', dark: '#4B5563' },
  sent:      { label: '送付済', dot: 'var(--temple-blue)',   tint: 'var(--temple-blue-tint)',   dark: '#1E3A8A' },
  confirmed: { label: '出席確認', dot: 'var(--temple-green)', tint: 'var(--temple-green-tint)',  dark: '#064E3B' },
  declined:  { label: '欠席連絡', dot: 'var(--temple-red)',   tint: 'var(--temple-red-tint)',    dark: '#7F1D1D' },
};
