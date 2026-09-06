import React from 'react';
import { motion } from 'framer-motion';
import { Environment } from './Environment';
import { Road } from './Road';
import { Cockpit } from './Cockpit';

/**
 * Master Driving Scene Component
 * Integrates Parallax Environment, Perspective Road, Cockpit, and Subtle Camera Dynamics.
 */
export const DrivingScene = ({
  mode,
  timeMode = 'night',
  displaySpeed,
  steeringAngle,
  cameraOffset,
  animStateRef,
  isRainEnabled,
  isPlaying,
  currentTrack,
  onPrevTrack,
  onTogglePlay,
  onNextTrack,
}) => {
  return (
    <div className="relative w-full h-full overflow-hidden bg-black select-none">
      {/* Dynamic Camera Sway & Vibration Wrapper */}
      <motion.div
        className="relative w-full h-full"
        animate={{
          x: cameraOffset.x,
          y: cameraOffset.y,
          rotate: cameraOffset.x * 0.05,
        }}
        transition={{ type: 'spring', damping: 20, stiffness: 100 }}
      >
        {/* Layer 1: Parallax Environment (Sky, Mountains, Skyline, Clouds, Sun/Moon) */}
        <Environment
          mode={mode}
          cameraOffset={cameraOffset}
          timeMode={timeMode}
          isRainEnabled={isRainEnabled}
        />

        {/* Layer 2: 60 FPS Photorealistic Perspective Road Canvas */}
        <Road
          mode={mode}
          timeMode={timeMode}
          animStateRef={animStateRef}
          isRainEnabled={isRainEnabled}
        />
      </motion.div>

      {/* Layer 3: Cockpit Interior (Dashboard, Gauges, In-Dash Screen, Steering Wheel, Wipers) */}
      <Cockpit
        mode={mode}
        timeMode={timeMode}
        displaySpeed={displaySpeed}
        steeringAngle={steeringAngle}
        animStateRef={animStateRef}
        isRainEnabled={isRainEnabled}
        isPlaying={isPlaying}
        currentTrack={currentTrack}
        onPrevTrack={onPrevTrack}
        onTogglePlay={onTogglePlay}
        onNextTrack={onNextTrack}
      />

      {/* Layer 4: Cinematic Vignette & Subtle Film Grain */}
      <div className="vignette-overlay absolute inset-0 pointer-events-none z-35" />
      <div className="film-grain" />
    </div>
  );
};
