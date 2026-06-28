// schedule.jsx — 予定管理 (calendar) — day/week/month views + detail + new dialog

// Shared event-kind store: live across pages (schedule + settings).
// Stored on window so settings.jsx can read/write the same instance.
const DEFAULT_EVENT_KINDS = [
{ key: 'memorial', label: '年忌法要', color: '#7C3AED' },
{ key: 'visit', label: 'お参り', color: '#2563EB' },
{ key: 'service', label: '定期法要', color: '#059669' },
{ key: 'meeting', label: '寺務会議', color: '#DC2626' },
{ key: 'event', label: '行事', color: '#D97706' },
{ key: 'other', label: 'その他', color: '#0891B2' }];

function deriveKind(k) {
  return {
    ...k,
    tint: `color-mix(in oklab, ${k.color} 16%, white)`,
    dark: `color-mix(in oklab, ${k.color} 78%, black)`
  };
}
if (!window.__eventKinds) window.__eventKinds = DEFAULT_EVENT_KINDS.map(deriveKind);
window.getEventKinds = () => window.__eventKinds;
window.setEventKinds = (arr) => {
  window.__eventKinds = arr.map(deriveKind);
  window.dispatchEvent(new CustomEvent('event-kinds-changed'));
};
function useEventKinds() {
  const [kinds, setKinds] = React.useState(window.__eventKinds);
  React.useEffect(() => {
    const h = () => setKinds([...window.__eventKinds]);
    window.addEventListener('event-kinds-changed', h);
    return () => window.removeEventListener('event-kinds-changed', h);
  }, []);
  return kinds;
}
window.useEventKinds = useEventKinds;

function kindMapOf(kinds) {return Object.fromEntries(kinds.map((k) => [k.key, k]));}
const FALLBACK_KIND = { key: '_', label: '—', color: '#9CA3AF', tint: '#F3F4F6', dark: '#374151' };
function getKind(km, key) {return km[key] || FALLBACK_KIND;}

const SCHEDULE_EVENTS_INITIAL = [
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
{ id: 'S-027', date: '2026-05-12', time: '18:30', dur: 60, kind: 'service', title: '夕勤行', loc: '本堂', priest: '住職', attendees: 8, recurring: '毎夕' }];


const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土'];
const MONTH_NAMES = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];

// Day view layout constants
const DAY_START_HOUR = 7;
const DAY_END_HOUR = 21;
const HOUR_PX = 56;
const TOTAL_HOURS = DAY_END_HOUR - DAY_START_HOUR;

const isoDate = (y, m, d) => `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
const isoFromDate = (d) => isoDate(d.getFullYear(), d.getMonth(), d.getDate());
const parseISO = (iso) => {const [y, m, d] = iso.split('-').map(Number);return new Date(y, m - 1, d);};
const fmtDateLong = (iso) => {const d = parseISO(iso);return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日 (${WEEKDAYS[d.getDay()]})`;};
const TODAY_ISO = '2026-05-12';

const minutesFromTime = (time) => {const [h, m] = time.split(':').map(Number);return h * 60 + m;};
const addMinutes = (time, mins) => {
  const total = minutesFromTime(time) + mins;
  const hh = Math.floor(total / 60) % 24;
  const mm = total % 60;
  return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
};
const eventTopPx = (time) => (minutesFromTime(time) - DAY_START_HOUR * 60) / 60 * HOUR_PX;
const eventHeightPx = (dur) => Math.max(20, dur / 60 * HOUR_PX);

