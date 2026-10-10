import React from 'react';
import { ColorCustomizerSettings } from '../../types/motion.types';
import { Palette } from 'lucide-react';

interface ChromaCustomizerProps {
  settings: ColorCustomizerSettings;
  setSettings: React.Dispatch<React.SetStateAction<ColorCustomizerSettings>>;
}

export const ChromaCustomizer: React.FC<ChromaCustomizerProps> = ({
  settings,
  setSettings,
}) => {
  const chromaPresets = [
    { name: 'Classic Green', hex: '#00ff00', isGreen: true },
    { name: 'Classic Blue', hex: '#0000ff', isGreen: false },
    { name: 'Magenta Key', hex: '#ff00ff', isGreen: false },
    { name: 'Cyan Key', hex: '#00ffff', isGreen: false },
    { name: 'Pitch Black', hex: '#000000', isGreen: false },
  ];

  const elementSwatches = [
    '#ff0055', '#00f0ff', '#10b981', '#f59e0b', '#8b5cf6', '#ffffff'
  ];

  const handleChromaSelect = (hex: string, isGreen: boolean) => {
    setSettings(prev => ({
      ...prev,
      chromaBgColor: hex,
      isGreenScreen: isGreen
    }));
  };

  return (
    <div className="motion-card p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
        <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-800">
          <Palette className="w-4 h-4 text-indigo-600" />
          Chroma & Color Customizer
        </div>
        <span className="text-xs font-bold uppercase px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200">
          Active
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Column 1: Chroma Background Color */}
        <div className="space-y-2.5">
          <label className="text-xs font-bold text-slate-700 block">
            1. CHROMA BACKGROUND COLOR
          </label>
          <p className="text-xs text-slate-500 m-0">
            Select a custom key color or pick from standard chroma backing plates.
          </p>

          <div className="flex items-center gap-2.5 p-2 bg-slate-50 border border-slate-200 rounded-lg">
            <input
              type="color"
              value={settings.chromaBgColor.startsWith('#') && settings.chromaBgColor.length === 7 ? settings.chromaBgColor : '#000000'}
              onChange={(e) => setSettings(prev => ({ ...prev, chromaBgColor: e.target.value, isGreenScreen: false }))}
              className="w-9 h-9 rounded-md border border-slate-300 cursor-pointer p-0.5 bg-white"
            />
            <div className="flex-1">
              <span className="text-xs uppercase font-bold text-slate-400 block">CUSTOM HEX</span>
              <input
                type="text"
                value={settings.chromaBgColor}
                onChange={(e) => setSettings(prev => ({ ...prev, chromaBgColor: e.target.value, isGreenScreen: false }))}
                className="w-full text-xs font-mono font-bold text-slate-800 bg-transparent focus:outline-hidden"
              />
            </div>
          </div>

          {/* Presets */}
          <div className="flex flex-wrap gap-1.5">
            {chromaPresets.map(p => (
              <button
                key={p.name}
                onClick={() => handleChromaSelect(p.hex, p.isGreen)}
                className={`px-2.5 py-1.5 rounded-md text-xs font-bold transition flex items-center gap-1.5 border cursor-pointer ${
                  settings.chromaBgColor.toLowerCase() === p.hex.toLowerCase()
                    ? 'btn-logo-active shadow-2xs font-bold'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full border border-slate-400" style={{ backgroundColor: p.hex }} />
                {p.name}
              </button>
            ))}
          </div>
        </div>

        {/* Column 2: Video Element Mode */}
        <div className="space-y-2.5">
          <label className="text-xs font-bold text-slate-700 block">
            2. VIDEO ELEMENT MODE
          </label>
          <p className="text-xs text-slate-500 m-0">
            Choose whether standard graphics draw with solid fills or linear gradients.
          </p>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setSettings(prev => ({ ...prev, videoElementMode: 'solid' }))}
              className={`py-2 px-3 rounded-md text-xs font-bold transition border cursor-pointer ${
                settings.videoElementMode === 'solid'
                  ? 'btn-logo-active shadow-2xs font-bold'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              Solid Color
            </button>
            <button
              onClick={() => setSettings(prev => ({ ...prev, videoElementMode: 'gradient' }))}
              className={`py-2 px-3 rounded-md text-xs font-bold transition border cursor-pointer ${
                settings.videoElementMode === 'gradient'
                  ? 'btn-logo-active shadow-2xs font-bold'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              Gradient
            </button>
          </div>

          {/* Element Color Input */}
          <div className="flex items-center gap-2.5 p-2 bg-slate-50 border border-slate-200 rounded-lg">
            <input
              type="color"
              value={settings.elementColor.startsWith('#') && settings.elementColor.length === 7 ? settings.elementColor : '#00f0ff'}
              onChange={(e) => setSettings(prev => ({ ...prev, elementColor: e.target.value }))}
              className="w-9 h-9 rounded-md border border-slate-300 cursor-pointer p-0.5 bg-white"
            />
            <div className="flex-1">
              <span className="text-xs uppercase font-bold text-slate-400 block">CUSTOM ELEMENT COLOR</span>
              <input
                type="text"
                value={settings.elementColor}
                onChange={(e) => setSettings(prev => ({ ...prev, elementColor: e.target.value }))}
                className="w-full text-xs font-mono font-bold text-slate-800 bg-transparent focus:outline-hidden"
              />
            </div>
          </div>

          {/* Quick Solid Swatches */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400 uppercase">QUICK PRESETS:</span>
            <div className="flex items-center gap-2">
              {elementSwatches.map(hex => (
                <button
                  key={hex}
                  onClick={() => setSettings(prev => ({ ...prev, elementColor: hex }))}
                  className="w-4 h-4 rounded-full border border-slate-300 shadow-2xs hover:scale-125 transition cursor-pointer"
                  style={{ backgroundColor: hex }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
