import React, { useState, useEffect } from 'react';
import { Compass, Gauge, Zap } from 'lucide-react';

/**
 * Modern Digital Instrument Cluster HUD
 * Shows live speed, gear, RPM power gauge, and driving mode status.
 */
export const Speedometer = ({ speedKmh, mode, isPlaying }) => {
  const [odometer, setOdometer] = useState(14820.4);

  // Increment trip odometer smoothly
  useEffect(() => {
    const interval = setInterval(() => {
      setOdometer((prev) => +(prev + 0.02).toFixed(1));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const maxSpeed = 160;
  const speedPercentage = Math.min(100, (speedKmh / maxSpeed) * 100);
  const rpm = Math.round(1400 + (speedKmh / 120) * 2600);

  return (
    <div className="relative pointer-events-none flex flex-col items-center select-none">
      {/* Cluster Glass Container */}
      <div className="glass-panel-subtle px-5 py-2.5 rounded-2xl flex items-center gap-6 border border-white/10 shadow-2xl backdrop-blur-md">
        {/* Left: Gear & Mode Badge */}
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-1">
            <span className="text-xs font-mono font-bold text-slate-500">P R N</span>
            <span
              className="text-base font-mono font-black px-1.5 py-0.5 rounded bg-white/10 text-white border border-white/20"
              style={{ color: mode.accentColor, textShadow: `0 0 8px ${mode.accentColor}` }}
            >
              D
            </span>
          </div>
          <span className="text-[10px] uppercase font-mono tracking-widest text-slate-400 mt-1">
            {mode.label} Mode
          </span>
        </div>

        {/* Center: Main Digital Speed */}
        <div className="flex flex-col items-center min-w-[90px]">
          <div className="flex items-baseline gap-1">
            <span
              className="text-4xl sm:text-5xl font-mono font-extrabold tracking-tighter text-white drop-shadow-md tabular-nums"
              style={{ textShadow: `0 0 16px ${mode.accentColor}66` }}
            >
              {speedKmh}
            </span>
            <span className="text-xs font-mono font-semibold text-slate-400 uppercase">
              km/h
            </span>
          </div>

          {/* RPM / Speed Arc Gauge Line */}
          <div className="w-full bg-slate-800/80 h-1.5 rounded-full overflow-hidden mt-1 border border-white/5">
            <div
              className="h-full rounded-full transition-all duration-300 ease-out"
              style={{
                width: `${speedPercentage}%`,
                backgroundColor: mode.accentColor,
                boxShadow: `0 0 10px ${mode.accentColor}`,
              }}
            />
          </div>
        </div>

        {/* Right: Power & Odometer */}
        <div className="hidden sm:flex flex-col items-end text-right">
          <div className="flex items-center gap-1.5 text-slate-400 text-xs font-mono">
            <Zap className="w-3 h-3 text-amber-400" />
            <span className="text-slate-200">{rpm}</span>
            <span className="text-[10px] text-slate-500">RPM</span>
          </div>
          <div className="text-[10px] font-mono text-slate-400 mt-1 tracking-wider">
            ODO <span className="text-slate-200">{odometer.toLocaleString()}</span> KM
          </div>
        </div>
      </div>
    </div>
  );
};
