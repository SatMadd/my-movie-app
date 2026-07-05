'use client'

import React, { useState } from 'react'
import { Movie } from '@/types/tmdb'
import MovieCard from './movie-card'
import { fetchLatestReleasesAction } from '@/app/actions'

interface LatestReleaseSectionProps {
  initialMovies: Movie[]
  initialHasMore: boolean
  children?: React.ReactNode
}

export default function LatestReleaseSection({
  initialMovies,
  initialHasMore,
  children,
}: LatestReleaseSectionProps) {
  const [movies, setMovies] = useState<Movie[]>(initialMovies)
  const [page, setPage] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(initialHasMore)

  const handleLoadMore = async () => {
    if (isLoading) return
    setIsLoading(true)
    setError(null)
    const nextPage = page + 1

    try {
      const response = await fetchLatestReleasesAction(nextPage)
      if (response && response.results) {
        setMovies((prev) => [...prev, ...response.results])
        setPage(nextPage)
        if (nextPage >= response.total_pages || response.results.length === 0) {
          setHasMore(false)
        }
      } else {
        throw new Error('Invalid response structure')
      }
    } catch (err) {
      console.error('Error fetching next page of latest releases:', err)
      setError('Failed to load more movies. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      {/* Latest Releases Grid Section */}
      <section className="py-6 px-4 md:px-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl md:text-2xl font-extrabold tracking-tight text-[#F5F5F3] border-l-4 border-[#E11D2E] pl-3">
            Latest Releases
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-4 gap-y-8">
          {movies.map((movie, index) => (
            <MovieCard key={`${movie.id}-${index}`} movie={movie} />
          ))}
        </div>
      </section>

      {/* Render nested children (e.g. Popular Now row) */}
      {children}

      {/* CTA/Pagination Panel */}
      <section className="px-4 md:px-8 py-10">
        <div className="max-w-6xl mx-auto bg-[#1A1B1F] border border-[#33343A] rounded-2xl p-8 sm:p-12 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="text-center sm:text-left flex flex-col gap-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#F5F5F3] tracking-tight">
              Looking for something specific?
            </h2>
            <p className="text-[#9A9AA2] text-sm sm:text-base max-w-md">
              Sort our complete list of films by release date, rating, and find your next cinema adventure.
            </p>
          </div>

          <div className="w-full sm:w-auto flex flex-col items-center gap-3">
            {error && (
              <div className="text-sm text-[#E11D2E] text-center flex items-center gap-2">
                <span>⚠️ {error}</span>
                <button
                  onClick={handleLoadMore}
                  className="underline font-bold text-[#F5F5F3] hover:text-[#F5C518] transition-colors cursor-pointer"
                >
                  Retry
                </button>
              </div>
            )}

            {hasMore ? (
              <button
                onClick={handleLoadMore}
                disabled={isLoading}
                className="w-full sm:w-auto text-center bg-[#E11D2E] text-white hover:bg-[#c11726] disabled:bg-[#33343A] disabled:text-[#9A9AA2] font-bold text-sm sm:text-base px-8 py-3.5 rounded-lg transition-colors cursor-pointer disabled:cursor-not-allowed select-none min-w-[160px]"
              >
                {isLoading ? 'Loading…' : 'Show More'}
              </button>
            ) : (
              <span className="text-sm font-semibold text-[#9A9AA2] bg-[#1A1B1F] border border-[#33343A] px-6 py-3 rounded-lg select-none">
                You\'ve reached the end
              </span>
            )}
          </div>
        </div>
      </section>
    </>
  )
}
