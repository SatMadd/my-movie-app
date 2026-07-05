import { Movie, TMDBResponse } from '@/types/tmdb'

const TMDB_API_BASE = 'https://api.themoviedb.org/3'
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p'

async function fetchTMDB<T>(
  path: string,
  searchParams: Record<string, string> = {},
  revalidate = 3600
): Promise<T> {
  const apiKey = process.env.TMDB_API_KEY
  if (!apiKey || apiKey === 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJiY2YxNDgzZmVmZTBmYzY4NTE0ZDZiMmQzMjFlNTQ3ZSIsIm5iZiI6MTc4MzE2NzEzNi4wMDEsInN1YiI6IjZhNDhmODlmNDAyMGRlN2U1OTU4MjhiNiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.XXx25cMEGf2xDpjnEi17vJr_KJldgWTL-VDKDzBmJTg') {
    console.warn('TMDB_API_KEY is not set or is using placeholder.')
    throw new Error('TMDB API Key missing')
  }

  const params = new URLSearchParams({
    api_key: apiKey,
    language: 'en-US',
    ...searchParams,
  })

  const url = `${TMDB_API_BASE}${path}?${params.toString()}`

  try {
    const response = await fetch(url, {
      next: { revalidate },
    })

    if (!response.ok) {
      throw new Error(`TMDB API call failed: ${response.status} ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error(`Error fetching TMDB path ${path}:`, error)
    throw error
  }
}

export function getPosterUrl(path: string | null, size: string = 'w500'): string {
  if (!path) return '/placeholder-poster.png'
  return `${TMDB_IMAGE_BASE}/${size}${path}`
}

export function getBackdropUrl(path: string | null, size: string = 'w1280'): string {
  if (!path) return '/placeholder-backdrop.png'
  return `${TMDB_IMAGE_BASE}/${size}${path}`
}

export async function getTrendingMovies(timeWindow: 'day' | 'week' = 'day'): Promise<Movie[]> {
  const data = await fetchTMDB<TMDBResponse<Movie>>(`/trending/movie/${timeWindow}`)
  return data.results
}

export async function getLatestReleases(page = 1): Promise<TMDBResponse<Movie>> {
  return await fetchTMDB<TMDBResponse<Movie>>('/movie/now_playing', { page: page.toString() })
}

export async function getPopularMovies(): Promise<Movie[]> {
  const data = await fetchTMDB<TMDBResponse<Movie>>('/movie/popular')
  return data.results
}

export async function getMovieDetails(id: number | string): Promise<Movie> {
  // Use append_to_response to minimize round trips
  return await fetchTMDB<Movie>(
    `/movie/${id}`,
    {
      append_to_response: 'credits,reviews,videos,similar',
    },
    86400 // Cache static movie details for 1 day
  )
}

export async function discoverMovies(
  sortBy = 'primary_release_date.desc',
  page = 1
): Promise<TMDBResponse<Movie>> {
  // Get date strings to filter by
  return await fetchTMDB<TMDBResponse<Movie>>(
    '/discover/movie',
    {
      sort_by: sortBy,
      page: page.toString(),
      'vote_count.gte': '50', // Filter out obscure movies with no votes
    },
    1800 // Cache discovery for 30 mins
  )
}

export async function searchMovies(query: string, page = 1): Promise<TMDBResponse<Movie>> {
  if (!query.trim()) {
    return { page: 1, results: [], total_pages: 1, total_results: 0 }
  }
  return await fetchTMDB<TMDBResponse<Movie>>(
    '/search/movie',
    {
      query,
      page: page.toString(),
    },
    1800
  )
}
