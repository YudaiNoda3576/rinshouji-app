import type { CSSProperties } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { MotifAsanoha, MotifLotus, MotifSeigaiha } from './motifs';

// .motif は position:absolute; inset:0; opacity:.055 のタイル装飾。
// カタログでは相対配置の枠で囲い、視認用に不透明度を上げて表示する。
const FRAME: CSSProperties = {
  position: 'relative',
  width: 280,
  height: 200,
  borderRadius: 12,
  overflow: 'hidden',
  border: '1px solid var(--border-default, #e5e7eb)',
  background: '#fff',
};

const VISIBLE: CSSProperties = { opacity: 0.5 };

const meta = {
  title: 'components/Motifs',
  component: MotifLotus,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={FRAME}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof MotifLotus>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Lotus: Story = {
  args: { style: VISIBLE },
};

export const Seigaiha: Story = {
  render: () => <MotifSeigaiha style={VISIBLE} />,
};

export const Asanoha: Story = {
  render: () => <MotifAsanoha style={VISIBLE} />,
};
