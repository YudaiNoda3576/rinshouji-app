// 予定管理 (schedule) の純関数ユーティリティ。

import { WEEKDAYS } from '@/constants/temple';
import { DAY_START_HOUR, FALLBACK_KIND, HOUR_PX } from './constants';
import type { DerivedEventKind, EventKind, KindMap, ScheduleEvent } from './types';

// 種別から配色（tint / dark）を派生させる。
export function deriveKind(k: EventKind): DerivedEventKind {
  return {
    ...k,
    tint: `color-mix(in oklab, ${k.color} 16%, white)`,
    dark: `color-mix(in oklab, ${k.color} 78%, black)`,
  };
}

export function kindMapOf(kinds: DerivedEventKind[]): KindMap {
  return Object.fromEntries(kinds.map((k) => [k.key, k]));
}

export function getKind(km: KindMap, key: string): DerivedEventKind {
  return km[key] || FALLBACK_KIND;
}

export const isoDate = (y: number, m: number, d: number): string =>
  `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

export const isoFromDate = (d: Date): string => isoDate(d.getFullYear(), d.getMonth(), d.getDate());

export const parseISO = (iso: string): Date => {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
};

export const fmtDateLong = (iso: string): string => {
  const d = parseISO(iso);
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日 (${WEEKDAYS[d.getDay()]})`;
};

export const minutesFromTime = (time: string): number => {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
};

export const addMinutes = (time: string, mins: number): string => {
  const total = minutesFromTime(time) + mins;
  const hh = Math.floor(total / 60) % 24;
  const mm = total % 60;
  return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
};

export const eventTopPx = (time: string): number =>
  ((minutesFromTime(time) - DAY_START_HOUR * 60) / 60) * HOUR_PX;

export const eventHeightPx = (dur: number): number => Math.max(20, (dur / 60) * HOUR_PX);

// 重なり合う予定を列割りして配置情報を返す。
export interface PlacedEvent {
  e: ScheduleEvent;
  leftPct: number;
  widthPct: number;
}

interface LayoutItem {
  e: ScheduleEvent;
  start: number;
  end: number;
}

// Lay out overlapping events: assign each event to a column (greedy) within
// its overlap group, then size width = 100% / max-cols of its group.
export function layoutEvents(events: ScheduleEvent[]): PlacedEvent[] {
  if (!events.length) return [];
  const items: LayoutItem[] = events
    .map((e) => ({ e, start: minutesFromTime(e.time), end: minutesFromTime(e.time) + e.dur }))
    .sort((a, b) => a.start - b.start || a.end - b.end);

  // Build overlap groups
  const groups: LayoutItem[][] = [];
  let cur: LayoutItem[] = [];
  let curEnd = -Infinity;
  for (const it of items) {
    if (it.start < curEnd) {
      cur.push(it);
      curEnd = Math.max(curEnd, it.end);
    } else {
      if (cur.length) groups.push(cur);
      cur = [it];
      curEnd = it.end;
    }
  }
  if (cur.length) groups.push(cur);

  const placed: PlacedEvent[] = [];
  for (const g of groups) {
    const cols: number[] = []; // each col = last end time
    const assignments: { it: LayoutItem; col: number }[] = [];
    for (const it of g) {
      let placedCol = -1;
      for (let i = 0; i < cols.length; i++) {
        if (cols[i] <= it.start) {
          placedCol = i;
          break;
        }
      }
      if (placedCol === -1) {
        cols.push(it.end);
        placedCol = cols.length - 1;
      } else {
        cols[placedCol] = it.end;
      }
      assignments.push({ it, col: placedCol });
    }
    const colCount = cols.length;
    for (const { it, col } of assignments) {
      placed.push({
        e: it.e,
        leftPct: (col / colCount) * 100,
        widthPct: 100 / colCount,
      });
    }
  }
  return placed;
}
