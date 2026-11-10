import React, { useRef, useState, useEffect } from 'react';
import { Upload, Wand2, Copy, Trash2, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import { extractImageUrlFromHtml } from './utils/imageProcessors';

interface ImageDropzoneProps {
  imagePreview: string | null;
  setImagePreview: (img: string | null) => void;
  processImageSource: (fileOrBlob?: Blob | null, urlOrHtml?: string | null) => Promise<boolean>;
}

export const ImageDropzone: React.FC<ImageDropzoneProps> = ({
  imagePreview,
  setImagePreview,
  processImageSource
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragCounter = useRef<number>(0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageSource(file);
    }
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
            const imageType = item.types.find((t) => t.startsWith('image/'));
            if (imageType) {
              const blob = await item.getType(imageType);
              toast.dismiss(loadingToast);
              await processImageSource(blob);
              return;
            }

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
      const target = e.target as HTMLElement | null;
      const isInput =
        target &&
        (target.tagName === 'TEXTAREA' ||
          (target.tagName === 'INPUT' && (target as HTMLInputElement).type !== 'file'));

      const clipboardData = e.clipboardData;
      if (!clipboardData) return;

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

      if (isInput) return;

      const html = clipboardData.getData('text/html');
      if (html) {
        const extracted = extractImageUrlFromHtml(html);
        if (extracted) {
          e.preventDefault();
          await processImageSource(null, extracted);
          return;
        }
      }

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
    <div 
      className="space-y-2.5"
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {imagePreview ? (
        <div className={`relative border-2 rounded-lg overflow-hidden bg-slate-900 group transition-all duration-200 ${
          isDragging ? 'border-cyan-500 ring-4 ring-cyan-500/20 scale-[0.99]' : 'border-slate-200'
        }`}>
          <img 
            src={imagePreview} 
            alt="Uploaded Preview" 
            className="w-full h-40 object-contain"
          />
          {isDragging && (
            <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-xs flex flex-col items-center justify-center text-white z-10 transition">
              <Upload className="w-8 h-8 text-cyan-400 animate-bounce mb-1" />
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-300">
                Drop new image to replace
              </span>
            </div>
          )}
          <div className="absolute bottom-2 right-2 flex items-center gap-1.5 bg-slate-900/80 backdrop-blur-xs p-1 rounded-md border border-slate-700">
            <button
              onClick={handlePasteClipboard}
              title="Paste / Replace"
              className="px-2.5 py-1 text-xs font-bold text-slate-300 hover:text-white flex items-center gap-1 cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5" />
              Replace
            </button>
            <button
              onClick={() => { setImagePreview(null); toast('Image removed', { icon: '🗑️' }); }}
              title="Remove Image"
              className="p-1 text-slate-400 hover:text-rose-400 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all duration-200 ${
            isDragging
              ? 'border-cyan-500 bg-cyan-50/60 ring-4 ring-cyan-500/20 scale-[1.01]'
              : 'border-slate-300 hover:border-indigo-400 bg-slate-50/50 hover:bg-slate-50'
          }`}
        >
          <div className={`w-11 h-11 rounded-lg bg-white shadow-2xs border flex items-center justify-center transition ${
            isDragging ? 'border-cyan-400 text-cyan-500 animate-bounce' : 'border-slate-200 text-slate-600'
          }`}>
            <Upload className="w-5 h-5 text-indigo-600" />
          </div>
          <div className="text-center">
            <p className="text-sm font-bold text-slate-700 m-0">
              {isDragging ? 'Drop your image now!' : 'Drag & drop image or browse'}
            </p>
            <p className="text-xs text-slate-500 font-medium mt-1">
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
          className="py-2 px-3 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-md border border-slate-200 hover:border-indigo-300 hover:text-indigo-600 transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
        >
          <ImageIcon className="w-4 h-4 text-cyan-500" />
          Paste Image
        </button>
        <button
          onClick={handleRandomImage}
          className="py-2 px-3 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-md border border-slate-200 hover:border-purple-300 hover:text-purple-600 transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
        >
          <Wand2 className="w-4 h-4 text-purple-500" />
          Random Image
        </button>
      </div>
    </div>
  );
};

