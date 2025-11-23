import React, { useState, useRef, useEffect, forwardRef } from "react";
import { cn } from "../../../lib/utils";
import styles from "./Select.module.scss";

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

/** Custom color overrides */
  background?: string;      // e.g. "var(--clr-background)" or "#fff"
  textColor?: string;       // e.g. "var(--clr-text)"
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

    /** Close when clicking outside */
    useEffect(() => {
      if (!isOpen) return;

      const close = (e: MouseEvent) => {
        if (!wrapperRef.current?.contains(e.target as Node)) {
          setIsOpen(false);
        }
      };

      window.addEventListener("mousedown", close);
      window.addEventListener("scroll", () => setIsOpen(false), true);
      window.addEventListener("resize", () => setIsOpen(false));

      return () => {
        window.removeEventListener("mousedown", close);
      };
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
        className={cn(styles.wrapper, className)}
        style={{
          "--select-bg": background,
          "--select-text": textColor,
          "--select-border": borderColor,
          "--select-accent": accentColor,
          "--select-hover": hoverColor,
        } as React.CSSProperties}
        {...props}
      >
        <div
          ref={wrapperRef}
          className={cn(styles.select, {
            [styles.disabled]: disabled,
            [styles.error]: error,
          })}
        >
          <button
            type="button"
            className={styles.trigger}
            disabled={disabled}
            onClick={() => setIsOpen((s) => !s)}
            onKeyDown={handleKeyDown}
            aria-haspopup="listbox"
            aria-expanded={isOpen}
          >
            <span className={cn(styles.value, value && styles.hasValue)}>
              {selectedOption?.label || placeholder}
            </span>

            <i
                className={cn(
                "fa-solid",
                isOpen ? "fa-caret-up" : "fa-caret-down",
                styles.arrow
                )}
            ></i>
          </button>

          {isOpen && (
            <ul className={styles.menu} role="listbox">
              {options.map((opt) => (
                <li
                  key={opt.value}
                  className={cn(styles.item, {
                    [styles.selected]: opt.value === value,
                    [styles.disabled]: opt.disabled,
                  })}
                  role="option"
                  aria-selected={opt.value === value}
                  aria-disabled={opt.disabled}
                  onClick={() => handleSelect(opt)}
                >
                  {opt.label}
                </li>
              ))}
            </ul>
          )}
        </div>

        {helperText && (
          <span
            className={cn(styles.helper, error && styles.helperError)}
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
