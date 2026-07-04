export interface Movie {
  id: number
  title: string
  original_title: string
  overview: string
  poster_path: string | null
  backdrop_path: string | null
  release_date: string
  vote_average: number
  vote_count: number
  runtime?: number
  tagline?: string
  genres?: Genre[]
  credits?: {
    cast: CastMember[]
    crew: CrewMember[]
  }
  videos?: {
    results: Video[]
  }
  similar?: {
    results: Movie[]
  }
  reviews?: {
    results: TMDBReview[]
  }
}

export interface Genre {
  id: number
  name: string
}

export interface CastMember {
  id: number
  name: string
  character: string
  profile_path: string | null
  order: number
}

export interface CrewMember {
  id: number
  name: string
  job: string
  department: string
}

export interface Video {
  id: string
  key: string
  name: string
  site: string
  type: string
}

export interface TMDBReview {
  id: string
  author: string
  content: string
  created_at: string
  url: string
}

export interface TMDBResponse<T> {
  page: number
  results: T[]
  total_pages: number
  total_results: number
}
