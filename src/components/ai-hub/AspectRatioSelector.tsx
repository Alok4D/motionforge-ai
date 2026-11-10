import React from 'react';
import type { AspectRatio } from '../../types/motion.types';
import { Sparkles } from 'lucide-react';

interface AspectRatioSelectorProps {
  aspectRatio: AspectRatio;
  setAspectRatio: (ar: AspectRatio) => void;
}

interface RatioOption {
  ratio: AspectRatio;
  label: string;
}

export const AspectRatioSelector: React.FC<AspectRatioSelectorProps> = ({
  aspectRatio,
  setAspectRatio
}) => {
  const primaryOptions: RatioOption[] = [
    { ratio: 'Auto', label: 'AI decides' },
    { ratio: '16:9', label: 'Widescreen' },
    { ratio: '9:16', label: 'Mobile' },
    { ratio: '1:1', label: 'Square' }
  ];

  const secondaryOptions: RatioOption[] = [
    { ratio: '4:3', label: 'Landscape' },
    { ratio: '3:4', label: 'Portrait' },
    { ratio: '21:9', label: 'Cinematic' }
  ];

  // SVG shape icon matching ratio geometry
  const renderRatioIcon = (ratio: AspectRatio, isSelected: boolean) => {
    const strokeClass = isSelected ? 'stroke-white' : 'stroke-slate-600';
    switch (ratio) {
      case '1:1':
        return (
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={strokeClass}>
            <rect x="3.5" y="3.5" width="17" height="17" rx="2" />
          </svg>
        );
      case '3:4':
        return (
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={strokeClass}>
            <rect x="5" y="2.5" width="14" height="19" rx="2" />
          </svg>
        );
      case '9:16':
        return (
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={strokeClass}>
            <rect x="6.5" y="2" width="11" height="20" rx="2" />
          </svg>
        );
      case '4:3':
        return (
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={strokeClass}>
            <rect x="2.5" y="5" width="19" height="14" rx="2" />
          </svg>
        );
      case '16:9':
        return (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={strokeClass}>
            <rect x="2" y="6" width="20" height="12" rx="2" />
          </svg>
        );
      case '21:9':
        return (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={strokeClass}>
            <rect x="2" y="7.5" width="20" height="9" rx="2" />
          </svg>
        );
      case 'Auto':
      default:
        return <Sparkles className={`w-3.5 h-3.5 ${isSelected ? 'text-cyan-200' : 'text-indigo-500'}`} />;
    }
  };

  const renderBox = (opt: RatioOption) => {
    const isSelected = aspectRatio === opt.ratio;
    return (
      <button
        key={opt.ratio}
        type="button"
        onClick={() => setAspectRatio(opt.ratio)}
        className={`py-2 px-1 rounded-md text-xs font-bold transition flex flex-col items-center justify-center border cursor-pointer ${
          isSelected
            ? 'btn-logo-active border-transparent shadow-2xs'
            : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
        }`}
      >
        <div className="flex items-center gap-1.5 mb-0.5">
          {renderRatioIcon(opt.ratio, isSelected)}
          <span className="text-xs">{opt.ratio}</span>
        </div>
        <span className={`text-[10px] truncate ${isSelected ? 'text-white/80' : 'text-slate-400'}`}>
          {opt.label}
        </span>
      </button>
    );
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs font-bold text-slate-700">
        <span>CANVAS ASPECT RATIO</span>
        <span className="text-indigo-600 font-extrabold font-mono">
          {aspectRatio === 'Auto' ? 'Auto (AI decides)' : aspectRatio}
        </span>
      </div>

      {/* Row 1: Primary options (Auto, 16:9, 9:16, 1:1) */}
      <div className="grid grid-cols-4 gap-1.5">
        {primaryOptions.map(renderBox)}
      </div>

      {/* Row 2: Secondary options (4:3, 3:4, 21:9) */}
      <div className="grid grid-cols-3 gap-1.5">
        {secondaryOptions.map(renderBox)}
      </div>
    </div>
  );
};
