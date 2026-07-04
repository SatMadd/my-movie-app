import React from 'react'

interface ReviewCardProps {
  username: string
  rating: number // 1-10
  body: string
  createdAt: Date | string
  userId?: string
}

export default function ReviewCard({
  username,
  rating,
  body,
  createdAt,
  userId,
}: ReviewCardProps) {
  const dateStr = new Date(createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })

  // Generate initials
  const initials = username ? username.substring(0, 2).toUpperCase() : 'U'

  // Get a consistent avatar background color based on the username hash
  const getAvatarColor = () => {
    const colors = [
      'bg-indigo-600',
      'bg-[#E11D2E]',
      'bg-emerald-600',
      'bg-amber-600',
      'bg-pink-600',
      'bg-blue-600',
    ]
    const hash = username.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    return colors[hash % colors.length]
  }

  return (
    <div className="bg-[#1A1B1F] border border-[#33343A] rounded-lg p-5 flex flex-col gap-4 shadow-sm hover:border-[#26272C] transition-all">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white uppercase select-none ${getAvatarColor()} border border-[#33343A]`}
          >
            {initials}
          </div>
          <div>
            <h4 className="text-sm font-bold text-[#F5F5F3]">{username}</h4>
            <p className="text-xs text-[#9A9AA2]">{dateStr}</p>
          </div>
        </div>

        {/* Rating chip */}
        <div className="flex items-center gap-1 bg-[#F5C518]/10 border border-[#F5C518]/20 px-2.5 py-1 rounded text-xs font-bold text-[#F5C518]">
          <span>⭐</span>
          <span>{rating}/10</span>
        </div>
      </div>

      <p className="text-sm text-[#F5F5F3] whitespace-pre-line leading-relaxed">
        {body}
      </p>
    </div>
  )
}
