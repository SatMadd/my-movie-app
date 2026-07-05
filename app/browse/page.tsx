import React from 'react'
import Link from 'next/link'
import { discoverMovies, searchMovies } from '@/lib/tmdb'
import MovieCard from '@/components/movie-card'

interface BrowsePageProps {
  searchParams: Promise<{
    q?: string
    sort?: string
    page?: string
  }>
}

export default async function BrowsePage(props: BrowsePageProps) {
  // Await searchParams in Next.js 16
  const searchParams = await props.searchParams
  const query = searchParams.q || ''
  const sortBy = searchParams.sort || 'primary_release_date.desc'
  const page = Math.max(1, parseInt(searchParams.page || '1', 10))

  // Fetch from TMDB based on search query or discover filters
  const data = query
    ? await searchMovies(query, page)
    : await discoverMovies(sortBy, page)

  const movies = data.results || []
  const totalPages = Math.min(data.total_pages || 1, 500) // TMDB API caps pagination at page 500

  // Helper to build URL with preserved query parameters
  const buildPageUrl = (targetPage: number) => {
    const params = new URLSearchParams()
    if (query) params.set('q', query)
    if (sortBy && !query) params.set('sort', sortBy)
    params.set('page', targetPage.toString())
    return `/browse?${params.toString()}`
  }

  // Helper to build sort URLs
  const buildSortUrl = (targetSort: string) => {
    const params = new URLSearchParams()
    if (query) params.set('q', query)
    params.set('sort', targetSort)
    params.set('page', '1') // reset page
    return `/browse?${params.toString()}`
  }

  const sortOptions = [
    { label: 'Release Date (Newest)', value: 'primary_release_date.desc' },
    { label: 'Release Date (Oldest)', value: 'primary_release_date.asc' },
    { label: 'Popularity (High)', value: 'popularity.desc' },
    { label: 'Popularity (Low)', value: 'popularity.asc' },
    { label: 'Rating (High)', value: 'vote_average.desc' },
  ]

  return (
    <div className="flex-1 bg-[#101013] px-4 md:px-8 py-8">
      <div className="max-w-6xl mx-auto flex flex-col gap-6">
        {/* Header Block */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#27272a] pb-5">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-[#fafafa] tracking-tight">
              {query ? `Search Results for "${query}"` : 'Browse Movies'}
            </h1>
            <p className="text-xs md:text-sm text-[#a1a1aa] mt-1">
              Found {data.total_results || 0} movies
            </p>
          </div>

          {/* Sort Toggles - Only display if not searching (search results sorting is handled by TMDB relevancy) */}
          {!query && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#9A9AA2]">
                Sort By:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {sortOptions.map((opt) => {
                  const isActive = sortBy === opt.value
                  return (
                    <Link
                      key={opt.value}
                      href={buildSortUrl(opt.value)}
                      className={`text-xs px-3 py-1.5 rounded-full font-bold select-none cursor-pointer border transition-all ${
                        isActive
                          ? 'bg-[#F5F5F3] text-[#101013] border-[#F5F5F3]'
                          : 'bg-transparent text-[#9A9AA2] border-[#34353C] hover:border-[#9A9AA2] hover:text-[#F5F5F3]'
                      }`}
                    >
                      {opt.label}
                    </Link>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* Movies Grid */}
        {movies.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-4 gap-y-8">
            {movies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-[#1C1D22] border border-[#34353C] rounded-xl p-8">
            <span className="text-5xl">🕵️‍♂️</span>
            <h3 className="text-lg font-bold text-[#F5F5F3] mt-4">No Movies Found</h3>
            <p className="text-sm text-[#9A9AA2] max-w-sm mt-2">
              We couldn't find any movies matching your selection. Try adjusting your query or filters.
            </p>
            <Link
              href="/browse"
              className="mt-6 bg-[#E11D2E] text-white hover:bg-[#c11726] font-bold text-sm px-6 py-2.5 rounded-full transition-colors"
            >
              Clear All Filters
            </Link>
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && movies.length > 0 && (
          <div className="flex items-center justify-center gap-2 border-t border-[#34353C] pt-8 mt-4 select-none">
            {/* Previous Page */}
            {page > 1 ? (
              <Link
                href={buildPageUrl(page - 1)}
                className="px-4 py-2 bg-[#1C1D22] border border-[#34353C] hover:bg-[#2A2B31] text-sm font-bold text-[#F5F5F3] rounded-full transition-colors cursor-pointer"
              >
                ◀ Previous
              </Link>
            ) : (
              <span className="px-4 py-2 bg-[#1C1D22]/30 border border-[#34353C]/40 text-sm font-bold text-[#9A9AA2]/40 rounded-full cursor-not-allowed">
                ◀ Previous
              </span>
            )}

            {/* Page indicator */}
            <span className="text-sm text-[#9A9AA2] font-semibold px-4">
              Page <span className="text-[#F5F5F3] font-bold">{page}</span> of{' '}
              <span className="text-[#F5F5F3] font-bold">{totalPages}</span>
            </span>

            {/* Next Page */}
            {page < totalPages ? (
              <Link
                href={buildPageUrl(page + 1)}
                className="px-4 py-2 bg-[#1C1D22] border border-[#34353C] hover:bg-[#2A2B31] text-sm font-bold text-[#F5F5F3] rounded-full transition-colors cursor-pointer"
              >
                Next ▶
              </Link>
            ) : (
              <span className="px-4 py-2 bg-[#1C1D22]/30 border border-[#34353C]/40 text-sm font-bold text-[#9A9AA2]/40 rounded-full cursor-not-allowed">
                Next ▶
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
