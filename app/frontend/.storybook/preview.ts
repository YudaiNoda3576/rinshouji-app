import type { Preview } from '@storybook/react-vite';

// グローバル CSS は src/main.tsx と同じ読み込み順を厳守する
// （順序 = カスケード優先度。後段ほど優先）。
import '@/styles/tokens.css';
import '@/styles/styles.css';
import '@/features/notices/notices.css';
import '@/features/parish-map/parish-map.css';
import '@/features/settings/settings.css';
import '@/styles/sp.css';

const preview: Preview = {
  parameters: {
    layout: 'centered',
    controls: { matchers: { color: /(background|color)$/i, date: /Date$/ } },
    a11y: { test: 'todo' },
  },
};

export default preview;
