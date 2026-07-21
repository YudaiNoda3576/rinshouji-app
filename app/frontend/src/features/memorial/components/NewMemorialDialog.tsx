// 過去帳 — 新規登録・編集ダイアログ（画面項目定義書 §5 準拠）。

import * as React from 'react';

import { fetchHouseholdOptions } from '../api';
import { DIALOG_RELATIONS } from '../constants';
import { useDebouncedValue } from '../hooks';
import type { DeceasedForm, HouseholdOption } from '../types';

interface NewMemorialDialogProps {
  open: boolean;
  initial?: DeceasedForm;
  onClose: () => void;
  onSave: (form: DeceasedForm) => Promise<void>;
}

const EMPTY_FORM: DeceasedForm = {
  householdId: null,
  householdFamilyName: null,
  kaimyo: '',
  kaimyoNote: '',
  secularName: '',
  secularNameKana: '',
  deathYear: '',
  deathMonth: '',
  deathDay: '',
  deathWarekiRaw: '',
  ageAtDeath: '',
  sponsorName: '',
  relationToHead: '',
  noticeNote: '',
  note: '',
  legacyDistrict1: '',
  legacyDistrict2: '',
};

const ERA_TABLE: { name: string; start: number }[] = [
  { name: '令和', start: 2019 },
  { name: '平成', start: 1989 },
  { name: '昭和', start: 1926 },
  { name: '大正', start: 1912 },
  { name: '明治', start: 1868 },
];

// 西暦(+任意で月日)から和暦の原表記候補を機械算出する（フォームの自動初期表示専用。utils.ts の
// formatEra と同一ロジックだが、フォームは export しない内部関数のみで完結させるためここに複製する）。
function computeWarekiRaw(year: number, month: number | null, day: number | null): string {
  const era = ERA_TABLE.find((e) => year >= e.start) ?? ERA_TABLE[ERA_TABLE.length - 1];
  const n = year - era.start + 1;
  const nLabel = n === 1 ? '元' : String(n);
  let s = `${era.name}${nLabel}年`;
  if (month != null) s += `${month}月`;
  if (month != null && day != null) s += `${day}日`;
  return s;
}

