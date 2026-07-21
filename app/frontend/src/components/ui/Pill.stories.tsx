import type { Meta, StoryObj } from '@storybook/react-vite';

import { Pill } from './Pill';

// color は PillColor = 'blue' | 'purple' | 'green' | 'gray'。
const meta = {
  title: 'components/ui/Pill',
  component: Pill,
  tags: ['autodocs'],
  argTypes: {
    color: { control: 'select', options: ['blue', 'purple', 'green', 'gray'] },
  },
} satisfies Meta<typeof Pill>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Blue: Story = { args: { color: 'blue', children: '月命日' } };
export const Purple: Story = { args: { color: 'purple', children: '年忌法要' } };
export const Green: Story = { args: { color: 'green', children: 'お盆' } };
export const Gray: Story = { args: { color: 'gray', children: '一般参拝' } };
