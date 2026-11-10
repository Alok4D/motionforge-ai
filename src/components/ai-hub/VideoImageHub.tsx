import React, { useState, useCallback } from 'react';
import type { MotionStyle, AspectRatio } from '../../types/motion.types';
import { Sparkles, Wand2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { ImageDropzone } from './ImageDropzone';
import { MotionStyleSelector } from './MotionStyleSelector';
import { AspectRatioSelector } from './AspectRatioSelector';
import { MotionPromptInput } from './MotionPromptInput';
import { blobToDataUrl, extractImageUrlFromHtml, convertUrlToBase64 } from './utils/imageProcessors';

interface VideoImageHubProps {
  imagePreview: string | null;
  setImagePreview: (img: string | null) => void;
  style: MotionStyle;
  setStyle: (s: MotionStyle) => void;
  aspectRatio: AspectRatio;
  setAspectRatio: (ar: AspectRatio) => void;
  isGenerating: boolean;
  onGenerateFromImage: (motionPrompt?: string) => void;
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
  const [motionPrompt, setMotionPrompt] = useState<string>('');

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

  return (
    <div className="motion-card p-4 space-y-4">
      {/* Title */}
      <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-800 border-b border-slate-100 pb-2.5">
        <Sparkles className="w-4 h-4 text-cyan-500" />
        Video & Image AI Hub
      </div>

      {/* 1. Upload Dropzone & Actions */}
      <ImageDropzone
        imagePreview={imagePreview}
        setImagePreview={setImagePreview}
        processImageSource={processImageSource}
      />

      {/* 2. Motion Style & Dimension */}
      <MotionStyleSelector
        style={style}
        setStyle={setStyle}
      />

      {/* 3. Canvas Aspect Ratio Dropdown (1:1, 3:4, 9:16, 4:3, 16:9, 21:9, Auto) */}
      <AspectRatioSelector
        aspectRatio={aspectRatio}
        setAspectRatio={setAspectRatio}
      />

      {/* 4. AI Motion Direction Prompt */}
      <MotionPromptInput
        motionPrompt={motionPrompt}
        setMotionPrompt={setMotionPrompt}
      />

      {/* 5. Main Action Buttons */}
      <div className="space-y-2.5 pt-1">
        <button
          onClick={() => onGenerateFromImage(motionPrompt)}
          disabled={isGenerating || !imagePreview}
          className={`w-full py-3 px-4 rounded-lg text-sm font-bold tracking-wide uppercase transition flex items-center justify-center gap-2 cursor-pointer ${
            isGenerating || !imagePreview
              ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
              : 'btn-logo-gradient'
          }`}
        >
          <Sparkles className="w-4 h-4 text-white" />
          {isGenerating ? 'Generating Motion...' : 'Generate Motion from Image'}
        </button>

        <button
          onClick={onCreateVariation}
          disabled={isGenerating}
          className="w-full py-2.5 px-4 rounded-lg text-xs font-bold text-white btn-logo-secondary transition flex items-center justify-center gap-2 cursor-pointer"
        >
          <Wand2 className="w-4 h-4 text-cyan-200" />
          Create Variation from Current
        </button>
      </div>

      {/* Status Feedback */}
      {statusMessage && (
        <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-md text-xs font-bold text-emerald-700 text-center flex items-center justify-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          {statusMessage}
        </div>
      )}
    </div>
  );
};
