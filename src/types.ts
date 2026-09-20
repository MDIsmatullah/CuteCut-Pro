export enum ClipType {
  VIDEO = 'video',
  AUDIO = 'audio',
  TEXT = 'text',
  EFFECT = 'effect',
  IMAGE = 'image'
}

export interface ColorWheelSetting {
  master: number; // -100 to +100, default 0 (Lift offset, Gamma power, Gain multiplier)
  r: number;      // -100 to +100, default 0
  g: number;      // -100 to +100, default 0
  b: number;      // -100 to +100, default 0
  hue: number;    // 0 to 360 (deg), default 0
  saturation: number; // 0 to 100 (%), default 0
}

export interface ColorGrading {
  enabled: boolean;
  lift: ColorWheelSetting;   // Shadows (blacks)
  gamma: ColorWheelSetting;  // Midtones
  gain: ColorWheelSetting;   // Highlights (whites)
  temperature: number;       // -100 (Cool) to +100 (Warm), default 0
  tint: number;              // -100 (Green) to +100 (Magenta), default 0
}

export interface VideoFilters {
  brightness: number; // 0 to 200, default 100
  contrast: number;   // 0 to 200, default 100
  saturation: number; // 0 to 200, default 100
  grayscale: number;  // 0 to 100, default 0
  sepia: number;      // 0 to 100, default 0
  invert: number;     // 0 to 100, default 0
  hueRotate: number;  // 0 to 360, default 0
  chromaKey: {
    enabled: boolean;
    color: string; // hex string, e.g. "#00ff00"
    threshold: number; // 0 to 100
    smoothness: number; // 0 to 100
  };
  colorGrading?: ColorGrading;
}

export interface Keyframe {
  id: string;
  timestamp: number; // offset in seconds relative to clip start (0 to clip.duration)
  opacity?: number;  // 0.0 to 1.0
  posX?: number;     // -300 to 300 px
  posY?: number;     // -300 to 300 px
  scale?: number;    // 10 to 200 %
  rotation?: number; // 0 to 360 deg
  volume?: number;   // 0.0 to 2.0
}

export interface Clip {
  id: string;
  name: string;
  type: ClipType;
  trackId: string;
  start: number; // In seconds on the timeline
  duration: number; // Duration in seconds in the timeline
  sourceStart: number; // Playback start offset inside the source media (in seconds)
  sourceDuration: number; // Total length of the original resource (in seconds)
  playbackRate: number; // Speed multiplier, e.g., 0.5, 1.0, 2.0, 5.0
  volume: number; // Gain multiplier, e.g. 1.0 (100%)
  peakDb?: number; // Calculated peak audio dBFS level, e.g., -2.4
  opacity?: number; // Opacity 0.0 to 1.0
  keyframes?: Keyframe[]; // Keyframes for property animation at specific timestamps
  
  // Media source parameters
  url?: string; // Video/audio source URL
  poster?: string; // Poster frame or preview image for video clips
  thumbnailUrl?: string; // Thumbnail image for timeline filmstrip & fallback
  fallbackUrl?: string; // Fallback image if video stream is unavailable or buffering
  color?: string; // For text layers (text color) or solid background video clips
  
