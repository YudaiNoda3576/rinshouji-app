import type { Meta, StoryObj } from '@storybook/react-vite';

import { StatusDot } from './StatusDot';

// status は VisitStatus = { key, label, color }（features/visits/constants.ts の STATUS 参照）。
const meta = {
  title: 'features/visits/StatusDot',
  component: StatusDot,
  tags: ['autodocs'],
} satisfies Meta<typeof StatusDot>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Done: Story = {
  args: { status: { key: 'done', label: '完了', color: 'green' } },
};

export const Scheduled: Story = {
  args: { status: { key: 'scheduled', label: '予定', color: 'blue' } },
};

export const Cancelled: Story = {
  args: { status: { key: 'cancelled', label: '中止', color: 'gray' } },
};
