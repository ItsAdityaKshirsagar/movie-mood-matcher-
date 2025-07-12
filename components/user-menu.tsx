"use client"

import { useState, useEffect } from "react"
import { Heart, History, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { movies } from "@/lib/movie-data"

interface SavedMovie {
  id: number
  title: string
  year: number
  genres: string[]
  savedAt: string
}

interface SearchHistory {
  query: string
  timestamp: string
  type: "genre" | "search"
}

export function UserMenu() {
  const [savedMovies, setSavedMovies] = useState<SavedMovie[]>([])
  const [searchHistory, setSearchHistory] = useState<SearchHistory[]>([])

  // Load saved data from localStorage on component mount
  useEffect(() => {
    const saved = localStorage.getItem("savedMovies")
    const history = localStorage.getItem("searchHistory")

    if (saved) {
      setSavedMovies(JSON.parse(saved))
    }
    if (history) {
      setSearchHistory(JSON.parse(history))
    }
  }, [])

  // Save to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem("savedMovies", JSON.stringify(savedMovies))
  }, [savedMovies])

  useEffect(() => {
    localStorage.setItem("searchHistory", JSON.stringify(searchHistory))
  }, [searchHistory])

  const addToSaved = (movieId: number) => {
    const movie = movies.find((m) => m.id === movieId)
    if (movie && !savedMovies.find((m) => m.id === movieId)) {
      const savedMovie: SavedMovie = {
        id: movie.id,
        title: movie.title,
        year: movie.year,
        genres: movie.genres,
        savedAt: new Date().toISOString(),
      }
      setSavedMovies((prev) => [savedMovie, ...prev])
    }
  }

  const removeFromSaved = (movieId: number) => {
    setSavedMovies((prev) => prev.filter((m) => m.id !== movieId))
  }

  const addToHistory = (query: string, type: "genre" | "search") => {
    const historyItem: SearchHistory = {
      query,
      timestamp: new Date().toISOString(),
      type,
    }
    setSearchHistory((prev) => {
      // Remove duplicate if exists
      const filtered = prev.filter((item) => item.query !== query || item.type !== type)
      // Add new item at the beginning and limit to 10 items
      return [historyItem, ...filtered].slice(0, 10)
    })
  }

  const clearHistory = () => {
    setSearchHistory([])
  }

  const clearSaved = () => {
    setSavedMovies([])
  }

  // Expose functions globally so other components can use them
  useEffect(() => {
    ;(window as any).addToSaved = addToSaved
    ;(window as any).removeFromSaved = removeFromSaved
    ;(window as any).addToHistory = addToHistory
  }, [])

  return (
    <div className="flex items-center gap-2">
      {/* Saved Movies */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" className="relative">
            <Heart className="h-4 w-4" />
            {savedMovies.length > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
              >
                {savedMovies.length}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-80">
          <DropdownMenuLabel className="flex items-center justify-between">
            Saved Movies
            {savedMovies.length > 0 && (
              <Button variant="ghost" size="sm" onClick={clearSaved} className="h-6 px-2 text-xs">
                Clear All
              </Button>
            )}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <ScrollArea className="h-64">
            {savedMovies.length === 0 ? (
              <div className="p-4 text-center text-sm text-muted-foreground">No saved movies yet</div>
            ) : (
              savedMovies.map((movie) => (
                <DropdownMenuItem key={movie.id} className="flex items-start justify-between p-3">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{movie.title}</div>
                    <div className="text-xs text-muted-foreground">{movie.year}</div>
                    <div className="flex gap-1 mt-1">
                      {movie.genres.slice(0, 2).map((genre) => (
                        <Badge key={genre} variant="outline" className="text-xs">
                          {genre}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      removeFromSaved(movie.id)
                    }}
                    className="h-6 w-6 p-0 ml-2"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </DropdownMenuItem>
              ))
            )}
          </ScrollArea>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Search History */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" className="relative">
            <History className="h-4 w-4" />
            {searchHistory.length > 0 && (
              <Badge
                variant="secondary"
                className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
              >
                {searchHistory.length}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-72">
          <DropdownMenuLabel className="flex items-center justify-between">
            Search History
            {searchHistory.length > 0 && (
              <Button variant="ghost" size="sm" onClick={clearHistory} className="h-6 px-2 text-xs">
                Clear All
              </Button>
            )}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <ScrollArea className="h-64">
            {searchHistory.length === 0 ? (
              <div className="p-4 text-center text-sm text-muted-foreground">No search history yet</div>
            ) : (
              searchHistory.map((item, index) => (
                <DropdownMenuItem
                  key={index}
                  className="flex items-center justify-between p-3 cursor-pointer"
                  onClick={() => {
                    if (item.type === "genre") {
                      window.location.href = `/?genre=${item.query}`
                    }
                  }}
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate capitalize">{item.query}</div>
                    <div className="text-xs text-muted-foreground">
                      {item.type === "genre" ? "Genre filter" : "Search"} •{" "}
                      {new Date(item.timestamp).toLocaleDateString()}
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs ml-2">
                    {item.type}
                  </Badge>
                </DropdownMenuItem>
              ))
            )}
          </ScrollArea>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
