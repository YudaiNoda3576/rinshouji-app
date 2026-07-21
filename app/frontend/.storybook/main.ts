import type { StorybookConfig } from '@storybook/react-vite';

// Storybook の設定。
// stories は bulletproof-react の co-location 方針に従い src 配下を再帰的に拾う。
// @ エイリアス（-> ./src）は @storybook/react-vite が直下の vite.config.ts を
// 自動ロード&マージするため、viteFinal なしで継承される。
const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(ts|tsx)'],
  addons: ['@storybook/addon-a11y', '@storybook/addon-docs'],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  typescript: {
    reactDocgen: 'react-docgen',
  },
};

export default config;
