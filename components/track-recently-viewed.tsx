'use client'

import { useEffect } from 'react'
import { Movie } from '@/types/tmdb'

interface TrackRecentlyViewedProps {
  movie: Movie
}

export default function TrackRecentlyViewed({ movie }: TrackRecentlyViewedProps) {
  useEffect(() => {
    if (typeof window === 'undefined' || !movie.id) return

    const storageKey = 'nontonfilm_recently_viewed'
    try {
      const stored = localStorage.getItem(storageKey)
      let list: any[] = stored ? JSON.parse(stored) : []

      // Filter out current movie to avoid duplicates and bring to front
      list = list.filter((m: any) => m.id !== movie.id)

      // Create a stable simulated progress percentage based on movie ID
      const progress = (movie.id % 70) + 20 // 20% to 90%

      list.unshift({
        id: movie.id,
        title: movie.title,
        poster_path: movie.poster_path,
        vote_average: movie.vote_average,
        release_date: movie.release_date,
        progress,
      })

      // Limit list to top 10 recently viewed
      localStorage.setItem(storageKey, JSON.stringify(list.slice(0, 10)))
    } catch (e) {
      console.error('Failed to save recently viewed movie:', e)
    }
  }, [movie])

  return null
}