export function NewMemorialDialog({ open, initial, onClose, onSave }: NewMemorialDialogProps) {
  const [form, setForm] = React.useState<DeceasedForm>(initial ?? EMPTY_FORM);
  const [warekiAuto, setWarekiAuto] = React.useState(true);
  const [submitting, setSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);

  const [householdMode, setHouseholdMode] = React.useState<'linked' | 'none'>('linked');
  const [householdQuery, setHouseholdQuery] = React.useState('');
  const [householdOptions, setHouseholdOptions] = React.useState<HouseholdOption[]>([]);
  const [householdLoading, setHouseholdLoading] = React.useState(false);
  const [householdError, setHouseholdError] = React.useState<string | null>(null);
  const debouncedHouseholdQuery = useDebouncedValue(householdQuery, 300);

  React.useEffect(() => {
    if (!open) return;
    const base = initial ?? EMPTY_FORM;
    setForm(base);
    // 新規登録時のみ、没年/月/日の入力に合わせて和暦を自動算出する（既存レコード編集時は原文を保持する）。
    setWarekiAuto(!initial);
    setSubmitting(false);
    setSubmitError(null);
    setHouseholdMode(base.householdId != null ? 'linked' : 'none');
    setHouseholdQuery(base.householdFamilyName ?? '');
    setHouseholdOptions(
      base.householdId != null && base.householdFamilyName != null
        ? [{ id: base.householdId, familyName: base.householdFamilyName }]
        : [],
    );
    setHouseholdError(null);
  }, [open, initial]);

  React.useEffect(() => {
    if (!open || householdMode !== 'linked') return;
    let cancelled = false;
    setHouseholdLoading(true);
    setHouseholdError(null);
    fetchHouseholdOptions(debouncedHouseholdQuery)
      .then((options) => {
        if (cancelled) return;
        // 現在選択中の檀家が検索結果に含まれない場合も選択状態を維持できるよう先頭に残す。
        setHouseholdOptions((prev) => {
          const current = prev.find((o) => o.id === form.householdId);
          if (current && !options.some((o) => o.id === current.id)) {
            return [current, ...options];
          }
          return options;
        });
        setHouseholdLoading(false);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setHouseholdError(err instanceof Error ? err.message : '檀家の検索に失敗しました。');
        setHouseholdLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, householdMode, debouncedHouseholdQuery]);

  if (!open) return null;
  const isEdit = Boolean(initial);

  const set = <K extends keyof DeceasedForm>(k: K, v: DeceasedForm[K]) => setForm((f) => ({ ...f, [k]: v }));

  const setDeathPart = (part: 'deathYear' | 'deathMonth' | 'deathDay', value: string) => {
    setForm((f) => {
      const next = { ...f, [part]: value };
      if (warekiAuto) {
        const y = Number.parseInt(next.deathYear, 10);
        if (!Number.isNaN(y) && next.deathYear.trim() !== '') {
          const m = next.deathMonth.trim() === '' ? null : Number.parseInt(next.deathMonth, 10);
          const d = next.deathDay.trim() === '' ? null : Number.parseInt(next.deathDay, 10);
          next.deathWarekiRaw = computeWarekiRaw(y, Number.isNaN(m as number) ? null : m, Number.isNaN(d as number) ? null : d);
        }
      }
      return next;
    });
  };

  const handleHouseholdModeChange = (mode: 'linked' | 'none') => {
    setHouseholdMode(mode);
    if (mode === 'none') {
      set('householdId', null);
      set('householdFamilyName', null);
    }
  };

  const handleHouseholdSelect = (id: string) => {
    const opt = householdOptions.find((o) => o.id === id);
    set('householdId', id === '' ? null : id);
    set('householdFamilyName', opt?.familyName ?? null);
  };

  const canSubmit =
    form.kaimyo.trim() !== '' && form.secularName.trim() !== '' && form.deathYear.trim() !== '' && !submitting;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      await onSave(form);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : '保存に失敗しました。時間をおいて再度お試しください。');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="dialog-overlay" onClick={submitting ? undefined : onClose}>
      <div className="dialog memorial-dialog" style={{ width: 760 }} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h3>{isEdit ? '過去帳を編集' : '新規 過去帳登録'}</h3>
            <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--fg2)' }}>戒名・俗名・没年月日・関連檀家を記録します。</p>
          </div>
          <button className="x-btn" onClick={onClose} aria-label="閉じる" type="button" disabled={submitting}>
            <svg viewBox="0 0 24 24"><line x1="18" x2="6" y1="6" y2="18"/><line x1="6" x2="18" y1="6" y2="18"/></svg>
          </button>
        </header>
        <div className="body memorial-dialog-body">
          {submitError && (
            <div className="memorial-form-error" role="alert">{submitError}</div>
          )}

          <div className="form-field">
            <label>関連檀家</label>
            <div className="mdlg-household-mode">
              <label className="mdlg-radio">
                <input
                  type="radio"
                  name="household-mode"
                  checked={householdMode === 'linked'}
                  onChange={() => handleHouseholdModeChange('linked')}
                />
                檀家を選択
              </label>
              <label className="mdlg-radio">
                <input
                  type="radio"
                  name="household-mode"
                  checked={householdMode === 'none'}
                  onChange={() => handleHouseholdModeChange('none')}
                />
                関連檀家なし（孤立故人として登録）
              </label>
            </div>
          </div>

          {householdMode === 'linked' ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div className="form-field">
                <label>檀家検索（家名）</label>
                <input
                  className="input-plain"
                  value={householdQuery}
                  onChange={(e) => setHouseholdQuery(e.target.value)}
                  placeholder="例: 佐藤"
                />
              </div>
              <div className="form-field">
                <label>檀家を選択 {householdLoading && <span className="mdlg-hint">検索中…</span>}</label>
                <select
                  className="input-plain"
                  value={form.householdId ?? ''}
                  onChange={(e) => handleHouseholdSelect(e.target.value)}
                >
                  <option value="">未選択</option>
                  {householdOptions.map((o) => (
                    <option key={o.id} value={o.id}>{o.familyName}</option>
                  ))}
                </select>
                {householdError && <div className="mdlg-hint mdlg-hint-error">{householdError}</div>}
              </div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div className="form-field">
                <label>旧地区1</label>
                <input className="input-plain" value={form.legacyDistrict1} onChange={(e) => set('legacyDistrict1', e.target.value)} placeholder="例: 篠木" />
              </div>
              <div className="form-field">
                <label>旧地区2</label>
                <input className="input-plain" value={form.legacyDistrict2} onChange={(e) => set('legacyDistrict2', e.target.value)} placeholder="例: 穴橋" />
              </div>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginTop: 14 }}>
            <div className="form-field" style={{ gridColumn: 'span 2' }}>
              <label>戒名</label>
              <input className="input-plain" value={form.kaimyo} onChange={(e) => set('kaimyo', e.target.value)} placeholder="例: 釈浄信信士" />
            </div>
            <div className="form-field" style={{ gridColumn: 'span 2' }}>
              <label>戒名注意</label>
              <input className="input-plain" value={form.kaimyoNote} onChange={(e) => set('kaimyoNote', e.target.value)} placeholder="例: 禅は口二つ（外字注意）" />
            </div>
            <div className="form-field" style={{ gridColumn: 'span 2' }}>
              <label>俗名</label>
              <input className="input-plain" value={form.secularName} onChange={(e) => set('secularName', e.target.value)} placeholder="例: 佐藤 文蔵" />
            </div>
            <div className="form-field" style={{ gridColumn: 'span 2' }}>
              <label>俗名フリガナ</label>
              <input className="input-plain" value={form.secularNameKana} onChange={(e) => set('secularNameKana', e.target.value)} placeholder="例: サトウ ブンゾウ" />
            </div>
            <div className="form-field">
              <label>没年（西暦）</label>
              <input className="input-plain" type="number" value={form.deathYear} onChange={(e) => setDeathPart('deathYear', e.target.value)} placeholder="例: 1998" />
            </div>
            <div className="form-field">
              <label>没月</label>
              <select className="input-plain" value={form.deathMonth} onChange={(e) => setDeathPart('deathMonth', e.target.value)}>
                <option value="">未入力</option>
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <option key={m} value={m}>{m}月</option>
                ))}
              </select>
            </div>
            <div className="form-field">
              <label>没日</label>
              <select className="input-plain" value={form.deathDay} onChange={(e) => setDeathPart('deathDay', e.target.value)}>
                <option value="">未入力</option>
                {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                  <option key={d} value={d}>{d}日</option>
                ))}
              </select>
            </div>
            <div className="form-field">
              <label>和暦（原表記）</label>
              <input
                className="input-plain"
                value={form.deathWarekiRaw}
                onChange={(e) => { setWarekiAuto(false); set('deathWarekiRaw', e.target.value); }}
                placeholder="例: 平成10年5月16日"
              />
            </div>
            <div className="form-field">
              <label>享年</label>
              <input className="input-plain" type="number" min="0" max="120" value={form.ageAtDeath} onChange={(e) => set('ageAtDeath', e.target.value)} placeholder="例: 78" />
            </div>
            <div className="form-field">
              <label>施主名</label>
              <input className="input-plain" value={form.sponsorName} onChange={(e) => set('sponsorName', e.target.value)} placeholder="例: 河合博元" />
            </div>
            <div className="form-field">
              <label>続柄</label>
              <input className="input-plain" list="memorial-relation-list" value={form.relationToHead} onChange={(e) => set('relationToHead', e.target.value)} placeholder="例: 妻" />
              <datalist id="memorial-relation-list">
                {DIALOG_RELATIONS.map((r) => <option key={r} value={r} />)}
              </datalist>
            </div>
            <div className="form-field" style={{ gridColumn: 'span 2' }}>
              <label>案内注意</label>
              <input className="input-plain" value={form.noticeNote} onChange={(e) => set('noticeNote', e.target.value)} placeholder="例: 案内不要（遠方のため）" />
            </div>
            <div className="form-field" style={{ gridColumn: 'span 4' }}>
              <label>備考</label>
              <textarea className="input-plain" rows={3} value={form.note} onChange={(e) => set('note', e.target.value)} placeholder="生前のことなど" />
            </div>
          </div>
        </div>
        <footer>
          <button className="btn outline" type="button" onClick={onClose} disabled={submitting}>キャンセル</button>
          <button className="btn primary purple" type="button" onClick={handleSubmit} disabled={!canSubmit}>
            {submitting ? '保存中…' : isEdit ? '保存する' : '登録する'}
          </button>
        </footer>
      </div>
    </div>
  );
}
