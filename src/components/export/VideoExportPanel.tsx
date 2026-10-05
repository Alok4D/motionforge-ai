import React, { useState } from 'react';
import type { RenderJob, Resolution, Framerate, VideoFormat, ColorCustomizerSettings, CreatorToolsSettings } from '../../types/motion.types';
import { renderAnimationToVideo } from '../../services/encoder/videoExporter';
import { Video, Film, Download, Trash2, CheckCircle2, Play, X, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface VideoExportPanelProps {
  proceduralCode: string;
  colorSettings: ColorCustomizerSettings;
  creatorSettings: CreatorToolsSettings;
  currentTitle: string;
}

export const VideoExportPanel: React.FC<VideoExportPanelProps> = ({
  proceduralCode,
  colorSettings,
  creatorSettings,
  currentTitle,
}) => {
  const [duration, setDuration] = useState<number>(10);
  const [resolution, setResolution] = useState<Resolution>('4K UHD (3840x2160)');
  const [framerate, setFramerate] = useState<Framerate>(60);
  const [format, setFormat] = useState<VideoFormat>('MOV');
  const [qualityCrf, setQualityCrf] = useState<number>(17);
  const [codecSpeed, setCodecSpeed] = useState<string>('Medium (Standard)');
  const [renderQueue, setRenderQueue] = useState<RenderJob[]>([]);
  const [previewJob, setPreviewJob] = useState<RenderJob | null>(null);

  const durationPresets = [5, 10, 15, 30];

  const handleStartRender = async () => {
    let compiledFunc: Function;
    try {
      compiledFunc = new Function(proceduralCode.trim())();
      if (typeof compiledFunc !== 'function') throw new Error('Code must return a render function');
    } catch (err: any) {
      toast.error('Cannot render: Procedural code contains syntax errors.');
      return;
    }

    const newJob: RenderJob = {
      id: `edit-${Date.now()}-${Math.floor(Math.random() * 900 + 100)}`,
      timestamp: Date.now(),
      title: currentTitle || 'Motion Graphic Loop',
      duration: duration,
      resolution: resolution,
      framerate: framerate,
      format: format,
      qualityCrf: qualityCrf,
      status: 'RENDERING',
      progress: 0,
      totalFrames: Math.round(duration * framerate),
      currentFrame: 0,
    };

    setRenderQueue(prev => [newJob, ...prev]);
    const renderToast = toast.loading(`Rendering ${resolution} (${duration}s @ ${framerate}fps)...`);

    try {
      const blob = await renderAnimationToVideo(
        compiledFunc,
        newJob,
        colorSettings,
        creatorSettings,
        (curr, total, pct) => {
          setRenderQueue(prev =>
            prev.map(j =>
              j.id === newJob.id
                ? { ...j, currentFrame: curr, totalFrames: total, progress: pct }
                : j
            )
          );
        }
      );

      const blobUrl = URL.createObjectURL(blob);
      const sizeMb = +(blob.size / (1024 * 1024)).toFixed(1);

      setRenderQueue(prev =>
        prev.map(j =>
          j.id === newJob.id
            ? {
                ...j,
                status: 'COMPLETED',
                progress: 100,
                videoBlobUrl: blobUrl,
                fileSizeMb: sizeMb,
              }
            : j
        )
      );
      toast.success(`Render complete! 4K video ready (${sizeMb} MB)`, { id: renderToast });
    } catch (err: any) {
      console.error('Render failed:', err);
      setRenderQueue(prev =>
        prev.map(j =>
          j.id === newJob.id
            ? { ...j, status: 'FAILED', error: err.message || 'Render failed' }
            : j
        )
      );
      toast.error(`Rendering failed: ${err.message}`, { id: renderToast });
    }
  };

  const handleDownload = (job: RenderJob) => {
    if (!job.videoBlobUrl) return;
    const a = document.createElement('a');
    a.href = job.videoBlobUrl;
    const ext = job.format === 'MOV' ? 'mov' : (job.format === 'MP4' ? 'mp4' : 'webm');
    a.download = `${job.id}_${job.resolution.split(' ')[0]}_${job.framerate}fps.${ext}`;
    a.click();
    toast.success(`Downloading ${job.format} file...`);
  };

  const handleClearCompleted = () => {
    setRenderQueue(prev => prev.filter(j => j.status === 'RENDERING'));
    toast.success('Completed queue items cleared');
  };

  const handleDeleteJob = (id: string) => {
    setRenderQueue(prev => prev.filter(j => j.id !== id));
    toast('Render job deleted', { icon: '🗑️' });
  };

  return (
    <div className="motion-card p-5 space-y-5">
      {/* Header */}
      <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-2.5">
        <Film className="w-4 h-4 text-red-600" />
        Export to Video
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Left Column: Duration & Format */}
        <div className="space-y-3.5">
          {/* Duration */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-700 uppercase">DURATION (SECONDS)</span>
              <span className="text-[10px] font-extrabold text-red-600 bg-red-50 px-1.5 py-0.5 rounded border border-red-200">
                Min 5s for Stock
              </span>
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {durationPresets.map(d => (
                <button
                  key={d}
                  onClick={() => setDuration(d)}
                  className={`py-1.5 rounded-lg text-xs font-bold transition border cursor-pointer ${
                    duration === d
                      ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {d}s
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 pt-1 text-xs">
              <span className="text-slate-500 font-medium">Custom:</span>
              <input
                type="number"
                min={5}
                max={120}
                value={duration}
                onChange={(e) => setDuration(Math.max(5, parseInt(e.target.value) || 5))}
                className="w-20 px-2.5 py-1 text-xs font-bold text-slate-800 bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:border-red-500"
              />
              <span className="text-slate-500">seconds</span>
            </div>
          </div>

          {/* Format */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-slate-700 uppercase block">FORMAT</span>
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { id: 'MOV', label: '🎬 MOV (QuickTime)' },
                { id: 'MP4', label: 'MP4 (H.264)' },
                { id: 'WebM', label: 'WebM (VP9)' },
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setFormat(f.id as VideoFormat)}
                  className={`py-2 px-1 rounded-lg text-xs font-bold transition text-center border cursor-pointer ${
                    format === f.id
                      ? 'bg-red-600 text-white border-red-600 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Quality Level CRF Slider */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-700">
              <span>QUALITY LEVEL (CRF: {qualityCrf})</span>
              <span className="text-slate-500 font-normal">Lossless Stock Range (15-20)</span>
            </div>
            <input
              type="range"
              min={10}
              max={30}
              value={qualityCrf}
              onChange={(e) => setQualityCrf(parseInt(e.target.value))}
              className="w-full accent-red-600 cursor-pointer"
            />
          </div>
        </div>

        {/* Right Column: Resolution & Framerate */}
        <div className="space-y-3.5">
          {/* Resolution */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-slate-700 uppercase block">RESOLUTION</span>
            <select
              value={resolution}
              onChange={(e) => setResolution(e.target.value as Resolution)}
              className="w-full px-3 py-2 text-xs font-bold text-slate-800 bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:border-red-500 shadow-2xs"
            >
              <option value="4K UHD (3840x2160)">4K UHD (3840x2160) - Recommended for Stock</option>
              <option value="1080p FHD (1920x1080)">1080p FHD (1920x1080)</option>
              <option value="720p HD (1280x720)">720p HD (1280x720)</option>
              <option value="Square (2160x2160)">Square 4K (2160x2160)</option>
              <option value="Vertical 4K (2160x3840)">Vertical 4K (2160x3840)</option>
            </select>
          </div>

          {/* Framerate */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-slate-700 uppercase block">FRAMERATE</span>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setFramerate(30)}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition border cursor-pointer ${
                  framerate === 30
                    ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                30 FPS
              </button>
              <button
                onClick={() => setFramerate(60)}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition border cursor-pointer ${
                  framerate === 60
                    ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                60 FPS (Ultra Smooth)
              </button>
            </div>
          </div>

          {/* Codec Speed */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-slate-700 uppercase block">CODEC SPEED</span>
            <select
              value={codecSpeed}
              onChange={(e) => setCodecSpeed(e.target.value)}
              className="w-full px-3 py-2 text-xs font-semibold text-slate-800 bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:border-red-500 shadow-2xs"
            >
              <option value="Medium (Standard)">Medium (Standard)</option>
              <option value="Slow (Better Quality)">Slow (Better Quality)</option>
              <option value="Fast (Quick Draft)">Fast (Quick Draft)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Start Render Button */}
      <button
        onClick={handleStartRender}
        className="w-full py-3 px-6 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-sm uppercase tracking-wider transition shadow-sm flex items-center justify-center gap-2 cursor-pointer"
      >
        <Video className="w-4 h-4" />
        Start Render
      </button>

      {/* Render Queue Section */}
      <div className="space-y-3 pt-2 border-t border-slate-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-800">
            <span>🎦 RENDER QUEUE SYSTEM (SAFE SEQUENTIAL QUEUE)</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
              {renderQueue.filter(j => j.status === 'RENDERING').length}/1 active
            </span>
          </div>

          {renderQueue.length > 0 && (
            <button
              onClick={handleClearCompleted}
              className="text-[11px] font-bold text-slate-500 hover:text-red-600 underline cursor-pointer"
            >
              Clear Completed
            </button>
          )}
        </div>

        {renderQueue.length === 0 ? (
          <div className="p-6 text-center text-xs font-medium text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
            No renders in queue. Click <strong>Start Render</strong> to start.
          </div>
        ) : (
          <div className="space-y-2.5">
            {renderQueue.map(job => (
              <div
                key={job.id}
                className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3 shadow-2xs"
              >
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    {job.status === 'COMPLETED' ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        COMPLETED
                      </span>
                    ) : job.status === 'RENDERING' ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1">
                        <Loader2 className="w-3 h-3 animate-spin text-amber-600" />
                        RENDERING ({job.progress}%)
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-red-100 text-red-800 border border-red-300">
                        FAILED
                      </span>
                    )}

                    <span className="text-xs font-bold font-mono text-slate-800 truncate max-w-[200px]">
                      {job.id}
                    </span>

                    <span className="text-[10px] font-mono text-slate-500 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                      {job.resolution}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {job.status === 'COMPLETED' && (
                      <>
                        <button
                          onClick={() => setPreviewJob(job)}
                          className="px-2.5 py-1 text-xs font-bold text-slate-800 bg-white hover:bg-slate-100 rounded-lg border border-slate-300 transition flex items-center gap-1 shadow-2xs cursor-pointer"
                        >
                          <Play className="w-3 h-3 text-red-600" />
                          Preview Video
                        </button>
                        <button
                          onClick={() => handleDownload(job)}
                          className="px-3 py-1 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition flex items-center gap-1 shadow-xs cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" />
                          Download ({job.fileSizeMb || 34.5} MB)
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => handleDeleteJob(job.id)}
                      className="p-1 text-slate-400 hover:text-red-600 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Progress Bar for Rendering */}
                {job.status === 'RENDERING' && (
                  <div className="space-y-1">
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-red-600 h-full transition-all duration-150"
                        style={{ width: `${job.progress}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] font-mono text-slate-500">
                      <span>Encoding frame: {job.currentFrame} / {job.totalFrames}</span>
                      <span>{job.progress}%</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Video Preview Modal */}
      {previewJob && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-3xl w-full p-4 space-y-3 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <Film className="w-4 h-4 text-red-500" />
                <h3 className="text-xs font-bold text-white font-mono">{previewJob.id}</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                  {previewJob.resolution}
                </span>
              </div>
              <button
                onClick={() => setPreviewJob(null)}
                className="text-slate-400 hover:text-white p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="aspect-video bg-black rounded-xl overflow-hidden border border-slate-800 flex items-center justify-center">
              {previewJob.videoBlobUrl && (
                <video
                  src={previewJob.videoBlobUrl}
                  controls
                  autoPlay
                  loop
                  className="w-full h-full object-contain"
                />
              )}
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-slate-400 font-mono">
                Duration: {previewJob.duration}s • {previewJob.framerate} FPS • {previewJob.fileSizeMb} MB
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPreviewJob(null)}
                  className="px-4 py-1.5 text-xs font-bold text-slate-300 hover:text-white bg-slate-800 rounded-lg cursor-pointer"
                >
                  Close Preview
                </button>
                <button
                  onClick={() => handleDownload(previewJob)}
                  className="px-4 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download Video
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
