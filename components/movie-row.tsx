import React from 'react'
import { Movie } from '@/types/tmdb'
import MovieCard from './movie-card'

interface MovieRowProps {
  title: string
  movies: Movie[]
}

export default function MovieRow({ title, movies }: MovieRowProps) {
  if (!movies || movies.length === 0) return null

  return (
    <div className="py-6">
      <div className="flex items-center justify-between mb-4 px-4 md:px-8">
        <h2 className="text-xl md:text-2xl font-extrabold tracking-tight text-[#F5F5F3] border-l-4 border-[#E11D2E] pl-3">
          {title}
        </h2>
      </div>

      {/* Horizontally scrollable row with snapping points */}
      <div className="relative">
        <div className="flex gap-4 overflow-x-auto scrollbar-none px-4 md:px-8 pb-4 scroll-smooth snap-x snap-mandatory">
          {movies.map((movie) => (
            <div key={movie.id} className="w-[160px] sm:w-[180px] md:w-[200px] flex-shrink-0 snap-start">
              <MovieCard movie={movie} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
