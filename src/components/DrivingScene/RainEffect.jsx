import React, { useRef, useEffect } from 'react';

/**
 * Rain Drops on Windshield with Animated Wiper Blades
 */
export const RainEffect = ({ isEnabled = false }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!isEnabled) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;

    // Rain drop streaks
    const drops = [];
    const DROP_COUNT = 90;

    for (let i = 0; i < DROP_COUNT; i++) {
      drops.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        len: Math.random() * 25 + 15,
        speed: Math.random() * 15 + 12,
        opacity: Math.random() * 0.4 + 0.2,
      });
    }

    const resize = () => {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const render = () => {
      if (!canvas || !ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.lineWidth = 1.2;
      ctx.strokeStyle = 'rgba(203, 213, 225, 0.4)';

      drops.forEach((d) => {
        d.y += d.speed;
        d.x -= 2.5; // Slight wind slant

        if (d.y > canvas.height) {
          d.y = -d.len;
          d.x = Math.random() * (canvas.width + 100);
        }

        ctx.strokeStyle = `rgba(224, 242, 254, ${d.opacity})`;
        ctx.beginPath();
        ctx.moveTo(d.x, d.y);
        ctx.lineTo(d.x - 4, d.y + d.len);
        ctx.stroke();
      });

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animId);
    };
  }, [isEnabled]);

  if (!isEnabled) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden">
      {/* Rain Drops Canvas */}
      <canvas ref={canvasRef} className="w-full h-full block" />

      {/* Windshield Wiper Blade Animation */}
      <div className="absolute bottom-0 left-[28%] w-2 h-72 origin-bottom animate-wiper pointer-events-none">
        <div className="w-1.5 h-full bg-slate-800 border-r border-slate-700/60 rounded-full shadow-lg" />
      </div>
      <div className="absolute bottom-0 left-[58%] w-2 h-72 origin-bottom animate-wiper pointer-events-none">
        <div className="w-1.5 h-full bg-slate-800 border-r border-slate-700/60 rounded-full shadow-lg" />
      </div>

      <style>{`
        @keyframes wiperSweep {
          0%, 100% { transform: rotate(-55deg); }
          50% { transform: rotate(50deg); }
        }
        .animate-wiper {
          animation: wiperSweep 2.2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};
