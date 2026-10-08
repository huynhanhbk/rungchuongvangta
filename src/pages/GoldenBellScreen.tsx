import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, Sparkles, Volume2, ArrowLeft, Edit3, Check } from 'lucide-react';
import { FireworksCanvas } from '../components/FireworksCanvas';
import { useSound } from '../hooks/useSound';
import { APP_CONFIG } from '../config';

export const GoldenBellScreen: React.FC = () => {
  const navigate = useNavigate();
  const [winnerName, setWinnerName] = useState<string>('Nguyễn Văn A');
  const [isEditingName, setIsEditingName] = useState<boolean>(false);
  const [isRinging, setIsRinging] = useState<boolean>(false);
  const [hasCelebrated, setHasCelebrated] = useState<boolean>(false);

  const { playGoldenBell, playFanfare, playFirework } = useSound();
  const bellTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleRingBell = () => {
    // Kích hoạt rung lắc chuông
    setIsRinging(true);
    setHasCelebrated(true);

    // Âm thanh chuông vàng + Fanfare hoành tráng
    playGoldenBell();
    setTimeout(playFanfare, 300);

    // Hủy timeout trước nếu bấm liên tục
    if (bellTimeoutRef.current) clearTimeout(bellTimeoutRef.current);
    bellTimeoutRef.current = setTimeout(() => {
      setIsRinging(false);
    }, 2500);
  };

  return (
    <div className="relative min-h-screen w-full bg-gradient-to-b from-amber-50/60 via-slate-100 to-amber-100/40 text-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 dark:text-white flex flex-col justify-between overflow-hidden select-none transition-colors duration-200">
      {/* Pháo hoa Canvas nổ toàn màn hình khi chạm chuông */}
      <FireworksCanvas active={hasCelebrated} onExplode={playFirework} />

      {/* Background ambient lighting */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-gradient-to-r from-amber-500/15 via-yellow-400/20 to-amber-600/15 dark:from-amber-500/20 dark:via-yellow-400/25 dark:to-amber-600/20 rounded-full blur-[120px] pointer-events-none" />

      {/* Top Bar Header */}
      <header className="relative z-20 pt-6 px-6 lg:px-12 flex items-center justify-between">
        <button
          onClick={() => navigate('/quiz/main')}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/90 border border-slate-300 hover:bg-white text-slate-700 hover:text-slate-950 shadow-sm dark:bg-slate-900/80 dark:border-slate-700 dark:hover:bg-slate-800 dark:text-slate-300 font-semibold text-sm transition-all"
        >
          <ArrowLeft className="w-4 h-4" /> Về Màn Hình Thi
        </button>

        <div className="text-center">
          <div className="text-xs uppercase font-extrabold tracking-widest text-amber-600 dark:text-amber-400">
            {APP_CONFIG.organizer}
          </div>
          <div className="text-lg font-black text-slate-900 dark:text-slate-200">
            {APP_CONFIG.contestName}
          </div>
        </div>

        <div className="w-24" /> {/* Spacer */}
      </header>

      {/* Main Content Arena */}
      <main className="relative z-20 flex-1 flex flex-col items-center justify-center px-4 max-w-4xl mx-auto w-full text-center py-4">
        {/* WINNER NAME BAR */}
        <div className="mb-4 w-full max-w-2xl">
          {isEditingName ? (
            <div className="flex items-center gap-2 bg-white/95 border-2 border-amber-500 rounded-2xl p-2 shadow-xl animate-fade-in dark:bg-slate-900/90 dark:border-amber-400">
              <input
                type="text"
                value={winnerName}
                onChange={(e) => setWinnerName(e.target.value)}
                autoFocus
                placeholder="Nhập họ tên thí sinh xuất sắc nhất..."
                className="flex-1 bg-transparent px-4 py-2 text-2xl md:text-3xl font-black text-amber-700 dark:text-amber-300 text-center focus:outline-none"
              />
              <button
                onClick={() => setIsEditingName(false)}
                className="p-3 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl font-bold transition-colors shadow"
                title="Xong"
              >
                <Check className="w-6 h-6" />
              </button>
            </div>
          ) : (
            <div
              onClick={() => setIsEditingName(true)}
              className="group cursor-pointer inline-flex items-center gap-3 px-6 py-2.5 rounded-2xl bg-white/90 border border-amber-500/50 hover:border-amber-500 shadow-md backdrop-blur-md dark:bg-slate-900/80 dark:border-amber-400/40 dark:hover:border-amber-400 dark:shadow-lg transition-all"
            >
              <Trophy className="w-6 h-6 text-amber-500 dark:text-amber-400" />
              <span className="text-xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-amber-700 to-yellow-600 dark:from-amber-300 dark:via-yellow-100 dark:to-amber-400">
                {winnerName || 'Nhấp vào đây để nhập tên thí sinh'}
              </span>
              <Edit3 className="w-4 h-4 text-slate-400 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors" />
            </div>
          )}
        </div>

        {/* CELEBRATION HEADLINE */}
        {hasCelebrated ? (
          <div className="animate-fade-in mb-4">
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-black uppercase text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-700 dark:from-amber-300 dark:via-yellow-200 dark:to-amber-500 tracking-tight drop-shadow-[0_4px_16px_rgba(245,158,11,0.2)] dark:drop-shadow-[0_0_35px_rgba(245,158,11,0.6)]">
              CHÚC MỪNG {winnerName}
            </h2>
            <div className="text-xl md:text-2xl font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mt-1">
              QUÁN QUÂN RUNG CHUÔNG VÀNG 2026
            </div>
            <div className="inline-flex items-center gap-2 mt-2 px-4 py-1 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-800 dark:bg-amber-500/20 dark:border-amber-400/40 dark:text-amber-300 font-bold text-sm">
              <Sparkles className="w-4 h-4 text-amber-500 dark:text-amber-400" />
              {APP_CONFIG.slogan}
              <Sparkles className="w-4 h-4 text-amber-500 dark:text-amber-400" />
            </div>
          </div>
        ) : (
          <div className="mb-4">
            <div className="text-lg md:text-xl font-bold text-amber-700 dark:text-amber-300/90 uppercase tracking-widest flex items-center justify-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500 dark:text-amber-400" />
              KHOẢNH KHẮC VINH QUANG
              <Sparkles className="w-5 h-5 text-amber-500 dark:text-amber-400" />
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
              Chạm hoặc click vào Chuông Vàng để rung chuông và bắn pháo hoa
            </p>
          </div>
        )}

        {/* ============================================================== */}
        {/* GIANT METALLIC GOLDEN BELL (SVG With Rich Gradient Art)        */}
        {/* ============================================================== */}
        <div
          onClick={handleRingBell}
          className="relative group cursor-pointer my-2 transform transition-transform hover:scale-105 active:scale-95"
          style={{ touchAction: 'manipulation' }}
        >
          {/* Subtle star sparkles around the bell */}
          <div className="absolute -top-6 -left-6 text-amber-300 animate-spin text-2xl pointer-events-none" style={{ animationDuration: '6s' }}>✦</div>
          <div className="absolute top-10 -right-8 text-yellow-200 animate-ping text-xl pointer-events-none">✨</div>
          <div className="absolute -bottom-4 left-4 text-amber-400 animate-bounce text-2xl pointer-events-none">★</div>

          <svg
            viewBox="0 0 400 440"
            className={`w-64 h-64 md:w-80 md:h-80 lg:w-96 lg:h-96 filter drop-shadow-[0_0_45px_rgba(245,158,11,0.5)] origin-top ${
              isRinging ? 'animate-[swing_0.8s_ease-in-out_infinite]' : 'animate-[subtleSway_4s_ease-in-out_infinite]'
            }`}
          >
            <defs>
              {/* Radial and Linear Gold Gradients */}
              <linearGradient id="goldHanger" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFF275" />
                <stop offset="50%" stopColor="#F59E0B" />
                <stop offset="100%" stopColor="#78350F" />
              </linearGradient>

              <linearGradient id="goldBody" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#B45309" />
                <stop offset="25%" stopColor="#F59E0B" />
                <stop offset="45%" stopColor="#FEF08A" />
                <stop offset="55%" stopColor="#FFFFFF" />
                <stop offset="70%" stopColor="#FBBF24" />
                <stop offset="100%" stopColor="#92400E" />
              </linearGradient>

              <radialGradient id="goldRim" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#FEF08A" />
                <stop offset="60%" stopColor="#F59E0B" />
                <stop offset="100%" stopColor="#78350F" />
              </radialGradient>

              <linearGradient id="goldRibbon" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#DC2626" />
                <stop offset="50%" stopColor="#EF4444" />
                <stop offset="100%" stopColor="#991B1B" />
              </linearGradient>
            </defs>

            {/* Hanger Ring at top */}
            <circle cx="200" cy="55" r="28" fill="none" stroke="url(#goldHanger)" strokeWidth="16" />
            <rect x="180" y="70" width="40" height="25" rx="6" fill="url(#goldHanger)" />

            {/* Clapper / Quả lắc bên dưới */}
            <ellipse cx="200" cy="385" r="28" fill="url(#goldRim)" />
            <rect x="194" y="320" width="12" height="60" fill="#B45309" />

            {/* Main Bell Body: Curved flared cup */}
            <path
              d="M 180 90
                 C 140 95, 110 130, 105 190
                 C 100 240, 70 310, 45 340
                 C 40 348, 50 360, 70 360
                 L 330 360
                 C 350 360, 360 348, 355 340
                 C 330 310, 300 240, 295 190
                 C 290 130, 260 95, 220 90
                 Z"
              fill="url(#goldBody)"
              stroke="#78350F"
              strokeWidth="2"
            />

            {/* Bell Lip / Vành loe bóng */}
            <ellipse cx="200" cy="358" rx="155" ry="24" fill="url(#goldRim)" stroke="#78350F" strokeWidth="2" />
            <ellipse cx="200" cy="358" rx="142" ry="16" fill="url(#goldBody)" />

            {/* Decorative Golden Embossed Bands */}
            <path
              d="M 98 220 Q 200 240 302 220"
              fill="none"
              stroke="#FFF275"
              strokeWidth="8"
              opacity="0.8"
            />
            <path
              d="M 85 270 Q 200 295 315 270"
              fill="none"
              stroke="#78350F"
              strokeWidth="4"
              opacity="0.6"
            />

            {/* Red Festive Ribbon on top */}
            <path
              d="M 160 85 C 180 75, 220 75, 240 85 C 230 110, 170 110, 160 85 Z"
              fill="url(#goldRibbon)"
            />
          </svg>

          {/* Prompt banner under bell */}
          <div className="mt-3 text-center">
            <span className="px-5 py-2 rounded-full bg-amber-500 text-slate-950 font-black text-sm uppercase tracking-wider shadow-lg group-hover:bg-yellow-400 transition-colors inline-flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              CHẠM VÀO ĐỂ RUNG CHUÔNG
              <Sparkles className="w-4 h-4" />
            </span>
          </div>
        </div>
      </main>

      {/* Bottom Footer Controls */}
      <footer className="relative z-20 py-4 px-6 border-t border-slate-300 dark:border-slate-800/80 bg-white/80 dark:bg-slate-950/80 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
        <div>
          {APP_CONFIG.organizer} - {APP_CONFIG.location}
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleRingBell}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition-all shadow flex items-center gap-1.5"
          >
            <Sparkles className="w-4 h-4" /> Bắn Thêm Pháo Hoa
          </button>
          <button
            onClick={() => setHasCelebrated(false)}
            className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 dark:border-transparent dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 font-medium transition-colors shadow-sm"
          >
            Đặt Lại
          </button>
        </div>
      </footer>

      {/* Keyframe animation for bell swinging */}
      <style>{`
        @keyframes subtleSway {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(2deg); }
        }
        @keyframes swing {
          0% { transform: rotate(0deg); }
          20% { transform: rotate(-15deg); }
          40% { transform: rotate(12deg); }
          60% { transform: rotate(-8deg); }
          80% { transform: rotate(5deg); }
          100% { transform: rotate(0deg); }
        }
      `}</style>
    </div>
  );
};
