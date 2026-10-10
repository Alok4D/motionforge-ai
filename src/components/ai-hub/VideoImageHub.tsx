import React, { useRef, useState, useEffect, useCallback } from 'react';
import type { MotionStyle, AspectRatio } from '../../types/motion.types';
import { Upload, Sparkles, Wand2, Copy, Trash2, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';

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

// Convert Blob/File to Data URL
const blobToDataUrl = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(blob);
  });
};

// Extract image URL from raw HTML string (dragged or copied from web pages)
const extractImageUrlFromHtml = (html: string): string | null => {
  if (!html) return null;
  const match = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  return match && match[1] ? match[1] : null;
};

// Convert web image URL to Base64 Data URL (supports CORS, Canvas, and proxy fallbacks)
const convertUrlToBase64 = async (url: string): Promise<string> => {
  if (url.startsWith('data:image/')) return url;

  // Strategy 1: Direct fetch with CORS
  try {
    const res = await fetch(url, { mode: 'cors' });
    if (res.ok) {
      const blob = await res.blob();
      if (blob.type.startsWith('image/') || blob.size > 0) {
        return await blobToDataUrl(blob);
      }
    }
  } catch {
    // Continue to next strategy
  }

  // Strategy 2: Image element + Canvas
  try {
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = img.naturalWidth || img.width;
          canvas.height = img.naturalHeight || img.height;
          const ctx = canvas.getContext('2d');
          if (!ctx) return reject(new Error('Canvas context failed'));
          ctx.drawImage(img, 0, 0);
          resolve(canvas.toDataURL('image/png'));
        } catch (e) {
          reject(e);
        }
      };
      img.onerror = (err) => reject(err);
      img.src = url;
    });
    return dataUrl;
  } catch {
    // Continue to proxy strategy
  }

  // Strategy 3: CORS proxy fallback
  try {
    const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
    const res = await fetch(proxyUrl);
    if (res.ok) {
      const blob = await res.blob();
      return await blobToDataUrl(blob);
    }
  } catch {
    // Proxy failed
  }

  // Fallback to raw URL if conversion fails
  return url;
};

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
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragCounter = useRef<number>(0);

  // Common processor for files, blobs, URLs, or HTML
  const processImageSource = useCallback(async (
    fileOrBlob?: Blob | null,
    urlOrHtml?: string | null
  ): Promise<boolean> => {
    const loadingToast = toast.loading('Processing image...');
    try {
      // 1. Direct File / Blob
      if (fileOrBlob && fileOrBlob.type.startsWith('image/')) {
        const dataUrl = await blobToDataUrl(fileOrBlob);
        setImagePreview(dataUrl);
        toast.success('Image loaded successfully!', { id: loadingToast });
        return true;
      }

      // 2. URL or HTML string
      if (urlOrHtml) {
        const cleanStr = urlOrHtml.trim();
        const extracted = extractImageUrlFromHtml(cleanStr) || cleanStr;

        if (extracted.startsWith('data:image/')) {
          setImagePreview(extracted);
          toast.success('Image loaded successfully!', { id: loadingToast });
          return true;
        }

        if (
          extracted.startsWith('http://') ||
          extracted.startsWith('https://') ||
          extracted.startsWith('blob:')
        ) {
          const dataUrl = await convertUrlToBase64(extracted);
          setImagePreview(dataUrl);
          toast.success('Web image loaded successfully!', { id: loadingToast });
          return true;
        }
      }

      toast.dismiss(loadingToast);
      return false;
    } catch (err) {
      console.error('Error processing image source', err);
      toast.error('Failed to process image', { id: loadingToast });
      return false;
    }
  }, [setImagePreview]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageSource(file);
    }
    // reset input value so re-selecting same file triggers change
    if (e.target) {
      e.target.value = '';
    }
  };

  // Drag & drop handlers
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    setIsDragging(true);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'copy';
    if (!isDragging) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current <= 0) {
      dragCounter.current = 0;
      setIsDragging(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current = 0;
    setIsDragging(false);

    // 1. Check direct files dropped from OS
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        if (files[i].type.startsWith('image/')) {
          await processImageSource(files[i]);
          return;
        }
      }
    }

    // 2. Check items
    const items = e.dataTransfer.items;
    if (items && items.length > 0) {
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.kind === 'file' && item.type.startsWith('image/')) {
          const file = item.getAsFile();
          if (file) {
            await processImageSource(file);
            return;
          }
        }
      }
    }

    // 3. Check HTML content (dragged image element from another browser website)
    const html = e.dataTransfer.getData('text/html');
    if (html) {
      const extractedUrl = extractImageUrlFromHtml(html);
      if (extractedUrl) {
        await processImageSource(null, extractedUrl);
        return;
      }
    }

    // 4. Check uri-list
    const uriList = e.dataTransfer.getData('text/uri-list');
    if (uriList) {
      const firstUrl = uriList.split('\n')[0].trim();
      if (firstUrl) {
        await processImageSource(null, firstUrl);
        return;
      }
    }

    // 5. Check plain text
    const text = e.dataTransfer.getData('text/plain');
    if (text) {
      const handled = await processImageSource(null, text);
      if (handled) return;
    }

    toast.error('No supported image detected in dropped content');
  };

  // Paste from clipboard button
  const handlePasteClipboard = async () => {
    const loadingToast = toast.loading('Reading clipboard...');
    try {
      // 1. Try reading rich clipboard items
      if (navigator.clipboard && navigator.clipboard.read) {
        try {
          const items = await navigator.clipboard.read();
          for (const item of items) {
            // Check direct image types
            const imageType = item.types.find((t) => t.startsWith('image/'));
            if (imageType) {
              const blob = await item.getType(imageType);
              toast.dismiss(loadingToast);
              await processImageSource(blob);
              return;
            }

            // Check text/html (copied image from another website)
            if (item.types.includes('text/html')) {
              const htmlBlob = await item.getType('text/html');
              const htmlText = await htmlBlob.text();
              const extracted = extractImageUrlFromHtml(htmlText);
              if (extracted) {
                toast.dismiss(loadingToast);
                await processImageSource(null, extracted);
                return;
              }
            }

            // Check text/plain (image URL copied)
            if (item.types.includes('text/plain')) {
              const textBlob = await item.getType('text/plain');
              const text = await textBlob.text();
              if (
                text.startsWith('http://') ||
                text.startsWith('https://') ||
                text.startsWith('data:image/')
              ) {
                toast.dismiss(loadingToast);
                await processImageSource(null, text);
                return;
              }
            }
          }
        } catch (readErr) {
          console.warn('navigator.clipboard.read fallback', readErr);
        }
      }

      // 2. Fallback to readText
      if (navigator.clipboard && navigator.clipboard.readText) {
        try {
          const text = await navigator.clipboard.readText();
          if (
            text &&
            (text.startsWith('http://') ||
              text.startsWith('https://') ||
              text.startsWith('data:image/') ||
              text.includes('<img'))
          ) {
            toast.dismiss(loadingToast);
            await processImageSource(null, text);
            return;
          }
        } catch (textErr) {
          console.warn('navigator.clipboard.readText fallback', textErr);
        }
      }

      toast.dismiss(loadingToast);
      // 3. Fallback prompt for browser permission restrictions
      const url = prompt('Paste image URL or Base64 string:');
      if (url && url.trim()) {
        await processImageSource(null, url.trim());
      } else {
        toast.error('No image found in clipboard. Copy an image first (Ctrl+C).');
      }
    } catch (err) {
      toast.dismiss(loadingToast);
      console.warn('Clipboard read error', err);
      toast.error('Unable to read clipboard. Please paste URL or browse.');
    }
  };

  // Global Ctrl+V listener for keyboard paste
  useEffect(() => {
    const handleGlobalPaste = async (e: ClipboardEvent) => {
      // Don't intercept if user is typing text in an input or textarea (unless image file is pasted)
      const target = e.target as HTMLElement | null;
      const isInput =
        target &&
        (target.tagName === 'TEXTAREA' ||
          (target.tagName === 'INPUT' && (target as HTMLInputElement).type !== 'file'));

      const clipboardData = e.clipboardData;
      if (!clipboardData) return;

      // 1. Files in clipboard (e.g. screenshot or copied file)
      if (clipboardData.files && clipboardData.files.length > 0) {
        for (let i = 0; i < clipboardData.files.length; i++) {
          const file = clipboardData.files[i];
          if (file.type.startsWith('image/')) {
            e.preventDefault();
            await processImageSource(file);
            return;
          }
        }
      }

      // 2. Clipboard items
      if (clipboardData.items && clipboardData.items.length > 0) {
        for (let i = 0; i < clipboardData.items.length; i++) {
          const item = clipboardData.items[i];
          if (item.type.startsWith('image/')) {
            const file = item.getAsFile();
            if (file) {
              e.preventDefault();
              await processImageSource(file);
              return;
            }
          }
        }
      }

      // If user is focused inside a text input or textarea, let normal text paste proceed
      if (isInput) return;

      // 3. HTML image tag from copied web page
      const html = clipboardData.getData('text/html');
      if (html) {
        const extracted = extractImageUrlFromHtml(html);
        if (extracted) {
          e.preventDefault();
          await processImageSource(null, extracted);
          return;
        }
      }

      // 4. Plain text URL or data URL
      const text = clipboardData.getData('text/plain')?.trim();
      if (text) {
        const isUrl =
          text.startsWith('http://') ||
          text.startsWith('https://') ||
          text.startsWith('data:image/');
        if (isUrl) {
          e.preventDefault();
          await processImageSource(null, text);
        }
      }
    };

    window.addEventListener('paste', handleGlobalPaste);
    return () => {
      window.removeEventListener('paste', handleGlobalPaste);
    };
  }, [processImageSource]);

  const handleRandomImage = async () => {
    const samples = [
      'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1507499739999-097706ad8914?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80'
    ];
    const picked = samples[Math.floor(Math.random() * samples.length)];
    await processImageSource(null, picked);
  };

  return (
    <div className="motion-card p-4 space-y-4">
      {/* Title */}
      <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-800 border-b border-slate-100 pb-2">
        <Sparkles className="w-4 h-4 text-red-500" />
        Video & Image AI Hub
      </div>

      {/* Upload Zone / Dropzone */}
      <div 
        className="space-y-2"
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {imagePreview ? (
          <div className={`relative border-2 rounded-xl overflow-hidden bg-slate-900 group transition-all duration-200 ${
            isDragging ? 'border-red-500 ring-4 ring-red-500/20 scale-[0.99]' : 'border-slate-200'
          }`}>
            <img 
              src={imagePreview} 
              alt="Uploaded Preview" 
              className="w-full h-36 object-contain"
            />
            {isDragging && (
              <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-xs flex flex-col items-center justify-center text-white z-10 transition">
                <Upload className="w-8 h-8 text-red-500 animate-bounce mb-1" />
                <span className="text-xs font-black uppercase tracking-wider text-red-400">
                  Drop new image to replace
                </span>
              </div>
            )}
            <div className="absolute bottom-2 right-2 flex items-center gap-1.5 bg-slate-900/80 backdrop-blur-xs p-1 rounded-lg border border-slate-700">
              <button
                onClick={handlePasteClipboard}
                title="Paste / Replace"
                className="px-2 py-1 text-[11px] font-bold text-slate-300 hover:text-white flex items-center gap-1 cursor-pointer"
              >
                <Copy className="w-3 h-3" />
                Replace
              </button>
              <button
                onClick={() => { setImagePreview(null); toast('Image removed', { icon: '🗑️' }); }}
                title="Remove Image"
                className="p-1 text-slate-400 hover:text-red-400 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : (
          <div
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all duration-200 ${
              isDragging
                ? 'border-red-500 bg-red-50/60 ring-4 ring-red-500/20 scale-[1.01]'
                : 'border-slate-300 hover:border-red-400 bg-slate-50/50 hover:bg-slate-50'
            }`}
          >
            <div className={`w-10 h-10 rounded-full bg-white shadow-xs border flex items-center justify-center transition ${
              isDragging ? 'border-red-400 text-red-500 animate-bounce' : 'border-slate-200 text-slate-500'
            }`}>
              <Upload className="w-5 h-5" />
            </div>
            <div className="text-center">
              <p className="text-xs font-bold text-slate-700 m-0">
                {isDragging ? 'Drop your image now!' : 'Drag & drop image or browse'}
              </p>
              <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                Drop files, drag from web, or press Ctrl+V to paste
              </p>
            </div>
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
            className="py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg border border-slate-200 transition flex items-center justify-center gap-1 cursor-pointer"
          >
            <ImageIcon className="w-3.5 h-3.5 text-red-600" />
            Paste Image
          </button>
          <button
            onClick={handleRandomImage}
            className="py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg border border-slate-200 transition flex items-center justify-center gap-1 cursor-pointer"
          >
            <Wand2 className="w-3.5 h-3.5 text-slate-600" />
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
              className={`py-2 px-1 rounded-lg text-xs font-bold transition flex flex-col items-center justify-center border cursor-pointer ${
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
              className={`py-2 px-2 rounded-lg text-xs font-bold transition flex flex-col items-center justify-center border cursor-pointer ${
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
              : 'bg-slate-900 hover:bg-black text-white cursor-pointer'
          }`}
        >
          <Sparkles className="w-4 h-4 text-red-500 animate-spin" />
          {isGenerating ? 'Generating Motion...' : 'Generate Motion from Image'}
        </button>

        <button
          onClick={onCreateVariation}
          disabled={isGenerating}
          className="w-full py-2 px-4 rounded-xl text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition flex items-center justify-center gap-2 cursor-pointer"
        >
          <Wand2 className="w-3.5 h-3.5 text-red-600" />
          Create Variation from Current
        </button>
      </div>

      {/* Status Feedback */}
      {statusMessage && (
        <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-lg text-[11px] font-bold text-emerald-700 text-center flex items-center justify-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          {statusMessage}
        </div>
      )}
    </div>
  );
};
