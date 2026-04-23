import React, { useState, useEffect } from "react";
import { Search as SearchIcon, X, Clock, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const Search = ({ searchTerm, setSearchTerm }) => {
  const [history, setHistory] = useState([]);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    const savedHistory = localStorage.getItem("search_history");
    if (savedHistory) setHistory(JSON.parse(savedHistory));
  }, []);

  useEffect(() => {
    if (searchTerm.trim().length > 3) {
      const timer = setTimeout(() => {
        setHistory(prev => {
          const filtered = prev.filter(s => s !== searchTerm.trim());
          const newHistory = [searchTerm.trim(), ...filtered].slice(0, 5);
          localStorage.setItem("search_history", JSON.stringify(newHistory));
          return newHistory;
        });
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [searchTerm]);

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem("search_history");
  };

  return (
    <div className="search max-w-3xl mx-auto relative z-50">
      <div className="relative group">
        <SearchIcon 
          size={20} 
          className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${
            isFocused ? "text-accent" : "text-gray-500"
          }`} 
        />
        
        <input
          type="text"
          placeholder="Search through thousands of movies..."
          value={searchTerm}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200) }
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-white/5 border border-white/10 py-5 pl-12 pr-12 rounded-2xl text-white placeholder:text-gray-500 outline-none focus:border-accent/50 focus:bg-white/10 transition-all shadow-2xl"
        />

        {searchTerm && (
          <button
            onClick={() => setSearchTerm("")}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-xl hover:bg-white/10 text-gray-500 hover:text-white transition-all"
          >
            <X size={18} />
          </button>
        )}
      </div>

      <AnimatePresence>
        {isFocused && history.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute top-full left-0 right-0 mt-3 p-4 bg-[#0a0a10] border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-2xl"
          >
            <div className="flex items-center justify-between mb-4 px-2">
              <div className="flex items-center gap-2 text-gray-500 text-[10px] font-black uppercase tracking-widest">
                <Clock size={12} />
                <span>Recent Searches</span>
              </div>
              <button 
                onClick={clearHistory}
                className="text-gray-600 hover:text-accent transition-colors"
              >
                <Trash2 size={12} />
              </button>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {history.map((item, i) => (
                <button
                  key={i}
                  onClick={() => setSearchTerm(item)}
                  className="px-4 py-2 bg-white/5 border border-white/5 rounded-xl text-xs font-bold text-gray-400 hover:bg-accent/10 hover:border-accent/30 hover:text-white transition-all"
                >
                  {item}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Search;

