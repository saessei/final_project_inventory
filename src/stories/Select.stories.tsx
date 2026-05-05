import type { Meta, StoryObj } from "@storybook/react-vite";
import { Select } from "@/components/ui/Select";
import { Coffee, Tag, CreditCard, Wallet, Banknote } from "lucide-react";

const meta: Meta<typeof Select> = {
  title: "UI/Select",
  component: Select,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

const options = [
  { value: "milk-tea", label: "Milk Tea", icon: <Coffee size={16} /> },
  { value: "fruit-tea", label: "Fruit Tea", icon: <Tag size={16} /> },
  { value: "smoothie", label: "Smoothie" },
];

export const Default: Story = {
  args: {
    label: "Category",
    value: "milk-tea",
    options: options,
  },
};

export const PaymentMethod: Story = {
  args: {
    label: "Payment Method",
    value: "cash",
    options: [
      { value: "cash", label: "Cash", icon: <Banknote size={16} /> },
      { value: "gcash", label: "GCash", icon: <Wallet size={16} /> },
      { value: "card", label: "Card", icon: <CreditCard size={16} /> },
    ],
  },
};

export const WithoutLabel: Story = {
  args: {
    value: "milk-tea",
    options: options,
  },
};

export const CustomPlaceholder: Story = {
  args: {
    label: "Availability",
    placeholder: "Select status...",
    options: [
      { value: "available", label: "Available" },
      { value: "unavailable", label: "Unavailable" },
    ],
  },
};
