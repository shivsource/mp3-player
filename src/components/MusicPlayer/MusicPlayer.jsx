import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ProgressBar } from './ProgressBar';
import { PlayerControls } from './PlayerControls';
import { Playlist } from './Playlist';
import {
  Disc3,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Loader2,
  Radio,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  ListMusic,
} from 'lucide-react';

/**
 * Responsive Music Player Card:
 * - Ultra-compact on mobile with prev-play-next buttons, leaving steering wheel fully visible
 * - Rich floating glass card on desktop
 */
export const MusicPlayer = ({
  player,
  accentColor = '#38bdf8',
}) => {
  const [isPlaylistOpen, setIsPlaylistOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  const {
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
    isLoadingPlaylist,
    radioTitle,
    radioSubtitle,
    trackNotification,
    togglePlay,
    nextTrack,
    prevTrack,
    selectTrack,
    seekTo,
    setVolume,
    toggleMute,
    formatTime,
  } = player;

  return (
    <div className="relative select-none w-full max-w-[360px] sm:max-w-none sm:w-[390px] flex flex-col items-stretch sm:items-end">
      {/* Permanent YouTube IFrame Audio Host (Must remain mounted across minimize/expand) */}
      <div className="fixed -left-[9999px] -top-[9999px] w-1 h-1 overflow-hidden opacity-0 pointer-events-none" aria-hidden="true">
        <div id="yt-player-host" />
      </div>

      {/* Toast Notification (e.g. skipped restricted video) */}
      <AnimatePresence>
        {trackNotification && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.9 }}
            className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900/90 border border-cyan-500/30 text-cyan-300 text-[11px] font-mono px-3 py-1 rounded-full shadow-2xl backdrop-blur-md whitespace-nowrap z-50 flex items-center gap-1.5"
          >
            <Sparkles className="w-3 h-3 text-cyan-400" />
            <span>{trackNotification}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ======================================================== */}
      {/* 1. COMPACT MOBILE PLAYLIST CARD (Visible on Mobile only) */}
      {/* ======================================================== */}
      <div className="block sm:hidden w-full">
        <div className="glass-panel w-full p-2.5 rounded-2xl flex flex-col gap-1.5 shadow-[0_15px_40px_rgba(0,0,0,0.8)] border border-white/10 backdrop-blur-xl">
          {/* Row 1: Cover Art, Song Info & Prev-Play-Next Buttons */}
          <div className="flex items-center justify-between gap-2 min-w-0">
            {/* Thumbnail + Title + Artist */}
            <div className="flex items-center gap-2 min-w-0 flex-1">
              {/* Cover Art Thumbnail */}
              <div
                className={`relative w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 bg-slate-900 border border-white/15 shadow-md ${
                  isPlaying ? 'ring-1 ring-cyan-400/50' : ''
                }`}
              >
                {currentTrack?.thumbnail ? (
                  <img
                    src={currentTrack.thumbnail}
                    alt={currentTrack.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Radio className="w-4 h-4 text-cyan-400" />
                  </div>
                )}
                {isPlaying && (
                  <div className="absolute inset-0 bg-black/40 flex items-end justify-center pb-1 gap-0.5 pointer-events-none">
                    <div className="w-0.5 bg-cyan-400 rounded-full eq-bar-1" />
                    <div className="w-0.5 bg-cyan-400 rounded-full eq-bar-2" />
                    <div className="w-0.5 bg-cyan-400 rounded-full eq-bar-3" />
                  </div>
                )}
              </div>

              {/* Title & Artist */}
              <div className="flex flex-col min-w-0 flex-1 justify-center leading-tight">
                <div className="flex items-center gap-1 mb-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse flex-shrink-0" />
                  <span className="text-[9px] font-mono uppercase tracking-wider text-cyan-300 font-semibold truncate">
                    {isPlaying ? 'Now Playing' : 'Paused'}
                  </span>
                </div>
                <h4
                  className="text-xs font-bold text-white truncate"
                  title={currentTrack?.title || radioTitle}
                >
                  {currentTrack?.title || radioTitle}
                </h4>
                <p
                  className="text-[10px] text-slate-400 truncate mt-0.5"
                  title={currentTrack?.artist || radioSubtitle}
                >
                  {currentTrack?.artist || radioSubtitle}
                </p>
              </div>
            </div>

            {/* Prev - Play - Next - Playlist Buttons */}
            <div className="flex items-center gap-1 flex-shrink-0">
              {/* Prev Button */}
              <button
                onClick={prevTrack}
                className="p-1.5 rounded-full text-slate-300 hover:text-white glass-button active:scale-90 transition-transform"
                aria-label="Previous track"
                title="Previous track"
              >
                <SkipBack className="w-3.5 h-3.5 fill-current" />
              </button>

              {/* Play / Pause Primary Button */}
              <button
                onClick={togglePlay}
                className="p-2 rounded-full text-slate-950 font-bold transition-all transform active:scale-90 shadow-md flex items-center justify-center"
                style={{
                  backgroundColor: accentColor,
                  boxShadow: `0 0 12px ${accentColor}99`,
                }}
                aria-label={isPlaying ? 'Pause' : 'Play'}
              >
                {isBuffering ? (
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                ) : isPlaying ? (
                  <Pause className="w-4 h-4 fill-current text-slate-950" />
                ) : (
                  <Play className="w-4 h-4 fill-current text-slate-950 ml-0.5" />
                )}
              </button>

              {/* Next Button */}
              <button
                onClick={nextTrack}
                className="p-1.5 rounded-full text-slate-300 hover:text-white glass-button active:scale-90 transition-transform"
                aria-label="Next track"
                title="Next track"
              >
                <SkipForward className="w-3.5 h-3.5 fill-current" />
              </button>

              {/* Playlist Toggle Button */}
              <button
                onClick={() => setIsPlaylistOpen(!isPlaylistOpen)}
                className={`p-1.5 rounded-full transition-colors glass-button ${
                  isPlaylistOpen
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                    : 'text-slate-400 hover:text-white'
                }`}
                aria-label="Toggle playlist drawer"
                title="Toggle playlist drawer"
              >
                <ListMusic className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Row 2: Slim Progress Scrubber */}
          <div className="w-full flex items-center gap-2 pt-0.5">
            <span className="text-[9px] font-mono text-slate-400 flex-shrink-0 w-6">
              {formatTime(currentTime)}
            </span>
            <div className="relative flex-1 flex items-center group cursor-pointer">
              <input
                type="range"
                min="0"
                max="100"
                step="0.1"
                value={isNaN(progressPercent) ? 0 : progressPercent}
                onChange={(e) => seekTo((parseFloat(e.target.value) / 100) * duration)}
                aria-label="Track Progress"
                className="w-full h-1 bg-slate-800 rounded-full appearance-none z-10 cursor-pointer focus:outline-none"
              />
              <div
                className="absolute left-0 top-0 bottom-0 rounded-full pointer-events-none transition-all duration-75"
                style={{
                  width: `${progressPercent}%`,
                  backgroundColor: accentColor,
                  boxShadow: `0 0 6px ${accentColor}`,
                }}
              />
            </div>
            <span className="text-[9px] font-mono text-slate-400 flex-shrink-0 w-6 text-right">
              {formatTime(duration)}
            </span>
          </div>

          {/* Collapsible Mobile Playlist Section */}
          <AnimatePresence>
            {isPlaylistOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.22, ease: 'easeInOut' }}
                className="overflow-hidden pt-1 border-t border-white/10"
              >
                <Playlist
                  player={player}
                  accentColor={accentColor}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. RICH DESKTOP PLAYLIST CARD (Visible on Desktop / sm+)  */}
      {/* ======================================================== */}
      <div className="hidden sm:block w-full">
        <AnimatePresence mode="wait">
          {isMinimized ? (
            /* Minimized Floating Bar (Desktop) */
            <motion.div
              key="minimized"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.2 }}
              className="glass-panel w-full px-4 py-3 rounded-2xl flex items-center justify-between shadow-2xl border border-white/10"
            >
              <div
                onClick={() => setIsMinimized(false)}
                className="flex items-center gap-3 min-w-0 flex-1 mr-2 cursor-pointer"
              >
                {/* Rotating Mini Vinyl / Radio Icon */}
                <div
                  className={`w-9 h-9 rounded-full overflow-hidden flex-shrink-0 border border-white/20 bg-slate-900 flex items-center justify-center ${
                    isPlaying ? 'animate-spin' : ''
                  }`}
                  style={{ animationDuration: '6s' }}
                >
                  {currentTrack?.thumbnail ? (
                    <img
                      src={currentTrack.thumbnail}
                      alt={currentTrack.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Radio className="w-4 h-4 text-cyan-400" />
                  )}
                </div>

                {/* Title & Artist */}
                <div className="flex flex-col min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] font-mono uppercase tracking-wider text-cyan-400 font-semibold">
                      {isPlaying ? 'Playing' : 'Paused'}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-white truncate">
                    {currentTrack?.title || radioTitle}
                  </span>
                  <span className="text-[10px] text-slate-400 truncate">
                    {currentTrack?.artist || radioSubtitle}
                  </span>
                </div>
              </div>

              {/* Controls: Play/Pause & Expand */}
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <button
                  onClick={togglePlay}
                  className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                  aria-label={isPlaying ? 'Pause' : 'Play'}
                >
                  {isPlaying ? (
                    <Pause className="w-3.5 h-3.5 text-cyan-400 fill-current" />
                  ) : (
                    <Play className="w-3.5 h-3.5 text-cyan-400 fill-current ml-0.5" />
                  )}
                </button>

                <button
                  onClick={() => setIsMinimized(false)}
                  className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                  aria-label="Expand player"
                  title="Expand player"
                >
                  <ChevronUp className="w-4 h-4 text-cyan-400" />
                </button>
              </div>
            </motion.div>
          ) : (
            /* Full Floating Glass Card (Desktop) */
            <motion.div
              key="expanded"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.2 }}
              className="glass-panel w-full p-4 rounded-3xl flex flex-col gap-3 shadow-[0_25px_60px_rgba(0,0,0,0.85)] border border-white/10"
            >
              {/* Top Header: Badge, Playlist Drawer Toggle & Minimize Button */}
              <div className="flex items-center justify-between pb-1 border-b border-white/5">
                <div className="flex items-center gap-1.5 text-[10px] font-mono tracking-widest uppercase text-slate-300 min-w-0 pr-2">
                  <Radio className="w-3 h-3 text-cyan-400 animate-pulse flex-shrink-0" />
                  <span className="truncate">{radioTitle}</span>
                </div>

                <div className="flex items-center gap-1.5 flex-shrink-0">
                  {/* Playlist Quick Toggle in Header */}
                  <button
                    onClick={() => setIsPlaylistOpen(!isPlaylistOpen)}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-mono transition-all flex items-center gap-1 ${
                      isPlaylistOpen
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_8px_rgba(6,182,212,0.3)]'
                        : 'text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10'
                    }`}
                    aria-label="Toggle playlist drawer"
                    title="Toggle playlist drawer"
                  >
                    <span>Playlist</span>
                    {playlist.length > 0 && (
                      <span className="text-[9px] opacity-75">({playlist.length})</span>
                    )}
                  </button>

                  {/* Minimize Card Button */}
                  <button
                    onClick={() => setIsMinimized(true)}
                    className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                    aria-label="Minimize player"
                    title="Minimize player"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Active Media Container (Embedded Real YouTube IFrame & Album Art) */}
              <div className="relative w-full rounded-2xl overflow-hidden bg-black/90 border border-white/10 shadow-inner">
                {/* Album Art & Track Info View */}
                <div className="p-3 flex items-center gap-3.5 min-h-[76px]">
                  {isLoadingPlaylist ? (
                    <div className="w-full flex items-center gap-3 animate-pulse">
                      <div className="w-16 h-16 rounded-2xl bg-white/10 flex-shrink-0 flex items-center justify-center">
                        <Loader2 className="w-6 h-6 text-cyan-400 animate-spin" />
                      </div>
                      <div className="flex-1 flex flex-col gap-2">
                        <div className="h-3.5 w-3/4 rounded bg-white/10" />
                        <div className="h-2.5 w-1/2 rounded bg-white/5" />
                      </div>
                    </div>
                  ) : currentTrack ? (
                    <>
                      {/* Album Cover Art */}
                      <div className="relative w-16 h-16 sm:w-18 sm:h-18 rounded-2xl overflow-hidden flex-shrink-0 bg-slate-900 border border-white/15 shadow-lg group">
                        <img
                          src={currentTrack.thumbnail}
                          alt={currentTrack.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-tr from-black/40 via-transparent to-white/10 pointer-events-none" />
                      </div>

                      {/* Track Titles & Radio Genre */}
                      <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className="inline-flex items-center gap-1 text-[9px] font-mono uppercase tracking-wider text-cyan-400 font-semibold">
                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                            Now Playing
                          </span>
                        </div>
                        <h3 className="text-sm sm:text-base font-bold text-white truncate" title={currentTrack.title}>
                          {currentTrack.title}
                        </h3>
                        <p className="text-xs text-slate-400 truncate mt-0.5" title={currentTrack.artist}>
                          {currentTrack.artist}
                        </p>
                      </div>
                    </>
                  ) : (
                    <div className="w-full flex items-center justify-center py-4 text-xs font-mono text-slate-400 gap-2">
                      <Radio className="w-4 h-4 text-cyan-400" />
                      <span>{radioTitle}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Progress Scrubber */}
              <ProgressBar
                currentTime={currentTime}
                duration={duration}
                progressPercent={progressPercent}
                formatTime={formatTime}
                onSeek={seekTo}
                accentColor={accentColor}
              />

              {/* Player Transport Controls */}
              <PlayerControls
                isPlaying={isPlaying}
                isMuted={isMuted}
                volume={volume}
                isBuffering={isBuffering}
                onTogglePlay={togglePlay}
                onNext={nextTrack}
                onPrev={prevTrack}
                onVolumeChange={setVolume}
                onToggleMute={toggleMute}
                isPlaylistOpen={isPlaylistOpen}
                onTogglePlaylist={() => setIsPlaylistOpen(!isPlaylistOpen)}
                accentColor={accentColor}
              />

              {/* Collapsible Playlist Section */}
              <AnimatePresence>
                {isPlaylistOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                    <Playlist
                      player={player}
                      accentColor={accentColor}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
