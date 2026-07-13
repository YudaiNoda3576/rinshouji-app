import type { Meta, StoryObj } from '@storybook/react-vite';

import { Field } from './Field';

const meta = {
  title: 'features/settings/Field',
  component: Field,
  tags: ['autodocs'],
} satisfies Meta<typeof Field>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: '寺院名',
    children: <input className="input-plain" defaultValue="本證寺" />,
  },
};

export const WithHint: Story = {
  args: {
    label: '代表者メール',
    hint: '通知の送信元になります',
    children: <input className="input-plain" type="email" defaultValue="info@example.temple" />,
  },
};

export const Wide: Story = {
  args: {
    label: '住所',
    span: 2,
    children: <input className="input-plain" defaultValue="愛知県安城市野寺町野寺26" />,
  },
};
