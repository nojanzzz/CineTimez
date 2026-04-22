import React from "react";
import { motion } from "framer-motion";
import { Heart, Star } from "lucide-react";

const MovieCard = ({
  movie,
  isWatchlisted,
  onToggleWatchlist,
  onClick
}) => {
  const { id, title, vote_average, poster_path, release_date, original_language } = movie;
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -5 }}
      className="movie-card group relative cursor-pointer"
      onClick={() => onClick(movie)}
    >
      <div className="relative overflow-hidden rounded-2xl">
        <img
          src={
            poster_path
              ? `https://image.tmdb.org/t/p/w500/${poster_path}`
              : "/no-movie.png"
          }
          alt={title}
          className="transition-transform duration-500 group-hover:scale-110"
        />
        
        <button
          onClick={(e) => {
            e.preventDefault();
            onToggleWatchlist(id);
          }}
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all duration-300 ${
            isWatchlisted 
              ? "bg-red-500 text-white" 
              : "bg-black/40 text-white hover:bg-black/60"
          }`}
        >
          <Heart size={20} fill={isWatchlisted ? "currentColor" : "none"} />
        </button>
      </div>

      <div className="mt-4">
        <h3 className="group-hover:text-accent transition-colors duration-300">{title}</h3>
        
        <div className="content">
          <div className="rating">
             <Star size={16} className="text-yellow-400 fill-yellow-400" />
            <p>{vote_average ? vote_average.toFixed(1) : "N/A"}</p>
          </div>
          
          <span className="text-gray-100/30">•</span>
          <p className="lang">{original_language}</p>
          
          <span className="text-gray-100/30">•</span>
          <p className="year">
            {release_date ? release_date.split("-")[0] : "N/A"}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default MovieCard;
