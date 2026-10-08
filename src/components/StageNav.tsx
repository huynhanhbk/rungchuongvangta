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
  Sparkles
} from 'lucide-react';
import { useSound } from '../hooks/useSound';
import { APP_CONFIG } from '../config';

export const StageNav: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { soundEnabled, toggleSound, volume, changeVolume } = useSound();

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
    { path: '/', label: 'Màn hình Chào', icon: Home, color: 'text-blue-400' },
    { path: '/quiz/main', label: `Thi Chính (${APP_CONFIG.requirements.main} câu)`, icon: Flame, color: 'text-blue-400' },
    { path: '/quiz/tiebreaker', label: `Câu hỏi Phụ (${APP_CONFIG.requirements.tiebreaker} câu)`, icon: Award, color: 'text-amber-400' },
    { path: '/quiz/audience', label: `Khán giả (${APP_CONFIG.requirements.audience} câu)`, icon: Users, color: 'text-emerald-400' },
    { path: '/vinh-danh', label: 'Chuông Vàng Vinh Danh', icon: Sparkles, color: 'text-yellow-400' },
    { path: '/admin', label: 'Quản trị câu hỏi', icon: Shield, color: 'text-indigo-400' },
  ];

  // Ẩn menu này khi đang ở trang quản trị /admin vì trang admin đã có thanh điều hướng riêng
  if (location.pathname === '/admin') {
    return null;
  }

  return (
    <>
      {/* Floating Toggle Button (Top Right Corner, unobtrusive glass badge) */}
      <div className="fixed top-3.5 right-4 z-40 flex items-center gap-2 opacity-75 hover:opacity-100 transition-opacity">
        <button
          onClick={toggleFullscreen}
          title="Toàn màn hình (F)"
          className="p-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 backdrop-blur-md shadow-lg transition-all"
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>

        <button
          onClick={toggleSound}
          title="Bật/Tắt âm thanh"
          className={`p-2.5 rounded-xl backdrop-blur-md border shadow-lg transition-all ${
            soundEnabled
              ? 'bg-slate-900/90 hover:bg-slate-800 text-amber-400 border-slate-700/80'
              : 'bg-rose-950/90 hover:bg-rose-900/90 text-rose-300 border-rose-800/80'
          }`}
        >
          {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>

        <button
          onClick={() => setIsOpen(!isOpen)}
          title="Menu chuyển màn hình"
          className="p-2.5 px-3.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700/80 backdrop-blur-md shadow-lg transition-all flex items-center gap-2"
        >
          {isOpen ? <X className="w-4 h-4 text-amber-400" /> : <Menu className="w-4 h-4 text-amber-400" />}
          <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
            Điều hướng
          </span>
        </button>
      </div>

      {/* Slide-out or Dropdown Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex justify-end animate-fade-in">
          <div
            className="w-80 max-w-full bg-slate-900 border-l border-slate-800 h-full p-6 flex flex-col justify-between shadow-2xl text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <div className="flex items-center justify-between pb-5 border-b border-slate-800">
                <div>
                  <h3 className="font-bold text-lg text-white">Chuyển Màn Hình</h3>
                  <p className="text-xs text-slate-400">{APP_CONFIG.shortName} 2026</p>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
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
                          ? 'bg-blue-600/25 border border-blue-500/50 text-white font-semibold shadow-md'
                          : 'hover:bg-slate-800/70 text-slate-300 hover:text-white'
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${item.color}`} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick sound volume slider & footer info */}
            <div className="pt-6 border-t border-slate-800/80 space-y-4">
              <div className="bg-slate-850 p-3.5 rounded-xl border border-slate-800">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-2 font-medium">
                  <span className="flex items-center gap-1.5">
                    <Volume2 className="w-4 h-4 text-amber-400" /> Âm lượng
                  </span>
                  <span>{Math.round(volume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={volume}
                  onChange={(e) => changeVolume(parseFloat(e.target.value))}
                  className="w-full accent-amber-400 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
                />
              </div>

              <div className="text-center text-[11px] text-slate-500 leading-relaxed">
                <div>{APP_CONFIG.organizer}</div>
                <div className="text-amber-400/80 font-semibold">{APP_CONFIG.slogan}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
