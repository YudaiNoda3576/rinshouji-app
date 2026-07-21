// パスワード変更ダイアログ（モック: 送信しても実際の変更処理は行わない）。
import * as React from 'react';

interface PasswordChangeDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit?: () => void;
}

export function PasswordChangeDialog({ open, onClose, onSubmit }: PasswordChangeDialogProps) {
  const [current, setCurrent] = React.useState('');
  const [next, setNext] = React.useState('');
  const [confirm, setConfirm] = React.useState('');

  React.useEffect(() => {
    if (open) { setCurrent(''); setNext(''); setConfirm(''); }
  }, [open]);

  if (!open) return null;

  const mismatch = next.length > 0 && confirm.length > 0 && next !== confirm;
  const canSubmit = current.length > 0 && next.length > 0 && confirm.length > 0 && !mismatch;

  const handleSubmit = (): void => {
    if (!canSubmit) return;
    onSubmit?.();
    onClose();
  };

  return (
    <div className="dialog-overlay" onClick={onClose}>
      <div className="dialog" style={{ width: 480 }} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <h3>パスワードを変更</h3>
          <button className="x-btn" onClick={onClose} aria-label="閉じる">
            <svg viewBox="0 0 24 24"><line x1="18" x2="6" y1="6" y2="18" /><line x1="6" x2="18" y1="6" y2="18" /></svg>
          </button>
        </header>
        <div className="body">
          <div className="form-field" style={{ marginBottom: 14 }}>
            <label>現在のパスワード</label>
            <input className="input-plain" type="password" value={current} onChange={(e) => setCurrent(e.target.value)} autoComplete="current-password" />
          </div>
          <div className="form-field" style={{ marginBottom: 14 }}>
            <label>新しいパスワード</label>
            <input className="input-plain" type="password" value={next} onChange={(e) => setNext(e.target.value)} autoComplete="new-password" />
          </div>
          <div className="form-field">
            <label>新しいパスワード（確認）</label>
            <input className="input-plain" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="new-password" />
            {mismatch && <span style={{ fontSize: 11, color: 'var(--temple-red)' }}>新しいパスワードが一致しません。</span>}
          </div>
        </div>
        <footer>
          <button className="btn outline" type="button" onClick={onClose}>キャンセル</button>
          <button className="btn primary" type="button" onClick={handleSubmit} disabled={!canSubmit}>変更する</button>
        </footer>
      </div>
    </div>
  );
}
