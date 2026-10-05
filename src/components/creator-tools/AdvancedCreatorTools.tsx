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
      <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-800 border-b border-slate-100 pb-2">
        <Sliders className="w-4 h-4 text-red-600" />
        Advanced Free Creator Tools
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Left Column: Speed Control & Background Audio */}
        <div className="space-y-4">
          {/* 1. Animation Speed Control */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-slate-700 block">
              1. ANIMATION SPEED CONTROL
            </label>
            <p className="text-[11px] text-slate-500 m-0">
              Select animation multiplier rate to speed up or slow down output frames.
            </p>
            <div className="grid grid-cols-6 gap-1">
              {speedMultipliers.map(sp => (
                <button
                  key={sp}
                  onClick={() => setSettings(prev => ({ ...prev, speed: sp }))}
                  className={`py-1.5 rounded-lg text-xs font-bold transition border ${
                    settings.speed === sp
                      ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
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
            <label className="text-[11px] font-bold text-slate-700 block flex items-center gap-1.5">
              <Volume2 className="w-3.5 h-3.5 text-slate-600" />
              2. BACKGROUND AUDIO
            </label>
            <p className="text-[11px] text-slate-500 m-0">
              Select preset background loop or upload custom mp3 to preview audio tracks during generation.
            </p>

            <div className="grid grid-cols-2 gap-1.5">
              {[
                { id: 'none', label: '🎵 No Audio' },
                { id: 'lofi', label: '🎵 Chill Lofi Beats' },
                { id: 'synthwave', label: '🎵 Neon Synthwave' },
                { id: 'ambient', label: '🎵 Ambient Ocean' },
              ].map(aud => (
                <button
                  key={aud.id}
                  onClick={() => setSettings(prev => ({ ...prev, audioPreset: aud.id as any, customAudioUrl: null }))}
                  className={`py-1.5 px-2.5 rounded-lg text-xs font-bold transition text-left border ${
                    settings.audioPreset === aud.id && !settings.customAudioUrl
                      ? 'bg-red-50 text-red-700 border-red-300 shadow-2xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {aud.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="file"
                ref={audioInputRef}
                accept="audio/mp3,audio/wav"
                onChange={handleAudioUpload}
                className="hidden"
              />
              <button
                onClick={() => audioInputRef.current?.click()}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg border border-slate-300 transition"
              >
                Upload Own MP3
              </button>
              <span className="text-[11px] text-slate-400 truncate">
                {settings.customAudioFile ? settings.customAudioFile.name : 'No file chosen'}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Watermark Overlay Branding */}
        <div className="space-y-2">
          <label className="text-[11px] font-bold text-slate-700 block flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-slate-600" />
            3. WATERMARK OVERLAY BRANDING
          </label>
          <p className="text-[11px] text-slate-500 m-0 leading-relaxed">
            Burn branding tag or social handles over video coordinates to protect sample drafts.
          </p>

          <div className="space-y-1.5 pt-1">
            <span className="text-[10px] font-bold uppercase text-slate-400">WATERMARK OVERLAY TEXT</span>
            <input
              type="text"
              placeholder="e.g. @MotionHero or @YourStudio"
              value={settings.watermarkText}
              onChange={(e) => setSettings(prev => ({ ...prev, watermarkText: e.target.value }))}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:border-red-500 focus:bg-white font-medium"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
