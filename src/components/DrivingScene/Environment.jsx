import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TIME_MODES } from '../../data/drivingModes';

/**
 * Photorealistic Parallax Environment
 * Supports Day, Sunset, and Night lighting across Highway, City, and Village.
 */
export const Environment = ({ mode, cameraOffset, timeMode = 'night', isRainEnabled }) => {
  const isHighway = mode.id === 'highway';
  const isCity = mode.id === 'city';
  const isVillage = mode.id === 'village';

  const isDay = timeMode === 'day';
  const isSunset = timeMode === 'sunset';
  const isNight = timeMode === 'night';

  const timePreset = TIME_MODES[timeMode] || TIME_MODES.night;

  // Realistic clouds coordinates
  const clouds = useMemo(() => {
    return [
      { id: 1, x: 10, y: 12, w: 220, h: 45, opacity: isDay ? 0.8 : isSunset ? 0.5 : 0.2 },
      { id: 2, x: 45, y: 8, w: 280, h: 55, opacity: isDay ? 0.7 : isSunset ? 0.6 : 0.15 },
      { id: 3, x: 75, y: 16, w: 190, h: 40, opacity: isDay ? 0.85 : isSunset ? 0.45 : 0.25 },
    ];
  }, [isDay, isSunset]);

  // City skyscrapers
  const buildings = useMemo(() => {
    return Array.from({ length: 30 }).map((_, i) => {
      const height = 30 + (Math.sin(i * 1.5) * 0.5 + 0.5) * 50;
      const width = 3.2 + (i % 3) * 0.8;
      const isTower = i % 4 === 0;
      const glassTint = isDay
        ? (i % 2 === 0 ? '#0284c7' : '#0369a1')
        : isSunset
        ? (i % 2 === 0 ? '#ea580c' : '#7c2d12')
        : (i % 3 === 0 ? '#38bdf8' : i % 3 === 1 ? '#f43f5e' : '#a855f7');
      return {
        id: i,
        left: i * 3.4,
        width,
        height,
        isTower,
        glassTint,
      };
    });
  }, [isDay, isSunset]);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {/* 1. Dynamic Photorealistic Sky Gradient */}
      <motion.div
        key={mode.id + timeMode}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.0, ease: 'easeInOut' }}
        className="absolute inset-0"
        style={{ background: timePreset.skyGradient }}
      />

      {/* 2. Realistic Celestial Body (Day Sun with Lens Flare / Golden Sunset / Crescent Moon) */}
      <motion.div
        animate={{
          x: cameraOffset.x * 0.25,
          y: cameraOffset.y * 0.25,
        }}
        transition={{ type: 'spring', damping: 25, stiffness: 80 }}
        className="absolute pointer-events-none"
        style={{ left: timePreset.sunPosition.x, top: timePreset.sunPosition.y }}
      >
        {isDay ? (
          // Radiant Realistic Sun with Atmospheric Lens Flare
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-white shadow-[0_0_80px_rgba(255,255,255,0.9),0_0_150px_rgba(56,189,248,0.6)]" />
            <div className="absolute -inset-10 rounded-full bg-yellow-200/30 blur-2xl animate-pulse-subtle" />
            {/* Lens flare horizontal streak */}
            <div className="absolute top-1/2 -left-36 -right-36 h-0.5 bg-gradient-to-r from-transparent via-cyan-200/60 to-transparent blur-xs" />
          </div>
        ) : isSunset ? (
          // Golden Sunset Sun sinking near horizon
          <div className="relative">
            <div className="w-28 h-28 rounded-full bg-gradient-to-t from-orange-600 via-amber-400 to-yellow-200 blur-xs shadow-[0_0_90px_rgba(249,115,22,0.8)]" />
            <div className="absolute -inset-12 rounded-full bg-orange-500/30 blur-3xl animate-pulse-subtle" />
          </div>
        ) : (
          // Night Crescent Moon with Starlight Glow
          <div className="relative">
            <div className="w-14 h-14 rounded-full bg-slate-100 shadow-[0_0_35px_rgba(255,255,255,0.4)]" />
            <div className="absolute inset-0 translate-x-3 -translate-y-1 w-14 h-14 rounded-full bg-midnight-950" />
            <div className="absolute -inset-6 rounded-full bg-cyan-400/10 blur-xl" />
          </div>
        )}
      </motion.div>

      {/* 3. Soft Volumetric Clouds Layer */}
      <motion.div
        animate={{ x: cameraOffset.x * 0.15 }}
        className="absolute inset-x-0 top-0 h-[45%] pointer-events-none"
      >
        {clouds.map((c) => (
          <div
            key={c.id}
            className="absolute rounded-full filter blur-md transition-opacity duration-1000"
            style={{
              left: `${c.x}%`,
              top: `${c.y}%`,
              width: `${c.w}px`,
              height: `${c.h}px`,
              backgroundColor: isDay ? '#ffffff' : isSunset ? '#fb923c' : '#334155',
              opacity: c.opacity,
            }}
          />
        ))}
      </motion.div>

      {/* 4. Distant Parallax Horizon Layer */}
      <motion.div
        animate={{
          x: cameraOffset.x * 0.45,
          y: cameraOffset.y * 0.45,
        }}
        className="absolute inset-x-0 bottom-[47%] h-[38%] flex items-end justify-between pointer-events-none"
      >
        <AnimatePresence mode="wait">
          {/* HIGHWAY: Photorealistic Multi-Ridge Mountain Ranges */}
          {isHighway && (
            <motion.div
              key={`highway-${timeMode}`}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              transition={{ duration: 0.8 }}
              className="w-full h-full relative"
            >
              {/* Back Distant Snowcaps / Peaks */}
              <svg
                viewBox="0 0 1440 320"
                preserveAspectRatio="none"
                className="absolute bottom-0 w-full h-[95%]"
              >
                <path
                  d="M0,170 L160,70 L340,190 L520,60 L700,160 L880,50 L1060,180 L1240,80 L1440,170 L1440,320 L0,320 Z"
                  fill={isDay ? '#64748b' : isSunset ? '#451a03' : '#0f172a'}
                  opacity={0.7}
                />
              </svg>

              {/* Front Mountain Ridge */}
              <svg
                viewBox="0 0 1440 320"
                preserveAspectRatio="none"
                className="absolute bottom-0 w-full h-[65%]"
              >
                <path
                  d="M0,230 L220,110 L460,240 L700,120 L940,220 L1180,120 L1440,230 L1440,320 L0,320 Z"
                  fill={isDay ? '#334155' : isSunset ? '#292524' : '#020617'}
                />
              </svg>
            </motion.div>
          )}

          {/* CITY: Photorealistic Metropolis Skyline */}
          {isCity && (
            <motion.div
              key={`city-${timeMode}`}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              transition={{ duration: 0.8 }}
              className="w-full h-full relative flex items-end overflow-hidden"
            >
              {buildings.map((b) => (
                <div
                  key={b.id}
                  className="absolute bottom-0 border-t border-x"
                  style={{
                    left: `${b.left}%`,
                    width: `${b.width}%`,
                    height: `${b.height}%`,
                    backgroundColor: isDay ? '#1e293b' : isSunset ? '#1c1917' : '#030712',
                    borderColor: isDay ? '#475569' : '#1e293b',
                    boxShadow: !isDay && b.isTower ? `0 0 20px ${b.glassTint}33` : 'none',
                  }}
                >
                  {/* Spire / Antenna */}
                  {b.isTower && (
                    <div
                      className="absolute -top-7 left-1/2 -translate-x-1/2 w-0.5 h-7"
                      style={{
                        backgroundColor: isDay ? '#94a3b8' : b.glassTint,
                        boxShadow: !isDay ? `0 0 10px ${b.glassTint}` : 'none',
                      }}
                    />
                  )}

                  {/* Window Grid Pattern */}
                  <div className="w-full h-full p-1 grid grid-cols-3 gap-0.5 opacity-80">
                    {Array.from({ length: 14 }).map((_, wIdx) => (
                      <div
                        key={wIdx}
                        className="w-full h-1.5 rounded-[1px]"
                        style={{
                          backgroundColor: isDay
                            ? (b.id + wIdx) % 3 === 0
                              ? '#93c5fd'
                              : 'rgba(255,255,255,0.15)'
                            : isSunset
                            ? (b.id + wIdx) % 3 === 0
                              ? '#fdba74'
                              : 'rgba(251,146,60,0.15)'
                            : (b.id + wIdx) % 3 === 0
                            ? b.glassTint
                            : (b.id + wIdx) % 2 === 0
                            ? '#fef08a'
                            : 'rgba(255,255,255,0.08)',
                          opacity: (b.id + wIdx) % 4 === 0 ? 0.9 : 0.25,
                        }}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {/* VILLAGE: Lush Countryside Rolling Hills & Pine Trees */}
          {isVillage && (
            <motion.div
              key={`village-${timeMode}`}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              transition={{ duration: 0.8 }}
              className="w-full h-full relative"
            >
              {/* Back Rolling Hills */}
              <svg
                viewBox="0 0 1440 320"
                preserveAspectRatio="none"
                className="absolute bottom-0 w-full h-[85%]"
              >
                <path
                  d="M0,170 Q360,80 720,180 T1440,150 L1440,320 L0,320 Z"
                  fill={isDay ? '#65a30d' : isSunset ? '#9a3412' : '#14532d'}
                  opacity={0.65}
                />
              </svg>

              {/* Front Foreground Hills */}
              <svg
                viewBox="0 0 1440 320"
                preserveAspectRatio="none"
                className="absolute bottom-0 w-full h-[60%]"
              >
                <path
                  d="M0,220 Q480,130 960,210 T1440,180 L1440,320 L0,320 Z"
                  fill={isDay ? '#3f6212' : isSunset ? '#451a03' : '#052e16'}
                />
              </svg>

              {/* Silhouette Pine Trees and Farmhouses */}
              <div className="absolute inset-x-0 bottom-0 h-16 flex justify-around items-end px-12 pointer-events-none">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className="relative flex flex-col items-center">
                    {i % 3 === 0 && (
                      <div
                        className="relative w-8 h-6 rounded-t-sm mb-1"
                        style={{ backgroundColor: isDay ? '#78350f' : '#292524' }}
                      >
                        <div
                          className="absolute top-1 left-2 w-2.5 h-2 rounded-xs animate-pulse"
                          style={{
                            backgroundColor: '#fef08a',
                            boxShadow: '0 0 8px #f59e0b',
                          }}
                        />
                      </div>
                    )}
                    {/* Pine Tree */}
                    <div
                      className="w-0 h-0 border-l-[9px] border-l-transparent border-r-[9px] border-r-transparent border-b-[26px]"
                      style={{
                        borderBottomColor: isDay ? '#14532d' : isSunset ? '#1c1917' : '#022c22',
                      }}
                    />
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* 5. Horizon Atmospheric Fog & Light Diffuser */}
      <div
        className="absolute inset-x-0 bottom-[45%] h-24 pointer-events-none transition-colors duration-1000"
        style={{
          background: `linear-gradient(to top, ${timePreset.horizonGlow} 0%, transparent 100%)`,
        }}
      />
    </div>
  );
};
