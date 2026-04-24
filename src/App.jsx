import React, { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Search from "./components/Search";
import Spinner from "./components/Spinner";
import MovieCard from "./components/MovieCard";
import Filters from "./components/Filters";
import MovieDetails from "./components/MovieDetails";
import CyberBackground from "./components/CyberBackground";
import MovieSkeleton, { TrendingSkeleton } from "./components/Skeleton";
import { useDebounce } from "react-use";
import { getTrendingMovies, updateSearchCount, account, OAuthProvider } from "./appwrite";
import { Bookmark, LayoutGrid, TrendingUp, Sparkles, FolderPlus, Folder } from "lucide-react";
import { Toaster, toast } from "sonner";

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
  const [folders, setFolders] = useState([{ id: "default", name: "All Saved", movies: [] }]);
  const [activeFolderId, setActiveFolderId] = useState("default");
  const watchlist = folders.flatMap(f => f.movies);
  const [showWatchlist, setShowWatchlist] = useState(false);
  const [watchlistMovies, setWatchlistMovies] = useState([]);
  const [isFetchingWatchlist, setIsFetchingWatchlist] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const loggedInUser = await account.get();
        setUser(loggedInUser);
        const prefs = await account.getPrefs();
        if (prefs.folders) {
          setFolders(prefs.folders);
        } else if (prefs.watchlist) {
          setFolders([{ id: "default", name: "All Saved", movies: prefs.watchlist }]);
        }
      } catch {
        setUser(null);
        setFolders([{ id: "default", name: "All Saved", movies: [] }]);
        setShowWatchlist(false);
      }
    };
    checkUser();
  }, []);

  const loginWithGoogle = () => {
    account.createOAuth2Session(OAuthProvider.Google, window.location.origin, window.location.origin);
  };

  const logout = async () => {
    try {
      await account.deleteSession("current");
      setUser(null);
      setFolders([{ id: "default", name: "All Saved", movies: [] }]);
      toast("Successfully logged out");
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

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

  const toggleWatchlist = (movieId, targetFolderId = "default") => {
    if (!user) {
      loginWithGoogle();
      return;
    }

    setFolders(prevFolders => {
      const isWatchlisted = prevFolders.some(f => f.movies.includes(movieId));
      
      let updatedFolders;
      if (isWatchlisted) {
        updatedFolders = prevFolders.map(f => ({
          ...f,
          movies: f.movies.filter(id => id !== movieId)
        }));
        toast("Removed from Library", { icon: '🗑️' });
      } else {
        const folderToAdd = showWatchlist ? activeFolderId : targetFolderId;
        updatedFolders = prevFolders.map(f => 
          f.id === folderToAdd ? { ...f, movies: [...f.movies, movieId] } : f
        );
        const folderName = prevFolders.find(f => f.id === folderToAdd)?.name || "All Saved";
        toast.success(`Archived to ${folderName}`);
      }
      
      account.updatePrefs({ folders: updatedFolders, watchlist: Array.from(new Set(updatedFolders.flatMap(f => f.movies))) }).catch(err => {
        console.error("Failed to sync watchlist with Appwrite:", err);
      });
      
      return updatedFolders;
    });
  };

  // Logic to fetch full details for the Watchlist collection
  useEffect(() => {
    const fetchWatchlistDetails = async () => {
      const activeFolder = folders.find(f => f.id === activeFolderId) || folders[0];
      const moviesToFetch = activeFolder ? activeFolder.movies : [];

      if (!showWatchlist || moviesToFetch.length === 0) {
        setWatchlistMovies([]);
        return;
      }
      
      setIsFetchingWatchlist(true);
      try {
        const moviePromises = moviesToFetch.map(id => 
          fetch(`${API_BASE_URL}/movie/${id}?api_key=${API_KEY}`, API_OPTIONS).then(res => res.json())
        );
        const results = await Promise.all(moviePromises);
        setWatchlistMovies(results.filter(m => m.id)); // Filter out any failed fetches
      } catch (error) {
        console.error("Error fetching watchlist details:", error);
      } finally {
        setIsFetchingWatchlist(false);
      }
    };

    fetchWatchlistDetails();
  }, [showWatchlist, activeFolderId, folders]);

  // Unified Fetch & Reset Logic for main catalog
  useEffect(() => {
    if (showWatchlist) return; // Don't fetch catalog if viewing collection
    
    setMovieList([]);
    setErrorMessage("");
    setPage(1);
    
    fetchMovies(debouncedSearchTerm, 1);
    loadTrendingMovies();
  }, [debouncedSearchTerm, selectedGenre, sortBy, selectedLanguage, contentType, showWatchlist]);

  // Separate effect for Pagination only
  useEffect(() => {
    if (page > 1) {
      fetchMovies(debouncedSearchTerm, page);
    }
  }, [page, debouncedSearchTerm, fetchMovies]);

  return (
    <main className="overflow-x-hidden">
      <Toaster theme="dark" position="bottom-right" toastOptions={{ style: { background: '#111', border: '1px solid #333', color: '#fff' } }} />
      <CyberBackground />
      
      <div className="wrapper">
        <nav className="relative z-20 flex justify-between items-center pt-6 pb-4">
          <div className="flex items-center gap-2">
            <div className="bg-accent p-1.5 rounded-lg">
              <LayoutGrid size={18} className="text-primary" />
            </div>
            <span className="text-white font-bold text-xl tracking-tight">CineTimez</span>
          </div>

          {user ? (
            <div className="flex items-center gap-4">
              <span className="text-gray-300 text-sm font-medium hidden sm:block">Welcome, <span className="text-white">{user.name}</span></span>
              <button onClick={logout} className="text-xs bg-white/10 hover:bg-white/20 border border-white/10 px-4 py-2 rounded-full transition-colors text-white font-medium">Logout</button>
            </div>
          ) : (
            <button onClick={loginWithGoogle} className="flex items-center gap-2 bg-white text-black px-5 py-2 rounded-full font-bold hover:bg-gray-200 transition-colors text-sm shadow-[0_0_15px_rgba(255,255,255,0.2)]">
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-4 h-4" />
              Sign In
            </button>
          )}
        </nav>
        <header className="relative z-20 pt-4">
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

          {!showWatchlist && (
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
          )}
        </header>

        {trendingMovies.length > 0 && !searchTerm && !showWatchlist && (
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

        <section className="all-movies !mt-24" >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
            <div className="flex items-center gap-3">
              <LayoutGrid className="text-accent" />
              <h2 className="!mt-0">
                {showWatchlist ? "My Archived Collection" : searchTerm ? `Results for "${searchTerm}"` : "Explore Catalog"}
              </h2>
            </div>
            
            <button 
              onClick={() => {
                if (!user) {
                  loginWithGoogle();
                  return;
                }
                setShowWatchlist(!showWatchlist);
              }}
              className={`flex items-center gap-3 px-6 py-3 rounded-2xl border transition-all duration-500 ${
                showWatchlist 
                  ? "bg-accent border-accent text-white shadow-[0_0_30px_rgba(255,61,61,0.3)]" 
                  : "bg-white/5 border-white/10 text-gray-400 hover:border-white/30 hover:text-white"
              }`}
            >
              <Bookmark size={18} className={showWatchlist ? "fill-white" : ""} />
              <span className="text-[11px] font-black uppercase tracking-widest">
                {showWatchlist ? "Back to Discovery" : `View Collection (${watchlist.length})`}
              </span>
            </button>
          </div>

          {showWatchlist ? (
            <div className="min-h-[400px]">
              {/* Folders Tab Bar */}
              <div className="flex items-center gap-3 mb-10 overflow-x-auto pb-4 custom-scrollbar">
                {folders.map(folder => (
                  <button
                    key={folder.id}
                    onClick={() => setActiveFolderId(folder.id)}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl whitespace-nowrap transition-all duration-300 font-bold text-xs uppercase tracking-widest ${
                      activeFolderId === folder.id 
                        ? 'bg-accent text-white shadow-[0_0_20px_rgba(255,61,61,0.3)]' 
                        : 'bg-white/5 border border-white/5 text-gray-400 hover:bg-white/10'
                    }`}
                  >
                    <Folder size={14} className={activeFolderId === folder.id ? 'fill-white/20' : ''} />
                    {folder.name}
                    <span className="bg-black/30 px-2 py-0.5 rounded-md text-[10px] ml-1">{folder.movies.length}</span>
                  </button>
                ))}
                
                <button
                  onClick={() => {
                    const name = prompt("Enter new folder name (e.g. Comfort Anime):");
                    if (name && name.trim() !== "") {
                      const newFolder = { id: Date.now().toString(), name: name.trim(), movies: [] };
                      const newFolders = [...folders, newFolder];
                      setFolders(newFolders);
                      setActiveFolderId(newFolder.id);
                      account.updatePrefs({ folders: newFolders, watchlist: Array.from(new Set(newFolders.flatMap(f => f.movies))) });
                      toast.success(`Folder "${name}" created`);
                    }
                  }}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-dashed border-white/20 text-gray-400 hover:text-white hover:border-white/40 transition-colors whitespace-nowrap text-xs font-bold uppercase tracking-widest"
                >
                  <FolderPlus size={14} />
                  New Folder
                </button>
              </div>

              {isFetchingWatchlist ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                  {[...Array(Math.max(4, watchlist.length))].map((_, i) => <MovieSkeleton key={i} />)}
                </div>
              ) : watchlistMovies.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-32 text-center">
                   <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/5">
                      <Bookmark size={32} className="text-gray-700" />
                   </div>
                   <h3 className="text-white text-xl font-bold mb-2">Your Archive is Empty</h3>
                   <p className="text-gray-500 max-w-xs">Start building your private cinematic library by clicking the heart on your favorite titles.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                  {watchlistMovies.map((movie) => (
                    <MovieCard 
                      key={movie.id} 
                      movie={movie} 
                      isWatchlisted={true}
                      onToggleWatchlist={toggleWatchlist}
                      onClick={setSelectedMovie}
                    />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <>
              {isLoading && movieList.length === 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {[...Array(8)].map((_, i) => <MovieSkeleton key={i} />)}
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
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 mt-10">
              {[...Array(4)].map((_, i) => <MovieSkeleton key={`more-${i}`} />)}
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
          </>
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
            folders={folders}
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
