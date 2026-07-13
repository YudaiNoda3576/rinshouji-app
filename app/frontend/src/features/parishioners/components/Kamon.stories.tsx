import type { Meta, StoryObj } from '@storybook/react-vite';

import { Kamon } from './Kamon';

// idx で 10 種の家紋を手続き的に描画する（idx % 10）。
const meta = {
  title: 'features/parishioners/Kamon',
  component: Kamon,
  tags: ['autodocs'],
  argTypes: {
    idx: { control: { type: 'number', min: 0, max: 9 } },
    size: { control: { type: 'number', min: 16, max: 96 } },
  },
} satisfies Meta<typeof Kamon>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { idx: 0, size: 48 },
};

export const Accented: Story = {
  args: { idx: 2, size: 48, accent: 'var(--temple-purple)' },
};

// 全 10 種を一覧表示するギャラリー（idx は必須 prop のためダミーを渡す）。
export const AllCrests: Story = {
  args: { idx: 0 },
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
      {Array.from({ length: 10 }, (_, i) => (
        <div key={i} style={{ display: 'grid', placeItems: 'center', gap: 4, width: 64 }}>
          <Kamon idx={i} size={40} />
          <span style={{ fontSize: 11, color: 'var(--fg2)' }}>idx {i}</span>
        </div>
      ))}
    </div>
  ),
};
