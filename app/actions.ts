'use server'

import { getLatestReleases } from '@/lib/tmdb'
import { Movie, TMDBResponse } from '@/types/tmdb'

export async function fetchLatestReleasesAction(page: number): Promise<TMDBResponse<Movie>> {
  return await getLatestReleases(page)
}
