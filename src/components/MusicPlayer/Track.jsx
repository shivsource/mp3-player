import React from 'react';

/**
 * Individual Playlist Item Component
 */
export const Track = ({
  track,
  index,
  isActive,
  isPlaying,
  onSelect,
  accentColor = '#38bdf8',
}) => {
  return (
    <button
      onClick={() => onSelect(index)}
      className={`w-full p-2 rounded-xl flex items-center gap-3 text-left transition-all duration-200 group ${
        isActive
          ? 'bg-white/15 border border-cyan-500/40 shadow-lg shadow-cyan-500/10 ring-1 ring-cyan-500/20'
          : 'hover:bg-white/5 border border-transparent'
      }`}
      aria-label={`Play ${track.title} by ${track.artist}`}
    >
      {/* Thumbnail with Overlay Equalizer */}
      <div className="relative w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-slate-900 border border-white/10">
        <img
          src={track.thumbnail}
          alt={track.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />

        {/* Animated Equalizer Overlay when active & playing */}
        {isActive && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-end justify-center gap-0.5 pb-1.5 px-1">
            {isPlaying ? (
              <>
                <div className="w-1 bg-cyan-400 rounded-full eq-bar-1" />
                <div className="w-1 bg-cyan-400 rounded-full eq-bar-2" />
                <div className="w-1 bg-cyan-400 rounded-full eq-bar-3" />
                <div className="w-1 bg-cyan-400 rounded-full eq-bar-4" />
              </>
            ) : (
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            )}
          </div>
        )}
      </div>

      {/* Track Meta */}
      <div className="flex-1 min-w-0">
        <h4
          className={`text-xs font-semibold truncate transition-colors ${
            isActive ? 'text-white' : 'text-slate-200 group-hover:text-white'
          }`}
          style={{ color: isActive ? accentColor : undefined }}
        >
          {track.title}
        </h4>
        <p className="text-[10px] text-slate-400 truncate mt-0.5">
          {track.artist}
        </p>
      </div>

      {/* Duration and Playing Status Badge */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        {isActive && (
          <span
            className="text-[9px] font-mono px-1.5 py-0.5 rounded font-bold uppercase tracking-wider"
            style={{ backgroundColor: `${accentColor}25`, color: accentColor }}
          >
            {isPlaying ? 'PLAYING' : 'PAUSED'}
          </span>
        )}
        <span className="text-[10px] font-mono text-slate-400">
          {track.duration}
        </span>
      </div>
    </button>
  );
};
