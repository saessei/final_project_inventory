import type { Meta, StoryObj } from '@storybook/react-vite';
import { Sidebar } from '../components//common/Sidebar';
import { AuthContext } from '../auth/AuthContext';
import { BrowserRouter } from 'react-router-dom';
import { userEvent } from 'storybook/test';

const meta: Meta<typeof Sidebar> = {
  title: 'Components/Sidebar',
  component: Sidebar,
  decorators: [
    (Story) => (
      <BrowserRouter>
      <AuthContext.Provider
        value={{
          session: {
            user: { email: "tea.lover@example.com" },
          } as Record<string, unknown>,
          signOut: async () => console.log("Signed out!"),
          signUpNewUser: async () => ({ success: false }),
          signInUser: async () => ({ success: false }),
          refreshSession: async () => console.log("Session refreshed!"),
        } as unknown as never} 
      >
        <div className="flex h-screen bg-cream">
          <Story />
        </div>
      </AuthContext.Provider>
      </BrowserRouter>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Sidebar>;

export const Expanded: Story = {};

export const Collapsed: Story = {
  play: async ({ canvasElement }) => {
    const mainContent = canvasElement.parentElement;
    if (mainContent) {
      await userEvent.click(mainContent);
    }
  },
  decorators: [
    (Story) => (
      <AuthContext.Provider
        value={{
          session: {
            user: { email: "tea.lover@example.com" },
          } as Record<string, unknown>, 
          signOut: async () => console.log("Signed out!"),
          signUpNewUser: async () => ({ success: false }),
          signInUser: async () => ({ success: false }),
          refreshSession: async () => console.log("Session refreshed!"),
        } as unknown as never} 
      >
        <div className="flex h-screen bg-cream">
          <Story />
        </div>
      </AuthContext.Provider>
    ),
  ],
};
