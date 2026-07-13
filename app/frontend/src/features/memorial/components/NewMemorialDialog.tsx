// 過去帳 — 新規登録ダイアログ。

import * as React from 'react';

import { TEMPLE_SECTS } from '@/constants/temple';

import {
  DIALOG_FAMILIES,
  DIALOG_RELATIONS,
  KAIMYO_PREFIXES,
  KAIMYO_RANKS,
} from '../constants';
import type { NewMemorialForm } from '../types';

interface NewMemorialDialogProps {
  open: boolean;
  initial?: NewMemorialForm;
  onClose: () => void;
  onSave: (form: NewMemorialForm) => void;
}

const EMPTY_FORM: NewMemorialForm = {
  prefix: '釈',
  name: '',
  rank: '信士',
  secular: '',
  age: '',
  deceased: '2026-05-11',
  family: '佐藤家',
  relation: '父',
  sect: 0,
  notes: '',
};

export function NewMemorialDialog({ open, initial, onClose, onSave }: NewMemorialDialogProps) {
  const [form, setForm] = React.useState<NewMemorialForm>(initial ?? EMPTY_FORM);
  React.useEffect(() => { if (open) setForm(initial ?? EMPTY_FORM); }, [open, initial]);
  if (!open) return null;
  const isEdit = Boolean(initial);

  const set = <K extends keyof NewMemorialForm>(k: K, v: NewMemorialForm[K]) =>
    setForm(f => ({ ...f, [k]: v }));
  const computedKaimyo = `${form.prefix} ${form.name || '◯◯'} ${form.rank}`.trim();

  return (
    <div className="dialog-overlay" onClick={onClose}>
      <div className="dialog memorial-dialog" style={{ width: 720 }} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h3>{isEdit ? '過去帳を編集' : '新規 過去帳登録'}</h3>
            <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--fg2)' }}>戒名と俗名、没年月日を記録します。</p>
          </div>
          <button className="x-btn" onClick={onClose} aria-label="閉じる">
            <svg viewBox="0 0 24 24"><line x1="18" x2="6" y1="6" y2="18"/><line x1="6" x2="18" y1="6" y2="18"/></svg>
          </button>
        </header>
        <div className="body">
          <div className="kaimyo-preview">
            <div className="kp-label">戒名プレビュー</div>
            <div className="kp-value">{computedKaimyo}</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
            <div className="form-field">
              <label>院号・道号 (前)</label>
              <select className="input-plain" value={form.prefix} onChange={(e) => set('prefix', e.target.value)}>
                {KAIMYO_PREFIXES.map(p => <option key={p || 'none'} value={p}>{p || '— なし'}</option>)}
              </select>
            </div>
            <div className="form-field" style={{ gridColumn: 'span 2' }}>
              <label>戒名 (本号)</label>
              <input className="input-plain" value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="例: 浄信" />
            </div>
            <div className="form-field">
              <label>位号</label>
              <select className="input-plain" value={form.rank} onChange={(e) => set('rank', e.target.value)}>
                {KAIMYO_RANKS.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div className="form-field" style={{ gridColumn: 'span 2' }}>
              <label>俗名</label>
              <input className="input-plain" value={form.secular} onChange={(e) => set('secular', e.target.value)} placeholder="例: 佐藤 文蔵" />
            </div>
            <div className="form-field">
              <label>享年</label>
              <input className="input-plain" value={form.age} onChange={(e) => set('age', e.target.value)} type="number" min="0" max="120" placeholder="例: 78" />
            </div>
            <div className="form-field">
              <label>没年月日</label>
              <input className="input-plain" value={form.deceased} onChange={(e) => set('deceased', e.target.value)} type="date" />
            </div>
            <div className="form-field" style={{ gridColumn: 'span 2' }}>
              <label>関連檀家</label>
              <select className="input-plain" value={form.family} onChange={(e) => set('family', e.target.value)}>
                {DIALOG_FAMILIES.map(f => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>
            <div className="form-field">
              <label>続柄</label>
              <select className="input-plain" value={form.relation} onChange={(e) => set('relation', e.target.value)}>
                {DIALOG_RELATIONS.map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
            <div className="form-field">
              <label>宗派</label>
              <select className="input-plain" value={form.sect} onChange={(e) => set('sect', parseInt(e.target.value, 10))}>
                {TEMPLE_SECTS.map((s, i) => <option key={s} value={i}>{s}</option>)}
              </select>
            </div>
            <div className="form-field" style={{ gridColumn: 'span 4' }}>
              <label>備考</label>
              <textarea className="input-plain" rows={3} value={form.notes} onChange={(e) => set('notes', e.target.value)} placeholder="生前のことなど" />
            </div>
          </div>
        </div>
        <footer>
          <button className="btn outline" type="button" onClick={onClose}>キャンセル</button>
          <button className="btn primary purple" type="button" onClick={() => onSave(form)} disabled={!form.name || !form.secular}>{isEdit ? '保存する' : '登録する'}</button>
        </footer>
      </div>
    </div>
  );
}
