import * as React from 'react';

import type { PushToast } from '@/types/toast';

import { ChipGroup } from '@/components/ui/ChipGroup';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Pagination } from '@/components/ui/Pagination';

import {
  createHousehold,
  deleteHousehold,
  fetchDistricts,
  fetchHousehold,
  fetchHouseholds,
  updateHousehold,
} from '../api';
import {
  RELATION_TYPES,
  formatFamilyName,
  level1Districts,
  level2Districts,
} from '../constants';
import type {
  District,
  HouseholdDetail,
  HouseholdForm,
  HouseholdRow,
  HouseholdSort,
} from '../types';

import { NewParishDialog } from './NewParishDialog';
import { ParishDetail } from './ParishDetail';
import { TableView } from './TableView';

interface ParishionersPageProps {
  onToast?: PushToast;
}

const SORT_OPTIONS = [
  { key: 'name', label: '家名' },
  { key: 'district', label: '地区' },
  { key: 'deceased', label: '過去帳人数' },
];

// HouseholdDetail を編集フォームの初期値へ変換する。
function toForm(detail: HouseholdDetail): HouseholdForm {
  const { household, members } = detail;
  const head = members.find(m => m.memberRole === 'head');
  return {
    familyName: household.familyName ?? '',
    headName: head?.name ?? '',
    headKana: head?.nameKana ?? '',
    districtId: household.districtId,
    relationType: household.relationType ?? '',
    status: household.status,
    postalCode: household.postalCode ?? '',
    address1: household.address1 ?? '',
    address2: household.address2 ?? '',
    phone: household.phone ?? '',
    mobilePhone: household.mobilePhone ?? '',
    hannyaService: household.hannyaService ?? '',
    sejikiService: household.sejikiService ?? '',
    tanagyoSchedule: household.tanagyoSchedule ?? '',
    monthlyServiceDay: household.monthlyServiceDay ?? '',
    jizoFlag: household.jizoFlag,
    ihaiStatus: household.ihaiStatus ?? '',
    note: household.note ?? '',
  };
}

