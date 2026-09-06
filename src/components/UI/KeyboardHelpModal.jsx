import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Keyboard, Volume2, Play, Compass, CloudRain, EyeOff } from 'lucide-react';

export const KeyboardHelpModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const shortcuts = [
    { key: 'Space', desc: 'Play / Pause Music', icon: Play },
    { key: '← / →', desc: 'Previous / Next Track', icon: Play },
    { key: '1, 2, 3', desc: 'Switch Mode (Highway, City, Village)', icon: Compass },
    { key: 'M', desc: 'Mute / Unmute Audio', icon: Volume2 },
    { key: 'R', desc: 'Toggle Rain & Windshield Wipers', icon: CloudRain },
    { key: 'H', desc: 'Hide / Show All UI (Cinematic Wallpaper)', icon: EyeOff },
    { key: '?', desc: 'Toggle Keyboard Shortcuts', icon: Keyboard },
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 10 }}
          className="glass-panel w-full max-w-md p-6 rounded-3xl border border-white/15 shadow-2xl relative"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
            <div className="flex items-center gap-2">
              <Keyboard className="w-5 h-5 text-cyan-400" />
              <h3 className="text-base font-bold text-white tracking-wide">
                Keyboard Shortcuts
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-white/10"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* List */}
          <div className="flex flex-col gap-2.5">
            {shortcuts.map((sc) => (
              <div
                key={sc.key}
                className="flex items-center justify-between py-1.5 px-3 rounded-xl bg-white/5 border border-white/5"
              >
                <span className="text-xs text-slate-300 font-medium flex items-center gap-2">
                  <sc.icon className="w-3.5 h-3.5 text-slate-400" />
                  {sc.desc}
                </span>
                <kbd className="px-2 py-0.5 rounded bg-black/50 border border-white/15 font-mono text-xs text-cyan-300 font-semibold shadow-inner">
                  {sc.key}
                </kbd>
              </div>
            ))}
          </div>

          {/* Footer note */}
          <div className="mt-5 pt-3 border-t border-white/5 text-center">
            <p className="text-[11px] text-slate-400 font-mono">
              Press <kbd className="text-cyan-400 font-bold">H</kbd> anytime to immerse in full screen drive
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
