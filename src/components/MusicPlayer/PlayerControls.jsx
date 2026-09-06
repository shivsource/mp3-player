import React, { useState } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  ListMusic,
  Radio,
} from 'lucide-react';

/**
 * Music Playback Controls (Play/Pause, Skip, Volume, Playlist Toggle)
 */
export const PlayerControls = ({
  isPlaying,
  isMuted,
  volume,
  isBuffering,
  onTogglePlay,
  onNext,
  onPrev,
  onVolumeChange,
  onToggleMute,
  isPlaylistOpen,
  onTogglePlaylist,
  accentColor = '#38bdf8',
}) => {
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);

  return (
    <div className="w-full flex items-center justify-between gap-2 pt-1 select-none">
      {/* Left: Volume & Mute Control */}
      <div className="relative flex items-center">
        <button
          onClick={onToggleMute}
          onMouseEnter={() => setShowVolumeSlider(true)}
          className="p-2 rounded-full text-slate-400 hover:text-white glass-button transition-colors"
          aria-label={isMuted ? 'Unmute audio' : 'Mute audio'}
        >
          {isMuted || volume === 0 ? (
            <VolumeX className="w-4 h-4 text-rose-400" />
          ) : (
            <Volume2 className="w-4 h-4" />
          )}
        </button>

        {/* Volume Slider Flyout */}
        <div
          onMouseLeave={() => setShowVolumeSlider(false)}
          className={`absolute left-9 -top-1 bg-slate-900/90 border border-white/10 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-2 transition-all duration-200 z-30 ${
            showVolumeSlider ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
          }`}
        >
          <input
            type="range"
            min="0"
            max="100"
            value={isMuted ? 0 : volume}
            onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
            aria-label="Volume"
            className="w-16 h-1 bg-slate-700 rounded-full appearance-none cursor-pointer"
          />
          <span className="text-[9px] font-mono text-slate-400 w-5">
            {isMuted ? 0 : volume}%
          </span>
        </div>
      </div>

      {/* Center: Playback Transport Buttons */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Previous Button */}
        <button
          onClick={onPrev}
          className="p-2 sm:p-2.5 rounded-full text-slate-300 hover:text-white glass-button active:scale-95 transition-transform"
          aria-label="Previous track"
        >
          <SkipBack className="w-4 h-4 fill-current" />
        </button>

        {/* Play / Pause Primary Button */}
        <button
          onClick={onTogglePlay}
          className="relative p-3.5 sm:p-4 rounded-full text-slate-950 font-bold transition-all duration-300 transform active:scale-90 hover:scale-105"
          style={{
            backgroundColor: accentColor,
            boxShadow: `0 0 20px ${accentColor}88, 0 4px 14px rgba(0,0,0,0.5)`,
          }}
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isBuffering ? (
            <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
          ) : isPlaying ? (
            <Pause className="w-5 h-5 fill-current text-slate-950" />
          ) : (
            <Play className="w-5 h-5 fill-current text-slate-950 ml-0.5" />
          )}
        </button>

        {/* Next Button */}
        <button
          onClick={onNext}
          className="p-2 sm:p-2.5 rounded-full text-slate-300 hover:text-white glass-button active:scale-95 transition-transform"
          aria-label="Next track"
        >
          <SkipForward className="w-4 h-4 fill-current" />
        </button>
      </div>

      {/* Right: Playlist Drawer Toggle */}
      <div className="flex items-center">
        <button
          onClick={onTogglePlaylist}
          className={`p-2 rounded-full transition-all duration-200 glass-button ${
            isPlaylistOpen ? 'text-cyan-400 bg-white/10' : 'text-slate-400 hover:text-white'
          }`}
          aria-label="Toggle playlist drawer"
        >
          <ListMusic className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
