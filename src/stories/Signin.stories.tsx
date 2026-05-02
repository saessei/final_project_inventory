import type { Meta, StoryObj } from "@storybook/react-vite";
import { BrowserRouter } from "react-router-dom";
import { Signin } from "@/pages/Signin";
import { AuthContext } from "@/components/auth/AuthContext";
import { userEvent, within, expect, waitFor } from "storybook/test";

interface MockProps {
  children: React.ReactNode;
  authValue: {
    session: {
      user: {
        email: string;
        id: string;
        user_metadata?: { display_name?: string };
      };
    } | null;
    loading?: boolean;
    hasAdminPin?: boolean;
    isAdmin?: boolean;
    needsAdminPin?: boolean;
    signInUser?: (
      e: string,
      p: string,
    ) => Promise<{ success: boolean; data?: unknown; error?: string }>;
    signOut?: () => Promise<void>;
    refreshSession?: () => Promise<void>;
    setNeedsAdminPin?: (value: boolean) => void;
  };
}

const MockProviders = ({ children, authValue }: MockProps) => (
  <BrowserRouter>
    <AuthContext.Provider value={authValue as unknown as never}>
      {children}
    </AuthContext.Provider>
  </BrowserRouter>
);

const meta: Meta<typeof Signin> = {
  title: "Pages/Signin",
  component: Signin,
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;
type Story = StoryObj<typeof Signin>;

const fillForm = async (canvasElement: HTMLElement) => {
  const canvas = within(canvasElement);

  const emailInput = canvas.getByPlaceholderText("Email");
  const passwordInput = canvas.getByPlaceholderText("Password");
  const submitButton = canvas.getByRole("button", { name: /sign in/i });

  await userEvent.type(emailInput, "boba.lover@example.com", { delay: 50 });
  await userEvent.type(passwordInput, "Password123!", { delay: 50 });

  await expect(emailInput).toHaveValue("boba.lover@example.com");
  await expect(passwordInput).toHaveValue("Password123!");

  return { submitButton, canvas };
};

export const Default: Story = {
  render: () => (
    <MockProviders
      authValue={{
        session: null,
        loading: false,
        isAdmin: false,
        needsAdminPin: false,
        signInUser: async () => ({ success: true, data: {} }),
        signOut: async () => {},
        refreshSession: async () => {},
        setNeedsAdminPin: () => {},
      }}
    >
      <Signin />
    </MockProviders>
  ),
  play: async ({ canvasElement }) => {
    await fillForm(canvasElement);
  },
};

export const InvalidCredentials: Story = {
  render: () => (
    <MockProviders
      authValue={{
        session: null,
        loading: false,
        isAdmin: false,
        needsAdminPin: false,
        signInUser: async () => ({
          success: false,
          error: "Invalid login credentials",
        }),
        signOut: async () => {},
        refreshSession: async () => {},
        setNeedsAdminPin: () => {},
      }}
    >
      <Signin />
    </MockProviders>
  ),
  play: async ({ canvasElement }) => {
    const { submitButton, canvas } = await fillForm(canvasElement);
    await userEvent.click(submitButton);
    await waitFor(() => {
      expect(
        canvas.getByText(/invalid login credentials/i),
      ).toBeInTheDocument();
    });
  },
};

export const PasswordToggle: Story = {
  render: () => (
    <MockProviders
      authValue={{
        session: null,
        loading: false,
        isAdmin: false,
        needsAdminPin: false,
        signInUser: async () => ({ success: true, data: {} }),
        signOut: async () => {},
        refreshSession: async () => {},
        setNeedsAdminPin: () => {},
      }}
    >
      <Signin />
    </MockProviders>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const passwordInput = canvas.getByPlaceholderText("Password");
    const toggleButton = canvas.getAllByRole("button")[0];

    await userEvent.type(passwordInput, "Secret123");
    await expect(passwordInput).toHaveAttribute("type", "password");

    await userEvent.click(toggleButton);
    await expect(passwordInput).toHaveAttribute("type", "text");

    await userEvent.click(toggleButton);
    await expect(passwordInput).toHaveAttribute("type", "password");
  },
};

export const LoadingState: Story = {
  render: () => (
    <MockProviders
      authValue={{
        session: null,
        loading: false,
        isAdmin: false,
        needsAdminPin: false,
        signInUser: () => new Promise(() => {}),
        signOut: async () => {},
        refreshSession: async () => {},
        setNeedsAdminPin: () => {},
      }}
    >
      <Signin />
    </MockProviders>
  ),
  play: async ({ canvasElement }) => {
    const { submitButton, canvas } = await fillForm(canvasElement);
    await userEvent.click(submitButton);
    await expect(canvas.getByText(/logging in\.\.\./i)).toBeInTheDocument();
    await expect(submitButton).toBeDisabled();
  },
};
