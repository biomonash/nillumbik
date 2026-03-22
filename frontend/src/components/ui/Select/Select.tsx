import React, { useState, useRef, useEffect, forwardRef } from "react";
import { cn } from "../../../lib/utils";

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps {
  options: SelectOption[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  error?: boolean;
  helperText?: string;
  background?: string;
  textColor?: string;
  borderColor?: string;
  accentColor?: string;
  hoverColor?: string;
}

const Select = forwardRef<HTMLDivElement, SelectProps>(
  (
    {
      options,
      value,
      onChange,
      placeholder = "Select an option",
      disabled = false,
      className,
      error,
      helperText,
      background,
      textColor,
      borderColor,
      accentColor,
      hoverColor,
      ...props
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const selectedOption = options.find((o) => o.value === value);

    const handleSelect = (opt: SelectOption) => {
      if (opt.disabled) return;
      onChange?.(opt.value);
      setIsOpen(false);
    };

    useEffect(() => {
      if (!isOpen) return;
      const close = (e: MouseEvent) => {
        if (!wrapperRef.current?.contains(e.target as Node)) setIsOpen(false);
      };
      window.addEventListener("mousedown", close);
      window.addEventListener("scroll", () => setIsOpen(false), true);
      window.addEventListener("resize", () => setIsOpen(false));
      return () => window.removeEventListener("mousedown", close);
    }, [isOpen]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
      if ((e.key === "Enter" || e.key === " ") && !disabled) {
        e.preventDefault();
        setIsOpen((s) => !s);
      }
    };

    return (
      <div
        ref={ref}
        className={cn(
          "relative flex min-w-max justify-center self-center",
          className
        )}
        style={{
          "--select-bg":     background  ?? "var(--color-text)",
          "--select-text":   textColor   ?? "var(--background)",
          "--select-border": borderColor ?? "rgba(0,0,0,0.2)",
          "--select-accent": accentColor ?? "rgba(0,0,0,0.08)",
          "--select-hover":  hoverColor  ?? "rgba(255,255,255,0.6)",
        } as React.CSSProperties}
        {...props}
      >
        <div
          ref={wrapperRef}
          className={cn(
            "relative flex min-w-max justify-center self-center",
            disabled && "opacity-60 cursor-not-allowed"
          )}
        >
          {/* Trigger button */}
          <button
            type="button"
            disabled={disabled}
            onClick={() => setIsOpen((s) => !s)}
            onKeyDown={handleKeyDown}
            aria-haspopup="listbox"
            aria-expanded={isOpen}
            className={cn(
              "w-full flex items-center justify-between",
              "px-4 py-2.5 rounded-lg text-sm leading-relaxed",
              "cursor-pointer transition-all duration-200 text-left",
              "bg-[var(--select-bg)] text-[var(--select-text)]",
              "border border-[var(--select-border)]",
              "hover:bg-[var(--select-hover)]",
              "focus:outline-none focus:border-white focus:ring-2 focus:ring-white/10",
              "disabled:cursor-not-allowed",
              isOpen && "border-white ring-2 ring-white/10",
              error && "border-red-500 focus:ring-red-500/10"
            )}
          >
            <span className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-[var(--select-text)]">
              {selectedOption?.label || placeholder}
            </span>
            <i
              className={cn(
                "fa-solid ml-2 flex-shrink-0 text-[0.625rem] transition-transform duration-200 text-[var(--select-text)]",
                isOpen ? "fa-caret-up" : "fa-caret-down"
              )}
            />
          </button>

          {/* Dropdown menu */}
          {isOpen && (
            <ul
              role="listbox"
              className={cn(
                "absolute top-[calc(100%+0.25rem)] left-0 z-50",
                "w-max min-w-full p-1 m-0 list-none",
                "max-h-[300px] sm:max-h-[300px] overflow-y-auto",
                "bg-[var(--select-bg)] border border-[var(--select-border)]",
                "rounded-lg shadow-lg",
                "animate-[slideDown_0.15s_ease]",
                // scrollbar
                "[&::-webkit-scrollbar]:w-2",
                "[&::-webkit-scrollbar-thumb]:bg-white/30",
                "[&::-webkit-scrollbar-thumb]:rounded",
              )}
            >
              {options.map((opt) => (
                <li
                  key={opt.value}
                  role="option"
                  aria-selected={opt.value === value}
                  aria-disabled={opt.disabled}
                  onClick={() => handleSelect(opt)}
                  className={cn(
                    "px-4 py-2 text-sm rounded-md cursor-pointer",
                    "transition-colors duration-150 select-none",
                    "text-[var(--select-text)]",
                    !opt.disabled && "hover:bg-[var(--select-accent)] hover:font-medium",
                    opt.value === value && "bg-black/25 hover:bg-[var(--select-hover)]",
                    opt.disabled && "opacity-50 cursor-not-allowed"
                  )}
                >
                  {opt.label}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Helper text */}
        {helperText && (
          <span
            className={cn(
              "block mt-1.5 text-xs text-[var(--select-text)]",
              error && "text-red-500"
            )}
          >
            {helperText}
          </span>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";
export default Select;