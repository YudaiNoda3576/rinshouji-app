// 月表示。

import * as React from 'react';
import { WEEKDAYS } from '@/constants/temple';
import { TODAY_ISO } from '../constants';
import { getKind, isoFromDate } from '../utils';
import type { KindMap, ScheduleEvent } from '../types';

interface MonthViewProps {
  anchor: Date;
  km: KindMap;
  selectedDate: string;
  setSelectedDate: (iso: string) => void;
  setSelectedId: (id: string) => void;
  eventsForDate: (iso: string) => ScheduleEvent[];
  moveEvent: (id: string, newDate: string, newTime?: string) => void;
  isSp: boolean;
  setPreviewEventId: (id: string) => void;
}

interface MonthCell {
  date: Date;
  iso: string;
  outside: boolean;
}

export function MonthView({
  anchor,
  km,
  selectedDate,
  setSelectedDate,
  setSelectedId,
  eventsForDate,
  moveEvent,
  isSp,
  setPreviewEventId,
}: MonthViewProps) {
  const grid = React.useMemo<MonthCell[]>(() => {
    const first = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
    const start = new Date(first);
    start.setDate(1 - first.getDay());
    const cells: MonthCell[] = [];
    for (let i = 0; i < 42; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      cells.push({
        date: d,
        iso: isoFromDate(d),
        outside: d.getMonth() !== anchor.getMonth(),
      });
    }
    return cells;
  }, [anchor]);

  return (
    <>
      <div className="cal-weekdays">
        {WEEKDAYS.map((w, i) =>
        <div key={w} className={'cal-wd' + (i === 0 ? ' sun' : '') + (i === 6 ? ' sat' : '')}>{w}</div>
        )}
      </div>
      <div className="cal-grid">
        {grid.map((cell) => {
          const evs = eventsForDate(cell.iso);
          const isToday = cell.iso === TODAY_ISO;
          const isSelected = cell.iso === selectedDate;
          const dow = cell.date.getDay();
          return (
            <div key={cell.iso}
            className={'cal-cell' + (cell.outside ? ' outside' : '') + (isToday ? ' today' : '') + (isSelected ? ' selected' : '')}
            onClick={() => {setSelectedDate(cell.iso);if (evs[0]) setSelectedId(evs[0].id);}}
            onDragOver={(ev) => {ev.preventDefault();ev.currentTarget.classList.add('drop-over');}}
            onDragLeave={(ev) => {ev.currentTarget.classList.remove('drop-over');}}
            onDrop={(ev) => {
              ev.preventDefault();
              ev.currentTarget.classList.remove('drop-over');
              const id = ev.dataTransfer.getData('text/event-id');
              if (id) moveEvent(id, cell.iso);
            }}>
              <div className={'cal-cell-d' + (dow === 0 ? ' sun' : '') + (dow === 6 ? ' sat' : '')}>
                {cell.date.getDate()}
                {isToday && <span className="cal-today-mark">今日</span>}
              </div>
              <div className="cal-cell-events">
                {evs.slice(0, 3).map((e) => {
                  const kk = getKind(km, e.kind);
                  const evtStyle = {
                    background: kk.tint,
                    color: kk.dark,
                    borderLeft: `3px solid ${kk.color}`,
                    '--evt-bg': kk.color,
                  } as React.CSSProperties;
                  return (
                    <div key={e.id} className="cal-evt"
                    draggable
                    onDragStart={(ev) => {ev.dataTransfer.setData('text/event-id', e.id);ev.dataTransfer.effectAllowed = 'move';ev.currentTarget.classList.add('dragging');}}
                    onDragEnd={(ev) => {ev.currentTarget.classList.remove('dragging');}}
                    style={evtStyle}
                    onClick={(ev) => {ev.stopPropagation();setSelectedDate(cell.iso);setSelectedId(e.id);if(isSp)setPreviewEventId(e.id);}}>
                    <span className="evt-t">{e.time}</span>
                    <span className="evt-l">{e.title}</span>
                    {e.priest && <span className="evt-p">{e.priest}</span>}
                  </div>);

                })}
                {evs.length > 3 && <div className="cal-evt-more">+{evs.length - 3} 件</div>}
              </div>
            </div>);

        })}
      </div>
    </>);

}
