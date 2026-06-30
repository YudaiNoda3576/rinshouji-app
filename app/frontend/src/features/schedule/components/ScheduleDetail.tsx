// 選択日の予定一覧と詳細パネル。

import { addMinutes, fmtDateLong, getKind } from '../utils';
import type { KindMap, ScheduleEvent } from '../types';

interface ScheduleDetailProps {
  date: string;
  events: ScheduleEvent[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  event: ScheduleEvent | undefined;
  km: KindMap;
  onEdit?: (e: ScheduleEvent) => void;
}

export function ScheduleDetail({ date, events, selectedId, onSelect, event, km, onEdit }: ScheduleDetailProps) {
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
