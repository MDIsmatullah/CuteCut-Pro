import { PresetMedia } from '../types';

export const STOCK_VIDEOS: PresetMedia[] = [
  // ======================== ISLAMIC & HOLY STOCK ========================
  {
    id: 'vid-makkah-tawaf',
    name: 'Makkah Masjid al-Haram Kaaba Tawaf (Live Video)',
    type: 'video',
    url: '/videos/makkah_tawaf.mp4',
    duration: 25,
    thumbnail: 'https://images.unsplash.com/photo-1591604466107-ec97de577aff?auto=format&fit=crop&w=800&q=80',
    category: 'Islamic & Holy',
    isImage: false
  },
  {
    id: 'vid-makkah-night',
    name: 'Makkah Kaaba at Night Live Ambience',
    type: 'video',
    url: '/videos/makkah_night.mp4',
    duration: 20,
    thumbnail: 'https://images.unsplash.com/photo-1564769625905-50e93615e769?auto=format&fit=crop&w=800&q=80',
    category: 'Islamic & Holy',
    isImage: false
  },
  {
    id: 'vid-makkah-ramadan',
    name: 'Makkah Mukarramah Holy Night Video',
    type: 'video',
    url: '/videos/makkah_ramadan.mp4',
    duration: 20,
    thumbnail: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80',
    category: 'Islamic & Holy',
    isImage: false
  },

  // ======================== NATURE & LANDSCAPES ========================
  {
    id: 'vid-golden-dawn-noor',
    name: 'Golden Sunrise Sunbeams Timelapse (Noor Video)',
    type: 'video',
    url: '/videos/golden_sunrise.mp4',
    duration: 20,
    thumbnail: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
    category: 'Nature & Skies',
    isImage: false
  },
  {
    id: 'vid-floating-clouds-timelapse',
    name: 'Ethereal Floating Clouds Timelapse (Video)',
    type: 'video',
    url: '/videos/floating_clouds.mp4',
    duration: 20,
    thumbnail: 'https://images.unsplash.com/photo-1499346030926-9a72daac6c63?auto=format&fit=crop&w=800&q=80',
    category: 'Nature & Skies',
    isImage: false
  },
  {
    id: 'vid-misty-alpine-peaks',
    name: 'Majestic Alpine Mountains Clouds Timelapse',
    type: 'video',
    url: '/videos/mountain_clouds.mp4',
    duration: 20,
    thumbnail: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80',
    category: 'Nature & Skies',
    isImage: false
  },

  // ======================== RAIN & WATER ========================
  {
    id: 'vid-rain-green-leaves',
    name: 'Gentle Rain Water Ripples (Rahmat Rain Video)',
    type: 'video',
    url: '/videos/rain_water.mp4',
    duration: 16,
    thumbnail: 'https://images.unsplash.com/photo-1519692933481-e162a57d6721?auto=format&fit=crop&w=800&q=80',
    category: 'Rain & Water',
    isImage: false
  },
  {
    id: 'vid-crystal-waterfall',
    name: 'Crystal Clear Forest Waterfall Cascade (Live Video)',
    type: 'video',
    url: '/videos/forest_waterfall.mp4',
    duration: 20,
    thumbnail: 'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?auto=format&fit=crop&w=800&q=80',
    category: 'Rain & Water',
    isImage: false
  },
  {
    id: 'vid-tranquil-ocean-sunset',
    name: 'Calm Turquoise Ocean Sunset Waves (Live Video)',
    type: 'video',
    url: '/videos/ocean_sunset.mp4',
    duration: 20,
    thumbnail: 'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?auto=format&fit=crop&w=800&q=80',
    category: 'Rain & Water',
    isImage: false
  },

  // ======================== COSMIC & STARS ========================
  {
    id: 'vid-milkyway-galaxy',
    name: 'Deep Starry Night & Milky Way Galaxy (Timelapse Video)',
    type: 'video',
    url: '/videos/milkyway_galaxy.mp4',
    duration: 20,
    thumbnail: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=800&q=80',
    category: 'Cosmic & Stars',
    isImage: false
  },
  {
    id: 'vid-moonlit-clouds-night',
    name: '4K Night Stars & Sky Moving Timelapse Video',
    type: 'video',
    url: '/videos/night_stars.mp4',
    duration: 20,
    thumbnail: 'https://images.unsplash.com/photo-1532693322450-2cb5c511067d?auto=format&fit=crop&w=800&q=80',
    category: 'Cosmic & Stars',
    isImage: false
  }
];

