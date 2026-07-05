import React from 'react'
import Link from 'next/link'
import {
  getTrendingMovies,
  getLatestReleases,
  getPopularMovies,
} from '@/lib/tmdb'
import MovieRow from '@/components/movie-row'
import HeroRotator from '@/components/hero-rotator'
import PopularNowSection from '@/components/popular-now-section'
import ContinueWatchingSection from '@/components/continue-watching-section'

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
    <div className="flex flex-col flex-1 bg-[#101013]">
      {/* 1. Hero — auto-rotating backdrop with key art on the right */}
      {heroMovies.length > 0 && <HeroRotator movies={heroMovies} />}

      {/* 2. Fold Content — generous vertical rhythm (gap-12 ~ 48px) */}
      <div className="flex flex-col gap-12 py-12">

        {/* 3. Trending row with "See more →" */}
        <MovieRow
          title="Trending Today"
          movies={trending.slice(0, 10)}
          seeMoreUrl="/browse?sort=popularity.desc"
        />

        {/* 4. Genre filter pills + Popular Now row */}
        <PopularNowSection movies={popular} />

        {/* 5. Continue Watching — client-side, renders only if localStorage has data */}
        <ContinueWatchingSection />

        {/* 6. Latest Releases row */}
        <MovieRow
          title="Latest Releases"
          movies={latest}
          seeMoreUrl="/browse?sort=primary_release_date.desc"
        />

        {/* 7. Standalone "Show More" button — links to Browse with newest-first sort */}
        <div className="flex justify-center pb-4">
          <Link
            href="/browse?sort=primary_release_date.desc"
            className="bg-[#E11D2E] text-white hover:bg-[#c11726] font-bold text-base md:text-lg px-10 py-4 rounded-full transition-all duration-300 transform hover:scale-[1.02] cursor-pointer inline-flex items-center justify-center select-none shadow-lg shadow-black/30"
          >
            Show More
          </Link>
        </div>
      </div>
    </div>
  )
}
