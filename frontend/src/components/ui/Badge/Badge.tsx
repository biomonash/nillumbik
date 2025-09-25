import * as React from "react";
import { cn } from "../../../lib/utils";
import classes from "./Badge.module.scss";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline";
}

const Badge = ({ className, variant = "default", ...props }: BadgeProps) => {
  return (
    <div
      className={cn(
        classes.badge,
        classes[variant]
      )}
      {...props}
    />
  );
};

export default Badge;
