import type { Meta, StoryObj } from "@storybook/react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useState } from "react";

const meta: Meta<typeof Modal> = {
  title: "UI/Modal",
  component: Modal,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
      <>
        <Button onClick={() => setIsOpen(true)}>Open Modal</Button>
        <Modal {...args} isOpen={isOpen} onClose={() => setIsOpen(false)}>
          <div className="space-y-4">
            <p className="text-slate-500">
              This is a standard modal component. It supports custom titles, 
              centering, and flexible content areas.
            </p>
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
              <Button onClick={() => setIsOpen(false)}>Confirm Action</Button>
            </div>
          </div>
        </Modal>
      </>
    );
  },
  args: {
    title: "Example Modal",
  },
};

export const Small: Story = {
  ...Default,
  args: {
    title: "Small Modal",
    size: "sm",
  },
};

export const Large: Story = {
  ...Default,
  args: {
    title: "Large Modal",
    size: "lg",
  },
};

export const NoHeader: Story = {
  render: (args) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
      <>
        <Button onClick={() => setIsOpen(true)}>Open Clean Modal</Button>
        <Modal {...args} isOpen={isOpen} onClose={() => setIsOpen(false)}>
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-black text-dark-brown mb-2">Success!</h3>
            <p className="text-slate-500 mb-6">Your action has been completed successfully.</p>
            <Button fullWidth onClick={() => setIsOpen(false)}>Great!</Button>
          </div>
        </Modal>
      </>
    );
  },
  args: {},
};
