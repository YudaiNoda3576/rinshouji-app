// 過去帳 — 詳細パネル。

import { TEMPLE_SECTS } from '@/constants/temple';

import type { MemorialEntry } from '../types';
import { fmtJpDate, fmtJpDateShort, getServiceHistory, toEra } from '../utils';

interface MemorialDetailProps {
  entry: MemorialEntry;
  onEdit: () => void;
}

export function MemorialDetail({ entry, onEdit }: MemorialDetailProps) {
  if (!entry) return null;
  const history = getServiceHistory(entry);
  const next = history.find(h => !h.done);
  return (
    <aside className="card memorial-detail">
      <header className="md-head">
        <div className="md-id">過去帳 {entry.id}</div>
        <div className="md-kaimyo-wrap">
          <div className="md-kaimyo">{entry.kaimyo}</div>
          <div className="md-secular">俗名 — {entry.secular}</div>
        </div>
        <div className="md-meta">
          <div>
            <div className="md-meta-l">没年月日</div>
            <div className="md-meta-v">{toEra(entry.deceased)}</div>
            <div className="md-meta-sub">{fmtJpDate(entry.deceased)}</div>
          </div>
          <div>
            <div className="md-meta-l">享年</div>
            <div className="md-meta-v">{entry.age}<span className="md-meta-u">歳</span></div>
          </div>
        </div>
      </header>

      <section className="md-section">
        <div className="md-row"><span className="md-row-l">関連檀家</span><span className="md-row-v"><a href="#" onClick={(e) => e.preventDefault()}>{entry.family}</a><span className="md-row-meta"> ({entry.familyId})</span></span></div>
        <div className="md-row"><span className="md-row-l">続柄</span><span className="md-row-v">{entry.relation}</span></div>
        <div className="md-row"><span className="md-row-l">宗派</span><span className="md-row-v">{TEMPLE_SECTS[entry.sect]}</span></div>
      </section>

      <section className="md-section">
        <div className="md-section-head">
          <h3>法要記録</h3>
          {next && <span className="md-next-pill">次回 {next.label} ・ {fmtJpDateShort(next.date)}</span>}
        </div>
        <ol className="service-timeline">
          {history.map((h, idx) => (
            <li key={idx} className={'st-item' + (h.done ? ' done' : ' upcoming') + (h.kind === 'funeral' ? ' funeral' : '')}>
              <div className="st-dot" />
              <div className="st-content">
                <div className="st-label">{h.label}</div>
                <div className="st-date">{toEra(h.date)}</div>
              </div>
              <div className="st-status">{h.done ? '勤修済' : '予定'}</div>
            </li>
          ))}
        </ol>
      </section>

      {entry.notes && entry.notes.trim() !== '—' && (
        <section className="md-section">
          <div className="md-section-head"><h3>備考</h3></div>
          <p className="md-notes">{entry.notes}</p>
        </section>
      )}

      <footer className="md-foot">
        <button className="btn ghost" type="button" onClick={onEdit}>
          <svg viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          編集する
        </button>
        <button className="btn ghost purple-text" type="button">
          <svg viewBox="0 0 24 24"><rect width="18" height="18" x="3" y="4" rx="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
          年忌を予定に追加
        </button>
      </footer>
    </aside>
  );
}
