import React from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/db'
import { getMovieDetails } from '@/lib/tmdb'
import MovieCard from '@/components/movie-card'
import type { Movie } from '@/types/tmdb'

/** Exact type for rows returned by prisma.watchlistItem.findMany() */
type WatchlistItem = {
  id: number          // Int in schema
  userId: string
  movieId: number
  addedAt: Date
}

export const metadata = {
  title: 'My Watchlist — NontonFilm',
  description: 'Movies you want to watch, saved in one place.',
}

export default async function WatchlistPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?next=/watchlist')
  }

  // Get watchlist items from DB
  const watchlistItems: WatchlistItem[] = await prisma.watchlistItem.findMany({
    where: { userId: user.id },
    orderBy: { addedAt: 'desc' },
  })

  // Fetch TMDB details for all watchlisted movies in parallel (gracefully handle failures)
  const movies: Movie[] = []
  if (watchlistItems.length > 0) {
    const results = await Promise.allSettled(
      watchlistItems.map((item: WatchlistItem) => getMovieDetails(item.movieId))
    )
    for (const result of results) {
      if (result.status === 'fulfilled') {
        movies.push(result.value)
      }
    }
  }

  return (
    <div className="flex-1 bg-[#0B0B0D] px-4 md:px-8 py-8">
      <div className="max-w-6xl mx-auto flex flex-col gap-6">
        {/* Header */}
        <div className="border-b border-[#33343A] pb-5">
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#F5F5F3] tracking-tight">
            My Watchlist
          </h1>
          <p className="text-sm text-[#9A9AA2] mt-1">
            {movies.length} {movies.length === 1 ? 'movie' : 'movies'} saved
          </p>
        </div>

        {/* Movie Grid */}
        {movies.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-4 gap-y-8">
            {movies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center bg-[#1A1B1F] border border-dashed border-[#33343A] rounded-xl p-8">
            <span className="text-6xl mb-4">🎬</span>
            <h2 className="text-xl font-bold text-[#F5F5F3]">Your Watchlist is Empty</h2>
            <p className="text-sm text-[#9A9AA2] max-w-sm mt-2 leading-relaxed">
              Start adding movies you want to watch by clicking the{' '}
              <span className="text-[#E11D2E] font-semibold">Add to Watchlist</span> button on any
              movie page.
            </p>
            <a
              href="/browse"
              className="mt-6 bg-[#E11D2E] text-white hover:bg-[#c11726] font-bold text-sm px-6 py-2.5 rounded transition-colors"
            >
              Discover Movies
            </a>
          </div>
        )}
      </div>
    </div>
  )
}
