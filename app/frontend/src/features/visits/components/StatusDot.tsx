import type { VisitStatus } from '../types';

interface StatusDotProps {
  status: VisitStatus;
}

export function StatusDot({ status }: StatusDotProps) {
  return <span className={'status-dot status-' + status.color}><i />{status.label}</span>;
}
