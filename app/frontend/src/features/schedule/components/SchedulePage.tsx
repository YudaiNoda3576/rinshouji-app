// 予定管理 (calendar) — day/week/month views + detail + new dialog

import * as React from 'react';
import { useIsSp } from '@/hooks/useIsSp';
import { WEEKDAYS } from '@/constants/temple';
import { useEventKinds } from '../hooks';
import { MONTH_NAMES, SCHEDULE_EVENTS_INITIAL, TODAY_ISO } from '../constants';
import { kindMapOf, minutesFromTime, parseISO } from '../utils';
import { MonthView } from './MonthView';
import { TimeGridView } from './TimeGridView';
import { ScheduleDetail } from './ScheduleDetail';
import { EventPreviewModal } from './EventPreviewModal';
import { NewScheduleDialog } from './NewScheduleDialog';
import type { ScheduleEvent, ViewMode } from '../types';

interface SchedulePageProps {
  onOpenNew: () => void;
  onOpenSettings: (section: string) => void;
}

interface FilterChip {
  key: string;
  label: string;
  color?: string;
}

const VIEW_OPTIONS: { k: ViewMode; l: string }[] = [
  { k: 'day', l: '日' },
  { k: 'week', l: '週' },
  { k: 'month', l: '月' },
];

export function SchedulePage({ onOpenNew, onOpenSettings }: SchedulePageProps) {
  const kinds = useEventKinds();
  const km = React.useMemo(() => kindMapOf(kinds), [kinds]);
  const isSp = useIsSp();
  const [previewEventId, setPreviewEventId] = React.useState<string | null>(null);
  // anchor date — current week/day/month is computed from this
  const [anchor, setAnchor] = React.useState<Date>(() => parseISO(TODAY_ISO));
  const [view, setView] = React.useState<ViewMode>('week'); // day / week / month
  const [selectedDate, setSelectedDate] = React.useState(TODAY_ISO);
  const [selectedId, setSelectedId] = React.useState('S-001');
  const [kindFilter, setKindFilter] = React.useState('all');
  const [priestFilter, setPriestFilter] = React.useState('all');
  const [events, setEvents] = React.useState<ScheduleEvent[]>(SCHEDULE_EVENTS_INITIAL);

  const PRIESTS = React.useMemo(() => {
    const set = new Set<string>();
    events.forEach((e) => {if (e.priest) set.add(e.priest);});
    return Array.from(set);
  }, [events]);

  // ---------- drag & drop ----------
  const moveEvent = React.useCallback((id: string, newDate: string, newTime?: string) => {
    setEvents((prev) => prev.map((e) => {
      if (e.id !== id) return e;
      const next: ScheduleEvent = { ...e, date: newDate };
      if (newTime) next.time = newTime;
      return next;
    }));
    setSelectedDate(newDate);
    setSelectedId(id);
  }, []);

  // ---------- edit ----------
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const editingEvent = editingId ? events.find((e) => e.id === editingId) : null;
  const updateEvent = React.useCallback((id: string, patch: Partial<ScheduleEvent>) => {
    setEvents((prev) => prev.map((e) => (e.id === id ? { ...e, ...patch } : e)));
  }, []);

  // ---------- helpers ----------
  const eventsForDate = React.useCallback((iso: string) => {
    return events.
    filter((e) => e.date === iso && (
    kindFilter === 'all' || e.kind === kindFilter) && (
    priestFilter === 'all' || e.priest === priestFilter)).
    sort((a, b) => a.time.localeCompare(b.time));
  }, [events, kindFilter, priestFilter]);

  // ---------- range computation ----------
  const range = React.useMemo(() => {
    if (view === 'day') {
      return { start: new Date(anchor), end: new Date(anchor) };
    }
    if (view === 'week') {
      const start = new Date(anchor);
      start.setDate(anchor.getDate() - anchor.getDay()); // Sunday
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      return { start, end };
    }
    // month
    const start = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
    const end = new Date(anchor.getFullYear(), anchor.getMonth() + 1, 0);
    return { start, end };
  }, [anchor, view]);

  // ---------- nav ----------
  const navPrev = () => {
    const d = new Date(anchor);
    if (view === 'day') d.setDate(d.getDate() - 1);else
    if (view === 'week') d.setDate(d.getDate() - 7);else
    d.setMonth(d.getMonth() - 1);
    setAnchor(d);
  };
  const navNext = () => {
    const d = new Date(anchor);
    if (view === 'day') d.setDate(d.getDate() + 1);else
    if (view === 'week') d.setDate(d.getDate() + 7);else
    d.setMonth(d.getMonth() + 1);
    setAnchor(d);
  };
  const goToday = () => {setAnchor(parseISO(TODAY_ISO));setSelectedDate(TODAY_ISO);};

  // ---------- title ----------
  const title = React.useMemo(() => {
    if (view === 'day') {
      return `${anchor.getFullYear()}年 ${MONTH_NAMES[anchor.getMonth()]} ${anchor.getDate()}日 (${WEEKDAYS[anchor.getDay()]})`;
    }
    if (view === 'week') {
      const s = range.start,e = range.end;
      if (s.getMonth() === e.getMonth()) {
        return `${s.getFullYear()}年 ${MONTH_NAMES[s.getMonth()]} ${s.getDate()}日〜${e.getDate()}日`;
      }
      return `${s.getFullYear()}年 ${MONTH_NAMES[s.getMonth()]}${s.getDate()}日〜${MONTH_NAMES[e.getMonth()]}${e.getDate()}日`;
    }
    return `${anchor.getFullYear()}年 ${MONTH_NAMES[anchor.getMonth()]}`;
  }, [anchor, view, range]);

  // ---------- selected event ----------
  const eventsOnSelected = eventsForDate(selectedDate);
  const selectedEvent = events.find((e) => e.id === selectedId) || eventsOnSelected[0] || events[0];

  const filterChips: FilterChip[] = [{ key: 'all', label: 'すべて' }, ...kinds];

  return (
    <div className="page-shell schedule-page">
      <div className="page-head">
        <div>
          <h1>予定管理</h1>
          <p>年忌法要・お参り・定期法要をカレンダーで管理します。</p>
        </div>
        <div className="head-actions">
          <button className="btn ghost" type="button" onClick={goToday}>今日に戻る</button>
          <button className="btn primary" type="button" onClick={onOpenNew}>
            <svg viewBox="0 0 24 24"><line x1="12" x2="12" y1="5" y2="19" /><line x1="5" x2="19" y1="12" y2="12" /></svg>
            予定を追加
          </button>
        </div>
      </div>

      <div className="cal-toolbar">
        <div className="cal-nav">
          <button className="cal-nav-btn" onClick={navPrev} aria-label="前へ"><svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6" /></svg></button>
          <div className="cal-title">{title}</div>
          <button className="cal-nav-btn" onClick={navNext} aria-label="次へ"><svg viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6" /></svg></button>
        </div>
        <div className="cal-view-switch">
          {VIEW_OPTIONS.map((o) =>
          <button key={o.k} className={'cv-btn' + (view === o.k ? ' on' : '')} onClick={() => setView(o.k)}>{o.l}</button>
          )}
        </div>
        <div className="cal-filters">
          {filterChips.map((k) =>
          <button key={k.key} className={'cal-chip' + (kindFilter === k.key ? ' on' : '')} onClick={() => setKindFilter(k.key)}>
              {k.color && <span className="cal-chip-dot" style={{ background: k.color }}></span>}
              {k.label}
            </button>
          )}
        </div>
        <div className="cal-priest-filter">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
          <select value={priestFilter} onChange={(e) => setPriestFilter(e.target.value)}>
            <option value="all">担当者 (すべて)</option>
            {PRIESTS.map((p) =>
            <option key={p} value={p}>{p}</option>
            )}
          </select>
        </div>
      </div>

      <div className="schedule-body">
        <div className="card cal-card">
          {view === 'month' &&
          <MonthView anchor={anchor} km={km} selectedDate={selectedDate} setSelectedDate={setSelectedDate} setSelectedId={setSelectedId} eventsForDate={eventsForDate} moveEvent={moveEvent} isSp={isSp} setPreviewEventId={setPreviewEventId} />
          }
          {view === 'week' &&
          <TimeGridView days={7} startDate={range.start} km={km} selectedDate={selectedDate} setSelectedDate={setSelectedDate} setSelectedId={setSelectedId} selectedId={selectedId} eventsForDate={eventsForDate} moveEvent={moveEvent} isSp={isSp} setPreviewEventId={setPreviewEventId} />
          }
          {view === 'day' &&
          <TimeGridView days={1} startDate={anchor} km={km} selectedDate={selectedDate} setSelectedDate={setSelectedDate} setSelectedId={setSelectedId} selectedId={selectedId} eventsForDate={eventsForDate} moveEvent={moveEvent} isSp={isSp} setPreviewEventId={setPreviewEventId} />
          }
        </div>

        <ScheduleDetail
          date={selectedDate}
          km={km}
          events={eventsOnSelected}
          selectedId={selectedEvent ? selectedEvent.id : null}
          onSelect={(id) => { setSelectedId(id); if (isSp) setPreviewEventId(id); }}
          event={selectedEvent && selectedEvent.date === selectedDate ? selectedEvent : eventsOnSelected[0]}
          onEdit={(e) => setEditingId(e.id)} />

      </div>

      {/* SP専用: 右下フローティング「予定を追加」 */}
      <button className="fab-add" type="button" onClick={onOpenNew} aria-label="予定を追加">
        <svg viewBox="0 0 24 24"><line x1="12" x2="12" y1="5" y2="19"/><line x1="5" x2="19" y1="12" y2="12"/></svg>
      </button>

      {/* SP専用: チップタップで詳細モーダル */}
      {previewEventId && (
        <EventPreviewModal
          event={events.find(e => e.id === previewEventId)}
          km={km}
          onClose={() => setPreviewEventId(null)}
          onEdit={() => { setEditingId(previewEventId); setPreviewEventId(null); }} />
      )}
      {editingEvent && (
        <NewScheduleDialog
          open={true}
          mode="edit"
          initial={editingEvent}
          onClose={() => setEditingId(null)}
          onOpenSettings={onOpenSettings}
          onSave={(form) => {
            const dur = (minutesFromTime(form.endTime) - minutesFromTime(form.time) + 24 * 60) % (24 * 60) || 60;
            updateEvent(editingEvent.id, {
              title: form.title, kind: form.kind, date: form.date, time: form.time, dur,
              family: form.family || undefined, loc: form.loc, priest: form.priest,
              attendees: Number(form.attendees) || undefined, notes: form.notes || undefined,
            });
            setEditingId(null);
          }} />
      )}
    </div>);

}
