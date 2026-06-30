import * as React from 'react';

import { KINDS } from '../constants';
import type { NewVisitForm } from '../types';

interface NewVisitDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (form: NewVisitForm) => void;
}

const EMPTY_FORM: NewVisitForm = { family: '', name: '', date: '2026-05-11', time: '10:30', kind: 'monthly', offering: '', note: '' };

export function NewVisitDialog({ open, onClose, onSave }: NewVisitDialogProps) {
  const [form, setForm] = React.useState<NewVisitForm>(EMPTY_FORM);
  React.useEffect(() => { if (open) setForm(EMPTY_FORM); }, [open]);
  if (!open) return null;
  const upd = (k: keyof NewVisitForm, v: string) => setForm(f => ({ ...f, [k]: v }));
  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!form.family || !form.name) return;
    onSave(form);
  };
  return (
    <div className="dialog-overlay" onClick={onClose}>
      <div className="dialog" style={{ width: 540 }} onClick={(e) => e.stopPropagation()}>
        <header style={{ display: 'flex', justifyContent: 'space-between' }}>
          <h3>お参りを登録</h3>
          <button className="x-btn" onClick={onClose} aria-label="閉じる">
            <svg viewBox="0 0 24 24"><line x1="18" x2="6" y1="6" y2="18"/><line x1="6" x2="18" y1="6" y2="18"/></svg>
          </button>
        </header>
        <form onSubmit={submit}>
          <div className="body" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div className="form-field" style={{ gridColumn: 'span 2' }}>
              <label>家名</label>
              <input className="input-plain" placeholder="例: 佐藤家" value={form.family} onChange={(e) => upd('family', e.target.value)} />
            </div>
            <div className="form-field" style={{ gridColumn: 'span 2' }}>
              <label>参拝者名</label>
              <input className="input-plain" placeholder="例: 佐藤 千恵子 様" value={form.name} onChange={(e) => upd('name', e.target.value)} />
            </div>
            <div className="form-field">
              <label>日付</label>
              <input className="input-plain" type="date" value={form.date} onChange={(e) => upd('date', e.target.value)} />
            </div>
            <div className="form-field">
              <label>時刻</label>
              <input className="input-plain" type="time" value={form.time} onChange={(e) => upd('time', e.target.value)} />
            </div>
            <div className="form-field">
              <label>種別</label>
              <select className="input-plain" value={form.kind} onChange={(e) => upd('kind', e.target.value)}>
                {KINDS.map(k => <option key={k.key} value={k.key}>{k.label}</option>)}
              </select>
            </div>
            <div className="form-field">
              <label>お布施 (円)</label>
              <input className="input-plain" type="number" placeholder="0" value={form.offering} onChange={(e) => upd('offering', e.target.value)} />
            </div>
            <div className="form-field" style={{ gridColumn: 'span 2' }}>
              <label>メモ</label>
              <textarea className="input-plain" rows={3} placeholder="お参りに関する備考をご記入ください。" value={form.note} onChange={(e) => upd('note', e.target.value)} />
            </div>
          </div>
          <footer>
            <button type="button" className="btn outline" onClick={onClose}>キャンセル</button>
            <button type="submit" className="btn primary">保存</button>
          </footer>
        </form>
      </div>
    </div>
  );
}
