import React, { useRef, useEffect } from 'react';
import { TIME_MODES } from '../../data/drivingModes';

/**
 * Photorealistic 60 FPS Perspective Road Canvas Engine
 * Renders realistic asphalt textures, lane markings, roadside 3D props (poles, highway gantries, trees),
 * dynamic day/sunset/night lighting, wet road reflections, and realistic traffic with lighting bloom.
 */
export const Road = ({ mode, timeMode = 'night', animStateRef, isRainEnabled }) => {
  const canvasRef = useRef(null);
  const timePreset = TIME_MODES[timeMode] || TIME_MODES.night;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    let animationFrameId;

    // Distant traffic simulation with realistic models
    const trafficCars = [
      { lane: 1, z: 0.82, speed: 0.68, type: 'ahead', color: '#dc2626' },
      { lane: 2, z: 0.45, speed: 0.88, type: 'ahead', color: '#b91c1c' },
      { lane: -1, z: 0.92, speed: 1.35, type: 'oncoming', color: '#fef08a' },
      { lane: -2, z: 0.38, speed: 1.28, type: 'oncoming', color: '#ffffff' },
    ];

    // Roadside 3D scenery props (highway signs, streetlights, pine trees, telegraph poles)
    const roadsideProps = [];
    const PROP_COUNT = 18;
    for (let i = 0; i < PROP_COUNT; i++) {
      roadsideProps.push({
        z: i / PROP_COUNT,
        side: i % 2 === 0 ? -1 : 1,
        type: i % 4 === 0 ? 'gantry' : i % 3 === 0 ? 'tree' : 'pole',
      });
    }

    const resize = () => {
      if (!canvas || !canvas.parentElement) return;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = canvas.parentElement.clientWidth * dpr;
      canvas.height = canvas.parentElement.clientHeight * dpr;
    };

    resize();
    window.addEventListener('resize', resize);

    const render = () => {
      if (!canvas || !ctx) return;
      const width = canvas.width;
      const height = canvas.height;
      const dpr = window.devicePixelRatio || 1;

      ctx.clearRect(0, 0, width, height);

      const anim = animStateRef.current;
      const distance = anim.distance;
      const steering = anim.steeringAngle;
      const currentSpeed = anim.currentSpeedKmh;

      // Horizon line
      const horizonY = height * 0.47;
      const roadBottomY = height;
      const roadHeight = roadBottomY - horizonY;

      // Dynamic vanishing point with curve offset
      const vpX = width * 0.5 + steering * 5.0 * dpr;

      // Road geometry
      const roadTopWidth = width * 0.09;
      const roadBottomWidth = width * 0.94;

      const isCity = mode.id === 'city';
      const isVillage = mode.id === 'village';
      const isHighway = mode.id === 'highway';

      const isDay = timeMode === 'day';
      const isSunset = timeMode === 'sunset';
      const isNight = timeMode === 'night';

      // 1. Draw Terrain / Grass Shoulders on Left & Right of Road
      ctx.save();
      // Left Terrain
      ctx.beginPath();
      ctx.moveTo(0, horizonY);
      ctx.lineTo(vpX - roadTopWidth * 0.5, horizonY);
      ctx.lineTo(width * 0.5 - roadBottomWidth * 0.5, roadBottomY);
      ctx.lineTo(0, roadBottomY);
      ctx.closePath();
      
      const terrainGrad = ctx.createLinearGradient(0, horizonY, 0, roadBottomY);
      if (isDay) {
        terrainGrad.addColorStop(0, isVillage ? '#4d7c0f' : '#334155');
        terrainGrad.addColorStop(1, isVillage ? '#15803d' : '#1e293b');
      } else if (isSunset) {
        terrainGrad.addColorStop(0, isVillage ? '#78350f' : '#1c1917');
        terrainGrad.addColorStop(1, isVillage ? '#451a03' : '#0c0a09');
      } else {
        // Night
        terrainGrad.addColorStop(0, '#020617');
        terrainGrad.addColorStop(1, '#000000');
      }
      ctx.fillStyle = terrainGrad;
      ctx.fill();

      // Right Terrain
      ctx.beginPath();
      ctx.moveTo(width, horizonY);
      ctx.lineTo(vpX + roadTopWidth * 0.5, horizonY);
      ctx.lineTo(width * 0.5 + roadBottomWidth * 0.5, roadBottomY);
      ctx.lineTo(width, roadBottomY);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // 2. Draw Realistic Asphalt Surface with Texture & Lighting Gradients
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(vpX - roadTopWidth * 0.5, horizonY);
      ctx.lineTo(vpX + roadTopWidth * 0.5, horizonY);
      ctx.lineTo(width * 0.5 + roadBottomWidth * 0.5, roadBottomY);
      ctx.lineTo(width * 0.5 - roadBottomWidth * 0.5, roadBottomY);
      ctx.closePath();

      const roadGrad = ctx.createLinearGradient(0, horizonY, 0, roadBottomY);
      if (isDay) {
        roadGrad.addColorStop(0, '#475569');
        roadGrad.addColorStop(0.4, '#334155');
        roadGrad.addColorStop(1, '#1e293b');
      } else if (isSunset) {
        roadGrad.addColorStop(0, '#44403c');
        roadGrad.addColorStop(0.4, '#292524');
        roadGrad.addColorStop(1, '#1c1917');
      } else {
        // Night
        roadGrad.addColorStop(0, '#0a0d16');
        roadGrad.addColorStop(0.4, isCity ? '#0f172a' : '#090d16');
        roadGrad.addColorStop(1, '#020617');
      }
      ctx.fillStyle = roadGrad;
      ctx.fill();

      // Headlight Beams illuminating the road ahead at Night/Sunset
      if (isNight || isSunset) {
        const headlightGrad = ctx.createRadialGradient(
          width * 0.5,
          roadBottomY * 0.95,
          20,
          width * 0.5,
          roadBottomY * 0.8,
          width * 0.45
        );
        headlightGrad.addColorStop(0, 'rgba(254, 240, 138, 0.22)');
        headlightGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.08)');
        headlightGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = headlightGrad;
        ctx.fill();
      }

      // Wet Asphalt Specular Road Glare (when rain or city neon)
      if (isRainEnabled || (isCity && isNight)) {
        const wetGlare = ctx.createLinearGradient(vpX, horizonY, width * 0.5, roadBottomY);
        wetGlare.addColorStop(0, 'rgba(255, 255, 255, 0.04)');
        wetGlare.addColorStop(0.6, isCity ? 'rgba(244, 63, 94, 0.12)' : 'rgba(56, 189, 248, 0.08)');
        wetGlare.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = wetGlare;
        ctx.fill();
      }
      ctx.restore();

      // 3. Road Borders & Curbs
      const leftEdgeTopX = vpX - roadTopWidth * 0.5;
      const rightEdgeTopX = vpX + roadTopWidth * 0.5;
      const leftEdgeBottomX = width * 0.5 - roadBottomWidth * 0.5;
      const rightEdgeBottomX = width * 0.5 + roadBottomWidth * 0.5;

      ctx.save();
      ctx.lineWidth = Math.max(2, 3.5 * dpr);
      ctx.strokeStyle = isDay ? '#ffffff' : isSunset ? '#fbbf24' : isCity ? '#f43f5e' : '#38bdf8';
      if (!isDay) {
        ctx.shadowBlur = 10;
        ctx.shadowColor = ctx.strokeStyle;
      }

      // Left edge
      ctx.beginPath();
      ctx.moveTo(leftEdgeTopX, horizonY);
      ctx.lineTo(leftEdgeBottomX, roadBottomY);
      ctx.stroke();

      // Right edge
      ctx.beginPath();
      ctx.moveTo(rightEdgeTopX, horizonY);
      ctx.lineTo(rightEdgeBottomX, roadBottomY);
      ctx.stroke();
      ctx.restore();

      // 4. Perspective Lane Markings
      const numLanes = mode.laneCount || 3;
      const segmentCount = 32;

      for (let lane = 1; lane < numLanes; lane++) {
        const laneRatio = lane / numLanes;
        const isCenterDivider = isVillage && lane === 1;

        ctx.save();
        for (let i = 0; i < segmentCount; i++) {
          const zProgress = ((i / segmentCount) + distance * 0.035) % 1;
          const zNext = Math.min(1, zProgress + 0.018);

          // Exponential perspective transform
          const p1 = Math.pow(zProgress, 2.5);
          const p2 = Math.pow(zNext, 2.5);

          const y1 = horizonY + roadHeight * p1;
          const y2 = horizonY + roadHeight * p2;

          const curRoadWidth1 = roadTopWidth + (roadBottomWidth - roadTopWidth) * p1;
          const curRoadWidth2 = roadTopWidth + (roadBottomWidth - roadTopWidth) * p2;

          const curVpX1 = vpX + (width * 0.5 - vpX) * p1;
          const curVpX2 = vpX + (width * 0.5 - vpX) * p2;

          const x1 = curVpX1 - curRoadWidth1 * 0.5 + curRoadWidth1 * laneRatio;
          const x2 = curVpX2 - curRoadWidth2 * 0.5 + curRoadWidth2 * laneRatio;

          const lineWidth = Math.max(1, (2 + p1 * 9) * dpr);
          ctx.lineWidth = lineWidth;

          if (isCenterDivider) {
            // Village double yellow
            ctx.strokeStyle = `rgba(234, 179, 8, ${0.4 + p1 * 0.6})`;
          } else {
            // White dashed lines
            const alpha = isDay ? 0.6 + p1 * 0.4 : 0.3 + p1 * 0.7;
            ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
            if (!isDay) {
              ctx.shadowBlur = p1 * 6;
              ctx.shadowColor = 'rgba(255, 255, 255, 0.4)';
            }
          }

          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();
        }
        ctx.restore();
      }

      // 5. Roadside 3D Props (Highway Overhead Gantries, Streetlights, Lush Trees, Telegraph Poles)
      ctx.save();
      roadsideProps.forEach((prop) => {
        prop.z -= (currentSpeed / 100) * 0.0075;
        if (prop.z <= 0.02) prop.z += 1.0;

        const p = Math.pow(1 - prop.z, 2.6);
        if (p < 0.015) return;

        const y = horizonY + roadHeight * p;
        const curRoadWidth = roadTopWidth + (roadBottomWidth - roadTopWidth) * p;
        const curVpX = vpX + (width * 0.5 - vpX) * p;
        const sideOffset = (curRoadWidth * 0.58 + 24 * p * dpr) * prop.side;
        const x = curVpX + sideOffset;
        const scale = p * 1.8 * dpr;

        if (isVillage) {
          // Rural Lush Tree or Wooden Telegraph Pole
          if (prop.type === 'tree') {
            // Realistic Foliage Tree
            ctx.fillStyle = isDay ? '#15803d' : isSunset ? '#78350f' : '#052e16';
            ctx.beginPath();
            ctx.arc(x, y - 55 * scale, 22 * scale, 0, Math.PI * 2);
            ctx.arc(x - 8 * scale, y - 40 * scale, 18 * scale, 0, Math.PI * 2);
            ctx.arc(x + 8 * scale, y - 40 * scale, 18 * scale, 0, Math.PI * 2);
            ctx.fill();

            // Tree Trunk
            ctx.fillStyle = isDay ? '#78350f' : '#292524';
            ctx.fillRect(x - 3 * scale, y - 25 * scale, 6 * scale, 25 * scale);
          } else {
            // Telegraph Pole with wire swags
            ctx.strokeStyle = isDay ? '#78350f' : '#44403c';
            ctx.lineWidth = Math.max(1.5, 4 * scale);
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x, y - 85 * scale);
            ctx.stroke();

            // Crossbar
            ctx.lineWidth = Math.max(1, 2.5 * scale);
            ctx.beginPath();
            ctx.moveTo(x - 14 * scale, y - 76 * scale);
            ctx.lineTo(x + 14 * scale, y - 76 * scale);
            ctx.stroke();
          }
        } else if (isCity) {
          // Modern City Streetlight with Conic Downward Light Beam at night
          ctx.strokeStyle = isDay ? '#64748b' : '#334155';
          ctx.lineWidth = Math.max(1.5, 3.5 * scale);
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x, y - 95 * scale);
          ctx.lineTo(x - prop.side * 28 * scale, y - 100 * scale);
          ctx.stroke();

          // Glowing Lamp Head
          const lampColor = prop.side === -1 ? '#38bdf8' : '#f43f5e';
          ctx.fillStyle = isDay ? '#f8fafc' : lampColor;
          if (!isDay) {
            ctx.shadowBlur = 18 * p;
            ctx.shadowColor = lampColor;
          }
          ctx.beginPath();
          ctx.arc(x - prop.side * 28 * scale, y - 100 * scale, 4.5 * scale, 0, Math.PI * 2);
          ctx.fill();

          // Realistic Conic Downward Pool of Light on Road at Night
          if (!isDay) {
            const lightPoolGrad = ctx.createRadialGradient(
              x - prop.side * 20 * scale,
              y,
              5,
              x - prop.side * 20 * scale,
              y,
              45 * scale
            );
            lightPoolGrad.addColorStop(0, isCity ? 'rgba(244, 63, 94, 0.25)' : 'rgba(56, 189, 248, 0.2)');
            lightPoolGrad.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = lightPoolGrad;
            ctx.beginPath();
            ctx.ellipse(x - prop.side * 20 * scale, y, 45 * scale, 12 * scale, 0, 0, Math.PI * 2);
            ctx.fill();
          }
        } else {
          // Highway Overhead Direction Sign Gantry or Guardrail Cat-Eyes
          if (prop.type === 'gantry' && prop.side === 1 && p > 0.1) {
            // Full Overhead Highway Green Sign Gantry spanning the freeway
            ctx.strokeStyle = isDay ? '#64748b' : '#334155';
            ctx.lineWidth = Math.max(2, 4 * scale);
            // Right post
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x, y - 110 * scale);
            // Crossbeam over road
            ctx.lineTo(curVpX - curRoadWidth * 0.58, y - 110 * scale);
            // Left post
            ctx.lineTo(curVpX - curRoadWidth * 0.58, y);
            ctx.stroke();

            // Highway Exit Sign Board
            ctx.fillStyle = '#15803d'; // Interstate Green
            ctx.fillRect(curVpX - 35 * scale, y - 130 * scale, 70 * scale, 24 * scale);
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1 * scale;
            ctx.strokeRect(curVpX - 35 * scale, y - 130 * scale, 70 * scale, 24 * scale);

            // Sign Text simulation
            ctx.fillStyle = '#ffffff';
            ctx.font = `bold ${Math.max(6, 8 * scale)}px sans-serif`;
            ctx.textAlign = 'center';
            ctx.fillText('INTERSTATE 80 ↗', curVpX, y - 114 * scale);
          } else {
            // Guardrail Reflective Post
            ctx.fillStyle = isDay ? '#94a3b8' : '#475569';
            ctx.fillRect(x - 2 * scale, y - 30 * scale, 4 * scale, 30 * scale);

            // Reflector Cat-Eye
            ctx.fillStyle = prop.side === -1 ? '#ef4444' : isDay ? '#f8fafc' : '#38bdf8';
            if (!isDay) {
              ctx.shadowBlur = 8 * p;
              ctx.shadowColor = ctx.fillStyle;
            }
            ctx.beginPath();
            ctx.arc(x, y - 26 * scale, 2.5 * scale, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      });
      ctx.restore();

      // 6. Passing Traffic Vehicles (Realistic Car Silhouettes, Tail Lamps & Headlights)
      ctx.save();
      trafficCars.forEach((car) => {
        car.z -= (car.speed - currentSpeed / 120) * 0.003;
        if (car.z < 0.06) car.z = 0.95;
        if (car.z > 0.98) car.z = 0.1;

        const p = Math.pow(1 - car.z, 2.5);
        if (p < 0.015 || p > 0.86) return;

        const y = horizonY + roadHeight * p;
        const curRoadWidth = roadTopWidth + (roadBottomWidth - roadTopWidth) * p;
        const curVpX = vpX + (width * 0.5 - vpX) * p;
        const laneOffset = curRoadWidth * 0.28 * (car.lane > 0 ? 0.6 : -0.6);
        const x = curVpX + laneOffset;

        const carW = 38 * p * dpr;
        const carH = 20 * p * dpr;

        // Draw Car Body Silhouette
        ctx.fillStyle = isDay ? '#1e293b' : '#020617';
        ctx.beginPath();
        ctx.roundRect(x - carW * 0.5, y - carH, carW, carH * 0.7, 4 * p * dpr);
        ctx.fill();

        // Car Roof / Cabin
        ctx.fillStyle = isDay ? '#334155' : '#090d16';
        ctx.beginPath();
        ctx.roundRect(x - carW * 0.35, y - carH * 1.35, carW * 0.7, carH * 0.5, 3 * p * dpr);
        ctx.fill();

        if (car.type === 'ahead') {
          // Red Taillights with Bloom
          const lightR = Math.max(2, 4.5 * p * dpr);
          ctx.fillStyle = '#ef4444';
          ctx.shadowBlur = isDay ? 4 : 20 * p;
          ctx.shadowColor = '#ef4444';
          ctx.beginPath();
          ctx.arc(x - carW * 0.38, y - carH * 0.45, lightR, 0, Math.PI * 2);
          ctx.arc(x + carW * 0.38, y - carH * 0.45, lightR, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Oncoming White Headlights with Flare
          const lightR = Math.max(2.5, 5 * p * dpr);
          ctx.fillStyle = '#fef08a';
          ctx.shadowBlur = isDay ? 6 : 28 * p;
          ctx.shadowColor = '#ffffff';
          ctx.beginPath();
          ctx.arc(x - carW * 0.38, y - carH * 0.45, lightR, 0, Math.PI * 2);
          ctx.arc(x + carW * 0.38, y - carH * 0.45, lightR, 0, Math.PI * 2);
          ctx.fill();
        }
      });
      ctx.restore();

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [mode, timeMode, isRainEnabled]);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
};
