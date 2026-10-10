import React from 'react';
import { Globe, Sparkles } from 'lucide-react';

interface HeaderProps {
  pipelineActive?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ pipelineActive = true }) => {
  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-slate-200 px-6 py-3.5 flex items-center justify-between sticky top-0 z-50 shadow-2xs">
      <div className="flex items-center gap-3.5">
        {/* Brand Emblem Logo from user uploaded asset */}
        <div className="relative group flex items-center justify-center">
          <img
            src="/logo.png"
            alt="MotionForge AI Logo"
            className="w-11 h-11 object-contain drop-shadow-sm transition-transform duration-300 group-hover:scale-105"
          />
        </div>

        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold tracking-tight text-slate-900 m-0 flex items-center gap-1">
              Motion<span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00c4ff] via-[#2563eb] to-[#a855f7]">Forge</span>
            </h1>
            <span className="text-xs font-black uppercase tracking-wider bg-gradient-to-r from-[#00c4ff] to-[#2563eb] text-white px-2 py-0.5 rounded-md shadow-2xs">
              AI
            </span>
            <span className="hidden sm:inline-block text-xs uppercase font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md border border-slate-200">
              STUDIO
            </span>
          </div>
          <p className="text-xs font-medium tracking-wide text-slate-500 m-0">
            Generative HTML5 Motion Graphics & 4K Video Studio
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Fixed Frame-Grid Pipeline Status */}
        {pipelineActive && (
          <div className="hidden md:flex items-center gap-2 text-xs font-bold tracking-wider uppercase text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-md border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            FIXED FRAME-GRID PIPELINE ACTIVE
          </div>
        )}

        <button
          onClick={() => alert('MotionForge AI Studio Session Active • Ready to render 4K 60FPS')}
          className="flex items-center gap-2 text-xs font-bold text-white btn-logo-gradient px-3.5 py-2 rounded-lg transition"
        >
          <Sparkles className="w-4 h-4 text-cyan-200" />
          Pro Studio Active
        </button>
      </div>
    </header>
  );
};
