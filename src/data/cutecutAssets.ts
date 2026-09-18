export interface CuteCutAudioItem {
  id: string;
  name: string;
  category: string;
  duration: number; // in seconds
  durationFormatted: string;
  url: string;
}
export type CapCutAudioItem = CuteCutAudioItem;

export interface CuteCutStickerItem {
  id: string;
  name: string;
  category: 'trending' | 'islamic' | 'social' | 'emoji' | 'emphasis' | 'arrows' | 'celebration';
  emoji: string;
}
export type CapCutStickerItem = CuteCutStickerItem;

export interface CuteCutEffectItem {
  id: string;
  name: string;
  category: 'trending' | 'spiritual' | 'particles' | 'opening' | 'lens' | 'retro' | 'party' | 'glitch';
  icon: string;
  color: string;
  description: string;
}
export type CapCutEffectItem = CuteCutEffectItem;

export interface CuteCutTransitionItem {
  id: string;
  name: string;
  category: 'trending' | 'spiritual' | 'basic' | 'overlay' | 'light' | 'camera' | '3d';
  icon: string;
}
export type CapCutTransitionItem = CuteCutTransitionItem;

export interface CuteCutFilterItem {
  id: string;
  name: string;
  category: 'featured' | 'islamic' | 'cinematic' | 'life' | 'scenery' | 'movie' | 'retro' | 'night';
  previewColor: string;
  settings: {
    brightness?: number;
    contrast?: number;
    saturation?: number;
    sepia?: number;
  };
}
export type CapCutFilterItem = CuteCutFilterItem;

// Audio tracks directly from the CapCut video (at 0:08 and 1:25 - 1:36)
export const CAPCUT_AUDIO_TRACKS: CapCutAudioItem[] = [
  {
    id: 'cc-audio-summer-vlog',
    name: 'Summer Vlog',
    category: 'Trending',
    duration: 65,
    durationFormatted: '01:05',
    url: 'https://assets.mixkit.co/music/preview/mixkit-summer-fun-13.mp3',
  },
  {
    id: 'cc-audio-playful-beauty',
    name: 'Playful Beauty Lifestyle House',
    category: 'Trending',
    duration: 124,
    durationFormatted: '02:04',
    url: 'https://assets.mixkit.co/music/preview/mixkit-tech-house-vibes-130.mp3',
  },
  {
    id: 'cc-audio-tokyo-train',
    name: 'Tokyo Train Station BGM',
    category: 'Travel',
    duration: 92,
    durationFormatted: '01:32',
    url: 'https://assets.mixkit.co/music/preview/mixkit-raising-me-higher-34.mp3',
  },
  {
    id: 'cc-audio-coconut-groove',
    name: 'Coconut Groove',
    category: 'Summer',
    duration: 110,
    durationFormatted: '01:50',
    url: 'https://assets.mixkit.co/music/preview/mixkit-groovy-hip-hop-107.mp3',
  },
  {
    id: 'cc-audio-energetic-beach',
    name: 'Energetic Beach Workout House',
    category: 'Beat',
    duration: 88,
    durationFormatted: '01:28',
    url: 'https://assets.mixkit.co/music/preview/mixkit-energetic-hip-hop-834.mp3',
  },
  {
    id: 'cc-audio-lounge-bar',
    name: 'Lounge Bar Groove',
    category: 'Lo-fi',
    duration: 140,
    durationFormatted: '02:20',
    url: 'https://assets.mixkit.co/music/preview/mixkit-chill-bro-494.mp3',
  },
  {
    id: 'cc-audio-morning-coffee',
    name: 'Morning Coffee Acoustic',
    category: 'Vlog',
    duration: 75,
    durationFormatted: '01:15',
    url: 'https://assets.mixkit.co/music/preview/mixkit-acoustic-guitars-ambient-uplift-29.mp3',
  },
  {
    id: 'cc-audio-pop-dance',
    name: 'Neon Pop Dance Glow',
    category: 'Pop',
    duration: 105,
    durationFormatted: '01:45',
    url: 'https://assets.mixkit.co/music/preview/mixkit-dance-with-me-3.mp3',
  },
  // Spiritual Ambience & Nature Tracks
  {
    id: 'cc-audio-gentle-rain',
    name: 'Gentle Rain & Calm Ambience',
    category: 'Spiritual',
    duration: 120,
    durationFormatted: '02:00',
    url: 'https://cdn.freesound.org/previews/518/518887_6142149-lq.mp3',
  },
  {
    id: 'cc-audio-fajr-birds',
    name: 'Fajr Dawn Birds & Soft Breeze',
    category: 'Spiritual',
    duration: 90,
    durationFormatted: '01:30',
    url: 'https://cdn.freesound.org/previews/531/531947_7037-lq.mp3',
  },
  {
    id: 'cc-audio-makkah-night',
    name: 'Haramain Night Peaceful Wind Ambience',
    category: 'Spiritual',
    duration: 110,
    durationFormatted: '01:50',
    url: 'https://cdn.freesound.org/previews/612/612249_11861866-lq.mp3',
  },
  {
    id: 'cc-audio-meditative-drone',
    name: 'Deep Reverent Drone Ambiance',
    category: 'Spiritual',
    duration: 135,
    durationFormatted: '02:15',
    url: 'https://assets.mixkit.co/music/preview/mixkit-serene-view-443.mp3',
  },
];

