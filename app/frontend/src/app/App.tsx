// App — ルートのフロー制御（ログイン ⇄ ダッシュボード）+ トースト + サインアウト確認。
import * as React from 'react';

import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { ToastStack } from '@/components/ui/Toast';
import { LoginScreen } from '@/features/auth';
import type { LoginResult } from '@/features/auth';
import type { Toast, ToastInput } from '@/types/toast';

import { Dashboard } from './Dashboard';

type Route = 'login' | 'dashboard';

export function App() {
  const [route, setRoute] = React.useState<Route>('login');
  const [leaving, setLeaving] = React.useState(false);
  const [toasts, setToasts] = React.useState<Toast[]>([]);
  const [confirmLogout, setConfirmLogout] = React.useState(false);

  const dismissToast = (id: string) => {
    setToasts((arr) => arr.map((x) => (x.id === id ? { ...x, leaving: true } : x)));
    setTimeout(() => setToasts((arr) => arr.filter((x) => x.id !== id)), 220);
  };

  const pushToast = (toast: ToastInput) => {
    const id = Math.random().toString(36).slice(2);
    const { duration, ...rest } = toast;
    setToasts((arr) => [...arr, { id, ...rest }]);
    setTimeout(() => dismissToast(id), duration ?? 3800);
  };

  const handleSubmit = (res: LoginResult) => {
    if (res.ok) {
      pushToast({ kind: 'success', title: 'ログインしました。', desc: 'ダッシュボードにリダイレクトします。' });
      setLeaving(true);
      setTimeout(() => {
        setRoute('dashboard');
        setLeaving(false);
      }, 380);
    } else {
      pushToast({ kind: 'error', title: 'ログインに失敗しました。', desc: '認証情報が正しくありません。' });
    }
  };

  const doLogout = () => {
    setConfirmLogout(false);
    pushToast({ kind: 'info', title: 'サインアウトしました。', desc: 'またのご利用をお待ちしております。' });
    setRoute('login');
  };

  return (
    <div className="app-root">
      {route === 'login' && (
        <div data-leaving={leaving ? '1' : '0'} style={{ position: 'absolute', inset: 0 }}>
          <LoginScreen onSubmit={handleSubmit} />
        </div>
      )}
      {route === 'dashboard' && (
        <Dashboard onLogout={() => setConfirmLogout(true)} onToast={pushToast} />
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
    </div>
  );
}
