import React, { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Search from "./components/Search";
import Spinner from "./components/Spinner";
import MovieCard from "./components/MovieCard";
import Filters from "./components/Filters";
import MovieDetails from "./components/MovieDetails";
import CyberBackground from "./components/CyberBackground";
import { useDebounce } from "react-use";
import { getTrendingMovies, updateSearchCount } from "./appwrite";
import { Bookmark, LayoutGrid, TrendingUp, Sparkles } from "lucide-react";

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
  const [contentType, setContentType] = useState("movie");
  const [errorMessage, setErrorMessage] = useState("");
  const [movieList, setMovieList] = useState([]);
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  
  // New States
  const [selectedGenre, setSelectedGenre] = useState(0);
  const [selectedLanguage, setSelectedLanguage] = useState("");
  const [sortBy, setSortBy] = useState("popularity.desc");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [watchlist, setWatchlist] = useState(() => {
    const saved = localStorage.getItem("watchlist");
    return saved ? JSON.parse(saved) : [];
  });

  const observer = useRef();
  const lastMovieElementRef = useCallback(node => {
    if (isLoading || isFetchingMore) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prev => prev + 1);
      }
    });
    if (node) observer.current.observe(node);
  }, [isLoading, isFetchingMore, hasMore]);

  useDebounce(() => {
    setDebouncedSearchTerm(searchTerm);
    setPage(1);
    setMovieList([]);
  }, 500, [searchTerm]);

  const fetchMovies = useCallback(async (query = "", pageNum = 1) => {
    if (pageNum === 1) setIsLoading(true);
    else setIsFetchingMore(true);
    
    setErrorMessage("");
    try {
      let endpoint;
      if (query) {
        endpoint = `${API_BASE_URL}/search/${contentType}?query=${encodeURIComponent(query)}&page=${pageNum}`;
      } else {
        endpoint = `${API_BASE_URL}/discover/${contentType}?sort_by=${sortBy}&page=${pageNum}`;
        if (selectedGenre !== 0) {
          endpoint += `&with_genres=${selectedGenre}`;
        }
        if (selectedLanguage) {
          endpoint += `&with_original_language=${selectedLanguage}`;
        }
      }

      const response = await fetch(endpoint, API_OPTIONS);
      if (!response.ok) throw new Error("Failed to fetch movies");
      
      const data = await response.json();
      console.log(`[CineTimez] Fetched ${data.results.length} results for ${contentType}`);
      
      setMovieList(prev => pageNum === 1 ? data.results : [...prev, ...data.results]);
      setHasMore(data.page < data.total_pages);

      if (query && data.results.length > 0 && pageNum === 1) {
        await updateSearchCount(query, data.results[0]);
      }
    } catch (error) {
      console.error(`Error fetching movies: ${error}`);
      setErrorMessage("Error fetching movies. Please try again later");
    } finally {
      setIsLoading(false);
      setIsFetchingMore(false);
    }
  }, [selectedGenre, sortBy, selectedLanguage, contentType]);

  const loadTrendingMovies = async () => {
    try {
      const movies = await getTrendingMovies();
      setTrendingMovies(movies || []);
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

  // Unified Fetch & Reset Logic for instant responsiveness
  useEffect(() => {
    // 1. Reset state for fresh fetch
    setMovieList([]);
    setErrorMessage("");
    setPage(1);
    
    // 2. Fetch data (Force page 1)
    fetchMovies(debouncedSearchTerm, 1);
    
    // 3. Refresh trending
    loadTrendingMovies();
  }, [debouncedSearchTerm, selectedGenre, sortBy, selectedLanguage, contentType]);

  // Separate effect for Pagination only
  useEffect(() => {
    if (page > 1) {
      fetchMovies(debouncedSearchTerm, page);
    }
  }, [page, debouncedSearchTerm, fetchMovies]);

  return (
    <main className="overflow-x-hidden">
      <CyberBackground />
      
      <div className="wrapper">
        <header className="relative z-20 pt-10">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/5 border border-accent/20 mb-10 shadow-[0_0_20px_rgba(255,61,61,0.05)]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
              </span>
              <span className="text-accent text-[10px] font-black uppercase tracking-[0.3em]">Live: 2026 Collection Unveiled</span>
            </div>

            <h1 className="text-6xl md:text-8xl font-black text-white leading-[0.85] tracking-[-0.05em] mb-8">
              The <span className="text-accent">Unlimited</span> <br />
              Cinema Experience
            </h1>

            <p className="text-gray-500 text-base md:text-lg max-w-2xl mx-auto font-medium leading-relaxed">
              Uncover thousands of global masterpieces, curate your private library, 
              and stay ahead of the trends with CineTimez's elite browsing interface.
            </p>
          </motion.div>
          
          <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

          <Filters 
            selectedGenre={selectedGenre} 
            setSelectedGenre={setSelectedGenre}
            sortBy={sortBy}
            setSortBy={setSortBy}
            selectedLanguage={selectedLanguage}
            setSelectedLanguage={setSelectedLanguage}
            contentType={contentType}
            setContentType={setContentType}
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
                  whileHover={{ y: -10, transition: { duration: 0.2 } }}
                  onClick={() => setSelectedMovie({
                    id: movie.movie_id,
                    title: movie.searchTerm,
                    poster_path: movie.poster_url.split('/w500/')[1]
                  })}
                  className="cursor-pointer"
                >
                  <p>{index + 1}</p>
                  <img src={movie.poster_url} alt={movie.searchTerm} />
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

          {isLoading && movieList.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Spinner />
              <p className="text-gray-100 mt-4 animate-pulse">Curating the best movies for you...</p>
            </div>
          ) : errorMessage ? (
            <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-2xl text-center">
              <p className="text-red-400 font-medium">{errorMessage}</p>
              <button 
                onClick={() => fetchMovies(debouncedSearchTerm, 1)}
                className="mt-4 text-white underline decoration-white/30 underline-offset-4 hover:decoration-white"
              >
                Try refreshing
              </button>
            </div>
          ) : (
            <motion.ul layout className="grid">
              <AnimatePresence mode="popLayout">
                {movieList.map((movie, index) => {
                  if (movieList.length === index + 1) {
                    return (
                      <div ref={lastMovieElementRef} key={movie.id + index}>
                        <MovieCard 
                          movie={movie} 
                          isWatchlisted={watchlist.includes(movie.id)}
                          onToggleWatchlist={toggleWatchlist}
                          onClick={setSelectedMovie}
                        />
                      </div>
                    )
                  } else {
                    return (
                      <MovieCard 
                        key={movie.id + index} 
                        movie={movie} 
                        isWatchlisted={watchlist.includes(movie.id)}
                        onToggleWatchlist={toggleWatchlist}
                        onClick={setSelectedMovie}
                      />
                    )
                  }
                })}
              </AnimatePresence>
            </motion.ul>
          )}

          {isFetchingMore && (
             <div className="flex justify-center py-10">
                <Spinner />
             </div>
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

      {/* Modal Backdrop/Presence */}
      <AnimatePresence>
        {selectedMovie && (
          <MovieDetails 
            movie={selectedMovie} 
            onClose={() => setSelectedMovie(null)}
            isWatchlisted={watchlist.includes(selectedMovie.id)}
            onToggleWatchlist={toggleWatchlist}
          />
        )}
      </AnimatePresence>
      
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