  // Text specific properties
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  textX?: number; // percentage 0-100
  textY?: number; // percentage 0-100
  textStyle?: 'normal' | 'shadow' | 'outline' | 'neon' | 'gold-glow' | 'viral-reels';
  textTransform?: 'uppercase' | 'none';
  textWrap?: boolean;
  textMaxWidth?: number; // percentage 10-100 of canvas width
  textLineHeight?: number; // multiplier, e.g., 1.2, 1.4
  textAlignment?: 'left' | 'center' | 'right';
  textGlowIntensity?: number; // 0 to 60 px
  textGlowColor?: string;
  textStrokeWidth?: number; // 0 to 20 px
  textStrokeColor?: string;
  textBackgroundColor?: string; // e.g. '#000000', '#ffffff', 'transparent'
  textBackgroundOpacity?: number; // 0.0 to 1.0 (default: 0)
  textBackgroundPadding?: number; // 0 to 40 px
  textBackgroundRadius?: number; // 0 to 40 px
  textBackgroundBlur?: number; // 0 to 20 px
  textBackgroundStyle?: 'none' | 'box' | 'strip' | 'glow';
  confidenceScore?: number; // Tasmeea alignment confidence match ratio (0-100%)
  textAnimation?: TextAnimationConfig;
  captionDisplayMode?: 'full-ayah' | 'single-word';
  singleWordPop?: boolean;
  singleWordScaleMultiplier?: number;
  karaokeHighlight?: boolean | {
    enabled: boolean;
    color?: string;
    intensity?: number;
  };
  karaokeColor?: string;
  syncOffsetMs?: number; // Word-by-word / Karaoke audio synchronization calibration offset in ms
  textLetterSpacing?: number; // Tracking -2 to 30 px
  textGradient?: {
    enabled: boolean;
    style: 'royal-gold' | 'emerald-glow' | 'rose-sunset' | 'silver-moon' | 'sunset-amber';
  };
  text3DShadow?: {
    enabled: boolean;
    blur: number;
    offsetX: number;
    offsetY: number;
    color: string;
  };
  linkedClipId?: string; // Two-Track Anchor Lock: Links Arabic clip and Translation clip together on timeline
  groupId?: string; // Unified Group Container / Compound Clip ID for synchronized selection & movement

  // Quran Ayah Canonical Identity
  surahNumber?: number;
  ayahNumber?: number;
  ayahKey?: string; // e.g., "67:22"
  language?: 'ar' | 'en' | string;
  ayahSymbolPosition?: 'end' | 'start' | 'divider';
  ayahSymbolStyle?: string;
  ayahDigitType?: 'arabic' | 'latin';

  // Video adjustments and filters
  transform?: {
    scale?: number;    // 10 to 200 (%)
    posX?: number;     // -300 to 300 px
    posY?: number;     // -300 to 300 px
    rotation?: number; // 0 to 360 deg
  };
  filters?: VideoFilters;
  isImage?: boolean;
  videoEffects?: {
    vignette?: boolean;
    vignetteIntensity?: number; // 0 to 100
    darkDimmerOverlay?: number; // 0 to 100 (% darkness for background video/image)
    flipHorizontal?: boolean;
    flipVertical?: boolean;
    temperature?: number; // -100 (Cool blue) to +100 (Warm golden)
    kenBurns?: {
      enabled: boolean;
      style: 'zoom-in' | 'zoom-out' | 'pan-left' | 'pan-right';
    };
    rotation3D?: {
      enabled: boolean;
      rotateX: number;
      rotateY: number;
      rotateZ: number;
    };
    filmGrain?: boolean;
    glitch?: boolean;
    shake?: boolean;
    rgbSplit?: boolean;
    blur?: number; // 0 to 20
    relighting?: {
      enabled: boolean;
      style: 'amber-glow' | 'neon-cyan' | 'studio-sunset' | 'quran-gold';
      intensity: number; // 0 to 100
    };
    upscaler4k?: boolean;
    lightLeak?: boolean;
    bokeh?: boolean;
    goldenDust?: boolean;
    noorRays?: boolean;
    floatingStars?: boolean;
    rainShimmer?: boolean;
    dreamyGlow?: boolean;
    transition?: TransitionType | ClipTransition;
    transitionIn?: TransitionType;
    transitionOut?: TransitionType;
    transitionCombo?: TransitionType;
    transitionDuration?: number;
  };
  text3D?: {
    metallicBorder?: boolean;
    dropShadowBlur?: number; // 0 to 50
    depth3D?: number; // 0 to 20
    neonGlowColor?: string;
  };
  speedRamp?: {
    enabled?: boolean;
    preset: 'none' | 'hero' | 'bullet' | 'montage' | 'custom' | 'jump-cut' | 'flash-in' | 'flash-out';
    curve: number[]; // e.g., [1, 2.5, 0.5, 1]
    points?: { x: number; y: number }[]; // Normalized keyframe points: x (0 to 1), y (0.1 to 10.0x)
    smoothSlowMo?: boolean;
    maintainPitch?: boolean;
  };
  subtitleTranslation?: {
    enabled: boolean;
    text: string;
    fontSize?: number;
    color?: string;
  };
  audioEffects?: {
    reverb?: boolean; // Qiraat Hall Echo
    echo?: boolean; // Fast feedback echo
    bassBoost?: boolean; // Low-end frequency boost
    vocalIsolation?: boolean | {
      enabled: boolean;
      vocalGain?: number;
      instrumentalGain?: number;
    };
    voiceEnhancer?: boolean; // Voice Clarity Enhancer
    noiseGateThreshold?: number; // dB threshold, e.g. -40
    mosqueReverb?: {
      enabled: boolean;
      preset: 'haramain-kaaba' | 'grand-mosque' | 'studio-warm';
      wet: number; // 0 to 100
    };
    denoiser?: boolean; // Remove background hiss/hum
    pitchShiftSemitones?: number; // -12 to +12
    stereoPan?: number; // -100 to 100
    spatial8D?: boolean;
    equalizerBands?: number[];
    deReverb?: number;
    autoDucking?: boolean;
  };
  blendMode?: string;
  mask?: {
    type: 'none' | 'split' | 'filmstrip' | 'circle' | 'rectangle' | 'heart' | 'star';
    feather?: number;
    roundness?: number;
    inverted?: boolean;
    size?: number;
    posX?: number;
    posY?: number;
    rotate?: number;
  };
  retouch?: {
    smooth?: number;
    brightEye?: number;
    teethWhite?: number;
    contours?: number;
  };
  audioSettings?: {
    volumeDb?: number;
    fadeIn?: number;
    fadeOut?: number;
    loudnessNorm?: boolean;
    enhanceVoice?: boolean;
    reduceNoise?: boolean;
    fillChannel?: 'dual' | 'left' | 'right';
    voiceFilter?: string;
    voiceCharacter?: string;
    speechToSong?: string;
    pitchShift?: boolean;
  };
  textBubble?: string;
  textEffectPreset?: string;
  transition?: ClipTransition;
}

