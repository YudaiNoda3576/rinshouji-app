import type { Meta, StoryObj } from '@storybook/react-vite';

import { TempleGlyph } from './TempleGlyph';

// 地図ラベルなどに添える小さな寺院アイコン（14px 固定・var(--temple-purple)）。
const meta = {
  title: 'features/parish-map/TempleGlyph',
  component: TempleGlyph,
  tags: ['autodocs'],
} satisfies Meta<typeof TempleGlyph>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const InlineWithText: Story = {
  render: () => (
    <span style={{ fontSize: 13, color: 'var(--fg1)' }}>
      <TempleGlyph />
      本證寺（第1区）
    </span>
  ),
};
