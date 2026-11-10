import React from 'react';
import { Sparkles } from 'lucide-react';

interface MotionPromptInputProps {
  motionPrompt: string;
  setMotionPrompt: React.Dispatch<React.SetStateAction<string>>;
}

export const MotionPromptInput: React.FC<MotionPromptInputProps> = ({
  motionPrompt,
  setMotionPrompt
}) => {
  const suggestions = [
    '+ Animate Object Contours',
    '+ Shooting Speed Trails',
    '+ Glowing Energy Pulse',
    '+ 3D Perspective Tilt',
    '+ Particle Spark Aura'
  ];

  const handleAddTag = (tag: string) => {
    const clean = tag.replace(/^\+\s*/, '');
    setMotionPrompt(prev => prev ? `${prev}, ${clean}` : clean);
  };

  return (
    <div className="space-y-1.5 pt-1 border-t border-slate-100">
      <div className="flex items-center justify-between text-xs font-bold text-slate-700">
        <span className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-cyan-500" />
          AI MOTION DIRECTION (OPTIONAL)
        </span>
        <span className="text-[11px] text-slate-400 font-normal">Guide what to animate</span>
      </div>
      <textarea
        rows={2}
        value={motionPrompt}
        onChange={(e) => setMotionPrompt(e.target.value)}
        placeholder="Describe animation (e.g. Animate the emblem with glowing neon waves, speed dashes to the right, and 3D floating)..."
        className="w-full px-3 py-2 text-xs text-slate-800 bg-slate-50/70 border border-slate-300 rounded-md focus:outline-hidden focus:border-indigo-500 focus:bg-white resize-none font-medium leading-relaxed shadow-2xs transition"
      />
      {/* Suggestion tags */}
      <div className="flex flex-wrap gap-1.5">
        {suggestions.map(tag => (
          <button
            key={tag}
            type="button"
            onClick={() => handleAddTag(tag)}
            className="px-2 py-0.5 text-[10px] font-semibold text-slate-600 bg-white hover:bg-slate-50 border border-slate-200 rounded-md hover:border-indigo-300 hover:text-indigo-600 transition shadow-2xs cursor-pointer"
          >
            {tag}
          </button>
        ))}
      </div>
    </div>
  );
};

