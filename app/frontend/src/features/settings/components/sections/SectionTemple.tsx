// 寺院情報
import * as React from 'react';

import { TEMPLE_SECTS_EXTENDED } from '@/constants/temple';

import type { SectionProps, TempleInfo } from '../../types';
import { Field } from '../Field';
import { SettingsHeader } from '../SettingsHeader';

export function SectionTemple({ onChange }: SectionProps) {
  const [v, setV] = React.useState<TempleInfo>({
    name: '青苔山 浄妙寺',
    nameKana: 'せいたいざん じょうみょうじ',
    sect: '浄土真宗',
    abbot: '高橋 良観',
    founded: 1623,
    zip: '140-0004',
    addr: '東京都品川区南品川3-12-4',
    phone: '03-3458-0000',
    fax: '03-3458-0001',
    email: 'info@jomyo-ji.jp',
    web: 'https://jomyo-ji.jp',
  });
  const set =
    (k: keyof TempleInfo) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
      setV((prev) => ({ ...prev, [k]: e.target.value }));
      onChange();
    };

  return (
    <section className="settings-card card">
      <SettingsHeader title="寺院情報" desc="案内状や領収書、システム表示に使用されます。" />

      <div className="sc-body">
        <div className="logo-row">
          <div className="logo-mark">
            <svg viewBox="0 0 60 60"><g fill="var(--temple-purple)"><path d="M30 4 L56 12 L30 20 L4 12 Z"/><rect x="10" y="20" width="40" height="4"/><rect x="6" y="46" width="48" height="8"/><rect x="14" y="24" width="6" height="22"/><rect x="40" y="24" width="6" height="22"/><rect x="26" y="24" width="8" height="22"/></g></svg>
          </div>
          <div className="logo-meta">
            <div className="field-label" style={{marginBottom: 6}}>寺紋・ロゴ画像</div>
            <div className="logo-actions">
              <button className="btn outline" type="button">画像を変更</button>
              <button className="btn ghost" type="button">初期に戻す</button>
            </div>
            <div className="logo-spec">推奨 200×200px / PNG・SVG / 1MB以内</div>
          </div>
        </div>

        <div className="field-grid">
          <Field label="寺院名"><input className="input-plain" value={v.name} onChange={set('name')} /></Field>
          <Field label="読みがな"><input className="input-plain" value={v.nameKana} onChange={set('nameKana')} /></Field>
          <Field label="宗派">
            <select className="input-plain" value={v.sect} onChange={set('sect')}>
              {TEMPLE_SECTS_EXTENDED.map(s => <option key={s}>{s}</option>)}
            </select>
          </Field>
          <Field label="現住職"><input className="input-plain" value={v.abbot} onChange={set('abbot')} /></Field>
          <Field label="開山年" hint="西暦"><input className="input-plain" type="number" value={v.founded} onChange={set('founded')} /></Field>
          <Field label="郵便番号"><input className="input-plain" value={v.zip} onChange={set('zip')} style={{maxWidth: 140}} /></Field>
          <Field label="住所" span={2}><input className="input-plain" value={v.addr} onChange={set('addr')} /></Field>
          <Field label="電話"><input className="input-plain" value={v.phone} onChange={set('phone')} /></Field>
          <Field label="FAX"><input className="input-plain" value={v.fax} onChange={set('fax')} /></Field>
          <Field label="メール"><input className="input-plain" value={v.email} onChange={set('email')} /></Field>
          <Field label="Webサイト"><input className="input-plain" value={v.web} onChange={set('web')} /></Field>
        </div>
      </div>
    </section>
  );
}
