import type { Meta, StoryObj } from "@storybook/react";
import { Alert } from "@/components/ui/Alert";

const meta: Meta<typeof Alert> = {
  title: "UI/Alert",
  component: Alert,
  tags: ["autodocs"],
  argTypes: {
    type: {
      control: "select",
      options: ["info", "success", "warning", "error"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Info: Story = {
  args: {
    type: "info",
    children: "This is an informational message about the menu.",
  },
};

export const Success: Story = {
  args: {
    type: "success",
    children: "Order has been placed successfully!",
  },
};

export const Warning: Story = {
  args: {
    type: "warning",
    children: "This topping is currently running low in stock.",
  },
};

export const Error: Story = {
  args: {
    type: "error",
    children: "Failed to connect to the database. Please try again.",
  },
};
