import type { TextareaHTMLAttributes } from "react";
import { cx } from "./utils";

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const TextArea = ({
  label,
  error,
  className,
  id,
  ...props
}: TextAreaProps) => {
  const textareaId = id ?? props.name;

  return (
    <div className="space-y-1">
      {label && (
        <label
          htmlFor={textareaId}
          className="text-xs ml-2 uppercase font-semibold text-brown-two"
        >
          {label}
        </label>
      )}
      <textarea
        id={textareaId}
        className={cx(
          "w-full rounded-2xl bg-gray-100/85 border px-3 py-3 text-dark-brown outline-none transition-all focus:ring-2 focus:ring-brown/20",
          error
            ? "border-rose-400 focus:border-rose-500 focus:ring-rose-200"
            : "border-transparent focus:border-brown",
          className,
        )}
        {...props}
      />
      {error && (
        <p className="text-[10px] ml-2 font-black text-rose-500 uppercase tracking-widest">
          {error}
        </p>
      )}
    </div>
  );
};
