import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';

import { LoginForm } from './LoginForm';

// 認証はフロント内のデモ資格情報（tera-admin / temple2024）で完結する。
const meta = {
  title: 'features/auth/LoginForm',
  component: LoginForm,
  tags: ['autodocs'],
  args: { onSubmit: fn() },
  decorators: [
    (Story) => (
      <div style={{ width: 380, maxWidth: '92vw' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof LoginForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
