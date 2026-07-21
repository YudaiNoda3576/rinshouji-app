// 年忌案内の編集ダイアログ（対象日・状態）。
// 【未永続化】保存先テーブルが未設計のため、状態変更は NoticesPage のローカル state に
// 反映されるのみ（リロードで消える）。対象日の変更は現時点では反映されない。

import * as React from 'react';

import { NOTICE_STATUS } from '../constants';
import type { NoticeCase, NoticeStatusKey } from '../types';

interface EditNoticeDialogProps {
  open: boolean;
  notice: NoticeCase;
  onClose: () => void;
  onSave: (status: NoticeStatusKey) => void;
}

interface EditForm {
  targetDate: string;
  status: NoticeStatusKey;
}

const STATUS_KEYS: NoticeStatusKey[] = ['pending', 'sent', 'confirmed', 'declined'];

const fromNotice = (n: NoticeCase): EditForm => ({
  targetDate: n.targetDate ?? '',
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
              {notice.kaimyo}（{notice.familyName ?? '関連檀家なし'}）／ {notice.kaiki}
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
          <p style={{margin: '14px 0 0', fontSize: 11, color: 'var(--fg2)'}}>
            ※ 保存はまだ永続化されません。状態変更は画面上のみの反映で、リロードすると元に戻ります。
          </p>
        </div>
        <footer>
          <button className="btn outline" type="button" onClick={onClose}>キャンセル</button>
          <button className="btn primary" type="button" onClick={() => onSave(form.status)}>変更を保存</button>
        </footer>
      </div>
    </div>
  );
}
