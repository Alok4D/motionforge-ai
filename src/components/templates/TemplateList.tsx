import React, { useState } from 'react';
import type { AnimationTemplate } from '../../types/motion.types';
import { Layers, Copy, Download, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface TemplateListProps {
  templates: AnimationTemplate[];
  activeTemplateId: string;
  onSelectTemplate: (t: AnimationTemplate) => void;
  onDeletePreset?: (id: string) => void;
  currentCode: string;
}

export const TemplateList: React.FC<TemplateListProps> = ({
  templates,
  activeTemplateId,
  onSelectTemplate,
  onDeletePreset,
  currentCode
}) => {
  const [activeTab, setActiveTab] = useState<'ALL' | 'CANVAS' | 'CSS' | 'SVG'>('ALL');

  const filtered = templates.filter(t => {
    if (activeTab === 'ALL') return true;
    return t.type === activeTab;
  });

  const handleCopySource = () => {
    navigator.clipboard.writeText(currentCode);
    toast.success('Animation JavaScript code copied to clipboard!');
  };

  const handleDownloadHtml = () => {
    const htmlContent = '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>MotionForge AI 4K Animation</title><style>body{margin:0;background:#000;overflow:hidden;display:flex;align-items:center;justify-content:center;height:100vh;}canvas{width:100vw;height:100vh;object-fit:contain;}</style></head><body><canvas id="c" width="1920" height="1080"></canvas><script>const canvas=document.getElementById("c");const ctx=canvas.getContext("2d");const renderFunc=(function(){ ' + currentCode + ' })();function loop(now){renderFunc(ctx,canvas.width,canvas.height,now,{chromaBgColor:"#000",isGreenScreen:false,videoElementMode:"solid",elementColor:"#00f0ff"});requestAnimationFrame(loop);}requestAnimationFrame(loop);</script></body></html>';

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = "motionforge_loop_" + Date.now() + ".html";
    a.click();
    URL.revokeObjectURL(url);
    toast.success('HTML5 bundle downloaded!');
  };

  return (
    <div className="motion-card p-4 space-y-3">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
        <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-slate-800">
          <Layers className="w-4 h-4 text-red-600" />
          Animation Templates
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="grid grid-cols-4 gap-1 bg-slate-100 p-1 rounded-lg text-[10px] font-extrabold text-slate-600 text-center">
        {(['ALL', 'CANVAS', 'CSS', 'SVG'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={activeTab === tab ? "py-1 rounded-md transition cursor-pointer bg-slate-900 text-white shadow-2xs" : "py-1 rounded-md transition cursor-pointer hover:text-slate-900 hover:bg-slate-200/60"}
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
            className={activeTemplateId === tmpl.id ? "p-2.5 rounded-xl border cursor-pointer transition relative group bg-red-50/50 border-red-400 shadow-2xs" : "p-2.5 rounded-xl border cursor-pointer transition relative group bg-white border-slate-200 hover:border-slate-300"}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-0.5 flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className={activeTemplateId === tmpl.id ? "w-2 h-2 rounded-full bg-red-500" : "w-2 h-2 rounded-full bg-slate-300"} />
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

            {tmpl.type === 'PRESET' && onDeletePreset && (
              <button
                onClick={(e) => { e.stopPropagation(); onDeletePreset(tmpl.id); }}
                className="absolute top-2 right-2 text-slate-400 hover:text-red-600 p-1 bg-white rounded shadow-xs cursor-pointer"
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
          className="py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg border border-slate-200 transition flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Copy className="w-3.5 h-3.5" />
          Copy Source
        </button>
        <button
          onClick={handleDownloadHtml}
          className="py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg border border-slate-200 transition flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          Download .html
        </button>
      </div>
    </div>
  );
};
