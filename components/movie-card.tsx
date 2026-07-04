import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Movie } from '@/types/tmdb'
import { getPosterUrl } from '@/lib/tmdb'

interface MovieCardProps {
  movie: Movie
}

export default function MovieCard({ movie }: MovieCardProps) {
  const releaseYear = movie.release_date
    ? new Date(movie.release_date).getFullYear()
    : 'N/A'

  return (
    <Link href={`/movie/${movie.id}`} className="group block">
      <div className="relative aspect-[2/3] w-full overflow-hidden rounded-lg bg-[#1A1B1F] border border-[#33343A] shadow-md transition-all duration-300 ease-out group-hover:scale-[1.03] group-hover:shadow-[0_8px_30px_rgb(0,0,0,0.5)] group-hover:border-[#26272C]">
        {movie.poster_path ? (
          <Image
            src={getPosterUrl(movie.poster_path, 'w500')}
            alt={movie.title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
            className="object-cover"
            priority={false}
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center p-4 text-center">
            <span className="text-4xl">🎬</span>
            <span className="mt-2 text-xs font-semibold text-[#9A9AA2]">No Poster Available</span>
          </div>
        )}

        {/* Rating Badge Overlay */}
        <div className="absolute top-2 right-2 flex items-center justify-center rounded bg-black/75 px-1.5 py-0.5 text-xs font-bold text-[#F5C518] shadow">
          ⭐ {movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A'}
        </div>
      </div>

      <div className="mt-2">
        <h3 className="line-clamp-1 text-sm font-semibold text-[#F5F5F3] group-hover:text-[#F5C518] transition-colors duration-200">
          {movie.title}
        </h3>
        <p className="text-xs text-[#9A9AA2]">{releaseYear}</p>
      </div>
    </Link>
  )
}
