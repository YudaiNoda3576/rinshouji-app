import * as React from 'react';

import type { PushToast } from '@/types/toast';

import { ChipGroup } from '@/components/ui/ChipGroup';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

import { PARISH_FAMILIES, buildMembers, daysAgo } from '../constants';
import type { NewParishForm, ParishFamily } from '../types';

import { NewParishDialog } from './NewParishDialog';
import { ParishDetail } from './ParishDetail';
import { TableView } from './TableView';

interface ParishionersPageProps {
  onToast?: PushToast;
}

function toNewParishForm(f: ParishFamily): NewParishForm {
  return {
    name: f.name,
    head: f.head,
    sect: f.sect,
    members: f.members,
    addr: f.addr,
    phone: f.phone,
    zone: f.zone,
    note: '',
  };
}

export function ParishionersPage({ onToast }: ParishionersPageProps) {
  const all = PARISH_FAMILIES;
  const [q, setQ] = React.useState('');
  const [sortKey, setSortKey] = React.useState('lastVisit');
  const [selectedId, setSelectedId] = React.useState(all[0].id);
  const [newOpen, setNewOpen] = React.useState(false);
  const [editOpen, setEditOpen] = React.useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = React.useState(false);

  const filtered = all.filter(f =>
    q === '' || f.name.includes(q) || f.head.includes(q) || f.addr.includes(q)
  );
  const sorted = [...filtered].sort((a, b) => {
    if (sortKey === 'name') return a.name.localeCompare(b.name, 'ja');
    if (sortKey === 'members') return b.members - a.members;
    if (sortKey === 'joined') return a.joined - b.joined;
    return daysAgo(a.lastVisit) - daysAgo(b.lastVisit);
  });
  const selected = all.find(f => f.id === selectedId) || sorted[0];
  const members = selected ? buildMembers(selected.name) : [];
  const editInitial = React.useMemo(() => (selected ? toNewParishForm(selected) : undefined), [selected]);

  return (
    <div className="parish-page">
      <div className="page-head">
        <div>
          <h1>檀家管理</h1>
          <p>檀家家別の情報、家族構成、過去帳、お参り履歴を管理します。</p>
        </div>
        <div className="head-actions">
          <button className="btn primary" onClick={() => setNewOpen(true)}>
            <svg viewBox="0 0 24 24"><line x1="12" x2="12" y1="5" y2="19"/><line x1="5" x2="19" y1="12" y2="12"/></svg>
            新規檀家登録
          </button>
        </div>
      </div>

      <div className="parish-tools">
        <div className="search-wrap">
          <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" x2="16.65" y1="21" y2="16.65"/></svg>
          <input placeholder="家名・戸主名・住所で検索" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
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
          {selected && <ParishDetail f={selected} members={members} onEdit={() => setEditOpen(true)} />}
        </aside>
      </div>

      <NewParishDialog
        open={newOpen}
        onClose={() => setNewOpen(false)}
        onSave={(form) => {
          setNewOpen(false);
          onToast?.({ kind: 'success', title: '檀家を登録しました。', desc: form.name + '家 / ' + form.head });
        }}
      />

      <NewParishDialog
        open={editOpen}
        initial={editInitial}
        onClose={() => setEditOpen(false)}
        onSave={(form) => {
          setEditOpen(false);
          onToast?.({ kind: 'success', title: '檀家情報を更新しました。', desc: form.name + '家 / ' + form.head });
        }}
        onDelete={() => setDeleteConfirmOpen(true)}
      />

      <ConfirmDialog
        open={deleteConfirmOpen}
        title="檀家を削除しますか?"
        body={selected ? <>「{selected.name}家」の情報を削除します。この操作は取り消せません。</> : null}
        confirmLabel="削除する"
        danger
        onConfirm={() => {
          setDeleteConfirmOpen(false);
          setEditOpen(false);
          onToast?.({ kind: 'info', title: '檀家を削除しました。', desc: selected ? selected.name + '家' : undefined });
        }}
        onCancel={() => setDeleteConfirmOpen(false)}
      />
    </div>
  );
}
