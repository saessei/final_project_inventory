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
          "bg-white rounded-[2rem] p-8 w-full shadow-2xl max-h-[90vh] overflow-y-auto no-scrollbar relative",
          sizes[size],
          className,
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start mb-8">
          <div>
            {title && (
              <div className="flex items-center gap-3">
                {icon && <div className="text-brown">{icon}</div>}
                <h2 id={titleId} className="text-3xl font-black font-fredoka text-dark-brown">
                  {title}
                </h2>
              </div>
            )}
            {description && (
              <p className="mt-1 text-gray-500 font-medium">
                {description}
              </p>
            )}
          </div>
          <IconButton
            label="Close"
            onClick={onClose}
            className="hover:bg-cream/50 transition-colors"
          >
            <X size={24} className="text-gray-400" />
          </IconButton>
        </div>

        <div className={bodyClassName}>{children}</div>

        {footer && (
          <div className="flex justify-end gap-4 mt-10 pt-6 border-t border-slate-100 sticky bottom-0 bg-white -mx-8 px-8 -mb-2 pb-2">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
