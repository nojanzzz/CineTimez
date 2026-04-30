import React, { createContext, useContext, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useWatchlist } from "../hooks/useWatchlist";
import { useMovies } from "../hooks/useMovies";
import { useDebounce } from "react-use";

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [contentType, setContentType] = useState("movie");
  const [selectedGenre, setSelectedGenre] = useState(0);
  const [selectedLanguage, setSelectedLanguage] = useState("");
  const [sortBy, setSortBy] = useState("popularity.desc");
  const [selectedMovie, setSelectedMovie] = useState(null);

  useDebounce(
    () => {
      setDebouncedSearchTerm(searchTerm);
    },
    500,
    [searchTerm]
  );

  const auth = useAuth();
  const watchlist = useWatchlist(auth.user, auth.loginWithGoogle);
  const movies = useMovies(
    debouncedSearchTerm,
    contentType,
    sortBy,
    selectedGenre,
    selectedLanguage,
    auth.user
  );

  const value = {
    searchTerm,
    setSearchTerm,
    contentType,
    setContentType,
    selectedGenre,
    setSelectedGenre,
    selectedLanguage,
    setSelectedLanguage,
    sortBy,
    setSortBy,
    selectedMovie,
    setSelectedMovie,
    ...auth,
    ...watchlist,
    ...movies,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
};
