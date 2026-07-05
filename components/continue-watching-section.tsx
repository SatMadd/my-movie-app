'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { getPosterUrl } from '@/lib/tmdb'

interface RecentlyViewedMovie {
  id: number
  title: string
  poster_path: string | null
  vote_average: number
  release_date: string
  progress: number // 0–100 percentage
}

export default function ContinueWatchingSection() {
  const [movies, setMovies] = useState<RecentlyViewedMovie[]>([])

  useEffect(() => {
    try {
      const stored = localStorage.getItem('nontonfilm_recently_viewed')
      if (stored) {
        const parsed: RecentlyViewedMovie[] = JSON.parse(stored)
        setMovies(parsed.slice(0, 8))
      }
    } catch {
      // Ignore localStorage errors (private browsing, etc.)
    }
  }, [])

  if (movies.length === 0) return null

  return (
    <div className="py-6">
      <div className="flex items-center justify-between mb-4 px-4 md:px-8">
        <h2 className="text-xl md:text-2xl font-extrabold tracking-tight text-[#F5F5F3] border-l-4 border-[#E11D2E] pl-3">
          Continue Watching
        </h2>
      </div>

      {/* Horizontally scrollable row */}
      <div className="relative">
        <div className="flex gap-4 overflow-x-auto scrollbar-none px-4 md:px-8 pb-4 scroll-smooth snap-x snap-mandatory">
          {movies.map((movie) => (
            <div
              key={movie.id}
              className="w-[160px] sm:w-[180px] md:w-[200px] flex-shrink-0 snap-start"
            >
              <Link href={`/movie/${movie.id}`} className="group block">
                <div className="relative aspect-[2/3] w-full overflow-hidden rounded-xl bg-[#1C1D22] border border-[#34353C] shadow-md transition-all duration-300 ease-out group-hover:scale-[1.03] group-hover:shadow-[0_8px_30px_rgb(0,0,0,0.5)]">
                  {movie.poster_path ? (
                    <Image
                      src={getPosterUrl(movie.poster_path, 'w500')}
                      alt={movie.title}
                      fill
                      sizes="200px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center p-4 text-center">
                      <span className="text-4xl">🎬</span>
                    </div>
                  )}

                  {/* Play icon overlay on hover */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/30">
                    <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                      <span className="text-[#101013] text-lg ml-0.5">▶</span>
                    </div>
                  </div>

                  {/* Progress bar at bottom of card */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#34353C]/80">
                    <div
                      className="h-full bg-[#E11D2E] transition-all duration-300"
                      style={{ width: `${movie.progress}%` }}
                    />
                  </div>

                  {/* Rating badge */}
                  <div className="absolute top-2 right-2 flex items-center justify-center rounded-xl bg-black/75 px-2.5 py-1 text-xs font-bold text-[#F5C518] shadow">
                    ⭐ {movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A'}
                  </div>
                </div>

                <div className="mt-2">
                  <h3 className="line-clamp-1 text-sm font-semibold text-[#F5F5F3] group-hover:text-[#F5C518] transition-colors duration-200">
                    {movie.title}
                  </h3>
                  <p className="text-xs text-[#9A9AA2]">
                    {movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A'}
                  </p>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
