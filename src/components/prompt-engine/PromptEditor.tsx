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
    <div className="motion-card p-4 space-y-3.5">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-800">
          <Edit3 className="w-4 h-4 text-red-600" />
          Edit / Regenerate with Prompt
        </div>
        <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
          Isolated Prompt Engine
        </span>
      </div>

      <p className="text-xs text-slate-500 m-0 leading-relaxed">
        Modify this animation or generate a new motion concept using text prompt instructions without altering the image generator.
      </p>

      {/* Textarea Input */}
      <div className="relative">
        <textarea
          rows={3}
          value={promptText}
          onChange={(e) => setPromptText(e.target.value)}
          placeholder="Type instruction in Bengali or English (e.g. সবকিছু ঠিক রেখে এলিমেন্টসগুলো আরও ৩০% বড় করে দাও / Add glowing cyan trails)..."
          className="w-full px-3 py-2.5 text-xs text-slate-800 bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:border-red-500 focus:bg-white resize-none font-medium leading-relaxed shadow-2xs"
        />
        {promptText && (
          <button
            onClick={() => setPromptText('')}
            className="absolute top-2.5 right-2.5 text-slate-400 hover:text-slate-700 p-0.5"
            title="Clear prompt"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Smart Motion Modifiers Categories */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-[11px] font-bold text-slate-600">
          <span className="flex items-center gap-1 text-slate-700">
            <span className="text-red-500">#</span> SMART MOTION MODIFIERS (CLICK TO EDIT)
          </span>
          <span className="text-[10px] text-slate-400 font-normal">Click any tag to customize motion aspects</span>
        </div>

        {/* Dropdowns Bar */}
        <div className="flex flex-wrap gap-1.5 relative">
          {SMART_MOTION_MODIFIERS.map((cat) => (
            <div key={cat.name} className="relative">
              <button
                type="button"
                onClick={() => setActiveDropdown(activeDropdown === cat.name ? null : cat.name)}
                className="px-2.5 py-1 text-[11px] font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-200 transition flex items-center gap-1 shadow-2xs"
              >
                <span>{cat.name}</span>
                <ChevronDown className="w-3 h-3 text-slate-500" />
              </button>

              {activeDropdown === cat.name && (
                <div className="absolute top-full left-0 mt-1 z-30 bg-white border border-slate-200 rounded-xl shadow-xl p-1.5 min-w-[220px] space-y-0.5 animate-in fade-in zoom-in-95 duration-100">
                  {cat.items.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => handleAddModifier(item)}
                      className="w-full text-left px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-red-50 hover:text-red-700 rounded-lg transition"
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
        <div className="flex flex-wrap gap-1.5 pt-1">
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
              className="px-2 py-1 text-[11px] font-semibold text-slate-600 bg-white hover:bg-slate-50 border border-slate-200 rounded-md transition hover:border-red-400 shadow-2xs"
            >
              {chip}
            </button>
          ))}
        </div>
      </div>

      {/* Main Action Buttons */}
      <div className="grid grid-cols-2 gap-2.5 pt-1">
        <button
          onClick={onGenerateFromPrompt}
          disabled={isProcessing || !promptText.trim()}
          className={`py-2.5 px-4 rounded-xl text-xs font-black tracking-wide uppercase transition flex items-center justify-center gap-2 shadow-xs ${
            isProcessing || !promptText.trim()
              ? 'bg-red-300 text-white cursor-not-allowed'
              : 'bg-red-600 hover:bg-red-700 text-white'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          {isProcessing ? 'Generating...' : 'Generate from Prompt'}
        </button>

        <button
          onClick={onEditCurrentMotion}
          disabled={isProcessing || !promptText.trim()}
          className={`py-2.5 px-4 rounded-xl text-xs font-black tracking-wide uppercase transition flex items-center justify-center gap-2 shadow-xs ${
            isProcessing || !promptText.trim()
              ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
              : 'bg-slate-900 hover:bg-black text-white'
          }`}
        >
          <Edit3 className="w-4 h-4 text-red-500" />
          {isProcessing ? 'Modifying...' : 'Edit Current Motion'}
        </button>
      </div>
    </div>
  );
};
