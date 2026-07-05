'use client'

import React, { useState } from 'react'
import { Movie } from '@/types/tmdb'
import MovieRow from './movie-row'

interface PopularNowSectionProps {
  movies: Movie[]
}

const GENRES = [
  { label: 'All Popular', id: null },
  { label: 'Action', id: 28 },
  { label: 'Animation', id: 16 },
  { label: 'Adventure', id: 12 },
  { label: 'Horror', id: 27 },
  { label: 'Documentary', id: 99 },
  { label: 'Romance', id: 10749 },
  { label: 'Kids', id: 10751 },
  { label: 'Comedy', id: 35 },
]

export default function PopularNowSection({ movies }: PopularNowSectionProps) {
  const [selectedGenreId, setSelectedGenreId] = useState<number | null>(null)

  // Filter movies client-side using genre_ids
  const filteredMovies = selectedGenreId
    ? movies.filter((movie) => movie.genre_ids?.includes(selectedGenreId))
    : movies

  return (
    <div className="flex flex-col gap-2">
      {/* Genre Pills Row */}
      <div className="flex gap-2 overflow-x-auto scrollbar-none px-4 md:px-8 py-2 select-none">
        {GENRES.map((genre) => {
          const isActive = selectedGenreId === genre.id
          return (
            <button
              key={genre.label}
              onClick={() => setSelectedGenreId(genre.id)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer whitespace-nowrap select-none ${
                isActive
                  ? 'bg-[#F5F5F3] text-[#101013] font-bold shadow-sm'
                  : 'bg-[#1C1D22] text-[#9A9AA2] hover:text-[#F5F5F3] hover:bg-[#2A2B31]'
              }`}
            >
              {genre.label}
            </button>
          )
        })}
      </div>

      {/* Popular Now Row */}
      <MovieRow
        title="Popular Now"
        movies={filteredMovies}
        seeMoreUrl="/browse?sort=popularity.desc"
      />
    </div>
  )
}
