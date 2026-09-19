import React, { useRef, useState } from 'react';

/**
 * Scrubbable Music Player Progress Bar with Time Display & Hover Preview
 */
export const ProgressBar = ({
  currentTime,
  duration,
  progressPercent,
  formatTime,
  onSeek,
  accentColor = '#38bdf8',
}) => {
  const trackRef = useRef(null);
  const [hoverPercent, setHoverPercent] = useState(null);

  const handleSliderChange = (e) => {
    const newPercent = parseFloat(e.target.value);
    const newSeconds = (newPercent / 100) * duration;
    onSeek(newSeconds);
  };

  const handleMouseMove = (e) => {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const pct = Math.min(100, Math.max(0, ((e.clientX - rect.left) / rect.width) * 100));
    setHoverPercent(pct);
  };

  const hoverTime = hoverPercent !== null ? (hoverPercent / 100) * duration : null;

  return (
    <div className="w-full flex flex-col gap-1.5 select-none">
      {/* Slider Track */}
      <div
        ref={trackRef}
        className="relative w-full flex items-center group cursor-pointer py-2 -my-2"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoverPercent(null)}
      >
        {/* Hover Time Preview Tooltip */}
        {hoverPercent !== null && (
          <div
            className="absolute -top-7 -translate-x-1/2 bg-slate-900/95 border border-white/10 text-white text-[10px] font-mono px-1.5 py-0.5 rounded-md pointer-events-none whitespace-nowrap shadow-lg z-20 transition-opacity"
            style={{ left: `${hoverPercent}%` }}
          >
            {formatTime(hoverTime)}
          </div>
        )}

        <input
          type="range"
          min="0"
          max="100"
          step="0.1"
          value={isNaN(progressPercent) ? 0 : progressPercent}
          onChange={handleSliderChange}
          aria-label="Track Progress"
          className="w-full h-1.5 bg-slate-800 rounded-full appearance-none z-10 cursor-pointer focus:outline-none"
        />
        {/* Filled Gradient Highlight */}
        <div
          className="absolute left-0 top-1/2 -translate-y-1/2 h-1.5 rounded-full pointer-events-none transition-all duration-75"
          style={{
            width: `${progressPercent}%`,
            backgroundColor: accentColor,
            boxShadow: `0 0 10px ${accentColor}`,
          }}
        />
        {/* Hover Position Marker */}
        {hoverPercent !== null && (
          <div
            className="absolute top-1/2 w-2.5 h-2.5 rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none ring-2 ring-white/60 z-10 transition-opacity"
            style={{ left: `${hoverPercent}%`, backgroundColor: accentColor }}
          />
        )}
      </div>

      {/* Time Labels */}
      <div className="w-full flex justify-between items-center text-[10px] font-mono text-slate-400">
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(duration)}</span>
      </div>
    </div>
  );
};
