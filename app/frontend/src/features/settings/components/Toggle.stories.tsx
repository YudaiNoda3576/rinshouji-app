import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';

import { Toggle } from './Toggle';

const meta = {
  title: 'features/settings/Toggle',
  component: Toggle,
  tags: ['autodocs'],
  args: { onChange: fn() },
} satisfies Meta<typeof Toggle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const On: Story = {
  args: { checked: true, label: '通知を受け取る', desc: '新着のお知らせをプッシュ通知でお届けします。' },
};

export const Off: Story = {
  args: { checked: false, label: '通知を受け取る', desc: '新着のお知らせをプッシュ通知でお届けします。' },
};

export const WithoutDesc: Story = {
  args: { checked: true, label: '自動バックアップ' },
};
