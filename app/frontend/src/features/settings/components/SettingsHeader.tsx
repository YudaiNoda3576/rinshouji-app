interface SettingsHeaderProps {
  title: string;
  desc: string;
}

export function SettingsHeader({ title, desc }: SettingsHeaderProps) {
  return (
    <header className="sc-head">
      <h2>{title}</h2>
      <p>{desc}</p>
    </header>
  );
}
