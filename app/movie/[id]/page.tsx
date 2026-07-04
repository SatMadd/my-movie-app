import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getMovieDetails, getBackdropUrl, getPosterUrl } from '@/lib/tmdb'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/db'
import RatingBadge from '@/components/rating-badge'
import WatchlistButton from '@/components/watchlist-button'
import ReviewForm from '@/components/review-form'
import ReviewCard from '@/components/review-card'
import MovieCard from '@/components/movie-card'

/** Exact type for review rows returned by prisma.review.findMany({ include: { user: true } }) */
type ReviewWithUser = {
  id: number          // Int in schema
  userId: string
  movieId: number
  rating: number
  body: string | null
  createdAt: Date
  updatedAt: Date
  user: {
    id: string
    username: string
    avatarColor: string | null
    createdAt: Date
  }
}

interface MoviePageProps {
  params: Promise<{
    id: string
  }>
}

export default async function MovieDetailPage(props: MoviePageProps) {
  // Await page params in Next.js 16 App Router
  const { id } = await props.params
  const movieId = parseInt(id, 10)

  if (isNaN(movieId)) {
    return notFound()
  }

  // Fetch movie details from TMDB
  let movie
  try {
    movie = await getMovieDetails(movieId)
  } catch (error) {
    console.error('Failed to fetch movie details from TMDB:', error)
    return notFound()
  }

  // Fetch Supabase Auth User
  let user = null
  let existingReview = null

  try {
    const supabase = await createClient()
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser()
    if (authUser) {
      user = authUser
      // Fetch user's existing review if any
      const review = await prisma.review.findUnique({
        where: {
          userId_movieId: {
            userId: authUser.id,
            movieId: movieId,
          },
        },
      })
      if (review) {
        existingReview = {
          rating: review.rating,
          body: review.body,
        }
      }
    }
  } catch (error) {
    console.error('Auth check in movie details failed:', error)
  }

  // Fetch NontonFilm Community Reviews from Prisma Database
  const dbReviews: ReviewWithUser[] = await prisma.review.findMany({
    where: {
      movieId: movieId,
    },
    include: {
      user: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  // Calculate NontonFilm community average rating
  const communityAverage =
    dbReviews.length > 0
      ? dbReviews.reduce((sum: number, r: ReviewWithUser) => sum + r.rating, 0) / dbReviews.length
      : null

  // Format runtime to hours and minutes
  const formatRuntime = (minutes?: number) => {
    if (!minutes) return 'N/A'
    const hrs = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`
  }

  const cast = movie.credits?.cast.slice(0, 10) || []
  const similar = movie.similar?.results.slice(0, 5) || []

  return (
    <div className="flex flex-col flex-1 bg-[#0B0B0D]">
      {/* Backdrop Hero block */}
      <section className="relative w-full min-h-[40vh] md:h-[60vh] flex items-end">
        {/* Backdrop Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src={getBackdropUrl(movie.backdrop_path, 'original')}
            alt={movie.title}
            fill
            priority
            className="object-cover opacity-30 filter blur-[1px]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0D] via-[#0B0B0D]/50 to-transparent" />
        </div>

        {/* Header content overlay */}
        <div className="relative z-10 w-full max-w-6xl mx-auto px-4 md:px-8 pb-8 flex flex-col md:flex-row items-center md:items-end gap-6 md:gap-8">
          {/* Movie Poster */}
          <div className="relative w-[180px] md:w-[220px] aspect-[2/3] rounded-lg overflow-hidden border border-[#33343A] shadow-2xl flex-shrink-0 bg-[#1A1B1F]">
            {movie.poster_path ? (
              <Image
                src={getPosterUrl(movie.poster_path, 'w500')}
                alt={movie.title}
                fill
                sizes="220px"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center p-4 text-center">
                <span className="text-5xl">🎬</span>
              </div>
            )}
          </div>

          {/* Details details */}
          <div className="flex-1 flex flex-col gap-3 text-center md:text-left">
            <h1 className="text-3xl md:text-5xl font-black text-[#F5F5F3] tracking-tight leading-tight">
              {movie.title}
            </h1>

            {movie.tagline && (
              <p className="text-sm md:text-base italic text-[#9A9AA2] font-medium">
                "{movie.tagline}"
              </p>
            )}

            {/* Metadata row */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-4 gap-y-1.5 text-xs font-semibold text-[#9A9AA2]">
              <span>
                {movie.release_date
                  ? new Date(movie.release_date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })
                  : 'N/A'}
              </span>
              <span className="hidden sm:inline">•</span>
              <span>{formatRuntime(movie.runtime)}</span>
              <span className="hidden sm:inline">•</span>
              <div className="flex gap-1">
                {movie.genres?.map((g) => (
                  <span
                    key={g.id}
                    className="bg-[#1A1B1F] border border-[#33343A] px-2 py-0.5 rounded text-[10px] text-[#F5F5F3]"
                  >
                    {g.name}
                  </span>
                ))}
              </div>
            </div>

            {/* Actions & Rating badges */}
            <div className="mt-4 flex flex-wrap items-center justify-center md:justify-start gap-6">
              <WatchlistButton movieId={movie.id} userId={user?.id} />

              <div className="flex items-center gap-4 border-l border-[#33343A] pl-6">
                {/* TMDB Badge */}
                <div className="flex items-center gap-2">
                  <RatingBadge rating={movie.vote_average || 0} variant="tmdb" size="md" />
                  <div className="text-left leading-tight">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#9A9AA2]">
                      TMDB
                    </p>
                    <p className="text-[10px] text-[#9A9AA2]">Rating</p>
                  </div>
                </div>

                {/* Community Badge */}
                <div className="flex items-center gap-2">
                  <RatingBadge
                    rating={communityAverage || 0}
                    variant="community"
                    size="md"
                  />
                  <div className="text-left leading-tight">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#9A9AA2]">
                      NontonFilm
                    </p>
                    <p className="text-[10px] text-[#9A9AA2]">Community</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Info Section */}
      <section className="w-full max-w-6xl mx-auto px-4 md:px-8 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (Overview, Cast, Similar) */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          {/* Overview */}
          <div className="flex flex-col gap-3">
            <h2 className="text-lg md:text-xl font-bold text-[#F5F5F3] tracking-tight border-l-4 border-[#E11D2E] pl-3">
              Overview
            </h2>
            <p className="text-sm md:text-base text-[#F5F5F3] leading-relaxed whitespace-pre-wrap">
              {movie.overview || 'No overview available for this movie.'}
            </p>
          </div>

          {/* Cast */}
          {cast.length > 0 && (
            <div className="flex flex-col gap-4">
              <h2 className="text-lg md:text-xl font-bold text-[#F5F5F3] tracking-tight border-l-4 border-[#E11D2E] pl-3">
                Top Cast
              </h2>
              <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none snap-x">
                {cast.map((actor) => (
                  <div
                    key={actor.id}
                    className="w-[100px] flex-shrink-0 flex flex-col items-center text-center snap-start"
                  >
                    <div className="relative w-16 h-16 rounded-full overflow-hidden border border-[#33343A] bg-[#1A1B1F] mb-2">
                      {actor.profile_path ? (
                        <Image
                          src={getPosterUrl(actor.profile_path, 'w185')}
                          alt={actor.name}
                          fill
                          sizes="64px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xl">
                          👤
                        </div>
                      )}
                    </div>
                    <span className="line-clamp-1 text-[11px] font-bold text-[#F5F5F3]">
                      {actor.name}
                    </span>
                    <span className="line-clamp-1 text-[10px] text-[#9A9AA2]">
                      {actor.character}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Similar Movies */}
          {similar.length > 0 && (
            <div className="flex flex-col gap-4">
              <h2 className="text-lg md:text-xl font-bold text-[#F5F5F3] tracking-tight border-l-4 border-[#E11D2E] pl-3">
                Similar Movies
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                {similar.map((simMovie) => (
                  <MovieCard key={simMovie.id} movie={simMovie} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column (Community Reviews) */}
        <div className="flex flex-col gap-6 lg:border-l lg:border-[#33343A] lg:pl-8">
          <h2 className="text-lg md:text-xl font-bold text-[#F5F5F3] tracking-tight border-l-4 border-[#E11D2E] pl-3">
            Community Reviews
          </h2>

          {/* Add/Edit Review Form */}
          <ReviewForm
            movieId={movieId}
            userId={user?.id}
            existingReview={existingReview || undefined}
          />

          {/* Review List */}
          <div className="flex flex-col gap-4 mt-2">
            {dbReviews.length > 0 ? (
              dbReviews.map((rev: ReviewWithUser) => (
                <ReviewCard
                  key={rev.id}
                  username={rev.user.username}
                  rating={rev.rating}
                  body={rev.body || ''}
                  createdAt={rev.createdAt}
                  userId={rev.userId}
                />
              ))
            ) : (
              <div className="text-center py-8 bg-[#1A1B1F]/30 border border-dashed border-[#33343A] rounded-lg">
                <p className="text-xs text-[#9A9AA2]">No community reviews yet.</p>
                <p className="text-[10px] text-[#9A9AA2] mt-1">Be the first to share your thoughts!</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
