import type { Meta, StoryObj } from '@storybook/react';
import { Sidebar } from '../components//common/Sidebar';
import { withRouter } from 'storybook-addon-remix-react-router';
import { AuthContext }  from '../context/AuthContext';

const meta: Meta<typeof Sidebar> = {
  title: 'Components/Navigation/Sidebar',
  component: Sidebar,
  decorators: [
    withRouter,
    (Story) => (
      <AuthContext.Provider value={{
        session: { 
          user: { email: 'tea.lover@example.com' } 
        } as any,
        signOut: async () => console.log("Signed out!"),
        signUpNewUser: async () => ({ success: false }),
        signInUser: async () => ({ success: false }),
        refreshSession: async () => console.log("Session refreshed!"),
      }}>
        <div className="flex h-screen bg-cream">
          <Story />
        </div>
      </AuthContext.Provider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Sidebar>;

export const Expanded: Story = {};

export const Collapsed: Story = {
  play: async ({ canvasElement }) => {
    const mainContent = canvasElement.querySelector('main');
    if (mainContent) {
      mainContent.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    }
  },
  decorators: [
    (Story) => (
      <AuthContext.Provider value={{
        session: { 
          user: { email: 'tea.lover@example.com' } 
        } as any,
        signOut: async () => console.log("Signed out!"),
        signUpNewUser: async () => ({ success: false }),
        signInUser: async () => ({ success: false }),
        refreshSession: async () => console.log("Session refreshed!"),
      }}>
        <div className="flex h-screen bg-cream">
          <Story />
        </div>
      </AuthContext.Provider>
    ),
  ],
};