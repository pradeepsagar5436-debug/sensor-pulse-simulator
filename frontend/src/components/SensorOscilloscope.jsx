import React, { useEffect, useRef } from 'react';

export default function SensorOscilloscope({ isSensorOn, vibration = 0.5 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationId;
    let phase = 0;

    const resize = () => {
      canvas.width = canvas.parentElement.clientWidth;
      canvas.height = canvas.parentElement.clientHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const render = () => {
      const { width, height } = canvas;
      ctx.clearRect(0, 0, width, height);

      // Draw subtle grid lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
      ctx.lineWidth = 1;
      const step = 20;
      for (let x = 0; x < width; x += step) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += step) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Draw center baseline
      const centerY = height / 2;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.beginPath();
      ctx.moveTo(0, centerY);
      ctx.lineTo(width, centerY);
      ctx.stroke();

      // Draw waveform
      ctx.beginPath();
      ctx.lineWidth = 2.5;

      if (isSensorOn) {
        ctx.strokeStyle = '#10b981';
        ctx.shadowColor = '#10b981';
        ctx.shadowBlur = 12;
      } else {
        ctx.strokeStyle = '#64748b';
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
      }

      const amplitude = isSensorOn ? Math.min(35 * (vibration || 1), height / 2 - 10) : 4;
      const frequency = isSensorOn ? 0.035 : 0.01;

      for (let x = 0; x < width; x++) {
        let y = centerY;
        if (isSensorOn) {
          // Combination of primary sine wave, harmonics, and subtle vibration noise
          const harmonic = Math.sin((x * frequency * 2) + phase * 1.5) * (amplitude * 0.3);
          const jitter = (Math.random() - 0.5) * 4;
          y += Math.sin((x * frequency) + phase) * amplitude + harmonic + jitter;
        } else {
          // Low energy ambient baseline
          y += Math.sin((x * frequency) + phase * 0.5) * amplitude;
        }

        if (x === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();

      phase += isSensorOn ? 0.08 : 0.02;
      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
    };
  }, [isSensorOn, vibration]);

  return (
    <div className="canvas-container">
      <canvas ref={canvasRef} className="live-oscilloscope" />
    </div>
  );
}
