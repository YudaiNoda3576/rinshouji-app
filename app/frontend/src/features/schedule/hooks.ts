// イベント種別ストア（schedule + settings でページをまたいで共有）。
// window 上に同一インスタンスを置き、settings からも読み書きできるようにする。

import * as React from 'react';
import { DEFAULT_EVENT_KINDS } from './constants';
import { deriveKind } from './utils';
import type { DerivedEventKind, EventKind } from './types';

declare global {
  interface Window {
    __eventKinds?: DerivedEventKind[];
    getEventKinds?: () => DerivedEventKind[];
    setEventKinds?: (arr: EventKind[]) => void;
    useEventKinds?: () => DerivedEventKind[];
  }
}

if (!window.__eventKinds) window.__eventKinds = DEFAULT_EVENT_KINDS.map(deriveKind);

window.getEventKinds = (): DerivedEventKind[] =>
  window.__eventKinds ?? DEFAULT_EVENT_KINDS.map(deriveKind);

window.setEventKinds = (arr: EventKind[]): void => {
  window.__eventKinds = arr.map(deriveKind);
  window.dispatchEvent(new CustomEvent('event-kinds-changed'));
};

export function useEventKinds(): DerivedEventKind[] {
  const [kinds, setKinds] = React.useState<DerivedEventKind[]>(
    () => window.__eventKinds ?? DEFAULT_EVENT_KINDS.map(deriveKind),
  );
  React.useEffect(() => {
    const h = () => setKinds([...(window.__eventKinds ?? [])]);
    window.addEventListener('event-kinds-changed', h);
    return () => window.removeEventListener('event-kinds-changed', h);
  }, []);
  return kinds;
}

window.useEventKinds = useEventKinds;
