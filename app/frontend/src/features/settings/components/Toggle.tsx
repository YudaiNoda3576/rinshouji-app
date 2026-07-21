interface ToggleProps {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
  desc?: string;
}

export function Toggle({ checked, onChange, label, desc }: ToggleProps) {
  return (
    <div className="toggle-row">
      <div className="toggle-text">
        <div className="toggle-l">{label}</div>
        {desc && <div className="toggle-d">{desc}</div>}
      </div>
      <button className={'toggle' + (checked ? ' on' : '')} onClick={() => onChange(!checked)} role="switch" aria-checked={checked}>
        <span className="toggle-knob"></span>
      </button>
    </div>
  );
}
