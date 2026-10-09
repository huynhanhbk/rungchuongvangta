import React from 'react';
import { Wifi, Cloud, BarChart3, Users, Settings, Cpu } from 'lucide-react';

interface DigitalTechBackgroundProps {
  showGlobe?: boolean;
  showHighways?: boolean;
  showBadges?: boolean;
}

export const DigitalTechBackground: React.FC<DigitalTechBackgroundProps> = ({
  showGlobe = true,
  showHighways = true,
  showBadges = true,
}) => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10 select-none">
      {/* 1. Lưới hạt số công nghệ (Digital Dot Matrix) */}
      <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1.2px,transparent_1.2px)] [background-size:24px_24px] opacity-35 dark:opacity-20" />

      {/* 2. Quầng sáng Luminous Sky Glow ở đỉnh */}
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[1100px] h-[550px] bg-gradient-to-b from-white/45 via-[#38BDF8]/25 to-transparent rounded-[100%] blur-3xl" />

      {/* 3. Quả cầu công nghệ số (Digital Earth Globe) xoay nhẹ nhàng với các đường kinh vĩ tuyến và node mạng lưới ở góc dưới */}
      {showGlobe && (
        <div className="absolute -bottom-24 -left-24 w-96 h-96 lg:w-[460px] lg:h-[460px] opacity-45 dark:opacity-30">
          <svg viewBox="0 0 200 200" className="w-full h-full animate-spin [animation-duration:90s]">
            <circle cx="100" cy="100" r="90" fill="none" stroke="#0284C7" strokeWidth="1.2" strokeDasharray="3 3" opacity="0.4" />
            <circle cx="100" cy="100" r="82" fill="none" stroke="#38BDF8" strokeWidth="1.5" opacity="0.6" />
            <ellipse cx="100" cy="100" rx="90" ry="32" fill="none" stroke="#0284C7" strokeWidth="1.2" opacity="0.5" />
            <ellipse cx="100" cy="100" rx="90" ry="60" fill="none" stroke="#38BDF8" strokeWidth="1.2" opacity="0.5" />
            <ellipse cx="100" cy="100" rx="32" ry="90" fill="none" stroke="#0284C7" strokeWidth="1.2" opacity="0.5" />
            <ellipse cx="100" cy="100" rx="60" ry="90" fill="none" stroke="#38BDF8" strokeWidth="1.2" opacity="0.5" />
            <line x1="10" y1="100" x2="190" y2="100" stroke="#0284C7" strokeWidth="1.5" opacity="0.4" />
            <line x1="100" y1="10" x2="100" y2="190" stroke="#0284C7" strokeWidth="1.5" opacity="0.4" />
            {/* Cyber Nodes */}
            <circle cx="100" cy="40" r="3.5" fill="#38BDF8" />
            <circle cx="140" cy="70" r="2.5" fill="#F59E0B" />
            <circle cx="60" cy="80" r="3.5" fill="#38BDF8" />
            <circle cx="150" cy="120" r="2.5" fill="#38BDF8" />
            <circle cx="70" cy="135" r="3" fill="#F59E0B" />
            <circle cx="100" cy="160" r="2.5" fill="#38BDF8" />
          </svg>
        </div>
      )}

      {/* 4. Các dải luồng sáng neon uốn lượn (Cyber Highways) */}
      {showHighways && (
        <div className="absolute inset-x-0 bottom-0 h-52 opacity-40 dark:opacity-25 overflow-hidden">
          <svg viewBox="0 0 1440 220" className="w-full h-full" preserveAspectRatio="none">
            <path
              d="M -100 180 C 300 240, 600 80, 1540 160"
              fill="none"
              stroke="#0284C7"
              strokeWidth="3.5"
              opacity="0.65"
            />
            <path
              d="M -100 200 C 400 120, 800 220, 1540 130"
              fill="none"
              stroke="#38BDF8"
              strokeWidth="4"
              opacity="0.75"
            />
            <path
              d="M -100 220 C 500 100, 950 210, 1540 100"
              fill="none"
              stroke="#F59E0B"
              strokeWidth="2.5"
              opacity="0.6"
            />
          </svg>
        </div>
      )}

      {/* 5. Các icon công nghệ số đặc trưng: Wifi, Cloud, Biểu đồ dữ liệu, Công dân số, Bánh răng cài đặt */}
      {showBadges && (
        <div className="absolute bottom-14 left-24 hidden lg:flex items-center gap-3.5 opacity-65 dark:opacity-40">
          <div className="w-10 h-10 rounded-full bg-white/90 dark:bg-slate-900/80 border border-sky-300 dark:border-sky-500/40 shadow-md flex items-center justify-center text-[#0284C7] dark:text-[#38BDF8]">
            <Wifi className="w-5 h-5" />
          </div>
          <div className="w-10 h-10 rounded-full bg-white/90 dark:bg-slate-900/80 border border-sky-300 dark:border-sky-500/40 shadow-md flex items-center justify-center text-[#0284C7] dark:text-[#38BDF8]">
            <Cloud className="w-5 h-5" />
          </div>
          <div className="w-10 h-10 rounded-full bg-white/90 dark:bg-slate-900/80 border border-sky-300 dark:border-sky-500/40 shadow-md flex items-center justify-center text-[#0284C7] dark:text-[#38BDF8]">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div className="w-10 h-10 rounded-full bg-white/90 dark:bg-slate-900/80 border border-amber-300 dark:border-amber-500/40 shadow-md flex items-center justify-center text-amber-500">
            <Users className="w-5 h-5" />
          </div>
          <div className="w-10 h-10 rounded-full bg-white/90 dark:bg-slate-900/80 border border-sky-300 dark:border-sky-500/40 shadow-md flex items-center justify-center text-[#0284C7] dark:text-[#38BDF8]">
            <Settings className="w-5 h-5" />
          </div>
        </div>
      )}
    </div>
  );
};
