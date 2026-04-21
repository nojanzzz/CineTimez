import React from "react";
import { Search as SearchIcon, X } from "lucide-react";

const Search = ({ searchTerm, setSearchTerm }) => {
  return (
    <div className="search max-w-3xl mx-auto">
      <div className="relative group">
        <SearchIcon 
          size={20} 
          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-100/50 group-focus-within:text-accent transition-colors" 
        />
        
        <input
          type="text"
          placeholder="Search through thousands of movies..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-white/5 border border-white/10 py-4 pl-12 pr-12 rounded-2xl text-white placeholder:text-gray-100/30 outline-none focus:border-accent/50 focus:bg-white/10 transition-all"
        />

        {searchTerm && (
          <button
            onClick={() => setSearchTerm("")}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-lg hover:bg-white/10 text-gray-100/50 hover:text-white transition-all"
          >
            <X size={18} />
          </button>
        )}
      </div>
    </div>
  );
};

export default Search;
