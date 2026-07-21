import { useState } from 'react';

import type { LoginResult } from '../types';

interface LoginFormProps {
  onSubmit: (result: LoginResult) => void;
}

interface FieldErrors {
  id: string;
  pw: string;
  form: string;
}

const EMPTY_ERRORS: FieldErrors = { id: '', pw: '', form: '' };

// デモ用認証情報（プロトタイプ）。
const DEMO_ID = 'tera-admin';
const DEMO_PW = 'temple2024';

export function LoginForm({ onSubmit }: LoginFormProps) {
  const [id, setId] = useState('');
  const [pw, setPw] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [remember, setRemember] = useState(true);
  const [errs, setErrs] = useState<FieldErrors>(EMPTY_ERRORS);
  const [submitting, setSubmitting] = useState(false);
  const [shake, setShake] = useState(false);

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const handle = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const newErrs: FieldErrors = { ...EMPTY_ERRORS };
    if (!id.trim()) newErrs.id = '寺務員IDを入力してください。';
    if (!pw) newErrs.pw = 'パスワードを入力してください。';
    if (newErrs.id || newErrs.pw) {
      setErrs(newErrs);
      triggerShake();
      return;
    }
    setSubmitting(true);
    setErrs(EMPTY_ERRORS);
    setTimeout(() => {
      const ok = id.trim() === DEMO_ID && pw === DEMO_PW;
      if (ok) {
        onSubmit({ ok: true, user: { id: id.trim() } });
      } else {
        setSubmitting(false);
        setErrs({ id: '', pw: '', form: '認証情報が正しくありません。再度ご確認ください。' });
        triggerShake();
        onSubmit({ ok: false });
      }
    }, 1100);
  };

  const fillDemo = () => {
    setId(DEMO_ID);
    setPw(DEMO_PW);
  };

  return (
    <form onSubmit={handle} className={shake ? 'shake' : ''} noValidate>
      <div className="field">
        <label htmlFor="id">寺務員ID</label>
        <div className={'input-wrap' + (errs.id ? ' error' : '')}>
          <svg className="lead-icon" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
          <input
            id="id"
            type="text"
            autoComplete="username"
            placeholder="例: tera-admin"
            value={id}
            onChange={(e) => setId(e.target.value)}
            disabled={submitting}
          />
        </div>
        {errs.id && (
          <p className="field-error">
            <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><line x1="12" x2="12" y1="8" y2="12" /><line x1="12" x2="12.01" y1="16" y2="16" /></svg>
            {errs.id}
          </p>
        )}
      </div>

      <div className="field">
        <label htmlFor="pw">
          <span>パスワード</span>
          <a className="hint" href="#" onClick={(e) => e.preventDefault()} style={{ color: 'var(--fg2)', textDecoration: 'none' }}>パスワードをお忘れですか？</a>
        </label>
        <div className={'input-wrap' + (errs.pw ? ' error' : '')}>
          <svg className="lead-icon" viewBox="0 0 24 24"><rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
          <input
            id="pw"
            type={showPw ? 'text' : 'password'}
            autoComplete="current-password"
            placeholder="パスワードを入力"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            disabled={submitting}
          />
          <button
            type="button"
            className="pw-toggle"
            onClick={() => setShowPw((s) => !s)}
            aria-label={showPw ? 'パスワードを非表示' : 'パスワードを表示'}
            tabIndex={-1}
          >
            {showPw ? (
              <svg viewBox="0 0 24 24"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" /><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" /><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" /><line x1="2" x2="22" y1="2" y2="22" /></svg>
            ) : (
              <svg viewBox="0 0 24 24"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></svg>
            )}
          </button>
        </div>
        {errs.pw && (
          <p className="field-error">
            <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><line x1="12" x2="12" y1="8" y2="12" /><line x1="12" x2="12.01" y1="16" y2="16" /></svg>
            {errs.pw}
          </p>
        )}
      </div>

      <div className="row-between">
        <label className="check">
          <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
          <span className="box"><svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" /></svg></span>
          ログイン状態を保持する
        </label>
      </div>

      {errs.form && (
        <p className="field-error" style={{ marginBottom: 12 }}>
          <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><line x1="12" x2="12" y1="8" y2="12" /><line x1="12" x2="12.01" y1="16" y2="16" /></svg>
          {errs.form}
        </p>
      )}

      <button type="submit" className="submit" disabled={submitting}>
        {submitting ? (
          <>
            <span className="spinner" />
            <span>認証中…</span>
          </>
        ) : (
          <>
            <svg viewBox="0 0 24 24"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" /><polyline points="10 17 15 12 10 7" /><line x1="15" x2="3" y1="12" y2="12" /></svg>
            <span>サインイン</span>
          </>
        )}
      </button>

      <div
        className="demo-hint"
        role="button"
        tabIndex={0}
        onClick={fillDemo}
        onKeyDown={(e) => { if (e.key === 'Enter') fillDemo(); }}
        style={{ cursor: 'pointer' }}
      >
        <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" /></svg>
        <span>デモ用認証情報: ID <b>tera-admin</b> / パスワード <b>temple2024</b> &nbsp;(クリックで入力)</span>
      </div>
    </form>
  );
}
