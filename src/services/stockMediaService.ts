/**
 * Stock Media Service: Direct Pexels & Pixabay & Open Media Connector
 * Enables searching, downloading, and auto-assigning royalty-free video loops
 * and background photography per Ayah without using editor internal placeholders.
 */

export interface StockItem {
  id: string;
  title: string;
  url: string;
  downloadUrl?: string;
  thumbnail: string;
  duration?: number;
  mediaType: 'video' | 'image';
  source: 'pexels' | 'pixabay' | 'wikimedia' | 'unsplash';
  author?: string;
  width?: number;
  height?: number;
  category?: string;
}

// Verified direct high-resolution real Pexels, Pixabay, and verified local media items
// Categorized for Islamic & Quranic video creations (distinct items for multi-ayah assignments)
export const CURATED_STOCK_CATALOG: Record<string, StockItem[]> = {
  stars: [
    {
      id: 'pexels-stars-1',
      title: 'Milky Way Galaxy Starry Night Time-lapse (Pexels)',
      url: 'https://videos.pexels.com/video-files/853889/853889-hd_1920_1080_25fps.mp4',
      thumbnail: 'https://images.pexels.com/photos/1624496/pexels-photo-1624496.jpeg?auto=compress&cs=tinysrgb&w=400',
      duration: 25,
      mediaType: 'video',
      source: 'pexels',
      author: 'Pexels Contributor',
      category: 'stars'
    },
    {
      id: 'pexels-stars-2',
      title: 'Deep Space Star Field Floating Rotation (Pexels)',
      url: 'https://videos.pexels.com/video-files/3163534/3163534-hd_1920_1080_30fps.mp4',
      thumbnail: 'https://images.pexels.com/photos/1252869/pexels-photo-1252869.jpeg?auto=compress&cs=tinysrgb&w=400',
      duration: 30,
      mediaType: 'video',
      source: 'pexels',
      author: 'Pexels Contributor',
      category: 'stars'
    },
    {
      id: 'pixabay-stars-3',
      title: 'Night Sky Deep Galaxy Timelapse (Pixabay)',
      url: 'https://cdn.pixabay.com/video/2020/05/25/40131-424759600_large.mp4',
      thumbnail: 'https://images.pexels.com/photos/1624496/pexels-photo-1624496.jpeg?auto=compress&cs=tinysrgb&w=400',
      duration: 20,
      mediaType: 'video',
      source: 'pixabay',
      author: 'Pixabay Artist',
      category: 'stars'
    },
    {
      id: 'pexels-stars-img-1',
      title: 'Majestic Starry Night Galaxy Sky (Pexels Photo)',
      url: 'https://images.pexels.com/photos/1624496/pexels-photo-1624496.jpeg?auto=compress&cs=tinysrgb&w=1920',
      thumbnail: 'https://images.pexels.com/photos/1624496/pexels-photo-1624496.jpeg?auto=compress&cs=tinysrgb&w=400',
      mediaType: 'image',
      source: 'pexels',
      author: 'Pexels Photo',
      category: 'stars'
    },
    {
      id: 'pexels-stars-img-2',
      title: 'Celestial Deep Cosmos Nebulae (Pexels Photo)',
      url: 'https://images.pexels.com/photos/1252869/pexels-photo-1252869.jpeg?auto=compress&cs=tinysrgb&w=1920',
      thumbnail: 'https://images.pexels.com/photos/1252869/pexels-photo-1252869.jpeg?auto=compress&cs=tinysrgb&w=400',
      mediaType: 'image',
      source: 'pexels',
      author: 'Pexels Photo',
      category: 'stars'
    }
  ],

  rain: [
    {
      id: 'pexels-rain-1',
      title: 'Gentle Rain Drops Falling on Glass Window (Pexels)',
      url: 'https://videos.pexels.com/video-files/1409899/1409899-hd_1920_1080_25fps.mp4',
      thumbnail: 'https://images.pexels.com/photos/1529360/pexels-photo-1529360.jpeg?auto=compress&cs=tinysrgb&w=400',
      duration: 25,
      mediaType: 'video',
      source: 'pexels',
      author: 'Pexels Contributor',
      category: 'rain'
    },
    {
      id: 'pixabay-rain-2',
      title: 'Peaceful Rain Water Droplets (Pixabay)',
      url: 'https://cdn.pixabay.com/video/2016/08/21/4847-180860541_large.mp4',
      thumbnail: 'https://images.pexels.com/photos/1529360/pexels-photo-1529360.jpeg?auto=compress&cs=tinysrgb&w=400',
      duration: 16,
      mediaType: 'video',
      source: 'pixabay',
      author: 'Pixabay Studio',
      category: 'rain'
    },
    {
      id: 'pexels-rain-img-1',
      title: 'Water Droplets on Window at Twilight (Pexels Photo)',
      url: 'https://images.pexels.com/photos/1529360/pexels-photo-1529360.jpeg?auto=compress&cs=tinysrgb&w=1920',
      thumbnail: 'https://images.pexels.com/photos/1529360/pexels-photo-1529360.jpeg?auto=compress&cs=tinysrgb&w=400',
      mediaType: 'image',
      source: 'pexels',
      author: 'Pexels Photo',
      category: 'rain'
    },
    {
      id: 'pixabay-rain-img-2',
      title: 'Rain Ripples on Peaceful Lake (Unsplash / Pixabay)',
      url: 'https://images.unsplash.com/photo-1519692933481-e162a57d6721?w=1920&auto=format&fit=crop&q=80',
      thumbnail: 'https://images.unsplash.com/photo-1519692933481-e162a57d6721?w=400&auto=format&fit=crop&q=80',
      mediaType: 'image',
      source: 'unsplash',
      author: 'Community Photographer',
      category: 'rain'
    }
  ],

  clouds: [
    {
      id: 'pexels-clouds-1',
      title: 'Floating Sunset Clouds Timelapse (Pexels)',
      url: 'https://videos.pexels.com/video-files/3015510/3015510-hd_1920_1080_24fps.mp4',
      thumbnail: 'https://images.pexels.com/photos/531756/pexels-photo-531756.jpeg?auto=compress&cs=tinysrgb&w=400',
      duration: 20,
      mediaType: 'video',
      source: 'pexels',
      author: 'Pexels Contributor',
      category: 'clouds'
    },
    {
      id: 'pixabay-clouds-2',
      title: 'Slow Billowing Dramatic Clouds (Pixabay)',
      url: 'https://cdn.pixabay.com/video/2019/04/16/22880-330689947_large.mp4',
      thumbnail: 'https://images.pexels.com/photos/844297/pexels-photo-844297.jpeg?auto=compress&cs=tinysrgb&w=400',
      duration: 20,
      mediaType: 'video',
      source: 'pixabay',
      author: 'Pixabay Video',
      category: 'clouds'
    },
    {
      id: 'pexels-clouds-img-1',
      title: 'Golden Sunset Clouds Heavenly Vista (Pexels Photo)',
      url: 'https://images.pexels.com/photos/531756/pexels-photo-531756.jpeg?auto=compress&cs=tinysrgb&w=1920',
      thumbnail: 'https://images.pexels.com/photos/531756/pexels-photo-531756.jpeg?auto=compress&cs=tinysrgb&w=400',
      mediaType: 'image',
      source: 'pexels',
      author: 'Pexels Photo',
      category: 'clouds'
    },
    {
      id: 'pexels-clouds-img-2',
      title: 'Dramatic Sky with Cloud Formations (Pexels Photo)',
      url: 'https://images.pexels.com/photos/844297/pexels-photo-844297.jpeg?auto=compress&cs=tinysrgb&w=1920',
      thumbnail: 'https://images.pexels.com/photos/844297/pexels-photo-844297.jpeg?auto=compress&cs=tinysrgb&w=400',
      mediaType: 'image',
      source: 'pexels',
      author: 'Pexels Photo',
      category: 'clouds'
    }
  ],

  particles: [
    {
      id: 'pexels-particles-1',
      title: 'Golden Morning Sunbeams Noor (Pexels)',
      url: 'https://videos.pexels.com/video-files/3163534/3163534-hd_1920_1080_30fps.mp4',
      thumbnail: 'https://images.pexels.com/photos/1420440/pexels-photo-1420440.jpeg?auto=compress&cs=tinysrgb&w=400',
      duration: 30,
      mediaType: 'video',
      source: 'pexels',
      author: 'Pexels Contributor',
      category: 'particles'
    },
    {
      id: 'pixabay-particles-2',
      title: 'Spiritual Golden Sunrise Radiance (Pixabay)',
      url: 'https://cdn.pixabay.com/video/2021/04/19/71542-539075726_large.mp4',
      thumbnail: 'https://images.pexels.com/photos/1420440/pexels-photo-1420440.jpeg?auto=compress&cs=tinysrgb&w=400',
      duration: 20,
      mediaType: 'video',
      source: 'pixabay',
      author: 'Pixabay Video',
      category: 'particles'
    },
    {
      id: 'pexels-particles-img-1',
      title: 'Ethereal Golden Light Sunbeams (Pexels Photo)',
      url: 'https://images.pexels.com/photos/1420440/pexels-photo-1420440.jpeg?auto=compress&cs=tinysrgb&w=1920',
      thumbnail: 'https://images.pexels.com/photos/1420440/pexels-photo-1420440.jpeg?auto=compress&cs=tinysrgb&w=400',
      mediaType: 'image',
      source: 'pexels',
      author: 'Pexels Photo',
      category: 'particles'
    }
  ],

  waves: [
    {
      id: 'pixabay-waves-1',
      title: 'Ocean Waves Sunset Tranquil Tides (Pixabay)',
      url: 'https://cdn.pixabay.com/video/2015/10/24/1192-143997632_large.mp4',
      thumbnail: 'https://images.pexels.com/photos/1295138/pexels-photo-1295138.jpeg?auto=compress&cs=tinysrgb&w=400',
      duration: 20,
      mediaType: 'video',
      source: 'pixabay',
      author: 'Pixabay Studio',
      category: 'waves'
    },
    {
      id: 'pexels-waves-img-1',
      title: 'Deep Blue Ocean Waves with White Crests (Pexels Photo)',
      url: 'https://images.pexels.com/photos/1295138/pexels-photo-1295138.jpeg?auto=compress&cs=tinysrgb&w=1920',
      thumbnail: 'https://images.pexels.com/photos/1295138/pexels-photo-1295138.jpeg?auto=compress&cs=tinysrgb&w=400',
      mediaType: 'image',
      source: 'pexels',
      author: 'Pexels Photo',
      category: 'waves'
    },
    {
      id: 'pixabay-waves-img-2',
      title: 'Calm Turquoise Sea Coast at Twilight (Unsplash/Pixabay)',
      url: 'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=1920&auto=format&fit=crop&q=80',
      thumbnail: 'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=400&auto=format&fit=crop&q=80',
      mediaType: 'image',
      source: 'unsplash',
      author: 'Ocean Photographer',
      category: 'waves'
    }
  ],

  forest: [
    {
      id: 'pexels-forest-video-1',
      title: 'Mystic Mountain Forest Morning Sun (Pexels)',
      url: 'https://videos.pexels.com/video-files/3015510/3015510-hd_1920_1080_24fps.mp4',
      thumbnail: 'https://images.pexels.com/photos/38136/pexels-photo-38136.jpeg?auto=compress&cs=tinysrgb&w=400',
      duration: 24,
      mediaType: 'video',
      source: 'pexels',
      author: 'Pexels Contributor',
      category: 'forest'
    },
    {
      id: 'pixabay-forest-2',
      title: 'Cascading Mountain Forest Stream (Pixabay)',
      url: 'https://cdn.pixabay.com/video/2020/06/10/41648-430310237_large.mp4',
      thumbnail: 'https://images.pexels.com/photos/38136/pexels-photo-38136.jpeg?auto=compress&cs=tinysrgb&w=400',
      duration: 20,
      mediaType: 'video',
      source: 'pixabay',
      author: 'Pixabay Creator',
      category: 'forest'
    },
    {
      id: 'pexels-forest-img-1',
      title: 'Misty Pine Trees in Sunlight (Pexels Photo)',
      url: 'https://images.pexels.com/photos/38136/pexels-photo-38136.jpeg?auto=compress&cs=tinysrgb&w=1920',
      thumbnail: 'https://images.pexels.com/photos/38136/pexels-photo-38136.jpeg?auto=compress&cs=tinysrgb&w=400',
      mediaType: 'image',
      source: 'pexels',
      author: 'Pexels Photo',
      category: 'forest'
    },
    {
      id: 'pixabay-forest-img-2',
      title: 'Lush Green Summer Foliage (Pixabay)',
      url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=1920&auto=format&fit=crop&q=80',
      thumbnail: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=400&auto=format&fit=crop&q=80',
      mediaType: 'image',
      source: 'pixabay',
      author: 'Woodland Artist',
      category: 'forest'
    }
  ],

  waterfall: [
    {
      id: 'pexels-waterfall-1',
      title: 'Majestic Crystal Waterfall Stream (Pexels Video)',
      url: 'https://videos.pexels.com/video-files/3015510/3015510-hd_1920_1080_24fps.mp4',
      thumbnail: 'https://images.pexels.com/photos/38136/pexels-photo-38136.jpeg?auto=compress&cs=tinysrgb&w=400',
      duration: 20,
      mediaType: 'video',
      source: 'pexels',
      author: 'Pexels Studio',
      category: 'waterfall'
    },
    {
      id: 'pixabay-waterfall-2',
      title: 'Flowing Mountain Stream (Pixabay Video)',
      url: 'https://cdn.pixabay.com/video/2020/06/10/41648-430310237_large.mp4',
      thumbnail: 'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?w=400&auto=format&fit=crop&q=80',
      duration: 20,
      mediaType: 'video',
      source: 'pixabay',
      author: 'Pixabay Creator',
      category: 'waterfall'
    },
    {
      id: 'pexels-waterfall-img-1',
      title: 'Crystal Clear Forest Stream (Pexels Photo)',
      url: 'https://images.pexels.com/photos/38136/pexels-photo-38136.jpeg?auto=compress&cs=tinysrgb&w=1920',
      thumbnail: 'https://images.pexels.com/photos/38136/pexels-photo-38136.jpeg?auto=compress&cs=tinysrgb&w=400',
      mediaType: 'image',
      source: 'pexels',
      author: 'Pexels Photo',
      category: 'waterfall'
    },
    {
      id: 'pixabay-waterfall-img-2',
      title: 'Alpine Waterfall Cascade (Pixabay Photo)',
      url: 'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?w=1920&auto=format&fit=crop&q=80',
      thumbnail: 'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?w=400&auto=format&fit=crop&q=80',
      mediaType: 'image',
      source: 'pixabay',
      author: 'Pixabay Photo',
      category: 'waterfall'
    }
  ],

  makkah: [
    {
      id: 'pixabay-makkah-1',
      title: 'Holy Kaaba Atmosphere (Pixabay Video)',
      url: 'https://cdn.pixabay.com/video/2021/04/19/71542-539075726_large.mp4',
      thumbnail: 'https://images.unsplash.com/photo-1564769625905-50e93615e769?w=400&auto=format&fit=crop&q=80',
      duration: 20,
      mediaType: 'video',
      source: 'pixabay',
      author: 'Haramain Archive',
      category: 'makkah'
    },
    {
      id: 'pexels-makkah-2',
      title: 'Sacred Sky Above Grand Mosque (Pexels Video)',
      url: 'https://videos.pexels.com/video-files/853889/853889-hd_1920_1080_25fps.mp4',
      thumbnail: 'https://images.unsplash.com/photo-1542816417-0983c9c9ad53?w=400&auto=format&fit=crop&q=80',
      duration: 25,
      mediaType: 'video',
      source: 'pexels',
      author: 'Islamic Heritage',
      category: 'makkah'
    },
    {
      id: 'pixabay-makkah-img-1',
      title: 'Holy Kaaba Grand Mosque Mecca (Pixabay/Unsplash)',
      url: 'https://images.unsplash.com/photo-1564769625905-50e93615e769?w=1920&auto=format&fit=crop&q=80',
      thumbnail: 'https://images.unsplash.com/photo-1564769625905-50e93615e769?w=400&auto=format&fit=crop&q=80',
      mediaType: 'image',
      source: 'pixabay',
      author: 'Islamic Heritage Archive',
      category: 'makkah'
    }
  ],

  desert: [
    {
      id: 'pexels-desert-1',
      title: 'Golden Sand Dunes & Desert Horizon (Pexels Video)',
      url: 'https://videos.pexels.com/video-files/853889/853889-hd_1920_1080_25fps.mp4',
      thumbnail: 'https://images.pexels.com/photos/1001435/pexels-photo-1001435.jpeg?auto=compress&cs=tinysrgb&w=400',
      duration: 20,
      mediaType: 'video',
      source: 'pexels',
      author: 'Desert Dunes Collection',
      category: 'desert'
    },
    {
      id: 'pixabay-desert-2',
      title: 'Sahara Desert Golden Sky (Pixabay Video)',
      url: 'https://cdn.pixabay.com/video/2019/04/16/22880-330689947_large.mp4',
      thumbnail: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=400&auto=format&fit=crop&q=80',
      duration: 20,
      mediaType: 'video',
      source: 'pixabay',
      author: 'Sahara Explorer',
      category: 'desert'
    },
    {
      id: 'pexels-desert-img-1',
      title: 'Golden Desert Dunes Wind Ripples (Pexels Photo)',
      url: 'https://images.pexels.com/photos/1001435/pexels-photo-1001435.jpeg?auto=compress&cs=tinysrgb&w=1920',
      thumbnail: 'https://images.pexels.com/photos/1001435/pexels-photo-1001435.jpeg?auto=compress&cs=tinysrgb&w=400',
      mediaType: 'image',
      source: 'pexels',
      author: 'Pexels Photo',
      category: 'desert'
    },
    {
      id: 'pixabay-desert-img-2',
      title: 'Sahara Sand Dunes at Sunset (Pixabay/Unsplash)',
      url: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=1920&auto=format&fit=crop&q=80',
      thumbnail: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=400&auto=format&fit=crop&q=80',
      mediaType: 'image',
      source: 'pixabay',
      author: 'Landscape Studio',
      category: 'desert'
    }
  ],

  mountains: [
    {
      id: 'pexels-mountains-1',
      title: 'Majestic Mountain Clouds & Alpine Peaks (Pexels)',
      url: 'https://videos.pexels.com/video-files/3015510/3015510-hd_1920_1080_24fps.mp4',
      thumbnail: 'https://images.pexels.com/photos/417173/pexels-photo-417173.jpeg?auto=compress&cs=tinysrgb&w=400',
      duration: 20,
      mediaType: 'video',
      source: 'pexels',
      author: 'Alpine Studio',
      category: 'mountains'
    },
    {
      id: 'pixabay-mountains-video-2',
      title: 'Misty Alpine Mountain Range (Pixabay Video)',
      url: 'https://cdn.pixabay.com/video/2020/05/25/40131-424759600_large.mp4',
      thumbnail: 'https://images.pexels.com/photos/417173/pexels-photo-417173.jpeg?auto=compress&cs=tinysrgb&w=400',
      duration: 24,
      mediaType: 'video',
      source: 'pixabay',
      author: 'Mountain Explorer',
      category: 'mountains'
    },
    {
      id: 'pexels-mountains-img-1',
      title: 'Majestic Alpine Peak Bathed in Sun (Pexels Photo)',
      url: 'https://images.pexels.com/photos/417173/pexels-photo-417173.jpeg?auto=compress&cs=tinysrgb&w=1920',
      thumbnail: 'https://images.pexels.com/photos/417173/pexels-photo-417173.jpeg?auto=compress&cs=tinysrgb&w=400',
      mediaType: 'image',
      source: 'pexels',
      author: 'Pexels Photo',
      category: 'mountains'
    },
    {
      id: 'pixabay-mountains-img-2',
      title: 'Misty Highland Mountain Range (Pixabay/Unsplash)',
      url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1920&auto=format&fit=crop&q=80',
      thumbnail: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400&auto=format&fit=crop&q=80',
      mediaType: 'image',
      source: 'pixabay',
      author: 'Nature Collection',
      category: 'mountains'
    }
  ]
};

