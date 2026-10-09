import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Play,
  Pause,
  RotateCcw,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  Users,
  Award,
  Sparkles,
  Trophy,
  HelpCircle,
  Layers,
  ArrowRightCircle
} from 'lucide-react';
import { QuestionPool, OptionKey } from '../types';
import { useQuiz } from '../context/QuizContext';
import { useTimer } from '../hooks/useTimer';
import { useSound } from '../hooks/useSound';
import { APP_CONFIG } from '../config';
import { AudienceLuckyDrawModal } from './AudienceLuckyDrawModal';
import { DigitalTechBackground } from './DigitalTechBackground';

interface QuizScreenProps {
  pool: QuestionPool;
}

export const QuizScreen: React.FC<QuizScreenProps> = ({ pool }) => {
  const navigate = useNavigate();
  const {
    mainQuestions,
    tiebreakerQuestions,
    audienceQuestions,
    progress,
    settings,
    updateProgress
  } = useQuiz();

  const { playCorrect } = useSound();

  // Xác định bộ câu hỏi theo pool
  const currentQuestions = useMemo(() => {
    if (pool === 'main') return mainQuestions;
    if (pool === 'tiebreaker') return tiebreakerQuestions;
    return audienceQuestions;
  }, [pool, mainQuestions, tiebreakerQuestions, audienceQuestions]);

  // Vị trí câu hỏi hiện tại cho từng pool
  const currentIndex = useMemo(() => {
    if (pool === 'main') return Math.min(progress.mainIndex, Math.max(0, currentQuestions.length - 1));
    if (pool === 'tiebreaker') return Math.min(progress.tiebreakerIndex, Math.max(0, currentQuestions.length - 1));
    return Math.min(progress.audienceIndex, Math.max(0, currentQuestions.length - 1));
  }, [pool, progress, currentQuestions.length]);

  const currentQ = currentQuestions[currentIndex];

  // Trạng thái hiển thị và điều khiển của câu hiện tại
  const [isAnswerRevealed, setIsAnswerRevealed] = useState<boolean>(false);
  const [hideMCBar, setHideMCBar] = useState<boolean>(false);
  const [showLuckyDrawModal, setShowLuckyDrawModal] = useState<boolean>(false);
  const [showJumpModal, setShowJumpModal] = useState<boolean>(false);

  // Thời gian mặc định
  const defaultDuration = useMemo(() => {
    if (currentQ?.customTimeLimit) return currentQ.customTimeLimit;
    if (pool === 'main') return settings.mainTimeLimit;
    if (pool === 'tiebreaker') return settings.tiebreakerTimeLimit;
    return settings.audienceTimeLimit;
  }, [pool, currentQ, settings]);

  // Hook đếm ngược
  const timer = useTimer({
    initialSeconds: defaultDuration,
    onTimeUp: () => {
      if (settings.autoRevealTimeUp) {
        setIsAnswerRevealed(true);
        playCorrect();
      }
    },
  });

  // Reset trạng thái hiển thị đáp án khi chuyển câu
  useEffect(() => {
    setIsAnswerRevealed(false);
    timer.reset(defaultDuration);
  }, [currentIndex, defaultDuration]);

  // Chuyển sang câu khác
  const goToQuestion = useCallback((index: number) => {
    if (index < 0 || index >= currentQuestions.length) return;
    if (pool === 'main') updateProgress({ mainIndex: index });
    else if (pool === 'tiebreaker') updateProgress({ tiebreakerIndex: index });
    else updateProgress({ audienceIndex: index });
  }, [pool, currentQuestions.length, updateProgress]);

  const handleNext = useCallback(() => {
    if (currentIndex < currentQuestions.length - 1) {
      goToQuestion(currentIndex + 1);
    }
  }, [currentIndex, currentQuestions.length, goToQuestion]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      goToQuestion(currentIndex - 1);
    }
  }, [currentIndex, goToQuestion]);

  const handleRevealAnswer = useCallback(() => {
    if (!isAnswerRevealed) {
      setIsAnswerRevealed(true);
      playCorrect();
    }
  }, [isAnswerRevealed, playCorrect]);

  // Lắng nghe bàn phím điều khiển (Phím tắt MC)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Bỏ qua nếu đang gõ trong input
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        timer.toggle();
      } else if (e.code === 'Enter') {
        e.preventDefault();
        handleRevealAnswer();
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === 'h' || e.key === 'H') {
        e.preventDefault();
        setHideMCBar((prev) => !prev);
      } else if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        timer.reset();
        setIsAnswerRevealed(false);
      } else if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen().catch(() => {});
        } else {
          document.exitFullscreen().catch(() => {});
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [timer, handleRevealAnswer, handleNext, handlePrev]);

  // Thông số nhãn giao diện theo từng phần
  const theme = useMemo(() => {
    if (pool === 'main') {
      return {
        title: 'PHẦN THI CHÍNH',
        badge: 'Chính',
        subTitle: 'Hội thi Chuyển đổi số 2026',
        primaryColor: 'from-blue-600 to-indigo-700',
        borderColor: 'border-blue-500/40',
        accentBadge: 'bg-blue-600/10 text-blue-700 border-blue-400 dark:bg-blue-600/20 dark:text-blue-300 dark:border-blue-500/40',
      };
    }
    if (pool === 'tiebreaker') {
      return {
        title: 'CÂU HỎI PHỤ',
        badge: 'Phụ',
        subTitle: 'Phần thi Phân định thứ hạng',
        primaryColor: 'from-amber-600 to-rose-700',
        borderColor: 'border-amber-500/50',
        accentBadge: 'bg-amber-600/10 text-amber-700 border-amber-400 dark:bg-amber-600/20 dark:text-amber-300 dark:border-amber-500/40',
      };
    }
    return {
      title: 'KHÁN GIẢ GIAO LƯU',
      badge: 'Khán giả',
      subTitle: 'Đố vui Công dân số có thưởng',
      primaryColor: 'from-emerald-600 to-teal-700',
      borderColor: 'border-emerald-500/40',
      accentBadge: 'bg-emerald-600/10 text-emerald-700 border-emerald-400 dark:bg-emerald-600/20 dark:text-emerald-300 dark:border-emerald-500/40',
    };
  }, [pool]);

  if (!currentQ) {
    return (
      <div className="min-h-screen bg-slate-100 text-slate-900 dark:bg-slate-950 dark:text-white flex flex-col items-center justify-center p-6 text-center transition-colors">
        <h2 className="text-3xl font-bold mb-4 text-amber-600 dark:text-amber-400">Chưa có câu hỏi trong bộ {theme.title}</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-md">Vui lòng vào trang quản trị để thêm câu hỏi hoặc nạp bộ câu hỏi mẫu.</p>
        <button
          onClick={() => navigate('/admin')}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold shadow-lg transition-all"
        >
          Đến trang Quản trị câu hỏi
        </button>
      </div>
    );
  }

  // Màu sắc của đồng hồ đếm ngược
  const timerColor = timer.timeLeft > 5
    ? 'text-emerald-600 stroke-emerald-600 dark:text-emerald-400 dark:stroke-emerald-400'
    : timer.timeLeft > 3
    ? 'text-amber-600 stroke-amber-600 dark:text-amber-400 dark:stroke-amber-400'
    : 'text-rose-600 stroke-rose-600 dark:text-rose-500 dark:stroke-rose-500';

  const isLastSeconds = timer.timeLeft <= 3 && timer.timeLeft > 0 && timer.isRunning;

  return (
    <div className="relative h-screen max-h-screen w-full bg-gradient-to-b from-[#0284C7] via-[#E0F2FE] to-[#BAE6FD] text-[#0B2A6F] dark:from-[#06152D] dark:via-[#0B2545] dark:to-[#031A3D] dark:text-slate-100 flex flex-col justify-between overflow-hidden select-none font-sans transition-colors duration-300">
      {/* Background Digital Transformation: Dot Matrix, Rotating Globe & Cyber Highways */}
      <DigitalTechBackground showGlobe={true} showHighways={true} showBadges={false} />

      {/* ============================================================== */}
      {/* 1. HEADER SECTION (Thông tin giải đấu & Tiến độ câu hỏi)       */}
      {/* ============================================================== */}
      <header className="relative z-20 px-6 lg:px-10 pr-44 pt-3 pb-2.5 flex items-center justify-between border-b border-sky-200/80 bg-white/90 dark:border-slate-800/80 dark:bg-slate-950/80 backdrop-blur-md transition-colors flex-shrink-0">
        {/* Logo & Banner đơn vị */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 via-amber-500 to-yellow-600 flex items-center justify-center shadow-md shadow-amber-500/20 text-slate-950 font-black text-xl flex-shrink-0">
            🔔
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider border ${theme.accentBadge}`}>
                {theme.title}
              </span>
              <span className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold uppercase tracking-wider">
                {APP_CONFIG.slogan}
              </span>
            </div>
            <h1 className="text-base lg:text-lg font-black text-[#0B2A6F] dark:text-slate-100 tracking-tight leading-tight">
              {APP_CONFIG.contestName}
            </h1>
          </div>
        </div>

        {/* Center Progress Badge */}
        <div className="flex items-center gap-3">
          <div className="px-5 py-2 rounded-2xl bg-white/95 border border-sky-300/80 shadow-sm dark:bg-slate-900/90 dark:border-slate-700/80 dark:shadow-md flex items-center gap-2">
            <span className="text-[#0369A1] dark:text-slate-400 text-xs sm:text-sm font-semibold uppercase">Tiến độ:</span>
            <span className="text-xl sm:text-2xl font-black text-amber-600 dark:text-amber-400 font-mono">
              Câu {currentIndex + 1}
              <span className="text-slate-500 dark:text-slate-500 text-base font-normal">/{currentQuestions.length}</span>
            </span>
          </div>
        </div>

        {/* Right Corner (Clean balanced spacing) */}
        <div className="flex items-center gap-3">
          <div className="hidden lg:flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-white/90 border border-sky-200 text-xs font-semibold text-[#0369A1] dark:bg-slate-900/60 dark:border-slate-800 dark:text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>{APP_CONFIG.year} • Tam Anh</span>
          </div>
        </div>
      </header>

      {/* ============================================================== */}
      {/* 2. MAIN STAGE CONTENT (Đồng hồ, Câu hỏi & 4 Đáp án)            */}
      {/* ============================================================== */}
      <main className="relative z-10 flex-1 px-4 sm:px-6 lg:px-10 xl:px-12 py-2 sm:py-3 flex flex-col justify-center max-w-[1700px] mx-auto w-full min-h-0">
        {/* Top Stage Bar: Circular Timer & Status Alerts */}
        <div className="flex items-center justify-between mb-2.5 sm:mb-3.5 lg:mb-4 flex-shrink-0">
          {/* Question order badge */}
          <div className="flex items-center gap-2.5">
            <div className="px-5 py-2 sm:px-6 sm:py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black text-base sm:text-lg md:text-xl lg:text-2xl tracking-wider uppercase shadow-md shadow-blue-500/20">
              CÂU SỐ {currentIndex + 1}
            </div>
            {timer.isFinished && (
              <div className="px-4 py-2 rounded-xl bg-rose-600 text-white font-black text-sm sm:text-base md:text-lg tracking-wider uppercase animate-bounce shadow-lg shadow-rose-600/30">
                🛑 Hết giờ!
              </div>
            )}
            {isAnswerRevealed && (
              <div className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-black text-sm sm:text-base md:text-lg tracking-wider uppercase shadow-lg shadow-emerald-600/25 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6" /> Đã công bố đáp án ({currentQ.correctAnswer})
              </div>
            )}
          </div>

          {/* Countdown Circular Clock - Kích thước nổi bật, dễ nhìn từ xa */}
          <div className="relative flex items-center justify-center">
            <div className={`relative w-20 h-20 sm:w-24 sm:h-24 md:w-26 md:h-26 lg:w-28 lg:h-28 flex items-center justify-center transition-transform ${isLastSeconds ? 'scale-105 animate-pulse' : ''}`}>
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                {/* Background Ring */}
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  className="stroke-slate-300 dark:stroke-slate-800"
                  strokeWidth="8"
                  fill="transparent"
                />
                {/* Progress Ring */}
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  className={`transition-all duration-300 ${timerColor}`}
                  strokeWidth="8"
                  strokeDasharray={264}
                  strokeDashoffset={264 - (264 * timer.progressPercent) / 100}
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>
              {/* Digital Seconds */}
              <div className={`absolute flex flex-col items-center justify-center font-mono font-black text-3xl sm:text-4xl md:text-5xl ${timerColor}`}>
                <span>{timer.timeLeft}</span>
                <span className="text-[9px] sm:text-[10px] uppercase font-bold tracking-widest text-slate-600 dark:text-slate-400 -mt-1">
                  Giây
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* QUESTION TEXT BOX - Nâng kích thước to rõ nét, phù hợp tầm nhìn xa trên màn hình lớn */}
        <div className="relative bg-white/95 dark:bg-slate-900/95 border-2 sm:border-3 border-sky-300/90 dark:border-sky-500/40 rounded-2xl sm:rounded-3xl p-5 sm:p-6 md:p-7 lg:p-8 shadow-xl mb-3.5 sm:mb-4 lg:mb-5 backdrop-blur-md transition-colors flex-shrink-0">
          <div className="text-2xl sm:text-3xl md:text-4xl lg:text-[42px] xl:text-[46px] 2xl:text-[50px] font-black text-[#0B2A6F] dark:text-white leading-snug tracking-tight text-center drop-shadow-sm">
            {currentQ.content}
          </div>
        </div>

        {/* 4 ANSWER CARDS: A, B, C, D (Kích thước nâng to lên 1 tý cho tầm nhìn xa, màu sắc giữ nguyên 100%) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 lg:gap-4.5 xl:gap-5 flex-shrink-0">
          {(['A', 'B', 'C', 'D'] as OptionKey[]).map((key) => {
            const text = currentQ.options[key];
            const isCorrect = currentQ.correctAnswer === key;
            const isRevealedAndCorrect = isAnswerRevealed && isCorrect;
            const isRevealedAndWrong = isAnswerRevealed && !isCorrect;

            // Màu sắc theo đúng quy định và ảnh đính kèm của người dùng:
            // A - Màu đỏ (chữ vàng như ảnh mẫu)
            // B - Màu xanh dương nhạt (chữ trắng như ảnh mẫu)
            // C - Màu vàng (chữ đỏ như ảnh mẫu)
            // D - Màu xanh lá cây (chữ xanh dương đậm như ảnh mẫu)
            const keyConfig = {
              A: {
                border: 'border-red-400 dark:border-red-500/60',
                bg: 'bg-red-50/95 dark:bg-red-950/40',
                badgeBg: 'bg-gradient-to-br from-red-500 to-red-600',
                badgeText: 'text-[#FDE047]',
                badgeRing: 'ring-4 ring-red-400/40 shadow-lg shadow-red-500/30',
                hover: 'hover:border-red-500 dark:hover:border-red-400 hover:shadow-red-200/50',
              },
              B: {
                border: 'border-sky-400 dark:border-sky-500/60',
                bg: 'bg-sky-50/95 dark:bg-sky-950/40',
                badgeBg: 'bg-gradient-to-br from-sky-400 to-sky-600',
                badgeText: 'text-white',
                badgeRing: 'ring-4 ring-sky-400/40 shadow-lg shadow-sky-500/30',
                hover: 'hover:border-sky-500 dark:hover:border-sky-400 hover:shadow-sky-200/50',
              },
              C: {
                border: 'border-amber-400 dark:border-yellow-500/60',
                bg: 'bg-amber-50/95 dark:bg-amber-950/40',
                badgeBg: 'bg-gradient-to-br from-yellow-300 via-amber-400 to-yellow-500',
                badgeText: 'text-[#DC2626]',
                badgeRing: 'ring-4 ring-amber-400/40 shadow-lg shadow-yellow-500/30',
                hover: 'hover:border-amber-500 dark:hover:border-yellow-400 hover:shadow-yellow-200/50',
              },
              D: {
                border: 'border-emerald-400 dark:border-emerald-500/60',
                bg: 'bg-emerald-50/95 dark:bg-emerald-950/40',
                badgeBg: 'bg-gradient-to-br from-emerald-500 to-green-600',
                badgeText: 'text-[#1E3A8A]',
                badgeRing: 'ring-4 ring-emerald-400/40 shadow-lg shadow-emerald-500/30',
                hover: 'hover:border-emerald-500 dark:hover:border-emerald-400 hover:shadow-emerald-200/50',
              },
            }[key];

            return (
              <div
                key={key}
                className={`relative flex items-center gap-4 sm:gap-4.5 lg:gap-5.5 p-3.5 sm:p-4.5 md:p-5 lg:p-5.5 xl:p-6 rounded-2xl border-2 sm:border-3 transition-all duration-300 min-h-[76px] sm:min-h-[86px] md:min-h-[96px] lg:min-h-[106px] xl:min-h-[116px] ${
                  isRevealedAndCorrect
                    ? 'border-emerald-500 bg-emerald-100/95 dark:border-emerald-400 dark:bg-emerald-950/80 shadow-[0_0_35px_rgba(16,185,129,0.5)] scale-[1.01] z-10 ring-4 ring-emerald-500/40'
                    : isRevealedAndWrong
                    ? 'opacity-35 border-slate-300 bg-slate-200/60 dark:border-slate-800 dark:bg-slate-900/40 scale-95'
                    : `${keyConfig.border} ${keyConfig.bg} ${keyConfig.hover} shadow-md dark:shadow-lg`
                }`}
              >
                {/* Round Badge Letter A, B, C, D - Mô phỏng bảng giơ đáp án tròn, kích thước to nổi bật */}
                <div
                  className={`w-14 h-14 sm:w-16 sm:h-16 md:w-[70px] md:h-[70px] lg:w-[78px] lg:h-[78px] xl:w-[86px] xl:h-[86px] rounded-full flex-shrink-0 flex items-center justify-center text-2xl sm:text-3xl md:text-[34px] lg:text-[40px] xl:text-[44px] font-black transition-all ${
                    isRevealedAndCorrect
                      ? 'bg-emerald-500 text-slate-950 ring-4 ring-emerald-300 animate-pulse shadow-lg shadow-emerald-500/40'
                      : `${keyConfig.badgeBg} ${keyConfig.badgeText} ${keyConfig.badgeRing}`
                  }`}
                >
                  {key}
                </div>

                {/* Option text - Kích thước to hơn 1 tý, tầm nhìn xa rõ nét */}
                <div className={`flex-1 text-xl sm:text-2xl md:text-[27px] lg:text-[31px] xl:text-[35px] 2xl:text-[39px] font-black leading-snug tracking-tight ${
                  isRevealedAndCorrect
                    ? 'text-emerald-950 dark:text-emerald-100'
                    : 'text-[#0B2A6F] dark:text-slate-100'
                }`}>
                  {text}
                </div>

                {/* Crown/Check icon on correct answer */}
                {isRevealedAndCorrect && (
                  <div className="pr-2 text-emerald-600 dark:text-emerald-400 animate-bounce flex-shrink-0">
                    <CheckCircle className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Explanation banner - Chỉ hiển thị ở phần khán giả giao lưu nếu có, đã lược bỏ ở phần thi chính và câu hỏi phụ theo yêu cầu */}
        {isAnswerRevealed && pool === 'audience' && currentQ.explanation && (
          <div className="mt-2.5 p-3 rounded-2xl bg-white/95 border-2 border-emerald-400 text-emerald-950 dark:bg-slate-900/90 dark:border-emerald-500/40 dark:text-emerald-200 text-sm md:text-base flex items-start gap-2.5 animate-fade-in shadow-md backdrop-blur-md flex-shrink-0">
            <span className="font-extrabold text-emerald-700 bg-emerald-100 dark:text-emerald-400 uppercase text-xs tracking-wider px-2 py-0.5 dark:bg-emerald-950 rounded-lg">
              Giải thích
            </span>
            <span className="font-medium">{currentQ.explanation}</span>
          </div>
        )}
      </main>

      {/* ============================================================== */}
      {/* 3. MC CONTROL BAR (Bottom Deck, toggleable with 'H' key)       */}
      {/* ============================================================== */}
      <footer className="relative z-30 border-t border-sky-200/80 bg-white/90 dark:border-slate-800/80 dark:bg-slate-950/90 backdrop-blur-lg transition-colors flex-shrink-0">
        {/* Toggle hide bar button */}
        <div className="absolute -top-7 right-8">
          <button
            onClick={() => setHideMCBar(!hideMCBar)}
            className="px-3 py-1 rounded-t-xl bg-white/95 border-t border-x border-sky-200 text-xs font-semibold text-[#0369A1] hover:text-[#0B2A6F] dark:bg-slate-900 dark:border-slate-700 dark:text-slate-400 dark:hover:text-white flex items-center gap-1.5 shadow"
          >
            {hideMCBar ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            {hideMCBar ? 'Hiện thanh MC (H)' : 'Ẩn thanh MC (H)'}
          </button>
        </div>

        {!hideMCBar && (
          <div className="px-6 lg:px-12 py-3 flex flex-wrap items-center justify-between gap-4">
            {/* Left controls: Prev / Next / Jump */}
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 disabled:opacity-40 disabled:hover:bg-slate-100 font-bold text-sm text-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 dark:border-transparent dark:disabled:hover:bg-slate-800 dark:text-slate-200 flex items-center gap-1.5 transition-colors shadow-sm"
                title="Câu trước (Phím mũi tên trái ←)"
              >
                <ChevronLeft className="w-4 h-4" />
                Câu trước
              </button>

              <button
                onClick={handleNext}
                disabled={currentIndex === currentQuestions.length - 1}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 disabled:opacity-40 disabled:hover:bg-slate-100 font-bold text-sm text-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 dark:border-transparent dark:disabled:hover:bg-slate-800 dark:text-slate-200 flex items-center gap-1.5 transition-colors shadow-sm"
                title="Câu sau (Phím mũi tên phải →)"
              >
                Câu tiếp
                <ChevronRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => setShowJumpModal(true)}
                className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center gap-1.5 border border-slate-300 dark:bg-slate-800/80 dark:hover:bg-slate-700 dark:text-slate-300 dark:border-slate-700 transition-colors shadow-sm"
                title="Chuyển nhanh tới câu số N"
              >
                <Layers className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                Chọn câu
              </button>
            </div>

            {/* Middle controls: Timer & Answer Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={timer.toggle}
                className={`px-6 py-2.5 rounded-xl font-extrabold text-sm flex items-center gap-2 shadow-lg transition-all ${
                  timer.isRunning
                    ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                }`}
                title="Bắt đầu / Tạm dừng (Phím Space)"
              >
                {timer.isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                {timer.isRunning ? 'Tạm Dừng Giờ' : timer.isFinished ? 'Hết Giờ' : 'Bắt Đầu Đếm Giờ'}
              </button>

              <button
                onClick={() => {
                  timer.reset();
                  setIsAnswerRevealed(false);
                }}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 dark:border-transparent dark:text-slate-300 font-bold text-sm flex items-center gap-1.5 transition-colors shadow-sm"
                title="Đặt lại đồng hồ (Phím R)"
              >
                <RotateCcw className="w-4 h-4" />
                Đặt Lại Giờ
              </button>

              <button
                onClick={handleRevealAnswer}
                disabled={isAnswerRevealed}
                className={`px-6 py-2.5 rounded-xl font-extrabold text-sm flex items-center gap-2 shadow-lg transition-all ${
                  isAnswerRevealed
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300 dark:bg-slate-800 dark:text-slate-500 dark:border-slate-700'
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:brightness-110 text-white shadow-blue-500/25'
                }`}
                title="Công bố đáp án (Phím Enter)"
              >
                <CheckCircle className="w-4 h-4" />
                {isAnswerRevealed ? `Đáp Án: ${currentQ.correctAnswer}` : 'Công Bố Đáp Án'}
              </button>
            </div>

            {/* Right Stage shortcuts: Switch Pools / Lucky Draw */}
            <div className="flex items-center gap-2">
              {pool === 'audience' && (
                <button
                  onClick={() => setShowLuckyDrawModal(true)}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-bold text-sm flex items-center gap-2 shadow-lg hover:brightness-110 transition-all"
                >
                  <Sparkles className="w-4 h-4" />
                  Quay Số May Mắn
                </button>
              )}

              {pool === 'main' && currentIndex >= currentQuestions.length - 1 && (
                <button
                  onClick={() => navigate('/quiz/tiebreaker')}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 text-white font-bold text-sm flex items-center gap-2 shadow-lg hover:brightness-110 transition-all"
                >
                  <Award className="w-4 h-4" />
                  Sang Câu Hỏi Phụ
                  <ArrowRightCircle className="w-4 h-4" />
                </button>
              )}

              {pool !== 'audience' && (
                <button
                  onClick={() => navigate('/quiz/audience')}
                  className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-emerald-700 border border-slate-300 dark:bg-slate-800/80 dark:hover:bg-slate-700 dark:text-emerald-400 font-bold text-xs flex items-center gap-1.5 dark:border-slate-700 transition-colors shadow-sm"
                  title="Chuyển sang phần giao lưu khán giả"
                >
                  <Users className="w-4 h-4" />
                  Giao lưu khán giả
                </button>
              )}

              {pool === 'audience' && (
                <button
                  onClick={() => navigate('/quiz/main')}
                  className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-blue-700 border border-slate-300 dark:bg-slate-800/80 dark:hover:bg-slate-700 dark:text-blue-400 font-bold text-xs flex items-center gap-1.5 dark:border-slate-700 transition-colors shadow-sm"
                  title="Quay lại phần thi chính"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Về Phần Thi Chính
                </button>
              )}
            </div>
          </div>
        )}
      </footer>

      {/* ============================================================== */}
      {/* 4. MODAL: JUMP TO QUESTION                                     */}
      {/* ============================================================== */}
      {showJumpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 dark:bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-3xl p-6 max-w-lg w-full text-slate-900 dark:text-white shadow-2xl">
            <h3 className="text-xl font-bold mb-4 text-amber-600 dark:text-amber-400">
              Chọn câu hỏi ({theme.title})
            </h3>
            <div className="grid grid-cols-5 gap-2.5 max-h-72 overflow-y-auto p-1">
              {currentQuestions.map((q, idx) => (
                <button
                  key={q.id}
                  onClick={() => {
                    goToQuestion(idx);
                    setShowJumpModal(false);
                  }}
                  className={`py-3 rounded-xl font-bold text-base transition-all ${
                    idx === currentIndex
                      ? 'bg-amber-500 text-slate-950 ring-2 ring-amber-400 shadow-md font-extrabold'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 dark:border-transparent dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200'
                  }`}
                >
                  Câu {idx + 1}
                </button>
              ))}
            </div>
            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setShowJumpModal(false)}
                className="px-5 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-white font-semibold text-sm transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lucky draw modal */}
      <AudienceLuckyDrawModal
        isOpen={showLuckyDrawModal}
        onClose={() => setShowLuckyDrawModal(false)}
      />
    </div>
  );
};
