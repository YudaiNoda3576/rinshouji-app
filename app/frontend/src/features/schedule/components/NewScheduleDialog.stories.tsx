import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';

import { NewScheduleDialog } from './NewScheduleDialog';

// 種別は useEventKinds（window 上の共有ストア）から読むため provider 不要で描画できる。
const meta = {
  title: 'features/schedule/NewScheduleDialog',
  component: NewScheduleDialog,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  args: {
    open: true,
    onClose: fn(),
    onSave: fn(),
    onOpenSettings: fn(),
  },
} satisfies Meta<typeof NewScheduleDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const New: Story = {
  args: { mode: 'new' },
};

export const Edit: Story = {
  args: {
    mode: 'edit',
    initial: {
      id: 'E-1001',
      date: '2026-05-12',
      time: '10:30',
      dur: 60,
      kind: 'memorial',
      title: '佐藤家 七回忌',
      family: '佐藤家',
      loc: '本堂',
      priest: '住職',
      attendees: 6,
      notes: 'ご親族6名でご来寺予定。',
    },
  },
};
