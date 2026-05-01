import type { InputHTMLAttributes, ReactNode } from "react";
import { useId } from "react";
import { cx } from "./utils";

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  leftIcon?: ReactNode;
  rightElement?: ReactNode;
}

export const TextField = ({
  label,
  leftIcon,
  rightElement,
  className,
  id,
  ...props
}: TextFieldProps) => {
  const generatedId = useId();
  const inputId = id ?? props.name ?? generatedId;

  return (
    <div className="space-y-1">
      {label && (
        <label
          htmlFor={inputId}
          className="text-xs ml-2 uppercase font-semibold text-brown-two"
        >
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {leftIcon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-brown-two/60">
            {leftIcon}
          </span>
        )}
        <input
          id={inputId}
          className={cx(
            "w-full rounded-2xl bg-gray-100/85 border border-transparent px-3 py-3 text-dark-brown outline-none transition-all focus:border-brown focus:ring-2 focus:ring-brown/20",
            leftIcon && "pl-10",
            rightElement && "pr-12",
            className,
          )}
          {...props}
        />
        {rightElement && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            {rightElement}
          </div>
        )}
      </div>
    </div>
  );
};
