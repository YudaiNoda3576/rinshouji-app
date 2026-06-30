// 案内テンプレート
import * as React from 'react';

import type { SectionProps, TemplateItem } from '../../types';
import { SettingsHeader } from '../SettingsHeader';

export function SectionTemplates({ onChange }: SectionProps) {
  const [active, setActive] = React.useState('kaiki-letter');
  const TEMPLATES: TemplateItem[] = [
    { id: 'kaiki-letter', name: '年忌案内 (封書)',   channel: 'mail' },
    { id: 'kaiki-line',   name: '年忌案内 (LINE)',   channel: 'line' },
    { id: 'obon',         name: 'お盆参拝のご案内',  channel: 'mail' },
    { id: 'higan',        name: 'お彼岸参拝のご案内',channel: 'line' },
    { id: 'shotsuki',     name: '月命日リマインダー',channel: 'line' },
  ];
  const cur = TEMPLATES.find(t => t.id === active) ?? TEMPLATES[0];
  const [body, setBody] = React.useState(`{{戸主名}} 様

時下ますます御清祥のこととお慶び申し上げます。

さて、来る {{法要日}} に
故 {{戒名}}（{{俗名}}）様の{{年忌}}法要を当山にて勤修いたしたく存じます。

つきましては、ご家族・ご親族の皆様にご参列いただきたく、ご案内申し上げます。

日時：{{法要日}} 午前10時30分より
場所：当山 本堂
御布施：お志
会食：法要後、本院にてお膳を用意いたします

合掌 {{寺院名}} 住職`);

  const VARS = ['{{戸主名}}', '{{戒名}}', '{{俗名}}', '{{法要日}}', '{{年忌}}', '{{寺院名}}', '{{住職名}}', '{{家名}}', '{{住所}}'];

  return (
    <section className="settings-card card">
      <SettingsHeader title="案内テンプレート" desc="変数は二重波括弧 {{ }} で挿入できます。送信時に自動置換されます。" />
      <div className="sc-body">
        <div className="tpl-layout">
          <div className="tpl-list">
            {TEMPLATES.map(t => (
              <button key={t.id} className={'tpl-row' + (active === t.id ? ' on' : '')} onClick={() => setActive(t.id)}>
                <span className={'tpl-channel ' + t.channel}>{t.channel === 'mail' ? '郵送' : 'LINE'}</span>
                <span className="tpl-name">{t.name}</span>
              </button>
            ))}
            <button className="btn outline tpl-add" onClick={() => onChange()}>
              <svg viewBox="0 0 24 24"><line x1="12" x2="12" y1="5" y2="19"/><line x1="5" x2="19" y1="12" y2="12"/></svg>
              新しいテンプレート
            </button>
          </div>

          <div className="tpl-edit">
            <div className="tpl-edit-head">
              <input className="input-plain" defaultValue={cur.name} onChange={onChange} />
              <select className="input-plain" defaultValue={cur.channel} onChange={onChange} style={{width: 120}}>
                <option value="mail">郵送 / メール</option>
                <option value="line">LINE</option>
              </select>
            </div>
            <div className="tpl-vars">
              <span className="tpl-vars-l">挿入できる変数</span>
              {VARS.map(v => (
                <button key={v} className="tpl-var-chip" onClick={() => { setBody(body + ' ' + v); onChange(); }}>{v}</button>
              ))}
            </div>
            <textarea className="tpl-body" value={body} onChange={(e) => { setBody(e.target.value); onChange(); }} rows={14} />
            <div className="tpl-edit-foot">
              <span className="dim">{body.length}文字</span>
              <button className="btn ghost" type="button">プレビュー</button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
