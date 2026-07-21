// 予定管理 (schedule) ドメインの定数。

import type { DerivedEventKind, EventKind, ScheduleEvent } from './types';

// 既定のイベント種別（schedule + settings で共有）。
export const DEFAULT_EVENT_KINDS: EventKind[] = [
  { key: 'memorial', label: '年忌法要', color: '#7C3AED' },
  { key: 'visit', label: 'お参り', color: '#2563EB' },
  { key: 'service', label: '定期法要', color: '#059669' },
  { key: 'meeting', label: '寺務会議', color: '#DC2626' },
  { key: 'event', label: '行事', color: '#D97706' },
  { key: 'other', label: 'その他', color: '#0891B2' },
];

// 未知の種別に対するフォールバック。
export const FALLBACK_KIND: DerivedEventKind = {
  key: '_',
  label: '—',
  color: '#9CA3AF',
  tint: '#F3F4F6',
  dark: '#374151',
};

export const SCHEDULE_EVENTS_INITIAL: ScheduleEvent[] = [
  { id: 'S-001', date: '2026-05-12', time: '10:30', dur: 60, kind: 'memorial', title: '高橋家 三十三回忌', family: '高橋家', familyId: 'F-0131', kaimyo: '釈 道幸 居士', loc: '本堂', priest: '主任住職', attendees: 8, notes: '年忌納めの予定。なもなく本院で会食。' },
  { id: 'S-002', date: '2026-05-12', time: '14:00', dur: 30, kind: 'visit', title: '佐藤家 月命日参拝', family: '佐藤家', familyId: 'F-0124', kaimyo: '釈 浄信 信士', loc: '墓地', priest: '住職', attendees: 3 },
  { id: 'S-003', date: '2026-05-13', time: '09:00', dur: 90, kind: 'service', title: '朝課', loc: '本堂', priest: '住職・副住職', attendees: 12, recurring: '毎週水曜' },
  { id: 'S-004', date: '2026-05-15', time: '11:00', dur: 60, kind: 'meeting', title: '梳月住職会', loc: '会議室', priest: '住職', attendees: 6, notes: '5月の寺務や年忌進捗を共有。' },
  { id: 'S-005', date: '2026-05-18', time: '13:00', dur: 60, kind: 'meeting', title: '墓地設備工事見積り', loc: '西山墓地', priest: '副住職', attendees: 4 },
  { id: 'S-006', date: '2026-05-20', time: '10:00', dur: 60, kind: 'memorial', title: '田中家 十三回忌', family: '田中家', familyId: 'F-0118', kaimyo: '釈 浄観 信士', loc: '本堂', priest: '住職', attendees: 12 },
  { id: 'S-007', date: '2026-05-22', time: '11:00', dur: 90, kind: 'memorial', title: '佐藤家 十三回忌', family: '佐藤家', familyId: 'F-0124', kaimyo: '釈尼 妙心 大姉', loc: '本堂', priest: '住職', attendees: 6 },
  { id: 'S-008', date: '2026-05-22', time: '15:00', dur: 30, kind: 'visit', title: '伊藤家 お参り', family: '伊藤家', familyId: 'F-0165', priest: '副住職', attendees: 2 },
  { id: 'S-009', date: '2026-05-24', time: '07:00', dur: 60, kind: 'service', title: '朝課 (日曜法座)', loc: '本堂', priest: '住職', attendees: 20 },
  { id: 'S-010', date: '2026-05-25', time: '10:30', dur: 60, kind: 'memorial', title: '鈴木家 七回忌', family: '鈴木家', familyId: 'F-0152', kaimyo: '釈尼 妙信 大姉', loc: '本堂', priest: '住職', attendees: 5 },
  { id: 'S-011', date: '2026-05-27', time: '14:00', dur: 60, kind: 'meeting', title: '檀家総代会', loc: '会議室', priest: '住職', attendees: 15, notes: '令和8年度の予算・行事予定を協議。' },
  { id: 'S-012', date: '2026-05-29', time: '11:00', dur: 90, kind: 'memorial', title: '高橋家 三十三回忌 本勤め', family: '高橋家', familyId: 'F-0131', loc: '本堂', priest: '住職・副住職', attendees: 10 },
  { id: 'S-013', date: '2026-05-31', time: '09:30', dur: 60, kind: 'service', title: '月例会', loc: '本堂', priest: '住職', attendees: 8, recurring: '毎月末日' },
  { id: 'S-014', date: '2026-06-04', time: '10:30', dur: 60, kind: 'memorial', title: '田中家 百二十八回忌', family: '田中家', familyId: 'F-0118', loc: '本堂', priest: '住職', attendees: 4 },
  { id: 'S-015', date: '2026-06-18', time: '10:30', dur: 60, kind: 'memorial', title: '佐藤家 七回忌', family: '佐藤家', familyId: 'F-0124', kaimyo: '釈 浄信 信士', loc: '本堂', priest: '住職', attendees: 8 },
  { id: 'S-016', date: '2026-05-08', time: '10:00', dur: 60, kind: 'visit', title: '吉田家 お参り', family: '吉田家', familyId: 'F-0215', priest: '住職', attendees: 2 },
  { id: 'S-017', date: '2026-05-04', time: '11:30', dur: 60, kind: 'visit', title: '山本家 お参り', family: '山本家', familyId: 'F-0140', priest: '副住職', attendees: 4 },
  // ---- demo: many events on 2026-05-12 to verify scrolling ----
  { id: 'S-018', date: '2026-05-12', time: '07:00', dur: 60, kind: 'service', title: '朝課', loc: '本堂', priest: '住職', attendees: 12, recurring: '毎朝' },
  { id: 'S-019', date: '2026-05-12', time: '08:30', dur: 30, kind: 'meeting', title: '寺務員ミーティング', loc: '会議室', priest: '主任住職', attendees: 5 },
  { id: 'S-020', date: '2026-05-12', time: '09:00', dur: 30, kind: 'visit', title: '中村家 お参り', family: '中村家', familyId: 'F-0182', priest: '副住職', attendees: 2 },
  { id: 'S-021', date: '2026-05-12', time: '09:30', dur: 30, kind: 'visit', title: '加藤家 お参り', family: '加藤家', familyId: 'F-0201', priest: '住職', attendees: 3 },
  { id: 'S-022', date: '2026-05-12', time: '11:45', dur: 30, kind: 'visit', title: '渡辺家 お参り', family: '渡辺家', familyId: 'F-0170', priest: '住職', attendees: 2 },
  { id: 'S-023', date: '2026-05-12', time: '12:30', dur: 60, kind: 'meeting', title: '昼食会 (法話準備)', loc: '客殿', priest: '住職', attendees: 4 },
  { id: 'S-024', date: '2026-05-12', time: '15:00', dur: 45, kind: 'visit', title: '小林家 お参り', family: '小林家', familyId: 'F-0193', priest: '副住職', attendees: 2 },
  { id: 'S-025', date: '2026-05-12', time: '16:00', dur: 60, kind: 'memorial', title: '吉田家 十七回忌 打合せ', family: '吉田家', familyId: 'F-0215', kaimyo: '釈 浄安 信士', loc: '客殿', priest: '住職', attendees: 4, notes: '法要当日の段取りを確認。' },
  { id: 'S-026', date: '2026-05-12', time: '17:30', dur: 30, kind: 'meeting', title: '檀家会 連絡', loc: '会議室', priest: '副住職', attendees: 3 },
  { id: 'S-027', date: '2026-05-12', time: '18:30', dur: 60, kind: 'service', title: '夕勤行', loc: '本堂', priest: '住職', attendees: 8, recurring: '毎夕' },
];

export const MONTH_NAMES = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];

// Day view layout constants
export const DAY_START_HOUR = 7;
export const DAY_END_HOUR = 21;
export const HOUR_PX = 56;
export const TOTAL_HOURS = DAY_END_HOUR - DAY_START_HOUR;

export const TODAY_ISO = '2026-05-12';

// 現在時刻インジケータのモック値（day/week ビュー）。
export const NOW_MOCK_HOUR = 11;
export const NOW_MOCK_MIN = 18;
