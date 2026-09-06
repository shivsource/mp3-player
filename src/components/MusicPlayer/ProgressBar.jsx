import React from 'react';

/**
 * Scrubbable Music Player Progress Bar with Time Display
 */
export const ProgressBar = ({
  currentTime,
  duration,
  progressPercent,
  formatTime,
  onSeek,
  accentColor = '#38bdf8',
}) => {
  const handleSliderChange = (e) => {
    const newPercent = parseFloat(e.target.value);
    const newSeconds = (newPercent / 100) * duration;
    onSeek(newSeconds);
  };

  return (
    <div className="w-full flex flex-col gap-1.5 select-none">
      {/* Slider Track */}
      <div className="relative w-full flex items-center group cursor-pointer">
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
          className="absolute left-0 top-0 bottom-0 rounded-full pointer-events-none transition-all duration-75"
          style={{
            width: `${progressPercent}%`,
            backgroundColor: accentColor,
            boxShadow: `0 0 10px ${accentColor}`,
          }}
        />
      </div>

      {/* Time Labels */}
      <div className="w-full flex justify-between items-center text-[10px] font-mono text-slate-400">
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(duration)}</span>
      </div>
    </div>
  );
};
