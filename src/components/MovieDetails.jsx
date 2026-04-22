import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Play, Star, Calendar, Globe, Users, Film } from "lucide-react";
import ReactPlayer from "react-player";

const API_BASE_URL = "https://api.themoviedb.org/3";
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const API_OPTIONS = {
  method: "GET",
  headers: {
    accept: "application/json",
    Authorization: `Bearer ${API_KEY}`,
  },
};

const MovieDetails = ({ movie, onClose, onToggleWatchlist, isWatchlisted }) => {
  const [details, setDetails] = useState(null);
  const [cast, setCast] = useState([]);
  const [trailer, setTrailer] = useState(null);
  const [similar, setSimilar] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (!movie) return;

    const fetchMovieData = async () => {
      setIsLoading(true);
      setError(false);
      try {
        // Using append_to_response to get all data in ONE request (much more reliable)
        const response = await fetch(
          `${API_BASE_URL}/movie/${movie.id}?append_to_response=videos,credits,similar`, 
          API_OPTIONS
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch movie data: ${response.status}`);
        }

        const data = await response.json();
        
        setDetails(data);
        setCast(data.credits?.cast?.slice(0, 10) || []);
        setSimilar(data.similar?.results?.slice(0, 6) || []);
        
        // Comprehensive trailer search
        const videos = data.videos?.results || [];
        const foundTrailer = 
          videos.find(v => v.official && v.type === "Trailer" && v.site === "YouTube") ||
          videos.find(v => v.type === "Trailer" && v.site === "YouTube") ||
          videos.find(v => v.type === "Teaser" && v.site === "YouTube") ||
          videos.find(v => v.site === "YouTube");
        
        setTrailer(foundTrailer);
      } catch (err) {
        console.error("MovieDetails Fetch Error:", err);
        setError(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMovieData();
  }, [movie.id]); // Only re-run if movie ID changes

  if (!movie) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/95 backdrop-blur-xl"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 30, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.9, y: 30, opacity: 0 }}
        className="bg-[#0f0d23] border border-white/10 w-full max-w-6xl max-h-[90vh] rounded-[2rem] overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] relative flex flex-col lg:flex-row"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-6 right-6 z-30 p-2.5 rounded-full bg-black/50 text-white/80 hover:text-white hover:bg-black/80 transition-all border border-white/10"
        >
          <X size={20} />
        </button>

        {isLoading ? (
          <div className="w-full h-[500px] flex flex-col items-center justify-center gap-5 bg-[#0f0d23]">
             <div className="w-10 h-10 border-2 border-accent border-t-transparent rounded-full animate-spin" />
             <p className="text-accent/60 text-xs font-bold uppercase tracking-[0.2em]">Preparing Cinema...</p>
          </div>
        ) : error ? (
           <div className="w-full h-[500px] flex flex-col items-center justify-center gap-4 text-center p-10">
              <Film size={40} className="text-white/10 mb-2" />
              <h3 className="text-white font-bold text-lg">Connection Lost</h3>
              <p className="text-gray-400 text-sm max-w-xs mx-auto">We couldn't reach the movie servers. Please check your connection.</p>
              <button onClick={onClose} className="mt-4 px-8 py-3 bg-accent text-white rounded-xl font-bold text-sm">Close</button>
           </div>
        ) : (
          <>
            {/* Media Canvas */}
            <div className="w-full lg:w-[60%] relative h-[300px] lg:h-auto bg-black flex items-center justify-center group">
              {trailer ? (
                <div className="w-full h-full relative">
                  <iframe
                    src={`https://www.youtube.com/embed/${trailer.key}?autoplay=1&mute=1&rel=0&modestbranding=1`}
                    title={`${movie.title} Trailer`}
                    className="w-full h-full absolute inset-0"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  ></iframe>
                  
                  {/* Safe Fallback Button */}
                  <div className="absolute top-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                     <a 
                       href={`https://www.youtube.com/watch?v=${trailer.key}`} 
                       target="_blank" 
                       rel="noopener noreferrer"
                       className="bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-4 py-2 rounded-full border border-white/10 flex items-center gap-2 hover:bg-accent hover:border-accent transition-all"
                     >
                       <Play size={12} fill="currentColor" />
                       OPEN IN YOUTUBE
                     </a>
                  </div>

                  <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-lg border border-white/10 pointer-events-none z-10">
                     <p className="text-[10px] text-white/80 font-bold uppercase tracking-widest flex items-center gap-2">
                        <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                        Official {trailer.type}
                     </p>
                  </div>
                </div>
              ) : (
                <div className="relative w-full h-full">
                  <img
                    src={`https://image.tmdb.org/t/p/original/${movie.poster_path}`}
                    alt={movie.title}
                    className="w-full h-full object-cover opacity-40 blur-sm"
                  />
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <Film size={48} className="text-white/10 mb-6" />
                    <p className="text-white/40 text-xs font-black uppercase tracking-[0.3em]">Trailer Vault Empty</p>
                  </div>
                </div>
              )}
            </div>

            {/* Cinematic Details */}
            <div className="w-full lg:w-[40%] p-8 lg:p-12 overflow-y-auto custom-scrollbar bg-[#0f0d23] border-l border-white/5">
              <div className="flex flex-wrap items-center gap-2 mb-8">
                {details?.genres?.slice(0, 3).map(g => (
                  <span key={g.id} className="px-3 py-1 rounded-md bg-accent/5 text-accent text-[9px] font-black uppercase tracking-widest border border-accent/10">
                    {g.name}
                  </span>
                ))}
              </div>

              <h2 className="text-3xl lg:text-5xl font-black text-white mb-6 leading-[0.9] tracking-tighter">
                {movie.title}
              </h2>
              
              <div className="flex items-center gap-6 text-gray-500 mb-12 text-[11px] font-bold uppercase tracking-widest">
                <div className="flex items-center gap-2">
                  <Star size={14} className="text-yellow-500 fill-yellow-500" />
                  <span className="text-white">{movie.vote_average?.toFixed(1)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={14} />
                  <span>{movie.release_date?.split("-")[0]}</span>
                </div>
                {details?.runtime > 0 && (
                  <div className="flex items-center gap-2">
                    <Users size={14} />
                    <span>{details.runtime} Min</span>
                  </div>
                )}
              </div>

              {/* Navigation Tabs */}
              <div className="flex border-b border-white/5 mb-10 gap-10">
                {["overview", "cast", "similar"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`pb-5 text-[10px] font-black uppercase tracking-[0.25em] transition-all relative ${
                      activeTab === tab ? "text-accent" : "text-gray-600 hover:text-white"
                    }`}
                  >
                    {tab}
                    {activeTab === tab && (
                      <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-1 bg-accent shadow-[0_0_10px_#AB8BFF]" />
                    )}
                  </button>
                ))}
              </div>

              <div className="min-h-[300px]">
                {activeTab === "overview" && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <p className="text-gray-400 leading-relaxed text-base mb-12 font-medium">
                      {movie.overview || "Deep cinematic records for this title are currently restricted."}
                    </p>
                    
                    <button
                      onClick={() => onToggleWatchlist(movie.id)}
                      className={`flex items-center justify-center gap-4 w-full py-5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${
                        isWatchlisted 
                          ? "bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white shadow-[0_0_20px_rgba(239,68,68,0.2)]" 
                          : "bg-white text-black hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_30px_rgba(255,255,255,0.1)]"
                      }`}
                    >
                      {isWatchlisted ? "Discard from Library" : "Archive to My List"}
                    </button>
                  </motion.div>
                )}

                {activeTab === "cast" && (
                  <motion.div 
                     initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                     className="grid grid-cols-2 gap-8"
                  >
                    {cast.length > 0 ? cast.map(person => (
                      <div key={person.id} className="flex items-center gap-4 group">
                        <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-white/5 grayscale group-hover:grayscale-0 transition-all duration-500">
                          <img 
                            src={person.profile_path ? `https://image.tmdb.org/t/p/w185/${person.profile_path}` : "/no-movie.png"} 
                            alt={person.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="overflow-hidden">
                          <p className="text-white text-[11px] font-bold truncate">{person.name}</p>
                          <p className="text-gray-600 text-[9px] uppercase font-black truncate">{person.character}</p>
                        </div>
                      </div>
                    )) : (
                      <p className="text-gray-600 text-[10px] font-bold uppercase tracking-widest text-center col-span-full py-20">Cast Registry Missing</p>
                    )}
                  </motion.div>
                )}

                {activeTab === "similar" && (
                  <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="grid grid-cols-3 gap-4"
                  >
                    {similar.length > 0 ? similar.map(m => (
                      <div key={m.id} className="group cursor-pointer">
                        <div className="relative rounded-2xl overflow-hidden aspect-[2/3] border border-white/5 group-hover:border-accent/50 transition-colors duration-500">
                           <img 
                            src={m.poster_path ? `https://image.tmdb.org/t/p/w342/${m.poster_path}` : "/no-movie.png"} 
                            alt={m.title}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          />
                        </div>
                      </div>
                    )) : (
                      <p className="text-gray-600 text-[10px] font-bold uppercase tracking-widest text-center col-span-full py-20">No Related Signals</p>
                    )}
                  </motion.div>
                )}
              </div>
            </div>
          </>
        )}
      </motion.div>
    </motion.div>
  );
};

export default MovieDetails;
