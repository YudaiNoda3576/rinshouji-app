// 年忌案内のサンプルデータと定数。

import type { NoticeCase, NoticeKaiki, NoticeStatusInfo, NoticeStatusKey } from './types';

export const NOTICE_KAIKI: NoticeKaiki[] = [
  { years: 1,  label: '一周忌' },
  { years: 3,  label: '三回忌' },
  { years: 7,  label: '七回忌' },
  { years: 13, label: '十三回忌' },
  { years: 17, label: '十七回忌' },
  { years: 23, label: '二十三回忌' },
  { years: 27, label: '二十七回忌' },
  { years: 33, label: '三十三回忌' },
  { years: 50, label: '五十回忌' },
];

export const NOTICE_STATUS: Record<NoticeStatusKey, NoticeStatusInfo> = {
  pending:   { label: '未送付', dot: '#9CA3AF', tint: 'hsl(210 11% 96%)', dark: '#4B5563' },
  sent:      { label: '送付済', dot: 'var(--temple-blue)',   tint: 'var(--temple-blue-tint)',   dark: '#1E3A8A' },
  confirmed: { label: '出席確認', dot: 'var(--temple-green)', tint: 'var(--temple-green-tint)',  dark: '#064E3B' },
  declined:  { label: '欠席連絡', dot: 'var(--temple-red)',   tint: 'var(--temple-red-tint)',    dark: '#7F1D1D' },
};

