/**
 * YouTube Data API v3 & IFrame Player Service Layer
 * Specially configured for Indian singers & music across driving modes.
 * Mode Playlists:
 * - Highway: Arijit Singh, KK, Mohit Chauhan, Lucky Ali, Atif Aslam, Anuv Jain, Prateek Kuhad
 * - City: Diljit Dosanjh, AP Dhillon, Karan Aujla, Badshah, Shreya Ghoshal, Latest Bollywood/Punjabi Hits
 * - Village: Kishore Kumar, Mohammed Rafi, Lata Mangeshkar, R.D. Burman, Mukesh, 90s Kumar Sanu/Udit Narayan
 */
import fallbackPlaylists from '../data/playlist.json';

// In-memory runtime cache for mode+time-of-day playlists (NOT persisted to disk/files),
// keyed as "<mode>_<timeMode>" e.g. "highway_night".
const runtimePlaylistCache = {};

const cacheKey = (mode, timeMode) => `${mode}_${timeMode}`;

// Curated, always-available playlist per mode (src/data/playlist.json), used whenever
// the YouTube Data API is unavailable (missing/invalid key, quota exceeded, network
// failure, etc). Playback itself doesn't need the Data API key — only search does —
// so these tracks play exactly like a live-fetched playlist would.
export const getFallbackPlaylist = (mode) => {
  const tracks = fallbackPlaylists[mode] || fallbackPlaylists.highway || [];
  // Shuffle so repeated fallbacks (e.g. switching modes back and forth) don't always
  // start on the same track.
  return [...tracks].sort(() => Math.random() - 0.5);
};

// Configuration focused on Indian Music (Region: IN, Language: hi)
const DEFAULT_CONFIG = {
  regionCode: 'IN',
  relevanceLanguage: 'hi',
  safeSearch: 'none',
  maxResults: 15,
};

/**
 * Get YouTube API key from Vite environment
 */
export const getYouTubeApiKey = () => {
  return import.meta.env.VITE_YOUTUBE_API_KEY || '';
};

/**
 * Check if a valid API key is configured
 */
export const isApiKeyConfigured = () => {
  const key = getYouTubeApiKey();
  return Boolean(key && key.trim() !== '' && key !== 'your_api_key_here');
};

/**
 * Convert ISO 8601 duration (e.g. PT3M45S, PT1H2M10S) to seconds
 */
export const parseIsoDuration = (durationStr) => {
  if (!durationStr) return 240;
  const match = durationStr.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 240;
  const hours = parseInt(match[1] || '0', 10);
  const minutes = parseInt(match[2] || '0', 10);
  const seconds = parseInt(match[3] || '0', 10);
  return hours * 3600 + minutes * 60 + seconds;
};

/**
 * Format seconds to mm:ss display
 */
export const formatDurationSeconds = (totalSeconds) => {
  if (!totalSeconds || isNaN(totalSeconds)) return '3:45';
  const m = Math.floor(totalSeconds / 60);
  const s = Math.floor(totalSeconds % 60);
  return `${m}:${s < 10 ? '0' : ''}${s}`;
};

/**
 * Clean YouTube video titles for Indian music tracks
 */
const cleanTitle = (rawTitle) => {
  if (!rawTitle) return 'Indian Track';
  return rawTitle
    .replace(/\[.*?\]|\(.*?\)/g, (match) => {
      const lower = match.toLowerCase();
      if (
        lower.includes('official') ||
        lower.includes('video') ||
        lower.includes('audio') ||
        lower.includes('4k') ||
        lower.includes('hd') ||
        lower.includes('lyrics') ||
        lower.includes('full song')
      ) {
        return '';
      }
      return match;
    })
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
};

/**
 * Indian Music Mode + Time-of-Day Query Generators.
 * Each driving mode has a distinct query pool per time-of-day (day / sunset / night)
 * so the same mode plays a different mood of songs depending on the lighting.
 */
