import React, { useState } from 'react';
import { Track } from './Track';
import {
  Radio,
  RotateCw,
  AlertCircle,
  KeyRound,
  Loader2,
  Sparkles,
  Music2,
} from 'lucide-react';

export const Playlist = ({
  player,
  accentColor = '#38bdf8',
}) => {
  const {
    playlist,
    currentIndex,
    isPlaying,
    selectTrack,
    isLoadingPlaylist,
    apiError,
    apiKeyValid,
    radioTitle,
    radioSubtitle,
    loadingMessage,
    refreshPlaylist,
    retryFetch,
    setCustomApiKeyAndReload,
  } = player;

  const [inputKey, setInputKey] = useState('');
  const [showKeyInput, setShowKeyInput] = useState(false);

  const handleSaveKey = (e) => {
    e.preventDefault();
    if (inputKey.trim()) {
      setCustomApiKeyAndReload(inputKey.trim());
      setShowKeyInput(false);
    }
  };

  return (
    <div className="w-full flex flex-col pt-2 border-t border-white/10 mt-2 select-none">
      {/* Radio Station Header */}
      <div className="flex items-center justify-between px-1 mb-2">
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 animate-pulse" style={{ color: accentColor }} />
            <span className="text-xs font-bold text-white tracking-wide">
              {radioTitle}
            </span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono tracking-tight mt-0.5">
            {radioSubtitle}
          </span>
        </div>

        {/* Action Buttons: Refresh & Key Status */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={refreshPlaylist}
            disabled={isLoadingPlaylist}
            className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white text-[10px] font-mono flex items-center gap-1 transition-all disabled:opacity-50"
            title="Fetch a new dynamic playlist from YouTube"
          >
            <RotateCw className={`w-3 h-3 ${isLoadingPlaylist ? 'animate-spin text-cyan-400' : ''}`} />
            <span className="hidden sm:inline">Find New Songs</span>
          </button>
        </div>
      </div>

      {/* 1. LOADING STATE WITH SKELETON ROWS & DYNAMIC MESSAGE */}
      {isLoadingPlaylist && (
        <div className="flex flex-col gap-2 py-3 px-1">
          <div className="flex items-center justify-center gap-2 py-2 text-xs font-mono text-cyan-300">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span className="animate-pulse">{loadingMessage}</span>
          </div>

          {/* Skeleton Playlist Rows */}
          {Array.from({ length: 4 }).map((_, idx) => (
            <div
              key={idx}
              className="w-full p-2 rounded-xl bg-white/5 border border-white/5 flex items-center gap-3 animate-pulse"
            >
              <div className="w-10 h-10 rounded-lg bg-white/10 flex-shrink-0" />
              <div className="flex-1 flex flex-col gap-1.5">
                <div className="h-3 w-3/4 rounded bg-white/10" />
                <div className="h-2 w-1/2 rounded bg-white/5" />
              </div>
              <div className="h-3 w-8 rounded bg-white/5" />
            </div>
          ))}
        </div>
      )}

      {/* 2. MISSING API KEY CONFIGURATION PROMPT */}
      {!isLoadingPlaylist && apiError === 'MISSING_API_KEY' && (
        <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col gap-2 text-xs">
          <div className="flex items-start gap-2 text-amber-300">
            <KeyRound className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <div className="flex flex-col">
              <span className="font-bold">YouTube API Key Required</span>
              <span className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
                Add <code className="px-1 py-0.5 bg-black/40 rounded text-amber-300 font-mono">VITE_YOUTUBE_API_KEY</code> in your <code className="font-mono">.env</code> file, or enter an API key below to dynamically stream YouTube playlists.
              </span>
            </div>
          </div>

          {!showKeyInput ? (
            <button
              onClick={() => setShowKeyInput(true)}
              className="mt-1 w-full py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs transition-colors"
            >
              Enter API Key
            </button>
          ) : (
            <form onSubmit={handleSaveKey} className="flex gap-1.5 mt-1">
              <input
                type="password"
                value={inputKey}
                onChange={(e) => setInputKey(e.target.value)}
                placeholder="AIzaSy..."
                className="flex-1 px-2.5 py-1.5 rounded-xl bg-black/60 border border-amber-500/40 text-white text-xs font-mono focus:outline-none"
              />
              <button
                type="submit"
                className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs"
              >
                Save
              </button>
            </form>
          )}
        </div>
      )}

      {/* 3. GENERAL API ERROR STATE */}
      {!isLoadingPlaylist && apiError && apiError !== 'MISSING_API_KEY' && (
        <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/25 flex flex-col items-center gap-2 text-center text-xs">
          <AlertCircle className="w-5 h-5 text-rose-400" />
          <span className="text-slate-200 font-medium">Couldn't load the playlist</span>
          <p className="text-[10px] text-slate-400">
            {typeof apiError === 'string' && apiError !== 'COULD_NOT_LOAD' ? apiError : 'Network or YouTube API quota issue.'}
          </p>
          <button
            onClick={retryFetch}
            className="px-4 py-1.5 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-semibold text-xs transition-colors flex items-center gap-1.5"
          >
            <RotateCw className="w-3 h-3" />
            <span>Try Again</span>
          </button>
        </div>
      )}

      {/* 4. DYNAMIC STREAMED TRACKS LIST */}
      {!isLoadingPlaylist && !apiError && playlist.length > 0 && (
        <div className="flex flex-col gap-1">
          <div className="max-h-52 overflow-y-auto custom-scrollbar flex flex-col gap-1 pr-1">
            {playlist.map((track, index) => (
              <Track
                key={track.videoId + index}
                track={track}
                index={index}
                isActive={currentIndex === index}
                isPlaying={isPlaying}
                onSelect={selectTrack}
                accentColor={accentColor}
              />
            ))}
          </div>

          {/* Footer Metadata */}
          <div className="flex items-center justify-between pt-1.5 text-[10px] text-slate-400 font-mono px-1">
            <span>{playlist.length} Live Tracks</span>
            <span>Now Playing #{currentIndex + 1}</span>
          </div>
        </div>
      )}
    </div>
  );
};
