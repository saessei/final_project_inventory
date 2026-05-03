import { useId, type ReactNode } from "react";
import { X } from "lucide-react";
import { IconButton } from "./IconButton";
import { cx } from "./utils";

interface ModalProps {
  title?: string;
  description?: string;
  icon?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  onClose: () => void;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  bodyClassName?: string;
}

const sizes = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-3xl",
};

export const Modal = ({
  title,
  description,
  icon,
  children,
  footer,
  onClose,
  size = "md",
  className,
  bodyClassName,
}: ModalProps) => {
  const titleId = useId();

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        className={cx(
          "bg-white rounded-[2rem] w-full shadow-2xl max-h-[90vh] flex flex-col relative overflow-hidden",
          sizes[size],
          className,
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Fixed */}
        <div className="flex justify-between items-start p-6 pb-2">
          <div>
            {title && (
              <div className="flex items-center gap-3">
                {icon && <div className="text-brown">{icon}</div>}
                <h2
                  id={titleId}
                  className="text-2xl font-black font-fredoka text-dark-brown"
                >
                  {title}
                </h2>
              </div>
            )}
            {description && (
              <p className="mt-1 text-sm text-gray-500 font-medium">{description}</p>
            )}
          </div>
          <IconButton
            label="Close"
            onClick={onClose}
            className="hover:bg-cream/50 transition-colors"
          >
            <X size={20} className="text-gray-400" />
          </IconButton>
        </div>

        {/* Body - Scrollable */}
        <div
          className={cx(
            "flex-1 overflow-y-auto px-6 py-2 no-scrollbar",
            bodyClassName,
          )}
        >
          {children}
        </div>

        {/* Footer - Fixed */}
        {footer && (
          <div className="flex justify-end gap-3 p-6 pt-4 border-t border-slate-50 bg-white">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
