import React, { useState, useEffect, useRef } from 'react';
import { keyRotator } from '../../services/gemini/keyRotator';
import type { ApiKeyPoolState } from '../../types/apiKey.types';
import { Key, Upload, Trash2, RefreshCw, ChevronDown, ChevronUp, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

export const ApiKeyPool: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(true);
  const [poolState, setPoolState] = useState<ApiKeyPoolState>(keyRotator.getState());
  const [manualInput, setManualInput] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const refreshState = () => {
    setPoolState(keyRotator.getState());
  };

  useEffect(() => {
    refreshState();
  }, []);

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
          toast.error('No valid Gemini API keys found in the file. (Keys should start with AIzaSy...)');
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
          toast(`All ${result.total} key(s) are already active in the pool.`, { icon: 'ℹ️' });
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
      toast(`Keys are already active in the pool.`, { icon: 'ℹ️' });
    }
  };

  const handleClear = () => {
    keyRotator.clearAll();
    refreshState();
    toast.success('All API keys cleared from pool.');
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

  return (
    <div className="border border-slate-200 rounded-xl bg-white shadow-2xs overflow-hidden mb-4 transition">
      {/* Header Bar */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="px-4 py-3 bg-slate-50 hover:bg-slate-100/80 cursor-pointer flex items-center justify-between transition border-b border-slate-200"
      >
        <div className="flex items-center gap-2">
          <Key className="w-4 h-4 text-red-600" />
          <span className="text-xs font-bold text-slate-800">
            Gemini API Key Pool ({poolState.keys.length} Keys Loaded)
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1">
            {isOpen ? 'Hide' : 'Show'}
            {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </span>
        </div>
      </div>

      {/* Expanded Content */}
      {isOpen && (
        <div className="p-4 space-y-3 bg-white">
          <p className="text-xs text-slate-600 leading-relaxed m-0">
            Upload a CSV or TXT file containing 1 to 100+ Free/Paid API keys. The system auto-rotates and auto-switches on quota limit (Error 429).
          </p>

          {/* Stats Bar */}
          <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-xs font-semibold">
            <div className="flex items-center gap-3">
              <span className="text-emerald-700 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                {poolState.totalActive} Active
              </span>
              <span className="text-red-600 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-red-500"></span>
                {poolState.totalExhausted} Exhausted Today
              </span>
              <span className="text-slate-600">
                {poolState.keys.length} Total
              </span>
            </div>

            <button
              onClick={handleResetLimits}
              className="text-[11px] font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1 underline cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              Reset Limits
            </button>
          </div>

          {/* Actions */}
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
              className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-lg border border-slate-300 transition cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              Upload Keys (.csv / .txt)
            </button>

            <button
              onClick={handleClear}
              className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold rounded-lg border border-red-200 transition cursor-pointer"
            >
              Clear All
            </button>
          </div>

          {/* Manual Input */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Or paste Gemini API Key(s) separated by commas..."
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleManualAdd()}
              className="flex-1 px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:border-red-500 font-mono"
            />
            <button
              onClick={handleManualAdd}
              className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Add
            </button>
          </div>

          {/* Key List */}
          {poolState.keys.length > 0 && (
            <div className="max-h-36 overflow-y-auto space-y-1 pr-1 border border-slate-200 rounded-lg p-1.5 bg-slate-50">
              {poolState.keys.map((k, idx) => (
                <div 
                  key={idx}
                  className={`flex items-center justify-between px-2.5 py-1 rounded text-[11px] font-mono border ${
                    k.isActive && !k.isExhaustedToday
                      ? 'bg-white border-slate-200 text-slate-800'
                      : 'bg-red-50/70 border-red-200 text-red-700 line-through'
                  }`}
                >
                  <span className="truncate max-w-[280px]">
                    {k.key.substring(0, 8)}•••••••••••••••••••••••••••••{k.key.slice(-4)}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-400 no-underline font-sans">
                      {k.requestCount || 0} reqs
                    </span>
                    <button
                      onClick={() => handleRemoveKey(k.key)}
                      className="text-slate-400 hover:text-red-600 p-0.5 cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
