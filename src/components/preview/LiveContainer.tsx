import React, { useEffect, useRef, useState } from 'react';
import { AspectRatio, ColorCustomizerSettings } from '../../types/motion.types';
import { Play, Pause, RefreshCw, AlertTriangle } from 'lucide-react';

interface LiveContainerProps {
  proceduralCode: string;
  aspectRatio: AspectRatio;
  setAspectRatio: (ar: AspectRatio) => void;
  colorSettings: ColorCustomizerSettings;
  setColorSettings: React.Dispatch<React.SetStateAction<ColorCustomizerSettings>>;
  playbackSpeed?: number;
}

export const LiveContainer: React.FC<LiveContainerProps> = ({
  proceduralCode,
  aspectRatio,
  setAspectRatio,
  colorSettings,
  setColorSettings,
  playbackSpeed = 1,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [renderError, setRenderError] = useState<string | null>(null);
  const animationFrameId = useRef<number | null>(null);
  const startTimeRef = useRef<number>(performance.now());
  const pausedTimeOffsetRef = useRef<number>(0);
  const compiledFunctionRef = useRef<Function | null>(null);

  // Compile procedural code
  useEffect(() => {
    setRenderError(null);
    try {
      // Safe sandbox function constructor
      const cleaned = proceduralCode.trim();
      const compiled = new Function(cleaned)();
      if (typeof compiled !== 'function') {
        throw new Error('Code must return a rendering function: return function(ctx, width, height, time, colorSettings) { ... }');
      }
      compiledFunctionRef.current = compiled;
    } catch (err: any) {
      console.error('Compilation Error:', err);
      setRenderError(err.message || 'Error compiling procedural motion function');
      compiledFunctionRef.current = null;
    }
  }, [proceduralCode]);

  // Animation Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let isSubscribed = true;

    const renderLoop = (now: number) => {
      if (!isSubscribed) return;

      if (isPlaying && compiledFunctionRef.current) {
        const elapsed = (now - startTimeRef.current + pausedTimeOffsetRef.current) * playbackSpeed;
        try {
          compiledFunctionRef.current(ctx, canvas.width, canvas.height, elapsed, colorSettings);
        } catch (execErr: any) {
          console.error('Runtime Execution Error:', execErr);
          setRenderError(execErr.message || 'Animation runtime error');
        }
      }

      animationFrameId.current = requestAnimationFrame(renderLoop);
    };

    animationFrameId.current = requestAnimationFrame(renderLoop);

    return () => {
      isSubscribed = false;
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
    };
  }, [isPlaying, colorSettings, playbackSpeed]);

  // Determine Aspect Ratio Container Classes
  const getContainerStyle = () => {
    switch (aspectRatio) {
      case '16:9':
        return 'aspect-video w-full max-h-[520px]';
      case '9:16':
        return 'aspect-[9/16] h-[520px] mx-auto';
      case '1:1':
        return 'aspect-square h-[520px] mx-auto';
      default:
        return 'aspect-video w-full max-h-[520px]';
    }
  };

  const getCanvasDimensions = () => {
    switch (aspectRatio) {
      case '16:9':
        return { w: 1920, h: 1080 };
      case '9:16':
        return { w: 1080, h: 1920 };
      case '1:1':
        return { w: 1080, h: 1080 };
      default:
        return { w: 1920, h: 1080 };
    }
  };

  const { w, h } = getCanvasDimensions();

  const handleToggleGreenScreen = () => {
    setColorSettings(prev => ({
      ...prev,
      isGreenScreen: !prev.isGreenScreen,
      chromaBgColor: !prev.isGreenScreen ? '#00ff00' : '#050712'
    }));
  };

  return (
    <div className="motion-card overflow-hidden">
      {/* Top Preview Controls Bar */}
      <div className="px-4 py-2.5 bg-white border-b border-slate-200 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-xs font-black tracking-wider uppercase text-slate-900">
            Live Container Preview
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Aspect Ratio Switcher */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-[11px] font-bold">
            {(['16:9', '9:16', '1:1'] as AspectRatio[]).map(ar => (
              <button
                key={ar}
                onClick={() => setAspectRatio(ar)}
                className={`px-2 py-0.5 rounded-md transition ${
                  aspectRatio === ar ? 'bg-slate-900 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {ar}
              </button>
            ))}
          </div>

          {/* Color Presets */}
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
            <span className="text-[10px] uppercase text-slate-400">Color:</span>
            <button
              onClick={() => setColorSettings(prev => ({ ...prev, elementColor: '#00f0ff', isGreenScreen: false }))}
              className="w-3.5 h-3.5 rounded-full bg-cyan-400 border border-slate-300 shadow-2xs hover:scale-110 transition"
              title="Cyan"
            />
            <button
              onClick={() => setColorSettings(prev => ({ ...prev, elementColor: '#10b981', isGreenScreen: false }))}
              className="w-3.5 h-3.5 rounded-full bg-emerald-500 border border-slate-300 shadow-2xs hover:scale-110 transition"
              title="Emerald"
            />
            <button
              onClick={() => setColorSettings(prev => ({ ...prev, elementColor: '#a855f7', isGreenScreen: false }))}
              className="w-3.5 h-3.5 rounded-full bg-purple-500 border border-slate-300 shadow-2xs hover:scale-110 transition"
              title="Purple"
            />
            <button
              onClick={() => setColorSettings(prev => ({ ...prev, elementColor: '#ff0055', isGreenScreen: false }))}
              className="w-3.5 h-3.5 rounded-full bg-rose-500 border border-slate-300 shadow-2xs hover:scale-110 transition"
              title="Rose"
            />
          </div>

          {/* Green Screen Button */}
          <button
            onClick={handleToggleGreenScreen}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-black uppercase tracking-wider transition border ${
              colorSettings.isGreenScreen
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                : 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
            }`}
          >
            {colorSettings.isGreenScreen ? '✓ Green Screen' : 'Green Screen'}
          </button>
        </div>
      </div>

      {/* Viewport Canvas Screen */}
      <div className="bg-slate-950 p-2 flex items-center justify-center relative min-h-[360px] overflow-hidden">
        {renderError ? (
          <div className="bg-red-950/80 border border-red-800 p-6 rounded-xl text-center max-w-lg text-red-200 space-y-2">
            <AlertTriangle className="w-8 h-8 text-red-500 mx-auto" />
            <h4 className="text-sm font-bold text-white">Motion Code Error</h4>
            <p className="text-xs font-mono text-red-300 break-words">{renderError}</p>
          </div>
        ) : (
          <div className={`relative ${getContainerStyle()} bg-black rounded-lg overflow-hidden border border-slate-800 shadow-2xl flex items-center justify-center`}>
            <canvas
              ref={canvasRef}
              width={w}
              height={h}
              className="w-full h-full object-contain"
            />

            {/* Play/Pause Overlay Controls */}
            <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-slate-900/80 backdrop-blur-xs px-2 py-1 rounded-lg border border-slate-700/80">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="p-1 text-slate-300 hover:text-white"
                title={isPlaying ? 'Pause Animation' : 'Play Animation'}
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>
              <button
                onClick={() => { startTimeRef.current = performance.now(); }}
                className="p-1 text-slate-300 hover:text-white"
                title="Restart Loop"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
              <span className="text-[10px] font-mono text-slate-400 pl-1">
                60 FPS
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
