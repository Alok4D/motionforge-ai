import React from 'react';
import { Globe, LogOut } from 'lucide-react';

interface HeaderProps {
  pipelineActive?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ pipelineActive = true }) => {
  return (
    <header className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between sticky top-0 z-50 shadow-xs">
      <div className="flex items-center gap-3">
        {/* Brand Emblem */}
        <div className="w-10 h-10 rounded-lg bg-red-600 text-white font-black text-xl flex items-center justify-center shadow-sm">
          M
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold tracking-tight text-slate-900 m-0">Motion Hero</h1>
            <span className="text-[10px] uppercase font-extrabold bg-red-100 text-red-700 px-1.5 py-0.5 rounded tracking-wider">
              PRO
            </span>
          </div>
          <p className="text-[11px] font-medium tracking-wide uppercase text-slate-500 m-0">
            Interactive HTML5 Motion Graphic & Microstock SEO Studio
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Fixed Frame-Grid Pipeline Status */}
        {pipelineActive && (
          <div className="hidden md:flex items-center gap-1.5 text-[11px] font-semibold tracking-wider uppercase text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            FIXED FRAME-GRID PIPELINE ACTIVE
          </div>
        )}

        <button
          onClick={() => window.open('https://www.motionhero.net', '_blank')}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg border border-slate-200 transition"
        >
          <Globe className="w-3.5 h-3.5" />
          Home / Landing Page
        </button>

        <button
          onClick={() => alert('Motion Hero Pro Studio Session Active')}
          className="flex items-center gap-1.5 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg border border-red-200 transition"
        >
          <LogOut className="w-3.5 h-3.5" />
          Logout
        </button>
      </div>
    </header>
  );
};
