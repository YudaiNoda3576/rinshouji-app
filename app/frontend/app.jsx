// app.jsx — root app: flow controller + tweaks + toasts

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "variant": "centered",
  "demoState": "normal",
  "motif": true,
  "motifKind": "lotus",
  "accent": "#2563EB",
  "parishVariant": "table"
}/*EDITMODE-END*/;

function ToastStack({ items, onDismiss }) {
  return (
    <div className="toast-stack" aria-live="polite">
      {items.map((t) => (
        <div key={t.id} className={'toast ' + t.kind} data-leaving={t.leaving ? '1' : '0'}>
          <div className="ico">
            {t.kind === 'success' && <svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>}
            {t.kind === 'error' && <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>}
            {t.kind === 'info' && <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>}
          </div>
          <div className="body">
            <p className="t">{t.title}</p>
            {t.desc && <p className="d">{t.desc}</p>}
          </div>
          <button className="x" onClick={() => onDismiss(t.id)} aria-label="閉じる">
            <svg viewBox="0 0 24 24"><line x1="18" x2="6" y1="6" y2="18"/><line x1="6" x2="18" y1="6" y2="18"/></svg>
          </button>
        </div>
      ))}
    </div>
  );
}

function ConfirmDialog({ open, title, body, confirmLabel, danger, onConfirm, onCancel }) {
  if (!open) return null;
  return (
    <div className="dialog-overlay" onClick={onCancel}>
      <div className="dialog" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <header><h3>{title}</h3></header>
        <div className="body">{body}</div>
        <footer>
          <button className="btn outline" onClick={onCancel}>キャンセル</button>
          <button className={'btn ' + (danger ? 'danger' : 'primary')} onClick={onConfirm}>{confirmLabel}</button>
        </footer>
      </div>
    </div>
  );
}

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  // route: 'login' | 'dashboard'
  const [route, setRoute] = React.useState('login');
  const [leaving, setLeaving] = React.useState(false);
  const [toasts, setToasts] = React.useState([]);
  const [confirmLogout, setConfirmLogout] = React.useState(false);
  // demoState: 'normal' | 'loading' | 'error'  → maps to a forced LoginForm state
  const demoState = route === 'login' ? t.demoState : 'normal';

  // Apply accent color globally
  React.useEffect(() => {
    document.documentElement.style.setProperty('--accent-color', t.accent);
  }, [t.accent]);

  const pushToast = (toast) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((arr) => [...arr, { id, ...toast }]);
    setTimeout(() => dismissToast(id), toast.duration || 3800);
  };
  const dismissToast = (id) => {
    setToasts((arr) => arr.map((x) => x.id === id ? { ...x, leaving: true } : x));
    setTimeout(() => setToasts((arr) => arr.filter((x) => x.id !== id)), 220);
  };

  const handleSubmit = (res) => {
    if (res.ok) {
      pushToast({ kind: 'success', title: 'ログインしました。', desc: 'ダッシュボードにリダイレクトします。' });
      setLeaving(true);
      setTimeout(() => { setRoute('dashboard'); setLeaving(false); }, 380);
    } else {
      pushToast({ kind: 'error', title: 'ログインに失敗しました。', desc: '認証情報が正しくありません。' });
    }
  };

  const doLogout = () => {
    setConfirmLogout(false);
    pushToast({ kind: 'info', title: 'サインアウトしました。', desc: 'またのご利用をお待ちしております。' });
    setRoute('login');
  };

  const VariantCmp = {
    centered: VariantCentered,
    split: VariantSplit,
    fullbleed: VariantFullbleed,
  }[t.variant] || VariantCentered;

  return (
    <div className="app-root">
      {route === 'login' && (
        <div data-leaving={leaving ? '1' : '0'} style={{ position: 'absolute', inset: 0 }}>
          <VariantCmp state={demoState} onSubmit={handleSubmit} motifOn={t.motif} motifKind={t.motifKind} />
        </div>
      )}
      {route === 'dashboard' && (
        <Dashboard active={true} onLogout={() => setConfirmLogout(true)} onToast={pushToast} parishVariant={t.parishVariant} />
      )}

      <ToastStack items={toasts} onDismiss={dismissToast} />

      <ConfirmDialog
        open={confirmLogout}
        title="サインアウトしますか？"
        body="サインアウトすると、再度ご利用にはサインインが必要です。"
        confirmLabel="サインアウト"
        danger
        onConfirm={doLogout}
        onCancel={() => setConfirmLogout(false)}
      />

      <TweaksPanel title="Tweaks">
        <TweakSection label="レイアウト案">
          <TweakRadio label="バリアント"
            value={t.variant}
            options={[
              { value: 'centered', label: '中央' },
              { value: 'split', label: '左右' },
              { value: 'fullbleed', label: '全画面' },
            ]}
            onChange={(v) => setTweak('variant', v)} />
        </TweakSection>
        <TweakSection label="状態デモ (ログイン画面)">
          <TweakRadio label="表示"
            value={t.demoState}
            options={[
              { value: 'normal', label: '通常' },
              { value: 'error', label: 'エラー' },
              { value: 'loading', label: '認証中' },
            ]}
            onChange={(v) => setTweak('demoState', v)} />
        </TweakSection>
        <TweakSection label="背景モチーフ">
          <TweakToggle label="モチーフを表示" value={t.motif} onChange={(v) => setTweak('motif', v)} />
          <TweakRadio label="種類"
            value={t.motifKind}
            options={[
              { value: 'lotus', label: '蓮' },
              { value: 'seigaiha', label: '青海波' },
              { value: 'asanoha', label: '麻の葉' },
            ]}
            onChange={(v) => setTweak('motifKind', v)} />
        </TweakSection>
        <TweakSection label="アクセントカラー">
          <TweakColor label="色" value={t.accent}
            options={['#2563EB', '#059669', '#7C3AED', '#0F766E']}
            onChange={(v) => setTweak('accent', v)} />
        </TweakSection>
        {route === 'dashboard' && (
          <TweakSection label="檀家管理 レイアウト">
            <TweakRadio label="バリアント"
              value={t.parishVariant}
              options={[
                { value: 'table', label: '表' },
                { value: 'cards', label: 'カード' },
                { value: 'tree', label: '境内' },
              ]}
              onChange={(v) => setTweak('parishVariant', v)} />
          </TweakSection>
        )}
        {route === 'dashboard' && (
          <TweakSection label="アクション">
            <TweakButton label="ログイン画面に戻る" onClick={() => setRoute('login')} secondary />
          </TweakSection>
        )}
      </TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);