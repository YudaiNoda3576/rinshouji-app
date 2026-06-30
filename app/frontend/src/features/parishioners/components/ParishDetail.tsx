import { TEMPLE_SECTS } from '@/constants/temple';

import { ZONES, fmtRelativeDate } from '../constants';
import type { Member, ParishFamily } from '../types';

import { Kamon } from './Kamon';

interface ParishDetailProps {
  f: ParishFamily;
  members: Member[];
}

export function ParishDetail({ f, members }: ParishDetailProps) {
  return (
    <>
      <header style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 10 }}>
        <div className="pd-top">
          <div className="pd-kamon"><Kamon idx={f.kamon} size={48} /></div>
          <div>
            <h3>{f.name}家</h3>
            <div className="detail-id">{f.id} · 加入 {f.joined}年 ({2026 - f.joined}年)</div>
          </div>
        </div>
      </header>
      <div className="detail-body">
        <div className="kv-list">
          <div className="kv"><span>戸主</span><b>{f.head}</b></div>
          <div className="kv"><span>宗派</span><b>{TEMPLE_SECTS[f.sect]}</b></div>
          <div className="kv"><span>住所</span><b style={{ maxWidth: 220, textAlign: 'right', whiteSpace: 'normal', lineHeight: 1.4 }}>{f.addr}</b></div>
          <div className="kv"><span>電話</span><b>{f.phone}</b></div>
          <div className="kv"><span>墓地</span><b>{ZONES[f.zone]} 区画</b></div>
          <div className="kv"><span>最近のお参り</span><b>{f.lastVisit} ({fmtRelativeDate(f.lastVisit)})</b></div>
        </div>

        <div className="detail-section">
          <div className="ds-head">家族構成 <span>{members.length}名</span></div>
          <div className="member-list">
            {members.map((m, i) => (
              <div key={i} className={'member-row' + (m.deceased ? ' deceased' : '')}>
                <div className="m-rel">{m.relation}</div>
                <div className="m-info">
                  <div className="m-name">{m.name}{m.deceased && <span className="m-dec-mark">過去帳</span>}</div>
                  {m.deceased
                    ? <div className="m-sub">{m.kaimyo} · {m.date}</div>
                    : <div className="m-sub">{m.age}歳</div>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {f.scheduled && (
          <div className="detail-section">
            <div className="ds-head">直近の予定</div>
            <div className="scheduled-card">
              <div className="sc-ico"><Kamon idx={f.kamon} size={20} accent="#7C3AED" /></div>
              <div>
                <div className="sc-title">{f.scheduled}</div>
                <div className="sc-sub">年忌法要 · 案内未送信</div>
              </div>
              <button className="btn outline btn-sm">
                <svg viewBox="0 0 24 24"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                案内送信
              </button>
            </div>
          </div>
        )}

        <div className="action-row">
          <button className="btn primary">
            <svg viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4z"/></svg>
            編集
          </button>
          <button className="btn outline">
            <svg viewBox="0 0 24 24"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
            過去帳を見る
          </button>
          <button className="btn ghost danger-text">
            <svg viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
            削除
          </button>
        </div>
      </div>
    </>
  );
}
