import React from 'react';
import { motion } from 'framer-motion';

/**
 * Realistic Luxury GT Steering Wheel
 * Continuously oscillates naturally with driver inertia and micro-corrections.
 * Left thumb cluster, right thumb cluster and center hub double as real
 * steering-wheel media controls (previous / play-pause / next), same as
 * modern cars' left/right/center wheel buttons.
 */
export const SteeringWheel = ({
  steeringAngle,
  accentColor = '#38bdf8',
  isPlaying = false,
  onPrevTrack,
  onTogglePlay,
  onNextTrack,
}) => {
  const handleKeyActivate = (handler) => (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handler?.();
    }
  };

  return (
    <div className="relative flex items-center justify-center">
      {/* Dynamic Rotation Container */}
      <div
        className="relative will-change-transform transition-transform duration-75 ease-out"
        style={{
          transform: `rotate(${steeringAngle}deg)`,
          transformOrigin: '50% 50%',
        }}
      >
        {/* Steering Wheel Outer Shadow */}
        <div className="absolute inset-0 rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.85)] pointer-events-none" />

        {/* SVG Detailed High-End Steering Wheel */}
        <svg
          viewBox="0 0 400 400"
          className="w-72 h-72 sm:w-84 sm:h-84 md:w-96 md:h-96 drop-shadow-2xl pointer-events-none"
        >
          <defs>
            {/* Outer Rim Radial Gradient */}
            <radialGradient id="rimGrad" cx="50%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#334155" />
              <stop offset="60%" stopColor="#1e293b" />
              <stop offset="100%" stopColor="#090d16" />
            </radialGradient>

            {/* Brushed Aluminum Spokes Gradient */}
            <linearGradient id="metalGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#94a3b8" />
              <stop offset="50%" stopColor="#475569" />
              <stop offset="100%" stopColor="#1e293b" />
            </linearGradient>

            {/* Leather Grip Highlight */}
            <linearGradient id="leatherGrip" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#1e293b" />
              <stop offset="50%" stopColor="#0f172a" />
              <stop offset="100%" stopColor="#020617" />
            </linearGradient>

            {/* Center Boss Glow */}
            <radialGradient id="centerGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#1e293b" />
              <stop offset="85%" stopColor="#090d16" />
              <stop offset="100%" stopColor="#000000" />
            </radialGradient>
          </defs>

          {/* 1. Behind Rim: Paddle Shifters */}
          <g id="paddles" opacity="0.8">
            {/* Left Paddle (-) */}
            <path
              d="M 50 140 C 35 160, 35 220, 55 240 L 70 230 C 58 215, 58 175, 68 150 Z"
              fill="#334155"
              stroke="#64748b"
              strokeWidth="1.5"
            />
            <text x="48" y="195" fill="#94a3b8" fontSize="14" fontWeight="bold" fontFamily="sans-serif">−</text>

            {/* Right Paddle (+) */}
            <path
              d="M 350 140 C 365 160, 365 220, 345 240 L 330 230 C 342 215, 342 175, 332 150 Z"
              fill="#334155"
              stroke="#64748b"
              strokeWidth="1.5"
            />
            <text x="344" y="195" fill="#94a3b8" fontSize="14" fontWeight="bold" fontFamily="sans-serif">+</text>
          </g>

          {/* 2. Outer Wheel Rim Ring */}
          <circle
            cx="200"
            cy="200"
            r="175"
            fill="none"
            stroke="url(#rimGrad)"
            strokeWidth="32"
          />

          {/* Inner Rim Bevel Contour */}
          <circle
            cx="200"
            cy="200"
            r="159"
            fill="none"
            stroke="#0f172a"
            strokeWidth="2"
          />
          <circle
            cx="200"
            cy="200"
            r="191"
            fill="none"
            stroke="#475569"
            strokeWidth="1"
            opacity="0.6"
          />

          {/* 12 o'clock Center Alignment Stripe */}
          <rect
            x="196"
            y="10"
            width="8"
            height="30"
            rx="2"
            fill={accentColor}
            style={{ filter: `drop-shadow(0 0 6px ${accentColor})` }}
          />

          {/* 3. Ergonomic 9 and 3 o'clock Thumb Rest Contours */}
          <path
            d="M 26 185 C 24 160, 32 145, 45 140 C 58 135, 68 150, 68 185 C 68 220, 58 235, 45 230 C 32 225, 24 210, 26 185 Z"
            fill="url(#leatherGrip)"
            stroke="#334155"
            strokeWidth="1.5"
          />
          <path
            d="M 374 185 C 376 160, 368 145, 355 140 C 342 135, 332 150, 332 185 C 332 220, 342 235, 355 230 C 368 225, 376 210, 374 185 Z"
            fill="url(#leatherGrip)"
            stroke="#334155"
            strokeWidth="1.5"
          />

          {/* 4. Three-Spoke System (Left, Right, Bottom) */}
          <g id="spokes">
            {/* Left Spoke */}
            <path
              d="M 68 175 L 140 185 L 140 215 L 68 225 Z"
              fill="url(#metalGrad)"
              stroke="#0f172a"
              strokeWidth="2"
            />

            {/* Right Spoke */}
            <path
              d="M 332 175 L 260 185 L 260 215 L 332 225 Z"
              fill="url(#metalGrad)"
              stroke="#0f172a"
              strokeWidth="2"
            />

            {/* Bottom Spoke */}
            <path
              d="M 180 250 L 186 345 L 214 345 L 220 250 Z"
              fill="url(#metalGrad)"
              stroke="#0f172a"
              strokeWidth="2"
            />
            {/* Bottom spoke accent cutout */}
            <path d="M 194 280 L 206 280 L 203 325 L 197 325 Z" fill="#090d16" />
          </g>

          {/* 5. Center Hub / Airbag Boss */}
          <circle
            cx="200"
            cy="200"
            r="62"
            fill="url(#centerGrad)"
            stroke="#334155"
            strokeWidth="3"
          />

          {/* Center Subtle Accent Ring */}
          <circle
            cx="200"
            cy="200"
            r="44"
            fill="none"
            stroke={accentColor}
            strokeWidth="1.5"
            opacity="0.75"
            style={{ filter: `drop-shadow(0 0 4px ${accentColor})` }}
          />
        </svg>

        {/* --- Interactive Media Controls (pointer-events re-enabled over the SVG) --- */}
        <svg viewBox="0 0 400 400" className="absolute inset-0 w-72 h-72 sm:w-84 sm:h-84 md:w-96 md:h-96">
          {/* Left Spoke Cluster: PREVIOUS TRACK */}
          <motion.g
            role="button"
            tabIndex={0}
            aria-label="Previous track"
            className="pointer-events-auto cursor-pointer outline-none"
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.9 }}
            onClick={onPrevTrack}
            onKeyDown={handleKeyActivate(onPrevTrack)}
          >
            {/* Generous invisible touch target (pointerEvents="all" so a transparent fill still hit-tests) */}
            <circle cx="100" cy="199" r="34" fill="transparent" pointerEvents="all" />
            <rect x="85" y="190" width="35" height="18" rx="4" fill="#0f172a" stroke="#334155" />
            <path d="M 89 199 L 100 189 L 100 209 Z" fill={accentColor} />
            <path d="M 102 199 L 113 189 L 113 209 Z" fill={accentColor} />
            <rect x="86" y="189" width="2.5" height="20" fill={accentColor} />
          </motion.g>

          {/* Right Spoke Cluster: NEXT TRACK */}
          <motion.g
            role="button"
            tabIndex={0}
            aria-label="Next track"
            className="pointer-events-auto cursor-pointer outline-none"
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.9 }}
            onClick={onNextTrack}
            onKeyDown={handleKeyActivate(onNextTrack)}
          >
            <circle cx="300" cy="199" r="34" fill="transparent" pointerEvents="all" />
            <rect x="280" y="190" width="35" height="18" rx="4" fill="#0f172a" stroke="#334155" />
            <path d="M 311 199 L 300 189 L 300 209 Z" fill={accentColor} />
            <path d="M 298 199 L 287 189 L 287 209 Z" fill={accentColor} />
            <rect x="311.5" y="189" width="2.5" height="20" fill={accentColor} />
          </motion.g>

          {/* Center Hub: PLAY / PAUSE */}
          <motion.g
            role="button"
            tabIndex={0}
            aria-label={isPlaying ? 'Pause' : 'Play'}
            className="pointer-events-auto cursor-pointer outline-none"
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.92 }}
            onClick={onTogglePlay}
            onKeyDown={handleKeyActivate(onTogglePlay)}
          >
            <circle cx="200" cy="200" r="55" fill="transparent" pointerEvents="all" />
            <circle cx="200" cy="200" r="24" fill="#090d16" stroke="#475569" strokeWidth="1" />
            {isPlaying ? (
              <>
                <rect x="189" y="188" width="7" height="24" rx="1.5" fill={accentColor} />
                <rect x="204" y="188" width="7" height="24" rx="1.5" fill={accentColor} />
              </>
            ) : (
              <path d="M 193 187 L 216 200 L 193 213 Z" fill={accentColor} />
            )}
          </motion.g>
        </svg>
      </div>
    </div>
  );
};
