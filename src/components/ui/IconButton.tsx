import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Button } from "./Button";

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  children: ReactNode;
  variant?: "outline" | "ghost" | "danger" | "secondary" | "solid";
}

export const IconButton = ({
  label,
  children,
  variant = "ghost",
  ...props
}: IconButtonProps) => (
  <Button
    {...props}
    size="icon"
    variant={variant}
    aria-label={label}
    title={label}
  >
    {children}
  </Button>
);
