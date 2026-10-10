import React, { useState } from 'react';
import { SMART_MOTION_MODIFIERS } from '../../constants/modifiersList';
import { Sparkles, Edit3, X, ChevronDown } from 'lucide-react';

interface PromptEditorProps {
  promptText: string;
  setPromptText: (text: string) => void;
  onGenerateFromPrompt: () => void;
  onEditCurrentMotion: () => void;
  isProcessing: boolean;
}

export const PromptEditor: React.FC<PromptEditorProps> = ({
  promptText,
  setPromptText,
  onGenerateFromPrompt,
  onEditCurrentMotion,
  isProcessing
}) => {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const handleAddModifier = (modifier: string) => {
    const cleanMod = modifier.replace(/^\+\s*/, '').trim();
    if (promptText.trim()) {
      setPromptText(`${promptText}, ${cleanMod}`);
    } else {
      setPromptText(cleanMod);
    }
    setActiveDropdown(null);
  };

  return (
    <div className="motion-card p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
        <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-800">
          <Edit3 className="w-4 h-4 text-cyan-500" />
          Edit / Regenerate with Prompt
        </div>
        <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-200">
          Isolated Prompt Engine
        </span>
      </div>

      <p className="text-xs text-slate-500 m-0 leading-relaxed font-medium">
        Modify this animation or generate a new motion concept using text prompt instructions without altering the image generator.
      </p>

      {/* Textarea Input */}
      <div className="relative">
        <textarea
          rows={3}
          value={promptText}
          onChange={(e) => setPromptText(e.target.value)}
          placeholder="Type instruction in Bengali or English (e.g. সবকিছু ঠিক রেখে এলিমেন্টসগুলো আরও ৩০% বড় করে দাও / Add glowing cyan trails)..."
          className="w-full px-3.5 py-3 text-sm text-slate-800 bg-slate-50/70 border border-slate-300 rounded-lg focus:outline-hidden focus:border-indigo-500 focus:bg-white resize-none font-medium leading-relaxed shadow-2xs transition"
        />
        {promptText && (
          <button
            onClick={() => setPromptText('')}
            className="absolute top-3 right-3 text-slate-400 hover:text-slate-700 p-0.5 cursor-pointer"
            title="Clear prompt"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Smart Motion Modifiers Categories */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between text-xs font-bold text-slate-700">
          <span className="flex items-center gap-1.5 text-slate-700">
            <span className="text-cyan-500 font-extrabold">#</span> SMART MOTION MODIFIERS (CLICK TO EDIT)
          </span>
          <span className="text-xs text-slate-400 font-normal">Click any tag to customize motion aspects</span>
        </div>

        {/* Dropdowns Bar */}
        <div className="flex flex-wrap gap-2 relative">
          {SMART_MOTION_MODIFIERS.map((cat) => (
            <div key={cat.name} className="relative">
              <button
                type="button"
                onClick={() => setActiveDropdown(activeDropdown === cat.name ? null : cat.name)}
                className="px-3 py-1.5 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 rounded-md border border-slate-200 hover:border-indigo-300 transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
              >
                <span>{cat.name}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
              </button>

              {activeDropdown === cat.name && (
                <div className="absolute top-full left-0 mt-1 z-30 bg-white border border-slate-200 rounded-lg shadow-xl p-1.5 min-w-[240px] space-y-0.5 animate-in fade-in zoom-in-95 duration-100">
                  {cat.items.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => handleAddModifier(item)}
                      className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 rounded-md transition cursor-pointer"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Quick Suggestion Chips */}
        <div className="flex flex-wrap gap-2 pt-0.5">
          {[
            '+ Add Neon Glow & Light Trails',
            '+ Spiral Particle Vortex',
            '+ Fluid Sine Wave Harmonics',
            '+ Starfield Nebula Acceleration',
            '+ Smooth Chromatic Gradient Pulse'
          ].map(chip => (
            <button
              key={chip}
              onClick={() => handleAddModifier(chip)}
              className="px-2.5 py-1 text-xs font-medium text-slate-600 bg-white hover:bg-slate-50 border border-slate-200 rounded-md transition hover:border-indigo-400 hover:text-indigo-600 shadow-2xs cursor-pointer"
            >
              {chip}
            </button>
          ))}
        </div>
      </div>

      {/* Main Action Buttons */}
      <div className="grid grid-cols-2 gap-3 pt-1">
        <button
          onClick={onGenerateFromPrompt}
          disabled={isProcessing || !promptText.trim()}
          className={`py-3 px-4 rounded-lg text-sm font-bold tracking-wide uppercase transition flex items-center justify-center gap-2 cursor-pointer ${
            isProcessing || !promptText.trim()
              ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
              : 'btn-logo-gradient'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          {isProcessing ? 'Generating...' : 'Generate from Prompt'}
        </button>

        <button
          onClick={onEditCurrentMotion}
          disabled={isProcessing || !promptText.trim()}
          className={`py-3 px-4 rounded-lg text-sm font-bold tracking-wide uppercase transition flex items-center justify-center gap-2 cursor-pointer ${
            isProcessing || !promptText.trim()
              ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
              : 'btn-logo-secondary'
          }`}
        >
          <Edit3 className="w-4 h-4 text-cyan-200" />
          {isProcessing ? 'Modifying...' : 'Edit Current Motion'}
        </button>
      </div>
    </div>
  );
};
