import { useState, useEffect, useRef } from 'react';
import { DRIVING_MODES } from '../data/drivingModes';

export function useDrivingAnimation(currentModeKey = 'highway') {
  const modeConfig = DRIVING_MODES[currentModeKey] || DRIVING_MODES.highway;
  
  // High-frequency animated values updated per frame
  const animStateRef = useRef({
    distance: 0,
    currentSpeedKmh: modeConfig.speedKmh,
    targetSpeedKmh: modeConfig.speedKmh,
    speedFactor: modeConfig.speedFactor,
    steeringAngle: 0,
    targetSteeringAngle: 0,
    cameraOffsetX: 0,
    cameraOffsetY: 0,
    roadCurve: 0,
    time: 0,
  });

  // State exposed to React components (throttled/interpolated for UI)
  const [displaySpeed, setDisplaySpeed] = useState(modeConfig.speedKmh);
  const [steeringAngle, setSteeringAngle] = useState(0);
  const [cameraOffset, setCameraOffset] = useState({ x: 0, y: 0 });
  const [roadCurve, setRoadCurve] = useState(0);

  // Update target speed when mode changes
  useEffect(() => {
    animStateRef.current.targetSpeedKmh = modeConfig.speedKmh;
    animStateRef.current.speedFactor = modeConfig.speedFactor;
  }, [currentModeKey, modeConfig]);

  useEffect(() => {
    let animationFrameId;
    let lastTime = performance.now();
    let lastUiUpdate = 0;

    const loop = (currentTime) => {
      const delta = Math.min((currentTime - lastTime) / 1000, 0.1); // Clamp to prevent huge jumps
      lastTime = currentTime;

      const state = animStateRef.current;
      state.time += delta;

      // 1. Smoothly interpolate vehicle speed (Speedometer transition)
      state.currentSpeedKmh += (state.targetSpeedKmh - state.currentSpeedKmh) * Math.min(1, delta * 2.5);

      // 2. Accumulate road travel distance based on current speed
      const speedNorm = state.currentSpeedKmh / 100;
      state.distance += speedNorm * delta * 60;

      // 3. Multi-frequency organic steering curve simulation
      // Sequence pattern mimicking: 0° -> -8° -> -3° -> +7° -> +2° -> -5° -> 0°
      const t = state.time * (modeConfig.steeringSpeed * 650);
      const curve1 = Math.sin(t * 0.35) * 0.55;
      const curve2 = Math.sin(t * 0.85 + 1.4) * 0.30;
      const microJitter = Math.sin(t * 2.4 + 0.3) * 0.15;
      const noise = (Math.sin(t * 5.1) * 0.05);

      const rawAngle = (curve1 + curve2 + microJitter + noise) * modeConfig.steeringIntensity;
      
      // Inertia smoothing (driver hand damping)
      state.targetSteeringAngle = rawAngle;
      state.steeringAngle += (state.targetSteeringAngle - state.steeringAngle) * Math.min(1, delta * 6.0);

      // Road curvature reacts to steering
      state.roadCurve = state.steeringAngle * 0.04;

      // 4. Subtle camera dynamics: lateral centrifugal sway & road bounce
      const lateralSway = -state.steeringAngle * 0.6; // Slight centrifugal tilt
      const roadBounce = Math.sin(state.distance * 0.4) * (0.8 * speedNorm) + (Math.random() - 0.5) * 0.15;
      
      state.cameraOffsetX += (lateralSway - state.cameraOffsetX) * Math.min(1, delta * 5.0);
      state.cameraOffsetY += (roadBounce - state.cameraOffsetY) * Math.min(1, delta * 8.0);

      // Sync to React state for UI rendering at ~60fps
      if (currentTime - lastUiUpdate > 16) {
        lastUiUpdate = currentTime;
        setSteeringAngle(state.steeringAngle);
        setCameraOffset({ x: state.cameraOffsetX, y: state.cameraOffsetY });
        setRoadCurve(state.roadCurve);
        setDisplaySpeed(Math.round(state.currentSpeedKmh));
      }

      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [modeConfig]);

  return {
    animStateRef,
    displaySpeed,
    steeringAngle,
    cameraOffset,
    roadCurve,
    modeConfig,
  };
}
