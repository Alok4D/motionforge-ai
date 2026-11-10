import React, { useState } from 'react';
import { Sparkles, X } from 'lucide-react';

interface MotionPromptInputProps {
  motionPrompt: string;
  setMotionPrompt: React.Dispatch<React.SetStateAction<string>>;
}

interface SuggestionGroup {
  category: 'Popular' | 'Backgrounds' | 'Events & Stage' | 'Tech & Sci-Fi';
  tags: { text: string; label: string }[];
}

export const MotionPromptInput: React.FC<MotionPromptInputProps> = ({
  motionPrompt,
  setMotionPrompt
}) => {
  const [activeTab, setActiveTab] = useState<'All' | 'Backgrounds' | 'Events & Stage' | 'Tech & Sci-Fi'>('All');

  const groups: SuggestionGroup[] = [
    {
      category: 'Popular',
      tags: [
        { text: 'Animate Object Contours', label: 'Object Contours' },
        { text: 'Glowing Energy Pulse', label: 'Energy Pulse' },
        { text: '3D Perspective Tilt', label: '3D Tilt Floating' },
        { text: 'Shooting Speed Trails', label: 'Speed Trails' },
        { text: 'Seamless Infinite Loop', label: 'Infinite Loop' },
      ]
    },
    {
      category: 'Backgrounds',
      tags: [
        { text: 'Cyberpunk 3D Tron Grid Floor', label: 'Cyber Grid Floor' },
        { text: 'Flowing Liquid Gradient Waves', label: 'Liquid Waves' },
        { text: 'Cosmic Galaxy Particle Vortex', label: 'Galaxy Vortex' },
        { text: 'Volumetric Cinematic Light Rays', label: 'Cinematic Light Rays' },
        { text: 'Floating Deep Bokeh Starfield', label: 'Starfield Bokeh' },
      ]
    },
    {
      category: 'Events & Stage',
      tags: [
        { text: 'Stage Concert Laser Beam Show', label: 'Concert Lasers' },
        { text: 'Golden Luxury Glitter Dust', label: 'Golden Luxury Dust' },
        { text: 'Audio Waveform Visualizer Pulse', label: 'Audio Visualizer' },
        { text: 'Festive Confetti Sparkle Burst', label: 'Festive Confetti' },
        { text: 'Energetic Club Strobe Flash', label: 'Stage Strobe Flash' },
      ]
    },
    {
      category: 'Tech & Sci-Fi',
      tags: [
        { text: 'Sci-Fi HUD Radar Laser Scan', label: 'HUD Radar Scan' },
        { text: 'Glowing Digital Circuit Board Flow', label: 'Digital Circuit Flow' },
        { text: 'Holographic Glitch Shimmer', label: 'Holo Glitch Shimmer' },
        { text: 'Rotating Sacred Geometric Rings', label: 'Geometric Rings' },
        { text: 'Quantum Spark Emission Aura', label: 'Quantum Spark Aura' },
      ]
    }
  ];

  const handleAddTag = (text: string) => {
    setMotionPrompt(prev => {
      const cleanPrev = prev.trim();
      if (!cleanPrev) return text;
      // Don't add duplicate if already in prompt
      if (cleanPrev.toLowerCase().includes(text.toLowerCase())) return cleanPrev;
      return `${cleanPrev}, ${text}`;
    });
  };

  const visibleTags = activeTab === 'All'
    ? groups.flatMap(g => g.tags)
    : (groups.find(g => g.category === activeTab)?.tags || []);

  return (
    <div className="space-y-2 pt-2 border-t border-slate-100">
      {/* Header Bar */}
      <div className="flex items-center justify-between text-xs font-bold text-slate-700">
        <span className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-cyan-500" />
          AI MOTION DIRECTION & PRESETS
        </span>
        {motionPrompt.trim() && (
          <button
            type="button"
            onClick={() => setMotionPrompt('')}
            className="text-[11px] text-slate-400 hover:text-rose-500 flex items-center gap-1 cursor-pointer font-medium"
          >
            <X className="w-3 h-3" />
            Clear
          </button>
        )}
      </div>

      {/* Textarea */}
      <textarea
        rows={2}
        value={motionPrompt}
        onChange={(e) => setMotionPrompt(e.target.value)}
        placeholder="Describe animation or click presets below (e.g. Stage concert laser beam show with glowing gold particles and 3D floating)..."
        className="w-full px-3 py-2 text-xs text-slate-800 bg-slate-50/70 border border-slate-300 rounded-lg focus:outline-hidden focus:border-indigo-500 focus:bg-white resize-none font-medium leading-relaxed shadow-2xs transition"
      />

      {/* Category Filter Pills */}
      <div className="flex items-center gap-1 overflow-x-auto pb-0.5 no-scrollbar text-[11px] font-bold">
        {(['All', 'Backgrounds', 'Events & Stage', 'Tech & Sci-Fi'] as const).map(tab => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`px-2 py-0.5 rounded-md transition whitespace-nowrap cursor-pointer ${
              activeTab === tab
                ? 'bg-slate-800 text-white shadow-2xs'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/60'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Suggestion tags grid / flex */}
      <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto pr-1">
        {visibleTags.map(tag => (
          <button
            key={tag.text}
            type="button"
            onClick={() => handleAddTag(tag.text)}
            className="px-2 py-1 text-[10px] font-semibold text-slate-700 bg-white hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-300 border border-slate-200 rounded-md transition shadow-2xs cursor-pointer flex items-center gap-1"
          >
            <span className="text-cyan-500 font-bold">+</span>
            <span>{tag.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
