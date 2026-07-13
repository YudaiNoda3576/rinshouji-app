import * as React from 'react';

import { TEMPLE_SECTS } from '@/constants/temple';

import { ZONES } from '../constants';
import type { NewParishForm } from '../types';

interface NewParishDialogProps {
  open: boolean;
  initial?: NewParishForm;
  onClose: () => void;
  onSave: (form: NewParishForm) => void;
  onDelete?: () => void;
}

const EMPTY_FORM: NewParishForm = { name: '', head: '', sect: 0, members: 1, addr: '', phone: '', zone: 0, note: '' };

export function NewParishDialog({ open, initial, onClose, onSave, onDelete }: NewParishDialogProps) {
  const [form, setForm] = React.useState<NewParishForm>(initial ?? EMPTY_FORM);
  React.useEffect(() => { if (open) setForm(initial ?? EMPTY_FORM); }, [open, initial]);
  if (!open) return null;
  const isEdit = Boolean(initial);
  const upd = <K extends keyof NewParishForm>(k: K, v: NewParishForm[K]) => setForm(f => ({ ...f, [k]: v }));
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.head) return;
    onSave(form);
  };
  return (
    <div className="dialog-overlay" onClick={onClose}>
      <div className="dialog" style={{ width: 620 }} onClick={(e) => e.stopPropagation()}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3>{isEdit ? '檀家情報を編集' : '新規檀家登録'}</h3>
          <button className="x-btn" onClick={onClose}>
            <svg viewBox="0 0 24 24"><line x1="18" x2="6" y1="6" y2="18"/><line x1="6" x2="18" y1="6" y2="18"/></svg>
          </button>
        </header>
        <form onSubmit={submit}>
          <div className="body" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div className="form-field">
              <label>家名</label>
              <input className="input-plain" placeholder="例: 佐藤" value={form.name} onChange={(e) => upd('name', e.target.value)} />
            </div>
            <div className="form-field">
              <label>戸主名</label>
              <input className="input-plain" placeholder="例: 佐藤 一彦" value={form.head} onChange={(e) => upd('head', e.target.value)} />
            </div>
            <div className="form-field">
              <label>宗派</label>
              <select className="input-plain" value={form.sect} onChange={(e) => upd('sect', Number(e.target.value))}>
                {TEMPLE_SECTS.map((s, i) => <option key={i} value={i}>{s}</option>)}
              </select>
            </div>
            <div className="form-field">
              <label>墓地区画</label>
              <select className="input-plain" value={form.zone} onChange={(e) => upd('zone', Number(e.target.value))}>
                {ZONES.map((z, i) => <option key={i} value={i}>{z}</option>)}
              </select>
            </div>
            <div className="form-field" style={{ gridColumn: 'span 2' }}>
              <label>住所</label>
              <input className="input-plain" placeholder="例: 東京都品川区南品川3-12-4" value={form.addr} onChange={(e) => upd('addr', e.target.value)} />
            </div>
            <div className="form-field">
              <label>電話番号</label>
              <input className="input-plain" placeholder="例: 03-XXXX-XXXX" value={form.phone} onChange={(e) => upd('phone', e.target.value)} />
            </div>
            <div className="form-field">
              <label>家族構成 (人数)</label>
              <input className="input-plain" type="number" min="1" max="20" value={form.members} onChange={(e) => upd('members', Number(e.target.value))} />
            </div>
            <div className="form-field" style={{ gridColumn: 'span 2' }}>
              <label>備考</label>
              <textarea className="input-plain" rows={3} placeholder="家系の経緯、注意事項などをご記入ください。" value={form.note} onChange={(e) => upd('note', e.target.value)} />
            </div>
          </div>
          <footer>
            {isEdit && onDelete && (
              <button type="button" className="btn ghost danger-text" style={{ marginRight: 'auto' }} onClick={onDelete}>
                削除
              </button>
            )}
            <button type="button" className="btn outline" onClick={onClose}>キャンセル</button>
            <button type="submit" className="btn primary">{isEdit ? '保存する' : '保存'}</button>
          </footer>
        </form>
      </div>
    </div>
  );
}
