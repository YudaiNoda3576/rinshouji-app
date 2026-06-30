// 法要・お布施
import * as React from 'react';

import { KAIKI_YEARS } from '../../constants';
import type { SectionProps, ServiceRow } from '../../types';
import { Field } from '../Field';
import { SettingsHeader } from '../SettingsHeader';
import { Toggle } from '../Toggle';

export function SectionServices({ onChange }: SectionProps) {
  const [kaiki, setKaiki] = React.useState<Set<number>>(new Set(KAIKI_YEARS));
  const [autoNotify, setAutoNotify] = React.useState(true);
  const [notifyDays, setNotifyDays] = React.useState<string | number>(60);

  const [services, setServices] = React.useState<ServiceRow[]>([
    { name: '月命日法要',  fuse: '5,000円〜',  duration: 30, slot: 4 },
    { name: '年忌法要',    fuse: '30,000円〜', duration: 60, slot: 2 },
    { name: 'お盆参拝',    fuse: '3,000円〜',  duration: 20, slot: 8 },
    { name: 'お彼岸参拝',  fuse: '3,000円〜',  duration: 20, slot: 8 },
    { name: '葬儀',        fuse: '応相談',     duration: 120, slot: 1 },
  ]);

  const updateRow = (i: number, patch: Partial<ServiceRow>): void => {
    setServices((prev) => prev.map((row, j) => (j === i ? { ...row, ...patch } : row)));
    onChange();
  };

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

      <section className="settings-card card">
        <SettingsHeader title="法要種別とお布施目安" desc="新規予約時の選択肢として表示されます。" />
        <div className="sc-body">
          <table className="svc-table">
            <thead><tr><th>法要種別</th><th>お布施目安</th><th>所要時間</th><th>1日の上限</th><th></th></tr></thead>
            <tbody>
              {services.map((s, i) => (
                <tr key={i}>
                  <td><input className="input-plain" value={s.name} onChange={(e) => updateRow(i, { name: e.target.value })} /></td>
                  <td><input className="input-plain" value={s.fuse} onChange={(e) => updateRow(i, { fuse: e.target.value })} /></td>
                  <td>
                    <div className="num-with-suffix">
                      <input className="input-plain" type="number" value={s.duration} onChange={(e) => updateRow(i, { duration: e.target.value })} style={{width: 70}} />
                      <span>分</span>
                    </div>
                  </td>
                  <td>
                    <div className="num-with-suffix">
                      <input className="input-plain" type="number" value={s.slot} onChange={(e) => updateRow(i, { slot: e.target.value })} style={{width: 70}} />
                      <span>件</span>
                    </div>
                  </td>
                  <td><button className="icon-btn" onClick={() => { setServices(services.filter((_, j) => j !== i)); onChange(); }} aria-label="削除"><svg viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg></button></td>
                </tr>
              ))}
            </tbody>
          </table>
          <button className="btn outline" type="button" onClick={() => { setServices([...services, { name: '', fuse: '', duration: 30, slot: 1 }]); onChange(); }}>
            <svg viewBox="0 0 24 24"><line x1="12" x2="12" y1="5" y2="19"/><line x1="5" x2="19" y1="12" y2="12"/></svg>
            行を追加
          </button>
        </div>
      </section>
    </>
  );
}
