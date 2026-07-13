// 過去帳 — メインビュー（一覧 + 詳細）。

import * as React from 'react';

import type { PushToast } from '@/types/toast';

import { MEMORIAL_ENTRIES } from '../constants';
import type { MemorialEntry, NewMemorialForm } from '../types';
import { fmtJpDateShort, toEra, yearsUntil } from '../utils';
import { MemorialDetail } from './MemorialDetail';
import { NewMemorialDialog } from './NewMemorialDialog';

interface MemorialPageProps {
  onOpenNew: () => void;
  onToast?: PushToast;
}

function toNewMemorialForm(entry: MemorialEntry): NewMemorialForm {
  return {
    prefix: entry.prefix,
    name: entry.name,
    rank: entry.rank,
    secular: entry.secular,
    age: String(entry.age),
    deceased: entry.deceased,
    family: entry.family,
    relation: entry.relation,
    sect: entry.sect,
    notes: entry.notes,
  };
}

export function MemorialPage({ onOpenNew, onToast }: MemorialPageProps) {
  const [q, setQ] = React.useState('');
  const [familyFilter, setFamilyFilter] = React.useState('all');
  const [sort, setSort] = React.useState('upcoming'); // upcoming | recent | name
  const [selectedId, setSelectedId] = React.useState(MEMORIAL_ENTRIES[0].id);
  const [editOpen, setEditOpen] = React.useState(false);

  const families = React.useMemo(() => {
    const set = new Set(MEMORIAL_ENTRIES.map(e => e.family));
    return ['all', ...Array.from(set)];
  }, []);

  const filtered = React.useMemo(() => {
    let arr = MEMORIAL_ENTRIES.filter(e => {
      if (familyFilter !== 'all' && e.family !== familyFilter) return false;
      if (q) {
        const ql = q.toLowerCase();
        return (
          e.kaimyo.toLowerCase().includes(ql) ||
          e.secular.toLowerCase().includes(ql) ||
          e.family.toLowerCase().includes(ql)
        );
      }
      return true;
    });
    if (sort === 'upcoming') {
      arr = arr.slice().sort((a, b) => {
        const da = yearsUntil(a.nextDate);
        const db = yearsUntil(b.nextDate);
        // Upcoming (positive) first, then descending; past (negative) last
        const score = (n: number) => n >= 0 ? n : 100000 - n;
        return score(da) - score(db);
      });
    } else if (sort === 'recent') {
      arr = arr.slice().sort((a, b) => b.deceased.localeCompare(a.deceased));
    } else if (sort === 'name') {
      arr = arr.slice().sort((a, b) => a.family.localeCompare(b.family, 'ja'));
    }
    return arr;
  }, [q, familyFilter, sort]);

  const selected = filtered.find(e => e.id === selectedId) || filtered[0] || MEMORIAL_ENTRIES[0];
  const editInitial = React.useMemo(() => (selected ? toNewMemorialForm(selected) : undefined), [selected]);

  React.useEffect(() => {
    if (filtered.length && !filtered.find(e => e.id === selectedId)) {
      setSelectedId(filtered[0].id);
    }
  }, [filtered, selectedId]);

  // Stat: upcoming this year
  const upcomingCount = MEMORIAL_ENTRIES.filter(e => {
    const d = yearsUntil(e.nextDate);
    return d >= 0 && d <= 365;
  }).length;

  return (
    <div className="page-shell memorial-page">
      <div className="page-head">
        <div>
          <h1>過去帳</h1>
          <p>戒名と年忌の記録を管理します。</p>
        </div>
        <div className="head-actions">
          <button className="btn primary purple" type="button" onClick={onOpenNew}>
            <svg viewBox="0 0 24 24"><line x1="12" x2="12" y1="5" y2="19"/><line x1="5" x2="19" y1="12" y2="12"/></svg>
            新規登録
          </button>
        </div>
      </div>

      <div className="memorial-stats">
        <div className="mstat">
          <div className="mstat-l">過去帳記録数</div>
          <div className="mstat-v">{MEMORIAL_ENTRIES.length}<span className="mstat-u">件</span></div>
        </div>
        <div className="mstat">
          <div className="mstat-l">今年度の年忌</div>
          <div className="mstat-v">{upcomingCount}<span className="mstat-u">件</span></div>
        </div>
        <div className="mstat">
          <div className="mstat-l">今月の年忌</div>
          <div className="mstat-v">
            {MEMORIAL_ENTRIES.filter(e => {
              const d = yearsUntil(e.nextDate);
              return d >= 0 && d <= 31;
            }).length}
            <span className="mstat-u">件</span>
          </div>
        </div>
        <div className="mstat">
          <div className="mstat-l">関連する檀家</div>
          <div className="mstat-v">{new Set(MEMORIAL_ENTRIES.map(e => e.familyId)).size}<span className="mstat-u">家</span></div>
        </div>
      </div>

      <div className="memorial-tools">
        <div className="search-wrap">
          <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="戒名・俗名・家名で検索" />
        </div>
        <div className="mt-filter">
          <label>家</label>
          <select value={familyFilter} onChange={(e) => setFamilyFilter(e.target.value)}>
            {families.map(f => (
              <option key={f} value={f}>{f === 'all' ? 'すべての家' : f}</option>
            ))}
          </select>
        </div>
        <div className="mt-filter">
          <label>並び順</label>
          <select value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="upcoming">年忌が近い順</option>
            <option value="recent">没年月日が新しい順</option>
            <option value="name">家名順</option>
          </select>
        </div>
        <div className="mt-count">{filtered.length}件</div>
      </div>

      <div className="memorial-body">
        <div className="card memorial-list-card">
          {filtered.length === 0 ? (
            <div className="empty">該当する記録はありません。</div>
          ) : (
            <>
              <div className="memorial-list-head">
                <div className="mlh-main">戒名・俗名</div>
                <div className="mlh-date">没年月日</div>
                <div className="mlh-next">次の年忌</div>
              </div>
              <ul className="memorial-list">
              {filtered.map(entry => {
                const days = yearsUntil(entry.nextDate);
                const upcoming = days >= 0 && days <= 365;
                const thisMonth = days >= 0 && days <= 31;
                return (
                  <li key={entry.id}
                      className={'memorial-row' + (entry.id === selectedId ? ' selected' : '')}
                      onClick={() => setSelectedId(entry.id)}>
                    <div className="mr-main">
                      <div className="mr-kaimyo">{entry.kaimyo}</div>
                      <div className="mr-sub">
                        <span className="secular">{entry.secular}</span>
                        <span className="dot-sep">・</span>
                        <span>{entry.family}</span>
                        <span className="dot-sep">・</span>
                        <span>{entry.relation}</span>
                      </div>
                    </div>
                    <div className="mr-date">
                      <div className="d-l">没年月日</div>
                      <div className="d-v">{toEra(entry.deceased)}</div>
                      <div className="d-meta">享年 {entry.age}</div>
                    </div>
                    <div className="mr-next">
                      {upcoming ? (
                        <span className={'next-chip' + (thisMonth ? ' soon' : '')}>
                          {entry.anniversary}
                          <span className="next-d">{fmtJpDateShort(entry.nextDate)}</span>
                        </span>
                      ) : days < 0 ? (
                        <span className="next-chip done">{entry.anniversary} 済</span>
                      ) : (
                        <span className="next-chip pending">{entry.anniversary}</span>
                      )}
                    </div>
                  </li>
                );
              })}
              </ul>
            </>
          )}
        </div>

        <MemorialDetail entry={selected} onEdit={() => setEditOpen(true)} />
      </div>

      <NewMemorialDialog
        open={editOpen}
        initial={editInitial}
        onClose={() => setEditOpen(false)}
        onSave={(form) => {
          setEditOpen(false);
          onToast?.({ kind: 'success', title: '過去帳を更新しました。', desc: (form.prefix + ' ' + form.name + ' ' + form.rank).trim() + ' / ' + form.secular });
        }}
      />
    </div>
  );
}