export function ParishionersPage({ onToast }: ParishionersPageProps) {
  const [districts, setDistricts] = React.useState<District[]>([]);

  // 一覧
  const [list, setList] = React.useState<HouseholdRow[]>([]);
  const [listLoading, setListLoading] = React.useState(true);
  const [listError, setListError] = React.useState<string | null>(null);

  // ページネーション（サーバーサイド）
  const [page, setPage] = React.useState(1);
  const [total, setTotal] = React.useState(0);
  const [pageSize, setPageSize] = React.useState(20);

  // 検索・フィルタ・ソート
  const [q, setQ] = React.useState('');
  const [debouncedQ, setDebouncedQ] = React.useState('');
  const [filterD1, setFilterD1] = React.useState<number | null>(null);
  const [filterD2, setFilterD2] = React.useState<number | null>(null);
  const [relationType, setRelationType] = React.useState('');
  const [includeInactive, setIncludeInactive] = React.useState(false);
  const [sort, setSort] = React.useState<HouseholdSort>('name');

  // 詳細
  const [selectedId, setSelectedId] = React.useState<number | null>(null);
  const [detail, setDetail] = React.useState<HouseholdDetail | null>(null);
  const [detailLoading, setDetailLoading] = React.useState(false);
  const [detailError, setDetailError] = React.useState<string | null>(null);

  // ダイアログ
  const [newOpen, setNewOpen] = React.useState(false);
  const [editOpen, setEditOpen] = React.useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = React.useState(false);

  const [reloadKey, setReloadKey] = React.useState(0);
  const reloadList = () => setReloadKey(k => k + 1);

  const filterDistrictId = filterD2 ?? filterD1;

  // q のデバウンス（300ms）。検索文字列の確定時に1ページ目へ戻す
  // （filter/sort 変更時のリセットと同様、ハンドラ側でまとめて更新し二重フェッチを防ぐ）。
  React.useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedQ(q);
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [q]);

  // 地区マスタの取得（初回のみ）。
  React.useEffect(() => {
    const ctrl = new AbortController();
    fetchDistricts(ctrl.signal)
      .then(setDistricts)
      .catch((e: unknown) => {
        if (!ctrl.signal.aborted) console.error('地区マスタの取得に失敗しました', e);
      });
    return () => ctrl.abort();
  }, []);

  // 一覧の取得（検索・フィルタ・ソート・ページ・再読込トリガーに反応）。
  React.useEffect(() => {
    const ctrl = new AbortController();
    setListLoading(true);
    setListError(null);
    fetchHouseholds(
      { q: debouncedQ, districtId: filterDistrictId, relationType, includeInactive, sort, page },
      ctrl.signal,
    )
      .then(res => {
        // 削除等で現在ページが総ページ数を超えた場合は最終ページへ戻す
        // （このフェッチ結果は破棄し、補正後のページで再取得させる）。
        if (res.items.length === 0 && res.total > 0) {
          const lastPage = Math.max(1, Math.ceil(res.total / res.pageSize));
          if (lastPage !== page) {
            setPage(lastPage);
            return;
          }
        }
        setList(res.items);
        setTotal(res.total);
        setPageSize(res.pageSize);
        setSelectedId(prev => {
          if (prev != null && res.items.some(r => r.id === prev)) return prev;
          return res.items.length > 0 ? res.items[0].id : null;
        });
      })
      .catch((e: unknown) => {
        if (ctrl.signal.aborted) return;
        setListError(e instanceof Error ? e.message : '一覧の取得に失敗しました。');
        setList([]);
        setTotal(0);
        setSelectedId(null);
      })
      .finally(() => {
        if (!ctrl.signal.aborted) setListLoading(false);
      });
    return () => ctrl.abort();
  }, [debouncedQ, filterDistrictId, relationType, includeInactive, sort, page, reloadKey]);

  // 詳細の取得（選択変更・再読込に反応）。
  React.useEffect(() => {
    if (selectedId == null) {
      setDetail(null);
      setDetailError(null);
      return;
    }
    const ctrl = new AbortController();
    setDetailLoading(true);
    setDetailError(null);
    fetchHousehold(selectedId, ctrl.signal)
      .then(setDetail)
      .catch((e: unknown) => {
        if (ctrl.signal.aborted) return;
        setDetail(null);
        setDetailError(e instanceof Error ? e.message : '詳細の取得に失敗しました。');
      })
      .finally(() => {
        if (!ctrl.signal.aborted) setDetailLoading(false);
      });
    return () => ctrl.abort();
  }, [selectedId, reloadKey]);

  const editInitial = React.useMemo(
    () => (detail ? toForm(detail) : undefined),
    [detail],
  );

  const handleCreate = async (form: HouseholdForm) => {
    try {
      const { id } = await createHousehold(form);
      setNewOpen(false);
      onToast?.({ kind: 'success', title: '檀家を登録しました。', desc: `${formatFamilyName(form.familyName)} / ${form.headName}` });
      setSelectedId(id);
      reloadList();
    } catch (e) {
      onToast?.({ kind: 'error', title: '登録に失敗しました。', desc: e instanceof Error ? e.message : undefined });
    }
  };

  const handleUpdate = async (form: HouseholdForm) => {
    if (selectedId == null) return;
    try {
      await updateHousehold(selectedId, form);
      setEditOpen(false);
      onToast?.({ kind: 'success', title: '檀家情報を更新しました。', desc: `${formatFamilyName(form.familyName)} / ${form.headName}` });
      reloadList();
    } catch (e) {
      onToast?.({ kind: 'error', title: '更新に失敗しました。', desc: e instanceof Error ? e.message : undefined });
    }
  };

  const handleDelete = async () => {
    if (selectedId == null) return;
    try {
      await deleteHousehold(selectedId);
      const label = detail ? formatFamilyName(detail.household.familyName) : undefined;
      setDeleteConfirmOpen(false);
      setEditOpen(false);
      setSelectedId(null);
      onToast?.({ kind: 'info', title: '檀家を削除しました。', desc: label });
      reloadList();
    } catch (e) {
      onToast?.({ kind: 'error', title: '削除に失敗しました。', desc: e instanceof Error ? e.message : undefined });
    }
  };

  return (
    <div className="parish-page">
      <div className="page-head">
        <div>
          <h1>檀家管理</h1>
          <p>檀家家別の情報、家族構成、過去帳を管理します。</p>
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
          <input placeholder="家名・戸主名・フリガナ・住所で検索" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <div className="parish-filters">
          <select className="input-plain" value={filterD1 ?? ''}
                  onChange={(e) => { const v = e.target.value === '' ? null : Number(e.target.value); setFilterD1(v); setFilterD2(null); setPage(1); }}>
            <option value="">地区（区分1）</option>
            {level1Districts(districts).map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
          <select className="input-plain" value={filterD2 ?? ''} disabled={filterD1 == null}
                  onChange={(e) => { setFilterD2(e.target.value === '' ? null : Number(e.target.value)); setPage(1); }}>
            <option value="">区分2</option>
            {level2Districts(districts, filterD1).map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
          <select className="input-plain" value={relationType} onChange={(e) => { setRelationType(e.target.value); setPage(1); }}>
            <option value="">関係区分（全て）</option>
            {RELATION_TYPES.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
        <ChipGroup label="並び"
          value={sort}
          options={SORT_OPTIONS}
          onChange={(v) => { setSort(v as HouseholdSort); setPage(1); }} />
        <label className="check-label parish-incl">
          <input type="checkbox" checked={includeInactive} onChange={(e) => { setIncludeInactive(e.target.checked); setPage(1); }} />
          離檀世帯を含む
        </label>
        <div className="count">{total}家</div>
      </div>

      <div className="parish-body">
        <div className="parish-list-col">
          {listError ? (
            <div className="parish-state card-block">
              <p>{listError}</p>
              <button className="btn outline" onClick={reloadList}>再試行</button>
            </div>
          ) : listLoading && list.length === 0 ? (
            <div className="parish-state card-block"><p>読み込み中…</p></div>
          ) : (
            <>
              <TableView items={list} selected={selectedId} onSelect={setSelectedId} />
              <Pagination page={page} total={total} pageSize={pageSize} onChange={setPage} />
            </>
          )}
        </div>

        <aside className="parish-detail card-block">
          {detailError ? (
            <div className="parish-state">
              <p>{detailError}</p>
              <button className="btn outline" onClick={reloadList}>再試行</button>
            </div>
          ) : detailLoading && !detail ? (
            <div className="parish-state"><p>読み込み中…</p></div>
          ) : detail ? (
            <ParishDetail detail={detail} onEdit={() => setEditOpen(true)} />
          ) : (
            <div className="parish-state"><p>世帯を選択してください。</p></div>
          )}
        </aside>
      </div>

      <NewParishDialog
        open={newOpen}
        districts={districts}
        onClose={() => setNewOpen(false)}
        onSave={handleCreate}
      />

      <NewParishDialog
        open={editOpen}
        initial={editInitial}
        districts={districts}
        onClose={() => setEditOpen(false)}
        onSave={handleUpdate}
        onDelete={() => setDeleteConfirmOpen(true)}
      />

      <ConfirmDialog
        open={deleteConfirmOpen}
        title="檀家を削除しますか?"
        body={detail ? <>「{formatFamilyName(detail.household.familyName)}」の情報を削除します。この操作は取り消せません。</> : null}
        confirmLabel="削除する"
        danger
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirmOpen(false)}
      />
    </div>
  );
}
