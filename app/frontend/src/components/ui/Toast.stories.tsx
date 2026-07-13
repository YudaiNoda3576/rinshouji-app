import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';

import type { Toast } from '@/types/toast';

import { ToastStack } from './Toast';

const SAMPLE: Toast[] = [
  { id: 't-success', kind: 'success', title: '保存しました', desc: 'お参りの記録を登録しました。' },
  { id: 't-error', kind: 'error', title: '送信に失敗しました', desc: 'ネットワークをご確認ください。' },
  { id: 't-info', kind: 'info', title: 'お知らせ', desc: '次回のメンテナンスは5月20日です。' },
];

const meta = {
  title: 'components/ui/ToastStack',
  component: ToastStack,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  args: {
    items: SAMPLE,
    onDismiss: fn(),
  },
} satisfies Meta<typeof ToastStack>;

export default meta;
type Story = StoryObj<typeof meta>;

export const AllKinds: Story = {};

export const Success: Story = {
  args: { items: [{ id: 't1', kind: 'success', title: '保存しました', desc: '正常に処理されました。' }] },
};

export const ErrorOnly: Story = {
  args: { items: [{ id: 't1', kind: 'error', title: 'エラーが発生しました' }] },
};
