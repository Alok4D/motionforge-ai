import type { RenderJob, Resolution, ColorCustomizerSettings, CreatorToolsSettings } from '../../types/motion.types';
import * as Mp4Muxer from 'mp4-muxer';

export interface RenderProgressCallback {
  (currentFrame: number, totalFrames: number, progressPercent: number): void;
}

export function parseResolution(res: Resolution): { width: number; height: number } {
  switch (res) {
    case '4K UHD (3840x2160)':
      return { width: 3840, height: 2160 };
    case '1080p FHD (1920x1080)':
      return { width: 1920, height: 1080 };
    case '720p HD (1280x720)':
      return { width: 1280, height: 720 };
    case 'Square (2160x2160)':
      return { width: 2160, height: 2160 };
    case 'Vertical 4K (2160x3840)':
      return { width: 2160, height: 3840 };
    default:
      return { width: 3840, height: 2160 };
  }
}

export async function renderAnimationToVideo(
  renderFunc: Function,
  job: RenderJob,
  colorSettings: ColorCustomizerSettings,
  creatorSettings: CreatorToolsSettings,
  onProgress?: RenderProgressCallback
): Promise<Blob> {
  const { width, height } = parseResolution(job.resolution);
  const fps = job.framerate;
  const duration = Math.max(5, job.duration);
  const totalFrames = Math.round(duration * fps);
  const frameIntervalMs = (1000 / fps) * (creatorSettings.speed || 1);

  // Setup Offscreen / Hidden Canvas
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) throw new Error('Could not create 2D canvas context');

  // Check if WebCodecs VideoEncoder is supported for lossless MP4/MOV
  if (typeof (window as any).VideoEncoder !== 'undefined') {
    return renderWithWebCodecs(
      canvas, ctx, renderFunc, width, height, fps, duration, totalFrames, frameIntervalMs,
      colorSettings, creatorSettings, onProgress
    );
  } else {
    // Fallback using MediaRecorder
    return renderWithMediaRecorder(
      canvas, ctx, renderFunc, width, height, fps, duration, totalFrames, frameIntervalMs,
      colorSettings, creatorSettings, onProgress
    );
  }
}

async function renderWithWebCodecs(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  renderFunc: Function,
  width: number,
  height: number,
  fps: number,
  _duration: number,
  totalFrames: number,
  frameIntervalMs: number,
  colorSettings: ColorCustomizerSettings,
  creatorSettings: CreatorToolsSettings,
  onProgress?: RenderProgressCallback
): Promise<Blob> {
  // Use mp4-muxer for high quality MP4/MOV
  const muxer = new Mp4Muxer.Muxer({
    target: new Mp4Muxer.ArrayBufferTarget(),
    video: {
      codec: 'avc',
      width: width,
      height: height,
    },
    fastStart: 'in-memory',
  });

  let videoEncoder: any;
  const initPromise = new Promise<void>((resolve, reject) => {
    try {
      videoEncoder = new (window as any).VideoEncoder({
        output: (chunk: any, meta: any) => muxer.addVideoChunk(chunk, meta),
        error: (e: any) => reject(e),
      });

      // Avc1 profile calibration for 4K / High Stock Acceptance
      videoEncoder.configure({
        codec: 'avc1.640034', // High Profile Level 5.2 (supports 4K 60fps)
        width: width,
        height: height,
        bitrate: width >= 3840 ? 45_000_000 : 18_000_000, // 45 Mbps for 4K, 18 Mbps for 1080p
        framerate: fps,
      });

      resolve();
    } catch (err) {
      reject(err);
    }
  });

  await initPromise;

  // Frame-by-Frame Sequential Render
  for (let frameIndex = 0; frameIndex < totalFrames; frameIndex++) {
    const timeMs = frameIndex * frameIntervalMs;

    // Render Procedural Frame
    try {
      renderFunc(ctx, width, height, timeMs, colorSettings);
    } catch (drawErr) {
      console.error('Frame render error at frame', frameIndex, drawErr);
    }

    // Optional Watermark Burn-in
    if (creatorSettings.watermarkText?.trim()) {
      ctx.save();
      ctx.font = `bold ${Math.round(width * 0.016)}px sans-serif`;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.textAlign = 'right';
      ctx.fillText(creatorSettings.watermarkText.trim(), width - 30, height - 30);
      ctx.restore();
    }

    // Encode VideoFrame with WebCodecs
    const timestampUs = Math.round((frameIndex / fps) * 1_000_000);
    const frame = new (window as any).VideoFrame(canvas, { timestamp: timestampUs });
    videoEncoder.encode(frame, { keyFrame: frameIndex % (fps * 2) === 0 });
    frame.close();

    if (onProgress) {
      const pct = Math.round(((frameIndex + 1) / totalFrames) * 100);
      onProgress(frameIndex + 1, totalFrames, pct);
    }

    // Give UI event loop time to breathe
    if (frameIndex % 15 === 0) {
      await new Promise(r => setTimeout(r, 0));
    }
  }

  await videoEncoder.flush();
  muxer.finalize();

  const buffer = muxer.target.buffer;
  return new Blob([buffer], { type: 'video/mp4' });
}

async function renderWithMediaRecorder(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  renderFunc: Function,
  width: number,
  height: number,
  fps: number,
  _duration: number,
  totalFrames: number,
  frameIntervalMs: number,
  colorSettings: ColorCustomizerSettings,
  creatorSettings: CreatorToolsSettings,
  onProgress?: RenderProgressCallback
): Promise<Blob> {
  const stream = canvas.captureStream(fps);
  const recorder = new MediaRecorder(stream, {
    mimeType: 'video/webm;codecs=vp9',
    videoBitsPerSecond: 30_000_000
  });

  const chunks: Blob[] = [];
  recorder.ondataavailable = (e) => chunks.push(e.data);

  recorder.start();

  for (let frameIndex = 0; frameIndex < totalFrames; frameIndex++) {
    const timeMs = frameIndex * frameIntervalMs;
    renderFunc(ctx, width, height, timeMs, colorSettings);

    if (creatorSettings.watermarkText?.trim()) {
      ctx.save();
      ctx.font = `bold ${Math.round(width * 0.016)}px sans-serif`;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.textAlign = 'right';
      ctx.fillText(creatorSettings.watermarkText.trim(), width - 30, height - 30);
      ctx.restore();
    }

    if (onProgress) {
      const pct = Math.round(((frameIndex + 1) / totalFrames) * 100);
      onProgress(frameIndex + 1, totalFrames, pct);
    }

    await new Promise(r => setTimeout(r, 1000 / fps));
  }

  recorder.stop();
  await new Promise(r => (recorder.onstop = r));

  return new Blob(chunks, { type: 'video/webm' });
}
