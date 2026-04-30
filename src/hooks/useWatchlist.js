import { useState, useEffect } from "react";
import { account } from "../appwrite";
import { toast } from "sonner";
import { API_BASE_URL, API_OPTIONS, API_KEY } from "../lib/tmdb";

export const useWatchlist = (user, loginWithGoogle) => {
  const [folders, setFolders] = useState([
    { id: "default", name: "All Saved", movies: [] },
  ]);
  const [activeFolderId, setActiveFolderId] = useState("default");
  const [reviews, setReviews] = useState({});
  const [watchlistMovies, setWatchlistMovies] = useState([]);
  const [isFetchingWatchlist, setIsFetchingWatchlist] = useState(false);
  const [showWatchlist, setShowWatchlist] = useState(false);

  const watchlist = folders.flatMap((f) => f.movies);

  const updateAppwritePrefs = async (newPrefs) => {
    try {
      const currentPrefs = await account.getPrefs();
      await account.updatePrefs({ ...currentPrefs, ...newPrefs });
    } catch (err) {
      console.error("Failed to update prefs:", err);
    }
  };

  useEffect(() => {
    if (user) {
      const fetchPrefs = async () => {
        try {
          const prefs = await account.getPrefs();
          if (prefs.folders) {
            setFolders(prefs.folders);
          } else if (prefs.watchlist) {
            setFolders([
              { id: "default", name: "All Saved", movies: prefs.watchlist },
            ]);
          }
          if (prefs.reviews) {
            setReviews(prefs.reviews);
          }
        } catch (err) {
          console.error("Error fetching prefs:", err);
        }
      };
      fetchPrefs();
    } else {
      setFolders([{ id: "default", name: "All Saved", movies: [] }]);
      setReviews({});
      setShowWatchlist(false);
    }
  }, [user]);

  const toggleWatchlist = (movieId, targetFolderId = "default") => {
    if (!user) {
      loginWithGoogle();
      return;
    }

    const folderToAdd =
      targetFolderId !== "default"
        ? targetFolderId
        : showWatchlist
          ? activeFolderId
          : "default";
    const isWatchlisted = folders.some((f) => f.movies.includes(movieId));

    if (isWatchlisted) {
      toast("Removed from Library", { icon: "🗑️" });
    } else {
      const folderName =
        folders.find((f) => f.id === folderToAdd)?.name || "All Saved";
      toast.success(`Archived to ${folderName}`);
    }

    setFolders((prevFolders) => {
      const currentlyWatchlisted = prevFolders.some((f) =>
        f.movies.includes(movieId),
      );

      let updatedFolders;
      if (currentlyWatchlisted) {
        updatedFolders = prevFolders.map((f) => ({
          ...f,
          movies: f.movies.filter((id) => id !== movieId),
        }));
      } else {
        updatedFolders = prevFolders.map((f) =>
          f.id === folderToAdd ? { ...f, movies: [...f.movies, movieId] } : f,
        );
      }

      updateAppwritePrefs({
        folders: updatedFolders,
        watchlist: Array.from(new Set(updatedFolders.flatMap((f) => f.movies))),
      });

      return updatedFolders;
    });
  };

  const createFolder = (name) => {
    const newFolder = {
      id: Date.now().toString(),
      name: name.trim(),
      movies: [],
    };
    const newFolders = [...folders, newFolder];
    setFolders(newFolders);
    setActiveFolderId(newFolder.id);
    updateAppwritePrefs({
      folders: newFolders,
      watchlist: Array.from(new Set(newFolders.flatMap((f) => f.movies))),
    });
    toast.success(`Folder "${name.trim()}" created`);
  };

  const deleteFolder = (folderId) => {
    toast("Folder deleted", { icon: "🗑️" });
    setFolders((prev) => {
      const updated = prev.filter((f) => f.id !== folderId);
      updateAppwritePrefs({
        folders: updated,
        watchlist: Array.from(new Set(updated.flatMap((f) => f.movies))),
      });
      if (activeFolderId === folderId) setActiveFolderId("default");
      return updated;
    });
  };

  const saveReview = (movieId, reviewData) => {
    if (!user) {
      loginWithGoogle();
      return;
    }
    toast.success("Review saved!");
    setReviews((prev) => {
      const newReviews = { ...prev, [movieId]: reviewData };
      updateAppwritePrefs({ reviews: newReviews });
      return newReviews;
    });
  };

  const deleteReview = (movieId) => {
    toast("Review removed", { icon: "🗑️" });
    setReviews((prev) => {
      const newReviews = { ...prev };
      delete newReviews[movieId];
      updateAppwritePrefs({ reviews: newReviews });
      return newReviews;
    });
  };

  // Fetch watchlist details
  useEffect(() => {
    const fetchWatchlistDetails = async () => {
      const activeFolder =
        folders.find((f) => f.id === activeFolderId) || folders[0];
      const moviesToFetch = activeFolder ? activeFolder.movies : [];

      if (!showWatchlist || moviesToFetch.length === 0) {
        setWatchlistMovies([]);
        return;
      }

      setIsFetchingWatchlist(true);
      try {
        const moviePromises = moviesToFetch.map((id) =>
          fetch(
            `${API_BASE_URL}/movie/${id}?api_key=${API_KEY}`,
            API_OPTIONS,
          ).then((res) => res.json()),
        );
        const results = await Promise.all(moviePromises);
        setWatchlistMovies(results.filter((m) => m.id));
      } catch (error) {
        console.error("Error fetching watchlist details:", error);
      } finally {
        setIsFetchingWatchlist(false);
      }
    };

    fetchWatchlistDetails();
  }, [showWatchlist, activeFolderId, folders]);

  return {
    folders,
    activeFolderId,
    setActiveFolderId,
    watchlist,
    watchlistMovies,
    isFetchingWatchlist,
    showWatchlist,
    setShowWatchlist,
    reviews,
    toggleWatchlist,
    createFolder,
    deleteFolder,
    saveReview,
    deleteReview
  };
};
