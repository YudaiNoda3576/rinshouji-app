// ページネーション（一覧下部で使う共通 UI）。前へ/次へボタン + ページ選択セレクト。
interface PaginationProps {
  page: number;
  total: number;
  pageSize: number;
  onChange: (page: number) => void;
}

export function Pagination({ page, total, pageSize, onChange }: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  // 1ページに収まる場合はページャ自体を表示しない。
  if (totalPages <= 1) return null;

  const pageOptions = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="pagination">
      <button
        type="button"
        className="pg-btn"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
        aria-label="前のページ"
      >
        ◁
      </button>
      <select
        className="pg-select"
        value={page}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label="ページ選択"
      >
        {pageOptions.map((p) => (
          <option key={p} value={p}>{p}/{totalPages}</option>
        ))}
      </select>
      <button
        type="button"
        className="pg-btn"
        disabled={page >= totalPages}
        onClick={() => onChange(page + 1)}
        aria-label="次のページ"
      >
        ▷
      </button>
    </div>
  );
}
