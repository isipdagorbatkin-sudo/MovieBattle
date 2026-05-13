'use client'

import { forwardRef, type HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

const variants = {
  default: 'bg-white/10 text-white/70 border border-white/10',
  primary: 'bg-purple-500/20 text-purple-300 border border-purple-500/30',
  success: 'bg-green-500/20 text-green-300 border border-green-500/30',
  warning: 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30',
  danger: 'bg-red-500/20 text-red-300 border border-red-500/30',
  premium: 'bg-gradient-to-r from-purple-600/30 to-pink-600/30 text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-pink-300 border border-purple-500/30',
}

interface BadgeProps extends HTMLAttributes<HTMLDivElement> {
  variant?: keyof typeof variants
}

const Badge = forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = 'default', ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        variants[variant],
        className
      )}
      {...props}
    />
  )
)
Badge.displayName = 'Badge'

export { Badge }
export type { BadgeProps }