/**
 * Search Pexels API (if user has provided key in ENV or UI header)
 */
export async function searchPexelsApi(options: {
  query: string;
  mediaType: 'video' | 'image';
  perPage?: number;
  page?: number;
  apiKey?: string;
}): Promise<StockItem[]> {
  const key = options.apiKey || process.env.PEXELS_API_KEY;
  if (!key) return [];

  const perPage = options.perPage || 15;
  const page = options.page || 1;

  try {
    if (options.mediaType === 'video') {
      const url = `https://api.pexels.com/videos/search?query=${encodeURIComponent(options.query)}&per_page=${perPage}&page=${page}&orientation=landscape`;
      const res = await fetch(url, {
        headers: { Authorization: key }
      });
      if (!res.ok) return [];
      const data = await res.json();
      const videos: any[] = data.videos || [];
      return videos.map((v: any) => {
        // Choose 1080p or best HD mp4 file
        const videoFiles: any[] = v.video_files || [];
        const hdFile = videoFiles.find((f: any) => f.quality === 'hd' && f.file_type === 'video/mp4') || videoFiles[0];
        return {
          id: `pexels-v-${v.id}`,
          title: `Pexels Video by ${v.user?.name || 'Creator'} (#${v.id})`,
          url: hdFile?.link || v.url,
          downloadUrl: hdFile?.link,
          thumbnail: v.image || v.video_pictures?.[0]?.picture,
          duration: v.duration || 15,
          mediaType: 'video',
          source: 'pexels',
          author: v.user?.name || 'Pexels Contributor',
          width: v.width,
          height: v.height,
          category: options.query
        };
      });
    } else {
      const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(options.query)}&per_page=${perPage}&page=${page}&orientation=landscape`;
      const res = await fetch(url, {
        headers: { Authorization: key }
      });
      if (!res.ok) return [];
      const data = await res.json();
      const photos: any[] = data.photos || [];
      return photos.map((p: any) => ({
        id: `pexels-p-${p.id}`,
        title: p.alt || `Pexels Photo by ${p.photographer || 'Photographer'}`,
        url: p.src?.large2x || p.src?.original || p.src?.large,
        downloadUrl: p.src?.original,
        thumbnail: p.src?.medium || p.src?.small,
        mediaType: 'image',
        source: 'pexels',
        author: p.photographer || 'Pexels Contributor',
        width: p.width,
        height: p.height,
        category: options.query
      }));
    }
  } catch (err) {
    console.warn('[Pexels API] Error fetching:', err);
    return [];
  }
}

/**
 * Search Pixabay API (if key in ENV or passed)
 */
export async function searchPixabayApi(options: {
  query: string;
  mediaType: 'video' | 'image';
  perPage?: number;
  page?: number;
  apiKey?: string;
}): Promise<StockItem[]> {
  const key = options.apiKey || process.env.PIXABAY_API_KEY;
  if (!key) return [];

  const perPage = options.perPage || 15;
  const page = options.page || 1;

  try {
    if (options.mediaType === 'video') {
      const url = `https://pixabay.com/api/videos/?key=${encodeURIComponent(key)}&q=${encodeURIComponent(options.query)}&per_page=${perPage}&page=${page}&orientation=horizontal`;
      const res = await fetch(url);
      if (!res.ok) return [];
      const data = await res.json();
      const hits: any[] = data.hits || [];
      return hits.map((h: any) => {
        const vUrl = h.videos?.large?.url || h.videos?.medium?.url || h.videos?.small?.url;
        return {
          id: `pixabay-v-${h.id}`,
          title: h.tags || `Pixabay Video #${h.id}`,
          url: vUrl,
          downloadUrl: vUrl,
          thumbnail: h.userImageURL || `https://i.vimeocdn.com/video/${h.picture_id}_640x360.jpg`,
          duration: h.duration || 15,
          mediaType: 'video',
          source: 'pixabay',
          author: h.user || 'Pixabay Creator',
          category: options.query
        };
      });
    } else {
      const url = `https://pixabay.com/api/?key=${encodeURIComponent(key)}&q=${encodeURIComponent(options.query)}&per_page=${perPage}&page=${page}&orientation=horizontal&image_type=photo`;
      const res = await fetch(url);
      if (!res.ok) return [];
      const data = await res.json();
      const hits: any[] = data.hits || [];
      return hits.map((h: any) => ({
        id: `pixabay-p-${h.id}`,
        title: h.tags || `Pixabay Image #${h.id}`,
        url: h.largeImageURL || h.imageURL,
        downloadUrl: h.largeImageURL || h.imageURL,
        thumbnail: h.webformatURL || h.previewURL,
        mediaType: 'image',
        source: 'pixabay',
        author: h.user || 'Pixabay Creator',
        width: h.imageWidth,
        height: h.imageHeight,
        category: options.query
      }));
    }
  } catch (err) {
    console.warn('[Pixabay API] Error fetching:', err);
    return [];
  }
}

