import { MovieFilter } from "@/components/movie-filter"
import { MovieGrid } from "@/components/movie-grid"
import { ThemeToggle } from "@/components/theme-toggle"
import { UserMenu } from "@/components/user-menu"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <header className="sticky top-0 z-10 border-b border-slate-800 bg-slate-950/95 backdrop-blur supports-[backdrop-filter]:bg-slate-950/60">
        <div className="container flex h-16 items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight text-slate-100">Cinema Vault</h1>
          <div className="flex items-center gap-4">
            <UserMenu />
            <ThemeToggle />
          </div>
        </div>
      </header>
      <main className="container py-8">
        <section className="mb-10">
          <h2 className="mb-4 text-4xl font-bold tracking-tight text-slate-100">Discover Cinematic Excellence</h2>
          <p className="text-slate-400 text-lg leading-relaxed max-w-3xl">
            Find your perfect movie match based on your mood and preferences.
          </p>
        </section>
        <MovieFilter />
        <MovieGrid />
      </main>
      <footer className="border-t border-slate-800 py-8 bg-slate-950/50">
        <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-center text-sm text-slate-400">
            &copy; {new Date().getFullYear()} Cinema Vault. All rights reserved.
          </p>
          <div className="flex flex-col items-center md:items-end gap-1">
            <p className="text-center text-sm text-slate-400">Developed by ADITYA KSHIRASAGAR</p>
            <p className="text-center text-sm text-slate-400">Movie data provided by IMDb</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
