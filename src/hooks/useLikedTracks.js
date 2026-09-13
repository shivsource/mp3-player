import { useState, useCallback, useEffect } from 'react';

const STORAGE_KEY = 'ldrive_liked_tracks';

function loadLiked() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

/**
 * Persists which tracks the user has liked (by videoId) to localStorage.
 */
export function useLikedTracks() {
  const [likedIds, setLikedIds] = useState(loadLiked);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(likedIds)));
    } catch {
      // Ignore write failures (e.g. private browsing storage limits)
    }
  }, [likedIds]);

  const toggleLike = useCallback((videoId) => {
    if (!videoId) return;
    setLikedIds((prev) => {
      const next = new Set(prev);
      if (next.has(videoId)) {
        next.delete(videoId);
      } else {
        next.add(videoId);
      }
      return next;
    });
  }, []);

  const isLiked = useCallback((videoId) => likedIds.has(videoId), [likedIds]);

  return { likedIds, toggleLike, isLiked };
}
