import React from 'react';
import { motion } from 'framer-motion';
import { DRIVING_MODES } from '../../data/drivingModes';
import { Compass, Building2, Trees } from 'lucide-react';

const MODE_ICONS = {
  highway: Compass,
  city: Building2,
  village: Trees,
};

export const ModeSelector = ({ currentMode, onSelectMode }) => {
  const modes = Object.values(DRIVING_MODES);

  return (
    <div className="relative flex flex-col items-center select-none">
      {/* Floating Glass Pill Container */}
      <div className="glass-panel p-1.5 rounded-full flex items-center gap-1 shadow-2xl border border-white/10">
        {modes.map((m, index) => {
          const isActive = currentMode.id === m.id;
          const Icon = MODE_ICONS[m.id] || Compass;

          return (
            <button
              key={m.id}
              onClick={() => onSelectMode(m.id)}
              aria-label={`Switch to ${m.label} Mode (${m.sublabel})`}
              className={`relative px-3.5 sm:px-5 py-2 rounded-full flex items-center gap-2 transition-all duration-300 ${
                isActive ? 'text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {/* Animated Active Background Pill */}
              {isActive && (
                <motion.div
                  layoutId="activeModePill"
                  className="absolute inset-0 rounded-full"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.12)',
                    border: `1px solid ${m.accentColor}66`,
                    boxShadow: `0 0 20px ${m.accentColor}33`,
                  }}
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}

              {/* Mode Icon */}
              <Icon
                className="w-4 h-4 relative z-10 transition-colors duration-300"
                style={{ color: isActive ? m.accentColor : 'currentColor' }}
              />

              {/* Mode Label & Music Theme Subtitle */}
              <div className="relative z-10 flex flex-col items-start leading-tight">
                <span className="text-xs sm:text-sm font-bold tracking-wider uppercase">
                  {m.label}
                </span>
                <span className="text-[9px] font-mono tracking-normal text-slate-300 font-normal hidden sm:inline-block">
                  {m.sublabel}
                </span>
              </div>

              {/* Hotkey Badge */}
              <span className="hidden md:inline-block relative z-10 text-[9px] font-mono px-1 py-0.2 rounded bg-black/40 text-slate-400 border border-white/5 ml-0.5">
                {index + 1}
              </span>
            </button>
          );
        })}
      </div>

      {/* Mode Ambient Tagline */}
      <motion.p
        key={currentMode.id}
        initial={{ opacity: 0, y: 3 }}
        animate={{ opacity: 0.9, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mt-2 text-[11px] font-mono tracking-widest uppercase text-slate-400 drop-shadow hidden sm:block"
      >
        {currentMode.tagline || currentMode.description}
      </motion.p>
    </div>
  );
};
