// スケジュール（アガンダ）表示 — 予定がある日だけを日付順に一覧表示する。

import * as React from 'react';
import { WEEKDAYS } from '@/constants/temple';
import { TODAY_ISO } from '../constants';
import { addMinutes, getKind, isoDate } from '../utils';
import type { KindMap, ScheduleEvent } from '../types';

interface AgendaViewProps {
  anchor: Date;
  km: KindMap;
  selectedDate: string;
  setSelectedDate: (iso: string) => void;
  selectedId: string;
  setSelectedId: (id: string) => void;
  eventsForDate: (iso: string) => ScheduleEvent[];
  isSp: boolean;
  setPreviewEventId: (id: string) => void;
}

interface AgendaDay {
  iso: string;
  date: Date;
  evs: ScheduleEvent[];
}

export function AgendaView({
  anchor,
  km,
  selectedDate,
  setSelectedDate,
  selectedId,
  setSelectedId,
  eventsForDate,
  isSp,
  setPreviewEventId,
}: AgendaViewProps) {
  const year = anchor.getFullYear();
  const month = anchor.getMonth();

  const days = React.useMemo<AgendaDay[]>(() => {
    const lastDate = new Date(year, month + 1, 0).getDate();
    const list: AgendaDay[] = [];
    for (let d = 1; d <= lastDate; d++) {
      const iso = isoDate(year, month, d);
      const evs = eventsForDate(iso);
      if (evs.length) list.push({ iso, date: new Date(year, month, d), evs });
    }
    return list;
  }, [year, month, eventsForDate]);

  if (!days.length) {
    return <div className="empty">この月に予定はありません。</div>;
  }

  return (
    <div className="agd-list">
      {days.map((day) => {
        const dow = day.date.getDay();
        const isToday = day.iso === TODAY_ISO;
        const isSelectedDay = day.iso === selectedDate;
        return (
          <div key={day.iso} className={'agd-day' + (isSelectedDay ? ' selected' : '')}>
            <div className={'agd-day-badge' + (isToday ? ' today' : '')}>
              <span className={'agd-dow' + (dow === 0 ? ' sun' : '') + (dow === 6 ? ' sat' : '')}>{WEEKDAYS[dow]}</span>
              <span className="agd-date-num">{day.date.getDate()}</span>
            </div>
            <ul className="agd-events">
              {day.evs.map((e) => {
                const k = getKind(km, e.kind);
                const isSel = e.id === selectedId;
                return (
                  <li
                    key={e.id}
                    className={'agd-item' + (isSel ? ' selected' : '')}
                    onClick={() => {
                      setSelectedDate(day.iso);
                      setSelectedId(e.id);
                      if (isSp) setPreviewEventId(e.id);
                    }}
                  >
                    <div className="agd-time">{e.time}〜{addMinutes(e.time, e.dur)}</div>
                    <div className="agd-rail" style={{ background: k.color }}></div>
                    <div className="agd-main">
                      <div className="agd-title-row">
                        <span className="agd-title">{e.title}</span>
                        <span className="sd-kind-chip" style={{ background: k.tint, color: k.dark }}>{k.label}</span>
                      </div>
                      <div className="agd-meta">
                        {e.priest && <span className="agd-priest">{e.priest}</span>}
                        {e.loc && <span className="agd-loc">{e.loc}</span>}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
