import React from "react";
import { motion } from "framer-motion";

const GENRES = [
  { id: 0, name: "All" },
  { id: 28, name: "Action" },
  { id: 35, name: "Comedy" },
  { id: 18, name: "Drama" },
  { id: 878, name: "Sci-Fi" },
  { id: 27, name: "Horror" },
  { id: 10749, name: "Romance" },
  { id: 16, name: "Animation" },
];

const SORT_OPTIONS = [
  { value: "popularity.desc", label: "Popular" },
  { value: "release_date.desc", label: "Newest" },
  { value: "vote_average.desc", label: "Top Rated" },
];

const Filters = ({ selectedGenre, setSelectedGenre, sortBy, setSortBy }) => {
  return (
    <div className="flex flex-col gap-6 mt-10">
      {/* Genres */}
      <div className="flex flex-wrap gap-2">
        {GENRES.map((genre) => (
          <button
            key={genre.id}
            onClick={() => setSelectedGenre(genre.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 border ${
              selectedGenre === genre.id
                ? "bg-accent border-accent text-white shadow-lg shadow-accent/20"
                : "bg-white/5 border-white/10 text-gray-200 hover:bg-white/10"
            }`}
          >
            {genre.name}
          </button>
        ))}
      </div>

      {/* Sorting */}
      <div className="flex items-center gap-4">
        <span className="text-gray-100 text-sm font-medium">Sort by:</span>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="bg-dark-100/50 border border-white/10 text-white rounded-lg px-3 py-2 text-sm outline-none focus:border-accent transition-colors"
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default Filters;
