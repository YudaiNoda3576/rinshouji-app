import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';

import { ConfirmDialog } from './ConfirmDialog';

// position:fixed のオーバーレイで全面描画するため fullscreen で表示する。
const meta = {
  title: 'components/ui/ConfirmDialog',
  component: ConfirmDialog,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  args: {
    open: true,
    onConfirm: fn(),
    onCancel: fn(),
  },
} satisfies Meta<typeof ConfirmDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: 'サインアウトしますか？',
    body: '現在のセッションを終了し、ログイン画面に戻ります。',
    confirmLabel: 'サインアウト',
  },
};

export const Danger: Story = {
  args: {
    title: 'この檀家情報を削除しますか？',
    body: '削除すると元に戻せません。関連するお参り記録も参照できなくなります。',
    confirmLabel: '削除する',
    danger: true,
  },
};
