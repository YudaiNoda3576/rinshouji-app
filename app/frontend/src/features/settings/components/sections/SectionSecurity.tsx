// アカウント・セキュリティ
import * as React from 'react';

import type { SectionProps } from '../../types';
import { Field } from '../Field';
import { SettingsHeader } from '../SettingsHeader';
import { Toggle } from '../Toggle';

export function SectionSecurity({ onChange }: SectionProps) {
  const [twofa, setTwofa] = React.useState(true);
  const [sessTimeout, setSessTimeout] = React.useState<string | number>(30);

  return (
    <>
      <section className="settings-card card">
        <SettingsHeader title="ログインアカウント" desc="ご自身のアカウントに関する設定です。" />
        <div className="sc-body">
          <div className="field-grid">
            <Field label="氏名"><input className="input-plain" defaultValue="寺務員 太郎" onChange={onChange} /></Field>
            <Field label="ログインID"><input className="input-plain" defaultValue="tera-admin" disabled /></Field>
            <Field label="メール"><input className="input-plain" defaultValue="office@jomyo-ji.jp" onChange={onChange} /></Field>
            <Field label="パスワード">
              <button className="btn outline" type="button">パスワードを変更</button>
            </Field>
          </div>
        </div>
      </section>

      <section className="settings-card card">
        <SettingsHeader title="セキュリティ" desc="不正アクセスを防ぐための設定です。" />
        <div className="sc-body">
          <Toggle label="二段階認証" desc="ログイン時にメールへワンタイムコードを送信します。" checked={twofa} onChange={(v) => { setTwofa(v); onChange(); }} />
          <Field label="自動ログアウト" hint="無操作で">
            <div className="num-with-suffix">
              <input className="input-plain" type="number" value={sessTimeout} onChange={(e) => { setSessTimeout(e.target.value); onChange(); }} style={{width: 100}} />
              <span>分</span>
            </div>
          </Field>
        </div>
      </section>

      <section className="settings-card card danger">
        <SettingsHeader title="アカウントの削除" desc="この操作は取り消せません。すべての関連データが削除されます。" />
        <div className="sc-body">
          <button className="btn danger" type="button">アカウントを削除する</button>
        </div>
      </section>
    </>
  );
}
