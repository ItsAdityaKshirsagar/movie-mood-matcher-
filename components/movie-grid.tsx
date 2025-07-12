"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Image from "next/image"
import { Star, Calendar, Bookmark, Heart, Search } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { tmdbService, type TMDBMovie } from "@/lib/tmdb"
import { GENRE_OPTIONS } from "@/lib/genre-mapping"

export function MovieGrid() {
  const searchParams = useSearchParams()
  const [movies, setMovies] = useState<TMDBMovie[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [savedMovies, setSavedMovies] = useState<number[]>([])

  const genre = searchParams.get("genre")
  const searchQuery = searchParams.get("search")

  // Load saved movies from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("savedMovies")
    if (saved) {
      const savedData = JSON.parse(saved)
      setSavedMovies(savedData.map((movie: any) => movie.id))
    }
  }, [])

  useEffect(() => {
    const fetchMovies = async () => {
      setIsLoading(true)
      try {
        let result

        if (searchQuery) {
          // Search for movies
          result = await tmdbService.searchMovies(searchQuery)
        } else if (genre) {
          // Filter by genre
          const genreOption = GENRE_OPTIONS.find((g) => g.value === genre)
          if (genreOption) {
            result = await tmdbService.getMoviesByGenre(genreOption.tmdbId)
          } else {
            result = await tmdbService.getPopularMovies()
          }
        } else {
          // Default: popular movies
          result = await tmdbService.getPopularMovies()
        }

        setMovies(result.results.slice(0, 20)) // Limit to 20 movies for better performance
      } catch (error) {
        console.error("Error fetching movies:", error)
        setMovies([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchMovies()
  }, [genre, searchQuery])

  const handleSaveMovie = (movie: TMDBMovie) => {
    const savedMovie = {
      id: movie.id,
      title: movie.title,
      year: new Date(movie.release_date).getFullYear(),
      genres: movie.genre_ids.map((id) => {
        const genre = GENRE_OPTIONS.find((g) => g.tmdbId === id)
        return genre ? genre.label : "Unknown"
      }),
      savedAt: new Date().toISOString(),
    }

    if ((window as any).addToSaved) {
      ;(window as any).addToSaved(savedMovie)
    }

    setSavedMovies((prev) => [...prev, movie.id])
  }

  const isMovieSaved = (movieId: number) => savedMovies.includes(movieId)

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array(12)
          .fill(0)
          .map((_, i) => (
            <Card key={i} className="overflow-hidden border-slate-800 bg-slate-900/50">
              <div className="aspect-[2/3] relative">
                <Skeleton className="h-full w-full bg-slate-700" />
              </div>
              <CardHeader>
                <Skeleton className="h-6 w-3/4 bg-slate-700" />
                <Skeleton className="h-4 w-full bg-slate-700" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full bg-slate-700" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-10 w-full bg-slate-700" />
              </CardFooter>
            </Card>
          ))}
      </div>
    )
  }

  if (movies.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-slate-800 border-dashed p-12 text-center bg-slate-900/30">
        <Search className="h-12 w-12 text-slate-600 mb-4" />
        <h3 className="mb-2 text-xl font-semibold text-slate-200">
          {searchQuery ? `No results found for "${searchQuery}"` : "No movies found"}
        </h3>
        <p className="mb-6 text-slate-400">
          {searchQuery
            ? "Try searching with different keywords or browse by genre"
            : "Try adjusting your filters to find more movies"}
        </p>
        <Button onClick={() => (window.location.href = "/")} className="bg-slate-700 hover:bg-slate-600">
          {searchQuery ? "Clear Search" : "Clear Filters"}
        </Button>
      </div>
    )
  }

  return (
    <div>
      {/* Results Header */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-slate-200">
          {searchQuery
            ? `Search results for "${searchQuery}"`
            : genre
              ? `${GENRE_OPTIONS.find((g) => g.value === genre)?.label} Movies`
              : "Popular Movies"}
        </h3>
        <p className="text-sm text-slate-400">
          Showing {movies.length} movie{movies.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Movie Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {movies.map((movie) => (
          <Card
            key={movie.id}
            className="overflow-hidden flex flex-col border-slate-800 bg-slate-900/50 hover:bg-slate-900/70 transition-all duration-300 hover:border-slate-700 group"
          >
            {/* Movie Poster */}
            <div className="aspect-[2/3] relative overflow-hidden">
              <Image
                src={tmdbService.getPosterUrl(movie.poster_path) || "/placeholder.svg"}
                alt={movie.title}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

              {/* Rating Badge */}
              <div className="absolute top-2 right-2 flex items-center bg-black/70 backdrop-blur-sm rounded-full px-2 py-1">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 mr-1" />
                <span className="text-xs font-medium text-white">{movie.vote_average.toFixed(1)}</span>
              </div>

              {/* Save Button */}
              <div className="absolute top-2 left-2">
                <Button
                  size="sm"
                  variant="ghost"
                  className={`h-8 w-8 p-0 rounded-full backdrop-blur-sm ${
                    isMovieSaved(movie.id) ? "bg-red-500/80 hover:bg-red-600/80" : "bg-black/50 hover:bg-black/70"
                  }`}
                  onClick={() => handleSaveMovie(movie)}
                  disabled={isMovieSaved(movie.id)}
                >
                  <Heart className={`h-4 w-4 ${isMovieSaved(movie.id) ? "fill-white text-white" : "text-white"}`} />
                </Button>
              </div>
            </div>

            <CardHeader className="pb-3">
              <CardTitle className="line-clamp-2 text-slate-100 text-lg font-semibold leading-tight">
                {movie.title}
              </CardTitle>
              <CardDescription className="flex items-center gap-4 text-slate-400">
                <div className="flex items-center">
                  <Calendar className="mr-1 h-3 w-3" />
                  {new Date(movie.release_date).getFullYear()}
                </div>
              </CardDescription>
            </CardHeader>

            <CardContent className="flex-grow">
              <p className="text-sm text-slate-400 leading-relaxed line-clamp-3 mb-4">{movie.overview}</p>

              {/* Genre badges */}
              <div className="flex flex-wrap gap-1">
                {movie.genre_ids.slice(0, 3).map((genreId) => {
                  const genreOption = GENRE_OPTIONS.find((g) => g.tmdbId === genreId)
                  if (!genreOption) return null

                  return (
                    <Badge
                      key={genreId}
                      variant={genreOption.value === genre ? "default" : "outline"}
                      className="text-xs"
                    >
                      {genreOption.label}
                    </Badge>
                  )
                })}
              </div>
            </CardContent>

            <CardFooter className="pt-4">
              <Button
                onClick={() => handleSaveMovie(movie)}
                className={`w-full transition-colors ${
                  isMovieSaved(movie.id)
                    ? "bg-green-600 hover:bg-green-700 text-white"
                    : "bg-slate-700 hover:bg-slate-600 text-slate-100"
                }`}
                disabled={isMovieSaved(movie.id)}
              >
                <Bookmark className="mr-2 h-4 w-4" />
                {isMovieSaved(movie.id) ? "Saved" : "Save Movie"}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
