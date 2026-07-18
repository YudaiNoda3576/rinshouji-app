// 過去帳 — メインビュー（一覧 + 詳細）。実 API（/api/deceased, /api/households）接続版。

import * as React from 'react';

import type { PushToast } from '@/types/toast';

import { Pagination } from '@/components/ui/Pagination';

import {
  createDeceased,
  fetchDeceasedDetail,
  fetchDeceasedList,
  fetchHouseholdOptions,
  updateDeceased,
} from '../api';
import { PAGE_SIZE } from '../constants';
import { useDebouncedValue } from '../hooks';
import type { DeceasedDetail, DeceasedForm, DeceasedListItem, HouseholdOption, NextAnniversary } from '../types';
import { anniversarySortKey, fmtDeathDate, nextAnniversary, toDeceasedForm, toDeceasedPayload } from '../utils';
import { MemorialDetail } from './MemorialDetail';
import { NewMemorialDialog } from './NewMemorialDialog';

interface MemorialPageProps {
  onToast?: PushToast;
}

type SortKey = 'upcoming' | 'recent' | 'name';

function renderNextChip(next: NextAnniversary | null) {
  if (!next) {
    return <span className="next-chip pending">不明</span>;
  }
  if (next.status === 'done') {
    return <span className="next-chip done">{next.label} 済</span>;
  }
  if (next.status === 'monthDayUnknown') {
    return (
      <span className="next-chip pending">
        {next.label}
        <span className="next-d">{next.year}年度・月日未定</span>
      </span>
    );
  }
  const soon = next.daysUntil != null && next.daysUntil <= 31;
  return (
    <span className={'next-chip' + (soon ? ' soon' : '')}>
      {next.label}
      <span className="next-d">あと{next.daysUntil}日</span>
    </span>
  );
}

