// 法要・お布施
import * as React from 'react';

import { KAIKI_YEARS } from '../../constants';
import type { SectionProps } from '../../types';
import { Field } from '../Field';
import { SettingsHeader } from '../SettingsHeader';
import { Toggle } from '../Toggle';

export function SectionServices({ onChange }: SectionProps) {
  const [kaiki, setKaiki] = React.useState<Set<number>>(new Set(KAIKI_YEARS));
  const [autoNotify, setAutoNotify] = React.useState(true);
  const [notifyDays, setNotifyDays] = React.useState<string | number>(60);

  return (
    <>
      <section className="settings-card card">
        <SettingsHeader title="年忌・案内自動化" desc="該当する年忌の自動抽出と案内送付の事前通知を設定します。" />
        <div className="sc-body">
          <div className="kaiki-grid">
            {KAIKI_YEARS.map(y => (
              <label key={y} className={'kaiki-chip-btn' + (kaiki.has(y) ? ' on' : '')}>
                <input type="checkbox" checked={kaiki.has(y)} onChange={() => {
                  const next = new Set(kaiki);
                  if (next.has(y)) next.delete(y); else next.add(y);
                  setKaiki(next); onChange();
                }} />
                <span className="kaiki-y">{y}</span>
                <span className="kaiki-l">{y === 1 ? '一周忌' : y + '回忌'}</span>
              </label>
            ))}
          </div>

          <div style={{marginTop: 18, display: 'flex', flexDirection: 'column', gap: 8}}>
            <Toggle label="該当年忌を自動で集計する" desc="毎週月曜日に翌年分の年忌を更新します。" checked={autoNotify} onChange={(v) => { setAutoNotify(v); onChange(); }} />
            <div className="indent">
              <Field label="案内送付の事前通知" hint="法要日の何日前から">
                <div className="num-with-suffix">
                  <input className="input-plain" type="number" value={notifyDays} onChange={(e) => { setNotifyDays(e.target.value); onChange(); }} style={{width: 100}} />
                  <span>日前</span>
                </div>
              </Field>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
