// アカウント・セキュリティ
import * as React from 'react';

import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

import type { SectionProps } from '../../types';
import { Field } from '../Field';
import { PasswordChangeDialog } from '../PasswordChangeDialog';
import { SettingsHeader } from '../SettingsHeader';

export function SectionSecurity({ onChange }: SectionProps) {
  const [pwDialogOpen, setPwDialogOpen] = React.useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = React.useState(false);

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
              <button className="btn outline" type="button" onClick={() => setPwDialogOpen(true)}>パスワードを変更する</button>
            </Field>
          </div>
        </div>
      </section>

      <section className="settings-card card danger">
        <SettingsHeader title="アカウントの削除" desc="この操作は取り消せません。すべての関連データが削除されます。" />
        <div className="sc-body">
          <button className="btn danger" type="button" onClick={() => setDeleteConfirmOpen(true)}>アカウントを削除する</button>
        </div>
      </section>

      <PasswordChangeDialog open={pwDialogOpen} onClose={() => setPwDialogOpen(false)} onSubmit={onChange} />

      <ConfirmDialog
        open={deleteConfirmOpen}
        title="アカウントを削除しますか？"
        body="この操作は取り消せません。すべての関連データが削除されます。"
        confirmLabel="削除する"
        danger
        onConfirm={() => setDeleteConfirmOpen(false)}
        onCancel={() => setDeleteConfirmOpen(false)}
      />
    </>
  );
}
