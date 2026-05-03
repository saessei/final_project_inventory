import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Button } from "./Button";

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  children: ReactNode;
  variant?: "outline" | "ghost" | "danger" | "secondary" | "solid";
  size?: "sm" | "md" | "lg" | "icon";
}

export const IconButton = ({
  label,
  children,
  variant = "ghost",
  size = "icon",
  ...props
}: IconButtonProps) => (
  <Button
    {...props}
    size={size}
    variant={variant}
    aria-label={label}
    title={label}
  >
    {children}
  </Button>
);