export function MemorialPage({ onToast }: MemorialPageProps) {
  const [q, setQ] = React.useState('');
  const debouncedQ = useDebouncedValue(q, 300);
  const [familyFilter, setFamilyFilter] = React.useState('all');
  const [sort, setSort] = React.useState<SortKey>('upcoming');
  // クライアントサイドページング（フェッチは page に依存しないため二重フェッチは起きない）。
  const [page, setPage] = React.useState(1);

  const [households, setHouseholds] = React.useState<HouseholdOption[]>([]);

  const [list, setList] = React.useState<DeceasedListItem[]>([]);
  const [listLoading, setListLoading] = React.useState(true);
  const [listError, setListError] = React.useState<string | null>(null);

  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [detail, setDetail] = React.useState<DeceasedDetail | null>(null);
  const [detailLoading, setDetailLoading] = React.useState(false);
  const [detailError, setDetailError] = React.useState<string | null>(null);

  const [newOpen, setNewOpen] = React.useState(false);
  const [editOpen, setEditOpen] = React.useState(false);
  const [reloadToken, setReloadToken] = React.useState(0);

  // 檀家セレクト（家フィルタ用）。households API から一括取得する。
  React.useEffect(() => {
    let cancelled = false;
    fetchHouseholdOptions('')
      .then((opts) => { if (!cancelled) setHouseholds(opts); })
      .catch((err: unknown) => {
        if (cancelled) return;
        onToast?.({
          kind: 'error',
          title: '檀家一覧の取得に失敗しました。',
          desc: err instanceof Error ? err.message : undefined,
        });
      });
    return () => { cancelled = true; };
    // onToast はページ生存中は安定した参照として扱う（依存に含めると再取得ループになるため除外）。
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 一覧取得: 検索(q, 300msデバウンス)・家フィルタはサーバへ。ソートは recent|name のみサーバ対応。
  React.useEffect(() => {
    let cancelled = false;
    setListLoading(true);
    setListError(null);
    fetchDeceasedList({
      q: debouncedQ || undefined,
      householdId: familyFilter !== 'all' ? familyFilter : undefined,
      sort: sort === 'name' ? 'name' : 'recent',
    })
      .then((data) => {
        if (cancelled) return;
        setList(data);
        setListLoading(false);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setListError(err instanceof Error ? err.message : '過去帳一覧の取得に失敗しました。');
        setListLoading(false);
      });
    return () => { cancelled = true; };
  }, [debouncedQ, familyFilter, sort, reloadToken]);

  // 「年忌が近い順」はサーバ未対応のため、recent 取得後にフロントで導出してソートする。
  const nextMap = React.useMemo(() => {
    const m = new Map<string, NextAnniversary | null>();
    for (const e of list) m.set(e.id, nextAnniversary(e));
    return m;
  }, [list]);

  const displayedList = React.useMemo(() => {
    if (sort !== 'upcoming') return list;
    return [...list].sort(
      (a, b) => anniversarySortKey(nextMap.get(a.id) ?? null) - anniversarySortKey(nextMap.get(b.id) ?? null),
    );
  }, [list, sort, nextMap]);

  // 検索・家フィルタ・並び順の変更時は1ページ目に戻す。
  React.useEffect(() => {
    setPage(1);
  }, [debouncedQ, familyFilter, sort]);

  // 表示ページの切り出し。削除等で範囲外になった場合は導出値でクランプする。
  const totalPages = Math.max(1, Math.ceil(displayedList.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pagedList = React.useMemo(
    () => displayedList.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE),
    [displayedList, safePage],
  );

  // 選択中IDが表示ページから外れたらページ先頭を選び直す。
  React.useEffect(() => {
    if (pagedList.length === 0) {
      if (selectedId !== null) setSelectedId(null);
      return;
    }
    if (!pagedList.some((e) => e.id === selectedId)) {
      setSelectedId(pagedList[0].id);
    }
  }, [pagedList, selectedId]);

  // 詳細取得。
  React.useEffect(() => {
    if (!selectedId) {
      setDetail(null);
      setDetailError(null);
      return;
    }
    let cancelled = false;
    setDetailLoading(true);
    setDetailError(null);
    fetchDeceasedDetail(selectedId)
      .then((data) => {
        if (cancelled) return;
        setDetail(data);
        setDetailLoading(false);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setDetailError(err instanceof Error ? err.message : '詳細の取得に失敗しました。');
        setDetailLoading(false);
      });
    return () => { cancelled = true; };
  }, [selectedId, reloadToken]);

  const editInitial = React.useMemo<DeceasedForm | undefined>(
    () => (detail ? toDeceasedForm(detail) : undefined),
    [detail],
  );

  // 統計カード: 現在ロード済み（検索・家フィルタ適用後）の一覧から算出できるもののみ残す。
  // スケジュール機能未接続のため「直近の予定」系は算出不可（一覧側の同種項目も未接続のため据え置き）。
  const stats = React.useMemo(() => {
    const now = new Date();
    let upcomingThisYear = 0;
    let upcomingThisMonth = 0;
    const relatedHouseholds = new Set<string>();
    for (const e of list) {
      if (e.householdId) relatedHouseholds.add(e.householdId);
      const next = nextMap.get(e.id) ?? null;
      if (!next) continue;
      if (next.status === 'upcoming' && next.daysUntil != null) {
        if (next.daysUntil >= 0 && next.daysUntil <= 365) upcomingThisYear += 1;
        if (next.daysUntil >= 0 && next.daysUntil <= 31) upcomingThisMonth += 1;
      } else if (next.status === 'monthDayUnknown' && next.year === now.getFullYear()) {
        upcomingThisYear += 1;
      }
    }
    return {
      total: list.length,
      upcomingThisYear,
      upcomingThisMonth,
      relatedHouseholds: relatedHouseholds.size,
    };
  }, [list, nextMap]);

  const retryList = () => setReloadToken((t) => t + 1);
  const retryDetail = () => setReloadToken((t) => t + 1);

  const handleCreate = async (form: DeceasedForm) => {
    const result = await createDeceased(toDeceasedPayload(form));
    onToast?.({ kind: 'success', title: '過去帳に登録しました。', desc: `${form.kaimyo} / ${form.secularName}` });
    setNewOpen(false);
    setReloadToken((t) => t + 1);
    setSelectedId(result.id);
  };

  const handleUpdate = async (form: DeceasedForm) => {
    if (!selectedId) return;
    await updateDeceased(selectedId, toDeceasedPayload(form));
    onToast?.({ kind: 'success', title: '過去帳を更新しました。', desc: `${form.kaimyo} / ${form.secularName}` });
    setEditOpen(false);
    setReloadToken((t) => t + 1);
  };

  return (
    <div className="page-shell memorial-page">
      <div className="page-head">
        <div>
          <h1>過去帳</h1>
          <p>戒名と年忌の記録を管理します。</p>
        </div>
        <div className="head-actions">
          <button className="btn primary purple" type="button" onClick={() => setNewOpen(true)}>
            <svg viewBox="0 0 24 24"><line x1="12" x2="12" y1="5" y2="19"/><line x1="5" x2="19" y1="12" y2="12"/></svg>
            新規登録
          </button>
        </div>
      </div>

      <div className="memorial-stats">
        <div className="mstat">
          <div className="mstat-l">過去帳記録数</div>
          <div className="mstat-v">{stats.total}<span className="mstat-u">件</span></div>
        </div>
        <div className="mstat">
          <div className="mstat-l">今年度の年忌</div>
          <div className="mstat-v">{stats.upcomingThisYear}<span className="mstat-u">件</span></div>
        </div>
        <div className="mstat">
          <div className="mstat-l">今月の年忌</div>
          <div className="mstat-v">{stats.upcomingThisMonth}<span className="mstat-u">件</span></div>
        </div>
        <div className="mstat">
          <div className="mstat-l">関連する檀家</div>
          <div className="mstat-v">{stats.relatedHouseholds}<span className="mstat-u">家</span></div>
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
            <option value="all">すべての家</option>
            {households.map((h) => (
              <option key={h.id} value={h.id}>{h.familyName}</option>
            ))}
          </select>
        </div>
        <div className="mt-filter">
          <label>並び順</label>
          <select value={sort} onChange={(e) => setSort(e.target.value as SortKey)}>
            <option value="upcoming">年忌が近い順</option>
            <option value="recent">没年月日が新しい順</option>
            <option value="name">家名順</option>
          </select>
        </div>
        <div className="mt-count">{displayedList.length}件</div>
      </div>

      <div className="memorial-body">
        <div className="card memorial-list-card">
          {listLoading ? (
            <div className="empty">読み込み中…</div>
          ) : listError ? (
            <div className="empty memorial-error">
              <p>{listError}</p>
              <button className="btn outline" type="button" onClick={retryList}>再試行</button>
            </div>
          ) : displayedList.length === 0 ? (
            <div className="empty">該当する記録はありません。</div>
          ) : (
            <>
              <div className="memorial-list-head">
                <div className="mlh-main">戒名・俗名</div>
                <div className="mlh-date">没年月日</div>
                <div className="mlh-next">次の年忌</div>
              </div>
              <ul className="memorial-list">
                {pagedList.map((entry) => {
                  const deathDate = fmtDeathDate(entry);
                  const next = nextMap.get(entry.id) ?? null;
                  return (
                    <li
                      key={entry.id}
                      className={'memorial-row' + (entry.id === selectedId ? ' selected' : '')}
                      onClick={() => setSelectedId(entry.id)}
                    >
                      <div className="mr-main">
                        <div className="mr-kaimyo">{entry.kaimyo}</div>
                        <div className="mr-sub">
                          <span className="secular">{entry.secularName}</span>
                          <span className="dot-sep">・</span>
                          <span>{entry.householdId ? (entry.familyName ?? '(家名未設定)') : '関連檀家なし'}</span>
                          {entry.relationToHead && (
                            <>
                              <span className="dot-sep">・</span>
                              <span>{entry.relationToHead}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="mr-date">
                        <div className="d-l">没年月日</div>
                        <div className="d-v">{deathDate.text}</div>
                        <div className="d-meta">享年 {entry.ageAtDeath != null ? entry.ageAtDeath : '不詳'}</div>
                      </div>
                      <div className="mr-next">{renderNextChip(next)}</div>
                    </li>
                  );
                })}
              </ul>
              <Pagination page={safePage} total={displayedList.length} pageSize={PAGE_SIZE} onChange={setPage} />
            </>
          )}
        </div>

        {detailLoading ? (
          <aside className="card memorial-detail"><div className="empty">読み込み中…</div></aside>
        ) : detailError ? (
          <aside className="card memorial-detail">
            <div className="empty memorial-error">
              <p>{detailError}</p>
              <button className="btn outline" type="button" onClick={retryDetail}>再試行</button>
            </div>
          </aside>
        ) : detail ? (
          <MemorialDetail entry={detail} onEdit={() => setEditOpen(true)} />
        ) : (
          <aside className="card memorial-detail"><div className="empty">過去帳の記録を選択してください。</div></aside>
        )}
      </div>

      <NewMemorialDialog
        open={newOpen}
        onClose={() => setNewOpen(false)}
        onSave={handleCreate}
      />

      <NewMemorialDialog
        open={editOpen}
        initial={editInitial}
        onClose={() => setEditOpen(false)}
        onSave={handleUpdate}
      />
    </div>
  );
}
