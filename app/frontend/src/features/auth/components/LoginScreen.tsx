import { BrandIcon } from '@/components/icons';
import { MotifLotus } from '@/components/motifs';

import type { LoginResult } from '../types';
import { LoginForm } from './LoginForm';

interface LoginScreenProps {
  onSubmit: (result: LoginResult) => void;
}

// ログイン画面（中央寄せレイアウト）。
export function LoginScreen({ onSubmit }: LoginScreenProps) {
  return (
    <div className="login-stage v-centered">
      <MotifLotus />
      <div className="login-card">
        <div className="header-mark">
          <div className="brand-mark lg"><BrandIcon /></div>
          <div className="brand-name">
            寺院管理システム
            <span className="sub">Temple Administration</span>
          </div>
        </div>
        <h1 className="login-title">サインイン</h1>
        <p className="login-lead">続行するにはサインインしてください。</p>
        <LoginForm onSubmit={onSubmit} />
      </div>
    </div>
  );
}
