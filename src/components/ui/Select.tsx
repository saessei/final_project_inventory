import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check, MoreHorizontal } from "lucide-react";
import { cx } from "./utils";

interface SelectOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

interface SelectOptionAction {
  label: string;
  render: (
    option: SelectOption,
    isSelected: boolean,
    closeDropdown: () => void,
  ) => React.ReactNode;
}

interface SelectProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  className?: string;
  error?: string;
  optionAction?: SelectOptionAction;
}

export const Select = ({
  label,
  value,
  onChange,
  options,
  placeholder = "Select an option",
  className,
  error,
  optionAction,
}: SelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [openActionFor, setOpenActionFor] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setOpenActionFor(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={cx("w-full space-y-2", className)} ref={containerRef}>
      {label && (
        <label className="ml-2 text-xs uppercase font-black tracking-widest text-brown-two block">
          {label}
        </label>
      )}
      
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={cx(
            "w-full flex items-center justify-between rounded-2xl border bg-white px-4 py-3.5 text-sm font-semibold transition-all outline-none",
            isOpen 
              ? "border-brown ring-4 ring-brown/5 shadow-sm" 
              : "border-slate-200 text-dark-brown hover:border-slate-300 shadow-sm",
            error && "border-rose-500 focus:ring-rose-500/10"
          )}
        >
          <span className={cx(!selectedOption && "text-gray-400 font-medium")}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <ChevronDown 
            size={18} 
            className={cx(
              "text-gray-400 transition-transform duration-200",
              isOpen && "rotate-180 text-brown"
            )} 
          />
        </button>

        {isOpen && (
          <div className="absolute z-[100] mt-2 w-full rounded-2xl border border-slate-100 bg-white p-1.5 shadow-xl animate-in fade-in zoom-in-95 duration-200 max-h-60 overflow-y-auto no-scrollbar">
            {options.map((option) => {
              const isSelected = option.value === value;
              return (
                <div key={option.value} className="group flex items-center gap-2 rounded-xl">
                  <button
                    type="button"
                    onClick={() => {
                      onChange(option.value);
                      setIsOpen(false);
                      setOpenActionFor(null);
                    }}
                    className={cx(
                      "flex-1 flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-all",
                      isSelected
                        ? "bg-brown text-white"
                        : "text-dark-brown hover:bg-cream/50"
                    )}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {option.icon}
                      <span className="truncate">{option.label}</span>
                    </div>
                    {isSelected && <Check size={16} strokeWidth={3} />}
                  </button>

                  {optionAction && (
                    <div className="shrink-0 pr-1">
                      {openActionFor === option.value ? (
                        optionAction.render(option, isSelected, () => {
                          setIsOpen(false);
                          setOpenActionFor(null);
                        })
                      ) : (
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            setOpenActionFor(option.value);
                          }}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition-all hover:bg-slate-50 hover:text-dark-brown"
                          aria-label={`${optionAction.label} for ${option.label}`}
                        >
                          <MoreHorizontal size={14} />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
      
      {error && (
        <p className="ml-2 text-xs font-bold text-rose-500 animate-in fade-in slide-in-from-top-1">
          {error}
        </p>
      )}
    </div>
  );
};
