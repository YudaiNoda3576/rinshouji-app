// SP 詳細ビュー上部の戻るバー。呼び出し側が SP 判定して描画する（sticky で画面上部に固定）。
interface SpBackBarProps {
  title: string;
  onBack: () => void;
}

export function SpBackBar({ title, onBack }: SpBackBarProps) {
  return (
    <div className="sp-back-bar">
      <button className="sp-back-btn" type="button" aria-label="戻る" onClick={onBack}>
        <svg viewBox="0 0 24 24"><line x1="19" x2="5" y1="12" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>
      </button>
      <span className="sp-back-title">{title}</span>
    </div>
  );
}
