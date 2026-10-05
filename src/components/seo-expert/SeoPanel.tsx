import React, { useState } from 'react';
import type { StockMetadata } from '../../types/seo.types';
import { exportToStockCsv, powerUpSeoWithAi } from '../../services/seo/seoService';
import { Sparkles, Copy, Download, Plus, X, Check } from 'lucide-react';
import toast from 'react-hot-toast';

interface SeoPanelProps {
  metadata: StockMetadata;
  setMetadata: React.Dispatch<React.SetStateAction<StockMetadata>>;
  conceptPrompt: string;
}

export const SeoPanel: React.FC<SeoPanelProps> = ({
  metadata,
  setMetadata,
  conceptPrompt
}) => {
  const [customTagInput, setCustomTagInput] = useState<string>('');
  const [isPoweringUp, setIsPoweringUp] = useState<boolean>(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = (text: string, fieldName: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    toast.success(`${label} copied to clipboard!`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleAddCustomTag = () => {
    if (!customTagInput.trim()) return;
    const newTags = customTagInput
      .split(/[\r\n,]+/)
      .map(t => t.trim().toLowerCase())
      .filter(t => t.length > 1);

    const existing = new Set(metadata.keywords.map(k => k.toLowerCase()));
    const merged = [...metadata.keywords];

    newTags.forEach(t => {
      if (!existing.has(t)) {
        merged.push(t);
        existing.add(t);
      }
    });

    setMetadata(prev => ({ ...prev, keywords: merged }));
    setCustomTagInput('');
    toast.success('Keywords added!');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setMetadata(prev => ({
      ...prev,
      keywords: prev.keywords.filter(k => k !== tagToRemove)
    }));
  };

  const handleAiPowerUp = async () => {
    setIsPoweringUp(true);
    const loadingToast = toast.loading('AI SEO Expert is analyzing & ranking keywords...');
    try {
      const enhanced = await powerUpSeoWithAi(conceptPrompt || metadata.title);
      setMetadata(enhanced);
      toast.success('SEO Metadata & Keywords Powered Up!', { id: loadingToast });
    } catch (err) {
      console.error('AI SEO Power-Up failed', err);
      toast.error('AI Power-Up failed, using local stock algorithm', { id: loadingToast });
    } finally {
      setIsPoweringUp(false);
    }
  };

  const handleCopyCsv = () => {
    const csvContent = exportToStockCsv(`motion_hero_${Date.now()}.mov`, metadata);
    navigator.clipboard.writeText(csvContent);
    toast.success('Stock CSV record copied! (Ready for Adobe Stock / Shutterstock bulk CSV upload)');
  };

  return (
    <div className="motion-card p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-900">
          <Sparkles className="w-4 h-4 text-red-600" />
          Microstock SEO Metadata Expert
        </div>
        <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-slate-900 text-emerald-400 border border-slate-700 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          SEO Synced
        </span>
      </div>

      <p className="text-xs text-slate-500 m-0 leading-relaxed">
        This live engine automatically generates and formats ranking-optimized metadata tailored for the search algorithms of <strong>Adobe Stock, Freepik, Shutterstock, and Vecteezy</strong>.
      </p>

      {/* SEO Title */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-700 uppercase">
            SEO OPTIMIZED TITLE (50–70 CHARACTERS)
          </span>
          <button
            onClick={() => copyToClipboard(metadata.title, 'title', 'SEO Title')}
            className="text-[11px] font-bold text-red-600 hover:text-red-700 flex items-center gap-1 cursor-pointer"
          >
            {copiedField === 'title' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
            {copiedField === 'title' ? 'Copied!' : 'Copy'}
          </button>
        </div>
        <input
          type="text"
          value={metadata.title}
          onChange={(e) => setMetadata(prev => ({ ...prev, title: e.target.value }))}
          className="w-full px-3 py-2 text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:border-red-500 focus:bg-white"
        />
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-700 uppercase">
            ALGORITHMIC DESCRIPTION (CAPTION)
          </span>
          <button
            onClick={() => copyToClipboard(metadata.description, 'description', 'Description')}
            className="text-[11px] font-bold text-red-600 hover:text-red-700 flex items-center gap-1 cursor-pointer"
          >
            {copiedField === 'description' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
            {copiedField === 'description' ? 'Copied!' : 'Copy'}
          </button>
        </div>
        <textarea
          rows={3}
          value={metadata.description}
          onChange={(e) => setMetadata(prev => ({ ...prev, description: e.target.value }))}
          className="w-full px-3 py-2 text-xs text-slate-700 bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:border-red-500 focus:bg-white resize-none leading-relaxed"
        />
      </div>

      {/* Search Keywords Tags */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-700 uppercase">
            SEARCH KEYWORDS ({metadata.keywords.length} TAGS)
          </span>
          <button
            onClick={() => copyToClipboard(metadata.keywords.join(', '), 'keywords', 'Keywords comma list')}
            className="text-[11px] font-bold text-red-600 hover:text-red-700 flex items-center gap-1 cursor-pointer"
          >
            {copiedField === 'keywords' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
            {copiedField === 'keywords' ? 'Copied!' : 'Copy Comma List'}
          </button>
        </div>

        {/* Tags Container */}
        <div className="max-h-36 overflow-y-auto p-2 bg-slate-50 border border-slate-200 rounded-xl flex flex-wrap gap-1.5">
          {metadata.keywords.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-white text-slate-800 border border-slate-200 shadow-2xs group"
            >
              <span>{tag}</span>
              <button
                onClick={() => handleRemoveTag(tag)}
                className="text-slate-400 hover:text-red-500 p-0.5 rounded cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>

        {/* Custom Tag Input */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Add custom keyword (comma-separated)..."
            value={customTagInput}
            onChange={(e) => setCustomTagInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddCustomTag()}
            className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:border-red-500"
          />
          <button
            onClick={handleAddCustomTag}
            className="px-3 py-1.5 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-lg transition flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            ADD
          </button>
        </div>
      </div>

      {/* Footer Action Buttons */}
      <div className="grid grid-cols-2 gap-3 pt-1">
        <button
          onClick={handleCopyCsv}
          className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl border border-slate-300 transition flex items-center justify-center gap-2 shadow-2xs cursor-pointer"
        >
          <Download className="w-4 h-4" />
          Copy Stock CSV Record
        </button>

        <button
          onClick={handleAiPowerUp}
          disabled={isPoweringUp}
          className="py-2.5 px-4 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 shadow-xs cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-amber-400" />
          {isPoweringUp ? 'Powering Up...' : '⚡ AI SEO Power-Up'}
        </button>
      </div>
    </div>
  );
};