// Stickers from CapCut video (at 0:15 - 0:18)
export const CAPCUT_STICKERS: CapCutStickerItem[] = [
  // Islamic & Sacred Stickers
  { id: 'st-kaaba', name: 'Kaaba Sharif', category: 'islamic', emoji: '🕋' },
  { id: 'st-mosque', name: 'Al-Masjid An-Nabawi', category: 'islamic', emoji: '🕌' },
  { id: 'st-crescent', name: 'Hilal Moon & Star', category: 'islamic', emoji: '🌙' },
  { id: 'st-tasbih', name: 'Tasbih Beads', category: 'islamic', emoji: '📿' },
  { id: 'st-lantern', name: 'Fanous Lantern', category: 'islamic', emoji: '🏮' },
  { id: 'st-quran', name: 'Holy Quran Book', category: 'islamic', emoji: '📖' },
  { id: 'st-dua', name: 'Dua Hands 🤲', category: 'islamic', emoji: '🤲' },
  { id: 'st-ayah-1', name: 'Ayah 1 Medallion ﴿١﴾', category: 'islamic', emoji: '﴿١﴾' },
  { id: 'st-ayah-2', name: 'Ayah 2 Medallion ﴿٢﴾', category: 'islamic', emoji: '﴿٢﴾' },
  { id: 'st-ayah-3', name: 'Ayah 3 Medallion ﴿٣﴾', category: 'islamic', emoji: '﴿٣﴾' },
  { id: 'st-ayah-4', name: 'Ayah 4 Medallion ﴿٤﴾', category: 'islamic', emoji: '﴿٤﴾' },
  { id: 'st-peace-dove', name: 'Peaceful White Dove', category: 'islamic', emoji: '🕊️' },

  // Social Engagement Stickers
  { id: 'st-sub-bell', name: 'Subscribe & Bell', category: 'social', emoji: '🔔' },
  { id: 'st-like-heart', name: 'Like Post ❤️', category: 'social', emoji: '💖' },
  { id: 'st-share-loop', name: 'Share Reel 🔁', category: 'social', emoji: '🔁' },
  { id: 'st-bookmark', name: 'Save Ayah 🔖', category: 'social', emoji: '🔖' },
  { id: 'st-speaker', name: 'Sound On 🔊', category: 'social', emoji: '🔊' },

  // Trending
  { id: 'st-fire', name: 'Trending Fire', category: 'trending', emoji: '🔥' },
  { id: 'st-sparkles', name: 'Magic Sparkles', category: 'trending', emoji: '✨' },
  { id: 'st-star', name: 'Golden Star', category: 'trending', emoji: '⭐' },
  { id: 'st-100', name: 'Hundred Percent', category: 'trending', emoji: '💯' },
  { id: 'st-rocket', name: 'Viral Rocket', category: 'trending', emoji: '🚀' },
  { id: 'st-heart', name: 'Red Heart', category: 'emoji', emoji: '❤️' },
  { id: 'st-laugh', name: 'Joy Laugh', category: 'emoji', emoji: '😂' },
  { id: 'st-cool', name: 'Sunglasses Cool', category: 'emoji', emoji: '😎' },
  { id: 'st-fire-eyes', name: 'Heart Eyes', category: 'emoji', emoji: '😍' },
  { id: 'st-bell', name: 'Subscribe Bell', category: 'emphasis', emoji: '🔔' },
  { id: 'st-target', name: 'Target Bullseye', category: 'emphasis', emoji: '🎯' },
  { id: 'st-warn', name: 'Attention Alert', category: 'emphasis', emoji: '⚠️' },
  { id: 'st-arrow-r', name: 'Arrow Right', category: 'arrows', emoji: '➡️' },
  { id: 'st-arrow-l', name: 'Arrow Left', category: 'arrows', emoji: '⬅️' },
  { id: 'st-arrow-u', name: 'Arrow Up', category: 'arrows', emoji: '⬆️' },
  { id: 'st-arrow-d', name: 'Arrow Down', category: 'arrows', emoji: '⬇️' },
  { id: 'st-party', name: 'Party Popper', category: 'celebration', emoji: '🎉' },
  { id: 'st-crown', name: 'Gold Crown', category: 'celebration', emoji: '👑' },
  { id: 'st-trophy', name: 'Winner Trophy', category: 'celebration', emoji: '🏆' },
];

