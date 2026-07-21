import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';

import { ChipGroup } from './ChipGroup';

const meta = {
  title: 'components/ui/ChipGroup',
  component: ChipGroup,
  tags: ['autodocs'],
  args: { onChange: fn() },
} satisfies Meta<typeof ChipGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: '種別',
    value: 'all',
    options: [
      { key: 'all', label: 'すべて' },
      { key: 'monthly', label: '月命日' },
      { key: 'memorial', label: '年忌法要' },
      { key: 'obon', label: 'お盆' },
    ],
  },
};
