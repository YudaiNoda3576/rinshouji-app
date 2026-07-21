// 年忌案内の表示定数。
// （旧モックデータ NOTICE_CASES / TODAY は API 接続化に伴い削除。データは GET /api/notices から取得する）

import type { NoticeStatusInfo, NoticeStatusKey, NoticeTemplate } from './types';

// 一覧のクライアントサイドページング（1ページあたりの件数）。
export const PAGE_SIZE = 20;

export const NOTICE_STATUS: Record<NoticeStatusKey, NoticeStatusInfo> = {
  pending:   { label: '未送付', dot: '#9CA3AF', tint: 'hsl(210 11% 96%)', dark: '#4B5563' },
  sent:      { label: '送付済', dot: 'var(--temple-blue)',   tint: 'var(--temple-blue-tint)',   dark: '#1E3A8A' },
  confirmed: { label: '出席確認', dot: 'var(--temple-green)', tint: 'var(--temple-green-tint)',  dark: '#064E3B' },
  declined:  { label: '欠席連絡', dot: 'var(--temple-red)',   tint: 'var(--temple-red-tint)',    dark: '#7F1D1D' },
};

// 案内テンプレート一覧（郵送/メール系のみ）。
// TemplateSettingsDialog（設定UI）と NoticeDetail/SendNoticesDialog（PDF出力の
// templateBody 既定値）の双方から参照する単一ソース。
//
// 変数（二重波括弧 {{ }}）は backend の src/lib/pdf/variables.ts と1:1対応させること。
//   {{戸主名}} {{戒名}} {{俗名}} {{法要日}} {{年忌}} {{寺院名}} {{住職名}} {{家名}} {{住所}}
export const NOTICE_TEMPLATES: NoticeTemplate[] = [
  {
    id: 'kaiki-letter',
    name: '年忌案内 (封書)',
    body: `{{戸主名}} 様

時下ますます御清祥のこととお慶び申し上げます。

さて、来る {{法要日}} に
故 {{戒名}}（{{俗名}}）様の{{年忌}}法要を当山にて勤修いたしたく存じます。

つきましては、ご家族・ご親族の皆様にご参列いただきたく、ご案内申し上げます。

日時：{{法要日}} 午前10時30分より
場所：当山 本堂
御布施：お志
会食：法要後、本院にてお膳を用意いたします

合掌 {{寺院名}} 住職`,
  },
  {
    id: 'obon',
    name: 'お盆参拝のご案内',
    body: `{{戸主名}} 様

盛夏の候、ますます御清祥のこととお慶び申し上げます。

本年もお盆の合同法要を当山にて厳修いたします。
ご先祖様への御回向に、ぜひご家族おそろいでお参りください。

日時：8月13日〜15日 午前10時より
場所：当山 本堂

合掌 {{寺院名}} 住職`,
  },
  {
    id: 'higan',
    name: 'お彼岸参拝のご案内',
    body: `{{戸主名}} 様

彼岸の候、ますます御清祥のこととお慶び申し上げます。

お彼岸の合同法要を当山にて厳修いたします。
ご先祖様への御回向に、どうぞお参りください。

日時：彼岸の中日 午前10時より
場所：当山 本堂

合掌 {{寺院名}} 住職`,
  },
  {
    id: 'shotsuki',
    name: '月命日リマインダー',
    body: `{{戸主名}} 様

{{法要日}} は 故 {{戒名}}（{{俗名}}）様の月命日でございます。
お参りをご希望の際は、お気軽にお申し付けください。

{{寺院名}}`,
  },
];

// PDF出力（NoticeDetail の単件出力・SendNoticesDialog の一斉印刷）で使う既定テンプレート。
export const DEFAULT_NOTICE_TEMPLATE: NoticeTemplate = NOTICE_TEMPLATES[0];
