import { useState, useEffect, useRef, useCallback } from 'react';
import {
  youtubeService,
  fetchModePlaylist,
  clearRuntimeCache,
  isApiKeyConfigured,
  getYouTubeApiKey,
  getFallbackPlaylist,
} from '../services/youtube';

const MODE_RADIO_METADATA = {
  highway: {
    radioTitle: 'Highway Radio • Indian Road Trip',
    radioSubtitle: 'Arijit, KK, Mohit Chauhan, Lucky Ali',
    loadingMessage: 'Finding the best Indian road trip soundtrack...',
  },
  city: {
    radioTitle: 'City Radio • Bollywood & Punjabi',
    radioSubtitle: 'Trending Hits • Diljit, AP Dhillon, Shreya',
    loadingMessage: "Tuning into trending Indian city hits...",
  },
  village: {
    radioTitle: 'Village Radio • Evergreen Classics',
    radioSubtitle: 'Kishore Kumar, Rafi, Lata & 90s Golden Hits',
    loadingMessage: 'Tuning into timeless Indian golden classics...',
  },
};

// Short mood descriptor appended to the radio title/loading message per time-of-day,
// so the same driving mode reads as a different "station" depending on the lighting.
const TIME_MOOD = {
  day: { label: 'Day Cruise', mood: 'upbeat' },
  sunset: { label: 'Golden Hour', mood: 'soulful' },
  night: { label: 'Night Drive', mood: 'moody' },
};

