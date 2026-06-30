import * as React from 'react';

import { buildVisits, fmtJDate, fmtTime, fmtYen, isToday, KINDS, STATUS } from '../constants';

import { ChipGroup } from './ChipGroup';
import { Pill } from './Pill';
import { StatusDot } from './StatusDot';
import { VisitDetail } from './VisitDetail';

interface VisitsPageProps {
  onOpenNew: () => void;
}

export function VisitsPage({ onOpenNew }: VisitsPageProps) {
  const all = React.useMemo(buildVisits, []);
  const [q, setQ] = React.useState('');
  const [kindFilter, setKindFilter] = React.useState('all');
  const [statusFilter, setStatusFilter] = React.useState('all');
  const [selectedId, setSelectedId] = React.useState(all[0].id);
  const [page, setPage] = React.useState(1);
  const perPage = 12;

  const filtered = all.filter(v =>
    (kindFilter === 'all' || v.kind.key === kindFilter) &&
    (statusFilter === 'all' || v.status.key === statusFilter) &&
    (q === '' || v.name.includes(q) || v.family.includes(q) || v.id.toLowerCase().includes(q.toLowerCase()))
  );
  const pages = Math.max(1, Math.ceil(filtered.length / perPage));
  const cur = Math.min(page, pages);
  const visible = filtered.slice((cur - 1) * perPage, cur * perPage);
  const selected = all.find(v => v.id === selectedId) || filtered[0];

  return (
    <div className="visits-page">
      <div className="page-head">
        <div>
          <h1>お参り記録</h1>
          <p>寺院でのお参り、法要、お布施の記録と管理を行います。</p>
        </div>
        <div className="head-actions">
          <button className="btn outline">
            <svg viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
            CSV書き出し
          </button>
          <button className="btn primary" onClick={onOpenNew}>
            <svg viewBox="0 0 24 24"><line x1="12" x2="12" y1="5" y2="19"/><line x1="5" x2="19" y1="12" y2="12"/></svg>
            お参りを登録
          </button>
        </div>
      </div>

      <div className="visits-tools">
        <div className="search-wrap">
          <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" x2="16.65" y1="21" y2="16.65"/></svg>
          <input placeholder="氏名・家名・記録IDで検索" value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} />
        </div>
        <ChipGroup
          label="種別"
          value={kindFilter}
          options={[{ key: 'all', label: 'すべて' }, ...KINDS.map(k => ({ key: k.key, label: k.label }))]}
          onChange={(v) => { setKindFilter(v); setPage(1); }}
        />
        <ChipGroup
          label="状態"
          value={statusFilter}
          options={[{ key: 'all', label: 'すべて' }, ...STATUS.map(s => ({ key: s.key, label: s.label }))]}
          onChange={(v) => { setStatusFilter(v); setPage(1); }}
        />
        <div className="count">{filtered.length}件</div>
      </div>

      <div className="visits-body">
        <div className="visits-table card-block">
          <div className="vtbl">
            <div className="vt-head">
              <div className="c-date">日時</div>
              <div className="c-who">参拝者 / 家</div>
              <div className="c-kind">種別</div>
              <div className="c-status">状態</div>
              <div className="c-amt">お布施</div>
            </div>
            {visible.map(v => (
              <div key={v.id}
                   className={'vt-row' + (v.id === selectedId ? ' selected' : '')}
                   onClick={() => setSelectedId(v.id)}>
                <div className="c-date">
                  <div className="d-main">{fmtJDate(v.date)}{isToday(v.date) && <span className="today-pill">本日</span>}</div>
                  <div className="d-sub">{fmtTime(v.hour, v.min)}</div>
                </div>
                <div className="c-who">
                  <div className="w-name">{v.name}</div>
                  <div className="w-sub">{v.family} · {v.id}</div>
                </div>
                <div className="c-kind"><Pill color={v.kind.color}>{v.kind.label}</Pill></div>
                <div className="c-status"><StatusDot status={v.status} /></div>
                <div className="c-amt">{fmtYen(v.offering)}</div>
              </div>
            ))}
            {visible.length === 0 && (
              <div className="vt-empty">該当するお参り記録はありません。</div>
            )}
          </div>
          <div className="vt-foot">
            <div>{filtered.length === 0 ? 0 : ((cur - 1) * perPage + 1)} – {Math.min(cur * perPage, filtered.length)} / {filtered.length}件</div>
            <div className="pager">
              <button className="btn outline btn-sm" disabled={cur === 1} onClick={() => setPage(cur - 1)}>
                <svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>
              </button>
              <span className="page-num">{cur} / {pages}</span>
              <button className="btn outline btn-sm" disabled={cur === pages} onClick={() => setPage(cur + 1)}>
                <svg viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>
              </button>
            </div>
          </div>
        </div>

        <aside className="visit-detail card-block">
          {selected ? <VisitDetail v={selected} /> : <div className="vt-empty">記録を選択してください。</div>}
        </aside>
      </div>
    </div>
  );
}
