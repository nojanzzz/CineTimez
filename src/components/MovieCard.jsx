import React from "react";
import { motion } from "framer-motion";
import { Heart, Star } from "lucide-react";
import { useAppContext } from "../context/AppContext";

const MovieCard = ({ movie, isWatchlisted }) => {
  const { toggleWatchlist, setSelectedMovie } = useAppContext();
  const {
    id,
    title,
    vote_average,
    poster_path,
    release_date,
    original_language,
  } = movie;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -8, scale: 1.02 }}
      className="movie-card group relative cursor-pointer z-10 hover:z-20"
      onClick={() => setSelectedMovie(movie)}
    >
      <div className="relative overflow-hidden rounded-2xl border border-white/5 group-hover:border-accent/30 transition-all duration-500 shadow-2xl group-hover:shadow-accent/10">
        <img
          src={
            poster_path
              ? `https://image.tmdb.org/t/p/w500/${poster_path}`
              : "/no-movie.png"
          }
          alt={title}
          className="transition-transform duration-700 group-hover:scale-110 w-full h-auto"
        />

        {/* Quick-Peek Overlay: Now showing NEW info (Synopsis) */}
        <div className="absolute inset-0 bg-linear-to-t from-[#020205] via-[#020205]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-5">
          <p className="text-accent text-[9px] font-black uppercase tracking-[0.2em] mb-2">
            Synopsis
          </p>
          <p className="text-gray-200 text-[11px] leading-relaxed line-clamp-3 mb-5 font-medium italic">
            {movie.overview ||
              "Deep cinematic records for this title are currently being processed..."}
          </p>
          <button className="w-full py-2.5 bg-white text-black text-[10px] font-black uppercase tracking-[0.2em] rounded-xl hover:bg-accent hover:text-white transition-all transform translate-y-4 group-hover:translate-y-0 duration-500 shadow-xl">
            View Movie Details
          </button>
        </div>

        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleWatchlist(id);
          }}
          className={`absolute top-4 right-4 p-2.5 rounded-full backdrop-blur-xl border transition-all duration-300 z-30 ${
            isWatchlisted
              ? "bg-accent border-accent text-white shadow-[0_0_15px_rgba(255,61,61,0.5)]"
              : "bg-black/40 border-white/10 text-white hover:bg-black/60 hover:border-white/30"
          }`}
        >
          <Heart size={18} fill={isWatchlisted ? "currentColor" : "none"} />
        </button>
      </div>

      <div className="mt-4 px-1">
        <h3 className="text-sm font-bold text-white truncate group-hover:text-accent transition-colors duration-300">
          {title}
        </h3>

        <div className="flex items-center gap-2 mt-1 text-gray-500">
          <Star size={12} className="text-yellow-500 fill-yellow-500" />
          <p className="text-[11px] font-bold">
            {vote_average ? vote_average.toFixed(1) : "N/A"}
          </p>
          <span className="text-gray-800">•</span>
          <p className="text-[11px] font-bold uppercase tracking-tighter">
            {original_language}
          </p>
          <span className="text-gray-800">•</span>
          <p className="text-[11px] font-bold">
            {release_date ? release_date.split("-")[0] : "N/A"}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default MovieCard;
