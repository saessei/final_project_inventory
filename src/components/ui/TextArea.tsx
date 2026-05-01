import type { TextareaHTMLAttributes } from "react";
import { cx } from "./utils";

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}

export const TextArea = ({ label, className, id, ...props }: TextAreaProps) => {
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
          "w-full rounded-2xl bg-gray-100/85 border border-transparent px-3 py-3 text-dark-brown outline-none transition-all focus:border-brown focus:ring-2 focus:ring-brown/20",
          className,
        )}
        {...props}
      />
    </div>
  );
};
