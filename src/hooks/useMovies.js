import { useState, useCallback, useEffect } from "react";
import { API_BASE_URL, API_OPTIONS } from "../lib/tmdb";
import { updateSearchCount, getTrendingMovies as fetchTrendingFromAppwrite } from "../appwrite";

export const useMovies = (debouncedSearchTerm, contentType, sortBy, selectedGenre, selectedLanguage, user) => {
  const [movieList, setMovieList] = useState([]);
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchMovies = useCallback(
    async (query = "", pageNum = 1) => {
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

        setMovieList((prev) =>
          pageNum === 1 ? data.results : [...prev, ...data.results]
        );
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
    },
    [contentType, sortBy, selectedGenre, selectedLanguage]
  );

  const loadTrendingMovies = async () => {
    try {
      const movies = await fetchTrendingFromAppwrite();
      setTrendingMovies(movies || []);
    } catch (error) {
      console.error(`Error fetching trending movies: ${error}`);
    }
  };

  // Reset and fetch on filter change
  useEffect(() => {
    setMovieList([]);
    setErrorMessage("");
    setPage(1);
    fetchMovies(debouncedSearchTerm, 1);
    
    if (user) {
      loadTrendingMovies();
    } else {
      setTrendingMovies([]);
    }
  }, [debouncedSearchTerm, selectedGenre, sortBy, selectedLanguage, contentType, user, fetchMovies]);

  // Pagination effect
  useEffect(() => {
    if (page > 1) {
      fetchMovies(debouncedSearchTerm, page);
    }
  }, [page, debouncedSearchTerm, fetchMovies]);

  return {
    movieList,
    trendingMovies,
    isLoading,
    isFetchingMore,
    errorMessage,
    page,
    setPage,
    hasMore,
    fetchMovies
  };
};