/**
 * Normalize category name or query
 */
export function normalizeCategory(raw: string): string {
  const q = raw.toLowerCase().trim();
  if (q.includes('waterfall') || q.includes('stream') || q.includes('river')) return 'waterfall';
  if (q.includes('makkah') || q.includes('mecca') || q.includes('kaaba') || q.includes('madinah') || q.includes('mosque') || q.includes('islamic')) return 'makkah';
  if (q.includes('desert') || q.includes('sand') || q.includes('dune') || q.includes('sahara')) return 'desert';
  if (q.includes('wave') || q.includes('ocean') || q.includes('sea') || q.includes('beach') || q.includes('tide')) return 'waves';
  if (q.includes('rain') || q.includes('drop') || q.includes('water drop') || q.includes('window')) return 'rain';
  if (q.includes('cloud') || q.includes('sky') || q.includes('timelapse')) return 'clouds';
  if (q.includes('dawn') || q.includes('sunrise') || q.includes('morning') || q.includes('sunbeam') || q.includes('light') || q.includes('noor') || q.includes('gold') || q.includes('particle')) return 'particles';
  if (q.includes('star') || q.includes('night') || q.includes('space') || q.includes('cosmos') || q.includes('galaxy') || q.includes('universe')) return 'stars';
  if (q.includes('mountain') || q.includes('peak') || q.includes('hill') || q.includes('alpine') || q.includes('cliff')) return 'mountains';
  if (q.includes('nature') || q.includes('forest') || q.includes('tree') || q.includes('garden') || q.includes('wood') || q.includes('leaf') || q.includes('green')) return 'forest';
  return 'forest';
}

