import { Meta, StoryObj } from "@storybook/react";
import { Signup } from "../components/Signup";
import { AuthContext } from "../context/AuthContext";
import { BrowserRouter } from "react-router-dom";
import { userEvent, within, expect, waitFor } from "storybook/test";

const MockProviders = ({ children, authValue }: any) => (
  <BrowserRouter>
    <AuthContext.Provider value={authValue}>
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

// reusable function to fill out the form
const fillForm = async (canvasElement: HTMLElement) => {
  const canvas = within(canvasElement);
  
  const nameInput = canvas.getByPlaceholderText("Name");
  const emailInput = canvas.getByPlaceholderText("Email");
  const passwordInput = canvas.getByPlaceholderText("Password");
  const submitButton = canvas.getByRole("button", { name: /sign up/i });

  // Simulate typing
  await userEvent.type(nameInput, "Cardo Dalisay", { delay: 50 });
  await userEvent.type(emailInput, "boba.lover@example.com", { delay: 50 });
  await userEvent.type(passwordInput, "Password123!", { delay: 50 });
  
  // Verify values are present
  await expect(nameInput).toHaveValue("Cardo Dalisay");
  await expect(emailInput).toHaveValue("boba.lover@example.com");
  await expect(passwordInput).toHaveValue("Password123!");

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
}

export const LoadingState: Story = {
  render: () => (
    <MockProviders 
      authValue={{ 
        session: null, 
        signUpNewUser: () => new Promise((resolve) => setTimeout(resolve, 2000)) 
      }}
    >
      <Signup />
    </MockProviders>
  ),
  play: async ({ canvasElement }) => {
    const { submitButton, canvas } = await fillForm(canvasElement);
    await userEvent.click(submitButton);

    // Verify button shows loading text
    await expect(canvas.getByText(/creating\.\.\./i)).toBeInTheDocument();
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

    // Wait for the mocked error to appear in the DOM
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
    const toggleButton = canvas.getByRole("button", { name: "" }); // The eye icon button

    // Check hidden
    await expect(passwordInput).toHaveAttribute("type", "password");

    // Click to show
    await userEvent.click(toggleButton);
    await expect(passwordInput).toHaveAttribute("type", "text");

    // Click to hide again
    await userEvent.click(toggleButton);
    await expect(passwordInput).toHaveAttribute("type", "password");
  },
};