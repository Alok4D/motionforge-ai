import React from 'react';
import { Sparkles, Key } from 'lucide-react';

interface HeaderProps {
  pipelineActive?: boolean;
  onOpenApiKeyModal?: () => void;
  activeKeyCount?: number;
}

export const Header: React.FC<HeaderProps> = ({ 
  pipelineActive = true, 
  onOpenApiKeyModal,
  activeKeyCount = 0 
}) => {
  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 md:px-6 py-3 flex items-center justify-between sticky top-0 z-40 shadow-2xs">
      <div className="flex items-center gap-3.5">
        {/* Brand Emblem Logo from user uploaded asset */}
        <div className="relative group flex items-center justify-center">
          <img
            src="/logo.png"
            alt="MotionForge AI Logo"
            className="w-10 h-10 md:w-11 md:h-11 object-contain drop-shadow-sm transition-transform duration-300 group-hover:scale-105"
          />
        </div>

        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg md:text-xl font-extrabold tracking-tight text-slate-900 m-0 flex items-center gap-1">
              Motion<span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00c4ff] via-[#2563eb] to-[#a855f7]">Forge</span>
            </h1>
            <span className="text-xs font-black uppercase tracking-wider bg-gradient-to-r from-[#00c4ff] to-[#2563eb] text-white px-2 py-0.5 rounded-md shadow-2xs">
              AI
            </span>
            <span className="hidden sm:inline-block text-xs uppercase font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md border border-slate-200">
              STUDIO
            </span>
          </div>
          <p className="hidden xs:block text-xs font-medium tracking-wide text-slate-500 m-0">
            Generative HTML5 Motion Graphics & 4K Video Studio
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        {/* Fixed Frame-Grid Pipeline Status */}
        {pipelineActive && (
          <div className="hidden lg:flex items-center gap-2 text-xs font-bold tracking-wider uppercase text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            FIXED FRAME-GRID ACTIVE
          </div>
        )}

        {/* BYOK API Key Button */}
        <button
          onClick={onOpenApiKeyModal}
          className="flex items-center gap-2 text-xs font-bold px-3 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:text-indigo-600 hover:border-indigo-300 transition cursor-pointer shadow-2xs"
          title="Bring Your Own Key (BYOK) - Unlimited Free Generation"
        >
          <Key className="w-3.5 h-3.5 text-indigo-600" />
          <span className="hidden sm:inline">API Keys</span>
          {activeKeyCount > 0 ? (
            <span className="inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-black rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">
              {activeKeyCount}
            </span>
          ) : (
            <span className="w-2 h-2 rounded-full bg-emerald-500" title="Active" />
          )}
        </button>

        <button
          onClick={() => alert('MotionForge AI Studio Session Active • Ready to render 4K 60FPS')}
          className="flex items-center gap-1.5 text-xs font-bold text-white btn-logo-gradient px-3.5 py-2 rounded-lg transition shadow-2xs"
        >
          <Sparkles className="w-3.5 h-3.5 text-cyan-200" />
          <span className="hidden sm:inline">Pro Studio</span>
        </button>
      </div>
    </header>
  );
};