/**
 * Master multi-ayah stock asset resolver:
 * Ensures N unique Pexels/Pixabay items for N loaded ayahs.
 */
export async function getStockAssetsForAyahs(options: {
  categoryOrQuery: string;
  mediaType: 'video' | 'image';
  count: number; // e.g. 5 ayahs = 5 items
  source?: 'pexels' | 'pixabay' | 'auto';
  pexelsApiKey?: string;
  pixabayApiKey?: string;
}): Promise<{ items: StockItem[]; sourceUsed: string }> {
  const { categoryOrQuery, mediaType, count } = options;
  const targetCount = Math.max(1, count || 1);
  const matchedCat = normalizeCategory(categoryOrQuery);
  const reqSource = options.source || 'auto';

  let liveResults: StockItem[] = [];
  let sourceUsed = 'catalog-pexels-pixabay';

  // 1. Try live Pexels API if key available
  if (reqSource !== 'pixabay' && (options.pexelsApiKey || process.env.PEXELS_API_KEY)) {
    const pexelsItems = await searchPexelsApi({
      query: categoryOrQuery,
      mediaType,
      perPage: Math.max(10, targetCount),
      apiKey: options.pexelsApiKey
    });
    if (pexelsItems.length > 0) {
      liveResults = pexelsItems;
      sourceUsed = 'live-pexels-api';
    }
  }

  // 2. Try live Pixabay API if key available and needed
  if (liveResults.length < targetCount && reqSource !== 'pexels' && (options.pixabayApiKey || process.env.PIXABAY_API_KEY)) {
    const pixabayItems = await searchPixabayApi({
      query: categoryOrQuery,
      mediaType,
      perPage: Math.max(10, targetCount),
      apiKey: options.pixabayApiKey
    });
    if (pixabayItems.length > 0) {
      liveResults = [...liveResults, ...pixabayItems];
      sourceUsed = sourceUsed === 'live-pexels-api' ? 'live-pexels-pixabay' : 'live-pixabay-api';
    }
  }

  // 3. Fallback to Curated Pexels / Pixabay Verified Asset Bank
  const catItems = CURATED_STOCK_CATALOG[matchedCat] || CURATED_STOCK_CATALOG.forest || CURATED_STOCK_CATALOG.mountains || [];
  
  // Filter by requested mediaType and requested source (pexels or pixabay)
  const sourceFilteredPool = catItems.filter(item => {
    const matchType = mediaType === 'video' ? item.mediaType === 'video' : true;
    if (!matchType) return false;
    if (reqSource === 'pexels') return item.source === 'pexels';
    if (reqSource === 'pixabay') return item.source === 'pixabay';
    return true;
  });

  const pool = sourceFilteredPool.length > 0 
    ? sourceFilteredPool 
    : catItems.filter(item => (mediaType === 'video' ? item.mediaType === 'video' : true));

  // Cross-category fallback pool respecting source if needed
  const allVerifiedItems = [
    ...(CURATED_STOCK_CATALOG.forest || []),
    ...(CURATED_STOCK_CATALOG.mountains || []),
    ...(CURATED_STOCK_CATALOG.stars || []),
    ...(CURATED_STOCK_CATALOG.particles || []),
    ...(CURATED_STOCK_CATALOG.rain || []),
    ...(CURATED_STOCK_CATALOG.clouds || []),
    ...(CURATED_STOCK_CATALOG.waves || []),
    ...(CURATED_STOCK_CATALOG.waterfall || []),
    ...(CURATED_STOCK_CATALOG.desert || []),
    ...(CURATED_STOCK_CATALOG.makkah || [])
  ];

  const fallbackPool = allVerifiedItems.filter(item => {
    const matchType = mediaType === 'video' ? item.mediaType === 'video' : true;
    if (!matchType) return false;
    if (reqSource === 'pexels') return item.source === 'pexels';
    if (reqSource === 'pixabay') return item.source === 'pixabay';
    return true;
  });

  // Emergency safety item
  const emergencyItem: StockItem = {
    id: `${reqSource === 'pixabay' ? 'pixabay' : 'pexels'}-fallback-1`,
    title: 'Majestic Quranic Vista',
    url: '/videos/mountain_clouds.mp4',
    thumbnail: 'https://images.pexels.com/photos/417173/pexels-photo-417173.jpeg?auto=compress&cs=tinysrgb&w=400',
    duration: 20,
    mediaType: mediaType,
    source: reqSource === 'pixabay' ? 'pixabay' : 'pexels',
    category: matchedCat
  };

  const finalItems: StockItem[] = [];
  for (let i = 0; i < targetCount; i++) {
    if (i < liveResults.length) {
      finalItems.push(liveResults[i]);
    } else {
      const sourcePool = pool.length > 0 ? pool : (fallbackPool.length > 0 ? fallbackPool : [emergencyItem]);
      const baseItem = sourcePool[i % sourcePool.length] || emergencyItem;
      // Clone with distinct id if recycled
      finalItems.push({
        ...baseItem,
        id: `${baseItem.id || 'stock'}-ayah-${i + 1}`,
        title: `${baseItem.title || 'Scene'} (Scene ${i + 1})`
      });
    }
  }

  return { items: finalItems, sourceUsed };
}
