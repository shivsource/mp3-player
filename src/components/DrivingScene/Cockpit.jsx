import React from 'react';
import { SteeringWheel } from './SteeringWheel';
import { Speedometer } from './Speedometer';
import { RearviewMirror } from './RearviewMirror';
import { RainEffect } from './RainEffect';
import { Radio, Navigation, Music2 } from 'lucide-react';

/**
 * Photorealistic Luxury Vehicle Cockpit & Dashboard Frame
 * Integrates interior pillars, windshield reflections, dynamic ambient LED lighting,
 * digital instrument cluster, center console infotainment, and realistic steering wheel.
 */
export const Cockpit = ({
  mode,
  timeMode = 'night',
  displaySpeed,
  steeringAngle,
  animStateRef,
  isRainEnabled,
  isPlaying,
  currentTrack,
  onPrevTrack,
  onTogglePlay,
  onNextTrack,
}) => {
  const isDay = timeMode === 'day';
  const isSunset = timeMode === 'sunset';

  return (
    <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden flex flex-col justify-between">
      {/* 1. Windshield Rain & Animated Wipers */}
      <RainEffect isEnabled={isRainEnabled} />

      {/* 2. Top Windshield Tint & Rearview Mirror */}
      <div
        className={`relative w-full pt-4 pb-2 px-6 flex justify-center items-start transition-colors duration-700 ${
          isDay
            ? 'bg-gradient-to-b from-sky-900/40 via-sky-800/10 to-transparent'
            : isSunset
            ? 'bg-gradient-to-b from-amber-950/60 via-black/20 to-transparent'
            : 'bg-gradient-to-b from-black/80 via-black/30 to-transparent'
        }`}
      >
        <RearviewMirror mode={mode} animStateRef={animStateRef} />
      </div>

      {/* 3. Cockpit A-Pillars (Left & Right framing windshield with realistic leather stitch) */}
      <div
        className={`absolute top-0 bottom-0 left-0 w-8 md:w-16 transition-colors duration-700 ${
          isDay
            ? 'bg-gradient-to-r from-slate-900 via-slate-800 to-transparent opacity-90'
            : 'bg-gradient-to-r from-slate-950 via-slate-900 to-transparent opacity-95'
        }`}
      />
      <div
        className={`absolute top-0 bottom-0 right-0 w-8 md:w-16 transition-colors duration-700 ${
          isDay
            ? 'bg-gradient-to-l from-slate-900 via-slate-800 to-transparent opacity-90'
            : 'bg-gradient-to-l from-slate-950 via-slate-900 to-transparent opacity-95'
        }`}
      />

      {/* 4. Bottom Dashboard & Steering Wheel Area */}
      <div className="relative w-full flex flex-col items-center">
        {/* Dynamic Ambient Dash LED Strip */}
        <div
          className="w-full h-1 sm:h-1.5 transition-colors duration-700 ease-out"
          style={{
            backgroundColor: mode.accentColor,
            boxShadow: `0 0 20px 2px ${mode.accentColor}, 0 0 6px ${mode.accentColor}`,
          }}
        />

        {/* Dashboard Cowl / Surface with Textured Depth */}
        <div
          className={`relative w-full pt-3 pb-0 px-4 flex flex-col items-center border-t shadow-[0_-20px_50px_rgba(0,0,0,0.9)] transition-colors duration-700 ${
            isDay
              ? 'bg-gradient-to-b from-slate-900 via-slate-800 to-slate-950 border-white/10'
              : 'bg-gradient-to-b from-slate-950 via-slate-900 to-black border-white/5'
          }`}
        >
          {/* Realistic Steering Wheel positioned bottom-center, with the Speedometer
              pinned to its left on large screens (stacked above it on smaller ones) */}
          <div className="relative w-full flex flex-col lg:flex-row items-center justify-center gap-2 lg:gap-0 -mb-8 sm:-mb-12 md:-mb-16 z-20">
            {/* Instrument Cluster Gauge (Speedometer) */}
            <div className="relative z-10 lg:absolute lg:left-4 xl:left-12 lg:top-1/2 lg:-translate-y-1/2">
              <Speedometer speedKmh={displaySpeed} mode={mode} isPlaying={isPlaying} />
            </div>

            <SteeringWheel
              steeringAngle={steeringAngle}
              accentColor={mode.accentColor}
              isPlaying={isPlaying}
              onPrevTrack={onPrevTrack}
              onTogglePlay={onTogglePlay}
              onNextTrack={onNextTrack}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
