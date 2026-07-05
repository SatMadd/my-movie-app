import React from 'react'
import {
  getTrendingMovies,
  getLatestReleases,
  getPopularMovies,
} from '@/lib/tmdb'
import MovieRow from '@/components/movie-row'
import HeroRotator from '@/components/hero-rotator'
import LatestReleaseSection from '@/components/latest-release-section'

export default async function Home() {
  // Parallel fetching of TMDB lists
  const [trending, latestResponse, popular] = await Promise.all([
    getTrendingMovies('day'),
    getLatestReleases(1),
    getPopularMovies(),
  ])

  // Top 6 trending movies power the rotating hero
  const heroMovies = trending.slice(0, 6)
  const latestMovies = latestResponse.results || []
  const hasMoreLatest = latestResponse.page < latestResponse.total_pages

  return (
    <div className="flex flex-col flex-1 bg-[#0B0B0D]">
      {/* Hero Banner Section */}
      {heroMovies.length > 0 && <HeroRotator movies={heroMovies} />}

      {/* Fold Content */}
      <div className="flex flex-col gap-6 py-8">
        <LatestReleaseSection initialMovies={latestMovies} initialHasMore={hasMoreLatest}>
          <MovieRow title="Popular Now" movies={popular} />
        </LatestReleaseSection>
      </div>
    </div>
  )
}
