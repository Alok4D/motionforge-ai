import React from 'react';
import type { MotionStyle } from '../../types/motion.types';

interface MotionStyleSelectorProps {
  style: MotionStyle;
  setStyle: (s: MotionStyle) => void;
}

export const MotionStyleSelector: React.FC<MotionStyleSelectorProps> = ({
  style,
  setStyle
}) => {
  const styles: MotionStyle[] = ['3D Cinematic', '2D Vector', 'Line Art'];

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs font-bold text-slate-700">
        <span>MOTION STYLE & DIMENSION</span>
        <span className="text-indigo-600 font-extrabold">{style}</span>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {styles.map((s, idx) => (
          <button
            key={s}
            onClick={() => setStyle(s)}
            className={`py-2 px-1 rounded-md text-xs font-bold transition flex flex-col items-center justify-center border cursor-pointer ${
              style === s
                ? 'btn-logo-active border-transparent'
                : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
            }`}
          >
            <span className={`text-[11px] ${style === s ? 'text-white/80' : 'text-slate-400'}`}>
              {idx + 1}. {s.split(' ')[0]}
            </span>
            <span className="text-xs truncate">{s.split(' ').slice(1).join(' ') || s}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