// Today is 2026-05-12 (令和8年). Generate aggregated 年忌 cases.
// Each case = (故人 × 該当する年忌) for 故人 whose 没年 + 年忌歳 falls within selected period.
export const NOTICE_CASES: NoticeCase[] = [
  { id: 'N-001', kaimyo: '釈 浄信 信士',     secular: '佐藤 文蔵',     family: '佐藤家', familyId: 'F-0124', familyHead: '佐藤 一彦',  phone: '03-XXXX-1124', deathDate: '2025-06-18', kaiki: '一周忌',   targetDate: '2026-06-18', priority: 'high',   status: 'sent',      sentVia: 'mail', sentAt: '2026-05-02', responseAt: null,           assignee: '住職' },
  { id: 'N-002', kaimyo: '釈尼 妙心 大姉',   secular: '佐藤 八重',     family: '佐藤家', familyId: 'F-0124', familyHead: '佐藤 一彦',  phone: '03-XXXX-1124', deathDate: '2013-05-22', kaiki: '十三回忌', targetDate: '2026-05-22', priority: 'high',   status: 'confirmed', sentVia: 'mail', sentAt: '2026-04-18', responseAt: '2026-04-22',   assignee: '住職' },
  { id: 'N-003', kaimyo: '釈 浄観 信士',     secular: '田中 久蔵',     family: '田中家', familyId: 'F-0118', familyHead: '田中 圭吾',  phone: '03-XXXX-1118', deathDate: '2013-09-10', kaiki: '十三回忌', targetDate: '2026-09-10', priority: 'medium', status: 'sent',      sentVia: 'mail', sentAt: '2026-04-10', responseAt: null,           assignee: '副住職' },
  { id: 'N-004', kaimyo: '釈 道幸 居士',     secular: '高橋 平太郎',   family: '高橋家', familyId: 'F-0131', familyHead: '高橋 治',    phone: '03-XXXX-2031', deathDate: '1993-11-04', kaiki: '三十三回忌', targetDate: '2026-11-04', priority: 'high',   status: 'pending',   sentVia: null,   sentAt: null,         responseAt: null,           assignee: '主任住職' },
  { id: 'N-005', kaimyo: '釈尼 妙信 大姉',   secular: '鈴木 ナミ',     family: '鈴木家', familyId: 'F-0152', familyHead: '鈴木 健一',  phone: '03-XXXX-2152', deathDate: '2019-08-15', kaiki: '七回忌',   targetDate: '2026-08-15', priority: 'medium', status: 'sent',      sentVia: 'mail', sentAt: '2026-04-25', responseAt: null,           assignee: '住職' },
  { id: 'N-006', kaimyo: '釈 浄水 信士',     secular: '伊藤 茂吉',     family: '伊藤家', familyId: 'F-0165', familyHead: '伊藤 真一',  phone: '03-XXXX-3165', deathDate: '2023-10-30', kaiki: '三回忌',   targetDate: '2026-10-30', priority: 'medium', status: 'pending',   sentVia: null,   sentAt: null,         responseAt: null,           assignee: '住職' },
  { id: 'N-007', kaimyo: '釈 心月 居士',     secular: '山本 茂',       family: '山本家', familyId: 'F-0140', familyHead: '山本 健太',  phone: '03-XXXX-2140', deathDate: '2010-02-08', kaiki: '十七回忌', targetDate: '2026-02-08', priority: 'low',    status: 'confirmed', sentVia: 'mail', sentAt: '2025-12-10', responseAt: '2025-12-18',   assignee: '住職' },
  { id: 'N-008', kaimyo: '釈 智観 信士',     secular: '渡辺 三郎',     family: '渡辺家', familyId: 'F-0177', familyHead: '渡辺 弘',    phone: '03-XXXX-3177', deathDate: '2009-12-05', kaiki: '十七回忌', targetDate: '2026-12-05', priority: 'medium', status: 'pending',   sentVia: null,   sentAt: null,         responseAt: null,           assignee: '副住職' },
  { id: 'N-009', kaimyo: '釈尼 清月 大姉',   secular: '中村 たつ',     family: '中村家', familyId: 'F-0188', familyHead: '中村 良和',  phone: '03-XXXX-4188', deathDate: '1999-07-22', kaiki: '二十七回忌', targetDate: '2026-07-22', priority: 'medium', status: 'sent',      sentVia: 'mail', sentAt: '2026-04-30', responseAt: null,           assignee: '住職' },
  { id: 'N-010', kaimyo: '釈 浄安 信士',     secular: '小林 安治',     family: '小林家', familyId: 'F-0193', familyHead: '小林 雅彦',  phone: '03-XXXX-4193', deathDate: '2019-01-14', kaiki: '七回忌',   targetDate: '2026-01-14', priority: 'low',    status: 'confirmed', sentVia: 'mail', sentAt: '2025-11-22', responseAt: '2025-12-02',   assignee: '副住職' },
  { id: 'N-011', kaimyo: '釈尼 静香 大姉',   secular: '吉田 静江',     family: '吉田家', familyId: 'F-0215', familyHead: '吉田 浩司',  phone: '03-XXXX-5215', deathDate: '2003-04-09', kaiki: '二十三回忌', targetDate: '2026-04-09', priority: 'low',    status: 'declined',  sentVia: 'mail', sentAt: '2026-02-18', responseAt: '2026-02-25',   assignee: '住職' },
  { id: 'N-012', kaimyo: '釈 道仁 居士',     secular: '加藤 仁三郎',   family: '加藤家', familyId: 'F-0202', familyHead: '加藤 隆',    phone: '03-XXXX-5202', deathDate: '1976-09-30', kaiki: '五十回忌', targetDate: '2026-09-30', priority: 'high',   status: 'pending',   sentVia: null,   sentAt: null,         responseAt: null,           assignee: '主任住職' },
  { id: 'N-013', kaimyo: '釈尼 妙音 大姉',   secular: '山田 とき',     family: '山田家', familyId: 'F-0227', familyHead: '山田 正夫',  phone: '03-XXXX-6227', deathDate: '2025-03-12', kaiki: '一周忌',   targetDate: '2026-03-12', priority: 'high',   status: 'confirmed', sentVia: 'mail', sentAt: '2026-01-15', responseAt: '2026-01-20',   assignee: '住職' },
  { id: 'N-014', kaimyo: '釈 浄行 信士',     secular: '高橋 信太郎',   family: '高橋家', familyId: 'F-0131', familyHead: '高橋 治',    phone: '03-XXXX-2031', deathDate: '2023-07-08', kaiki: '三回忌',   targetDate: '2026-07-08', priority: 'medium', status: 'pending',   sentVia: null,   sentAt: null,         responseAt: null,           assignee: '住職' },
  { id: 'N-015', kaimyo: '釈 心観 信士',     secular: '佐藤 良蔵',     family: '佐藤家', familyId: 'F-0124', familyHead: '佐藤 一彦',  phone: '03-XXXX-1124', deathDate: '1993-04-04', kaiki: '三十三回忌', targetDate: '2026-04-04', priority: 'medium', status: 'sent',      sentVia: 'mail', sentAt: '2026-02-08', responseAt: null,           assignee: '住職' },
];

export const TODAY = new Date('2026-05-12');
