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
    <div className="relative min-h-screen w-full bg-gradient-to-br from-slate-100 via-sky-50/50 to-slate-200 text-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 dark:text-white flex flex-col justify-between overflow-x-hidden select-none font-sans transition-colors duration-200">
      {/* Background Subtle Tech Grid & Ambient Glows */}
      <div className="absolute inset-0 bg-[radial-gradient(#94a3b8_1px,transparent_1px)] dark:bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-25 dark:opacity-30 pointer-events-none" />
      <div className="absolute top-1/4 -left-48 w-96 h-96 bg-blue-500/10 dark:bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-amber-400/10 dark:bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* ============================================================== */}
      {/* 1. HEADER SECTION (Thông tin giải đấu & Tiến độ câu hỏi)       */}
      {/* ============================================================== */}
      <header className="relative z-20 px-6 lg:px-12 pr-44 pt-4 pb-3 flex items-center justify-between border-b border-slate-300/80 bg-white/85 dark:border-slate-800/80 dark:bg-slate-950/50 backdrop-blur-md transition-colors">
        {/* Logo & Banner đơn vị */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 via-amber-500 to-yellow-600 flex items-center justify-center shadow-lg shadow-amber-500/20 text-slate-950 font-black text-2xl">
            🔔
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider border ${theme.accentBadge}`}>
                {theme.title}
              </span>
              <span className="text-xs text-amber-600 dark:text-amber-400 font-semibold uppercase tracking-wider">
                {APP_CONFIG.slogan}
              </span>
            </div>
            <h1 className="text-lg lg:text-xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
              {APP_CONFIG.contestName}
            </h1>
          </div>
        </div>

        {/* Center Progress Badge */}
        <div className="flex items-center gap-3">
          <div className="px-6 py-2.5 rounded-2xl bg-white/95 border border-slate-300 shadow-md dark:bg-slate-900/90 dark:border-slate-700/80 dark:shadow-xl flex items-center gap-2.5">
            <span className="text-slate-600 dark:text-slate-400 text-sm font-semibold uppercase">Tiến độ:</span>
            <span className="text-2xl font-black text-amber-600 dark:text-amber-400 font-mono">
              Câu {currentIndex + 1}
              <span className="text-slate-500 dark:text-slate-500 text-lg font-normal">/{currentQuestions.length}</span>
            </span>
          </div>
        </div>

        {/* Right Corner (Clean balanced spacing) */}
        <div className="flex items-center gap-3">
          <div className="hidden lg:flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/90 border border-slate-300 text-xs font-semibold text-slate-700 dark:bg-slate-900/60 dark:border-slate-800 dark:text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>{APP_CONFIG.year} • Tam Anh</span>
          </div>
        </div>
      </header>

      {/* ============================================================== */}
      {/* 2. MAIN STAGE CONTENT (Đồng hồ, Câu hỏi & 4 Đáp án)            */}
      {/* ============================================================== */}
      <main className="relative z-10 flex-1 px-6 lg:px-14 py-4 flex flex-col justify-center max-w-[1800px] mx-auto w-full">
        {/* Top Stage Bar: Big Circular Timer & Status Alerts */}
        <div className="flex items-center justify-between mb-4">
          {/* Question order badge */}
          <div className="flex items-center gap-3">
            <div className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-extrabold text-base tracking-wider uppercase shadow-md shadow-blue-500/20">
              CÂU SỐ {currentIndex + 1}
            </div>
            {timer.isFinished && (
              <div className="px-4 py-1.5 rounded-xl bg-rose-600 text-white font-black text-sm tracking-wider uppercase animate-bounce shadow-lg shadow-rose-600/40">
                🛑 Hết giờ - Hạ bảng!
              </div>
            )}
            {isAnswerRevealed && (
              <div className="px-4 py-1.5 rounded-xl bg-emerald-600 text-white font-black text-sm tracking-wider uppercase shadow-lg shadow-emerald-600/30 flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4" /> Đã công bố đáp án ({currentQ.correctAnswer})
              </div>
            )}
          </div>

          {/* Large Countdown Circular Clock (Requirement: ~120px) */}
          <div className="relative flex items-center justify-center">
            <div className={`relative w-28 h-28 md:w-32 md:h-32 flex items-center justify-center transition-transform ${isLastSeconds ? 'scale-110 animate-pulse' : ''}`}>
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
              {/* Giant Digital Seconds */}
              <div className={`absolute flex flex-col items-center justify-center font-mono font-black text-4xl md:text-5xl ${timerColor}`}>
                <span>{timer.timeLeft}</span>
                <span className="text-[10px] uppercase font-bold tracking-widest text-slate-600 dark:text-slate-400 -mt-1">
                  Giây
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* QUESTION TEXT BOX (Requirement: >= 48px on 1080p, crystal-clear readability) */}
        <div className="relative bg-white/95 dark:bg-gradient-to-r dark:from-slate-900/95 dark:via-slate-850/95 dark:to-slate-900/95 border-2 border-slate-300/90 dark:border-slate-700/80 rounded-3xl p-6 md:p-8 lg:p-10 shadow-xl dark:shadow-2xl mb-6 backdrop-blur-md transition-colors">
          <div className="text-3xl md:text-4xl lg:text-[46px] font-extrabold text-slate-950 dark:text-white leading-tight tracking-tight text-center">
            {currentQ.content}
          </div>
        </div>

        {/* 4 ANSWER CARDS: A, B, C, D (Requirement: ~40px, colorful distinct badges) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
          {(['A', 'B', 'C', 'D'] as OptionKey[]).map((key) => {
            const text = currentQ.options[key];
            const isCorrect = currentQ.correctAnswer === key;
            const isRevealedAndCorrect = isAnswerRevealed && isCorrect;
            const isRevealedAndWrong = isAnswerRevealed && !isCorrect;

            // Distinct theme colors for options with full Light and Dark mode styling
            const keyConfig = {
              A: {
                border: 'border-blue-400 dark:border-blue-500/40',
                bg: 'bg-blue-50/80 dark:bg-blue-950/20',
                badge: 'bg-blue-600 text-white',
                hover: 'hover:border-blue-500 dark:hover:border-blue-400',
              },
              B: {
                border: 'border-emerald-400 dark:border-emerald-500/40',
                bg: 'bg-emerald-50/80 dark:bg-emerald-950/20',
                badge: 'bg-emerald-600 text-white',
                hover: 'hover:border-emerald-500 dark:hover:border-emerald-400',
              },
              C: {
                border: 'border-amber-400 dark:border-amber-500/40',
                bg: 'bg-amber-50/80 dark:bg-amber-950/20',
                badge: 'bg-amber-600 text-white',
                hover: 'hover:border-amber-500 dark:hover:border-amber-400',
              },
              D: {
                border: 'border-purple-400 dark:border-purple-500/40',
                bg: 'bg-purple-50/80 dark:bg-purple-950/20',
                badge: 'bg-purple-600 text-white',
                hover: 'hover:border-purple-500 dark:hover:border-purple-400',
              },
            }[key];

            return (
              <div
                key={key}
                className={`relative flex items-center gap-5 p-5 lg:p-6 rounded-2xl border-2 transition-all duration-300 ${
                  isRevealedAndCorrect
                    ? 'border-emerald-500 bg-emerald-100/90 dark:border-emerald-400 dark:bg-emerald-950/70 shadow-[0_0_35px_rgba(16,185,129,0.4)] scale-[1.02] z-10 ring-4 ring-emerald-500/30'
                    : isRevealedAndWrong
                    ? 'opacity-35 border-slate-300 bg-slate-200/60 dark:border-slate-800 dark:bg-slate-900/40 scale-95'
                    : `${keyConfig.border} ${keyConfig.bg} ${keyConfig.hover} shadow-md dark:shadow-lg`
                }`}
              >
                {/* Round Badge Letter A, B, C, D */}
                <div
                  className={`w-14 h-14 md:w-16 md:h-16 rounded-2xl flex-shrink-0 flex items-center justify-center text-2xl md:text-3xl font-black shadow-md ${
                    isRevealedAndCorrect
                      ? 'bg-emerald-500 text-slate-950 ring-4 ring-emerald-300 animate-pulse'
                      : keyConfig.badge
                  }`}
                >
                  {key}
                </div>

                {/* Option text */}
                <div className={`flex-1 text-2xl md:text-3xl lg:text-[34px] font-bold leading-snug ${
                  isRevealedAndCorrect
                    ? 'text-emerald-950 dark:text-emerald-100 font-extrabold'
                    : 'text-slate-900 dark:text-slate-100'
                }`}>
                  {text}
                </div>

                {/* Crown/Check icon on correct answer */}
                {isRevealedAndCorrect && (
                  <div className="pr-3 text-emerald-600 dark:text-emerald-400 animate-bounce">
                    <CheckCircle className="w-10 h-10" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Explanation banner (if revealed and available) */}
        {isAnswerRevealed && currentQ.explanation && (
          <div className="mt-4 p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-950 dark:bg-slate-900/90 dark:border-emerald-500/40 dark:text-emerald-200 text-base md:text-lg flex items-start gap-3 animate-fade-in shadow-md">
            <span className="font-extrabold text-emerald-700 bg-emerald-200 dark:text-emerald-400 uppercase text-xs tracking-wider px-2 py-1 dark:bg-emerald-950 rounded-lg">
              Giải thích
            </span>
            <span className="font-medium">{currentQ.explanation}</span>
          </div>
        )}
      </main>

      {/* ============================================================== */}
      {/* 3. MC CONTROL BAR (Bottom Deck, toggleable with 'H' key)       */}
      {/* ============================================================== */}
      <footer className="relative z-30 border-t border-slate-300/90 bg-white/95 dark:border-slate-800/80 dark:bg-slate-950/90 backdrop-blur-lg transition-colors">
        {/* Toggle hide bar button */}
        <div className="absolute -top-7 right-8">
          <button
            onClick={() => setHideMCBar(!hideMCBar)}
            className="px-3 py-1 rounded-t-xl bg-white border-t border-x border-slate-300 text-xs font-semibold text-slate-700 hover:text-slate-950 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-400 dark:hover:text-white flex items-center gap-1.5 shadow"
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
