import { ChipGroup } from '@/components/ui/ChipGroup';

import { RELATION_TYPES, level1Districts, level2Districts } from '../constants';
import type { District, HouseholdSort } from '../types';

// 並び替えの選択肢（家名・地区・過去帳人数）。
const SORT_OPTIONS = [
  { key: 'name', label: '家名' },
  { key: 'district', label: '地区' },
  { key: 'deceased', label: '過去帳人数' },
];

// 檀家一覧のフィルタ群（地区セレクト×2・関係区分・並び替え・離檀含むチェック）。
// デスクトップはツールバー内にインライン、SP は FilterSheet の中に描画する。
interface ParishFiltersProps {
  districts: District[];
  filterD1: number | null;
  filterD2: number | null;
  relationType: string;
  includeInactive: boolean;
  sort: HouseholdSort;
  onChangeD1: (value: number | null) => void;
  onChangeD2: (value: number | null) => void;
  onChangeRelationType: (value: string) => void;
  onChangeIncludeInactive: (value: boolean) => void;
  onChangeSort: (value: HouseholdSort) => void;
}

export function ParishFilters({
  districts,
  filterD1,
  filterD2,
  relationType,
  includeInactive,
  sort,
  onChangeD1,
  onChangeD2,
  onChangeRelationType,
  onChangeIncludeInactive,
  onChangeSort,
}: ParishFiltersProps) {
  return (
    <>
      <div className="parish-filters">
        <select className="input-plain" value={filterD1 ?? ''}
                onChange={(e) => onChangeD1(e.target.value === '' ? null : Number(e.target.value))}>
          <option value="">地区（区分1）</option>
          {level1Districts(districts).map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
        <select className="input-plain" value={filterD2 ?? ''} disabled={filterD1 == null}
                onChange={(e) => onChangeD2(e.target.value === '' ? null : Number(e.target.value))}>
          <option value="">区分2</option>
          {level2Districts(districts, filterD1).map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
        <select className="input-plain" value={relationType} onChange={(e) => onChangeRelationType(e.target.value)}>
          <option value="">関係区分（全て）</option>
          {RELATION_TYPES.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
      </div>
      <ChipGroup label="並び"
        value={sort}
        options={SORT_OPTIONS}
        onChange={(v) => onChangeSort(v as HouseholdSort)} />
      <label className="check-label parish-incl">
        <input type="checkbox" checked={includeInactive} onChange={(e) => onChangeIncludeInactive(e.target.checked)} />
        離檀世帯を含む
      </label>
    </>
  );
}
