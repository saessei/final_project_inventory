import type { Meta, StoryObj } from "@storybook/react";
import { TextField } from "@/components/ui/TextField";
import { Search, User, Mail, Lock } from "lucide-react";

const meta: Meta<typeof TextField> = {
  title: "UI/TextField",
  component: TextField,
  tags: ["autodocs"],
  argTypes: {
    type: {
      control: "select",
      options: ["text", "password", "email", "number"],
    },
    disabled: {
      control: "boolean",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: "Username",
    placeholder: "Enter your username",
  },
};

export const WithIcon: Story = {
  args: {
    label: "Search",
    placeholder: "Search for drinks...",
    leftIcon: <Search size={18} className="text-slate-400" />,
  },
};

export const UserField: Story = {
  args: {
    label: "Full Name",
    placeholder: "John Doe",
    leftIcon: <User size={18} className="text-slate-400" />,
  },
};

export const Password: Story = {
  args: {
    label: "Password",
    type: "password",
    placeholder: "••••••••",
    leftIcon: <Lock size={18} className="text-slate-400" />,
  },
};

export const Email: Story = {
  args: {
    label: "Email Address",
    type: "email",
    placeholder: "hello@queuetea.com",
    leftIcon: <Mail size={18} className="text-slate-400" />,
  },
};

export const WithError: Story = {
  args: {
    label: "Customer Name",
    placeholder: "Enter name",
    value: "123",
    error: "Name should only contain letters",
  },
};

export const Disabled: Story = {
  args: {
    label: "Fixed Field",
    value: "Staff Member",
    disabled: true,
  },
};