const getModeSearchQueries = (mode, timeMode = 'day') => {
  const currentYear = new Date().getFullYear();

  const queryPools = {
    highway: {
      day: [
        'bollywood road trip songs hindi car drive',
        'best bollywood car songs highway drive',
        'indian indie acoustic travel songs anuv jain prateek kuhad',
      ],
      sunset: [
        'arijit singh soulful evening highway songs',
        'atif aslam javed ali soothing travel songs',
        'hindi golden hour road trip songs sunset drive',
      ],
      night: [
        'hindi long drive songs night car cruise',
        'lucky ali travel songs playlist road trip',
        'arijit singh kk mohit chauhan travel songs',
      ],
    },
    city: {
      day: [
        `latest trending bollywood songs ${currentYear}`,
        `top hindi pop hits latest ${currentYear}`,
        `indian trending viral music ${currentYear}`,
      ],
      sunset: [
        'bollywood lounge chill evening songs',
        'punjabi lofi sunset vibes',
        `shreya ghoshal arijit singh latest hits ${currentYear}`,
      ],
      night: [
        'bollywood dance party songs club night',
        'punjabi party hits diljit ap dhillon karan aujla',
        'indian edm bollywood remix night party',
      ],
    },
    village: {
      day: [
        'kishore kumar mohammed rafi golden classic hits',
        'purane gane evergreen 70s 80s 90s hindi songs',
      ],
      sunset: [
        'lata mangeshkar timeless classics 70s 80s',
        'jagjit singh soothing classic ghazals',
      ],
      night: [
        'rd burman superhit retro hindi songs',
        'mukesh hemant kumar vintage hindi songs',
        '90s kumar sanu udit narayan alka yagnik romantic hits',
      ],
    },
  };

  const modePool = queryPools[mode] || queryPools.highway;
  const pool = modePool[timeMode] || modePool.day;
  // Pick 2 randomized queries for a rich diverse playlist
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 2);
};

/**
 * Fetch video details (durations, high-res thumbnails) for video IDs
 */
const fetchVideoDetails = async (videoIds, apiKey) => {
  if (!videoIds || videoIds.length === 0) return {};
  try {
    const idsParam = videoIds.join(',');
    const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${idsParam}&key=${encodeURIComponent(apiKey)}`;
    const res = await fetch(url);
    if (!res.ok) return {};
    const data = await res.json();
    const map = {};
    (data.items || []).forEach((item) => {
      map[item.id] = {
        durationSeconds: parseIsoDuration(item.contentDetails?.duration),
        duration: formatDurationSeconds(parseIsoDuration(item.contentDetails?.duration)),
        highThumbnail:
          item.snippet?.thumbnails?.maxres?.url ||
          item.snippet?.thumbnails?.high?.url ||
          item.snippet?.thumbnails?.medium?.url,
      };
    });
    return map;
  } catch (e) {
    console.warn('Could not fetch video details, using defaults', e);
    return {};
  }
};

/**
 * Dynamic Playlist Fetcher for Driving Modes (Indian Singers & Music)
 */
export const fetchModePlaylist = async (mode = 'highway', timeMode = 'day', forceRefresh = false, customApiKey = null) => {
  const key = cacheKey(mode, timeMode);

  // Check runtime cache
  if (!forceRefresh && runtimePlaylistCache[key] && runtimePlaylistCache[key].length > 0) {
    return runtimePlaylistCache[key];
  }

  try {
    return await fetchModePlaylistFromApi(mode, timeMode, key, customApiKey);
  } catch (err) {
    // API unavailable for any reason (missing/invalid key, quota exceeded, network
    // error, no results) — fall back to the curated local playlist so the user still
    // gets a working, playable list instead of an error state. Not cached, so the
    // next fetch (mode switch, refresh, reload) tries the live API again first.
    console.warn(`YouTube API unavailable for "${mode}/${timeMode}" (${err.message}); using local fallback playlist.`);
    return getFallbackPlaylist(mode);
  }
};

const fetchModePlaylistFromApi = async (mode, timeMode, key, customApiKey) => {
  const apiKey = customApiKey || getYouTubeApiKey();
  if (!apiKey || apiKey === 'your_api_key_here') {
    throw new Error('MISSING_API_KEY');
  }

  const queries = getModeSearchQueries(mode, timeMode);
  const collectedItems = [];
  const seenIds = new Set();

  for (const query of queries) {
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&videoCategoryId=10&maxResults=${DEFAULT_CONFIG.maxResults}&regionCode=${DEFAULT_CONFIG.regionCode}&relevanceLanguage=${DEFAULT_CONFIG.relevanceLanguage}&q=${encodeURIComponent(query)}&key=${encodeURIComponent(apiKey)}`;

    try {
      const res = await fetch(url);
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        const msg = errJson?.error?.message || `YouTube API Error ${res.status}`;
        throw new Error(msg);
      }

      const data = await res.json();
      (data.items || []).forEach((item) => {
        const vidId = item.id?.videoId;
        if (vidId && !seenIds.has(vidId)) {
          seenIds.add(vidId);
          collectedItems.push({
            videoId: vidId,
            snippet: item.snippet,
          });
        }
      });
    } catch (err) {
      console.warn(`Query "${query}" failed:`, err.message);
      if (collectedItems.length === 0 && queries.indexOf(query) === queries.length - 1) {
        throw err;
      }
    }
  }

  if (collectedItems.length === 0) {
    throw new Error('NO_TRACKS_FOUND');
  }

  // Fetch precise durations & high-res artwork
  const videoIds = collectedItems.map((c) => c.videoId);
  const detailsMap = await fetchVideoDetails(videoIds, apiKey);

  // Format into in-memory runtime objects
  const tracks = collectedItems
    .map((item) => {
      const vidId = item.videoId;
      const snippet = item.snippet;
      if (!snippet) return null;

      const rawTitle = snippet.title || '';
      if (rawTitle.includes('Deleted video') || rawTitle.includes('Private video')) {
        return null;
      }

      const detail = detailsMap[vidId] || {};
      const durationSeconds = detail.durationSeconds || 240;
      const duration = detail.duration || '3:45';

      const thumbnail =
        detail.highThumbnail ||
        snippet.thumbnails?.high?.url ||
        snippet.thumbnails?.medium?.url ||
        `https://img.youtube.com/vi/${vidId}/hqdefault.jpg`;

      return {
        id: vidId,
        videoId: vidId,
        title: cleanTitle(rawTitle),
        artist: snippet.channelTitle || snippet.videoOwnerChannelTitle || 'Indian Artist',
        channelId: snippet.channelId || '',
        thumbnail: thumbnail,
        duration: duration,
        durationSeconds: durationSeconds,
        mode: mode,
      };
    })
    .filter(Boolean)
    .slice(0, 18);

  // Cache in runtime memory
  runtimePlaylistCache[key] = tracks;
  return tracks;
};

