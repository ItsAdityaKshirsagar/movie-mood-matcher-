export interface TMDBMovie {
  id: number
  title: string
  overview: string
  poster_path: string | null
  backdrop_path: string | null
  release_date: string
  vote_average: number
  genre_ids: number[]
  runtime?: number
}

export interface TMDBGenre {
  id: number
  name: string
}

export interface TMDBMovieDetails extends TMDBMovie {
  runtime: number
  genres: TMDBGenre[]
  imdb_id: string
}

const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY
const TMDB_BASE_URL = process.env.NEXT_PUBLIC_TMDB_BASE_URL
const TMDB_IMAGE_BASE_URL = process.env.NEXT_PUBLIC_TMDB_IMAGE_BASE_URL

console.log(TMDB_API_KEY, TMDB_BASE_URL, TMDB_IMAGE_BASE_URL)

export const tmdbService = {
  // Get popular movies
  async getPopularMovies(page = 1): Promise<{ results: TMDBMovie[]; total_pages: number }> {
    const response = await fetch(`${TMDB_BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}&page=${page}`)
    return response.json()
  },

  // Get movies by genre
  async getMoviesByGenre(genreId: number, page = 1): Promise<{ results: TMDBMovie[]; total_pages: number }> {
    const response = await fetch(
      `${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&with_genres=${genreId}&page=${page}&sort_by=popularity.desc`,
    )
    return response.json()
  },

  // Get movie details
  async getMovieDetails(movieId: number): Promise<TMDBMovieDetails> {
    const response = await fetch(`${TMDB_BASE_URL}/movie/${movieId}?api_key=${TMDB_API_KEY}`)
    return response.json()
  },

  // Search movies
  async searchMovies(query: string, page = 1): Promise<{ results: TMDBMovie[]; total_pages: number }> {
    const response = await fetch(
      `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&page=${page}`,
    )
    return response.json()
  },

  // Get genres
  async getGenres(): Promise<{ genres: TMDBGenre[] }> {
    const response = await fetch(`${TMDB_BASE_URL}/genre/movie/list?api_key=${TMDB_API_KEY}`)
    return response.json()
  },

  // Get poster URL
  getPosterUrl(posterPath: string | null): string {
    if (!posterPath) return "/placeholder.svg?height=600&width=400"
    return `${TMDB_IMAGE_BASE_URL}${posterPath}`
  },

  // Get backdrop URL
  getBackdropUrl(backdropPath: string | null): string {
    if (!backdropPath) return "/placeholder.svg?height=300&width=500"
    return `https://image.tmdb.org/t/p/w1280${backdropPath}`
  },

  // Convert runtime to readable format
  formatRuntime(minutes: number): string {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  },
}
