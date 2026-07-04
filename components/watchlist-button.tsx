'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface WatchlistButtonProps {
  movieId: number
  userId: string | undefined
}

export default function WatchlistButton({ movieId, userId }: WatchlistButtonProps) {
  const router = useRouter()
  const [isWatchlisted, setIsWatchlisted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [pulsing, setPulsing] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }

    const checkStatus = async () => {
      try {
        const { data, error } = await supabase
          .from('watchlist_items')
          .select('id')
          .eq('user_id', userId)
          .eq('movie_id', movieId)
          .maybeSingle()

        if (data) {
          setIsWatchlisted(true)
        }
      } catch (err) {
        console.error('Error checking watchlist status:', err)
      } finally {
        setLoading(false)
      }
    }

    checkStatus()
  }, [movieId, userId, supabase])

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!userId) {
      // Redirect to login with return path
      router.push(`/login?next=/movie/${movieId}`)
      return
    }

    setLoading(true)
    setPulsing(true)

    try {
      if (isWatchlisted) {
        // Remove from watchlist
        const { error } = await supabase
          .from('watchlist_items')
          .delete()
          .eq('user_id', userId)
          .eq('movie_id', movieId)

        if (error) throw error
        setIsWatchlisted(false)
      } else {
        // Add to watchlist
        const { error } = await supabase
          .from('watchlist_items')
          .insert({
            user_id: userId,
            movie_id: movieId,
          })

        if (error) throw error
        setIsWatchlisted(true)
      }
      router.refresh()
    } catch (err) {
      console.error('Failed to update watchlist:', err)
    } finally {
      setLoading(false)
      setTimeout(() => setPulsing(false), 300)
    }
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading && !pulsing}
      className={`flex items-center gap-2 px-5 py-2.5 rounded-md font-bold text-sm transition-all duration-300 transform cursor-pointer border ${
        pulsing ? 'scale-95' : 'hover:scale-[1.02] active:scale-95'
      } ${
        isWatchlisted
          ? 'bg-[#E11D2E] text-white border-[#E11D2E] hover:bg-[#c11726]'
          : 'bg-[#1A1B1F] text-[#F5F5F3] border-[#33343A] hover:bg-[#26272C] hover:border-[#9A9AA2]'
      }`}
    >
      <span className="text-base leading-none">
        {isWatchlisted ? '❤️' : '🤍'}
      </span>
      <span>{isWatchlisted ? 'In Watchlist' : 'Add to Watchlist'}</span>
    </button>
  )
}
