// セグメント切替用のチップ群（全 feature 共通）。
export interface ChipOption {
  key: string;
  label: string;
}

interface ChipGroupProps {
  label: string;
  value: string;
  options: ChipOption[];
  onChange: (value: string) => void;
}

export function ChipGroup({ label, value, options, onChange }: ChipGroupProps) {
  return (
    <div className="chip-group">
      <span className="cg-label">{label}</span>
      <div className="cg-track">
        {options.map(o => (
          <button key={o.key}
                  className={'cg-btn' + (o.key === value ? ' on' : '')}
                  onClick={() => onChange(o.key)}>{o.label}</button>
        ))}
      </div>
    </div>
  );
}
