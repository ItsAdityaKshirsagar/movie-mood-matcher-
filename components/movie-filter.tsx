"use client"

import type React from "react"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Check, ChevronsUpDown, Search, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { GENRE_OPTIONS } from "@/lib/genre-mapping"

export function MovieFilter() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [openGenre, setOpenGenre] = useState(false)
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "")

  const currentGenre = searchParams.get("genre") || ""
  const currentSearch = searchParams.get("search") || ""
  const selectedGenre = GENRE_OPTIONS.find((genre) => genre.value === currentGenre)

  const handleFilterChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())

    if (value) {
      params.set("genre", value)
      // Clear search when filtering by genre
      params.delete("search")
      setSearchQuery("")
      // Add to search history
      if ((window as any).addToHistory) {
        ;(window as any).addToHistory(value, "genre")
      }
    } else {
      params.delete("genre")
    }

    router.push(`/?${params.toString()}`)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams(searchParams.toString())

    if (searchQuery.trim()) {
      params.set("search", searchQuery.trim())
      // Clear genre filter when searching
      params.delete("genre")
      // Add to search history
      if ((window as any).addToHistory) {
        ;(window as any).addToHistory(searchQuery.trim(), "search")
      }
    } else {
      params.delete("search")
    }

    router.push(`/?${params.toString()}`)
  }

  const clearSearch = () => {
    setSearchQuery("")
    const params = new URLSearchParams(searchParams.toString())
    params.delete("search")
    router.push(`/?${params.toString()}`)
  }

  const clearAllFilters = () => {
    setSearchQuery("")
    router.push("/")
  }

  return (
    <div className="mb-8 space-y-6">
      {/* Search Bar */}
      <div className="w-full max-w-2xl">
        <form onSubmit={handleSearch} className="relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              type="text"
              placeholder="Search for movies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-10 h-12 text-base bg-slate-900/50 border-slate-700 focus:border-slate-500 text-slate-100 placeholder:text-slate-400"
            />
            {searchQuery && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={clearSearch}
                className="absolute right-2 top-1/2 h-6 w-6 p-0 -translate-y-1/2 text-slate-400 hover:text-slate-200"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          <Button type="submit" className="sr-only">
            Search
          </Button>
        </form>

        {/* Active Search/Filter Indicators */}
        {(currentSearch || currentGenre) && (
          <div className="flex items-center gap-2 mt-3">
            <span className="text-sm text-slate-400">Active filters:</span>
            {currentSearch && (
              <div className="flex items-center gap-1 bg-blue-600/20 text-blue-300 px-2 py-1 rounded-md text-sm">
                <Search className="h-3 w-3" />
                Search: "{currentSearch}"
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearSearch}
                  className="h-4 w-4 p-0 ml-1 text-blue-300 hover:text-blue-100"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            )}
            {currentGenre && (
              <div className="flex items-center gap-1 bg-purple-600/20 text-purple-300 px-2 py-1 rounded-md text-sm">
                Genre: {selectedGenre?.label}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleFilterChange("")}
                  className="h-4 w-4 p-0 ml-1 text-purple-300 hover:text-purple-100"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            )}
            <Button variant="ghost" size="sm" onClick={clearAllFilters} className="text-slate-400 hover:text-slate-200">
              Clear all
            </Button>
          </div>
        )}
      </div>

      {/* Existing Filter Tabs */}
      <Tabs defaultValue="filters" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="filters">Filter by Genre</TabsTrigger>
          <TabsTrigger value="recommendations">Popular Now</TabsTrigger>
        </TabsList>
        <TabsContent value="filters" className="space-y-4 py-4">
          <div className="flex flex-wrap gap-4">
            <Popover open={openGenre} onOpenChange={setOpenGenre}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openGenre}
                  className="w-[200px] justify-between"
                  disabled={!!currentSearch}
                >
                  {selectedGenre ? selectedGenre.label : "Select Genre"}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[200px] p-0">
                <Command>
                  <CommandInput placeholder="Search genre..." />
                  <CommandList>
                    <CommandEmpty>No genre found.</CommandEmpty>
                    <CommandGroup>
                      {GENRE_OPTIONS.map((genre) => (
                        <CommandItem
                          key={genre.value}
                          value={genre.value}
                          onSelect={() => {
                            handleFilterChange(genre.value === currentGenre ? "" : genre.value)
                            setOpenGenre(false)
                          }}
                        >
                          <Check
                            className={cn("mr-2 h-4 w-4", currentGenre === genre.value ? "opacity-100" : "opacity-0")}
                          />
                          {genre.label}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>

            {currentSearch && (
              <p className="text-sm text-slate-400 flex items-center">Genre filtering is disabled while searching</p>
            )}
          </div>
        </TabsContent>
        <TabsContent value="recommendations" className="py-4">
          <div className="rounded-lg border border-slate-800 p-4 bg-slate-900/30">
            <h3 className="mb-2 font-medium text-slate-200">Trending Movies</h3>
            <p className="text-sm text-slate-400">
              Discover the most popular movies right now from The Movie Database.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {GENRE_OPTIONS.slice(0, 5).map((genre) => (
                <Button
                  key={genre.value}
                  variant="outline"
                  size="sm"
                  onClick={() => handleFilterChange(genre.value)}
                  className="text-xs"
                  disabled={!!currentSearch}
                >
                  {genre.label}
                </Button>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