// Effects from CapCut video (at 0:20 - 0:24)
export const CAPCUT_EFFECTS: CapCutEffectItem[] = [
  // Spiritual & Cinematic Noor Effects
  { id: 'eff-golden-dust', name: 'Floating Golden Dust', category: 'spiritual', icon: '✨', color: '#f59e0b', description: 'Cinematic floating golden particles and bokeh' },
  { id: 'eff-noor-rays', name: 'Divine Noor Rays', category: 'spiritual', icon: '☀️', color: '#fef08a', description: 'Sunbeams and divine ray illumination' },
  { id: 'eff-dreamy-glow', name: 'Angelic Soft Glow', category: 'spiritual', icon: '🌟', color: '#38bdf8', description: 'Luminous edge halo and soft diffusion' },
  { id: 'eff-midnight-haze', name: 'Midnight Kaaba Haze', category: 'spiritual', icon: '🌙', color: '#c084fc', description: 'Deep nocturnal atmosphere with subtle mist' },
  { id: 'eff-floating-stars', name: 'Cosmic Floating Stars', category: 'particles', icon: '⭐', color: '#fbbf24', description: 'Gently twinkling cosmic night sparks' },
  { id: 'eff-rain-shimmer', name: 'Rain Drop Shimmer', category: 'particles', icon: '💧', color: '#67e8f9', description: 'Micro water drops reflecting soft light' },

  // Trending & Opening
  { id: 'eff-opening-art', name: 'Opening Art', category: 'opening', icon: '🎭', color: '#06b6d4', description: 'Cinematic art curtains opening' },
  { id: 'eff-vertical-open', name: 'Vertical Open', category: 'opening', icon: '↕️', color: '#3b82f6', description: 'Split vertical shutter opening' },
  { id: 'eff-prickle-warp', name: 'Prickle + Warp', category: 'trending', icon: '🌀', color: '#a855f7', description: 'Dynamic lens warp distortion' },
  { id: 'eff-flower-drop', name: 'Flower Drop', category: 'trending', icon: '🌸', color: '#ec4899', description: 'Floating petals visual ambiance' },
  { id: 'eff-halos', name: 'Halos', category: 'lens', icon: '💫', color: '#facc15', description: 'Anamorphic golden halo light' },
  { id: 'eff-heaven-light', name: 'Heaven Light', category: 'lens', icon: '✨', color: '#e0f2fe', description: 'Ethereal ray streaks' },
  { id: 'eff-war-arcade', name: 'War Arcade', category: 'retro', icon: '👾', color: '#f97316', description: 'Pixel 8-bit retro arcade vibe' },
  { id: 'eff-ember-veil', name: 'Ember Veil', category: 'party', icon: '🔥', color: '#ef4444', description: 'Floating cinematic embers and sparks' },
  { id: 'eff-crystal-wave', name: 'Crystal Wave', category: 'party', icon: '💎', color: '#06b6d4', description: 'Prismatic crystal refraction' },
  { id: 'eff-vision-grip', name: 'Vision Grip', category: 'trending', icon: '👁️', color: '#10b981', description: 'High-contrast edge surveillance' },
  { id: 'eff-vhs-glitch', name: 'VHS Glitch', category: 'glitch', icon: '📼', color: '#8b5cf6', description: 'Analog magnetic tape distortion' },
  { id: 'eff-film-grain', name: 'Film Grain 35mm', category: 'retro', icon: '🎞️', color: '#71717a', description: 'Organic silver halide grain' },
];

