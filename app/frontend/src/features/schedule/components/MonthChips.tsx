// 月切替チップ（SP限定: 月ビューの上に表示する横スクロール月選択）。

import * as React from 'react';
import { MONTH_NAMES } from '../constants';

interface MonthChipsProps {
  anchor: Date;
  setAnchor: (d: Date) => void;
}

export function MonthChips({ anchor, setAnchor }: MonthChipsProps) {
  const trackRef = React.useRef<HTMLDivElement>(null);
  const currentMonth = anchor.getMonth();

  React.useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const on = track.querySelector('.cal-mchip.on');
    if (on) on.scrollIntoView({ inline: 'center', block: 'nearest' });
  }, [anchor.getFullYear(), currentMonth]);

  return (
    <div className="cal-month-chips" ref={trackRef}>
      {MONTH_NAMES.map((label, m) => (
        <button
          key={m}
          type="button"
          className={'cal-mchip' + (m === currentMonth ? ' on' : '')}
          onClick={() => setAnchor(new Date(anchor.getFullYear(), m, 1))}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
