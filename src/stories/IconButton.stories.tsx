import type { Meta, StoryObj } from "@storybook/react-vite";
import { IconButton } from "@/components/ui/IconButton";
import { Plus, Edit2, Trash, RefreshCw, X } from "lucide-react";

const meta: Meta<typeof IconButton> = {
  title: "UI/IconButton",
  component: IconButton,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["solid", "outline", "ghost", "danger"],
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Add: Story = {
  args: {
    label: "Add item",
    children: <Plus size={20} />,
  },
};

export const Edit: Story = {
  args: {
    label: "Edit item",
    variant: "outline",
    children: <Edit2 size={18} />,
  },
};

export const Delete: Story = {
  args: {
    label: "Delete item",
    variant: "ghost",
    className: "text-rose-500 hover:text-rose-600 hover:bg-rose-50",
    children: <Trash size={18} />,
  },
};

export const Refresh: Story = {
  args: {
    label: "Refresh data",
    variant: "ghost",
    children: <RefreshCw size={18} />,
  },
};

export const Close: Story = {
  args: {
    label: "Close modal",
    variant: "ghost",
    size: "sm",
    children: <X size={16} />,
  },
};
