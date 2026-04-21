import React, { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Search from "./components/Search";
import Spinner from "./components/Spinner";
import MovieCard from "./components/MovieCard";
import Filters from "./components/Filters";
import { useDebounce } from "react-use";
import { getTrendingMovies, updateSearchCount } from "./appwrite";
import { Bookmark, LayoutGrid, TrendingUp } from "lucide-react";

const API_BASE_URL = "https://api.themoviedb.org/3";
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const API_OPTIONS = {
  method: "GET",
  headers: {
    accept: "application/json",
    Authorization: `Bearer ${API_KEY}`,
  },
};

const App = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [movieList, setMovieList] = useState([]);
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  
  // New States
  const [selectedGenre, setSelectedGenre] = useState(0);
  const [sortBy, setSortBy] = useState("popularity.desc");
  const [watchlist, setWatchlist] = useState(() => {
    const saved = localStorage.getItem("watchlist");
    return saved ? JSON.parse(saved) : [];
  });

  useDebounce(() => setDebouncedSearchTerm(searchTerm), 500, [searchTerm]);

  const fetchMovies = useCallback(async (query = "") => {
    setIsLoading(true);
    setErrorMessage("");
    try {
      let endpoint;
      if (query) {
        endpoint = `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}`;
      } else {
        endpoint = `${API_BASE_URL}/discover/movie?sort_by=${sortBy}`;
        if (selectedGenre !== 0) {
          endpoint += `&with_genres=${selectedGenre}`;
        }
      }

      const response = await fetch(endpoint, API_OPTIONS);
      if (!response.ok) throw new Error("Failed to fetch movies");
      
      const data = await response.json();
      setMovieList(data.results || []);

      if (query && data.results.length > 0) {
        await updateSearchCount(query, data.results[0]);
      }
    } catch (error) {
      console.error(`Error fetching movies: ${error}`);
      setErrorMessage("Error fetching movies. Please try again later");
    } finally {
      setIsLoading(false);
    }
  }, [selectedGenre, sortBy]);

  const loadTrendingMovies = async () => {
    try {
      const movies = await getTrendingMovies();
      setTrendingMovies(movies);
    } catch (error) {
      console.error(`Error fetching trending movies: ${error}`);
    }
  };

  const toggleWatchlist = (movieId) => {
    setWatchlist(prev => {
      const exists = prev.includes(movieId);
      const updated = exists ? prev.filter(id => id !== movieId) : [...prev, movieId];
      localStorage.setItem("watchlist", JSON.stringify(updated));
      return updated;
    });
  };

  useEffect(() => {
    fetchMovies(debouncedSearchTerm);
  }, [debouncedSearchTerm, fetchMovies]);

  useEffect(() => {
    loadTrendingMovies();
  }, []);

  return (
    <main className="overflow-x-hidden">
      <div className="pattern" />
      
      <div className="wrapper">
        <header className="relative z-20">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex justify-center mb-6">
              <div className="bg-accent/10 px-4 py-1.5 rounded-full border border-accent/20 flex items-center gap-2">
                 <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
                </span>
                <span className="text-accent text-xs font-bold uppercase tracking-wider">Now Live: Discover 2026 Releases</span>
              </div>
            </div>

            <h1 className="leading-tight">
              Discover Your Next <span className="text-gradient">Cinematic</span> Journey
            </h1>
            <p className="text-gray-100/60 text-center max-w-2xl mx-auto mt-4 text-base sm:text-lg">
              Explore thousands of movies, track your favorites, and stay ahead of the trends with CineTimez's premium browsing experience.
            </p>
          </motion.div>
          
          <div className="relative mt-12">
            <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
          </div>

          <Filters 
            selectedGenre={selectedGenre} 
            setSelectedGenre={setSelectedGenre}
            sortBy={sortBy}
            setSortBy={setSortBy}
          />
        </header>

        {trendingMovies.length > 0 && !searchTerm && (
          <section className="trending">
            <div className="flex items-center gap-3 mb-10">
              <TrendingUp className="text-accent" />
              <h2 className="!mt-0">Trending Now</h2>
            </div>
            <ul>
              {trendingMovies.map((movie, index) => (
                <motion.li 
                  key={movie.$id}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <p>{index + 1}</p>
                  <img src={movie.poster_url} alt={movie.title} />
                </motion.li>
              ))}
            </ul>
          </section>
        )}

        <section className="all-movies !mt-24">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <LayoutGrid className="text-accent" />
              <h2 className="!mt-0">
                {searchTerm ? `Search Results for "${searchTerm}"` : "Explore Catalog"}
              </h2>
            </div>
            
            <div className="hidden sm:flex items-center gap-2 text-gray-200 text-sm bg-white/5 px-4 py-2 rounded-xl border border-white/10">
              <Bookmark size={16} />
              <span>{watchlist.length} Saved</span>
            </div>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Spinner />
              <p className="text-gray-100 mt-4 animate-pulse">Curating the best movies for you...</p>
            </div>
          ) : errorMessage ? (
            <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-2xl text-center">
              <p className="text-red-400 font-medium">{errorMessage}</p>
              <button 
                onClick={() => fetchMovies(debouncedSearchTerm)}
                className="mt-4 text-white underline decoration-white/30 underline-offset-4 hover:decoration-white"
              >
                Try refreshing
              </button>
            </div>
          ) : (
            <motion.ul layout className="grid">
              <AnimatePresence mode="popLayout">
                {movieList.map((movie) => (
                  <MovieCard 
                    key={movie.id} 
                    movie={movie} 
                    isWatchlisted={watchlist.includes(movie.id)}
                    onToggleWatchlist={toggleWatchlist}
                  />
                ))}
              </AnimatePresence>
            </motion.ul>
          )}
          
          {!isLoading && movieList.length === 0 && (
            <div className="text-center py-20">
              <p className="text-gray-100 text-lg">No movies found matching your criteria.</p>
              <button 
                onClick={() => {setSearchTerm(""); setSelectedGenre(0);}}
                className="mt-4 text-accent hover:underline"
              >
                Clear all filters
              </button>
            </div>
          )}
        </section>
      </div>
      
      <footer className="mt-32 pb-12 border-t border-white/5 pt-12">
        <div className="wrapper !py-0 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="bg-accent p-1.5 rounded-lg">
              <LayoutGrid size={18} className="text-primary" />
            </div>
            <span className="text-white font-bold text-xl tracking-tight">CineTimez</span>
          </div>
          <p className="text-gray-100/40 text-sm">
            © 2026 CineTimez. Powered by TMDB & Appwrite.
          </p>
          <div className="flex gap-6">
             <a href="#" className="text-gray-100/60 hover:text-white transition-colors">Privacy</a>
             <a href="#" className="text-gray-100/60 hover:text-white transition-colors">Terms</a>
             <a href="#" className="text-gray-100/60 hover:text-white transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </main>
  );
};

export default App;
