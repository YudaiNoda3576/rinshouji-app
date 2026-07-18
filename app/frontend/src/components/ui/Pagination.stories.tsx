import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';

import { Pagination } from './Pagination';

const meta = {
  title: 'components/ui/Pagination',
  component: Pagination,
  tags: ['autodocs'],
  args: { onChange: fn() },
} satisfies Meta<typeof Pagination>;

export default meta;
type Story = StoryObj<typeof meta>;

export const FirstPage: Story = { args: { page: 1, total: 120, pageSize: 20 } };
export const MiddlePage: Story = { args: { page: 3, total: 120, pageSize: 20 } };
export const LastPage: Story = { args: { page: 6, total: 120, pageSize: 20 } };
export const SinglePage: Story = { args: { page: 1, total: 12, pageSize: 20 } };
