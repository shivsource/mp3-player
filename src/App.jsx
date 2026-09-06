import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DRIVING_MODES, TIME_MODES } from './data/drivingModes';
import { useYouTubePlayer } from './hooks/useYouTubePlayer';
import { useDrivingAnimation } from './hooks/useDrivingAnimation';
import { useKeyboardControls } from './hooks/useKeyboardControls';

import { DrivingScene } from './components/DrivingScene/DrivingScene';
import { ModeSelector } from './components/ModeSelector/ModeSelector';
import { MusicPlayer } from './components/MusicPlayer/MusicPlayer';
import { CinematicControls } from './components/UI/CinematicControls';
import { KeyboardHelpModal } from './components/UI/KeyboardHelpModal';
import { Car, Sparkles, Sun, Moon, Sunset } from 'lucide-react';

export default function App() {
  const [currentModeKey, setCurrentModeKey] = useState('highway');
  const [timeMode, setTimeMode] = useState('day'); // Default to realistic daylight or toggle to sunset/night
  const [isRainEnabled, setIsRainEnabled] = useState(false);
  const [isUiHidden, setIsUiHidden] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  const currentMode = DRIVING_MODES[currentModeKey] || DRIVING_MODES.highway;

  // 1. YouTube Player Engine (Dynamically fetches songs for currentModeKey + timeMode) 
  const player = useYouTubePlayer(currentModeKey, timeMode);

  // 2. Driving Simulation & Steering Physics Engine
  const {
    animStateRef,
    displaySpeed,
    steeringAngle,
    cameraOffset,
    roadCurve,
  } = useDrivingAnimation(currentModeKey);

  // Marks the first user gesture, needed to satisfy the browser's autoplay policy for the music player
  const handleUserInteraction = useCallback(() => {
    if (!hasInteracted) {
      setHasInteracted(true);
    }
  }, [hasInteracted]);

  // Mode Selection Handler
  const handleSelectMode = (modeId) => {
    handleUserInteraction();
    if (DRIVING_MODES[modeId]) {
      setCurrentModeKey(modeId);
    }
  };

  const handleToggleRain = () => {
    handleUserInteraction();
    setIsRainEnabled((prev) => !prev);
  };

  // Keyboard Shortcuts Hook
  useKeyboardControls({
    onTogglePlay: () => {
      handleUserInteraction();
      player.togglePlay();
    },
    onNextTrack: () => {
      handleUserInteraction();
      player.nextTrack();
    },
    onPrevTrack: () => {
      handleUserInteraction();
      player.prevTrack();
    },
    onToggleMute: () => {
      handleUserInteraction();
      player.toggleMute();
    },
    onSetMode: handleSelectMode,
    onToggleRain: handleToggleRain,
    onToggleHideUI: () => setIsUiHidden((prev) => !prev),
    onToggleHelp: () => setIsHelpOpen((prev) => !prev),
  });

  return (
    <div
      onClick={handleUserInteraction}
      className="relative w-screen h-screen h-[100dvh] overflow-hidden bg-black text-slate-100 font-sans select-none flex flex-col"
    >
      {/* 1. MASTER PHOTOREALISTIC DRIVING SCENE (Full Viewport) */}
      <div className="absolute inset-0 z-0">
        <DrivingScene
          mode={currentMode}
          timeMode={timeMode}
          displaySpeed={displaySpeed}
          steeringAngle={steeringAngle}
          cameraOffset={cameraOffset}
          animStateRef={animStateRef}
          isRainEnabled={isRainEnabled}
          isPlaying={player.isPlaying}
          currentTrack={player.currentTrack}
          onPrevTrack={() => {
            handleUserInteraction();
            player.prevTrack();
          }}
          onTogglePlay={() => {
            handleUserInteraction();
            player.togglePlay();
          }}
          onNextTrack={() => {
            handleUserInteraction();
            player.nextTrack();
          }}
        />
      </div>

      {/* 2. FLOATING TOP BAR (Brand & Cinematic Controls) */}
      <AnimatePresence>
        {!isUiHidden && (
          <motion.header
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="relative z-40 w-full pt-2.5 sm:pt-4 px-3 sm:px-8 flex flex-wrap items-center justify-between gap-2 pointer-events-none"
          >
            {/* Minimal Brand Tag with Time Badge */}
            <div className="pointer-events-auto flex items-center gap-2 sm:gap-2.5 glass-panel px-2.5 sm:px-3.5 py-1.5 rounded-full border border-white/10 shadow-lg">
              <Car className="w-4 h-4 text-cyan-400 animate-pulse-subtle" />
              <div className="flex flex-col">
                <span className="text-xs font-bold tracking-wider uppercase text-white font-display">
                  Long Drive Simulator
                </span>
              </div>
              <span
                className={`hidden sm:inline-block text-[10px] font-mono px-2 py-0.5 rounded font-semibold uppercase ${
                  timeMode === 'day'
                    ? 'bg-amber-400/20 text-amber-300'
                    : timeMode === 'sunset'
                    ? 'bg-orange-500/20 text-orange-300'
                    : 'bg-cyan-500/20 text-cyan-300'
                }`}
              >
                {timeMode} 4K
              </span>
            </div>

            {/* Top Center: Mode Switcher (Highway, City, Village) */}
            <div className="pointer-events-auto hidden md:block">
              <ModeSelector
                currentMode={currentMode}
                onSelectMode={handleSelectMode}
              />
            </div>

            {/* Top Right: Atmospheric Controls (Day/Sunset/Night, Rain, Audio, Fullscreen) */}
            <div className="pointer-events-auto">
              <CinematicControls
                timeMode={timeMode}
                onChangeTimeMode={setTimeMode}
                isRainEnabled={isRainEnabled}
                onToggleRain={handleToggleRain}
                isUiHidden={isUiHidden}
                onToggleHideUi={() => setIsUiHidden(true)}
                onOpenHelp={() => setIsHelpOpen(true)}
                accentColor={currentMode.accentColor}
              />
            </div>
          </motion.header>
        )}
      </AnimatePresence>

      {/* Mobile Top Mode Switcher (Visible only on mobile/tablet) */}
      <AnimatePresence>
        {!isUiHidden && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative z-40 w-full flex justify-center px-3 sm:px-4 md:hidden pointer-events-auto mt-1 sm:mt-2"
          >
            <ModeSelector
              currentMode={currentMode}
              onSelectMode={handleSelectMode}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. FLOATING MUSIC PLAYER (Below ModeSelector on Mobile, Bottom-Right on Desktop) */}
      <AnimatePresence>
        {!isUiHidden && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="relative z-40 w-full px-3 sm:px-8 mt-2 sm:mt-auto sm:pb-6 flex justify-center sm:justify-end items-start sm:items-end pointer-events-none"
          >
            <div className="pointer-events-auto w-full max-w-[360px] sm:max-w-none sm:w-auto flex justify-center sm:block">
              <MusicPlayer
                player={player}
                accentColor={currentMode.accentColor}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hidden UI Restore Floating Pill (when user toggles 'H') */}
      <AnimatePresence>
        {isUiHidden && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 0.7, scale: 1 }}
            whileHover={{ opacity: 1, scale: 1.05 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => setIsUiHidden(false)}
            className="fixed top-5 right-5 z-50 glass-panel px-3.5 py-1.5 rounded-full text-xs text-slate-300 font-mono flex items-center gap-2 border border-white/10 hover:text-white transition-all shadow-2xl"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Show UI (Press H)</span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Keyboard Shortcuts Cheatsheet Modal */}
      <KeyboardHelpModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />
    </div>
  );
}