/**
 * Clear in-memory runtime cache. Pass mode+timeMode to clear just that combo,
 * or nothing to clear everything.
 */
export const clearRuntimeCache = (mode = null, timeMode = null) => {
  if (mode && timeMode) {
    delete runtimePlaylistCache[cacheKey(mode, timeMode)];
  } else {
    Object.keys(runtimePlaylistCache).forEach((k) => delete runtimePlaylistCache[k]);
  }
};

// ==========================================
// YouTube IFrame Player Lifecycle Controller
// ==========================================

let isScriptLoading = false;
let isScriptLoaded = false;
const readyCallbacks = [];

export const loadYouTubeIFrameAPI = () => {
  return new Promise((resolve, reject) => {
    if (window.YT && window.YT.Player) {
      isScriptLoaded = true;
      resolve(window.YT);
      return;
    }

    readyCallbacks.push(resolve);

    if (isScriptLoading) return;
    isScriptLoading = true;

    window.onYouTubeIframeAPIReady = () => {
      isScriptLoaded = true;
      isScriptLoading = false;
      while (readyCallbacks.length > 0) {
        const cb = readyCallbacks.shift();
        cb(window.YT);
      }
    };

    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    tag.async = true;
    tag.onerror = () => {
      isScriptLoading = false;
      reject(new Error('Failed to load YouTube IFrame API script'));
    };

    const firstTag = document.getElementsByTagName('script')[0];
    if (firstTag && firstTag.parentNode) {
      firstTag.parentNode.insertBefore(tag, firstTag);
    } else {
      document.head.appendChild(tag);
    }
  });
};

export class YouTubePlayerController {
  constructor() {
    this.player = null;
    this.isReady = false;
    this.currentVideoId = null;
    this.initPromise = null;
    this.listeners = {
      onStateChange: () => {},
      onReady: () => {},
      onError: () => {},
    };
  }

