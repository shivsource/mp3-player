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
} from 'lucide-react';

/**
 * Floating Glassmorphic Music Player Card with Fixed Width
 */
export const MusicPlayer = ({
  player,
  accentColor = '#38bdf8',
}) => {
  const [isPlaylistOpen, setIsPlaylistOpen] = useState(false);
  // Start minimized on mobile so the full card doesn't cover the steering wheel on load
  const [isMinimized, setIsMinimized] = useState(() => window.innerWidth < 768);

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
    <div className="relative select-none w-[360px] sm:w-[390px] max-w-[calc(100vw-2rem)] flex flex-col items-end">
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

      <AnimatePresence mode="wait">
        {isMinimized ? (
          /* Minimized Floating Bar (Fixed Width matching Expanded Card) */
          <motion.div
            key="minimized"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            className="glass-panel w-full px-4 py-3 rounded-2xl flex items-center justify-between shadow-2xl border border-white/10"
          >
            <div className="flex items-center gap-3 min-w-0 flex-1 mr-2">
              {/* Rotating Mini Vinyl / Radio Icon */}
              <div
                className={`w-8 h-8 rounded-full overflow-hidden flex-shrink-0 border border-white/20 bg-slate-900 flex items-center justify-center ${
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
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                aria-label="Expand player"
              >
                <ChevronUp className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ) : (
          /* Full Floating Glass Card (Fixed Width) */
          <motion.div
            key="expanded"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            className="glass-panel w-full p-4 rounded-3xl flex flex-col gap-3 shadow-[0_25px_60px_rgba(0,0,0,0.85)] border border-white/10"
          >
            {/* Top Header: Badge, Video Toggle & Minimize Button */}
            <div className="flex items-center justify-between pb-1 border-b border-white/5">
              <div className="flex items-center gap-1.5 text-[10px] font-mono tracking-widest uppercase text-slate-300">
                <Radio className="w-3 h-3 text-cyan-400 animate-pulse" />
                <span>{radioTitle}</span>
              </div>

              <div className="flex items-center gap-1">
                {/* Minimize Card */}
                {/* <button
                  onClick={() => setIsMinimized(true)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors ml-1"
                  aria-label="Minimize player"
                >
                  <ChevronDown className="w-4 h-4" />
                </button> */}
              </div>
            </div>

            {/* Active Media Container (Embedded Real YouTube IFrame & Album Art) */}
            <div className="relative w-full rounded-2xl overflow-hidden bg-black/90 border border-white/10 shadow-inner">
              {/* Hidden YouTube IFrame (audio playback engine only) */}
              <div className="w-full h-0 overflow-hidden opacity-0 pointer-events-none">
                <div id="yt-player-host" className="w-full h-full" />
              </div>

              {/* Album Art View */}
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
                      <span className="text-[9px] font-mono uppercase tracking-wider text-cyan-400 font-semibold mb-0.5">
                        {radioSubtitle}
                      </span>
                      <h3 className="text-sm sm:text-base font-bold text-white truncate">
                        {currentTrack.title}
                      </h3>
                      <p className="text-xs text-slate-400 truncate mt-0.5">
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
  );
};
