import React from "react";
import styles from "../Dashboard.module.scss";

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    label: string;
  };
  color?: "primary" | "secondary" | "accent" | "forest" | "water";
}

const colorClasses: Record<string, string> = {
  primary: "bg-eco-primary text-white",
  secondary: "bg-eco-secondary text-white",
  accent: "bg-eco-accent text-white",
  forest: "bg-eco-forest text-white",
  water: "bg-eco-water text-white",
};

export function StatsCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  color = "primary",
}: StatsCardProps) {
  return (
    <div className={styles.statsCard}>
      <div className={styles.statsCardHeader}>
        <div>
          <p className={styles.statsCardTitle}>{title}</p>
          <div className={styles.statsCardValue}>{value}</div>
          {subtitle && <p className={styles.statsCardSubtitle}>{subtitle}</p>}
          {trend && (
            <p className={styles.statsCardTrend}>
              {trend.value > 0 ? "+" : ""}
              {trend.value}% <span className="text-muted-foreground">{trend.label}</span>
            </p>
          )}
        </div>
        <div className={`${styles.statsCardIcon} ${colorClasses[color]}`}>
          {icon || <span className="text-xs">?</span>}
        </div>
      </div>
    </div>
  );
}
