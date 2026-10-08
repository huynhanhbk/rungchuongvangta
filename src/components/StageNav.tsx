import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Menu,
  X,
  Home,
  Award,
  Users,
  Flame,
  Settings,
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX,
  Shield,
  Sparkles,
  Sun,
  Moon
} from 'lucide-react';
import { useSound } from '../hooks/useSound';
import { useTheme } from '../context/ThemeContext';
import { APP_CONFIG } from '../config';

export const StageNav: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { soundEnabled, toggleSound, volume, changeVolume } = useSound();
  const { theme, toggleTheme, setTheme, isDark } = useTheme();

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (e) {
      console.warn('Fullscreen request failed:', e);
    }
  };

  const navItems = [
    { path: '/', label: 'Màn hình Chào', icon: Home, color: 'text-blue-500 dark:text-blue-400' },
    { path: '/quiz/main', label: `Thi Chính (${APP_CONFIG.requirements.main} câu)`, icon: Flame, color: 'text-blue-600 dark:text-blue-400' },
    { path: '/quiz/tiebreaker', label: `Câu hỏi Phụ (${APP_CONFIG.requirements.tiebreaker} câu)`, icon: Award, color: 'text-amber-600 dark:text-amber-400' },
    { path: '/quiz/audience', label: `Khán giả (${APP_CONFIG.requirements.audience} câu)`, icon: Users, color: 'text-emerald-600 dark:text-emerald-400' },
    { path: '/vinh-danh', label: 'Chuông Vàng Vinh Danh', icon: Sparkles, color: 'text-yellow-600 dark:text-yellow-400' },
    { path: '/admin', label: 'Quản trị câu hỏi', icon: Shield, color: 'text-indigo-600 dark:text-indigo-400' },
  ];

  // Ẩn menu này khi đang ở trang quản trị /admin vì trang admin đã có thanh điều hướng riêng
  if (location.pathname === '/admin') {
    return null;
  }

  return (
    <>
      {/* Floating Toggle Button (Top Right Corner, unobtrusive glass badge) */}
      <div className="fixed top-3.5 right-4 z-40 flex items-center gap-2 opacity-80 hover:opacity-100 transition-opacity">
        {/* Nút chuyển đổi Theme: Sáng / Tối */}
        <button
          onClick={toggleTheme}
          title={isDark ? "Chuyển sang giao diện Sáng (Light Mode)" : "Chuyển sang giao diện Tối (Dark Mode)"}
          className="p-2.5 rounded-xl bg-white/95 hover:bg-white text-amber-600 border border-slate-300 dark:bg-slate-900/90 dark:hover:bg-slate-800 dark:text-amber-400 dark:border-slate-700/80 backdrop-blur-md shadow-lg transition-all"
        >
          {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
        </button>

        <button
          onClick={toggleFullscreen}
          title="Toàn màn hình (F)"
          className="p-2.5 rounded-xl bg-white/95 hover:bg-white text-slate-700 hover:text-slate-900 border border-slate-300 dark:bg-slate-900/90 dark:hover:bg-slate-800 dark:text-slate-300 dark:hover:text-white dark:border-slate-700/80 backdrop-blur-md shadow-lg transition-all"
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>

        <button
          onClick={toggleSound}
          title="Bật/Tắt âm thanh"
          className={`p-2.5 rounded-xl backdrop-blur-md border shadow-lg transition-all ${
            soundEnabled
              ? 'bg-white/95 hover:bg-white text-amber-600 border-slate-300 dark:bg-slate-900/90 dark:hover:bg-slate-800 dark:text-amber-400 dark:border-slate-700/80'
              : 'bg-rose-100 hover:bg-rose-200 text-rose-700 border-rose-300 dark:bg-rose-950/90 dark:hover:bg-rose-900/90 dark:text-rose-300 dark:border-rose-800/80'
          }`}
        >
          {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>

        <button
          onClick={() => setIsOpen(!isOpen)}
          title="Menu chuyển màn hình"
          className="p-2.5 px-3.5 rounded-xl bg-white/95 hover:bg-white text-slate-800 border border-slate-300 dark:bg-slate-900/90 dark:hover:bg-slate-800 dark:text-slate-200 dark:border-slate-700/80 backdrop-blur-md shadow-lg transition-all flex items-center gap-2"
        >
          {isOpen ? <X className="w-4 h-4 text-amber-500 dark:text-amber-400" /> : <Menu className="w-4 h-4 text-amber-500 dark:text-amber-400" />}
          <span className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
            Điều hướng
          </span>
        </button>
      </div>

      {/* Slide-out or Dropdown Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex justify-end animate-fade-in">
          <div
            className="w-80 max-w-full bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 h-full p-6 flex flex-col justify-between shadow-2xl text-slate-900 dark:text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <div className="flex items-center justify-between pb-5 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white">Chuyển Màn Hình</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{APP_CONFIG.shortName} 2026</p>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation Items */}
              <div className="mt-5 space-y-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <button
                      key={item.path}
                      onClick={() => {
                        navigate(item.path);
                        setIsOpen(false);
                      }}
                      className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl font-medium text-left transition-all ${
                        isActive
                          ? 'bg-blue-500/15 border border-blue-500/40 text-blue-900 dark:text-white font-bold shadow-sm'
                          : 'hover:bg-slate-100 dark:hover:bg-slate-800/70 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${item.color}`} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick settings: Theme + Volume + Footer info */}
            <div className="pt-6 border-t border-slate-200 dark:border-slate-800/80 space-y-4">
              {/* Theme Selector Widget */}
              <div className="bg-slate-50 dark:bg-slate-850 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 mb-2.5 font-medium">
                  <span className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
                    {isDark ? <Moon className="w-4 h-4 text-indigo-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
                    Chế độ màu
                  </span>
                  <span className="font-bold text-xs uppercase px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                    {isDark ? '🌙 Tối (Dark)' : '☀️ Sáng (Light)'}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setTheme('light')}
                    className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                      !isDark
                        ? 'bg-amber-500 text-slate-950 shadow-md ring-2 ring-amber-400 font-extrabold'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-400 border border-slate-300 dark:border-slate-700 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <Sun className="w-3.5 h-3.5" /> Sáng (Light)
                  </button>
                  <button
                    onClick={() => setTheme('dark')}
                    className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                      isDark
                        ? 'bg-indigo-600 text-white shadow-md ring-2 ring-indigo-400 font-extrabold'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-400 border border-slate-300 dark:border-slate-700 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <Moon className="w-3.5 h-3.5" /> Tối (Dark)
                  </button>
                </div>
              </div>

              {/* Volume Slider */}
              <div className="bg-slate-50 dark:bg-slate-850 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 mb-2 font-medium">
                  <span className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
                    <Volume2 className="w-4 h-4 text-amber-500 dark:text-amber-400" /> Âm lượng
                  </span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{Math.round(volume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={volume}
                  onChange={(e) => changeVolume(parseFloat(e.target.value))}
                  className="w-full accent-amber-500 dark:accent-amber-400 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-lg cursor-pointer"
                />
              </div>

              <div className="text-center text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                <div className="font-medium">{APP_CONFIG.organizer}</div>
                <div className="text-amber-600 dark:text-amber-400/90 font-semibold">{APP_CONFIG.slogan}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
