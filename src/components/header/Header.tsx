import React from 'react';
import { Globe, Sparkles } from 'lucide-react';

interface HeaderProps {
  pipelineActive?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ pipelineActive = true }) => {
  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-6 py-3 flex items-center justify-between sticky top-0 z-50 shadow-xs">
      <div className="flex items-center gap-3.5">
        {/* Brand Emblem Logo */}
        <div className="relative group">
          <div className="w-10 h-10 rounded-xl bg-slate-950 p-1 flex items-center justify-center shadow-md border border-slate-800/80 transition-transform duration-300 group-hover:scale-105">
            <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
              <defs>
                <linearGradient id="headerLogoGrad" x1="4" y1="4" x2="60" y2="60" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#00F0FF" />
                  <stop offset="50%" stopColor="#6366F1" />
                  <stop offset="100%" stopColor="#EC4899" />
                </linearGradient>
              </defs>
              <path
                d="M14 44V20L25 35L32 25L39 35L50 20V44"
                stroke="url(#headerLogoGrad)"
                strokeWidth="5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="32" cy="25" r="4" fill="#FFFFFF" />
              <circle cx="32" cy="25" r="2" fill="#00F0FF" />
              <ellipse
                cx="32"
                cy="36"
                rx="20"
                ry="7"
                stroke="url(#headerLogoGrad)"
                strokeWidth="2"
                strokeDasharray="2 3"
                strokeOpacity="0.8"
                transform="rotate(-15 32 36)"
              />
            </svg>
          </div>
          <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-cyan-400 rounded-full border-2 border-white shadow-xs"></span>
        </div>

        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold tracking-tight text-slate-900 m-0 flex items-center gap-1">
              Motion<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">Forge</span>
            </h1>
            <span className="text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-2 py-0.5 rounded-md shadow-xs">
              AI
            </span>
            <span className="hidden sm:inline-block text-[10px] uppercase font-bold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200">
              STUDIO
            </span>
          </div>
          <p className="text-[11px] font-semibold tracking-wide text-slate-500 m-0">
            Generative HTML5 Motion Graphics & 4K Video Studio
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Fixed Frame-Grid Pipeline Status */}
        {pipelineActive && (
          <div className="hidden md:flex items-center gap-1.5 text-[11px] font-semibold tracking-wider uppercase text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            FIXED FRAME-GRID PIPELINE ACTIVE
          </div>
        )}

        <button
          onClick={() => alert('MotionForge AI Studio Session Active • Ready to render 4K 60FPS')}
          className="flex items-center gap-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg border border-indigo-200 transition shadow-2xs"
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
          Pro Studio Active
        </button>
      </div>
    </header>
  );
};
