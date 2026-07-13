// 年忌案内の編集ダイアログ（対象日・担当・状態）。モックのためデータ実反映はしない。

import * as React from 'react';

import { NOTICE_STATUS } from '../constants';
import type { NoticeCase, NoticeStatusKey } from '../types';

interface EditNoticeDialogProps {
  open: boolean;
  notice: NoticeCase;
  onClose: () => void;
  onSave: () => void;
}

interface EditForm {
  targetDate: string;
  assignee: string;
  status: NoticeStatusKey;
}

const ASSIGNEE_OPTIONS = ['住職', '副住職', '主任住職'];
const STATUS_KEYS: NoticeStatusKey[] = ['pending', 'sent', 'confirmed', 'declined'];

const fromNotice = (n: NoticeCase): EditForm => ({
  targetDate: n.targetDate,
  assignee: n.assignee,
  status: n.status,
});

export function EditNoticeDialog({ open, notice, onClose, onSave }: EditNoticeDialogProps) {
  const [form, setForm] = React.useState<EditForm>(() => fromNotice(notice));
  React.useEffect(() => { if (open) setForm(fromNotice(notice)); }, [open, notice]);

  if (!open) return null;

  const set = <K extends keyof EditForm>(k: K, v: EditForm[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="dialog-overlay" onClick={onClose}>
      <div className="dialog" style={{width: 540}} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <header style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
          <div>
            <h3>案内を編集</h3>
            <p style={{margin: '4px 0 0', fontSize: 12, color: 'var(--fg2)'}}>
              {notice.kaimyo}（{notice.family}）／ {notice.kaiki}
            </p>
          </div>
          <button className="x-btn" onClick={onClose} aria-label="閉じる">
            <svg viewBox="0 0 24 24"><line x1="18" x2="6" y1="6" y2="18"/><line x1="6" x2="18" y1="6" y2="18"/></svg>
          </button>
        </header>
        <div className="body">
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14}}>
            <div className="form-field">
              <label>対象日</label>
              <input className="input-plain" type="date" value={form.targetDate} onChange={(e) => set('targetDate', e.target.value)} />
            </div>
            <div className="form-field">
              <label>担当</label>
              <select className="input-plain" value={form.assignee} onChange={(e) => set('assignee', e.target.value)}>
                {ASSIGNEE_OPTIONS.map((a) => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
          </div>
          <div className="form-field" style={{marginTop: 14}}>
            <label>状態</label>
            <div className="seg" style={{width: 'fit-content'}}>
              {STATUS_KEYS.map((k) => (
                <button key={k} type="button"
                        className={'seg-btn' + (form.status === k ? ' on' : '')}
                        onClick={() => set('status', k)}>
                  {NOTICE_STATUS[k].label}
                </button>
              ))}
            </div>
          </div>
        </div>
        <footer>
          <button className="btn outline" type="button" onClick={onClose}>キャンセル</button>
          <button className="btn primary" type="button" onClick={onSave}>変更を保存</button>
        </footer>
      </div>
    </div>
  );
}
