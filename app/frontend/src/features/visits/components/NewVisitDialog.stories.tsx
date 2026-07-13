import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';

import { NewVisitDialog } from './NewVisitDialog';

// position:fixed のオーバーレイで全面描画するため fullscreen で表示する。
const meta = {
  title: 'features/visits/NewVisitDialog',
  component: NewVisitDialog,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  args: {
    open: true,
    onClose: fn(),
    onSave: fn(),
  },
} satisfies Meta<typeof NewVisitDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Open: Story = {};
