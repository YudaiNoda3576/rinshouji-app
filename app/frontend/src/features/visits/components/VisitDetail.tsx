import { fmtJDate, fmtTime, fmtYen } from '../constants';
import type { Visit } from '../types';

import { Pill } from '@/components/ui/Pill';

import { StatusDot } from './StatusDot';

interface VisitDetailProps {
  v: Visit;
}

export function VisitDetail({ v }: VisitDetailProps) {
  return (
    <>
      <header style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 6 }}>
        <div className="detail-id">{v.id}</div>
        <h3>{v.name}</h3>
      </header>
      <div className="detail-body">
        <div className="kv-list">
          <div className="kv"><span>家名</span><b>{v.family}</b></div>
          <div className="kv"><span>日付</span><b>{fmtJDate(v.date)}</b></div>
          <div className="kv"><span>時刻</span><b>{fmtTime(v.hour, v.min)}</b></div>
          <div className="kv"><span>種別</span><b><Pill color={v.kind.color}>{v.kind.label}</Pill></b></div>
          <div className="kv"><span>状態</span><b><StatusDot status={v.status} /></b></div>
          <div className="kv"><span>お布施</span><b>{fmtYen(v.offering)}</b></div>
          <div className="kv"><span>対応者</span><b>{v.handler}</b></div>
        </div>
        <div className="note-block">
          <div className="l">メモ</div>
          <p>{v.note || '—'}</p>
        </div>
        <div className="action-row">
          <button className="btn primary">
            <svg viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4z"/></svg>
            編集
          </button>
          <button className="btn ghost danger-text">
            <svg viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/></svg>
            削除
          </button>
        </div>
      </div>
    </>
  );
}
