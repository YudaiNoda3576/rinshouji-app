// parishioners（檀家管理）の選択肢・整形ヘルパー。

import type { PillColor } from '@/components/ui/Pill';

import type { CemeteryPlot, DeceasedRow, District, HouseholdForm } from './types';

// households の enum に対応する選択肢（テーブル定義書の CHECK 制約準拠）。
export const RELATION_TYPES = ['檀家', '信徒', '檀徒', '他寺', 'その他'] as const;
export const HANNYA_OPTIONS = ['組', '郵送', 'なし'] as const;
export const SEJIKI_OPTIONS = ['組', '郵送', 'なし', '不要'] as const;
export const IHAI_OPTIONS = ['あり', 'なし'] as const;

// フォームの初期値（新規登録）。
export const EMPTY_HOUSEHOLD_FORM: HouseholdForm = {
  familyName: '',
  headName: '',
  headKana: '',
  districtId: null,
  relationType: '',
  status: 'active',
  postalCode: '',
  address1: '',
  address2: '',
  phone: '',
  mobilePhone: '',
  hannyaService: '',
  sejikiService: '',
  tanagyoSchedule: '',
  monthlyServiceDay: '',
  jizoFlag: false,
  ihaiStatus: '',
  note: '',
};

// 家名表示（末尾に「家」を付与。未設定は「(家名未設定)」）。
export const formatFamilyName = (name: string | null): string =>
  name && name.trim() !== '' ? `${name}家` : '(家名未設定)';

// 戸主名表示（未設定は「(戸主未設定)」）。
export const formatHeadName = (name: string | null): string =>
  name && name.trim() !== '' ? name : '(戸主未設定)';

// 地区表示（「区分1 / 区分2」。両方欠落は「地区未設定」）。
export const formatDistrict = (d1: string | null, d2: string | null): string => {
  if (d1 && d2) return `${d1} / ${d2}`;
  if (d1) return d1;
  if (d2) return d2;
  return '地区未設定';
};

// 電話表示（固定電話優先。どちらも欠落は「—」）。
export const formatPhone = (phone: string | null, mobile: string | null): string =>
  phone && phone.trim() !== '' ? phone : mobile && mobile.trim() !== '' ? mobile : '—';

// 関係区分バッジの配色。
export const relationPillColor = (rel: string | null): PillColor => {
  switch (rel) {
    case '檀家':
      return 'blue';
    case '信徒':
      return 'green';
    case '檀徒':
      return 'purple';
    default:
      return 'gray';
  }
};

// 過去帳の没年月日表示（画面項目定義 §4.2 の不完全日付規則を簡略適用）。
export const formatDeathDate = (d: DeceasedRow): string => {
  if (d.deathYear == null) return '不詳';
  if (d.deathMonth == null) return `${d.deathYear}年（月日不詳）`;
  if (d.deathDay == null) return `${d.deathYear}年${d.deathMonth}月（日不詳）`;
  return `${d.deathYear}年${d.deathMonth}月${d.deathDay}日`;
};

// 墓地区画の幅表示（cm）。
export const formatWidth = (w: number | null): string => (w == null ? '—' : `${w}cm`);

// 墓地代表示（円区切り）。
export const formatFee = (fee: number | null): string =>
  fee == null ? '—' : `${fee.toLocaleString('ja-JP')}円`;

// 入金日表示（完全な日付が無ければ原文フォールバック）。
export const formatPaidOn = (plot: CemeteryPlot): string =>
  plot.paidOn ?? plot.paidOnRaw ?? '—';

// 〒住所の整形（郵便番号 + 住所1 / 住所2）。
export const formatPostal = (postalCode: string | null): string =>
  postalCode && postalCode.trim() !== '' ? `〒${postalCode}` : '';

// districts から区分1（level=1）の一覧を返す。
export const level1Districts = (districts: District[]): District[] =>
  districts.filter(d => d.level === 1);

// districts から指定した区分1 に属する区分2（level=2）の一覧を返す。
export const level2Districts = (districts: District[], parentId: number | null): District[] =>
  parentId == null ? [] : districts.filter(d => d.level === 2 && d.parentId === parentId);
