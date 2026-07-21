// 年忌案内の統計カード（該当年忌・未送付・送付済・出席確認済。メーター付き）。
interface NoticeStatsData {
  total: number;
  pending: number;
  sent: number;
  confirmed: number;
}

interface NoticeStatsProps {
  stats: NoticeStatsData;
}

// 割合を % 幅文字列に変換する（total が 0 のときは '0'）。
function pct(value: number, total: number): string {
  return total ? `${(value / total) * 100}%` : '0';
}

export function NoticeStats({ stats }: NoticeStatsProps) {
  return (
    <div className="notice-stats">
      <div className="nstat tot">
        <div className="nstat-l">該当年忌</div>
        <div className="nstat-v">{stats.total}<span className="nstat-u">件</span></div>
      </div>
      <div className="nstat pending">
        <div className="nstat-l">未送付</div>
        <div className="nstat-v">{stats.pending}<span className="nstat-u">件</span></div>
        <div className="nstat-meter"><div className="nstat-fill pend" style={{ width: pct(stats.pending, stats.total) }}></div></div>
      </div>
      <div className="nstat sent">
        <div className="nstat-l">送付済</div>
        <div className="nstat-v">{stats.sent}<span className="nstat-u">件</span></div>
        <div className="nstat-meter"><div className="nstat-fill snt" style={{ width: pct(stats.sent, stats.total) }}></div></div>
      </div>
      <div className="nstat conf">
        <div className="nstat-l">出席確認済</div>
        <div className="nstat-v">{stats.confirmed}<span className="nstat-u">件</span></div>
        <div className="nstat-meter"><div className="nstat-fill cnf" style={{ width: pct(stats.confirmed, stats.total) }}></div></div>
      </div>
    </div>
  );
}
