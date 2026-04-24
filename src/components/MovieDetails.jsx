import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Play, Star, Calendar, Globe, Users, Film, ChevronDown, Folder } from "lucide-react";
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

const MovieDetails = ({ movie, onClose, onToggleWatchlist, isWatchlisted, folders, userReview, onSaveReview, onDeleteReview }) => {
  const [details, setDetails] = useState(null);
  const [cast, setCast] = useState([]);
  const [trailer, setTrailer] = useState(null);
  const [similar, setSimilar] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [showDropdown, setShowDropdown] = useState(false);
  
  // Diary States
  const [isEditingReview, setIsEditingReview] = useState(!userReview);
  const [rating, setRating] = useState(userReview?.rating || 0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState(userReview?.text || "");

  useEffect(() => {
    if (userReview) {
      setRating(userReview.rating);
      setReviewText(userReview.text);
      setIsEditingReview(false);
    } else {
      setRating(0);
      setReviewText("");
      setIsEditingReview(true);
    }
  }, [userReview, movie]);

  useEffect(() => {
    if (!movie) return;

    const fetchMovieData = async () => {
      setIsLoading(true);
      setError(false);
      try {
        // Using append_to_response to get all data in ONE request (much more reliable)
        const response = await fetch(
          `${API_BASE_URL}/movie/${movie.id}?append_to_response=videos,credits,recommendations`, 
          API_OPTIONS
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch movie data: ${response.status}`);
        }

        const data = await response.json();
        
        setDetails(data);
        setCast(data.credits?.cast?.slice(0, 10) || []);
        setSimilar(data.recommendations?.results?.slice(0, 6) || []);
        
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
        className="bg-dark-100 border border-white/5 w-full max-w-6xl h-[90vh] lg:h-auto lg:max-h-[90vh] rounded-[2rem] overflow-hidden shadow-[0_0_80px_rgba(255,61,61,0.15)] relative flex flex-col lg:flex-row"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-6 right-6 z-30 p-2.5 rounded-full bg-black/50 text-white/80 hover:text-white hover:bg-accent transition-all border border-white/5"
        >
          <X size={20} />
        </button>

        {isLoading ? (
          <div className="w-full h-[500px] flex flex-col items-center justify-center gap-5 bg-dark-100">
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
            <div className="w-full lg:w-[60%] relative shrink-0 h-[220px] xs:h-[250px] sm:h-[300px] lg:h-auto bg-black flex items-center justify-center group">
              {trailer ? (
                <div className="w-full h-full relative">
                  <iframe
                    src={`https://www.youtube.com/embed/${trailer.key}?autoplay=1&rel=0&modestbranding=1`}
                    title={`${movie.title} Trailer`}
                    className="w-full h-full absolute inset-0"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  ></iframe>
                  
                  {/* YouTube Link Indicator */}
                  <div className="absolute bottom-4 left-4 z-10">
                     <a 
                       href={`https://www.youtube.com/watch?v=${trailer.key}`} 
                       target="_blank" 
                       rel="noopener noreferrer"
                       className="bg-black/60 backdrop-blur-md text-white text-[10px] font-black px-4 py-2 rounded-lg border border-white/10 flex items-center gap-2 hover:bg-accent hover:border-accent transition-all uppercase tracking-widest"
                     >
                       <Play size={10} fill="currentColor" />
                       Watch on YouTube
                     </a>
                  </div>
                </div>
              ) : (
                <div className="relative w-full h-full flex flex-col items-center justify-center p-10 text-center">
                  <img
                    src={`https://image.tmdb.org/t/p/original/${movie.poster_path}`}
                    alt={movie.title}
                    className="w-full h-full absolute inset-0 object-cover opacity-20 blur-sm"
                  />
                  <Film size={48} className="text-white/10 mb-6 relative z-10" />
                  <p className="text-white/40 text-xs font-black uppercase tracking-[0.3em] mb-6 relative z-10">Trailer Vault Empty</p>
                  <a 
                    href={`https://www.youtube.com/results?search_query=${encodeURIComponent(movie.title + ' trailer')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="relative z-10 px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-[10px] font-bold uppercase tracking-widest hover:bg-white hover:text-black transition-all flex items-center gap-2"
                  >
                    <Globe size={14} />
                    Search on YouTube
                  </a>
                </div>
              )}
            </div>

            {/* Cinematic Details */}
            <div className="w-full flex-1 lg:w-[40%] p-6 sm:p-8 lg:p-12 overflow-y-auto custom-scrollbar bg-dark-100 border-t lg:border-t-0 lg:border-l border-white/5">
              <div className="flex flex-wrap items-center gap-2 mb-6 sm:mb-8">
                {details?.genres?.slice(0, 3).map(g => (
                  <span key={g.id} className="px-3 py-1 rounded-md bg-accent/5 text-accent text-[9px] font-black uppercase tracking-widest border border-accent/10">
                    {g.name}
                  </span>
                ))}
              </div>

              <h2 className="text-3xl lg:text-5xl font-black text-white mb-6 leading-[0.9] tracking-tighter">
                {details?.title || movie.title}
              </h2>
              
              <div className="flex items-center flex-wrap gap-4 sm:gap-6 text-gray-500 mb-8 sm:mb-12 text-[10px] sm:text-[11px] font-bold uppercase tracking-widest">
                <div className="flex items-center gap-2">
                  <Star size={14} className="text-yellow-500 fill-yellow-500" />
                  <span className="text-white">{(details?.vote_average || movie.vote_average)?.toFixed(1)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={14} />
                  <span>{(details?.release_date || movie.release_date)?.split("-")[0]}</span>
                </div>
                {details?.runtime > 0 && (
                  <div className="flex items-center gap-2">
                    <Users size={14} />
                    <span>{details.runtime} Min</span>
                  </div>
                )}
              </div>

              {/* Navigation Tabs */}
              <div className="flex overflow-x-auto hide-scrollbar border-b border-white/5 mb-8 sm:mb-10 gap-4 sm:gap-6 lg:gap-8">
                {["overview", "cast", "recommended", "diary"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`whitespace-nowrap pb-4 sm:pb-5 text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all relative ${
                      activeTab === tab ? "text-accent" : "text-gray-600 hover:text-white"
                    }`}
                  >
                    {tab}
                    {activeTab === tab && (
                      <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-1 bg-accent shadow-[0_0_10px_#FF3D3D]" />
                    )}
                  </button>
                ))}
              </div>

              <div className="min-h-[300px]">
                {activeTab === "overview" && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <p className="text-gray-400 leading-relaxed text-base mb-12 font-medium">
                      {details?.overview || movie.overview || "Deep cinematic records for this title are currently restricted."}
                    </p>
                    
                    {isWatchlisted ? (
                      <button
                        onClick={() => onToggleWatchlist(movie.id)}
                        className="flex items-center justify-center gap-4 w-full py-5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white shadow-[0_0_20px_rgba(239,68,68,0.2)]"
                      >
                        Discard from Library
                      </button>
                    ) : (
                      <div className="flex gap-2 w-full relative">
                        <button
                          onClick={() => onToggleWatchlist(movie.id)}
                          className="flex-1 flex items-center justify-center gap-4 py-5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all bg-white text-black hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_30px_rgba(255,255,255,0.1)]"
                        >
                          Archive to My List
                        </button>
                        {folders && folders.length > 1 && (
                          <div className="relative">
                            <button 
                              onClick={() => setShowDropdown(!showDropdown)}
                              className="h-full px-5 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all rounded-2xl flex items-center justify-center text-white"
                            >
                              <ChevronDown size={18} className={`transition-transform duration-300 ${showDropdown ? 'rotate-180' : ''}`} />
                            </button>
                            
                            <AnimatePresence>
                              {showDropdown && (
                                <motion.div 
                                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                  animate={{ opacity: 1, y: 0, scale: 1 }}
                                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                  className="absolute bottom-full right-0 mb-3 w-48 bg-dark-100 border border-white/10 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] overflow-hidden z-50 p-2"
                                >
                                  <p className="text-[9px] font-black uppercase tracking-widest text-gray-500 px-3 py-2 mb-1">Save to Folder</p>
                                  {folders.filter(f => f.id !== "default").map(f => (
                                    <button
                                      key={f.id}
                                      onClick={() => {
                                        onToggleWatchlist(movie.id, f.id);
                                        setShowDropdown(false);
                                      }}
                                      className="w-full text-left px-3 py-2.5 text-xs font-bold text-white hover:bg-accent/20 hover:text-accent rounded-xl transition-colors flex items-center gap-2 truncate"
                                    >
                                      <Folder size={14} className="shrink-0" />
                                      <span className="truncate">{f.name}</span>
                                    </button>
                                  ))}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        )}
                      </div>
                    )}
                  </motion.div>
                )}

                {activeTab === "cast" && (
                  <motion.div 
                     initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                     className="grid grid-cols-1 gap-4"
                  >
                    {cast.length > 0 ? cast.map(person => (
                      <a 
                        key={person.id} 
                        href={`https://www.themoviedb.org/person/${person.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-4 group p-2 rounded-2xl hover:bg-white/5 transition-all duration-300"
                      >
                        <div className="w-14 h-14 rounded-2xl overflow-hidden shrink-0 border border-white/5 group-hover:border-accent group-hover:shadow-[0_0_20px_rgba(171,139,255,0.4)] transition-all duration-500">
                          <img 
                            src={person.profile_path ? `https://image.tmdb.org/t/p/w185/${person.profile_path}` : "/no-movie.png"} 
                            alt={person.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        </div>
                        <div className="overflow-hidden">
                          <p className="text-white text-[13px] font-bold truncate group-hover:text-accent transition-colors">{person.name}</p>
                          <p className="text-gray-500 text-[10px] uppercase font-black truncate">{person.character || "Acting Personnel"}</p>
                        </div>
                      </a>
                    )) : (
                      <p className="text-gray-600 text-[10px] font-bold uppercase tracking-widest text-center col-span-full py-20">Cast Registry Missing</p>
                    )}
                  </motion.div>
                )}

                {activeTab === "recommended" && (
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

                {activeTab === "diary" && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    {!userReview || isEditingReview ? (
                      <div className="bg-white/5 p-6 rounded-3xl border border-white/10 relative">
                        <h3 className="text-white font-black uppercase tracking-widest text-xs mb-4">Rate & Review</h3>
                        
                        <div className="flex gap-2 mb-6">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              onMouseEnter={() => setHoverRating(star)}
                              onMouseLeave={() => setHoverRating(0)}
                              onClick={() => setRating(star)}
                              className="focus:outline-none transition-transform hover:scale-110"
                            >
                              <Star 
                                size={28} 
                                className={`transition-colors ${
                                  star <= (hoverRating || rating) 
                                    ? "text-yellow-500 fill-yellow-500 drop-shadow-[0_0_10px_rgba(234,179,8,0.5)]" 
                                    : "text-gray-600 hover:text-gray-500"
                                }`} 
                              />
                            </button>
                          ))}
                        </div>
                        
                        <textarea
                          placeholder="Write your personal thoughts on this movie..."
                          value={reviewText}
                          onChange={(e) => setReviewText(e.target.value)}
                          className="w-full bg-black/50 border border-white/10 text-white rounded-2xl px-5 py-4 mb-6 focus:outline-none focus:border-accent transition-colors min-h-[120px] text-sm resize-none custom-scrollbar"
                        ></textarea>
                        
                        <div className="flex gap-3">
                          {userReview && (
                            <button
                              onClick={() => setIsEditingReview(false)}
                              className="px-6 py-3 rounded-2xl text-gray-400 font-bold hover:bg-white/5 transition-colors text-xs uppercase tracking-widest border border-transparent hover:border-white/10"
                            >
                              Cancel
                            </button>
                          )}
                          <button
                            onClick={() => onSaveReview(movie.id, { rating, text: reviewText })}
                            disabled={rating === 0}
                            className={`flex-1 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${
                              rating === 0 
                                ? "bg-white/5 text-gray-600 cursor-not-allowed" 
                                : "bg-accent text-white shadow-[0_0_20px_rgba(255,61,61,0.2)] hover:bg-red-500 hover:scale-[1.02]"
                            }`}
                          >
                            Save to Diary
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-dark-100 p-6 sm:p-8 rounded-3xl border border-white/10 relative group shadow-xl">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8 pb-6 border-b border-white/5">
                          <div>
                            <h3 className="text-white font-black uppercase tracking-[0.2em] text-[10px] mb-2 sm:mb-3 text-accent">My Rating</h3>
                            <div className="flex gap-1.5">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star 
                                  key={star}
                                  size={22} 
                                  className={star <= (userReview?.rating || 0) ? "text-yellow-500 fill-yellow-500 drop-shadow-[0_0_15px_rgba(234,179,8,0.3)]" : "text-white/5"} 
                                />
                              ))}
                            </div>
                          </div>
                          
                          <div className="flex gap-2 sm:opacity-0 group-hover:opacity-100 transition-opacity w-full sm:w-auto">
                            <button
                              onClick={() => setIsEditingReview(true)}
                              className="flex-1 sm:flex-none px-4 py-2.5 sm:py-2 bg-white/10 text-white text-[10px] font-bold uppercase tracking-widest rounded-xl hover:bg-white/20 transition-colors"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => onDeleteReview(movie.id)}
                              className="flex-1 sm:flex-none px-4 py-2.5 sm:py-2 bg-red-500/10 text-red-500 text-[10px] font-bold uppercase tracking-widest rounded-xl hover:bg-red-500 hover:text-white transition-colors"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                        
                        {userReview?.text ? (
                          <div>
                            <h3 className="text-gray-600 font-black uppercase tracking-[0.2em] text-[9px] mb-4">My Notes</h3>
                            <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap font-medium">{userReview.text}</p>
                          </div>
                        ) : (
                          <p className="text-gray-600 text-[10px] font-bold uppercase tracking-widest italic">No notes written.</p>
                        )}
                      </div>
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