export function useYouTubePlayer(currentMode = 'highway', timeMode = 'day') {
  const [playlist, setPlaylist] = useState(() => getFallbackPlaylist(currentMode));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(80);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(240);
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const [hasStartedByUser, setHasStartedByUser] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [isLoadingPlaylist, setIsLoadingPlaylist] = useState(true);
  const [apiError, setApiError] = useState(null);
  const [trackNotification, setTrackNotification] = useState(null);
  const [shuffleMode, setShuffleMode] = useState(false);
  const [repeatMode, setRepeatMode] = useState('all'); // 'off' | 'all' | 'one'

  const consecutiveErrorsRef = useRef(0);
  const currentTrack = playlist[currentIndex] || null;
  const timeUpdateIntervalRef = useRef(null);
  const hasInitializedPlayerRef = useRef(false);
  const currentModeRef = useRef(currentMode);
  currentModeRef.current = currentMode;
  const timeModeRef = useRef(timeMode);
  timeModeRef.current = timeMode;
  const isPlayerReadyRef = useRef(isPlayerReady);
  isPlayerReadyRef.current = isPlayerReady;
  const hasStartedByUserRef = useRef(hasStartedByUser);
  hasStartedByUserRef.current = hasStartedByUser;
  const playlistRef = useRef(playlist);
  playlistRef.current = playlist;
  const currentIndexRef = useRef(currentIndex);
  currentIndexRef.current = currentIndex;
  const shuffleModeRef = useRef(shuffleMode);
  shuffleModeRef.current = shuffleMode;
  const repeatModeRef = useRef(repeatMode);
  repeatModeRef.current = repeatMode;
  // Always points at the latest nextTrack, so the mount-only player-init
  // effect below never calls back into a stale closure.
  const nextTrackRef = useRef(() => {});

  const baseMeta = MODE_RADIO_METADATA[currentMode] || MODE_RADIO_METADATA.highway;
  const timeMood = TIME_MOOD[timeMode] || TIME_MOOD.day;
  const meta = {
    radioTitle: `${baseMeta.radioTitle} • ${timeMood.label}`,
    radioSubtitle: baseMeta.radioSubtitle,
    loadingMessage: `${baseMeta.loadingMessage.replace(/\.\.\.$/, '')} (${timeMood.mood} ${timeMood.label.toLowerCase()} picks)...`,
  };

  // 1. Initialize YouTube Player once
  useEffect(() => {
    let isMounted = true;

    const listeners = {
      onReady: () => {
        if (!isMounted) return;
        setIsPlayerReady(true);
        youtubeService.setVolume(volume);
      },
      onStateChange: (event) => {
        if (!isMounted) return;
        const state = event.data;
        if (state === 1) { // Playing
          consecutiveErrorsRef.current = 0;
          setIsPlaying(true);
          setIsBuffering(false);
          setApiError(null);
          const dur = youtubeService.getDuration();
          if (dur > 0) setDuration(dur);
        } else if (state === 2) { // Paused
          setIsPlaying(false);
          setIsBuffering(false);
        } else if (state === 3) { // Buffering
          setIsBuffering(true);
        } else if (state === 0) { // Ended
          setIsBuffering(false);
          if (repeatModeRef.current === 'one') {
            youtubeService.seekTo(0);
            youtubeService.play();
            setCurrentTime(0);
            setIsPlaying(true);
            return;
          }
          const isLastTrack = currentIndexRef.current >= playlistRef.current.length - 1;
          if (repeatModeRef.current === 'off' && !shuffleModeRef.current && isLastTrack) {
            setIsPlaying(false);
            return;
          }
          nextTrackRef.current();
        }
      },
      onError: (event) => {
        if (!isMounted) return;
        console.warn('YouTube playback error (code:', event.data, '), silently skipping to next song...');
        setIsBuffering(false);
        consecutiveErrorsRef.current += 1;
        if (consecutiveErrorsRef.current > 3) {
          console.warn('Multiple consecutive errors, pausing auto-skip.');
          setIsPlaying(false);
          consecutiveErrorsRef.current = 0;
          return;
        }
        // Silently skip to next playable song without disruptive error toast
        nextTrackRef.current();
      },
    };

    youtubeService.initialize('yt-player-host', '', listeners).catch((err) => {
      console.warn('Player init error:', err);
    });

    return () => {
      isMounted = false;
      if (timeUpdateIntervalRef.current) {
        clearInterval(timeUpdateIntervalRef.current);
      }
    };
  }, []);

  // 2. Poll playback time & duration
  useEffect(() => {
    if (isPlaying && isPlayerReady) {
      timeUpdateIntervalRef.current = setInterval(() => {
        const curr = youtubeService.getCurrentTime();
        const dur = youtubeService.getDuration();
        if (curr !== undefined && !isNaN(curr)) {
          setCurrentTime(curr);
        }
        if (dur && dur > 0 && !isNaN(dur)) {
          setDuration(dur);
        }
      }, 500);
    } else {
      if (timeUpdateIntervalRef.current) {
        clearInterval(timeUpdateIntervalRef.current);
      }
    }

    return () => {
      if (timeUpdateIntervalRef.current) {
        clearInterval(timeUpdateIntervalRef.current);
      }
    };
  }, [isPlaying, isPlayerReady]);

  // 3. Load dynamic Indian playlist from YouTube API on load, mode change, or time-of-day change
  const loadModeSongs = useCallback(async (mode, timeOfDay, forceRefresh = false) => {
    setIsLoadingPlaylist(true);
    setApiError(null);

    try {
      const tracks = await fetchModePlaylist(mode, timeOfDay, forceRefresh);
      if (tracks && tracks.length > 0) {
        // Start on a random track instead of always the top search result, so
        // reloading the page or switching modes doesn't keep landing on the same song.
        const startIndex = tracks.length > 1 ? Math.floor(Math.random() * tracks.length) : 0;
        const startTrack = tracks[startIndex];
        setPlaylist(tracks);
        setCurrentIndex(startIndex);
        setCurrentTime(0);
        setDuration(startTrack.durationSeconds || 240);

        // Browsers block unmuted autoplay before any real interaction, and a muted
        // "Playing" UI is more confusing than an honest "Paused" one — so just cue the
        // track until the user actually interacts (see App.jsx), then play for real
        // with sound. Once they have interacted, keep auto-loading + playing on every
        // subsequent mode/time-of-day change as before.
        if (isPlayerReadyRef.current) {
          if (hasStartedByUserRef.current) {
            youtubeService.loadVideo(startTrack.videoId);
          } else {
            youtubeService.cueVideo(startTrack.videoId);
          }
        }
      } else {
        setApiError('NO_TRACKS');
      }
    } catch (err) {
      console.warn('Failed to load Indian playlist for mode', mode, err);
      if (err.message === 'MISSING_API_KEY') {
        setApiError('MISSING_API_KEY');
      } else {
        setApiError(err.message || 'COULD_NOT_LOAD');
      }
    } finally {
      setIsLoadingPlaylist(false);
    }
    // Stable identity: reads live isPlayerReady/hasStartedByUser via refs instead of
    // depending on them directly, so this callback's reference never changes and the
    // "fetch on mode/time change" effect below doesn't re-fire (and reset the current
    // track back to index 0) every time the user's very first play/select/skip action
    // flips hasStartedByUser or the player becomes ready.
  }, []);

  // Trigger playlist fetch when mode or time-of-day changes
  useEffect(() => {
    loadModeSongs(currentMode, timeMode, false);
  }, [currentMode, timeMode, loadModeSongs]);

  // When Player becomes ready after playlist was already fetched (see the matching
  // comment in loadModeSongs above for why this cues rather than plays by default).
  useEffect(() => {
    if (isPlayerReady && playlist.length > 0 && !hasInitializedPlayerRef.current) {
      hasInitializedPlayerRef.current = true;
      const startTrack = playlist[currentIndex] || playlist[0];
      if (hasStartedByUser) {
        youtubeService.loadVideo(startTrack.videoId);
      } else {
        youtubeService.cueVideo(startTrack.videoId);
      }
    }
  }, [isPlayerReady, playlist, currentIndex, hasStartedByUser]);

  // Playback Control Handlers
  const togglePlay = useCallback(() => {
    setHasStartedByUser(true);
    if (!currentTrack) return;

    if (isPlaying) {
      youtubeService.pause();
      setIsPlaying(false);
    } else {
      if (isPlayerReady) {
        youtubeService.play();
      }
      setIsPlaying(true);
    }
  }, [isPlaying, isPlayerReady, currentTrack]);

  const play = useCallback(() => {
    setHasStartedByUser(true);
    if (!isPlaying && isPlayerReady && currentTrack) {
      youtubeService.play();
      setIsPlaying(true);
    }
  }, [isPlaying, isPlayerReady, currentTrack]);

  const pause = useCallback(() => {
    if (isPlaying && isPlayerReady) {
      youtubeService.pause();
      setIsPlaying(false);
    }
  }, [isPlaying, isPlayerReady]);

  const nextTrack = useCallback(() => {
    setHasStartedByUser(true);
    setPlaylist((currentPlaylist) => {
      if (currentPlaylist.length === 0) return currentPlaylist;
      setCurrentIndex((prevIdx) => {
        let nextIdx;
        if (shuffleModeRef.current && currentPlaylist.length > 1) {
          do {
            nextIdx = Math.floor(Math.random() * currentPlaylist.length);
          } while (nextIdx === prevIdx);
        } else {
          nextIdx = (prevIdx + 1) % currentPlaylist.length;
        }
        const target = currentPlaylist[nextIdx];
        if (target) {
          setCurrentTime(0);
          setDuration(target.durationSeconds || 240);
          if (isPlayerReadyRef.current) {
            youtubeService.loadVideo(target.videoId);
            setIsPlaying(true);
          }
        }
        return nextIdx;
      });
      return currentPlaylist;
    });
  }, []);
  nextTrackRef.current = nextTrack;

  const toggleShuffle = useCallback(() => setShuffleMode((prev) => !prev), []);

  const cycleRepeatMode = useCallback(() => {
    setRepeatMode((prev) => (prev === 'all' ? 'one' : prev === 'one' ? 'off' : 'all'));
  }, []);

  const prevTrack = useCallback(() => {
    setHasStartedByUser(true);
    if (currentTime > 3) {
      seekTo(0);
      return;
    }
    setPlaylist((currentPlaylist) => {
      if (currentPlaylist.length === 0) return currentPlaylist;
      setCurrentIndex((prevIdx) => {
        const prev = (prevIdx - 1 + currentPlaylist.length) % currentPlaylist.length;
        const target = currentPlaylist[prev];
        if (target) {
          setCurrentTime(0);
          setDuration(target.durationSeconds || 240);
          if (isPlayerReady) {
            youtubeService.loadVideo(target.videoId);
            setIsPlaying(true);
          }
        }
        return prev;
      });
      return currentPlaylist;
    });
  }, [currentTime, isPlayerReady]);

  const selectTrack = useCallback((index) => {
    setHasStartedByUser(true);
    const target = playlist[index];
    if (!target) return;

    setCurrentIndex(index);
    setCurrentTime(0);
    setDuration(target.durationSeconds || 240);

    if (isPlayerReady) {
      youtubeService.loadVideo(target.videoId);
      setIsPlaying(true);
    }
  }, [playlist, isPlayerReady]);

  const seekTo = useCallback((seconds) => {
    setCurrentTime(seconds);
    if (isPlayerReady) {
      youtubeService.seekTo(seconds);
    }
  }, [isPlayerReady]);

  const handleVolumeChange = useCallback((newVol) => {
    const clamped = Math.max(0, Math.min(100, newVol));
    setVolume(clamped);
    if (clamped > 0 && isMuted) {
      setIsMuted(false);
      youtubeService.unMute();
    }
    youtubeService.setVolume(clamped);
  }, [isMuted]);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      if (next) {
        youtubeService.mute();
      } else {
        youtubeService.unMute();
        youtubeService.setVolume(volume);
      }
      return next;
    });
  }, [volume]);

  // Refresh Playlist Button ("Find New Songs")
  const refreshPlaylist = useCallback(() => {
    clearRuntimeCache(currentModeRef.current, timeModeRef.current);
    loadModeSongs(currentModeRef.current, timeModeRef.current, true);
  }, [loadModeSongs]);

  // Retry on error
  const retryFetch = useCallback(() => {
    loadModeSongs(currentModeRef.current, timeModeRef.current, true);
  }, [loadModeSongs]);

  // Custom API key update handler
  const setCustomApiKeyAndReload = useCallback(async (customKey) => {
    clearRuntimeCache();
    await loadModeSongs(currentModeRef.current, timeModeRef.current, true);
  }, [loadModeSongs]);

  const formatTime = (timeInSec) => {
    if (!timeInSec || isNaN(timeInSec)) return '0:00';
    const m = Math.floor(timeInSec / 60);
    const s = Math.floor(timeInSec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const progressPercent = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;
  const apiKeyValid = isApiKeyConfigured();

  return {
    playlist,
    currentTrack,
    currentIndex,
    isPlaying,
    isMuted,
    volume,
    currentTime,
    duration,
    progressPercent,
    isBuffering,
    isPlayerReady,
    hasStartedByUser,
    isLoadingPlaylist,
    apiError,
    apiKeyValid,
    trackNotification,
    shuffleMode,
    repeatMode,
    toggleShuffle,
    cycleRepeatMode,
    radioTitle: meta.radioTitle,
    radioSubtitle: meta.radioSubtitle,
    loadingMessage: meta.loadingMessage,
    togglePlay,
    play,
    pause,
    nextTrack,
    prevTrack,
    selectTrack,
    seekTo,
    setVolume: handleVolumeChange,
    toggleMute,
    formatTime,
    refreshPlaylist,
    retryFetch,
    setCustomApiKeyAndReload,
  };
}
