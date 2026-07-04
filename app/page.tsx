import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  getTrendingMovies,
  getLatestReleases,
  getPopularMovies,
  getBackdropUrl,
} from '@/lib/tmdb'
import MovieRow from '@/components/movie-row'

export default async function Home() {
  // Parallel fetching of TMDB lists
  const [trending, latest, popular] = await Promise.all([
    getTrendingMovies('day'),
    getLatestReleases(),
    getPopularMovies(),
  ])

  // Get the featured hero movie (top trending)
  const heroMovie = trending[0]

  return (
    <div className="flex flex-col flex-1 bg-[#0B0B0D]">
      {/* Hero Banner Section */}
      {heroMovie && (
        <section className="relative w-full h-[60vh] sm:h-[70vh] md:h-[80vh] flex flex-col justify-end bg-black">
          {/* Backdrop Image */}
          <div className="absolute inset-0">
            <Image
              src={getBackdropUrl(heroMovie.backdrop_path, 'original')}
              alt={heroMovie.title}
              fill
              priority
              className="object-cover opacity-60"
            />
            {/* Ambient vignette and gradients */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0D] via-transparent to-black/30" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0B0B0D]/80 via-[#0B0B0D]/20 to-transparent" />
          </div>

          {/* Hero Content */}
          <div className="relative z-10 w-full max-w-4xl px-4 md:px-8 pb-10 sm:pb-16 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <span className="bg-[#E11D2E] text-white text-xs font-black uppercase px-2 py-0.5 rounded tracking-wider">
                Trending Today
              </span>
              <div className="flex items-center gap-1 bg-black/50 border border-white/10 rounded px-2 py-0.5 text-xs text-[#F5C518] font-bold">
                ⭐ {heroMovie.vote_average ? heroMovie.vote_average.toFixed(1) : 'N/A'}
              </div>
            </div>

            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-[#F5F5F3] leading-[1.05]">
              {heroMovie.title}
            </h1>

            <p className="text-sm sm:text-base text-[#9A9AA2] max-w-2xl line-clamp-3 leading-relaxed">
              {heroMovie.overview}
            </p>

            <div className="mt-2 flex flex-wrap gap-4">
              <Link
                href={`/movie/${heroMovie.id}`}
                className="bg-[#E11D2E] text-[#F5F5F3] hover:bg-[#c11726] font-bold text-sm sm:text-base px-6 py-3 rounded transition-all duration-300 transform hover:scale-[1.02] cursor-pointer"
              >
                Watch Details
              </Link>
              <Link
                href="/browse"
                className="bg-transparent text-[#F5F5F3] border border-[#33343A] hover:bg-[#26272C]/40 hover:border-[#9A9AA2] font-bold text-sm sm:text-base px-6 py-3 rounded transition-all duration-300 cursor-pointer"
              >
                Browse Catalog
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Fold Content */}
      <div className="flex flex-col gap-6 py-8">
        <MovieRow title="Latest Releases" movies={latest} />
        <MovieRow title="Popular Now" movies={popular} />

        {/* Browse Callout Section */}
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
            <Link
              href="/browse"
              className="w-full sm:w-auto text-center bg-[#E11D2E] text-white hover:bg-[#c11726] font-bold text-sm sm:text-base px-8 py-3.5 rounded-lg transition-colors cursor-pointer"
            >
              Browse All Movies
            </Link>
          </div>
        </section>
      </div>
    </div>
  )
}
