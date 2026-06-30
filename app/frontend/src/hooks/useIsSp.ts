import { useEffect, useState } from 'react';

// スマートフォン幅かどうかを返す（既定ブレークポイント 640px）。
export function useIsSp(breakpoint = 640): boolean {
  const [isSp, setIsSp] = useState<boolean>(() => window.innerWidth < breakpoint);
  useEffect(() => {
    const onResize = () => setIsSp(window.innerWidth < breakpoint);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [breakpoint]);
  return isSp;
}
