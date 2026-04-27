import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { OrderStatusButton } from '../components/common/OrderStatusButton';

const meta = {
  title: 'Components/OrderStatusButton',
  component: OrderStatusButton,
  parameters: {
    layout: 'centered',
  },
  args: { onClick: fn() },
  argTypes: {
    status: {
      control: 'select',
      options: ['pending', 'preparing', 'completed'],
    },
  },
} satisfies Meta<typeof OrderStatusButton>;

export default meta;
type Story = StoryObj<typeof meta>;

// Pending State
export const Pending: Story = {
  args: {
    status: 'pending',
  },
};

// Preparing State
export const Preparing: Story = {
  args: {
    status: 'preparing',
  },
};

// Completed State
export const Completed: Story = {
  args: {
    status: 'completed',
  },
};
