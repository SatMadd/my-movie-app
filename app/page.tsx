import React from 'react'
import Link from 'next/link'
import {
  getTrendingMovies,
  getLatestReleases,
  getPopularMovies,
} from '@/lib/tmdb'
import MovieRow from '@/components/movie-row'
import HeroRotator from '@/components/hero-rotator'

export default async function Home() {
  // Parallel fetching of TMDB lists
  const [trending, latest, popular] = await Promise.all([
    getTrendingMovies('day'),
    getLatestReleases(),
    getPopularMovies(),
  ])

  // Top 6 trending movies power the rotating hero
  const heroMovies = trending.slice(0, 6)

  return (
    <div className="flex flex-col flex-1 bg-[#0B0B0D]">
      {/* Hero Banner Section */}
      {heroMovies.length > 0 && <HeroRotator movies={heroMovies} />}

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
