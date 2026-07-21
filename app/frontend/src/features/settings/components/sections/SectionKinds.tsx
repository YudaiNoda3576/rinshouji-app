// 予定種別
import * as React from 'react';

import type { SectionProps, SettingsEventKind } from '../../types';
import { deriveSet } from '../../utils';
import { SettingsHeader } from '../SettingsHeader';

const MAX_KINDS = 8;
const COLORS = ['#7C3AED', '#2563EB', '#059669', '#DC2626', '#D97706', '#0891B2', '#DB2777', '#6B7280'];

export function SectionKinds({ onChange }: SectionProps) {
  const [kinds, setKinds] = React.useState<SettingsEventKind[]>(
    () => (window.getEventKinds ? window.getEventKinds() : []),
  );
  React.useEffect(() => {
    const h = () => setKinds([...(window.getEventKinds ? window.getEventKinds() : [])]);
    window.addEventListener('event-kinds-changed', h);
    return () => window.removeEventListener('event-kinds-changed', h);
  }, []);

  const commit = (next: SettingsEventKind[]): void => {
    setKinds(next);
    if (window.setEventKinds) window.setEventKinds(next);
    onChange();
  };
  const update = (i: number, patch: Partial<SettingsEventKind>): void => {
    const next = kinds.slice();
    const merged: SettingsEventKind = { ...next[i], ...patch };
    if (patch.color) { delete merged.tint; delete merged.dark; }
    next[i] = merged;
    commit(next);
  };
  const remove = (i: number): void => commit(kinds.filter((_, j) => j !== i));
  const add = (): void => {
    if (kinds.length >= MAX_KINDS) return;
    const key = 'custom-' + Math.random().toString(36).slice(2, 7);
    commit([...kinds, { key, label: '新しい種別', color: COLORS[kinds.length % COLORS.length] }]);
  };
  const atLimit = kinds.length >= MAX_KINDS;

  return (
    <section className="settings-card card">
      <SettingsHeader title="予定種別" desc="予定登録時に選択できる種別とテーマカラーを管理します。" />
      <div className="sc-body">
        <div className="kind-edit-list">
          {kinds.map((k, i) => (
            <div key={k.key} className="kind-edit-row">
              <div className="kind-edit-preview" style={{ background: deriveSet(k).tint, color: deriveSet(k).dark, borderLeft: `4px solid ${k.color}` }}>
                <span className="cal-chip-dot" style={{background: k.color}}></span>
                {k.label || '(無題)'}
              </div>
              <input
                className="input-plain kind-edit-name"
                value={k.label}
                placeholder="種別名"
                onChange={(e) => update(i, { label: e.target.value })}
              />
              <div className="kind-edit-colors">
                {COLORS.map(c => (
                  <button key={c} type="button"
                          className={'kind-color-swatch' + (c.toLowerCase() === (k.color || '').toLowerCase() ? ' on' : '')}
                          style={{ background: c }}
                          onClick={() => update(i, { color: c })}
                          aria-label={`色 ${c}`} />
                ))}
                <input type="color" className="kind-edit-color-input"
                       value={k.color || '#7C3AED'}
                       onChange={(e) => update(i, { color: e.target.value })}
                       title="カスタムカラー" />
              </div>
              <button className="icon-btn" onClick={() => remove(i)} disabled={k.builtin && kinds.length <= 1}
                      title={k.builtin ? '初期種別 (削除可)' : '削除'} aria-label="削除">
                <svg viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
              </button>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 14, alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <span className="dim" style={{ fontSize: 12 }}>
            予定登録ダイアログの「種別を編集」ボタンからもここを開けます。
            <br />
            <span style={{ color: atLimit ? 'var(--temple-red)' : 'inherit', fontWeight: atLimit ? 600 : 400 }}>
              登録済 {kinds.length} / {MAX_KINDS}件 (最大{MAX_KINDS}件まで)
            </span>
          </span>
          <button className="btn outline" type="button" onClick={add} disabled={atLimit} title={atLimit ? `上限(${MAX_KINDS}件)に達しています` : ''}>
            <svg viewBox="0 0 24 24"><line x1="12" x2="12" y1="5" y2="19"/><line x1="5" x2="19" y1="12" y2="12"/></svg>
            種別を追加
          </button>
        </div>
      </div>
    </section>
  );
}
