// parishioners（檀家管理）ドメインの型。API 契約（GET/POST/PUT/DELETE /api/households, /api/districts）に対応する。

export type HouseholdStatus = 'active' | 'inactive' | 'deleted';
export type RelationType = '檀家' | '信徒' | '檀徒' | '他寺' | 'その他';
export type MemberRole = 'head' | 'former_head' | 'family';
export type UnitType = '区画' | '一時' | '合葬';

// 地区マスタ（区分1→区分2 の自己参照階層）。GET /api/districts。
export interface District {
  id: number;
  name: string;
  level: 1 | 2;
  parentId: number | null;
}

// 一覧行。GET /api/households（deleted は返らない）。
export interface HouseholdRow {
  id: number;
  familyName: string | null;
  headName: string | null;
  headKana: string | null;
  district1: string | null;
  district2: string | null;
  relationType: RelationType | null;
  phone: string | null;
  mobilePhone: string | null;
  status: HouseholdStatus;
  deceasedCount: number;
}

// 家族構成の1名分（household_members）。
export interface Member {
  id: number;
  memberRole: MemberRole;
  name: string | null;
  nameKana: string | null;
  successionOrder: number | null;
  note: string | null;
}

// 墓地区画（cemetery_plots）。
export interface CemeteryPlot {
  id: number;
  plotCode: string | null;
  widthCm: number | null;
  fee: number | null;
  paidOn: string | null;
  paidOnRaw: string | null;
  note: string | null;
}

// 納骨堂区画（columbarium_units）。
export interface ColumbariumUnit {
  id: number;
  unitCode: string | null;
  unitType: UnitType | null;
  ihaiName: string | null;
  note: string | null;
}

// この世帯の過去帳（deceased_persons のうち詳細表示に使う項目）。
export interface DeceasedRow {
  id: number;
  kaimyo: string | null;
  secularName: string | null;
  deathYear: number | null;
  deathMonth: number | null;
  deathDay: number | null;
  deathDate: string | null;
}

// 詳細の世帯本体（households の全業務カラム + 解決済み地区名）。
export interface HouseholdCore {
  id: number;
  familyName: string | null;
  districtId: number | null;
  district1: string | null;
  district2: string | null;
  relationType: RelationType | null;
  status: HouseholdStatus;
  postalCode: string | null;
  address1: string | null;
  address2: string | null;
  phone: string | null;
  mobilePhone: string | null;
  hannyaService: string | null;
  sejikiService: string | null;
  tanagyoSchedule: string | null;
  monthlyServiceDay: string | null;
  jizoFlag: boolean;
  ihaiStatus: string | null;
  note: string | null;
}

// 詳細。GET /api/households/:id。
export interface HouseholdDetail {
  household: HouseholdCore;
  members: Member[];
  cemeteryPlots: CemeteryPlot[];
  columbariumUnits: ColumbariumUnit[];
  deceased: DeceasedRow[];
}

// 新規登録・編集モーダルのフォーム値。
export interface HouseholdForm {
  familyName: string;
  headName: string;
  headKana: string;
  districtId: number | null;
  relationType: string;
  status: HouseholdStatus;
  postalCode: string;
  address1: string;
  address2: string;
  phone: string;
  mobilePhone: string;
  hannyaService: string;
  sejikiService: string;
  tanagyoSchedule: string;
  monthlyServiceDay: string;
  jizoFlag: boolean;
  ihaiStatus: string;
  note: string;
}

// 一覧のソートキー（サーバへ渡す値）。
export type HouseholdSort = 'name' | 'district' | 'deceased';