export const STOCK_AUDIOS: PresetMedia[] = [
  {
    id: 'audio-fatihah',
    name: 'Quran: Surah Al-Fatihah (Mishary Alafasy)',
    type: 'audio',
    url: 'https://download.quranicaudio.com/quran/mishaari_raashid_al_afasy/001.mp3',
    duration: 44,
    thumbnail: '📖',
    category: 'Quran Recitation'
  },
  {
    id: 'audio-ikhlas',
    name: 'Quran: Surah Al-Ikhlas (Mishary Alafasy)',
    type: 'audio',
    url: 'https://download.quranicaudio.com/quran/mishaari_raashid_al_afasy/112.mp3',
    duration: 21,
    thumbnail: '🕌',
    category: 'Quran Recitation'
  },
  {
    id: 'audio-synthwave',
    name: 'Synthwave Neon Drive',
    type: 'audio',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    duration: 372,
    thumbnail: '🎹',
    category: 'Upbeat'
  },
  {
    id: 'audio-lofi',
    name: 'Sunset Lofi Hip-Hop',
    type: 'audio',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    duration: 425,
    thumbnail: '☕',
    category: 'Chill'
  },
  {
    id: 'audio-cinematic',
    name: 'Orchestral Trailer Sound',
    type: 'audio',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
    duration: 302,
    thumbnail: '🎻',
    category: 'Cinematic'
  },
  {
    id: 'audio-voiceover',
    name: 'Narrator - "In a world..."',
    type: 'audio',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',
    duration: 318,
    thumbnail: '🎙️',
    category: 'Voice'
  }
];

export const STOCK_IMAGES: PresetMedia[] = [
  // Islamic & Holy
  {
    id: 'img-makkah-grand-mosque',
    name: 'Makkah Masjid al-Haram Grand Mosque',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1591604466107-ec97de577aff?auto=format&fit=crop&w=1200&q=80',
    duration: 10,
    thumbnail: 'https://images.unsplash.com/photo-1591604466107-ec97de577aff?auto=format&fit=crop&w=600&q=80',
    category: 'Islamic & Holy'
  },
  {
    id: 'img-madinah-prophet-mosque',
    name: 'Madinah Al-Nabawi Minarets at Sunset',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1564769625905-50e93615e769?auto=format&fit=crop&w=1200&q=80',
    duration: 10,
    thumbnail: 'https://images.unsplash.com/photo-1564769625905-50e93615e769?auto=format&fit=crop&w=600&q=80',
    category: 'Islamic & Holy'
  },
  {
    id: 'img-quran-book-open',
    name: 'Holy Quran Book with Rosary Beads',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1609599006353-e629aaabfeae?auto=format&fit=crop&w=1200&q=80',
    duration: 10,
    thumbnail: 'https://images.unsplash.com/photo-1609599006353-e629aaabfeae?auto=format&fit=crop&w=600&q=80',
    category: 'Islamic & Holy'
  },
  {
    id: 'img-mosque-architecture',
    name: 'Grand Mosque Arches & Pillars',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=80',
    duration: 10,
    thumbnail: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80',
    category: 'Islamic & Holy'
  },

  // Nature & Landscapes
  {
    id: 'img-cinematic-mountains',
    name: 'Cinematic Foggy Mountain Range',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80',
    duration: 10,
    thumbnail: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=600&q=80',
    category: 'Nature & Skies'
  },
  {
    id: 'img-nature-river',
    name: 'Peaceful River Stream',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1433086966358-54859d0ed716?auto=format&fit=crop&w=1200&q=80',
    duration: 10,
    thumbnail: 'https://images.unsplash.com/photo-1433086966358-54859d0ed716?auto=format&fit=crop&w=600&q=80',
    category: 'Nature & Skies'
  },
  {
    id: 'img-sunset-clouds',
    name: 'Golden Sunset Clouds Sky',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
    duration: 10,
    thumbnail: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80',
    category: 'Nature & Skies'
  },
  {
    id: 'img-desert-dunes',
    name: 'Golden Desert Dunes Sunset',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1200&q=80',
    duration: 10,
    thumbnail: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=600&q=80',
    category: 'Nature & Skies'
  },

  // Space & Cosmos
  {
    id: 'img-starry-galaxy',
    name: 'Milky Way Galaxy Night Sky',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1200&q=80',
    duration: 10,
    thumbnail: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=600&q=80',
    category: 'Cosmic & Stars'
  },
  {
    id: 'img-nebula',
    name: 'Deep Space Nebula Colors',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=1200&q=80',
    duration: 10,
    thumbnail: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=600&q=80',
    category: 'Cosmic & Stars'
  },
  {
    id: 'img-dark-gradient',
    name: 'Dark Moody Gradient Background',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1557683311-eac922347aa1?auto=format&fit=crop&w=1200&q=80',
    duration: 10,
    thumbnail: 'https://images.unsplash.com/photo-1557683311-eac922347aa1?auto=format&fit=crop&w=600&q=80',
    category: 'Abstract'
  }
];