  initialize(containerId, initialVideoId, listeners = {}) {
    // Merge in the latest listeners synchronously, before any `await` below, so a
    // second call (e.g. React StrictMode double-invoking the mount effect in dev)
    // always wins the race and its callbacks are the ones that end up firing.
    this.listeners = { ...this.listeners, ...listeners };
    this.currentVideoId = initialVideoId;

    if (this.player) {
      if (this.isReady) {
        this.listeners.onReady({ target: this.player });
      }
      return Promise.resolve(this.player);
    }

    // A construction is already in flight — return the same promise instead of
    // racing a second `new YT.Player(...)` against the same container. Checking
    // `this.player` alone isn't enough here: StrictMode's second call happens
    // synchronously, before the first call's `await loadYouTubeIFrameAPI()`
    // resolves, so `this.player` would still be null at that point too.
    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = (async () => {
      try {
        const YT = await loadYouTubeIFrameAPI();

        return await new Promise((resolve) => {
          this.player = new YT.Player(containerId, {
            height: '100%',
            width: '100%',
            videoId: initialVideoId || '',
            playerVars: {
              autoplay: 0,
              controls: 0,
              disablekb: 1,
              enablejsapi: 1,
              fs: 0,
              iv_load_policy: 3,
              modestbranding: 1,
              playsinline: 1,
              rel: 0,
              origin: window.location.origin,
            },
            events: {
              onReady: (event) => {
                this.isReady = true;
                this.listeners.onReady(event);
                resolve(this);
              },
              onStateChange: (event) => {
                this.listeners.onStateChange(event);
              },
              onError: (event) => {
                console.warn('YouTube Player Event Error:', event.data);
                this.listeners.onError(event);
              },
            },
          });
        });
      } catch (err) {
        console.warn('YouTube Player init error:', err);
        this.listeners.onError({ data: -1, error: err });
        return null;
      }
    })();

    return this.initPromise;
  }

  loadVideo(videoId, startSeconds = 0) {
    this.currentVideoId = videoId;
    if (this.player && this.isReady && typeof this.player.loadVideoById === 'function') {
      try {
        this.player.loadVideoById({
          videoId: videoId,
          startSeconds: startSeconds,
        });
      } catch (e) {
        console.warn('loadVideo error:', e);
      }
    }
  }

  cueVideo(videoId) {
    this.currentVideoId = videoId;
    if (this.player && this.isReady && typeof this.player.cueVideoById === 'function') {
      try {
        this.player.cueVideoById(videoId);
      } catch (e) {
        console.warn('cueVideo error:', e);
      }
    }
  }

  play() {
    if (this.player && this.isReady && typeof this.player.playVideo === 'function') {
      try {
        this.player.playVideo();
      } catch (e) {
        console.warn('playVideo error:', e);
      }
    }
  }

  pause() {
    if (this.player && this.isReady && typeof this.player.pauseVideo === 'function') {
      try {
        this.player.pauseVideo();
      } catch (e) {
        console.warn('pauseVideo error:', e);
      }
    }
  }

  seekTo(seconds) {
    if (this.player && this.isReady && typeof this.player.seekTo === 'function') {
      try {
        this.player.seekTo(seconds, true);
      } catch (e) {
        console.warn('seekTo error:', e);
      }
    }
  }

  setVolume(volumePercent) {
    if (this.player && this.isReady && typeof this.player.setVolume === 'function') {
      try {
        this.player.setVolume(Math.max(0, Math.min(100, volumePercent)));
      } catch (e) {
        console.warn('setVolume error:', e);
      }
    }
  }

  mute() {
    if (this.player && this.isReady && typeof this.player.mute === 'function') {
      try {
        this.player.mute();
      } catch (e) {
        console.warn('mute error:', e);
      }
    }
  }

  unMute() {
    if (this.player && this.isReady && typeof this.player.unMute === 'function') {
      try {
        this.player.unMute();
      } catch (e) {
        console.warn('unMute error:', e);
      }
    }
  }

  getCurrentTime() {
    if (this.player && this.isReady && typeof this.player.getCurrentTime === 'function') {
      try {
        return this.player.getCurrentTime() || 0;
      } catch (e) {
        return 0;
      }
    }
    return 0;
  }

  getDuration() {
    if (this.player && this.isReady && typeof this.player.getDuration === 'function') {
      try {
        return this.player.getDuration() || 0;
      } catch (e) {
        return 0;
      }
    }
    return 0;
  }

  destroy() {
    if (this.player && typeof this.player.destroy === 'function') {
      try {
        this.player.destroy();
      } catch (e) {
        console.warn('destroy error:', e);
      }
      this.player = null;
      this.isReady = false;
    }
  }
}

export const youtubeService = new YouTubePlayerController();
