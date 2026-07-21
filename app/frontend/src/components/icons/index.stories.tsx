import type { Meta, StoryObj } from '@storybook/react-vite';

import { BrandIcon, BuildingIcon } from './index';

// 単体の <svg> は親コンテキストの CSS（.brand-mark svg）でスタイルされる前提のため、
// アプリと同じ .brand-mark バッジでラップして表示する。
const meta = {
  title: 'components/icons',
  component: BrandIcon,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="brand-mark lg">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof BrandIcon>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Brand: Story = {};

export const Building: Story = {
  render: () => <BuildingIcon />,
};
