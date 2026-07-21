import * as React from 'react';

import {
  EMPTY_HOUSEHOLD_FORM,
  HANNYA_OPTIONS,
  IHAI_OPTIONS,
  RELATION_TYPES,
  SEJIKI_OPTIONS,
  level1Districts,
  level2Districts,
} from '../constants';
import type { District, HouseholdForm } from '../types';

interface NewParishDialogProps {
  open: boolean;
  initial?: HouseholdForm;
  districts: District[];
  onClose: () => void;
  onSave: (form: HouseholdForm) => Promise<void>;
  onDelete?: () => void;
}

// districtId（区分1 または 区分2 の id）から、2 段 select の初期選択を求める。
function resolveDistrictSelection(
  districtId: number | null,
  districts: District[],
): { d1: number | null; d2: number | null } {
  if (districtId == null) return { d1: null, d2: null };
  const target = districts.find(d => d.id === districtId);
  if (!target) return { d1: null, d2: null };
  if (target.level === 2) return { d1: target.parentId, d2: target.id };
  return { d1: target.id, d2: null };
}

export function NewParishDialog({
  open,
  initial,
  districts,
  onClose,
  onSave,
  onDelete,
}: NewParishDialogProps) {
  const [form, setForm] = React.useState<HouseholdForm>(initial ?? EMPTY_HOUSEHOLD_FORM);
  const [d1, setD1] = React.useState<number | null>(null);
  const [submitting, setSubmitting] = React.useState(false);
  const isEdit = Boolean(initial);

  React.useEffect(() => {
    if (!open) return;
    const base = initial ?? EMPTY_HOUSEHOLD_FORM;
    setForm(base);
    setD1(resolveDistrictSelection(base.districtId, districts).d1);
    setSubmitting(false);
  }, [open, initial, districts]);

  if (!open) return null;

  const upd = <K extends keyof HouseholdForm>(k: K, v: HouseholdForm[K]) =>
    setForm(f => ({ ...f, [k]: v }));

  const onChangeD1 = (value: string) => {
    const id = value === '' ? null : Number(value);
    setD1(id);
    // 区分1 を変えたら区分2 はリセットし、区分1 自体を暫定の districtId とする。
    upd('districtId', id);
  };
  const onChangeD2 = (value: string) => {
    const id = value === '' ? null : Number(value);
    // 区分2 未選択なら区分1 の id を保持する。
    upd('districtId', id ?? d1);
  };

  const d2Selection = resolveDistrictSelection(form.districtId, districts).d2;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    if (form.familyName.trim() === '' || form.headName.trim() === '') return;
    setSubmitting(true);
    try {
      await onSave(form);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="dialog-overlay" onClick={onClose}>
      <div className="dialog" style={{ width: 620 }} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3>{isEdit ? '檀家情報を編集' : '新規檀家登録'}</h3>
          <button className="x-btn" onClick={onClose}>
            <svg viewBox="0 0 24 24"><line x1="18" x2="6" y1="6" y2="18"/><line x1="6" x2="18" y1="6" y2="18"/></svg>
          </button>
        </header>
        <form onSubmit={submit}>
          <div className="body" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div className="form-field">
              <label>家名 <span className="req">*</span></label>
              <input className="input-plain" placeholder="例: 佐藤" value={form.familyName} onChange={(e) => upd('familyName', e.target.value)} />
            </div>
            <div className="form-field">
              <label>戸主名 <span className="req">*</span></label>
              <input className="input-plain" placeholder="例: 佐藤 一彦" value={form.headName} onChange={(e) => upd('headName', e.target.value)} />
            </div>
            <div className="form-field" style={{ gridColumn: 'span 2' }}>
              <label>フリガナ（戸主）</label>
              <input className="input-plain" placeholder="全角カナで入力（例: サトウ カズヒコ）" value={form.headKana} onChange={(e) => upd('headKana', e.target.value)} />
            </div>
            <div className="form-field">
              <label>地区（区分1）</label>
              <select className="input-plain" value={d1 ?? ''} onChange={(e) => onChangeD1(e.target.value)}>
                <option value="">未選択</option>
                {level1Districts(districts).map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
            <div className="form-field">
              <label>地区（区分2）</label>
              <select className="input-plain" value={d2Selection ?? ''} onChange={(e) => onChangeD2(e.target.value)} disabled={d1 == null}>
                <option value="">未選択</option>
                {level2Districts(districts, d1).map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
            <div className="form-field">
              <label>関係区分</label>
              <select className="input-plain" value={form.relationType} onChange={(e) => upd('relationType', e.target.value)}>
                <option value="">未選択</option>
                {RELATION_TYPES.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            {isEdit && (
              <div className="form-field">
                <label>状態</label>
                <select className="input-plain" value={form.status === 'deleted' ? 'inactive' : form.status}
                        onChange={(e) => upd('status', e.target.value as HouseholdForm['status'])}>
                  <option value="active">通常</option>
                  <option value="inactive">離檀</option>
                </select>
              </div>
            )}
            <div className="form-field">
              <label>郵便番号</label>
              <input className="input-plain" placeholder="例: 140-0004" value={form.postalCode} onChange={(e) => upd('postalCode', e.target.value)} />
            </div>
            <div className="form-field" style={{ gridColumn: isEdit ? undefined : 'span 2' }}>
              <label>住所1</label>
              <input className="input-plain" placeholder="例: 東京都品川区南品川3-12-4" value={form.address1} onChange={(e) => upd('address1', e.target.value)} />
            </div>
            <div className="form-field" style={{ gridColumn: 'span 2' }}>
              <label>住所2</label>
              <input className="input-plain" placeholder="建物名・部屋番号など" value={form.address2} onChange={(e) => upd('address2', e.target.value)} />
            </div>
            <div className="form-field">
              <label>電話</label>
              <input className="input-plain" placeholder="例: 03-3458-XXXX" value={form.phone} onChange={(e) => upd('phone', e.target.value)} />
            </div>
            <div className="form-field">
              <label>携帯電話</label>
              <input className="input-plain" placeholder="例: 090-XXXX-XXXX" value={form.mobilePhone} onChange={(e) => upd('mobilePhone', e.target.value)} />
            </div>
            <div className="form-field">
              <label>般若</label>
              <select className="input-plain" value={form.hannyaService} onChange={(e) => upd('hannyaService', e.target.value)}>
                <option value="">未選択</option>
                {HANNYA_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
            <div className="form-field">
              <label>施食</label>
              <select className="input-plain" value={form.sejikiService} onChange={(e) => upd('sejikiService', e.target.value)}>
                <option value="">未選択</option>
                {SEJIKI_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
            <div className="form-field">
              <label>棚経予定</label>
              <input className="input-plain" placeholder="例: 8月13日午前" value={form.tanagyoSchedule} onChange={(e) => upd('tanagyoSchedule', e.target.value)} />
            </div>
            <div className="form-field">
              <label>月参り日</label>
              <input className="input-plain" placeholder="例: 毎月15日" value={form.monthlyServiceDay} onChange={(e) => upd('monthlyServiceDay', e.target.value)} />
            </div>
            <div className="form-field">
              <label>位牌区分</label>
              <select className="input-plain" value={form.ihaiStatus} onChange={(e) => upd('ihaiStatus', e.target.value)}>
                <option value="">未選択</option>
                {IHAI_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
            <div className="form-field parish-check">
              <label className="check-label">
                <input type="checkbox" checked={form.jizoFlag} onChange={(e) => upd('jizoFlag', e.target.checked)} />
                地蔵
              </label>
            </div>
            <div className="form-field" style={{ gridColumn: 'span 2' }}>
              <label>備考</label>
              <textarea className="input-plain" rows={3} placeholder="家系の経緯、注意事項などをご記入ください。" value={form.note} onChange={(e) => upd('note', e.target.value)} />
            </div>
          </div>
          <footer>
            {isEdit && onDelete && (
              <button type="button" className="btn ghost danger-text" style={{ marginRight: 'auto' }} onClick={onDelete} disabled={submitting}>
                削除
              </button>
            )}
            <button type="button" className="btn outline" onClick={onClose} disabled={submitting}>キャンセル</button>
            <button type="submit" className="btn primary" disabled={submitting}>
              {submitting ? '保存中…' : isEdit ? '保存する' : '保存'}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
}
