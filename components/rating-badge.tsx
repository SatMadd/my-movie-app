import React from 'react'

interface RatingBadgeProps {
  rating: number // 1-10
  variant?: 'tmdb' | 'community'
  size?: 'sm' | 'md' | 'lg'
}

export default function RatingBadge({
  rating,
  variant = 'tmdb',
  size = 'md',
}: RatingBadgeProps) {
  const formattedRating = typeof rating === 'number' ? rating.toFixed(1) : '0.0'

  const sizeClasses = {
    sm: 'w-8 h-8 text-xs font-bold',
    md: 'w-10 h-10 text-sm font-extrabold',
    lg: 'w-14 h-14 text-lg font-black',
  }

  const variantClasses = {
    tmdb: 'bg-[#F5C518] text-[#0B0B0D] shadow-md border border-[#F5C518]',
    community:
      'border-2 border-[#F5C518] bg-[#1A1B1F] text-[#F5C518] font-semibold shadow-inner',
  }

  return (
    <div
      className={`flex items-center justify-center rounded-full select-none ${sizeClasses[size]} ${variantClasses[variant]}`}
    >
      {formattedRating}
    </div>
  )
}
