// 過去帳一覧の「次の年忌」チップ表示。状態（済/月日未定/日数）で見た目を切り替える。
import type { NextAnniversary } from '../types';

interface NextChipProps {
  next: NextAnniversary | null;
}

export function NextChip({ next }: NextChipProps) {
  if (!next) {
    return <span className="next-chip pending">不明</span>;
  }
  if (next.status === 'done') {
    return <span className="next-chip done">{next.label} 済</span>;
  }
  if (next.status === 'monthDayUnknown') {
    return (
      <span className="next-chip pending">
        {next.label}
        <span className="next-d">{next.year}年度・月日未定</span>
      </span>
    );
  }
  const soon = next.daysUntil != null && next.daysUntil <= 31;
  return (
    <span className={'next-chip' + (soon ? ' soon' : '')}>
      {next.label}
      <span className="next-d">あと{next.daysUntil}日</span>
    </span>
  );
}
