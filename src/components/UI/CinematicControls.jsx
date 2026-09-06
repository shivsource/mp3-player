import React, { useState } from 'react';
import {
  CloudRain,
  Sun,
  Sunset,
  Moon,
  Maximize,
  Minimize,
  Eye,
  EyeOff,
  HelpCircle,
} from 'lucide-react';

/**
 * Top floating toolbar with atmospheric toggles (Day/Sunset/Night, Rain, Fullscreen, Shortcuts)
 */
export const CinematicControls = ({
  timeMode,
  onChangeTimeMode,
  isRainEnabled,
  onToggleRain,
  isUiHidden,
  onToggleHideUi,
  onOpenHelp,
  accentColor = '#38bdf8',
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
        setIsFullscreen(false);
      }
    }
  };

  const nextTimeMode = () => {
    if (timeMode === 'night') onChangeTimeMode('day');
    else if (timeMode === 'day') onChangeTimeMode('sunset');
    else onChangeTimeMode('night');
  };

  const TimeIcon = timeMode === 'day' ? Sun : timeMode === 'sunset' ? Sunset : Moon;

  return (
    <div className="relative flex items-center gap-1.5 select-none">
      {/* Top Floating Glass Bar */}
      <div className="glass-panel p-1.5 rounded-full flex items-center gap-1 shadow-2xl border border-white/10">
        {/* Day / Sunset / Night Mode Switcher Button */}
        <button
          onClick={nextTimeMode}
          className={`px-2 sm:px-2.5 py-1.5 rounded-full flex items-center gap-1.5 text-xs font-mono transition-all duration-200 ${
            timeMode === 'day'
              ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40 shadow-[0_0_12px_rgba(251,191,36,0.3)]'
              : timeMode === 'sunset'
              ? 'bg-orange-500/20 text-orange-300 border border-orange-500/40 shadow-[0_0_12px_rgba(249,115,22,0.3)]'
              : 'text-cyan-300 bg-cyan-500/15 border border-cyan-500/30'
          }`}
          title="Toggle Time of Day (Day / Sunset / Night)"
          aria-label="Toggle Time of Day"
        >
          <TimeIcon className="w-3.5 h-3.5" />
          <span className="hidden sm:inline capitalize font-semibold text-[11px]">{timeMode}</span>
        </button>

        {/* Rain Toggle */}
        <button
          onClick={onToggleRain}
          className={`p-2 rounded-full transition-all duration-200 ${
            isRainEnabled
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
              : 'text-slate-400 hover:text-white glass-button'
          }`}
          title="Toggle Rain & Wipers (R)"
          aria-label="Toggle Rain"
        >
          <CloudRain className="w-4 h-4" />
        </button>

        {/* Fullscreen Toggle */}
        <button
          onClick={toggleFullscreen}
          className="p-2 rounded-full text-slate-400 hover:text-white glass-button transition-colors"
          title="Toggle Fullscreen"
          aria-label="Toggle Fullscreen"
        >
          {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
        </button>

        {/* Hide / Show UI */}
        <button
          onClick={onToggleHideUi}
          className="p-2 rounded-full text-slate-400 hover:text-white glass-button transition-colors"
          title="Pure Wallpaper Mode (H)"
          aria-label="Hide UI"
        >
          {isUiHidden ? <Eye className="w-4 h-4 text-cyan-400" /> : <EyeOff className="w-4 h-4" />}
        </button>

        {/* Shortcuts Help Modal */}
        <button
          onClick={onOpenHelp}
          className="p-2 rounded-full text-slate-400 hover:text-white glass-button transition-colors"
          title="Keyboard Shortcuts (?)"
          aria-label="Keyboard Shortcuts"
        >
          <HelpCircle className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
