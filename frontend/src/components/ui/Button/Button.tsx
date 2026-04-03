import * as React from 'react'
import { cn } from '../../../lib/utils'

const variantClasses: Record<string, string> = {
  default: 'bg-primary text-[var(--foreground)] hover:bg-primary/90',
  destructive: 'bg-red-500 text-white hover:bg-red-500/90',
  outline:
    'border border-white/20 bg-transparent hover:bg-white/10 text-[var(--foreground)]',
  secondary: 'bg-secondary text-[var(--foreground)] hover:bg-secondary/80',
  ghost: 'hover:bg-white/10 text-[var(--foreground)]',
  link: 'text-[var(--foreground)] underline-offset-4 hover:underline',
}

const sizeClasses: Record<string, string> = {
  default: 'h-14 px-6 py-2.5 text-sm',
  sm: 'h-9 rounded-md px-3',
  lg: 'h-11 rounded-md px-8',
  icon: 'h-10 w-10',
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variantClasses
  size?: keyof typeof sizeClasses
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium',
        'transition-colors duration-200 cursor-pointer',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30',
        'disabled:pointer-events-none disabled:opacity-50',
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...props}
    />
  ),
)

Button.displayName = 'Button'
export default Button
