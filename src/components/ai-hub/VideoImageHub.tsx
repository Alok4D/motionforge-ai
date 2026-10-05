import React, { useRef } from 'react';
import { MotionStyle, AspectRatio } from '../../types/motion.types';
import { Upload, Sparkles, Wand2, Copy, Trash2, Image as ImageIcon } from 'lucide-react';

interface VideoImageHubProps {
  imagePreview: string | null;
  setImagePreview: (img: string | null) => void;
  style: MotionStyle;
  setStyle: (s: MotionStyle) => void;
  aspectRatio: AspectRatio;
  setAspectRatio: (ar: AspectRatio) => void;
  isGenerating: boolean;
  onGenerateFromImage: () => void;
  onCreateVariation: () => void;
  statusMessage?: string | null;
}

export const VideoImageHub: React.FC<VideoImageHubProps> = ({
  imagePreview,
  setImagePreview,
  style,
  setStyle,
  aspectRatio,
  setAspectRatio,
  isGenerating,
  onGenerateFromImage,
  onCreateVariation,
  statusMessage
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setImagePreview(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handlePasteClipboard = async () => {
    try {
      const items = await navigator.clipboard.read();
      for (const item of items) {
        const imageType = item.types.find(type => type.startsWith('image/'));
        if (imageType) {
          const blob = await item.getType(imageType);
          const reader = new FileReader();
          reader.onload = (e) => {
            setImagePreview(e.target?.result as string);
          };
          reader.readAsDataURL(blob);
          return;
        }
      }
      alert('No image found in clipboard. Please copy an image or screenshot first (Ctrl+C / PrtSc).');
    } catch (err) {
      console.warn('Clipboard read error, fallback to prompt', err);
      const url = prompt('Enter image URL or paste base64:');
      if (url) setImagePreview(url);
    }
  };

  const handleRandomImage = () => {
    // High quality sample procedural graphics
    const samples = [
      'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1507499739999-097706ad8914?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80'
    ];
    const picked = samples[Math.floor(Math.random() * samples.length)];
    setImagePreview(picked);
  };

  return (
    <div className="motion-card p-4 space-y-4">
      {/* Title */}
      <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-800 border-b border-slate-100 pb-2">
        <Sparkles className="w-4 h-4 text-red-500" />
        Video & Image AI Hub
      </div>

      {/* Upload Zone / Dropzone */}
      <div className="space-y-2">
        {imagePreview ? (
          <div className="relative border border-slate-200 rounded-xl overflow-hidden bg-slate-900 group">
            <img 
              src={imagePreview} 
              alt="Uploaded Preview" 
              className="w-full h-36 object-contain"
            />
            <div className="absolute bottom-2 right-2 flex items-center gap-1.5 bg-slate-900/80 backdrop-blur-xs p-1 rounded-lg border border-slate-700">
              <button
                onClick={handlePasteClipboard}
                title="Copy / Replace"
                className="px-2 py-1 text-[11px] font-bold text-slate-300 hover:text-white flex items-center gap-1"
              >
                <Copy className="w-3 h-3" />
                Copy
              </button>
              <button
                onClick={() => setImagePreview(null)}
                title="Remove Image"
                className="p-1 text-slate-400 hover:text-red-400"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-300 hover:border-red-400 rounded-xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer bg-slate-50/50 hover:bg-slate-50 transition"
          >
            <div className="w-10 h-10 rounded-full bg-white shadow-xs border border-slate-200 flex items-center justify-center text-slate-500">
              <Upload className="w-5 h-5" />
            </div>
            <p className="text-xs font-semibold text-slate-600 m-0 text-center">
              Drag image/video here or click to browse
            </p>
          </div>
        )}

        <input 
          type="file" 
          ref={fileInputRef} 
          accept="image/*" 
          onChange={handleFileChange} 
          className="hidden" 
        />

        {/* Action Pills */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handlePasteClipboard}
            className="py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg border border-slate-200 transition flex items-center justify-center gap-1"
          >
            <ImageIcon className="w-3.5 h-3.5" />
            Paste Image
          </button>
          <button
            onClick={handleRandomImage}
            className="py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg border border-slate-200 transition flex items-center justify-center gap-1"
          >
            <Wand2 className="w-3.5 h-3.5" />
            Random Image
          </button>
        </div>
      </div>

      {/* Motion Style & Dimension */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[11px] font-bold text-slate-700">
          <span>MOTION STYLE & DIMENSION</span>
          <span className="text-red-600 font-extrabold">{style}</span>
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          {(['3D Cinematic', '2D Vector', 'Line Art'] as MotionStyle[]).map((s, idx) => (
            <button
              key={s}
              onClick={() => setStyle(s)}
              className={`py-2 px-1 rounded-lg text-xs font-bold transition flex flex-col items-center justify-center border ${
                style === s
                  ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <span className="text-[10px] opacity-75">{idx + 1}. {s.split(' ')[0]}</span>
              <span className="text-[11px] truncate">{s.split(' ').slice(1).join(' ') || s}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Canvas Aspect Ratio */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[11px] font-bold text-slate-700">
          <span>CANVAS ASPECT RATIO</span>
          <span className="text-slate-500 font-mono">{aspectRatio === '16:9' ? '16:9 Widescreen' : aspectRatio}</span>
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          {(['16:9', '9:16', '1:1'] as AspectRatio[]).map(ar => (
            <button
              key={ar}
              onClick={() => setAspectRatio(ar)}
              className={`py-2 px-2 rounded-lg text-xs font-bold transition flex flex-col items-center justify-center border ${
                aspectRatio === ar
                  ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <span>{ar}</span>
              <span className="text-[9px] opacity-75 font-normal">
                {ar === '16:9' ? 'Landscape' : ar === '9:16' ? 'Vertical' : 'Square'}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Action Buttons */}
      <div className="space-y-2 pt-1">
        <button
          onClick={onGenerateFromImage}
          disabled={isGenerating || !imagePreview}
          className={`w-full py-2.5 px-4 rounded-xl text-xs font-black tracking-wide uppercase transition flex items-center justify-center gap-2 shadow-sm ${
            isGenerating || !imagePreview
              ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
              : 'bg-slate-900 hover:bg-black text-white'
          }`}
        >
          <Sparkles className="w-4 h-4 text-red-500 animate-spin" />
          {isGenerating ? 'Generating Motion...' : 'Generate Motion from Image'}
        </button>

        <button
          onClick={onCreateVariation}
          disabled={isGenerating}
          className="w-full py-2 px-4 rounded-xl text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition flex items-center justify-center gap-2"
        >
          <Wand2 className="w-3.5 h-3.5 text-red-600" />
          Create Variation from Current
        </button>
      </div>

      {/* Status Feedback */}
      {statusMessage && (
        <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-lg text-[11px] font-bold text-emerald-700 text-center flex items-center justify-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          {statusMessage}
        </div>
      )}
    </div>
  );
};
