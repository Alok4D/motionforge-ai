import React, { useRef } from 'react';
import { CreatorToolsSettings } from '../../types/motion.types';
import { Sliders, Volume2, Shield } from 'lucide-react';

interface AdvancedCreatorToolsProps {
  settings: CreatorToolsSettings;
  setSettings: React.Dispatch<React.SetStateAction<CreatorToolsSettings>>;
}

export const AdvancedCreatorTools: React.FC<AdvancedCreatorToolsProps> = ({
  settings,
  setSettings
}) => {
  const audioInputRef = useRef<HTMLInputElement>(null);

  const speedMultipliers = [0.25, 0.5, 1, 1.5, 2, 3];

  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    setSettings(prev => ({
      ...prev,
      customAudioFile: file,
      customAudioUrl: url,
      audioPreset: 'none'
    }));
  };

  return (
    <div className="motion-card p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-800 border-b border-slate-100 pb-2.5">
        <Sliders className="w-4 h-4 text-indigo-600" />
        Advanced Free Creator Tools
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Left Column: Speed Control & Background Audio */}
        <div className="space-y-4">
          {/* 1. Animation Speed Control */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 block">
              1. ANIMATION SPEED CONTROL
            </label>
            <p className="text-xs text-slate-500 m-0">
              Select animation multiplier rate to speed up or slow down output frames.
            </p>
            <div className="grid grid-cols-6 gap-1.5">
              {speedMultipliers.map(sp => (
                <button
                  key={sp}
                  onClick={() => setSettings(prev => ({ ...prev, speed: sp }))}
                  className={`py-2 rounded-md text-xs font-bold transition border cursor-pointer ${
                    settings.speed === sp
                      ? 'btn-logo-active shadow-2xs font-bold'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {sp}x
                </button>
              ))}
            </div>
          </div>

          {/* 2. Background Audio */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 block flex items-center gap-1.5">
              <Volume2 className="w-4 h-4 text-indigo-600" />
              2. BACKGROUND AUDIO
            </label>
            <p className="text-xs text-slate-500 m-0">
              Select preset background loop or upload custom mp3 to preview audio tracks during generation.
            </p>

            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'none', label: '🎵 No Audio' },
                { id: 'lofi', label: '🎵 Chill Lofi Beats' },
                { id: 'synthwave', label: '🎵 Neon Synthwave' },
                { id: 'ambient', label: '🎵 Ambient Ocean' },
              ].map(aud => (
                <button
                  key={aud.id}
                  onClick={() => setSettings(prev => ({ ...prev, audioPreset: aud.id as any, customAudioUrl: null }))}
                  className={`py-2 px-3 rounded-md text-xs font-bold transition text-left border cursor-pointer ${
                    settings.audioPreset === aud.id && !settings.customAudioUrl
                      ? 'bg-gradient-to-r from-cyan-50/70 to-indigo-50/70 text-indigo-700 border-indigo-400 shadow-2xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {aud.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2.5 pt-1">
              <input
                type="file"
                ref={audioInputRef}
                accept="audio/mp3,audio/wav"
                onChange={handleAudioUpload}
                className="hidden"
              />
              <button
                onClick={() => audioInputRef.current?.click()}
                className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-md border border-slate-200 hover:border-indigo-300 hover:text-indigo-600 transition shadow-2xs cursor-pointer"
              >
                Upload Own MP3
              </button>
              <span className="text-xs text-slate-500 truncate">
                {settings.customAudioFile ? settings.customAudioFile.name : 'No file chosen'}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Watermark Overlay Branding */}
        <div className="space-y-2.5">
          <label className="text-xs font-bold text-slate-700 block flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-indigo-600" />
            3. WATERMARK OVERLAY BRANDING
          </label>
          <p className="text-xs text-slate-500 m-0 leading-relaxed">
            Burn branding tag or social handles over video coordinates to protect sample drafts.
          </p>

          <div className="space-y-1.5 pt-1">
            <span className="text-xs font-bold uppercase text-slate-400">WATERMARK OVERLAY TEXT</span>
            <input
              type="text"
              placeholder="e.g. @MotionForgeAI or @YourStudio"
              value={settings.watermarkText}
              onChange={(e) => setSettings(prev => ({ ...prev, watermarkText: e.target.value }))}
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50/70 border border-slate-300 rounded-md focus:outline-hidden focus:border-indigo-500 focus:bg-white font-medium"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
