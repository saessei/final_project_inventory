import type { Meta, StoryObj } from "@storybook/react-vite";
import { Sidebar } from "@/components/ui/Sidebar";
import { AuthContext } from "@/components/auth/AuthContext";
import { BrowserRouter } from "react-router-dom";
import { DashboardModeProvider } from "@/components/contexts/DashboardModeContext";
// import { userEvent } from 'storybook/test';

const meta: Meta<typeof Sidebar> = {
  title: "Components/Sidebar",
  component: Sidebar,
  parameters: {
    layout: "fullscreen",
  },
  decorators: [
    (Story) => (
      <BrowserRouter>
        <DashboardModeProvider>
          <AuthContext.Provider
            value={
              {
                session: {
                  user: { email: "tea.lover@example.com" },
                } as Record<string, unknown>,
                loading: false,
                hasAdminPin: true,
                signOut: async () => console.log("Signed out!"),
                signInUser: async () => ({ success: false }),
                refreshSession: async () => console.log("Session refreshed!"),
              } as unknown as never
            }
          >
            <div className="flex h-screen w-full bg-cream overflow-hidden">
              <Story />
              <div className="flex-1 p-8">
                <h1 className="text-2xl font-fredoka text-dark-brown">Main Content Area</h1>
                <p className="text-slate-500 mt-2">The sidebar should be pinned to the left.</p>
              </div>
            </div>
          </AuthContext.Provider>
        </DashboardModeProvider>
      </BrowserRouter>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Sidebar>;

export const Expanded: Story = {};
