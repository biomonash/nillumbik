import * as React from "react";
import { cn } from "../../../lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline";
}

const variantClasses: Record<string, string> = {
  default:     "bg-primary text-[var(--foreground)] border-transparent hover:bg-primary/80",
  secondary:   "bg-secondary text-[var(--foreground)] border-transparent hover:bg-secondary/80",
  destructive: "bg-red-500 text-white border-transparent hover:bg-red-500/80",
  outline:     "bg-transparent text-[var(--foreground)] border-current",
};

const Badge = ({ className, variant = "default", ...props }: BadgeProps) => {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border",
        "px-2.5 py-0.5 text-xs font-semibold",
        "transition-colors duration-200",
        "focus:outline-none focus:ring-2 focus:ring-white/30",
        variantClasses[variant],
        className
      )}
      {...props}
    />
  );
};

export default Badge;