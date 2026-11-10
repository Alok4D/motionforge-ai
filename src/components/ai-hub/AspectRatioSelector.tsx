import React, { useState, useRef, useEffect } from 'react';
import type { AspectRatio } from '../../types/motion.types';
import { Check, ChevronDown, Sparkles } from 'lucide-react';

interface AspectRatioSelectorProps {
  aspectRatio: AspectRatio;
  setAspectRatio: (ar: AspectRatio) => void;
}

interface RatioOption {
  ratio: AspectRatio;
  label: string;
  categoryDividerAfter?: boolean;
}

export const AspectRatioSelector: React.FC<AspectRatioSelectorProps> = ({
  aspectRatio,
  setAspectRatio
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const options: RatioOption[] = [
    { ratio: '1:1', label: 'Square', categoryDividerAfter: true },
    { ratio: '3:4', label: 'Portrait' },
    { ratio: '9:16', label: 'Mobile', categoryDividerAfter: true },
    { ratio: '4:3', label: 'Landscape' },
    { ratio: '16:9', label: 'Widescreen' },
    { ratio: '21:9', label: 'Cinematic', categoryDividerAfter: true },
    { ratio: 'Auto', label: 'AI decides' }
  ];

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen]);

  const activeOption = options.find(o => o.ratio === aspectRatio) || options[4]; // default 16:9

  // Helper to render accurate aspect ratio shape icon
  const renderRatioIcon = (ratio: AspectRatio) => {
    switch (ratio) {
      case '1:1':
        return <div className="w-3.5 h-3.5 border-[1.5px] border-slate-600 rounded-2xs" />;
      case '3:4':
        return <div className="w-3 h-4 border-[1.5px] border-slate-600 rounded-2xs" />;
      case '9:16':
        return <div className="w-2.5 h-4.5 border-[1.5px] border-slate-600 rounded-2xs" />;
      case '4:3':
        return <div className="w-4 h-3 border-[1.5px] border-slate-600 rounded-2xs" />;
      case '16:9':
        return <div className="w-4.5 h-2.5 border-[1.5px] border-slate-600 rounded-2xs" />;
      case '21:9':
        return <div className="w-5 h-2 border-[1.5px] border-slate-600 rounded-2xs" />;
      case 'Auto':
      default:
        return (
          <div className="w-4 h-4 border-[1.5px] border-dashed border-slate-600 rounded-2xs flex items-center justify-center">
            <Sparkles className="w-2.5 h-2.5 text-indigo-500" />
          </div>
        );
    }
  };

  return (
    <div className="space-y-1.5 relative" ref={dropdownRef}>
      <div className="flex items-center justify-between text-xs font-bold text-slate-700">
        <span>CANVAS ASPECT RATIO</span>
        <span className="text-slate-500 font-mono text-xs">
          {activeOption.ratio === 'Auto' ? 'Auto' : `${activeOption.ratio} (${activeOption.label})`}
        </span>
      </div>

      {/* Dropdown Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3.5 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-lg text-xs font-medium text-slate-800 transition shadow-2xs cursor-pointer"
      >
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-5 h-5 text-slate-700">
            {renderRatioIcon(activeOption.ratio)}
          </div>
          <span className="font-bold text-slate-900">{activeOption.ratio}</span>
          <span className="text-slate-500">({activeOption.label})</span>
        </div>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu (Matches the provided screenshot design) */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-30 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden py-1 animate-in fade-in zoom-in-95 duration-150">
          {options.map((opt, idx) => {
            const isSelected = aspectRatio === opt.ratio;
            return (
              <React.Fragment key={opt.ratio}>
                <button
                  type="button"
                  onClick={() => {
                    setAspectRatio(opt.ratio);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2 text-xs transition cursor-pointer text-left ${
                    isSelected
                      ? 'bg-slate-100/90 text-slate-900 font-bold'
                      : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-5 h-5 shrink-0">
                      {renderRatioIcon(opt.ratio)}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-slate-900">{opt.ratio}</span>
                      <span className="text-slate-500 font-normal">({opt.label})</span>
                    </div>
                  </div>

                  {isSelected && (
                    <Check className="w-4 h-4 text-slate-800 shrink-0" />
                  )}
                </button>

                {opt.categoryDividerAfter && idx !== options.length - 1 && (
                  <div className="my-1 border-b border-slate-100" />
                )}
              </React.Fragment>
            );
          })}
        </div>
      )}
    </div>
  );
};

