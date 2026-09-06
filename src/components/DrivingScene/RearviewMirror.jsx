import React, { useRef, useEffect } from 'react';

/**
 * Cinematic Rearview Mirror
 * Renders a stylized reflection of the road receding into the distance behind the car.
 */
export const RearviewMirror = ({ mode, animStateRef }) => {
  const mirrorCanvasRef = useRef(null);

  useEffect(() => {
    const canvas = mirrorCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;

    const render = () => {
      if (!canvas || !ctx) return;
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      const anim = animStateRef.current;
      const dist = anim ? anim.distance : 0;

      // Dark Sky Background
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, '#030712');
      grad.addColorStop(0.5, '#0f172a');
      grad.addColorStop(1, '#020617');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Receding Road
      const vpX = w * 0.5;
      const vpY = h * 0.45;

      ctx.fillStyle = '#111827';
      ctx.beginPath();
      ctx.moveTo(vpX - 8, vpY);
      ctx.lineTo(vpX + 8, vpY);
      ctx.lineTo(w * 0.8, h);
      ctx.lineTo(w * 0.2, h);
      ctx.closePath();
      ctx.fill();

      // Receding Center Line
      ctx.strokeStyle = '#f1f5f9';
      ctx.lineWidth = 1.5;
      for (let i = 0; i < 6; i++) {
        const p = ((i / 6) + (dist * 0.04)) % 1;
        const y = vpY + (h - vpY) * p;
        if (i % 2 === 0) {
          ctx.beginPath();
          ctx.moveTo(vpX, y);
          ctx.lineTo(vpX, y + 4);
          ctx.stroke();
        }
      }

      // Distant trailing headlights
      ctx.fillStyle = 'rgba(239, 68, 68, 0.7)';
      ctx.beginPath();
      ctx.arc(vpX - 12, h * 0.65, 2.5, 0, Math.PI * 2);
      ctx.arc(vpX + 12, h * 0.65, 2.5, 0, Math.PI * 2);
      ctx.fill();

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [mode]);

  return (
    <div className="relative pointer-events-none hidden md:flex flex-col items-center select-none">
      {/* Mirror Housing */}
      <div className="relative p-1 rounded-2xl bg-gradient-to-b from-slate-800 to-slate-950 border border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.8)]">
        {/* Mirror Stem mount to windshield */}
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-4 h-6 bg-gradient-to-b from-slate-900 to-slate-800 rounded-t-sm" />
        
        {/* Reflective Glass Area */}
        <div className="relative w-44 h-14 rounded-xl overflow-hidden border border-white/15 bg-black">
          <canvas ref={mirrorCanvasRef} width={176} height={56} className="w-full h-full block" />
          
          {/* Glass Tint & Glare Diagonal Line */}
          <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/10 via-transparent to-white/10 pointer-events-none" />
        </div>
      </div>
    </div>
  );
};
