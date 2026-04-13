import type { Meta, StoryObj } from "@storybook/react";
import { BrowserRouter } from "react-router-dom";
import { Signin } from "../components/Signin";
import { AuthContext } from "../context/AuthContext";
import { userEvent, within, expect, waitFor } from "storybook/test";

const MockProviders = ({ children, authValue }: any) => (
  <BrowserRouter>
    <AuthContext.Provider value={authValue}>
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

// Reusable play function to fill out the form
const fillForm = async (canvasElement: HTMLElement) => {
  const canvas = within(canvasElement);
  
  const emailInput = canvas.getByPlaceholderText("Email");
  const passwordInput = canvas.getByPlaceholderText("Password");
  const submitButton = canvas.getByRole("button", { name: /sign in/i });

  // Simulate typing
  await userEvent.type(emailInput, "boba.lover@example.com", { delay: 50 });
  await userEvent.type(passwordInput, "Password123!", { delay: 50 });
  
  // Verify values are present
  await expect(emailInput).toHaveValue("boba.lover@example.com");
  await expect(passwordInput).toHaveValue("Password123!");

  return { submitButton, canvas };
};

export const Default: Story = {
  render: () => (
    <MockProviders authValue={{ session: null, signInUser: async () => ({ success: true }) }}>
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
        signInUser: async () => ({ success: false, error: "invalid login credentials" }) 
      }}
    >
      <Signin />
    </MockProviders>
  ),
  play: async ({ canvasElement }) => {
    const { submitButton, canvas } = await fillForm(canvasElement);
    
    // Click submit to trigger the mocked error response
    await userEvent.click(submitButton);

    // Verify error message appears
    await waitFor(() => {
      expect(canvas.getByText(/invalid email or password/i)).toBeInTheDocument();
    });
  },
};

export const PasswordToggle: Story = {
  render: () => (
    <MockProviders authValue={{ session: null, signInUser: async () => ({ success: true }) }}>
      <Signin />
    </MockProviders>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const passwordInput = canvas.getByPlaceholderText("Password");
    const toggleButton = canvas.getByRole("button", { name: "" }); // The eye icon button

    await userEvent.type(passwordInput, "Secret123");
    
    // Check initial state
    await expect(passwordInput).toHaveAttribute("type", "password");

    // Toggle to visible
    await userEvent.click(toggleButton);
    await expect(passwordInput).toHaveAttribute("type", "text");

    // Toggle back to hidden
    await userEvent.click(toggleButton);
    await expect(passwordInput).toHaveAttribute("type", "password");
  },
};

export const LoadingState: Story = {
  render: () => (
    <MockProviders 
      authValue={{ 
        session: null, 
        signInUser: () => new Promise(() => {}) 
      }}
    >
      <Signin />
    </MockProviders>
  ),
  play: async ({ canvasElement }) => {
    const { submitButton, canvas } = await fillForm(canvasElement);
    await userEvent.click(submitButton);

    // Verify button text changes to loading state
    await expect(canvas.getByText(/logging in\.\.\./i)).toBeInTheDocument();
    await expect(submitButton).toBeDisabled();
  },
};