export type TransitionType =
  | 'none'
  | 'fade'
  | 'fade-in'
  | 'fade-out'
  | 'slide-left'
  | 'slide-right'
  | 'slide-up'
  | 'slide-down'
  | 'slide-out-left'
  | 'slide-out-right'
  | 'dissolve'
  | 'cross-dissolve'
  | 'zoom'
  | 'zoom-in-1'
  | 'zoom-in-2'
  | 'zoom-out'
  | 'zoom-out-1'
  | 'zoom-out-2'
  | 'mini-zoom'
  | 'wipe'
  | 'spin-in'
  | 'spin-out'
  | 'bounce-in'
  | 'shake-in'
  | 'pendulum'
  | 'glitch-in'
  | 'glitch-out'
  | 'pop-up'
  | 'unfold'
  | 'swing'
  | 'rock-vert'
  | 'flash-white'
  | 'wobble'
  | 'heartbeat'
  | 'shake-zoom'
  | 'kinetic-drift'
  | 'wave-warp'
  | 'flip-3d'
  | 'camera-sway';

export interface ClipTransition {
  type?: TransitionType;
  duration?: number; // seconds, default 1.0
  inType?: TransitionType;
  inDuration?: number;
  outType?: TransitionType;
  outDuration?: number;
  comboType?: TransitionType;
  comboSpeed?: number;
}

export interface Track {
  id: string;
  name: string;
  type: ClipType;
  clips: Clip[];
  muted?: boolean;
  locked?: boolean;
  hidden?: boolean;
}

export interface TimelineState {
  tracks: Track[];
  currentTime: number;
  duration: number; // total duration of the timeline in seconds
  zoom: number; // px per second
  selectedClipId: string | null;
  isPlaying: boolean;
  aspectRatio: '16:9' | '9:16' | '1:1';
}

export interface PresetMedia {
  id: string;
  name: string;
  type: 'video' | 'audio' | 'image';
  url: string;
  duration: number;
  thumbnail: string;
  category: string;
  isImage?: boolean;
}

