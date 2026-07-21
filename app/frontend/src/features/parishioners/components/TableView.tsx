import { Pill } from '@/components/ui/Pill';

import {
  formatDistrict,
  formatFamilyName,
  formatHeadName,
  formatPhone,
  relationPillColor,
} from '../constants';
import type { HouseholdRow } from '../types';

interface TableViewProps {
  items: HouseholdRow[];
  selected: number | null;
  onSelect: (id: number) => void;
}

export function TableView({ items, selected, onSelect }: TableViewProps) {
  return (
    <div className="card-block parish-table">
      <div className="ptbl-head">
        <div className="c-name">家名</div>
        <div className="c-head">戸主</div>
        <div className="c-dist">地区</div>
        <div className="c-rel">関係区分</div>
        <div className="c-tel">電話</div>
        <div className="c-anc">過去帳</div>
        <div className="c-sched">直近の予定</div>
      </div>
      {items.map(f => (
        <div key={f.id}
             className={'ptbl-row' + (f.id === selected ? ' selected' : '')}
             onClick={() => onSelect(f.id)}>
          <div className="c-name">
            <div className="t1">{formatFamilyName(f.familyName)}</div>
          </div>
          <div className="c-head">{formatHeadName(f.headName)}</div>
          <div className="c-dist">{formatDistrict(f.district1, f.district2)}</div>
          <div className="c-rel">
            {f.relationType
              ? <Pill color={relationPillColor(f.relationType)}>{f.relationType}</Pill>
              : <Pill color="gray">未設定</Pill>}
          </div>
          <div className="c-tel">{formatPhone(f.phone, f.mobilePhone)}</div>
          <div className="c-anc"><b>{f.deceasedCount}</b><span>名</span></div>
          <div className="c-sched"><span className="dim">—</span></div>
        </div>
      ))}
      {items.length === 0 && <div className="vt-empty">該当する檀家はありません。</div>}
    </div>
  );
}
