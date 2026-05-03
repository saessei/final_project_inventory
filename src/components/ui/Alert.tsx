import type { ReactNode } from "react";
import { cx } from "./utils";

interface AlertProps {
  type?: "error" | "success" | "info" | "warning";
  children: ReactNode;
  className?: string;
}

const variants = {
  error: "text-red-700 bg-red-100 border-red-200",
  success: "text-emerald-700 bg-emerald-100 border-emerald-200",
  info: "text-slate-700 bg-slate-100 border-slate-200",
  warning: "text-amber-700 bg-amber-100 border-amber-200",
};

export const Alert = ({ type = "info", children, className }: AlertProps) => (
  <div
    role="alert"
    className={cx(
      "rounded-xl border px-3 py-2 text-sm font-semibold",
      variants[type],
      className,
    )}
  >
    {children}
  </div>
);
