import { TEMPLE_SECTS } from '@/constants/temple';

import { Pill } from '@/components/ui/Pill';

import { fmtRelativeDate } from '../constants';
import type { ParishFamily } from '../types';

import { Kamon } from './Kamon';

interface TableViewProps {
  items: ParishFamily[];
  selected: string;
  onSelect: (id: string) => void;
}

export function TableView({ items, selected, onSelect }: TableViewProps) {
  return (
    <div className="card-block parish-table">
      <div className="ptbl-head">
        <div className="c-name">家名</div>
        <div className="c-head">戸主</div>
        <div className="c-mem">家族</div>
        <div className="c-sect">宗派</div>
        <div className="c-visit">最近のお参り</div>
        <div className="c-anc">過去帳</div>
        <div className="c-sched">直近の予定</div>
      </div>
      {items.map(f => (
        <div key={f.id}
             className={'ptbl-row' + (f.id === selected ? ' selected' : '')}
             onClick={() => onSelect(f.id)}>
          <div className="c-name">
            <div className="kamon-cell"><Kamon idx={f.kamon} size={28} /></div>
            <div>
              <div className="t1">{f.name}家</div>
              <div className="t2">{f.id}</div>
            </div>
          </div>
          <div className="c-head">{f.head}</div>
          <div className="c-mem"><b>{f.members}</b><span>名</span></div>
          <div className="c-sect"><Pill color="gray">{TEMPLE_SECTS[f.sect]}</Pill></div>
          <div className="c-visit">
            <div className="t1">{fmtRelativeDate(f.lastVisit)}</div>
            <div className="t2">{f.lastVisit}</div>
          </div>
          <div className="c-anc">{f.ancestors}名</div>
          <div className="c-sched">
            {f.scheduled ? <span className="schedule-chip">{f.scheduled}</span> : <span className="dim">—</span>}
          </div>
        </div>
      ))}
      {items.length === 0 && <div className="vt-empty">該当する檀家家はありません。</div>}
    </div>
  );
}
