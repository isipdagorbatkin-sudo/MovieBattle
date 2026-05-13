'use client'

import { forwardRef, type HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

const Avatar = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement> & { size?: 'sm' | 'md' | 'lg' | 'xl' }>(
  ({ className, size = 'md', ...props }, ref) => {
    const sizes = {
      sm: 'h-8 w-8',
      md: 'h-10 w-10',
      lg: 'h-14 w-14',
      xl: 'h-20 w-20',
    }
    return (
      <div
        ref={ref}
        className={cn(
          'relative rounded-full overflow-hidden bg-white/10 ring-2 ring-white/10',
          sizes[size],
          className
        )}
        {...props}
      />
    )
  }
)
Avatar.displayName = 'Avatar'

const AvatarImage = forwardRef<HTMLImageElement, HTMLAttributes<HTMLImageElement> & { src?: string | null; alt?: string }>(
  ({ className, src, alt = '', ...props }, ref) => {
    if (!src) return null
    return (
      <img
        ref={ref}
        src={src}
        alt={alt}
        className={cn('h-full w-full object-cover', className)}
        {...props}
      />
    )
  }
)
AvatarImage.displayName = 'AvatarImage'

const AvatarFallback = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'flex h-full w-full items-center justify-center bg-gradient-to-br from-purple-600 to-pink-600 text-white font-semibold text-sm',
        className
      )}
      {...props}
    />
  )
)
AvatarFallback.displayName = 'AvatarFallback'

export { Avatar, AvatarImage, AvatarFallback }
