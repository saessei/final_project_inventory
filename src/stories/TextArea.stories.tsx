import type { Meta, StoryObj } from "@storybook/react";
import { TextArea } from "@/components/ui/TextArea";

const meta: Meta<typeof TextArea> = {
  title: "UI/TextArea",
  component: TextArea,
  tags: ["autodocs"],
  argTypes: {
    disabled: {
      control: "boolean",
    },
    error: {
      control: "text",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: "Notes",
    placeholder: "Add special instructions here...",
    rows: 4,
  },
};

export const WithError: Story = {
  args: {
    label: "Order Notes",
    placeholder: "Add notes",
    error: "Notes are too long",
  },
};

export const Disabled: Story = {
  args: {
    label: "Notes",
    value: "No special instructions for this order.",
    disabled: true,
  },
};
