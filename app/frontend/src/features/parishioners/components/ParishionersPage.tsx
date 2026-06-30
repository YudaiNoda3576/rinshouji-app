import * as React from 'react';

import { TEMPLE_SECTS } from '@/constants/temple';

import { PARISH_FAMILIES, buildMembers, daysAgo } from '../constants';

import { ChipGroup } from './ChipGroup';
import { ParishDetail } from './ParishDetail';
import { TableView } from './TableView';

interface ParishionersPageProps {
  onOpenNew: () => void;
}

export function ParishionersPage({ onOpenNew }: ParishionersPageProps) {
  const all = PARISH_FAMILIES;
  const [q, setQ] = React.useState('');
  const [sectFilter, setSectFilter] = React.useState('all');
  const [sortKey, setSortKey] = React.useState('lastVisit');
  const [selectedId, setSelectedId] = React.useState(all[0].id);

  const filtered = all.filter(f =>
    (sectFilter === 'all' || f.sect === Number(sectFilter)) &&
    (q === '' || f.name.includes(q) || f.head.includes(q) || f.id.toLowerCase().includes(q.toLowerCase()) || f.addr.includes(q))
  );
  const sorted = [...filtered].sort((a, b) => {
    if (sortKey === 'name') return a.name.localeCompare(b.name, 'ja');
    if (sortKey === 'members') return b.members - a.members;
    if (sortKey === 'joined') return a.joined - b.joined;
    return daysAgo(a.lastVisit) - daysAgo(b.lastVisit);
  });
  const selected = all.find(f => f.id === selectedId) || sorted[0];
  const members = selected ? buildMembers(selected.name) : [];

  return (
    <div className="parish-page">
      <div className="page-head">
        <div>
          <h1>檀家管理</h1>
          <p>檀家家別の情報、家族構成、過去帳、お参り履歴を管理します。</p>
        </div>
        <div className="head-actions">
          <button className="btn outline">
            <svg viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
            名簿を書き出し
          </button>
          <button className="btn primary" onClick={onOpenNew}>
            <svg viewBox="0 0 24 24"><line x1="12" x2="12" y1="5" y2="19"/><line x1="5" x2="19" y1="12" y2="12"/></svg>
            新規檀家登録
          </button>
        </div>
      </div>

      <div className="parish-tools">
        <div className="search-wrap">
          <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" x2="16.65" y1="21" y2="16.65"/></svg>
          <input placeholder="家名・戸主名・住所・檀家番号で検索" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <ChipGroup label="宗派"
          value={sectFilter}
          options={[{ key: 'all', label: 'すべて' }, ...TEMPLE_SECTS.map((s, i) => ({ key: String(i), label: s }))]}
          onChange={setSectFilter} />
        <ChipGroup label="並び"
          value={sortKey}
          options={[
            { key: 'lastVisit', label: '最近のお参り' },
            { key: 'name', label: '家名' },
            { key: 'members', label: '家族数' },
            { key: 'joined', label: '加入年' },
          ]}
          onChange={setSortKey} />
        <div className="count">{filtered.length}家 / 全{all.length}家</div>
      </div>

      <div className="parish-body">
        <TableView items={sorted} selected={selectedId} onSelect={setSelectedId} />

        <aside className="parish-detail card-block">
          {selected && <ParishDetail f={selected} members={members} />}
        </aside>
      </div>
    </div>
  );
}