export const TEXT_PRESETS = [
  { id: 'text-quran-cinema', name: 'Quran.com Cinema White (QPC Uthmani Hafs)', text: 'صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ', size: 44, color: '#FFFFFF', style: 'shadow', fontFamily: 'QPC Uthmani Hafs', textBackgroundStyle: 'strip' },
  { id: 'text-quran-gold', name: 'Quranic Gold Style', text: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ', size: 48, color: '#F59E0B', style: 'gold-glow', fontFamily: 'QPC Uthmani Hafs' },
  { id: 'text-viral-reels', name: 'Viral Reels Style', text: 'HIGH IMPACT CAPTION', size: 38, color: '#EAB308', style: 'viral-reels', fontFamily: 'Inter' },
  { id: 'text-quran-hafs', name: 'Madinah Quranic Calligraphy (QPC Uthmani Hafs)', text: 'اللَّهُ نُورُ السَّمَاوَاتِ وَالْأَرْضِ', size: 46, color: '#FFFFFF', style: 'shadow', fontFamily: 'QPC Uthmani Hafs' },
  { id: 'text-minimal', name: 'Minimal Header', text: 'EDITORIAL TITLE', size: 40, color: '#FFFFFF', style: 'normal' },
  { id: 'text-neon', name: 'Retro Neon Glow', text: 'NEON WAVE', size: 44, color: '#FF00FF', style: 'neon' },
  { id: 'text-bold-outline', name: 'Outline Impact', text: 'LOUD EDIT', size: 48, color: '#FFFF00', style: 'outline' },
  { id: 'text-subtitle', name: 'Clean Subtitle', text: 'Enter your caption text here...', size: 24, color: '#FFFFFF', style: 'shadow' }
];

export interface ColorGradingPreset {
  id: string;
  name: string;
  category: 'All' | 'Cinematic' | 'Retro' | 'B&W' | 'Stylized';
  description: string;
  gradient: string;
  iconEmoji: string;
  filters: {
    brightness: number;
    contrast: number;
    saturation: number;
    grayscale: number;
    sepia: number;
    invert: number;
    hueRotate: number;
  };
}

export const PRESET_LUTS: ColorGradingPreset[] = [
  {
    id: 'lut-none',
    name: 'Original (Rec.709)',
    category: 'Cinematic',
    description: 'Natural uncompressed camera colors with neutral exposure',
    gradient: 'from-zinc-600 to-zinc-900',
    iconEmoji: '🌿',
    filters: { brightness: 100, contrast: 100, saturation: 100, grayscale: 0, sepia: 0, invert: 0, hueRotate: 0 }
  },
  {
    id: 'lut-cinematic-teal-orange',
    name: 'Cinematic Teal & Orange',
    category: 'Cinematic',
    description: 'Hollywood blockbuster look with warm skin tones and rich teal shadows',
    gradient: 'from-amber-600 via-orange-500 to-cyan-700',
    iconEmoji: '🎬',
    filters: { brightness: 105, contrast: 130, saturation: 125, grayscale: 0, sepia: 15, invert: 0, hueRotate: 345 }
  },
  {
    id: 'lut-vintage-kodak',
    name: 'Retro 35mm Film',
    category: 'Retro',
    description: 'Nostalgic 1970s analog warmth with vintage sepia fade and soft contrast',
    gradient: 'from-amber-700 via-yellow-600 to-stone-800',
    iconEmoji: '📼',
    filters: { brightness: 95, contrast: 90, saturation: 75, grayscale: 0, sepia: 65, invert: 0, hueRotate: 5 }
  },
  {
    id: 'lut-noir-bw',
    name: 'Monochrome Noir (B&W)',
    category: 'B&W',
    description: 'Dramatic high-contrast black & white with deep velvet shadows',
    gradient: 'from-gray-100 via-gray-500 to-black',
    iconEmoji: '🎞️',
    filters: { brightness: 105, contrast: 155, saturation: 0, grayscale: 100, sepia: 0, invert: 0, hueRotate: 0 }
  },
  {
    id: 'lut-cyberpunk',
    name: 'Cyberpunk Neon',
    category: 'Stylized',
    description: 'Electric magenta, vivid neon blues, and hyper-saturated nightlife tones',
    gradient: 'from-pink-500 via-purple-600 to-cyan-500',
    iconEmoji: '🌆',
    filters: { brightness: 110, contrast: 135, saturation: 180, grayscale: 0, sepia: 0, invert: 0, hueRotate: 330 }
  },
  {
    id: 'lut-golden-sunset',
    name: 'Golden Hour Glow',
    category: 'Cinematic',
    description: 'Warm organic sunlight radiance with luminous golden highlights',
    gradient: 'from-yellow-400 via-amber-500 to-red-600',
    iconEmoji: '🌅',
    filters: { brightness: 108, contrast: 115, saturation: 130, grayscale: 0, sepia: 35, invert: 0, hueRotate: 15 }
  },
  {
    id: 'lut-nordic-chill',
    name: 'Nordic Cold Frost',
    category: 'Cinematic',
    description: 'Crisp atmospheric icy blue shadows and chilled Scandinavian mood',
    gradient: 'from-sky-300 via-blue-600 to-slate-900',
    iconEmoji: '❄️',
    filters: { brightness: 98, contrast: 120, saturation: 85, grayscale: 0, sepia: 0, invert: 0, hueRotate: 190 }
  },
  {
    id: 'lut-bleach-bypass',
    name: 'Bleach Bypass Action',
    category: 'Stylized',
    description: 'Desaturated gritty silver retention look popular in action cinema',
    gradient: 'from-stone-400 via-zinc-700 to-slate-900',
    iconEmoji: '⚡',
    filters: { brightness: 100, contrast: 145, saturation: 55, grayscale: 0, sepia: 15, invert: 0, hueRotate: 110 }
  },
  {
    id: 'lut-dreamy-pastel',
    name: 'Dreamy Pastel Fade',
    category: 'Retro',
    description: 'Soft luminous matte highlights and dreamy pastel aesthetic',
    gradient: 'from-rose-300 via-fuchsia-400 to-indigo-400',
    iconEmoji: '🌸',
    filters: { brightness: 120, contrast: 85, saturation: 115, grayscale: 0, sepia: 10, invert: 0, hueRotate: 25 }
  },
  {
    id: 'lut-matrix-green',
    name: 'Emerald Matrix',
    category: 'Stylized',
    description: 'Dystopian digital green cyberspace grade with punchy contrast',
    gradient: 'from-emerald-400 via-green-600 to-black',
    iconEmoji: '🟢',
    filters: { brightness: 100, contrast: 125, saturation: 90, grayscale: 0, sepia: 25, invert: 0, hueRotate: 125 }
  },
  {
    id: 'lut-glitch-vhs',
    name: 'Glitch VHS Chroma',
    category: 'Stylized',
    description: 'Periodic RGB chromatic shift with high contrast analog VHS CRT look',
    gradient: 'from-fuchsia-500 via-cyan-400 to-rose-600',
    iconEmoji: '⚡',
    filters: { brightness: 110, contrast: 140, saturation: 160, grayscale: 0, sepia: 0, invert: 0, hueRotate: 280 }
  }
];
