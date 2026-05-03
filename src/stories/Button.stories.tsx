import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "@/components/ui/Button";
import { Coffee, ChevronRight } from "lucide-react";

const meta: Meta<typeof Button> = {
  title: "UI/Button",
  component: Button,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["solid", "outline", "ghost", "secondary"],
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
    },
    fullWidth: {
      control: "boolean",
    },
    isLoading: {
      control: "boolean",
    },
    disabled: {
      control: "boolean",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Solid: Story = {
  args: {
    variant: "solid",
    children: "Place Order",
  },
};

export const Outline: Story = {
  args: {
    variant: "outline",
    children: "Cancel",
  },
};

export const Ghost: Story = {
  args: {
    variant: "ghost",
    children: "Edit Details",
  },
};

export const WithIcon: Story = {
  args: {
    variant: "solid",
    children: "Add Toppings",
    leftIcon: <Coffee size={18} />,
  },
};

export const RightIcon: Story = {
  args: {
    variant: "outline",
    children: "Next Step",
    rightIcon: <ChevronRight size={18} />,
  },
};

export const Loading: Story = {
  args: {
    variant: "solid",
    children: "Processing...",
    isLoading: true,
  },
};

export const Small: Story = {
  args: {
    variant: "solid",
    children: "Small",
    size: "sm",
  },
};

export const Large: Story = {
  args: {
    variant: "solid",
    children: "Large Button",
    size: "lg",
  },
};

export const FullWidth: Story = {
  args: {
    variant: "solid",
    children: "Checkout Now",
    fullWidth: true,
  },
};
