import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Trophy, Sparkles } from 'lucide-react';
import { APP_CONFIG } from '../config';

export const HomeScreen: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen w-full bg-gradient-to-b from-slate-50 via-sky-50/40 to-slate-100 text-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 dark:text-white flex flex-col justify-between overflow-x-hidden select-none font-sans transition-colors duration-200">
      {/* Background Tech Network Effect */}
      <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] dark:bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:28px_28px] opacity-40 dark:opacity-25 pointer-events-none" />
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-blue-500/10 dark:bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-80 h-80 bg-amber-400/10 dark:bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-blue-400/10 dark:bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* Header Organizer Banner */}
      <header className="relative z-10 pt-6 md:pt-10 px-6 text-center">
        <div className="inline-flex items-center gap-3 px-8 py-3 rounded-full bg-white/95 border border-slate-300/80 shadow-xl dark:bg-slate-900/90 dark:border-slate-700/80 dark:shadow-2xl backdrop-blur-md transition-all">
          <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
          <span className="text-base md:text-lg lg:text-xl font-bold uppercase tracking-widest text-slate-800 dark:text-slate-200">
            {APP_CONFIG.organizer}
          </span>
        </div>
      </header>

      {/* Main Hero Section - Expanded width & height for balanced 16:9 fullscreen display */}
      <main className="relative z-10 w-full max-w-7xl 2xl:max-w-[1700px] mx-auto px-6 md:px-12 py-6 md:py-10 text-center flex flex-col items-center justify-center my-auto">
        {/* Glowing Golden Bell Logo Icon */}
        <div className="relative mb-8 md:mb-10 group cursor-pointer" onClick={() => navigate('/vinh-danh')}>
          <div className="w-36 h-36 md:w-44 md:h-44 lg:w-48 lg:h-48 rounded-3xl bg-gradient-to-tr from-amber-400 via-yellow-300 to-amber-600 p-1.5 shadow-[0_0_60px_rgba(245,158,11,0.35)] dark:shadow-[0_0_70px_rgba(245,158,11,0.4)] flex items-center justify-center transition-transform hover:scale-105 active:scale-95">
            <div className="w-full h-full rounded-[20px] bg-gradient-to-b from-white to-slate-100 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center text-6xl md:text-7xl lg:text-8xl shadow-inner">
              🔔
            </div>
          </div>
          <div className="absolute -bottom-3.5 left-1/2 -translate-x-1/2 px-6 py-1.5 rounded-full bg-amber-500 text-slate-950 font-black text-xs md:text-sm uppercase tracking-widest shadow-2xl">
            {APP_CONFIG.shortName}
          </div>
        </div>

        {/* Contest Title: HỘI THI <br> CHUYỂN ĐỔI SỐ XÃ TAM ANH NĂM 2026 */}
        <div className="w-full max-w-6xl 2xl:max-w-7xl px-4 py-2 mb-6 text-center">
          <div className="text-3xl md:text-5xl lg:text-6xl xl:text-7xl font-black uppercase tracking-wider text-amber-600 dark:text-amber-300 drop-shadow-sm dark:drop-shadow-[0_4px_16px_rgba(245,158,11,0.4)] pb-2 md:pb-3">
            HỘI THI
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-[70px] 2xl:text-[84px] font-black uppercase tracking-tight text-slate-950 dark:text-white leading-[1.28] pt-2 pb-4 drop-shadow-[0_4px_16px_rgba(0,0,0,0.1)] dark:drop-shadow-[0_8px_30px_rgba(0,0,0,0.9)]">
            <span className="inline-block">CHUYỂN ĐỔI SỐ&nbsp;<span className="whitespace-nowrap">XÃ TAM ANH</span></span>{' '}
            <span className="inline-block whitespace-nowrap">NĂM 2026</span>
          </h1>
        </div>

        {/* Slogan */}
        <div className="inline-flex items-center gap-4 px-10 py-4 rounded-3xl bg-gradient-to-r from-amber-500/10 via-amber-400/20 to-amber-500/10 border border-amber-500/40 text-amber-700 dark:from-amber-500/15 dark:via-amber-400/20 dark:to-amber-500/15 dark:border-amber-400/40 dark:text-amber-300 text-2xl md:text-3xl lg:text-4xl font-black uppercase tracking-wider mb-8 md:mb-12 shadow-xl dark:shadow-2xl">
          <Sparkles className="w-7 h-7 md:w-8 md:h-8 text-amber-500 dark:text-amber-400" />
          <span>{APP_CONFIG.slogan}</span>
          <Sparkles className="w-7 h-7 md:w-8 md:h-8 text-amber-500 dark:text-amber-400" />
        </div>

        {/* Big Start Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-6 w-full max-w-xl justify-center">
          <button
            onClick={() => navigate('/quiz/main')}
            className="w-full sm:w-auto flex-1 py-5 px-10 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white font-black text-xl md:text-2xl flex items-center justify-center gap-3 shadow-[0_0_35px_rgba(37,99,235,0.4)] dark:shadow-[0_0_40px_rgba(59,130,246,0.5)] hover:brightness-110 active:scale-95 transition-all"
          >
            <Play className="w-7 h-7 fill-white" />
            BẮT ĐẦU HỘI THI
          </button>

          <button
            onClick={() => navigate('/vinh-danh')}
            className="w-full sm:w-auto py-5 px-9 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 text-slate-950 font-black text-lg md:text-xl flex items-center justify-center gap-2.5 shadow-lg shadow-amber-500/25 hover:brightness-110 active:scale-95 transition-all"
          >
            <Trophy className="w-6 h-6 text-slate-950" />
            Chuông Vàng
          </button>
        </div>
      </main>

      {/* Footer Organization Bar */}
      <footer className="relative z-10 border-t border-slate-200/90 dark:border-slate-800/80 py-4 px-6 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto text-center text-xs md:text-sm text-slate-600 dark:text-slate-400 font-medium">
          <span>© 2026 {APP_CONFIG.organizer}</span>
          <span className="mx-2 text-slate-400 dark:text-slate-600">•</span>
        </div>
      </footer>
    </div>
  );
};
