import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Globe } from "lucide-react";

const API_BASE_URL = "https://api.themoviedb.org/3";
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const LANGUAGES = [
  { code: "", name: "Global" },
  { code: "ko", name: "Korean" },
  { code: "ja", name: "Japanese" },
  { code: "zh", name: "Chinese" },
  { code: "en", name: "English" },
];

const SORT_OPTIONS = [
  { value: "popularity.desc", label: "Popularity" },
  { value: "release_date.desc", label: "Newest" },
  { value: "vote_average.desc", label: "Top Rated" },
];

const Filters = ({ selectedGenre, setSelectedGenre, sortBy, setSortBy, selectedLanguage, setSelectedLanguage, contentType, setContentType }) => {
  const [genres, setGenres] = useState([{ id: 0, name: "All Genres" }]);

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/genre/${contentType}/list?api_key=${API_KEY}`, {
          headers: {
             Authorization: `Bearer ${API_KEY}`,
             accept: 'application/json'
          }
        });
        const data = await response.json();
        if (data.genres) {
          setGenres([{ id: 0, name: "All Genres" }, ...data.genres]);
        }
      } catch (error) {
        console.error("Error fetching genres:", error);
      }
    };
    fetchGenres();
    setSelectedGenre(0);
  }, [contentType]);

  return (
    <div className="flex flex-col gap-10 mt-12 relative z-20">
      {/* Primary Navigation Row: Balanced Center Layout */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 border-b border-white/5 pb-10">
        
        {/* Left Side: Content Type */}
        <div className="flex p-1 bg-white/5 rounded-xl border border-white/5 w-fit">
          {["movie", "tv"].map((type) => (
            <button 
              key={type}
              onClick={() => setContentType(type)}
              className={`px-8 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                contentType === type ? "bg-accent text-white shadow-lg shadow-accent/20" : "text-gray-500 hover:text-white"
              }`}
            >
              {type === "movie" ? "Movies" : "TV Series"}
            </button>
          ))}
        </div>

        {/* Center: Global Region Picker */}
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-2 text-gray-600 text-[9px] font-black uppercase tracking-[0.3em]">
            <Globe size={12} className="text-accent" />
            <span>Cinematic Region</span>
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => setSelectedLanguage(lang.code)}
                className={`px-5 py-1.5 rounded-lg text-[10px] font-bold transition-all border ${
                  selectedLanguage === lang.code
                    ? "bg-white border-white text-black shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                    : "bg-white/5 border-white/5 text-gray-500 hover:bg-white/10 hover:border-white/10"
                }`}
              >
                {lang.name}
              </button>
            ))}
          </div>
        </div>

        {/* Right Side: Sort */}
        <div className="flex flex-col items-end gap-3">
          <span className="text-gray-600 text-[9px] font-black uppercase tracking-widest">Sort By</span>
          <div className="flex gap-4">
            {SORT_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => setSortBy(option.value)}
                className={`text-[11px] font-black uppercase tracking-tighter transition-all ${
                  sortBy === option.value ? "text-accent underline underline-offset-8" : "text-gray-600 hover:text-white"
                }`}
              >
                {option.label.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Secondary Row: Wrapped Genres */}
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-4 text-gray-600 text-[10px] font-black uppercase tracking-[0.4em]">
          <span>Explore Genres</span>
          <div className="h-px flex-1 bg-white/5" />
        </div>
        
        <div className="flex flex-wrap gap-2">
          {genres.map((genre) => (
            <button
              key={genre.id}
              onClick={() => setSelectedGenre(genre.id)}
              className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all border ${
                selectedGenre === genre.id
                  ? "bg-accent/10 border-accent text-accent shadow-[0_0_20px_rgba(255,61,61,0.15)]"
                  : "bg-white/5 border-white/5 text-gray-500 hover:text-white hover:border-white/10"
              }`}
            >
              {genre.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Filters;
