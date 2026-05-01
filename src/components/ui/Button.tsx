import { Loader2 } from "lucide-react";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cx } from "./utils";

type ButtonVariant =
  | "primary"
  | "solid"
  | "secondary"
  | "outline"
  | "ghost"
  | "danger";

type ButtonSize = "sm" | "md" | "lg" | "icon";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  isLoading?: boolean;
  loadingText?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-gradient-to-r from-brown-two to-dark-brown text-white shadow-md hover:scale-[1.02] active:scale-95",
  solid: "bg-dark-brown text-white hover:bg-brown-dark",
  secondary:
    "bg-cream border border-brown/30 text-brown-two hover:bg-brown hover:text-white",
  outline: "border border-gray-300 bg-white text-gray-600 hover:bg-gray-50",
  ghost: "text-gray-500 hover:text-dark-brown hover:bg-gray-100",
  danger: "bg-red-100 text-red-600 hover:bg-red-200",
};

const sizes: Record<ButtonSize, string> = {
  sm: "px-3 py-2 text-sm",
  md: "px-4 py-2 text-sm",
  lg: "px-4 py-3 text-sm",
  icon: "h-10 w-10 p-0",
};

export const Button = ({
  variant = "solid",
  size = "md",
  fullWidth = false,
  isLoading = false,
  loadingText,
  leftIcon,
  rightIcon,
  className,
  disabled,
  children,
  type = "button",
  ...props
}: ButtonProps) => (
  <button
    type={type}
    disabled={disabled || isLoading}
    className={cx(
      "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100",
      variants[variant],
      sizes[size],
      fullWidth && "w-full",
      className,
    )}
    {...props}
  >
    {isLoading && <Loader2 size={16} className="animate-spin" />}
    {!isLoading && leftIcon}
    {isLoading && loadingText ? loadingText : children}
    {!isLoading && rightIcon}
  </button>
);
