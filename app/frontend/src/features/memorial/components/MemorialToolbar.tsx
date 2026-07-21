// 過去帳一覧のフィルタ群（家セレクト・並び順セレクト）。
// デスクトップはツールバー内にインライン、SP は FilterSheet の中に描画する。

import type { HouseholdOption } from '../types';

// 一覧の並び順キー（サーバ対応は recent|name のみ。upcoming はフロント導出）。
export type MemorialSortKey = 'upcoming' | 'recent' | 'name';

interface MemorialToolbarProps {
  households: HouseholdOption[];
  familyFilter: string;
  sort: MemorialSortKey;
  onChangeFamily: (value: string) => void;
  onChangeSort: (value: MemorialSortKey) => void;
}

export function MemorialToolbar({
  households,
  familyFilter,
  sort,
  onChangeFamily,
  onChangeSort,
}: MemorialToolbarProps) {
  return (
    <>
      <div className="mt-filter">
        <label>家</label>
        <select value={familyFilter} onChange={(e) => onChangeFamily(e.target.value)}>
          <option value="all">すべての家</option>
          {households.map((h) => (
            <option key={h.id} value={h.id}>{h.familyName}</option>
          ))}
        </select>
      </div>
      <div className="mt-filter">
        <label>並び順</label>
        <select value={sort} onChange={(e) => onChangeSort(e.target.value as MemorialSortKey)}>
          <option value="upcoming">年忌が近い順</option>
          <option value="recent">没年月日が新しい順</option>
          <option value="name">家名順</option>
        </select>
      </div>
    </>
  );
}
