import type * as React from 'react';

interface FieldProps {
  label: string;
  hint?: string;
  children: React.ReactNode;
  span?: number;
}

export function Field({ label, hint, children, span }: FieldProps) {
  return (
    <div className={'field-row' + (span === 2 ? ' wide' : '')}>
      <label className="field-label">{label}{hint && <span className="field-hint">{hint}</span>}</label>
      <div className="field-control">{children}</div>
    </div>
  );
}
