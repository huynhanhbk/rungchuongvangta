import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, Sparkles, Volume2, VolumeX, ArrowLeft, Edit3, Check, RotateCcw, Wifi, Cloud, BarChart3, Users, Cpu } from 'lucide-react';
import { useSound } from '../hooks/useSound';
import { APP_CONFIG } from '../config';

export const GoldenBellScreen: React.FC = () => {
  const navigate = useNavigate();
  const [winnerName, setWinnerName] = useState<string>('Nguyễn Văn A');
  const [isEditingName, setIsEditingName] = useState<boolean>(false);
  const [isRinging, setIsRinging] = useState<boolean>(false);
  const [isCelebrating, setIsCelebrating] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number>(10);
  const [burstKey, setBurstKey] = useState<number>(0);

  const { playCelebrationChime, stopCelebrationChime, soundEnabled, toggleSound, volume, changeVolume } = useSound();
  const ringTimerRef = useRef<number | null>(null);
  const celebrationTimerRef = useRef<number | null>(null);
  const countdownIntervalRef = useRef<number | null>(null);

  // Dọn dẹp timers và âm thanh khi unmount
  useEffect(() => {
    return () => {
      if (ringTimerRef.current) window.clearTimeout(ringTimerRef.current);
      if (celebrationTimerRef.current) window.clearTimeout(celebrationTimerRef.current);
      if (countdownIntervalRef.current) window.clearInterval(countdownIntervalRef.current);
      stopCelebrationChime();
    };
  }, [stopCelebrationChime]);

  const handleRingBell = () => {
    // 1. Dọn dẹp trạng thái cũ nếu đang chạy để khởi động lại mượt mà
    if (ringTimerRef.current) window.clearTimeout(ringTimerRef.current);
    if (celebrationTimerRef.current) window.clearTimeout(celebrationTimerRef.current);
    if (countdownIntervalRef.current) window.clearInterval(countdownIntervalRef.current);
    stopCelebrationChime();

    // 2. Kích hoạt hiệu ứng rung lắc chuông và pháo tia 10 GIÂY
    setIsRinging(true);
    setIsCelebrating(true);
    setCountdown(10);
    setBurstKey((prev) => prev + 1);

    // 3. Phát âm thanh tiếng chuông (Bell) chân thực ngân vang 10 giây
    playCelebrationChime();

    // Rung lắc mạnh ban đầu 2.5 giây, sau đó chuyển sang nhịp lắc ăn mừng vui tươi
    ringTimerRef.current = window.setTimeout(() => {
      setIsRinging(false);
      ringTimerRef.current = null;
    }, 2500);

    // Đếm ngược 10 giây
    let remaining = 10;
    countdownIntervalRef.current = window.setInterval(() => {
      remaining -= 1;
      setCountdown(Math.max(0, remaining));
      if (remaining <= 0) {
        if (countdownIntervalRef.current) {
          window.clearInterval(countdownIntervalRef.current);
          countdownIntervalRef.current = null;
        }
      }
    }, 1000);

    // Kết thúc hiệu ứng pháo tia chúc mừng sau đúng 10 GIÂY
    celebrationTimerRef.current = window.setTimeout(() => {
      setIsCelebrating(false);
      celebrationTimerRef.current = null;
    }, 10000);
  };

  const handleReset = () => {
    if (ringTimerRef.current) {
      window.clearTimeout(ringTimerRef.current);
      ringTimerRef.current = null;
    }
    if (celebrationTimerRef.current) {
      window.clearTimeout(celebrationTimerRef.current);
      celebrationTimerRef.current = null;
    }
    if (countdownIntervalRef.current) {
      window.clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    stopCelebrationChime();
    setIsRinging(false);
    setIsCelebrating(false);
    setCountdown(10);
  };

  // 18 tia sáng nan quạt đa sắc tỏa ra từ tâm chuông (góc chia đều 20 độ)
  const RAY_COUNT = 18;
  const rayAngles = Array.from({ length: RAY_COUNT }, (_, i) => (360 / RAY_COUNT) * i);

  return (
    <div className="relative min-h-screen w-full bg-gradient-to-b from-[#0284C7] via-[#E0F2FE] to-[#BAE6FD] text-[#0B2A6F] dark:from-[#06152D] dark:via-[#0B2545] dark:to-[#031A3D] dark:text-slate-100 flex flex-col justify-between overflow-hidden select-none transition-colors duration-300">
      
      {/* ============================================================== */}
      {/* BACKGROUND GRAPHICS: CHUYỂN ĐỔI SỐ (THEO ẢNH MẪU BANNER)       */}
      {/* ============================================================== */}
      {/* 1. Lưới hạt số công nghệ (Digital Dot Matrix) */}
      <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1.2px,transparent_1.2px)] [background-size:24px_24px] opacity-35 dark:opacity-20 pointer-events-none" />
      
      {/* 2. Quầng sáng Luminous Sky Glow ở đỉnh */}
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[1100px] h-[550px] bg-gradient-to-b from-white/40 via-[#38BDF8]/25 to-transparent rounded-[100%] blur-3xl pointer-events-none" />

      {/* 3. Quả cầu công nghệ số (Digital Earth Globe) góc dưới bên trái */}
      <div className="absolute -bottom-24 -left-24 w-96 h-96 lg:w-[460px] lg:h-[460px] pointer-events-none opacity-45 dark:opacity-30">
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
          <circle cx="100" cy="40" r="3" fill="#38BDF8" />
          <circle cx="140" cy="70" r="2.5" fill="#F59E0B" />
          <circle cx="60" cy="80" r="3" fill="#38BDF8" />
          <circle cx="150" cy="120" r="2.5" fill="#38BDF8" />
          <circle cx="70" cy="135" r="3" fill="#F59E0B" />
          <circle cx="100" cy="160" r="2.5" fill="#38BDF8" />
        </svg>
      </div>

      {/* 4. Dải luồng sáng công nghệ uốn lượn (Cyber Highways & Neon Ribbons) */}
      <div className="absolute inset-x-0 bottom-0 h-48 pointer-events-none opacity-40 dark:opacity-25 overflow-hidden">
        <svg viewBox="0 0 1440 220" className="w-full h-full preserve-3d" preserveAspectRatio="none">
          <path
            d="M -100 180 C 300 240, 600 80, 1540 160"
            fill="none"
            stroke="#0284C7"
            strokeWidth="3"
            opacity="0.6"
          />
          <path
            d="M -100 200 C 400 120, 800 220, 1540 130"
            fill="none"
            stroke="#38BDF8"
            strokeWidth="4"
            opacity="0.7"
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

      {/* 5. Floating Tech Badges (Wifi, Cloud, Data, Citizens, Gear) */}
      <div className="absolute bottom-16 left-28 hidden lg:flex items-center gap-3 pointer-events-none opacity-60">
        <div className="w-10 h-10 rounded-full bg-white/90 border border-sky-300 shadow-md flex items-center justify-center text-[#0284C7]">
          <Wifi className="w-5 h-5" />
        </div>
        <div className="w-10 h-10 rounded-full bg-white/90 border border-sky-300 shadow-md flex items-center justify-center text-[#0284C7]">
          <Cloud className="w-5 h-5" />
        </div>
        <div className="w-10 h-10 rounded-full bg-white/90 border border-sky-300 shadow-md flex items-center justify-center text-[#0284C7]">
          <BarChart3 className="w-5 h-5" />
        </div>
        <div className="w-10 h-10 rounded-full bg-white/90 border border-amber-300 shadow-md flex items-center justify-center text-amber-500">
          <Users className="w-5 h-5" />
        </div>
        <div className="w-10 h-10 rounded-full bg-white/90 border border-sky-300 shadow-md flex items-center justify-center text-[#0284C7]">
          <Cpu className="w-5 h-5" />
        </div>
      </div>

      {/* ============================================================== */}
      {/* TOP HEADER BAR                                                 */}
      {/* ============================================================== */}
      <header className="relative z-20 pt-4 px-6 lg:px-12 flex items-center justify-between">
        <button
          onClick={() => navigate('/quiz/main')}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/90 border border-sky-200 hover:bg-white text-[#0B2A6F] dark:bg-slate-900/80 dark:border-slate-700 dark:hover:bg-slate-800 dark:text-slate-200 font-bold text-sm shadow-md transition-all active:scale-95"
        >
          <ArrowLeft className="w-4 h-4 text-[#0284C7] dark:text-[#38BDF8]" /> Về Màn Hình Thi
        </button>

        {/* Nút bật tắt âm & Âm lượng */}
        <div className="flex items-center gap-2 bg-white/90 dark:bg-slate-900/80 border border-sky-200 dark:border-slate-700/80 px-3.5 py-1.5 rounded-xl shadow-md backdrop-blur-sm">
          <button
            onClick={toggleSound}
            title={soundEnabled ? 'Tắt âm' : 'Bật âm'}
            className="text-amber-500 dark:text-amber-400 hover:scale-110 transition-transform"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-rose-500" />}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={volume}
            onChange={(e) => changeVolume(parseFloat(e.target.value))}
            className="w-16 accent-amber-500 h-1 bg-sky-200 dark:bg-slate-700 rounded cursor-pointer"
            title={`Âm lượng: ${Math.round(volume * 100)}%`}
          />
        </div>
      </header>

      {/* ============================================================== */}
      {/* MAIN CONTENT ARENA                                             */}
      {/* ============================================================== */}
      <main className="relative z-20 flex-1 flex flex-col items-center justify-between px-4 max-w-6xl mx-auto w-full text-center py-2">
        
        {/* TOP SECTION: WINNER NAME & CELEBRATION HEADLINE */}
        <div className="w-full flex flex-col items-center justify-center shrink-0">
          {/* WINNER NAME BAR */}
          <div className="mb-2 w-full max-w-2xl">
            {isEditingName ? (
              <div className="flex items-center gap-2 bg-white/95 border-2 border-amber-500 rounded-2xl p-2 shadow-2xl animate-fade-in dark:bg-slate-900/90 dark:border-amber-400">
                <input
                  type="text"
                  value={winnerName}
                  onChange={(e) => setWinnerName(e.target.value)}
                  autoFocus
                  placeholder="Nhập họ tên thí sinh xuất sắc nhất..."
                  className="flex-1 bg-transparent px-4 py-2 text-2xl md:text-3xl font-black text-[#0B2A6F] dark:text-amber-300 text-center focus:outline-none"
                />
                <button
                  onClick={() => setIsEditingName(false)}
                  className="p-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:brightness-110 text-white rounded-xl font-bold transition-all shadow"
                  title="Xong"
                >
                  <Check className="w-6 h-6" />
                </button>
              </div>
            ) : (
              <div
                onClick={() => setIsEditingName(true)}
                className="group cursor-pointer inline-flex items-center gap-3 px-8 py-2.5 rounded-2xl bg-white/95 border-2 border-amber-400/80 hover:border-amber-500 shadow-xl shadow-amber-500/10 backdrop-blur-md dark:bg-slate-900/85 dark:border-amber-400/50 dark:hover:border-amber-400 transition-all hover:scale-105 active:scale-95"
              >
                <Trophy className="w-7 h-7 text-amber-500" />
                <span className="text-xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-amber-700 to-yellow-600 dark:from-amber-300 dark:via-yellow-100 dark:to-amber-400">
                  {winnerName || 'Nhấp vào đây để nhập tên thí sinh'}
                </span>
                <Edit3 className="w-4 h-4 text-slate-400 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors" />
              </div>
            )}
          </div>

          {/* CELEBRATION HEADLINE & SLOGAN */}
          <div className="min-h-[84px] flex flex-col items-center justify-center">
            {isCelebrating ? (
              <div className="animate-congrat-pop space-y-0.5">
                <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black uppercase text-transparent bg-clip-text bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 dark:from-amber-300 dark:via-yellow-200 dark:to-amber-500 tracking-tight drop-shadow-[0_6px_24px_rgba(255,138,0,0.45)] leading-tight">
                  CHÚC MỪNG!
                </h2>
                <div className="text-lg sm:text-xl md:text-2xl font-black text-[#0B2A6F] dark:text-[#38BDF8] uppercase tracking-wider">
                  {winnerName} • THÍ SINH XUẤT SẮC NHẤT
                </div>
                <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                  <div className="inline-flex items-center gap-2 px-5 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/80 text-amber-900 dark:text-amber-200 font-extrabold text-xs md:text-sm shadow-sm">
                    <Sparkles className="w-4 h-4 text-amber-500 animate-spin" />
                    {APP_CONFIG.slogan}
                    <Sparkles className="w-4 h-4 text-amber-500 animate-spin" />
                  </div>
                </div>
              </div>
            ) : (
              <div className="animate-fade-in">
                <div className="text-lg md:text-2xl font-extrabold text-[#0369A1] dark:text-sky-300 uppercase tracking-widest flex items-center justify-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                  VINH DANH RUNG CHUÔNG VÀNG
                  <Sparkles className="w-5 h-5 text-amber-500" />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ============================================================== */}
        {/* GOLDEN BELL 3D ICON (TĂNG KÍCH THƯỚC GẤP 1.5 LẦN: ~600PX)     */}
        {/* ============================================================== */}
        <div className="relative my-auto flex items-center justify-center w-full max-h-[58vh]">
          
          {/* PHÁO TIA CHÚC MỪNG 10 GIÂY (Thuần SVG/CSS mượt mà, rực rỡ, không tốn GPU) */}
          {isCelebrating && (
            <div key={burstKey} className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
              
              {/* Vầng hào quang xoay tròn 10 giây mở rộng theo chuông 1.5x */}
              <div className="absolute w-[650px] h-[650px] md:w-[900px] md:h-[900px] lg:w-[1050px] lg:h-[1050px] rounded-full bg-gradient-to-r from-amber-400/25 via-sky-400/30 to-orange-400/25 blur-3xl animate-halo-10s pointer-events-none" />

              {/* 18 Tia sáng nan quạt đa sắc tỏa ra 10 giây mở rộng theo tỷ lệ */}
              <svg className="w-[700px] h-[700px] md:w-[980px] md:h-[980px] lg:w-[1100px] lg:h-[1100px] overflow-visible" viewBox="-320 -320 640 640">
                <defs>
                  {/* Gradient tia sáng vàng kim */}
                  <linearGradient id="rayGoldGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
                    <stop offset="25%" stopColor="#FFF176" stopOpacity="0.9" />
                    <stop offset="65%" stopColor="#FFB300" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#FF6F00" stopOpacity="0" />
                  </linearGradient>

                  {/* Gradient tia sáng xanh cyan công nghệ */}
                  <linearGradient id="rayCyanGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
                    <stop offset="35%" stopColor="#38BDF8" stopOpacity="0.85" />
                    <stop offset="100%" stopColor="#0284C7" stopOpacity="0" />
                  </linearGradient>
                </defs>

                {rayAngles.map((angle, idx) => {
                  const isCyanRay = idx % 3 === 1;
                  return (
                    <g
                      key={idx}
                      className="animate-ray-burst-10s"
                      style={{
                        transformOrigin: '0 0',
                        ['--ray-deg' as string]: `${angle}deg`,
                      }}
                    >
                      {/* Tia sáng nan quạt mở rộng tỷ lệ lớn */}
                      <path
                        d="M -9 75 L 9 75 L 5 290 L -5 290 Z"
                        fill={isCyanRay ? "url(#rayCyanGrad)" : "url(#rayGoldGrad)"}
                      />
                      {/* Ngôi sao lấp lánh ở đầu tia */}
                      <circle cx="0" cy="300" r="5.5" fill={isCyanRay ? "#BAE6FD" : "#FFF59D"} />
                    </g>
                  );
                })}
              </svg>
            </div>
          )}

          {/* ============================================================== */}
          {/* CHUÔNG VÀNG 3D TO HƠN GẤP 1.5 LẦN (~500px -> 620px trên màn hình lớn) */}
          {/* ============================================================== */}
          <div
            onClick={handleRingBell}
            className={`relative z-10 cursor-pointer transform transition-transform hover:scale-105 active:scale-95 ${
              isRinging ? 'animate-bell-ring' : 'animate-bell-gentle'
            }`}
            style={{ touchAction: 'manipulation' }}
            title="Chạm để rung chuông vinh danh 10 giây!"
          >
            {/* Ánh hào quang vàng kim phát sáng sau chuông */}
            <div className="absolute inset-2 rounded-full bg-amber-400/30 blur-3xl pointer-events-none -z-10" />

            <svg
              viewBox="0 0 320 340"
              className="w-96 h-96 sm:w-[420px] sm:h-[420px] md:w-[480px] md:h-[480px] lg:w-[540px] lg:h-[540px] xl:w-[600px] xl:h-[600px] drop-shadow-[0_25px_50px_rgba(245,158,11,0.45)]"
            >
              <defs>
                {/* 1. Gradient thân chuông vàng 3D chân thực (Metallic Gold Cylinder Sheen) */}
                <linearGradient id="bellGold3D" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#92400E" />
                  <stop offset="8%" stopColor="#B45309" />
                  <stop offset="22%" stopColor="#F59E0B" />
                  <stop offset="38%" stopColor="#FDE047" />
                  <stop offset="47%" stopColor="#FFFFFF" />
                  <stop offset="55%" stopColor="#FEF08A" />
                  <stop offset="72%" stopColor="#F59E0B" />
                  <stop offset="88%" stopColor="#D97706" />
                  <stop offset="100%" stopColor="#78350F" />
                </linearGradient>

                {/* 2. Gradient quai treo chuông */}
                <linearGradient id="bellCrownGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#FEF08A" />
                  <stop offset="50%" stopColor="#F59E0B" />
                  <stop offset="100%" stopColor="#78350F" />
                </linearGradient>

                {/* 3. Gradient vành môi chuông (Lip Ring 3D) */}
                <linearGradient id="bellLipGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#78350F" />
                  <stop offset="15%" stopColor="#D97706" />
                  <stop offset="45%" stopColor="#FEF08A" />
                  <stop offset="52%" stopColor="#FFFFFF" />
                  <stop offset="65%" stopColor="#FDE047" />
                  <stop offset="85%" stopColor="#B45309" />
                  <stop offset="100%" stopColor="#451A03" />
                </linearGradient>

                {/* 4. Gradient lòng trong chuông */}
                <radialGradient id="bellInnerGrad" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#1E1005" />
                  <stop offset="70%" stopColor="#451A03" />
                  <stop offset="100%" stopColor="#78350F" />
                </radialGradient>

                {/* 5. Gradient nơ đỏ khánh tiết */}
                <linearGradient id="ribbonRed" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#EF4444" />
                  <stop offset="50%" stopColor="#DC2626" />
                  <stop offset="100%" stopColor="#991B1B" />
                </linearGradient>

                {/* 6. Bóng đổ mềm cho chi tiết */}
                <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* A. VÒNG QUAI TREO CHUÔNG ĐỈNH (BELL CROWN LOOP) */}
              <g id="bellCrown">
                {/* Quai vòm dày */}
                <path
                  d="M 132 46 C 132 16, 188 16, 188 46"
                  fill="none"
                  stroke="url(#bellCrownGrad)"
                  strokeWidth="16"
                  strokeLinecap="round"
                />
                {/* Vệt highlight trên quai */}
                <path
                  d="M 140 40 C 140 24, 180 24, 180 40"
                  fill="none"
                  stroke="#FFFFFF"
                  strokeWidth="3.5"
                  opacity="0.85"
                  strokeLinecap="round"
                />
                {/* Chốt tán đai đồng liên kết quai và thân */}
                <rect x="126" y="44" width="68" height="12" rx="6" fill="#B45309" />
                <rect x="128" y="45" width="64" height="8" rx="4" fill="url(#bellLipGrad)" />
              </g>

              {/* B. CON LẮC CHUÔNG (CLAPPER / TONGUE) */}
              <g id="clapper">
                <circle cx="160" cy="285" r="22" fill="#451A03" />
                <circle cx="160" cy="285" r="18" fill="url(#bellLipGrad)" />
                <circle cx="156" cy="281" r="6" fill="#FFFFFF" opacity="0.8" />
              </g>

              {/* C. LÒNG TRONG ĐÁY CHUÔNG (INNER SHADOW ELLIPSE) */}
              <ellipse cx="160" cy="265" rx="108" ry="18" fill="url(#bellInnerGrad)" />

              {/* D. THÂN CHUÔNG VÀNG 3D HOÀNG GIA (ROYAL BELL BODY) */}
              <path
                d="M 136 54
                   C 136 68, 106 115, 96 175
                   C 90 215, 62 245, 52 260
                   C 50 268, 66 274, 85 274
                   L 235 274
                   C 254 274, 270 268, 268 260
                   C 258 245, 230 215, 224 175
                   C 214 115, 184 68, 184 54
                   Z"
                fill="url(#bellGold3D)"
              />

              {/* E. VÀNH MÔI CHUÔNG ĐÚC NỔI 3D (HEAVY SOUND RING LIP) */}
              <ellipse cx="160" cy="268" rx="112" ry="15" fill="url(#bellLipGrad)" />
              <ellipse cx="160" cy="267" rx="104" ry="10" fill="#FEF08A" opacity="0.6" />
              <ellipse cx="160" cy="265" rx="86" ry="6" fill="#FFFFFF" opacity="0.75" />

              {/* F. CÁC ĐƯỜNG GỜ NỔI TRANG TRÍ CHẠM KHẮC (RELIEF RINGS) */}
              {/* Vòng chỉ nổi vai chuông */}
              <path
                d="M 112 118 C 130 128, 190 128, 208 118"
                fill="none"
                stroke="#B45309"
                strokeWidth="5"
                opacity="0.8"
              />
              <path
                d="M 112 117 C 130 127, 190 127, 208 117"
                fill="none"
                stroke="#FFFFFF"
                strokeWidth="2.5"
                opacity="0.9"
              />

              {/* Vòng chỉ nổi kép eo chuông */}
              <path
                d="M 96 182 C 122 195, 198 195, 224 182"
                fill="none"
                stroke="#78350F"
                strokeWidth="6"
                opacity="0.85"
              />
              <path
                d="M 96 181 C 122 194, 198 194, 224 181"
                fill="none"
                stroke="#FEF08A"
                strokeWidth="3.5"
                opacity="0.95"
              />

              {/* Vòng chỉ nổi viền chân chuông */}
              <path
                d="M 72 236 C 108 252, 212 252, 248 236"
                fill="none"
                stroke="#92400E"
                strokeWidth="6"
                opacity="0.85"
              />
              <path
                d="M 72 235 C 108 251, 212 251, 248 235"
                fill="none"
                stroke="#FFFFFF"
                strokeWidth="3"
                opacity="0.9"
              />

              {/* G. BIỂU TƯỢNG NGÔI SAO VÀNG DẬP NỔI TRÊN MẶT CHUÔNG */}
              <g transform="translate(160, 150) scale(1.15)">
                <polygon
                  points="0,-16 4.8,-4.8 16,-4.8 7.2,2.4 10.4,14.4 0,7.2 -10.4,14.4 -7.2,2.4 -16,-4.8 -4.8,-4.8"
                  fill="#FFF59D"
                  stroke="#B45309"
                  strokeWidth="1.5"
                  filter="url(#softGlow)"
                />
                <polygon
                  points="0,-13 3.8,-3.8 13,-3.8 5.8,1.8 8.4,11.5 0,5.8 -8.4,11.5 -5.8,1.8 -13,-3.8 -3.8,-3.8"
                  fill="#FFFFFF"
                  opacity="0.8"
                />
              </g>

              {/* H. NƠ LỤA ĐỎ KHÁNH TIẾT TRANG TRỌNG (RED CELEBRATION RIBBON) */}
              <g id="redRibbon" transform="translate(160, 62)">
                {/* Dải ruy băng lượn sóng bên trái */}
                <path
                  d="M -14 6 C -36 20, -42 50, -32 72 C -30 60, -22 45, -8 32 Z"
                  fill="url(#ribbonRed)"
                />
                {/* Dải ruy băng lượn sóng bên phải */}
                <path
                  d="M 14 6 C 36 20, 42 50, 32 72 C 30 60, 22 45, 8 32 Z"
                  fill="url(#ribbonRed)"
                />
                {/* Cánh nơ trái */}
                <ellipse cx="-20" cy="0" rx="20" ry="12" fill="url(#ribbonRed)" transform="rotate(-15 -20 0)" />
                <ellipse cx="-20" cy="0" rx="14" ry="7" fill="#B91C1C" transform="rotate(-15 -20 0)" />
                {/* Cánh nơ phải */}
                <ellipse cx="20" cy="0" rx="20" ry="12" fill="url(#ribbonRed)" transform="rotate(15 20 0)" />
                <ellipse cx="20" cy="0" rx="14" ry="7" fill="#B91C1C" transform="rotate(15 20 0)" />
                {/* Nút thắt tâm nơ đính hạt ngọc vàng */}
                <circle cx="0" cy="0" r="10" fill="url(#ribbonRed)" />
                <circle cx="0" cy="0" r="6" fill="url(#bellCrownGrad)" />
                <circle cx="-2" cy="-2" r="2" fill="#FFFFFF" />
              </g>
            </svg>
          </div>
        </div>

        {/* NÚT BẤM "CHẠM ĐỂ RUNG CHUÔNG" */}
        <div className="mt-2 text-center">
          <button
            onClick={handleRingBell}
            className="px-8 py-3.5 rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:brightness-110 text-white font-black text-base md:text-lg uppercase tracking-wider shadow-xl shadow-amber-500/30 active:scale-95 transition-all inline-flex items-center gap-3 border-2 border-amber-300/60"
          >
            <Sparkles className="w-5 h-5 text-yellow-200 animate-spin" />
            CHẠM ĐỂ RUNG CHUÔNG
            <Sparkles className="w-5 h-5 text-yellow-200 animate-spin" />
          </button>
        </div>
      </main>

      {/* ============================================================== */}
      {/* BOTTOM FOOTER CONTROLS                                         */}
      {/* ============================================================== */}
      <footer className="relative z-20 py-3.5 px-6 border-t border-sky-300/70 dark:border-slate-800/80 bg-white/85 dark:bg-slate-950/80 backdrop-blur-md flex items-center justify-between text-xs text-[#0B2A6F] dark:text-slate-300 font-semibold">
        <div>
          {APP_CONFIG.organizer} • {APP_CONFIG.location}
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleRingBell}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:brightness-110 text-white font-bold transition-all shadow-md flex items-center gap-1.5"
          >
            <Sparkles className="w-4 h-4" /> Rung Lại Chuông (10s)
          </button>
          <button
            onClick={handleReset}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 dark:border-transparent dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 font-medium transition-colors shadow-sm flex items-center gap-1"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Đặt Lại
          </button>
        </div>
      </footer>
    </div>
  );
};

export default GoldenBellScreen;
