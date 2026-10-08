import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
  decay: number;
  color: string;
  radius: number;
  flicker: boolean;
}

interface FireworkCanvasProps {
  active: boolean;
  onExplode?: () => void;
}

const COLORS = [
  '#FFD700', // Gold
  '#FFA500', // Amber
  '#00F0FF', // Cyan
  '#FF007F', // Neon Rose
  '#00FF88', // Emerald
  '#9D00FF', // Purple
  '#FFFFFF', // White
  '#FF4500', // Orange Red
];

export const FireworksCanvas: React.FC<FireworkCanvasProps> = ({ active, onExplode }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationFrameRef = useRef<number | null>(null);
  const burstIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const onExplodeRef = useRef(onExplode);
  onExplodeRef.current = onExplode;

  const createBurst = (x: number, y: number, particleCount = 70) => {
    const burstColor = COLORS[Math.floor(Math.random() * COLORS.length)];
    const secondaryColor = COLORS[Math.floor(Math.random() * COLORS.length)];

    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 * i) / particleCount + (Math.random() * 0.4 - 0.2);
      const speed = Math.random() * 7 + 2;

      particlesRef.current.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        alpha: 1,
        decay: Math.random() * 0.015 + 0.01,
        color: Math.random() > 0.4 ? burstColor : secondaryColor,
        radius: Math.random() * 2.5 + 1.5,
        flicker: Math.random() > 0.5,
      });
    }

    if (onExplodeRef.current) {
      onExplodeRef.current();
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    const render = () => {
      // Clear with slight trail effect
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.globalCompositeOperation = 'lighter';

      const currentParticles = particlesRef.current;
      for (let i = currentParticles.length - 1; i >= 0; i--) {
        const p = currentParticles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.08; // Gravity
        p.vx *= 0.98; // Air resistance
        p.vy *= 0.98;
        p.alpha -= p.decay;

        if (p.alpha <= 0) {
          currentParticles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.flicker && Math.random() > 0.3 ? p.alpha * 0.6 : p.alpha;
        ctx.shadowBlur = 10;
        ctx.shadowColor = p.color;
        ctx.fill();
        ctx.restore();
      }

      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);

  useEffect(() => {
    if (active) {
      const launchSalvo = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const count = 3 + Math.floor(Math.random() * 3);
        for (let i = 0; i < count; i++) {
          setTimeout(() => {
            const x = canvas.width * 0.15 + Math.random() * (canvas.width * 0.7);
            const y = canvas.height * 0.15 + Math.random() * (canvas.height * 0.45);
            createBurst(x, y, 65);
          }, i * 220);
        }
      };

      // Bắn ngay đợt đầu
      launchSalvo();

      // Tiếp tục bắn ngẫu nhiên định kỳ
      burstIntervalRef.current = setInterval(launchSalvo, 1800);
    } else {
      if (burstIntervalRef.current) {
        clearInterval(burstIntervalRef.current);
        burstIntervalRef.current = null;
      }
    }

    return () => {
      if (burstIntervalRef.current) {
        clearInterval(burstIntervalRef.current);
        burstIntervalRef.current = null;
      }
    };
  }, [active]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-30"
    />
  );
};
