import React from 'react'

interface StatsCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon?: React.ReactNode
  trend?: {
    value: number
    label: string
  }
  color?: 'primary' | 'secondary' | 'accent' | 'forest' | 'water'
}

const iconColorClasses: Record<string, string> = {
  primary: 'bg-primary text-white',
  secondary: 'bg-secondary text-white',
  accent: 'bg-accent text-white',
  forest: 'bg-sidebar text-white',
  water: 'bg-blue-400 text-white',
}

export function StatsCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  color = 'primary',
}: StatsCardProps) {
  return (
    <div className="w-full h-[130px] px-4 py-3 rounded-xl bg-white/10 flex flex-col justify-between box-border shadow-sm">
      {/* Header row */}
      <div className="flex justify-between items-start">
        <p className="text-[0.8rem] font-medium text-[var(--muted-foreground)]">
          {title}
        </p>
        {/* Icon */}
        <div
          className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs ${iconColorClasses[color]}`}
        >
          {icon || <span>?</span>}
        </div>
      </div>

      {/* Value */}
      <div className="text-xl font-bold text-foreground">{value}</div>

      {/* Subtitle + Trend */}
      <div>
        {subtitle && (
          <p className="text-[0.7rem] text-[var(--muted-foreground)]">
            {subtitle}
          </p>
        )}
        {trend && (
          <p
            className={[
              'text-[0.7rem] font-semibold',
              trend.value > 0 ? 'text-green-400' : 'text-red-400',
            ].join(' ')}
          >
            {trend.value > 0 ? '+' : ''}
            {trend.value}%{' '}
            <span className="text-[var(--muted-foreground)] font-normal">
              {trend.label}
            </span>
          </p>
        )}
      </div>
    </div>
  )
}
