// 年忌案内一覧のフィルタ群（対象期間セグメント・状態セレクト・並び順セレクト）。
// デスクトップはツールバー内にインライン、SP は FilterSheet の中に描画する。

import type { NoticeGroupBy, NoticePeriod, NoticeStatusFilter } from '../types';

const PERIOD_OPTIONS: { k: NoticePeriod; l: string }[] = [
  { k: 'next3m', l: '今後3ヶ月' },
  { k: '6m', l: '今後6ヶ月' },
  { k: '1y', l: '今後1年' },
];

interface NoticeToolbarProps {
  period: NoticePeriod;
  statusFilter: NoticeStatusFilter;
  groupBy: NoticeGroupBy;
  onChangePeriod: (value: NoticePeriod) => void;
  onChangeStatus: (value: NoticeStatusFilter) => void;
  onChangeGroupBy: (value: NoticeGroupBy) => void;
}

export function NoticeToolbar({
  period,
  statusFilter,
  groupBy,
  onChangePeriod,
  onChangeStatus,
  onChangeGroupBy,
}: NoticeToolbarProps) {
  return (
    <>
      <div className="nt-group">
        <label>対象期間</label>
        <div className="seg">
          {PERIOD_OPTIONS.map((o) => (
            <button key={o.k} className={'seg-btn' + (period === o.k ? ' on' : '')} onClick={() => onChangePeriod(o.k)}>{o.l}</button>
          ))}
        </div>
      </div>
      <div className="nt-group">
        <label>状態</label>
        <select className="input-plain" style={{ height: 32 }} value={statusFilter} onChange={(e) => onChangeStatus(e.target.value as NoticeStatusFilter)}>
          <option value="all">すべて</option>
          <option value="pending">未送付</option>
          <option value="sent">送付済</option>
          <option value="confirmed">出席確認済</option>
          <option value="declined">欠席連絡</option>
        </select>
      </div>
      <div className="nt-group">
        <label>並び順</label>
        <select className="input-plain" style={{ height: 32 }} value={groupBy} onChange={(e) => onChangeGroupBy(e.target.value as NoticeGroupBy)}>
          <option value="month">月別</option>
          <option value="family">家別</option>
          <option value="status">状態別</option>
        </select>
      </div>
    </>
  );
}
