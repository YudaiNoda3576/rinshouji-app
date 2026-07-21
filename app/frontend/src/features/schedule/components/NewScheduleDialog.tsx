// 新規予定の追加 / 既存予定の編集ダイアログ。

import * as React from 'react';
import { useEventKinds } from '../hooks';
import { addMinutes, minutesFromTime } from '../utils';
import type {
  NewScheduleForm,
  ScheduleDialogMode,
  ScheduleEvent,
  ScheduleFormValues,
} from '../types';

interface NewScheduleDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (form: NewScheduleForm) => void;
  onOpenSettings: (section: string) => void;
  mode?: ScheduleDialogMode;
  initial?: ScheduleEvent | null;
}

const FAMILY_OPTIONS = ['佐藤家', '田中家', '高橋家', '山本家', '鈴木家', '伊藤家', '渡辺家', '中村家', '小林家', '加藤家', '吉田家', '山田家'];
const PRIEST_OPTIONS = ['住職', '副住職', '主任住職', '住職・副住職'];

function initFromEvent(ev: ScheduleEvent | null | undefined): ScheduleFormValues {
  if (!ev) return { kind: 'memorial', title: '', date: '2026-05-12', time: '10:30', endTime: '11:30', family: '', loc: '本堂', priest: '住職', attendees: 4, notes: '' };
  return {
    kind: ev.kind || 'memorial', title: ev.title || '',
    date: ev.date || '2026-05-12', time: ev.time || '10:30',
    endTime: ev.time ? addMinutes(ev.time, ev.dur || 60) : '11:30',
    family: ev.family || '', loc: ev.loc || '本堂',
    priest: ev.priest || '住職', attendees: ev.attendees || 4, notes: ev.notes || '',
  };
}

export function NewScheduleDialog({ open, onClose, onSave, onOpenSettings, mode, initial }: NewScheduleDialogProps) {
  const kinds = useEventKinds();
  const [form, setForm] = React.useState<ScheduleFormValues>(() => initFromEvent(initial));
  // re-initialize when opened with a new initial value
  React.useEffect(() => { if (open) setForm(initFromEvent(initial)); }, [open, initial && initial.id]);
  // When start time changes, shift the end time by the same delta
  const onStartTimeChange = (newStart: string) => {
    setForm((f) => {
      const oldDur = (minutesFromTime(f.endTime) - minutesFromTime(f.time) + 24 * 60) % (24 * 60);
      const newEndMins = (minutesFromTime(newStart) + (oldDur || 60)) % (24 * 60);
      const hh = Math.floor(newEndMins / 60);
      const mm = newEndMins % 60;
      return { ...f, time: newStart, endTime: `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}` };
    });
  };
  if (!open) return null;
  const set = <K extends keyof ScheduleFormValues>(k: K, v: ScheduleFormValues[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="dialog-overlay" onClick={onClose}>
      <div className="dialog" style={{ width: 680 }} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h3>{mode === 'edit' ? '予定を編集' : '新規予定の追加'}</h3>
            <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--fg2)' }}>
              {mode === 'edit' ? '予定の内容を変更します。' : '年忌・お参り・定期法要などを記録します。'}
            </p>
          </div>
          <button className="x-btn" onClick={onClose} aria-label="閉じる">
            <svg viewBox="0 0 24 24"><line x1="18" x2="6" y1="6" y2="18" /><line x1="6" x2="18" y1="6" y2="18" /></svg>
          </button>
        </header>
        <div className="body">
          <div className="form-field" style={{ marginBottom: 14 }}>
            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
              <span>種別</span>
              {onOpenSettings &&
              <button type="button" className="kind-gear-btn" onClick={() => {onClose();onOpenSettings('kinds');}} aria-label="種別を編集" title="種別を編集">
                  <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>
                  種別を編集
                </button>
              }
            </label>
            <div className="kind-picker">
              {kinds.map((k) =>
              <button key={k.key} type="button"
              className={'kind-btn' + (form.kind === k.key ? ' on' : '')}
              style={form.kind === k.key ? { borderColor: k.color, background: k.tint, color: k.dark } : {}}
              onClick={() => set('kind', k.key)}>
                  <span className="cal-chip-dot" style={{ background: k.color }}></span>
                  {k.label}
                </button>
              )}
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
            <div className="form-field" style={{ gridColumn: 'span 4' }}>
              <label>タイトル</label>
              <input className="input-plain" value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="例: 佐藤家 七回忌" />
            </div>
            <div className="form-field" style={{ gridColumn: 'span 2' }}>
              <label>日付</label>
              <input className="input-plain" type="date" value={form.date} onChange={(e) => set('date', e.target.value)} />
            </div>
            <div className="form-field">
              <label>開始時刻</label>
              <input className="input-plain" type="time" value={form.time} onChange={(e) => onStartTimeChange(e.target.value)} />
            </div>
            <div className="form-field">
              <label>終了時刻</label>
              <input className="input-plain" type="time" value={form.endTime} min={form.time} onChange={(e) => set('endTime', e.target.value)} />
            </div>
            <div className="form-field" style={{ gridColumn: 'span 2' }}>
              <label>関連檀家</label>
              <select className="input-plain" value={form.family} onChange={(e) => set('family', e.target.value)}>
                <option value="">— 選択しない</option>
                {FAMILY_OPTIONS.map((f) =>
                <option key={f} value={f}>{f}</option>
                )}
              </select>
            </div>
            <div className="form-field">
              <label>場所</label>
              <input className="input-plain" value={form.loc} onChange={(e) => set('loc', e.target.value)} />
            </div>
            <div className="form-field">
              <label>担当</label>
              <select className="input-plain" value={form.priest} onChange={(e) => set('priest', e.target.value)}>
                {PRIEST_OPTIONS.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div className="form-field">
              <label>参加人数 (予定)</label>
              <input className="input-plain" type="number" min="1" max="200" value={form.attendees} onChange={(e) => set('attendees', Number(e.target.value))} />
            </div>
            <div className="form-field" style={{ gridColumn: 'span 4' }}>
              <label>備考</label>
              <textarea className="input-plain" rows={3} value={form.notes} onChange={(e) => set('notes', e.target.value)} placeholder="予定に関するメモ" />
            </div>
          </div>
        </div>
        <footer>
          <button className="btn outline" type="button" onClick={onClose}>キャンセル</button>
          <button className="btn primary" type="button"
          onClick={() => {
            const dur = (minutesFromTime(form.endTime) - minutesFromTime(form.time) + 24 * 60) % (24 * 60) || 60;
            onSave({ ...form, dur });
          }}
          disabled={!form.title || minutesFromTime(form.endTime) <= minutesFromTime(form.time)}>{mode === 'edit' ? '変更を保存' : '予定を保存'}</button>
        </footer>
      </div>
    </div>);

}