function useIsSp(breakpoint = 640) {
  const [isSp, setIsSp] = React.useState(() => typeof window !== 'undefined' && window.matchMedia(`(max-width: ${breakpoint}px)`).matches);
  React.useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint}px)`);
    const h = (e) => setIsSp(e.matches);
    mq.addEventListener('change', h);
    return () => mq.removeEventListener('change', h);
  }, [breakpoint]);
  return isSp;
}

function SchedulePage({ onOpenNew, onOpenSettings }) {
  const kinds = useEventKinds();
  const km = React.useMemo(() => kindMapOf(kinds), [kinds]);
  const isSp = useIsSp();
  const [previewEventId, setPreviewEventId] = React.useState(null);
  // anchor date — current week/day/month is computed from this
  const [anchor, setAnchor] = React.useState(() => parseISO(TODAY_ISO));
  const [view, setView] = React.useState('week'); // day / week / month
  const [selectedDate, setSelectedDate] = React.useState(TODAY_ISO);
  const [selectedId, setSelectedId] = React.useState('S-001');
  const [kindFilter, setKindFilter] = React.useState('all');
  const [priestFilter, setPriestFilter] = React.useState('all');
  const [events, setEvents] = React.useState(SCHEDULE_EVENTS_INITIAL);

  const PRIESTS = React.useMemo(() => {
    const set = new Set();
    events.forEach((e) => {if (e.priest) set.add(e.priest);});
    return Array.from(set);
  }, [events]);

  // ---------- drag & drop ----------
  const moveEvent = React.useCallback((id, newDate, newTime) => {
    setEvents((prev) => prev.map((e) => {
      if (e.id !== id) return e;
      const next = { ...e, date: newDate };
      if (newTime) next.time = newTime;
      return next;
    }));
    setSelectedDate(newDate);
    setSelectedId(id);
  }, []);

  // ---------- edit ----------
  const [editingId, setEditingId] = React.useState(null);
  const editingEvent = editingId ? events.find((e) => e.id === editingId) : null;
  const updateEvent = React.useCallback((id, patch) => {
    setEvents((prev) => prev.map((e) => (e.id === id ? { ...e, ...patch } : e)));
  }, []);

  // ---------- helpers ----------
  const eventsForDate = React.useCallback((iso) => {
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

  // ---------- stats (month-of-anchor regardless of view) ----------
  const monthEvents = events.filter((e) => e.date.startsWith(`${anchor.getFullYear()}-${String(anchor.getMonth() + 1).padStart(2, '0')}`));
  const memorialCount = monthEvents.filter((e) => e.kind === 'memorial').length;
  const visitCount = monthEvents.filter((e) => e.kind === 'visit').length;
  const todayCount = events.filter((e) => e.date === TODAY_ISO).length;

  // ---------- selected event ----------
  const eventsOnSelected = eventsForDate(selectedDate);
  const selectedEvent = events.find((e) => e.id === selectedId) || eventsOnSelected[0] || events[0];

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
          {[
          { k: 'day', l: '日' },
          { k: 'week', l: '週' },
          { k: 'month', l: '月' }].
          map((o) =>
          <button key={o.k} className={'cv-btn' + (view === o.k ? ' on' : '')} onClick={() => setView(o.k)}>{o.l}</button>
          )}
        </div>
        <div className="cal-filters">
          {[{ key: 'all', label: 'すべて' }, ...kinds].map((k) =>
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
          <MonthView anchor={anchor} km={km} selectedDate={selectedDate} setSelectedDate={setSelectedDate} setSelectedId={setSelectedId} eventsForDate={eventsForDate} moveEvent={moveEvent} />
          }
          {view === 'week' &&
          <TimeGridView days={7} startDate={range.start} km={km} selectedDate={selectedDate} setSelectedDate={setSelectedDate} setSelectedId={setSelectedId} selectedId={selectedId} eventsForDate={eventsForDate} moveEvent={moveEvent} />
          }
          {view === 'day' &&
          <TimeGridView days={1} startDate={anchor} km={km} selectedDate={selectedDate} setSelectedDate={setSelectedDate} setSelectedId={setSelectedId} selectedId={selectedId} eventsForDate={eventsForDate} moveEvent={moveEvent} />
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

function SchedulePage_subviews_placeholder() {}

// SP専用詳細モーダル
function EventPreviewModal({ event, km, onClose, onEdit }) {
  if (!event) return null;
  const k = getKind(km, event.kind);
  return (
    <div className="dialog-overlay" onClick={onClose}>
      <div className="dialog event-preview-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <header className="epm-head" style={{ borderTop: `4px solid ${k.color}` }}>
          <div className="epm-top">
            <span className="sd-kind-chip" style={{ background: k.tint, color: k.dark }}>{k.label}</span>
            <button className="x-btn" onClick={onClose} aria-label="閉じる">
              <svg viewBox="0 0 24 24"><line x1="18" x2="6" y1="6" y2="18"/><line x1="6" x2="18" y1="6" y2="18"/></svg>
            </button>
          </div>
          <h3 className="epm-title">{event.title}</h3>
          <div className="epm-when">
            {fmtDateLong(event.date)} ・ {event.time}〜{addMinutes(event.time, event.dur)}
          </div>
        </header>
        <div className="epm-body">
          <dl className="sd-meta-list">
            {event.family && (<><dt>関連檀家</dt><dd>{event.family} <span className="dim">({event.familyId})</span></dd></>)}
            {event.kaimyo && (<><dt>戒名</dt><dd className="kai">{event.kaimyo}</dd></>)}
            {event.loc && (<><dt>場所</dt><dd>{event.loc}</dd></>)}
            {event.priest && (<><dt>担当</dt><dd>{event.priest}</dd></>)}
            {event.attendees && (<><dt>参加人数</dt><dd>{event.attendees}名</dd></>)}
            {event.recurring && (<><dt>繰り返し</dt><dd>{event.recurring}</dd></>)}
          </dl>
          {event.notes && <div className="sd-notes">{event.notes}</div>}
        </div>
        <footer className="epm-foot">
          <button className="btn outline" type="button" onClick={onClose}>閉じる</button>
          <button className="btn primary" type="button" onClick={onEdit}>
            <svg viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            編集
          </button>
        </footer>
      </div>
    </div>
  );
}

// ---------- Month view ----------
function MonthView({ anchor, km, selectedDate, setSelectedDate, setSelectedId, eventsForDate, moveEvent }) {
  const grid = React.useMemo(() => {
    const first = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
    const start = new Date(first);
    start.setDate(1 - first.getDay());
    const cells = [];
    for (let i = 0; i < 42; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      cells.push({
        date: d,
        iso: isoFromDate(d),
        outside: d.getMonth() !== anchor.getMonth()
      });
    }
    return cells;
  }, [anchor]);

  return (
    <>
      <div className="cal-weekdays">
        {WEEKDAYS.map((w, i) =>
        <div key={w} className={'cal-wd' + (i === 0 ? ' sun' : '') + (i === 6 ? ' sat' : '')}>{w}</div>
        )}
      </div>
      <div className="cal-grid">
        {grid.map((cell) => {
          const evs = eventsForDate(cell.iso);
          const isToday = cell.iso === TODAY_ISO;
          const isSelected = cell.iso === selectedDate;
          const dow = cell.date.getDay();
          return (
            <div key={cell.iso}
            className={'cal-cell' + (cell.outside ? ' outside' : '') + (isToday ? ' today' : '') + (isSelected ? ' selected' : '')}
            onClick={() => {setSelectedDate(cell.iso);if (evs[0]) setSelectedId(evs[0].id);}}
            onDragOver={(ev) => {ev.preventDefault();ev.currentTarget.classList.add('drop-over');}}
            onDragLeave={(ev) => {ev.currentTarget.classList.remove('drop-over');}}
            onDrop={(ev) => {
              ev.preventDefault();
              ev.currentTarget.classList.remove('drop-over');
              const id = ev.dataTransfer.getData('text/event-id');
              if (id) moveEvent(id, cell.iso);
            }}>
              <div className={'cal-cell-d' + (dow === 0 ? ' sun' : '') + (dow === 6 ? ' sat' : '')}>
                {cell.date.getDate()}
                {isToday && <span className="cal-today-mark">今日</span>}
              </div>
              <div className="cal-cell-events">
                {evs.slice(0, 3).map((e) => {
                  const kk = getKind(km, e.kind);
                  return (
                    <div key={e.id} className="cal-evt"
                    draggable
                    onDragStart={(ev) => {ev.dataTransfer.setData('text/event-id', e.id);ev.dataTransfer.effectAllowed = 'move';ev.currentTarget.classList.add('dragging');}}
                    onDragEnd={(ev) => {ev.currentTarget.classList.remove('dragging');}}
                    style={{ background: kk.tint, color: kk.dark, borderLeft: `3px solid ${kk.color}`, '--evt-bg': kk.color }}
                    onClick={(ev) => {ev.stopPropagation();setSelectedDate(cell.iso);setSelectedId(e.id);if(isSp)setPreviewEventId(e.id);}}>
                    <span className="evt-t">{e.time}</span>
                    <span className="evt-l">{e.title}</span>
                    {e.priest && <span className="evt-p">{e.priest}</span>}
                  </div>);

                })}
                {evs.length > 3 && <div className="cal-evt-more">+{evs.length - 3} 件</div>}
              </div>
            </div>);

        })}
      </div>
    </>);

}

// ---------- Day / Week time-grid view ----------
function TimeGridView({ days, startDate, km, selectedDate, setSelectedDate, setSelectedId, selectedId, eventsForDate, moveEvent }) {
  const dates = [];
  for (let i = 0; i < days; i++) {
    const d = new Date(startDate);
    d.setDate(startDate.getDate() + i);
    dates.push(d);
  }
  const hours = [];
  for (let h = DAY_START_HOUR; h < DAY_END_HOUR; h++) hours.push(h);

  // Current time indicator only if today is in the range and current time is within DAY_START_HOUR..DAY_END_HOUR
  const todayInRange = dates.some((d) => isoFromDate(d) === TODAY_ISO);
  const nowMockHour = 11;
  const nowMockMin = 18;
  const nowOffset = todayInRange ? ((nowMockHour - DAY_START_HOUR) * 60 + nowMockMin) / 60 * HOUR_PX : null;

  return (
    <div className="tg-wrap">
      <div className="tg-head" style={{ gridTemplateColumns: `60px repeat(${days}, 1fr)` }}>
        <div className="tg-corner"></div>
        {dates.map((d) => {
          const iso = isoFromDate(d);
          const isToday = iso === TODAY_ISO;
          const dow = d.getDay();
          return (
            <div key={iso}
            className={'tg-day-head' + (isToday ? ' today' : '') + (iso === selectedDate ? ' selected' : '')}
            onClick={() => setSelectedDate(iso)}>
              <div className={'tg-dow' + (dow === 0 ? ' sun' : '') + (dow === 6 ? ' sat' : '')}>{WEEKDAYS[dow]}</div>
              <div className={'tg-num' + (isToday ? ' today' : '')}>{d.getDate()}</div>
            </div>);

        })}
      </div>

      <div className="tg-body" style={{ gridTemplateColumns: `60px repeat(${days}, 1fr)` }}>
        {/* hour ruler */}
        <div className="tg-hours">
          {hours.map((h) =>
          <div key={h} className="tg-hour-row" style={{ height: HOUR_PX }}>
              <span className="tg-hour-label">{String(h).padStart(2, '0')}:00</span>
            </div>
          )}
        </div>

        {/* day columns */}
        {dates.map((d) => {
          const iso = isoFromDate(d);
          const isToday = iso === TODAY_ISO;
          const evs = eventsForDate(iso);
          const onColDrop = (ev) => {
            ev.preventDefault();
            ev.currentTarget.classList.remove('drop-over');
            const id = ev.dataTransfer.getData('text/event-id');
            if (!id) return;
            // Snap to 15-minute slot based on Y in column body
            const rect = ev.currentTarget.getBoundingClientRect();
            const y = Math.max(0, ev.clientY - rect.top);
            const totalMins = y / HOUR_PX * 60;
            const snapped = Math.round(totalMins / 15) * 15;
            const hour = Math.min(DAY_END_HOUR - 1, Math.max(DAY_START_HOUR, DAY_START_HOUR + Math.floor(snapped / 60)));
            const minute = snapped % 60;
            const newTime = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
            moveEvent(id, iso, newTime);
          };
          return (
            <div key={iso} className={'tg-col' + (isToday ? ' today' : '')}
            onClick={() => setSelectedDate(iso)}
            onDragOver={(ev) => {ev.preventDefault();ev.currentTarget.classList.add('drop-over');}}
            onDragLeave={(ev) => {ev.currentTarget.classList.remove('drop-over');}}
            onDrop={onColDrop}>
              {hours.map((h) =>
              <div key={h} className="tg-hour-cell" style={{ height: HOUR_PX }}></div>
              )}
              {isToday && nowOffset != null &&
              <div className="tg-now" style={{ top: nowOffset }}>
                  <span className="tg-now-dot"></span>
                </div>
              }
              {layoutEvents(evs).map(({ e, leftPct, widthPct }) => {
                const k = getKind(km, e.kind);
                const top = eventTopPx(e.time);
                const height = eventHeightPx(e.dur);
                const isSel = e.id === selectedId;
                return (
                  <div key={e.id}
                  className={'tg-evt' + (isSel ? ' selected' : '')}
                  draggable
                  onDragStart={(ev) => {ev.dataTransfer.setData('text/event-id', e.id);ev.dataTransfer.effectAllowed = 'move';ev.currentTarget.classList.add('dragging');}}
                  onDragEnd={(ev) => {ev.currentTarget.classList.remove('dragging');}}
                  style={{
                    top, height,
                    left: `calc(${leftPct}% + 2px)`,
                    width: `calc(${widthPct}% - 4px)`,
                    background: k.tint,
                    color: k.dark,
                    borderLeft: `3px solid ${k.color}`
                  }}
                  onClick={(ev) => {ev.stopPropagation();setSelectedDate(iso);setSelectedId(e.id);if(isSp)setPreviewEventId(e.id);}}>
                    <div className="tg-evt-t">{e.time}{e.dur >= 45 ? `〜${addMinutes(e.time, e.dur)}` : ''}</div>
                    <div className="tg-evt-l">{e.title}</div>
                    {e.priest && height >= 44 && <div className="tg-evt-priest"><span className="tg-evt-av">{e.priest.slice(0, 1)}</span>{e.priest}</div>}
                    {e.loc && height >= 80 && <div className="tg-evt-loc">{e.loc}</div>}
                  </div>);

              })}
            </div>);

        })}
      </div>
    </div>);

}

// Lay out overlapping events: assign each event to a column (greedy) within
// its overlap group, then size width = 100% / max-cols of its group.
function layoutEvents(events) {
  if (!events.length) return [];
  const items = events.
  map((e) => ({ e, start: minutesFromTime(e.time), end: minutesFromTime(e.time) + e.dur })).
  sort((a, b) => a.start - b.start || a.end - b.end);

  // Build overlap groups
  const groups = [];
  let cur = [];
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

  const placed = [];
  for (const g of groups) {
    const cols = []; // each col = last end time
    const assignments = [];
    for (const it of g) {
      let placedCol = -1;
      for (let i = 0; i < cols.length; i++) {
        if (cols[i] <= it.start) {placedCol = i;break;}
      }
      if (placedCol === -1) {cols.push(it.end);placedCol = cols.length - 1;} else
      cols[placedCol] = it.end;
      assignments.push({ it, col: placedCol });
    }
    const colCount = cols.length;
    for (const { it, col } of assignments) {
      placed.push({
        e: it.e,
        leftPct: col / colCount * 100,
        widthPct: 100 / colCount
      });
    }
  }
  return placed;
}

function ScheduleDetail({ date, events, selectedId, onSelect, event, km, onEdit }) {
  return (
    <aside className="card schedule-detail">
      <header style={{ display: 'flex', flexDirection: 'column', gap: 4, padding: '18px 22px' }}>
        <div className="sd-date">{fmtDateLong(date)}</div>
        <div className="sd-count">{events.length}件の予定</div>
      </header>

      {events.length === 0 ?
      <div className="empty">この日に予定はありません。</div> :

      <ul className="sd-list">
          {events.map((e) => {
          const k = getKind(km, e.kind);
          const isSel = e.id === selectedId;
          return (
            <li key={e.id} className={'sd-item' + (isSel ? ' selected' : '')} onClick={() => onSelect(e.id)}>
                <div className="sd-time">{e.time}</div>
                <div className="sd-rail" style={{ background: k.color }}></div>
                <div className="sd-main">
                  <div className="sd-title">{e.title}</div>
                  <div className="sd-meta">
                    <span className="sd-kind-chip" style={{ background: k.tint, color: k.dark }}>{k.label}</span>
                    {e.loc && <span className="sd-loc"><svg viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>{e.loc}</span>}
                  </div>
                </div>
              </li>);

        })}
        </ul>
      }

      {event &&
      <div className="sd-detail">
          <div className="sd-detail-head">
            <div className="sd-detail-head-top">
              <span className="sd-kind-chip" style={{ background: getKind(km, event.kind).tint, color: getKind(km, event.kind).dark }}>{getKind(km, event.kind).label}</span>
              <button className="btn btn-sm sd-edit-btn" type="button" onClick={() => onEdit && onEdit(event)}>
                <svg viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                編集
              </button>
            </div>
            <h3 style={{ color: "rgb(9, 25, 78)" }}>{event.title}</h3>
            <div className="sd-when">{event.time}〜{addMinutes(event.time, event.dur)} ・ {event.dur}分</div>
          </div>
          <dl className="sd-meta-list">
            {event.family && <><dt>関連檀家</dt><dd><a href="#" onClick={(e) => e.preventDefault()}>{event.family}</a> <span className="dim">({event.familyId})</span></dd></>}
            {event.kaimyo && <><dt>戒名</dt><dd className="kai">{event.kaimyo}</dd></>}
            {event.loc && <><dt>場所</dt><dd>{event.loc}</dd></>}
            {event.priest && <><dt>担当</dt><dd>{event.priest}</dd></>}
            {event.attendees && <><dt>参加人数</dt><dd>{event.attendees}名</dd></>}
            {event.recurring && <><dt>繰り返し</dt><dd>{event.recurring}</dd></>}
          </dl>
          {event.notes && <div className="sd-notes">{event.notes}</div>}
          <div className="sd-detail-foot">
            <button className="btn ghost" type="button">
              <svg viewBox="0 0 24 24"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /></svg>
              リマインダー送信
            </button>
          </div>
        </div>
      }
    </aside>);

}

function NewScheduleDialog({ open, onClose, onSave, onOpenSettings, mode, initial }) {
  const kinds = useEventKinds();
  const initFromEvent = (ev) => {
    if (!ev) return { kind: 'memorial', title: '', date: '2026-05-12', time: '10:30', endTime: '11:30', family: '', loc: '本堂', priest: '住職', attendees: 4, notes: '' };
    return {
      kind: ev.kind || 'memorial', title: ev.title || '',
      date: ev.date || '2026-05-12', time: ev.time || '10:30',
      endTime: ev.time ? addMinutes(ev.time, ev.dur || 60) : '11:30',
      family: ev.family || '', loc: ev.loc || '本堂',
      priest: ev.priest || '住職', attendees: ev.attendees || 4, notes: ev.notes || '',
    };
  };
  const [form, setForm] = React.useState(() => initFromEvent(initial));
  // re-initialize when opened with a new initial value
  React.useEffect(() => { if (open) setForm(initFromEvent(initial)); }, [open, initial && initial.id]);
  // When start time changes, shift the end time by the same delta
  const onStartTimeChange = (newStart) => {
    setForm((f) => {
      const oldDur = (minutesFromTime(f.endTime) - minutesFromTime(f.time) + 24 * 60) % (24 * 60);
      const newEndMins = (minutesFromTime(newStart) + (oldDur || 60)) % (24 * 60);
      const hh = Math.floor(newEndMins / 60);
      const mm = newEndMins % 60;
      return { ...f, time: newStart, endTime: `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}` };
    });
  };
  if (!open) return null;
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="dialog-overlay" onClick={onClose}>
      <div className="dialog" style={{ width: 680 }} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h3>{mode === 'edit' ? '予定を編集' : '新規予定の追加'}</h3>
            <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--fg2)' }}>
              {mode === 'edit' ? '予定の内容を変更します。' : '年忌・お参り・定期法要などを記録します。'}
            </p>
          </div>
          <button className="x-btn" onClick={onClose} aria-label="閉じる">
            <svg viewBox="0 0 24 24"><line x1="18" x2="6" y1="6" y2="18" /><line x1="6" x2="18" y1="6" y2="18" /></svg>
          </button>
        </header>
        <div className="body">
          <div className="form-field" style={{ marginBottom: 14 }}>
            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
              <span>種別</span>
              {onOpenSettings &&
              <button type="button" className="kind-gear-btn" onClick={() => {onClose();onOpenSettings('kinds');}} aria-label="種別を編集" title="種別を編集">
                  <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>
                  種別を編集
                </button>
              }
            </label>
            <div className="kind-picker">
              {kinds.map((k) =>
              <button key={k.key} type="button"
              className={'kind-btn' + (form.kind === k.key ? ' on' : '')}
              style={form.kind === k.key ? { borderColor: k.color, background: k.tint, color: k.dark } : {}}
              onClick={() => set('kind', k.key)}>
                  <span className="cal-chip-dot" style={{ background: k.color }}></span>
                  {k.label}
                </button>
              )}
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
            <div className="form-field" style={{ gridColumn: 'span 4' }}>
              <label>タイトル</label>
              <input className="input-plain" value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="例: 佐藤家 七回忌" />
            </div>
            <div className="form-field" style={{ gridColumn: 'span 2' }}>
              <label>日付</label>
              <input className="input-plain" type="date" value={form.date} onChange={(e) => set('date', e.target.value)} />
            </div>
            <div className="form-field">
              <label>開始時刻</label>
              <input className="input-plain" type="time" value={form.time} onChange={(e) => onStartTimeChange(e.target.value)} />
            </div>
            <div className="form-field">
              <label>終了時刻</label>
              <input className="input-plain" type="time" value={form.endTime} min={form.time} onChange={(e) => set('endTime', e.target.value)} />
            </div>
            <div className="form-field" style={{ gridColumn: 'span 2' }}>
              <label>関連檀家</label>
              <select className="input-plain" value={form.family} onChange={(e) => set('family', e.target.value)}>
                <option value="">— 選択しない</option>
                {['佐藤家', '田中家', '高橋家', '山本家', '鈴木家', '伊藤家', '渡辺家', '中村家', '小林家', '加藤家', '吉田家', '山田家'].map((f) =>
                <option key={f} value={f}>{f}</option>
                )}
              </select>
            </div>
            <div className="form-field">
              <label>場所</label>
              <input className="input-plain" value={form.loc} onChange={(e) => set('loc', e.target.value)} />
            </div>
            <div className="form-field">
              <label>担当</label>
              <select className="input-plain" value={form.priest} onChange={(e) => set('priest', e.target.value)}>
                {['住職', '副住職', '主任住職', '住職・副住職'].map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div className="form-field">
              <label>参加人数 (予定)</label>
              <input className="input-plain" type="number" min="1" max="200" value={form.attendees} onChange={(e) => set('attendees', Number(e.target.value))} />
            </div>
            <div className="form-field" style={{ gridColumn: 'span 4' }}>
              <label>備考</label>
              <textarea className="input-plain" rows={3} value={form.notes} onChange={(e) => set('notes', e.target.value)} placeholder="予定に関するメモ" />
            </div>
          </div>
        </div>
        <footer>
          <button className="btn outline" type="button" onClick={onClose}>キャンセル</button>
          <button className="btn primary" type="button"
          onClick={() => {
            const dur = (minutesFromTime(form.endTime) - minutesFromTime(form.time) + 24 * 60) % (24 * 60) || 60;
            onSave({ ...form, dur });
          }}
          disabled={!form.title || minutesFromTime(form.endTime) <= minutesFromTime(form.time)}>{mode === 'edit' ? '変更を保存' : '予定を保存'}</button>
        </footer>
      </div>
    </div>);

}

Object.assign(window, { SchedulePage, NewScheduleDialog });
