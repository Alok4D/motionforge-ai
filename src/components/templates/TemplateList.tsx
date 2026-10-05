import React, { useState } from 'react';
import { AnimationTemplate } from '../../types/motion.types';
import { Layers, Bookmark, Shuffle, Copy, Download, Trash2 } from 'lucide-react';

interface TemplateListProps {
  templates: AnimationTemplate[];
  activeTemplateId: string;
  onSelectTemplate: (t: AnimationTemplate) => void;
  onSavePreset: (name: string) => void;
  onDeletePreset: (id: string) => void;
  currentCode: string;
}

export const TemplateList: React.FC<TemplateListProps> = ({
  templates,
  activeTemplateId,
  onSelectTemplate,
  onSavePreset,
  onDeletePreset,
  currentCode
}) => {
  const [activeTab, setActiveTab] = useState<'ALL' | 'CANVAS' | 'CSS' | 'SVG' | 'PRESETS'>('ALL');
  const [newPresetName, setNewPresetName] = useState<string>('');
  const [showSaveInput, setShowSaveInput] = useState<boolean>(false);

  const filtered = templates.filter(t => {
    if (activeTab === 'ALL') return true;
    if (activeTab === 'PRESETS') return t.type === 'PRESET';
    return t.type === activeTab;
  });

  const handleRandomSelect = () => {
    if (filtered.length === 0) return;
    const random = filtered[Math.floor(Math.random() * filtered.length)];
    onSelectTemplate(random);
  };

  const handleSave = () => {
    if (!newPresetName.trim()) return;
    onSavePreset(newPresetName.trim());
    setNewPresetName('');
    setShowSaveInput(false);
  };

  const handleCopySource = () => {
    navigator.clipboard.writeText(currentCode);
    alert('Animation JavaScript code copied to clipboard!');
  };

  const handleDownloadHtml = () => {
    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Motion Hero 4K Animation</title>
  <style>
    body { margin: 0; background: #000; overflow: hidden; display: flex; align-items: center; justify-content: center; height: 100vh; }
    canvas { width: 100vw; height: 100vh; object-fit: contain; }
  </style>
</head>
<body>
  <canvas id="c" width="1920" height="1080"></canvas>
  <script>
    const canvas = document.getElementById('c');
    const ctx = canvas.getContext('2d');
    const renderFunc = (function() {
      ${currentCode}
    })();
    function loop(now) {
      renderFunc(ctx, canvas.width, canvas.height, now, { chromaBgColor: '#000', isGreenScreen: false, videoElementMode: 'solid', elementColor: '#00f0ff' });
      requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);
  </script>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `motion_hero_loop_${Date.now()}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="motion-card p-4 space-y-3">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
        <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-slate-800">
          <Layers className="w-4 h-4 text-red-600" />
          Animation Templates
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setShowSaveInput(!showSaveInput)}
            className="px-2 py-1 text-[11px] font-bold text-red-700 bg-red-50 hover:bg-red-100 rounded-md border border-red-200 transition flex items-center gap-1"
          >
            <Bookmark className="w-3 h-3" />
            Save Preset
          </button>
          <button
            onClick={handleRandomSelect}
            className="px-2 py-1 text-[11px] font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md border border-slate-200 transition flex items-center gap-1"
          >
            <Shuffle className="w-3 h-3" />
            Random
          </button>
        </div>
      </div>

      {/* Save Preset Input */}
      {showSaveInput && (
        <div className="p-2.5 bg-red-50/60 border border-red-200 rounded-xl space-y-2">
          <label className="text-[11px] font-bold text-slate-700 block">Preset Name:</label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="e.g. My Custom Cyber Pulse Loop"
              value={newPresetName}
              onChange={(e) => setNewPresetName(e.target.value)}
              className="flex-1 px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:border-red-500"
            />
            <button
              onClick={handleSave}
              className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition"
            >
              Save
            </button>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="grid grid-cols-5 gap-1 bg-slate-100 p-1 rounded-lg text-[10px] font-extrabold text-slate-600 text-center">
        {(['ALL', 'CANVAS', 'CSS', 'SVG', 'PRESETS'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`py-1 rounded-md transition ${
              activeTab === tab
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Templates List */}
      <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
        {filtered.map((tmpl) => (
          <div
            key={tmpl.id}
            onClick={() => onSelectTemplate(tmpl)}
            className={`p-2.5 rounded-xl border cursor-pointer transition relative group ${
              activeTemplateId === tmpl.id
                ? 'bg-red-50/50 border-red-400 shadow-2xs'
                : 'bg-white border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-0.5 flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${activeTemplateId === tmpl.id ? 'bg-red-500' : 'bg-slate-300'}`} />
                  <h4 className="text-xs font-bold text-slate-800 truncate m-0">{tmpl.title}</h4>
                </div>
                <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed m-0">
                  {tmpl.description}
                </p>
              </div>
              <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 uppercase border border-slate-200">
                {tmpl.type}
              </span>
            </div>

            {tmpl.type === 'PRESET' && (
              <button
                onClick={(e) => { e.stopPropagation(); onDeletePreset(tmpl.id); }}
                className="absolute top-2 right-2 text-slate-400 hover:text-red-600 p-1 bg-white rounded shadow-xs"
                title="Delete preset"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Footer Export Buttons */}
      <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100">
        <button
          onClick={handleCopySource}
          className="py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg border border-slate-200 transition flex items-center justify-center gap-1.5"
        >
          <Copy className="w-3.5 h-3.5" />
          Copy Source
        </button>
        <button
          onClick={handleDownloadHtml}
          className="py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg border border-slate-200 transition flex items-center justify-center gap-1.5"
        >
          <Download className="w-3.5 h-3.5" />
          Download .html
        </button>
      </div>
    </div>
  );
};
