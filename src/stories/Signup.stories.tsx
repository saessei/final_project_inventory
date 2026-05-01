import type { Meta, StoryObj } from "@storybook/react-vite";
import { Signup } from "../features/Signup";
import { AuthContext } from "../auth/AuthContext";
import { BrowserRouter } from "react-router-dom";
import { userEvent, within, expect, waitFor } from "storybook/test";

interface MockProps {
  children: React.ReactNode;
  authValue: {
    session: { user: { email: string } } | null;
    signUpNewUser?: (e: string, p: string, n: string, pin?: string) => Promise<{ success: boolean; error?: string }>;
    signInUser?: (e: string, p: string) => Promise<{ success: boolean; error?: string }>;
    signOut?: () => Promise<void>;
    refreshSession?: () => Promise<void>;
  };
}

const MockProviders = ({ children, authValue }: MockProps) => (
  <BrowserRouter>
    <AuthContext.Provider value={authValue as unknown as never}>
      {children}
    </AuthContext.Provider>
  </BrowserRouter>
);

const meta: Meta<typeof Signup> = {
  title: "Pages/Signup",
  component: Signup,
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;
type Story = StoryObj<typeof Signup>;

const fillForm = async (canvasElement: HTMLElement) => {
  const canvas = within(canvasElement);
  
  const nameInput = await canvas.findByPlaceholderText("Name");
  const emailInput = canvas.getByPlaceholderText("Email");
  const passwordInput = canvas.getByPlaceholderText("Password");
  const adminPinInput = canvas.getByPlaceholderText("Enter admin PIN (4+ digits)");
  const confirmAdminPinInput = canvas.getByPlaceholderText("Confirm admin PIN");

  
  const submitButton = canvas.getByRole("button", { name: /create account/i });

  await userEvent.type(nameInput, "Cardo Dalisay", { delay: 50 });
  await userEvent.type(emailInput, "boba.lover@example.com", { delay: 50 });
  await userEvent.type(passwordInput, "Password123!", { delay: 50 });
  await userEvent.type(adminPinInput, "1234", {delay: 50});
  await userEvent.type(confirmAdminPinInput, "1234", {delay: 50});
  
  await expect(nameInput).toHaveValue("Cardo Dalisay");
  await expect(emailInput).toHaveValue("boba.lover@example.com");
  await expect(passwordInput).toHaveValue("Password123!");
  await expect(adminPinInput).toHaveValue("1234");
  await expect(confirmAdminPinInput).toHaveValue("1234");
  

  return { submitButton, canvas, passwordInput };
};

export const Default: Story = {
  render: () => (
    <MockProviders authValue={{ session: null, signUpNewUser: async () => ({ success: true }) }}>
      <Signup />
    </MockProviders>
  ),
  play: async ({ canvasElement }) => {
    await fillForm(canvasElement);
  },
};

export const LoadingState: Story = {
  render: () => (
    <MockProviders 
      authValue={{ 
        session: null, 
        signUpNewUser: () => new Promise((resolve) => setTimeout(resolve, 5000)) 
      }}
    >
      <Signup />
    </MockProviders>
  ),
  play: async ({ canvasElement }) => {
    const { submitButton, canvas } = await fillForm(canvasElement);
    await userEvent.click(submitButton);

    await waitFor(() => {
        expect(canvas.getByText(/creating/i)).toBeInTheDocument();
    });
    await expect(submitButton).toBeDisabled();
  },
};

export const ErrorState: Story = {
  render: () => (
    <MockProviders 
      authValue={{ 
        session: null, 
        signUpNewUser: async () => ({ success: false, error: "User already exists" }) 
      }}
    >
      <Signup />
    </MockProviders>
  ),
  play: async ({ canvasElement }) => {
    const { submitButton, canvas } = await fillForm(canvasElement);
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(canvas.getByText(/user already exists/i)).toBeInTheDocument();
    });
  },
};

export const TogglePasswordVisibility: Story = {
  render: () => (
    <MockProviders 
      authValue={{ 
        session: null, 
        signUpNewUser: async () => ({ success: true }) 
      }}
    >
      <Signup />
    </MockProviders>
  ),
  play: async ({ canvasElement }) => {
    const { canvas, passwordInput } = await fillForm(canvasElement);
    const toggleButton = canvas.getAllByRole("button")[0]; 

    await expect(passwordInput).toHaveAttribute("type", "password");

    await userEvent.click(toggleButton, {delay: 50});
    await expect(passwordInput).toHaveAttribute("type", "text");

    await userEvent.click(toggleButton, {delay: 50});
    await expect(passwordInput).toHaveAttribute("type", "password");
    
  },
};