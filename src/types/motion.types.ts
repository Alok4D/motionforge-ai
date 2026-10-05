export type MotionStyle = '3D Cinematic' | '2D Vector' | 'Line Art';
export type AspectRatio = '16:9' | '9:16' | '1:1';
export type VideoFormat = 'MOV' | 'MP4' | 'WebM';
export type Framerate = 30 | 60;
export type Resolution = '4K UHD (3840x2160)' | '1080p FHD (1920x1080)' | '720p HD (1280x720)' | 'Square (2160x2160)' | 'Vertical 4K (2160x3840)';

export interface AnimationTemplate {
  id: string;
  title: string;
  description: string;
  type: 'CANVAS' | 'CSS' | 'SVG' | 'PRESET';
  code: string;
  style: MotionStyle;
  aspectRatio: AspectRatio;
  prompt?: string;
  tags?: string[];
}

export interface RenderJob {
  id: string;
  timestamp: number;
  title: string;
  duration: number; // in seconds
  resolution: Resolution;
  framerate: Framerate;
  format: VideoFormat;
  qualityCrf: number;
  status: 'PENDING' | 'RENDERING' | 'COMPLETED' | 'FAILED';
  progress: number; // 0 to 100
  totalFrames: number;
  currentFrame: number;
  videoBlobUrl?: string;
  fileSizeMb?: number;
  error?: string;
}

export interface ColorCustomizerSettings {
  enabled: boolean;
  chromaBgColor: string; // e.g. #030303 or #00ff00 for green screen
  isGreenScreen: boolean;
  videoElementMode: 'solid' | 'gradient';
  elementColor: string; // e.g. #ff0055
  gradientEndColor?: string;
}

export interface CreatorToolsSettings {
  speed: number; // 0.25, 0.5, 1, 1.5, 2, 3
  audioPreset: 'none' | 'lofi' | 'synthwave' | 'ambient';
  customAudioFile?: File | null;
  customAudioUrl?: string | null;
  watermarkText: string;
}
