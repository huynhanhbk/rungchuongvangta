import React, { useState, useEffect, useRef } from 'react';
import { X, Trophy, Sparkles, RotateCcw, Play, CheckCircle2 } from 'lucide-react';
import { useSound } from '../hooks/useSound';

interface LuckyDrawModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AudienceLuckyDrawModal: React.FC<LuckyDrawModalProps> = ({ isOpen, onClose }) => {
  const [minNum, setMinNum] = useState<number>(1);
  const [maxNum, setMaxNum] = useState<number>(100);
  const [currentDisplay, setCurrentDisplay] = useState<number | string>('---');
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [winner, setWinner] = useState<number | null>(null);
  const [history, setHistory] = useState<number[]>([]);

  const { playSlotSpin, playSlotWin, playFanfare } = useSound();
  const spinTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (spinTimerRef.current) clearInterval(spinTimerRef.current);
    };
  }, []);

  if (!isOpen) return null;

  const startSpin = () => {
    if (minNum >= maxNum) {
      alert('Số lớn nhất phải lớn hơn số nhỏ nhất!');
      return;
    }

    setIsSpinning(true);
    setWinner(null);

    const availablePool: number[] = [];
    for (let i = minNum; i <= maxNum; i++) {
      if (!history.includes(i)) {
        availablePool.push(i);
      }
    }

    const candidates = availablePool.length > 0 ? availablePool : Array.from({ length: maxNum - minNum + 1 }, (_, i) => minNum + i);
    const chosenWinner = candidates[Math.floor(Math.random() * candidates.length)];

    let ticks = 0;
    const maxTicks = 35;
    let speed = 40;

    const runStep = () => {
      ticks++;
      const randomDisplay = Math.floor(Math.random() * (maxNum - minNum + 1)) + minNum;
      setCurrentDisplay(randomDisplay);
      playSlotSpin();

      if (ticks < maxTicks) {
        if (ticks > maxTicks - 10) {
          speed += 25; // Slow down effect towards end
        }
        spinTimerRef.current = setTimeout(runStep, speed);
      } else {
        setCurrentDisplay(chosenWinner);
        setWinner(chosenWinner);
        setIsSpinning(false);
        setHistory((prev) => [chosenWinner, ...prev]);
        playSlotWin();
        setTimeout(playFanfare, 400);
      }
    };

    runStep();
  };

  const resetHistory = () => {
    if (confirm('Bạn có chắc muốn xóa lịch sử các số đã quay?')) {
      setHistory([]);
      setWinner(null);
      setCurrentDisplay('---');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 dark:bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-white dark:bg-gradient-to-b dark:from-slate-900 dark:via-slate-850 dark:to-slate-900 border-2 border-amber-500/50 dark:border-amber-400/40 rounded-3xl shadow-2xl p-6 md:p-8 text-slate-900 dark:text-white overflow-hidden transition-colors">
        {/* Subtle glow header */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-24 bg-amber-500/10 blur-3xl rounded-full pointer-events-none" />

        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-700/60 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl shadow-lg">
              <Trophy className="w-7 h-7 text-slate-950" />
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-amber-600 dark:text-amber-300">Quay Số Khán Giả May Mắn</h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">Chọn ngẫu nhiên số ghế / số phiếu nhận quà giao lưu</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Inputs range */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-slate-100 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-700 rounded-2xl p-3">
            <label className="block text-xs uppercase tracking-wider text-slate-600 dark:text-slate-400 font-semibold mb-1">
              Từ số (ghế/phiếu)
            </label>
            <input
              type="number"
              min={1}
              value={minNum}
              onChange={(e) => setMinNum(parseInt(e.target.value, 10) || 1)}
              disabled={isSpinning}
              className="w-full bg-white dark:bg-slate-900/80 border border-slate-300 dark:border-slate-600/70 rounded-xl px-4 py-2 text-xl font-bold text-center text-amber-600 dark:text-amber-400 focus:outline-none focus:border-amber-500"
            />
          </div>
          <div className="bg-slate-100 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-700 rounded-2xl p-3">
            <label className="block text-xs uppercase tracking-wider text-slate-600 dark:text-slate-400 font-semibold mb-1">
              Đến số (ghế/phiếu)
            </label>
            <input
              type="number"
              min={minNum + 1}
              value={maxNum}
              onChange={(e) => setMaxNum(parseInt(e.target.value, 10) || minNum + 1)}
              disabled={isSpinning}
              className="w-full bg-white dark:bg-slate-900/80 border border-slate-300 dark:border-slate-600/70 rounded-xl px-4 py-2 text-xl font-bold text-center text-amber-600 dark:text-amber-400 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* Big Roll display */}
        <div className="relative flex flex-col items-center justify-center py-10 bg-slate-100 dark:bg-gradient-to-b dark:from-slate-950 dark:to-slate-900 border-2 border-amber-500/40 dark:border-amber-400/30 rounded-3xl shadow-inner mb-6 overflow-hidden">
          {winner && (
            <div className="absolute top-3 text-xs uppercase font-extrabold tracking-widest text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 animate-bounce">
              <Sparkles className="w-4 h-4 text-amber-500 dark:text-amber-400" />
              CHÚC MỪNG KHÁN GIẢ MAY MẮN
              <Sparkles className="w-4 h-4 text-amber-500 dark:text-amber-400" />
            </div>
          )}

          <div
            className={`text-7xl md:text-8xl font-black font-mono tracking-wider transition-all duration-100 ${
              winner
                ? 'text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-amber-700 to-yellow-600 dark:from-amber-300 dark:via-yellow-100 dark:to-amber-400 scale-110 drop-shadow-[0_4px_16px_rgba(245,158,11,0.3)] dark:drop-shadow-[0_0_35px_rgba(245,158,11,0.6)]'
                : 'text-amber-600 dark:text-amber-400'
            }`}
          >
            {currentDisplay}
          </div>

          {winner && (
            <p className="mt-3 text-sm text-slate-700 dark:text-slate-300">
              Mời khán giả có số <strong className="text-amber-600 dark:text-amber-300 text-lg">#{winner}</strong> lên sân khấu nhận quà!
            </p>
          )}
        </div>

        {/* Action button */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={startSpin}
            disabled={isSpinning}
            className={`flex-1 py-4 px-6 rounded-2xl font-bold text-lg md:text-xl flex items-center justify-center gap-3 shadow-xl transition-all ${
              isSpinning
                ? 'bg-slate-300 text-slate-600 dark:bg-slate-700 dark:text-slate-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 text-slate-950 hover:brightness-110 active:scale-[0.98] shadow-amber-500/25'
            }`}
          >
            <Play className={`w-6 h-6 ${isSpinning ? 'animate-spin' : ''}`} />
            {isSpinning ? 'Đang quay số ngẫu nhiên...' : winner ? 'Quay Số Tiếp Theo' : 'Bắt Đầu Quay Số'}
          </button>
        </div>

        {/* History list */}
        {history.length > 0 && (
          <div className="bg-slate-100 dark:bg-slate-900/60 border border-slate-300 dark:border-slate-800 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs uppercase font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                Đã trúng thưởng ({history.length} số):
              </span>
              <button
                onClick={resetHistory}
                className="text-xs text-rose-600 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300 flex items-center gap-1 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Xóa lịch sử
              </button>
            </div>
            <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto pr-1">
              {history.map((num, i) => (
                <span
                  key={i}
                  className="px-3 py-1 bg-amber-100 border border-amber-400/60 text-amber-900 dark:bg-amber-500/20 dark:border-amber-400/40 dark:text-amber-300 font-bold text-sm rounded-xl"
                >
                  #{num}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
