import type { Meta, StoryObj } from "@storybook/react-vite";
import { BobaFooter } from "@/components/ui/BobaFooter";

const meta: Meta<typeof BobaFooter> = {
  title: "Components/BobaFooter",
  component: BobaFooter,
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;
type Story = StoryObj<typeof BobaFooter>;

export const Default: Story = {};

export const PageLayout: Story = {
  render: () => (
    <div className="min-h-screen flex flex-col bg-cream">
      <main className="flex-1 flex items-center justify-center">
        <p className="text-gray-500">Page Content</p>
      </main>
      <BobaFooter />
    </div>
  ),
};

export const Mobile: Story = {
  parameters: {
    viewport: {
      defaultViewport: "mobile1",
    },
  },
};

export const NarrowContainer: Story = {
  render: () => (
    <div className="max-w-sm mx-auto border">
      <BobaFooter />
    </div>
  ),
};
