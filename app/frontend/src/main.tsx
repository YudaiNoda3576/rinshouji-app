import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { App } from '@/app/App';

// スタイルは元の読み込み順を保持する（後段ほど優先度が高い）。
import '@/styles/tokens.css';
import '@/styles/styles.css';
import '@/features/notices/notices.css';
import '@/features/parish-map/parish-map.css';
import '@/features/settings/settings.css';
import '@/styles/sp.css';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('ルート要素 (#root) が見つかりません。');
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
