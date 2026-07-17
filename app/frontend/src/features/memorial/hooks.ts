// 過去帳（memorial register）向けの小さな共有フック。

import * as React from 'react';

// 値の変更を指定ミリ秒だけ遅延して反映する（検索入力のデバウンス用）。
export function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = React.useState(value);
  React.useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);
  return debounced;
}
