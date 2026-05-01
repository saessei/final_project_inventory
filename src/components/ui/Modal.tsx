import type { ReactNode } from "react";
import { X } from "lucide-react";
import { IconButton } from "./IconButton";
import { cx } from "./utils";

interface ModalProps {
  title?: string;
  children: ReactNode;
  footer?: ReactNode;
  onClose: () => void;
  size?: "sm" | "md" | "lg";
  className?: string;
  bodyClassName?: string;
}

const sizes = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-2xl",
};

export const Modal = ({
  title,
  children,
  footer,
  onClose,
  size = "md",
  className,
  bodyClassName,
}: ModalProps) => (
  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div
      className={cx(
        "bg-white rounded-2xl p-6 w-full shadow-2xl max-h-[90vh] overflow-y-auto",
        sizes[size],
        className,
      )}
      onClick={(e) => e.stopPropagation()}
    >
      {title && (
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">{title}</h2>
          <IconButton label="Close" onClick={onClose}>
            <X size={20} />
          </IconButton>
        </div>
      )}
      <div className={bodyClassName}>{children}</div>
      {footer && <div className="flex justify-end gap-3 mt-6">{footer}</div>}
    </div>
  </div>
);
