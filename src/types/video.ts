import { QuranAlignmentDiagnostics, QuranWordAlignment } from './quranAlignment';

export type VideoLayout = 'centered-quran' | 'cinematic' | 'social-vertical' | 'landscape';

export interface VideoResolution {
  width: number;
  height: number;
  label: string;
}

export const RESOLUTIONS: Record<string, VideoResolution> = {
  '1080p': { width: 1920, height: 1080, label: 'Full HD (16:9)' },
  '720p': { width: 1280, height: 720, label: 'HD (16:9)' },
  'vertical': { width: 1080, height: 1920, label: 'Social Vertical (9:16)' },
  '4k': { width: 3840, height: 2160, label: 'Ultra HD (16:9)' },
};

export interface HighlightMode {
  type: 'ayah' | 'word' | 'progressive' | 'static';
}

export interface RenderScene {
  sceneId: string;
  verseKey: string;
  startTime: number; // in seconds
  endTime: number;   // in seconds
  arabicText: string;
  translation?: string;
  words?: QuranWordAlignment[];
  highlightMode: HighlightMode;
  layout: VideoLayout;
  backgroundAsset?: string; // URL or local path
  backgroundType: 'color' | 'image' | 'video';
  transition?: {
    type: 'cut' | 'fade' | 'crossfade';
    duration: number;
  };
}

export interface RenderTimeline {
  projectId: string;
  scenes: RenderScene[];
  audioSource: string; // URL or local path
  totalDuration: number;
  resolution: VideoResolution;
  fps: number;
  metadata: {
    surahName?: string;
    qariName?: string;
    alignmentMode?: string;
    providerId?: string;
  };
}

export interface RenderManifest {
  renderId: string;
  projectId: string;
  status: 'pending' | 'rendering' | 'completed' | 'failed' | 'cancelled';
  progress: number; // 0-100
  startTime?: number; // timestamp
  endTime?: number;   // timestamp
  outputPath?: string;
  error?: string;
  validationResult?: {
    isValid: boolean;
    checks: Record<string, boolean>;
  };
  config: {
    resolution: VideoResolution;
    fps: number;
    codec: string;
    bitrate: string;
  };
}
