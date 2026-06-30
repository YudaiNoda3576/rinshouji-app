// 日 / 週のタイムグリッド表示。

import * as React from 'react';
import { WEEKDAYS } from '@/constants/temple';
import {
  DAY_END_HOUR,
  DAY_START_HOUR,
  HOUR_PX,
  NOW_MOCK_HOUR,
  NOW_MOCK_MIN,
  TODAY_ISO,
} from '../constants';
import {
  addMinutes,
  eventHeightPx,
  eventTopPx,
  getKind,
  isoFromDate,
  layoutEvents,
} from '../utils';
import type { KindMap, ScheduleEvent } from '../types';

interface TimeGridViewProps {
  days: number;
  startDate: Date;
  km: KindMap;
  selectedDate: string;
  setSelectedDate: (iso: string) => void;
  setSelectedId: (id: string) => void;
  selectedId: string;
  eventsForDate: (iso: string) => ScheduleEvent[];
  moveEvent: (id: string, newDate: string, newTime?: string) => void;
  isSp: boolean;
  setPreviewEventId: (id: string) => void;
}

export function TimeGridView({
  days,
  startDate,
  km,
  selectedDate,
  setSelectedDate,
  setSelectedId,
  selectedId,
  eventsForDate,
  moveEvent,
  isSp,
  setPreviewEventId,
}: TimeGridViewProps) {
  const dates: Date[] = [];
  for (let i = 0; i < days; i++) {
    const d = new Date(startDate);
    d.setDate(startDate.getDate() + i);
    dates.push(d);
  }
  const hours: number[] = [];
  for (let h = DAY_START_HOUR; h < DAY_END_HOUR; h++) hours.push(h);

  // Current time indicator only if today is in the range and current time is within DAY_START_HOUR..DAY_END_HOUR
  const todayInRange = dates.some((d) => isoFromDate(d) === TODAY_ISO);
  const nowMockHour = NOW_MOCK_HOUR;
  const nowMockMin = NOW_MOCK_MIN;
  const nowOffset = todayInRange ? (((nowMockHour - DAY_START_HOUR) * 60 + nowMockMin) / 60) * HOUR_PX : null;

  return (
    <div className="tg-wrap">
      <div className="tg-head" style={{ gridTemplateColumns: `60px repeat(${days}, 1fr)` }}>
        <div className="tg-corner"></div>
        {dates.map((d) => {
          const iso = isoFromDate(d);
          const isToday = iso === TODAY_ISO;
          const dow = d.getDay();
          return (
            <div key={iso}
            className={'tg-day-head' + (isToday ? ' today' : '') + (iso === selectedDate ? ' selected' : '')}
            onClick={() => setSelectedDate(iso)}>
              <div className={'tg-dow' + (dow === 0 ? ' sun' : '') + (dow === 6 ? ' sat' : '')}>{WEEKDAYS[dow]}</div>
              <div className={'tg-num' + (isToday ? ' today' : '')}>{d.getDate()}</div>
            </div>);

        })}
      </div>

      <div className="tg-body" style={{ gridTemplateColumns: `60px repeat(${days}, 1fr)` }}>
        {/* hour ruler */}
        <div className="tg-hours">
          {hours.map((h) =>
          <div key={h} className="tg-hour-row" style={{ height: HOUR_PX }}>
              <span className="tg-hour-label">{String(h).padStart(2, '0')}:00</span>
            </div>
          )}
        </div>

        {/* day columns */}
        {dates.map((d) => {
          const iso = isoFromDate(d);
          const isToday = iso === TODAY_ISO;
          const evs = eventsForDate(iso);
          const onColDrop = (ev: React.DragEvent<HTMLDivElement>) => {
            ev.preventDefault();
            ev.currentTarget.classList.remove('drop-over');
            const id = ev.dataTransfer.getData('text/event-id');
            if (!id) return;
            // Snap to 15-minute slot based on Y in column body
            const rect = ev.currentTarget.getBoundingClientRect();
            const y = Math.max(0, ev.clientY - rect.top);
            const totalMins = (y / HOUR_PX) * 60;
            const snapped = Math.round(totalMins / 15) * 15;
            const hour = Math.min(DAY_END_HOUR - 1, Math.max(DAY_START_HOUR, DAY_START_HOUR + Math.floor(snapped / 60)));
            const minute = snapped % 60;
            const newTime = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
            moveEvent(id, iso, newTime);
          };
          return (
            <div key={iso} className={'tg-col' + (isToday ? ' today' : '')}
            onClick={() => setSelectedDate(iso)}
            onDragOver={(ev) => {ev.preventDefault();ev.currentTarget.classList.add('drop-over');}}
            onDragLeave={(ev) => {ev.currentTarget.classList.remove('drop-over');}}
            onDrop={onColDrop}>
              {hours.map((h) =>
              <div key={h} className="tg-hour-cell" style={{ height: HOUR_PX }}></div>
              )}
              {isToday && nowOffset != null &&
              <div className="tg-now" style={{ top: nowOffset }}>
                  <span className="tg-now-dot"></span>
                </div>
              }
              {layoutEvents(evs).map(({ e, leftPct, widthPct }) => {
                const k = getKind(km, e.kind);
                const top = eventTopPx(e.time);
                const height = eventHeightPx(e.dur);
                const isSel = e.id === selectedId;
                return (
                  <div key={e.id}
                  className={'tg-evt' + (isSel ? ' selected' : '')}
                  draggable
                  onDragStart={(ev) => {ev.dataTransfer.setData('text/event-id', e.id);ev.dataTransfer.effectAllowed = 'move';ev.currentTarget.classList.add('dragging');}}
                  onDragEnd={(ev) => {ev.currentTarget.classList.remove('dragging');}}
                  style={{
                    top, height,
                    left: `calc(${leftPct}% + 2px)`,
                    width: `calc(${widthPct}% - 4px)`,
                    background: k.tint,
                    color: k.dark,
                    borderLeft: `3px solid ${k.color}`
                  }}
                  onClick={(ev) => {ev.stopPropagation();setSelectedDate(iso);setSelectedId(e.id);if(isSp)setPreviewEventId(e.id);}}>
                    <div className="tg-evt-t">{e.time}{e.dur >= 45 ? `〜${addMinutes(e.time, e.dur)}` : ''}</div>
                    <div className="tg-evt-l">{e.title}</div>
                    {e.priest && height >= 44 && <div className="tg-evt-priest"><span className="tg-evt-av">{e.priest.slice(0, 1)}</span>{e.priest}</div>}
                    {e.loc && height >= 80 && <div className="tg-evt-loc">{e.loc}</div>}
                  </div>);

              })}
            </div>);

        })}
      </div>
    </div>);

}