// Transitions from CapCut video (at 0:25 - 0:29)
export const CAPCUT_TRANSITIONS: CapCutTransitionItem[] = [
  // Spiritual Transitions
  { id: 'trans-light-flash', name: 'Noor Light Flash', category: 'spiritual', icon: '✨' },
  { id: 'trans-smoke-dissolve', name: 'Golden Smoke Wipe', category: 'spiritual', icon: '💨' },
  { id: 'trans-gentle-fade', name: 'Spiritual Cross-Dissolve', category: 'spiritual', icon: '🕊️' },
  { id: 'trans-whip-blur', name: 'Smooth Whip Blur', category: 'spiritual', icon: '⚡' },

  // Standard
  { id: 'trans-overlap-fade', name: 'Overlap Fade', category: 'trending', icon: '🔀' },
  { id: 'trans-compartment', name: 'Compartment 2', category: 'trending', icon: '🪟' },
  { id: 'trans-paper-unfold', name: 'Paper Unfold', category: 'trending', icon: '📜' },
  { id: 'trans-fur-spread', name: 'Fur Spread', category: 'trending', icon: '🦚' },
  { id: 'trans-slide-left', name: 'Left Slide', category: 'basic', icon: '⬅️' },
  { id: 'trans-slide-right', name: 'Right Slide', category: 'basic', icon: '➡️' },
  { id: 'trans-push-up', name: 'Push Up', category: 'basic', icon: '⬆️' },
  { id: 'trans-clock-wipe', name: 'Clock Wipe', category: 'basic', icon: '🕒' },
  { id: 'trans-cross-dissolve', name: 'Cross Dissolve', category: 'overlay', icon: '🌫️' },
  { id: 'trans-light-leak', name: 'Light Leak Flash', category: 'light', icon: '⚡' },
  { id: 'trans-zoom-in', name: 'Zoom In 3D', category: 'camera', icon: '🔎' },
  { id: 'trans-flip-3d', name: 'Flip 3D', category: '3d', icon: '🔄' },
];

// Filters from CapCut video (at 0:36 - 0:42)
export const CAPCUT_FILTERS: CapCutFilterItem[] = [
  // Islamic & Sacred Looks
  { id: 'filt-madinah-green', name: 'Madinah Green', category: 'islamic', previewColor: '#059669', settings: { brightness: 104, contrast: 112, saturation: 125, sepia: 8 } },
  { id: 'filt-makkah-gold', name: 'Makkah Midnight Gold', category: 'islamic', previewColor: '#d97706', settings: { brightness: 102, contrast: 120, saturation: 118, sepia: 32 } },
  { id: 'filt-desert-warmth', name: 'Desert Sunset', category: 'islamic', previewColor: '#ea580c', settings: { brightness: 105, contrast: 108, saturation: 130, sepia: 28 } },
  { id: 'filt-moody-desat', name: 'Moody Quranic Muted', category: 'cinematic', previewColor: '#475569', settings: { brightness: 98, contrast: 115, saturation: 75, sepia: 12 } },
  { id: 'filt-sunset-teal-amber', name: 'Teal & Sunset Amber', category: 'cinematic', previewColor: '#0f766e', settings: { brightness: 100, contrast: 122, saturation: 120, sepia: 18 } },

  // Standard
  { id: 'filt-clean-vivid', name: 'Clean Vivid', category: 'featured', previewColor: '#38bdf8', settings: { brightness: 105, contrast: 110, saturation: 120 } },
  { id: 'filt-caramel-warm', name: 'Caramel Warm', category: 'featured', previewColor: '#f59e0b', settings: { brightness: 100, contrast: 105, saturation: 110, sepia: 25 } },
  { id: 'filt-cinematic-teal', name: 'Cinematic Teal', category: 'movie', previewColor: '#0d9488', settings: { brightness: 98, contrast: 118, saturation: 115 } },
  { id: 'filt-retro-90s', name: 'Retro 90s', category: 'retro', previewColor: '#d97706', settings: { brightness: 102, contrast: 112, saturation: 90, sepia: 40 } },
  { id: 'filt-nordic-chill', name: 'Nordic Chill', category: 'scenery', previewColor: '#60a5fa', settings: { brightness: 104, contrast: 100, saturation: 85 } },
  { id: 'filt-tokyo-night', name: 'Tokyo Night', category: 'night', previewColor: '#818cf8', settings: { brightness: 95, contrast: 125, saturation: 130 } },
  { id: 'filt-fresh-life', name: 'Fresh Life', category: 'life', previewColor: '#34d399', settings: { brightness: 106, contrast: 105, saturation: 115 } },
];
