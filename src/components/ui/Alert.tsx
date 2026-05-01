import type { ReactNode } from "react";
import { cx } from "./utils";

interface AlertProps {
  variant?: "error" | "success" | "info";
  children: ReactNode;
  className?: string;
}

const variants = {
  error: "text-red-700 bg-red-100 border-red-200",
  success: "text-emerald-700 bg-emerald-100 border-emerald-200",
  info: "text-text-gray bg-cream/70 border-brown/15",
};

export const Alert = ({ variant = "info", children, className }: AlertProps) => (
  <p
    className={cx(
      "rounded-xl border px-3 py-2 text-sm font-semibold",
      variants[variant],
      className,
    )}
  >
    {children}
  </p>
);
