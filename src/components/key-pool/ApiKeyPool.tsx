import React, { useState, useRef } from 'react';
import { keyRotator } from '../../services/gemini/keyRotator';
import type { ApiKeyPoolState } from '../../types/apiKey.types';
import { Key, Upload, Trash2, RefreshCw, Plus, X, ExternalLink, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

interface ApiKeyPoolProps {
  onClose?: () => void;
  isModal?: boolean;
}

export const ApiKeyPool: React.FC<ApiKeyPoolProps> = ({ onClose, isModal = false }) => {
  const [poolState, setPoolState] = useState<ApiKeyPoolState>(() => keyRotator.getState());
  const [manualInput, setManualInput] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const refreshState = () => {
    setPoolState(keyRotator.getState());
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        // Split by comma, newline, semicolon, or whitespace
        const extracted = content
          .split(/[\r\n,;\t]+/)
          .map(k => k.trim())
          .filter(k => k.length > 20);

        if (extracted.length === 0) {
          toast.error('No valid Gemini API keys found in the file.');
          return;
        }

        const result = keyRotator.addKeys(extracted);
        refreshState();

        if (result.added > 0 && result.reactivated > 0) {
          toast.success(`Loaded ${result.added} new key(s) & reactivated ${result.reactivated} existing key(s)! Total: ${result.total}`);
        } else if (result.added > 0) {
          toast.success(`Successfully added ${result.added} new Gemini API key(s)! Total: ${result.total}`);
        } else if (result.reactivated > 0) {
          toast.success(`Reactivated ${result.reactivated} previously exhausted key(s)! Total: ${result.total}`);
        } else {
          toast('All keys are already active in your pool.', { icon: 'ℹ️' });
        }
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleManualAdd = () => {
    if (!manualInput.trim()) return;
    const extracted = manualInput
      .split(/[\r\n,;\t]+/)
      .map(k => k.trim())
      .filter(k => k.length > 20);

    if (extracted.length === 0) {
      toast.error('Please enter a valid Gemini API key.');
      return;
    }

    const result = keyRotator.addKeys(extracted);
    setManualInput('');
    refreshState();

    if (result.added > 0) {
      toast.success(`Added ${result.added} key(s) to pool! Total: ${result.total}`);
    } else if (result.reactivated > 0) {
      toast.success(`Reactivated ${result.reactivated} existing key(s)!`);
    } else {
      toast('Key is already active in your pool.', { icon: 'ℹ️' });
    }
  };

  const handleClear = () => {
    if (window.confirm('Are you sure you want to clear all your saved API keys?')) {
      keyRotator.clearAll();
      refreshState();
      toast.success('All API keys cleared from pool.');
    }
  };

  const handleResetLimits = () => {
    keyRotator.resetLimits();
    refreshState();
    toast.success('Rate limits reset! All keys marked active.');
  };

  const handleRemoveKey = (keyStr: string) => {
    keyRotator.removeKey(keyStr);
    refreshState();
    toast('Key removed from pool', { icon: '🗑️' });
  };

  const content = (
    <div className="space-y-4">
      {/* Banner / Guide */}
      <div className="bg-gradient-to-r from-indigo-50 to-cyan-50 border border-indigo-100 p-3.5 rounded-xl flex items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-950">
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
            Bring Your Own Key (Unlimited & 100% Free)
          </div>
          <p className="text-[11px] text-indigo-900/80 leading-relaxed m-0">
            Keys are saved <strong>only in your browser (localStorage)</strong>. You can get a free Gemini API key in 1 minute with any Google account without a credit card.
          </p>
        </div>
        <a
          href="https://aistudio.google.com/app/apikey"
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white btn-logo-gradient rounded-lg shadow-2xs hover:opacity-95 transition"
        >
          <span>Get Free Key</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Stats Bar */}
      <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs font-semibold">
        <div className="flex items-center gap-3">
          <span className="text-emerald-700 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            {poolState.totalActive} Active
          </span>
          <span className="text-rose-600 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
            {poolState.totalExhausted} Exhausted
          </span>
          <span className="text-slate-600">
            {poolState.keys.length} Total Keys
          </span>
        </div>

        <button
          onClick={handleResetLimits}
          className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Reset Limits
        </button>
      </div>

      {/* Manual Input */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-slate-700 block">
          Add Gemini API Key (or paste multiple separated by commas)
        </label>
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="AIzaSy... or AQ.Ab8..."
            value={manualInput}
            onChange={(e) => setManualInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleManualAdd()}
            className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:border-indigo-500 font-mono bg-white"
          />
          <button
            onClick={handleManualAdd}
            className="px-4 py-2 btn-logo-gradient text-white text-xs font-bold rounded-lg transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Plus className="w-4 h-4" />
            Add Key
          </button>
        </div>
      </div>

      {/* File Upload & Clear */}
      <div className="flex items-center gap-2">
        <input
          type="file"
          ref={fileInputRef}
          accept=".csv,.txt"
          onChange={handleFileUpload}
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold rounded-lg border border-slate-300 hover:border-indigo-400 hover:text-indigo-600 transition shadow-2xs cursor-pointer"
        >
          <Upload className="w-4 h-4 text-indigo-600" />
          Upload Bulk Keys (.csv / .txt)
        </button>

        {poolState.keys.length > 0 && (
          <button
            onClick={handleClear}
            className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold rounded-lg border border-rose-200 transition cursor-pointer"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Key List */}
      {poolState.keys.length > 0 ? (
        <div className="space-y-1.5">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Your Stored Keys ({poolState.keys.length})
          </div>
          <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1 border border-slate-200 rounded-xl p-2 bg-slate-50">
            {poolState.keys.map((k, idx) => (
              <div 
                key={idx}
                className={`flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-mono border ${
                  k.isActive && !k.isExhaustedToday
                    ? 'bg-white border-slate-200 text-slate-800 shadow-2xs'
                    : 'bg-rose-50/70 border-rose-200 text-rose-700 line-through'
                }`}
              >
                <div className="flex items-center gap-2 truncate max-w-[320px]">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${k.isActive && !k.isExhaustedToday ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                  <span className="truncate">
                    {k.key.substring(0, 10)}••••••••••••••••{k.key.slice(-4)}
                  </span>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-[11px] text-slate-400 no-underline font-sans">
                    {k.requestCount || 0} reqs
                  </span>
                  <button
                    onClick={() => handleRemoveKey(k.key)}
                    className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer transition"
                    title="Remove key"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-xl border border-dashed border-slate-300 text-center text-xs text-slate-500 bg-slate-50">
          No custom keys saved yet. The studio will use the system default key (or enter your key above for unlimited personal quota).
        </div>
      )}
    </div>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
        <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-200">
          {/* Modal Header */}
          <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600">
                <Key className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 m-0">Gemini API Key Pool (BYOK)</h3>
                <p className="text-xs text-slate-500 m-0">Manage your free personal API keys for unlimited generation</p>
              </div>
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Modal Body */}
          <div className="p-6 max-h-[80vh] overflow-y-auto">
            {content}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="border border-slate-200 rounded-xl bg-white shadow-2xs overflow-hidden p-5 transition">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <Key className="w-4 h-4 text-indigo-600" />
          <span className="text-sm font-bold text-slate-800">
            Gemini API Key Pool ({poolState.keys.length} Keys)
          </span>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
      {content}
    </div>
  );
};
