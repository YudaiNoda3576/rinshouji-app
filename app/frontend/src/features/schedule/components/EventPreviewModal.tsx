// SP専用詳細モーダル

import { addMinutes, fmtDateLong, getKind } from '../utils';
import type { KindMap, ScheduleEvent } from '../types';

interface EventPreviewModalProps {
  event: ScheduleEvent | undefined;
  km: KindMap;
  onClose: () => void;
  onEdit: () => void;
}

export function EventPreviewModal({ event, km, onClose, onEdit }: EventPreviewModalProps) {
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