export interface AICaptionRequest {
  transcript: string;
  language: string;
  style: string;
}

export interface AICaptionResponse {
  subtitles: {
    start: number;
    end: number;
    text: string;
  }[];
}

export interface WatermarkSettings {
  enabled: boolean;
  url: string;
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  opacity: number; // 0.1 to 1.0
  scale: number; // 10 to 50 (% of canvas width)
}

export type AyahSymbolStyle = 'ornate-medallion' | 'uthmani-circle' | 'ornate-brackets' | 'parentheses' | 'brackets' | 'none';
export type AyahDigitType = 'arabic' | 'latin';
export type AyahSymbolPosition = 'end' | 'start';

export interface QuranTranslationOption {
  id: string;
  apiId: number | null;
  language: string;
  languageCode: string;
  translator: string;
  direction: 'ltr' | 'rtl';
  defaultFont: string;
  flag: string;
  isPopular?: boolean;
}

export interface VisualStylePreset {
  id: string;
  userId?: string;
  name: string;
  category: 'quranic' | 'viral_reels' | 'cinematic' | 'quranic_calligraphy' | 'caption_style' | 'relighting_effects' | 'full_theme';
  createdAt: string;
  updatedAt: string;
  isFirestoreSynced?: boolean;
  styleConfig: {
    fontFamily?: string;
    fontSize?: number;
    color?: string;
    textStyle?: 'normal' | 'shadow' | 'outline' | 'neon' | 'gold-glow' | 'viral-reels';
    textGlowColor?: string;
    textGlowIntensity?: number;
    textStrokeColor?: string;
    textStrokeWidth?: number;
    text3D?: {
      metallicBorder?: boolean;
      dropShadowBlur?: number;
      depth3D?: number;
      neonGlowColor?: string;
    };
    relightingStyle?: 'amber-glow' | 'neon-cyan' | 'studio-sunset' | 'quran-gold';
    relightingIntensity?: number;
    ayahSymbolStyle?: AyahSymbolStyle;
    watermark?: WatermarkSettings;
  };
}

export type TextAnimationIn =
  | 'none'
  | 'fade'
  | 'pop'
  | 'slide-up'
  | 'slide-down'
  | 'slide-left'
  | 'slide-right'
  | 'typewriter'
  | 'bounce'
  | 'zoom-in'
  | 'glitch';

export type TextAnimationOut =
  | 'none'
  | 'fade'
  | 'zoom-out'
  | 'slide-down'
  | 'slide-up'
  | 'slide-left'
  | 'slide-right';

export type TextAnimationLoop =
  | 'none'
  | 'pulse'
  | 'float'
  | 'shimmer'
  | 'bounce-loop';

export interface TextAnimationConfig {
  inAnimation?: TextAnimationIn;
  inDuration?: number; // In animation duration in seconds (0.1 - 2.0s)
  outAnimation?: TextAnimationOut;
  outDuration?: number; // Out animation duration in seconds (0.1 - 2.0s)
  loopAnimation?: TextAnimationLoop;
}

export interface QuranAlignmentDiagnostics {
  ayahNumber: number;
  predictedStart: number;
  predictedEnd: number;
  duration: number;
  startEvidence: string;
  endEvidence: string;
  acousticScore: number;
  boundaryScore: number;
  transitionScore: number;
  durationPriorScore: number;
  recognitionScore: number;
  globalScore: number;
  confidence: number;
  alignmentMethod: string;
  warnings: string[];
  
  // Real-audio forensics diagnostics
  speechOffsetScore?: number;
  speechOnsetScore?: number;
  silenceDuration?: number;
  silenceBoundaryBoost?: number;
  finalBoundaryScore?: number;
  selectedCandidateReason?: string;
  
  // Legacy mappings
  verseKey: string;
  matchedAudioRange: { start: number; end: number; duration: number };
  matchingScore: number;
  textSimilarityScore: number;
  boundaryConfidence: number;
  boundaryType: string;
  isRepetition?: boolean;
  isLowConfidence?: boolean;
}


