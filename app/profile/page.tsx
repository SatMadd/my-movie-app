import React from 'react'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/db'
import { getMovieDetails, getPosterUrl } from '@/lib/tmdb'
import Image from 'next/image'
import type { Movie } from '@/types/tmdb'

export const metadata = {
  title: 'My Profile — NontonFilm',
  description: 'Your NontonFilm profile, watchlist stats, and reviews.',
}

// Deterministic avatar color from userId
function getAvatarBgColor(id: string, color?: string | null): string {
  if (color) {
    // Map hex to Tailwind-compatible inline style
    return color
  }
  const colors = ['#E11D2E', '#F5C518', '#3b82f6', '#8b5cf6', '#14b8a6']
  const index = id.charCodeAt(0) % colors.length
  return colors[index]
}

export default async function ProfilePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?next=/profile')
  }

  // Fetch profile, watchlist count, and reviews with movie IDs
  const [profile, watchlistCount, reviews] = await Promise.all([
    prisma.profile.findUnique({ where: { id: user.id } }),
    prisma.watchlistItem.count({ where: { userId: user.id } }),
    prisma.review.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: 'desc' },
    }),
  ])

  if (!profile) {
    // Profile missing — redirect to complete setup or show error
    redirect('/login')
  }

  // Fetch fresh TMDB data for reviewed movies
  const reviewedMovies: Record<number, Movie> = {}
  if (reviews.length > 0) {
    const results = await Promise.allSettled(
      reviews.map((r) => getMovieDetails(r.movieId))
    )
    results.forEach((result: PromiseSettledResult<Movie>, i: number) => {
      if (result.status === 'fulfilled') {
        reviewedMovies[reviews[i].movieId] = result.value
      }
    })
  }

  const avatarBg = getAvatarBgColor(user.id, profile.avatarColor)
  const initials = profile.username.substring(0, 2).toUpperCase()

  return (
    <div className="flex-1 bg-[#0B0B0D] px-4 md:px-8 py-8">
      <div className="max-w-6xl mx-auto flex flex-col gap-8">
        {/* Profile Header */}
        <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 border-b border-[#33343A] pb-8">
          {/* Avatar */}
          <div
            className="w-24 h-24 rounded-full flex items-center justify-center text-3xl font-black text-white select-none border-4 border-[#1A1B1F] shadow-xl flex-shrink-0"
            style={{ backgroundColor: avatarBg }}
          >
            {initials}
          </div>

          {/* Info */}
          <div className="flex flex-col items-center sm:items-start gap-2 text-center sm:text-left">
            <h1 className="text-2xl md:text-3xl font-extrabold text-[#F5F5F3] tracking-tight">
              {profile.username}
            </h1>
            <p className="text-sm text-[#9A9AA2]">{user.email}</p>

            {/* Stats row */}
            <div className="flex items-center gap-6 mt-2">
              <div className="flex flex-col items-center sm:items-start">
                <span className="text-xl font-black text-[#F5C518]">{watchlistCount}</span>
                <span className="text-xs text-[#9A9AA2] font-medium">Watchlisted</span>
              </div>
              <div className="w-px h-8 bg-[#33343A]" />
              <div className="flex flex-col items-center sm:items-start">
                <span className="text-xl font-black text-[#F5C518]">{reviews.length}</span>
                <span className="text-xs text-[#9A9AA2] font-medium">Reviews</span>
              </div>
              <div className="w-px h-8 bg-[#33343A]" />
              <div className="flex flex-col items-center sm:items-start">
                <span className="text-xl font-black text-[#F5C518]">
                  {reviews.length > 0
                    ? (reviews.reduce((s: number, r) => s + r.rating, 0) / reviews.length).toFixed(1)
                    : '—'}
                </span>
                <span className="text-xs text-[#9A9AA2] font-medium">Avg Rating</span>
              </div>
            </div>
          </div>

          {/* Watchlist Quick-Link */}
          <div className="sm:ml-auto">
            <Link
              href="/watchlist"
              className="inline-flex items-center gap-2 bg-[#1A1B1F] border border-[#33343A] hover:bg-[#26272C] hover:border-[#9A9AA2] text-[#F5F5F3] font-bold text-sm px-5 py-2.5 rounded transition-all"
            >
              ❤️ View Watchlist
            </Link>
          </div>
        </div>

        {/* My Reviews Section */}
        <div className="flex flex-col gap-5">
          <h2 className="text-xl font-bold text-[#F5F5F3] tracking-tight border-l-4 border-[#E11D2E] pl-3">
            My Reviews
          </h2>

          {reviews.length > 0 ? (
            <div className="flex flex-col gap-4">
              {reviews.map((review) => {
                const movie = reviewedMovies[review.movieId]
                return (
                  <div
                    key={review.id}
                    className="flex gap-4 bg-[#1A1B1F] border border-[#33343A] rounded-lg p-4 hover:border-[#26272C] transition-all"
                  >
                    {/* Movie Poster thumbnail */}
                    <Link href={`/movie/${review.movieId}`} className="flex-shrink-0 group">
                      <div className="relative w-14 h-20 rounded overflow-hidden border border-[#33343A] bg-[#0B0B0D] group-hover:scale-[1.03] transition-transform">
                        {movie?.poster_path ? (
                          <Image
                            src={getPosterUrl(movie.poster_path, 'w185')}
                            alt={movie?.title || 'Movie'}
                            fill
                            sizes="56px"
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-lg">🎬</div>
                        )}
                      </div>
                    </Link>

                    {/* Review content */}
                    <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <Link
                          href={`/movie/${review.movieId}`}
                          className="text-sm font-bold text-[#F5F5F3] hover:text-[#F5C518] transition-colors line-clamp-1"
                        >
                          {movie?.title || `Movie #${review.movieId}`}
                        </Link>
                        {/* Rating chip */}
                        <span className="flex-shrink-0 bg-[#F5C518]/10 border border-[#F5C518]/20 text-[#F5C518] text-xs font-bold px-2 py-0.5 rounded">
                          ⭐ {review.rating}/10
                        </span>
                      </div>

                      {review.body && (
                        <p className="text-xs text-[#9A9AA2] line-clamp-2 leading-relaxed">
                          {review.body}
                        </p>
                      )}

                      <div className="flex items-center justify-between mt-auto">
                        <span className="text-[10px] text-[#9A9AA2]">
                          {new Date(review.updatedAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                        <Link
                          href={`/movie/${review.movieId}`}
                          className="text-[10px] text-[#F5C518] hover:underline font-semibold"
                        >
                          Edit Review →
                        </Link>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center bg-[#1A1B1F] border border-dashed border-[#33343A] rounded-xl p-8">
              <span className="text-5xl mb-3">✍️</span>
              <h3 className="text-lg font-bold text-[#F5F5F3]">No Reviews Yet</h3>
              <p className="text-sm text-[#9A9AA2] max-w-xs mt-2">
                Share your thoughts on movies you've watched. Head to any movie page to write your
                first review.
              </p>
              <Link
                href="/browse"
                className="mt-5 bg-[#E11D2E] text-white hover:bg-[#c11726] font-bold text-sm px-6 py-2.5 rounded transition-colors"
              >
                Find Movies to Review
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
