import { QuranTranslationOption } from '../types';

export interface TranslationFontInfo {
  family: string;
  label: string;
  category: 'urdu' | 'hindi' | 'bengali' | 'persian' | 'tamil' | 'russian' | 'latin' | 'arabic';
  supportedLanguages: string[];
  description: string;
}

export const SUPPORTED_TRANSLATION_FONTS: TranslationFontInfo[] = [
  // Urdu Fonts
  {
    family: 'Noto Nastaliq Urdu',
    label: '🇵🇰 Noto Nastaliq Urdu (Traditional Calligraphy)',
    category: 'urdu',
    supportedLanguages: ['ur', 'fa'],
    description: 'Authentic Pakistani & Indian Nastaliq script with proper cascading baseline',
  },
  {
    family: 'Gulzar',
    label: '🇵🇰 Gulzar (Modern Nastaliq Display)',
    category: 'urdu',
    supportedLanguages: ['ur', 'fa'],
    description: 'High-contrast modern Nastaliq with exquisite curves and diacritic balance',
  },
  {
    family: 'Lateef',
    label: '🇵🇰 Lateef (Perso-Arabic Naskh-Nastaliq)',
    category: 'urdu',
    supportedLanguages: ['ur', 'fa', 'ar'],
    description: 'Fluid Perso-Arabic style ideal for Urdu poetry and Quran translations',
  },

  // Hindi & Sanskrit / Devanagari Fonts
  {
    family: 'Noto Sans Devanagari',
    label: '🇮🇳 Noto Sans Devanagari (Clean & Ultra-Crisp)',
    category: 'hindi',
    supportedLanguages: ['hi', 'mr', 'ne', 'sa'],
    description: 'Modern, high-legibility standard for Hindi translation subtitles',
  },
  {
    family: 'Noto Serif Devanagari',
    label: '🇮🇳 Noto Serif Devanagari (Literary Classical)',
    category: 'hindi',
    supportedLanguages: ['hi', 'mr', 'ne', 'sa'],
    description: 'Refined serif typography with traditional headline bar strokes',
  },
  {
    family: 'Poppins',
    label: '🇮🇳 Poppins (Devanagari & Latin Geometric)',
    category: 'hindi',
    supportedLanguages: ['hi', 'en', 'id', 'tr', 'de', 'es'],
    description: 'Super-popular geometric sans font with full Hindi Devanagari support',
  },
  {
    family: 'Rozha One',
    label: '🇮🇳 Rozha One (Bold Editorial Devanagari)',
    category: 'hindi',
    supportedLanguages: ['hi'],
    description: 'Dramatic thick-and-thin contrast for powerful Hindi video titles',
  },
  {
    family: 'Mukta',
    label: '🇮🇳 Mukta (Contemporary Devanagari)',
    category: 'hindi',
    supportedLanguages: ['hi'],
    description: 'Versatile contemporary sans designed specifically for Devanagari',
  },
  {
    family: 'Kalam',
    label: '🇮🇳 Kalam (Handwritten Devanagari)',
    category: 'hindi',
    supportedLanguages: ['hi'],
    description: 'Organic handwritten brush style for personalized Hindi Quran reflections',
  },
  {
    family: 'Tiro Devanagari Hindi',
    label: '🇮🇳 Tiro Devanagari Hindi (Formal Academic)',
    category: 'hindi',
    supportedLanguages: ['hi'],
    description: 'Specialized typeface for high-precision linguistic literature',
  },

  // Bengali / Bangla Fonts
  {
    family: 'Noto Sans Bengali',
    label: '🇧🇩 Noto Sans Bengali (Modern & Clear)',
    category: 'bengali',
    supportedLanguages: ['bn'],
    description: 'Crystal-clear Bengali glyphs with proper matra and conjuncts',
  },
  {
    family: 'Noto Serif Bengali',
    label: '🇧🇩 Noto Serif Bengali (Traditional Literary)',
    category: 'bengali',
    supportedLanguages: ['bn'],
    description: 'Classic literary typography for Bengali Quran tafsir and translations',
  },
  {
    family: 'Hind Siliguri',
    label: '🇧🇩 Hind Siliguri (Clean Editorial Sans)',
    category: 'bengali',
    supportedLanguages: ['bn'],
    description: 'One of the most loved and legible modern Bengali typefaces',
  },
  {
    family: 'Galada',
    label: '🇧🇩 Galada (Bengali Calligraphic Display)',
    category: 'bengali',
    supportedLanguages: ['bn'],
    description: 'Flowing cursive Bengali script inspired by Lobstertype',
  },
  {
    family: 'Atma',
    label: '🇧🇩 Atma (Charming Bengali Display)',
    category: 'bengali',
    supportedLanguages: ['bn'],
    description: 'Playful yet legible Bengali typography for dynamic social reels',
  },
  {
    family: 'Tiro Bangla',
    label: '🇧🇩 Tiro Bangla (Scholarly Bengali)',
    category: 'bengali',
    supportedLanguages: ['bn'],
    description: 'Formal scholarly typography designed for complex Bengali literature',
  },

  // Tamil Fonts
  {
    family: 'Noto Sans Tamil',
    label: '🇮🇳 Noto Sans Tamil (Clean Sans)',
    category: 'tamil',
    supportedLanguages: ['ta'],
    description: 'Ultra-clear Tamil typography with standardized pulli and vowel signs',
  },
  {
    family: 'Noto Serif Tamil',
    label: '🇮🇳 Noto Serif Tamil (Classic Serif)',
    category: 'tamil',
    supportedLanguages: ['ta'],
    description: 'Formal serif typography for Tamil Quran translation scriptures',
  },
  {
    family: 'Mukta Malar',
    label: '🇮🇳 Mukta Malar (Modern Tamil)',
    category: 'tamil',
    supportedLanguages: ['ta'],
    description: 'Crisp contemporary Tamil typeface for video captions',
  },

  // Persian / Farsi Fonts
  {
    family: 'Vazirmatn',
    label: '🇮🇷 Vazirmatn (Modern Persian UI & Subtitles)',
    category: 'persian',
    supportedLanguages: ['fa', 'ar', 'ur'],
    description: 'World-renowned Iranian typeface with unmatched digital screen legibility',
  },
  {
    family: 'Lalezar',
    label: '🇮🇷 Lalezar (Bold Persian Display & Posters)',
    category: 'persian',
    supportedLanguages: ['fa', 'ar'],
    description: 'Bold iconic display font inspired by vintage Persian cinema posters',
  },

  // Russian / Cyrillic Fonts
  {
    family: 'Cormorant Garamond',
    label: '🇷🇺 Cormorant Garamond (Royal Cyrillic & Latin)',
    category: 'russian',
    supportedLanguages: ['ru', 'en', 'fr', 'es', 'de', 'tr', 'id'],
    description: 'Exquisite classical serif with full Cyrillic support for Russian translations',
  },
  {
    family: 'Merriweather',
    label: '🇷🇺 Merriweather (Highly Legible Cyrillic Serif)',
    category: 'russian',
    supportedLanguages: ['ru', 'en', 'de', 'es'],
    description: 'Warm, pleasant reading experience engineered specifically for screens',
  },
  {
    family: 'Roboto Slab',
    label: '🇷🇺 Roboto Slab (Punchy Modern Cyrillic)',
    category: 'russian',
    supportedLanguages: ['ru', 'en'],
    description: 'Modern geometric slab serif with crisp Cyrillic letterforms',
  },

  // Latin / English / Turkish / Indonesian / European Fonts
  {
    family: 'Inter',
    label: '🇬🇧 Inter (Ultra-Clean Global Sans)',
    category: 'latin',
    supportedLanguages: ['en', 'id', 'ms', 'de', 'fr', 'es', 'tr'],
    description: 'Flawless readability with tall x-height across all Latin translations',
  },
  {
    family: 'Outfit',
    label: '🇹🇷 Outfit (Sleek Geometric Modern)',
    category: 'latin',
    supportedLanguages: ['tr', 'en', 'id', 'de', 'fr', 'es'],
    description: 'Contemporary geometric sans with beautiful Turkish and European accents',
  },
  {
    family: 'Cinzel',
    label: '👑 Cinzel (Royal Cinematic Classical)',
    category: 'latin',
    supportedLanguages: ['en', 'fr', 'es', 'it'],
    description: 'Majestic cinematic serif inspired by first-century Roman inscriptions',
  },
  {
    family: 'Cinzel Decorative',
    label: '👑 Cinzel Decorative (Grand Royal Capitals)',
    category: 'latin',
    supportedLanguages: ['en', 'fr', 'es'],
    description: 'Ornate capitals for dramatic opening title sequences and Surah names',
  },
  {
    family: 'Lora',
    label: '📖 Lora (Contemporary Literary Serif)',
    category: 'latin',
    supportedLanguages: ['en', 'tr', 'id', 'de', 'fr', 'es'],
    description: 'Well-balanced contemporary serif with roots in calligraphy',
  },
  {
    family: 'Montserrat',
    label: '⚡ Montserrat (Bold High-Impact Sans)',
    category: 'latin',
    supportedLanguages: ['en', 'id', 'es', 'de', 'ru'],
    description: 'Clean geometric powerhouse for viral TikTok, Shorts, and Reels',
  },
  {
    family: 'Playfair Display',
    label: '✨ Playfair Display (Luxury Editorial Serif)',
    category: 'latin',
    supportedLanguages: ['en', 'fr', 'it', 'es'],
    description: 'High-fashion editorial elegance for premium video subtitles',
  },
  {
    family: 'Space Grotesk',
    label: '🚀 Space Grotesk (Tech Modernist)',
    category: 'latin',
    supportedLanguages: ['en', 'id', 'de'],
    description: 'Slightly quirky modernist proportions for punchy visuals',
  },
  {
    family: 'JetBrains Mono',
    label: '💻 JetBrains Mono (Technical Monospace)',
    category: 'latin',
    supportedLanguages: ['en'],
    description: 'Crisp monospaced aesthetic for timestamps, metadata, and tech layouts',
  },

  // Arabic Scripture Fonts (also applicable for translations & commentaries)
  {
    family: 'QPC Uthmani Hafs',
    label: '📖 QPC Uthmani Hafs (Quran.com Official Mushaf)',
    category: 'arabic',
    supportedLanguages: ['ar', 'ur'],
    description: 'Authentic King Fahd Quran Complex Hafs typography as used on Quran.com',
  },
  {
    family: 'Uthmani',
    label: '📖 Uthmani (KFGQPC Madinah Mushaf Script)',
    category: 'arabic',
    supportedLanguages: ['ar', 'ur'],
    description: 'Standard authentic Medina Quranic Mushaf script with all Tajweed diacritics',
  },
  {
    family: 'Amiri Quran',
    label: '🕌 Amiri Quran (Classical Calligraphic Scripture)',
    category: 'arabic',
    supportedLanguages: ['ar'],
    description: 'Classical Bulaq press typesetting with specialized Quranic glyphs',
  },
  {
    family: 'Noto Naskh Arabic',
    label: '📜 Noto Naskh Arabic (Crisp Readable Naskh)',
    category: 'arabic',
    supportedLanguages: ['ar', 'ur', 'fa'],
    description: 'High-clarity modern Naskh font for seamless multi-screen readability',
  },
  {
    family: 'Amiri',
    label: '🕌 Amiri (Classical Arabic & Perso-Arabic)',
    category: 'arabic',
    supportedLanguages: ['ar', 'ur', 'fa'],
    description: 'Elegant Arabic typeface inspired by the classical Naskh typography',
  },
  {
    family: 'Scheherazade New',
    label: '🕌 Scheherazade New (Traditional Arabic Script)',
    category: 'arabic',
    supportedLanguages: ['ar'],
    description: 'Traditional style providing a graceful simulation of handwritten Arabic',
  },
  {
    family: 'Reem Kufi',
    label: '🕌 Reem Kufi (Geometric Modern Kufic)',
    category: 'arabic',
    supportedLanguages: ['ar'],
    description: 'Geometric early Islamic calligraphy style for modern artistic titles',
  },
];

export const QURAN_TRANSLATION_OPTIONS: QuranTranslationOption[] = [
  // Popular Languages at top
  {
    id: 'ur-jalandhry',
    apiId: 97,
    language: 'Urdu (اردو)',
    languageCode: 'ur',
    translator: 'Fateh Muhammad Jalandhry (فتح محمد جالندھری)',
    direction: 'rtl',
    defaultFont: 'Noto Nastaliq Urdu',
    flag: '🇵🇰',
    isPopular: true
  },
  {
    id: 'ur-tahir',
    apiId: 234,
    language: 'Urdu (اردو)',
    languageCode: 'ur',
    translator: 'Dr. Tahir-ul-Qadri - Irfan-ul-Quran (طاہر القادری)',
    direction: 'rtl',
    defaultFont: 'Noto Nastaliq Urdu',
    flag: '🇵🇰',
    isPopular: true
  },
  {
    id: 'ur-raza',
    apiId: 151,
    language: 'Urdu (اردو)',
    languageCode: 'ur',
    translator: 'Ahmed Raza Khan - Kanzul Iman (احمد رضا خان)',
    direction: 'rtl',
    defaultFont: 'Noto Nastaliq Urdu',
    flag: '🇵🇰',
    isPopular: true
  },
  {
    id: 'ur-maududi',
    apiId: 156,
    language: 'Urdu (اردو)',
    languageCode: 'ur',
    translator: 'Abul A\'la Maududi - Tafhim al-Qur\'an (مودودی)',
    direction: 'rtl',
    defaultFont: 'Noto Nastaliq Urdu',
    flag: '🇵🇰'
  },
  {
    id: 'hi-suhel',
    apiId: 122,
    language: 'Hindi (हिन्दी)',
    languageCode: 'hi',
    translator: 'Suhel Farooq Khan & Saifur Rahman (सुहेल फ़ारूक़ ख़ान)',
    direction: 'ltr',
    defaultFont: 'Noto Sans Devanagari',
    flag: '🇮🇳',
    isPopular: true
  },
  {
    id: 'hi-farooq',
    apiId: 86,
    language: 'Hindi (हिन्दी)',
    languageCode: 'hi',
    translator: 'Muhammad Farooq Khan (फ़ारूक़ ख़ान व मुहम्मद अहमद)',
    direction: 'ltr',
    defaultFont: 'Noto Sans Devanagari',
    flag: '🇮🇳',
    isPopular: true
  },
  {
    id: 'en-sahih',
    apiId: 20,
    language: 'English',
    languageCode: 'en',
    translator: 'Sahih International',
    direction: 'ltr',
    defaultFont: 'Inter',
    flag: '🇬🇧',
    isPopular: true
  },
  {
    id: 'en-khattab',
    apiId: 131,
    language: 'English',
    languageCode: 'en',
    translator: 'Dr. Mustafa Khattab (The Clear Quran)',
    direction: 'ltr',
    defaultFont: 'Playfair Display',
    flag: '🇬🇧',
    isPopular: true
  },
  {
    id: 'en-hilali',
    apiId: 84,
    language: 'English',
    languageCode: 'en',
    translator: 'Muhsin Khan & Taqi-ud-Din al-Hilali',
    direction: 'ltr',
    defaultFont: 'Cinzel',
    flag: '🇬🇧'
  },
  {
    id: 'en-yusufali',
    apiId: 22,
    language: 'English',
    languageCode: 'en',
    translator: 'Abdullah Yusuf Ali',
    direction: 'ltr',
    defaultFont: 'Montserrat',
    flag: '🇬🇧'
  },
  {
    id: 'id-kemenag',
    apiId: 33,
    language: 'Indonesian (Bahasa)',
    languageCode: 'id',
    translator: 'Kementerian Agama RI (Kemenag)',
    direction: 'ltr',
    defaultFont: 'Inter',
    flag: '🇮🇩',
    isPopular: true
  },
  {
    id: 'tr-diyanet',
    apiId: 77,
    language: 'Turkish (Türkçe)',
    languageCode: 'tr',
    translator: 'Diyanet İşleri Başkanlığı',
    direction: 'ltr',
    defaultFont: 'Outfit',
    flag: '🇹🇷',
    isPopular: true
  },
  {
    id: 'tr-yazir',
    apiId: 124,
    language: 'Turkish (Türkçe)',
    languageCode: 'tr',
    translator: 'Elmalılı Hamdi Yazır',
    direction: 'ltr',
    defaultFont: 'Outfit',
    flag: '🇹🇷'
  },
  {
    id: 'fr-hamidullah',
    apiId: 31,
    language: 'French (Français)',
    languageCode: 'fr',
    translator: 'Muhammad Hamidullah',
    direction: 'ltr',
    defaultFont: 'Playfair Display',
    flag: '🇫🇷',
    isPopular: true
  },
  {
    id: 'bn-muhiuddin',
    apiId: 161,
    language: 'Bengali (বাংলা)',
    languageCode: 'bn',
    translator: 'Muhiuddin Khan (মুহিউদ্দীন খান)',
    direction: 'ltr',
    defaultFont: 'Noto Sans Bengali',
    flag: '🇧🇩',
    isPopular: true
  },
  {
    id: 'bn-taisirul',
    apiId: 213,
    language: 'Bengali (বাংলা)',
    languageCode: 'bn',
    translator: 'Taisirul Quran (তাইসিরুল কুরআন)',
    direction: 'ltr',
    defaultFont: 'Hind Siliguri',
    flag: '🇧🇩'
  },
  {
    id: 'es-garcia',
    apiId: 140,
    language: 'Spanish (Español)',
    languageCode: 'es',
    translator: 'Muhammad Isa García',
    direction: 'ltr',
    defaultFont: 'Montserrat',
    flag: '🇪🇸',
    isPopular: true
  },
  {
    id: 'de-bubenheim',
    apiId: 27,
    language: 'German (Deutsch)',
    languageCode: 'de',
    translator: 'Frank Bubenheim & Nadeem Elyas',
    direction: 'ltr',
    defaultFont: 'Inter',
    flag: '🇩🇪',
    isPopular: true
  },
  {
    id: 'ru-kuliev',
    apiId: 45,
    language: 'Russian (Русский)',
    languageCode: 'ru',
    translator: 'Эльмир Кулиев (Elmir Kuliev)',
    direction: 'ltr',
    defaultFont: 'Cormorant Garamond',
    flag: '🇷🇺',
    isPopular: true
  },
  {
    id: 'fa-kaldari',
    apiId: 135,
    language: 'Persian (فارسی)',
    languageCode: 'fa',
    translator: 'حسین تاجی کل‌داری (Hussein Taji Kal Dari)',
    direction: 'rtl',
    defaultFont: 'Vazirmatn',
    flag: '🇮🇷',
    isPopular: true
  },
  {
    id: 'fa-ghomshei',
    apiId: 29,
    language: 'Persian (فارسی)',
    languageCode: 'fa',
    translator: 'مهدی الهی قمشه‌ای (Mahdi Elahi Ghomshei)',
    direction: 'rtl',
    defaultFont: 'Vazirmatn',
    flag: '🇮🇷'
  },
  {
    id: 'ms-basmeih',
    apiId: 39,
    language: 'Malay (Bahasa Melayu)',
    languageCode: 'ms',
    translator: 'Abdullah Muhammad Basmeih',
    direction: 'ltr',
    defaultFont: 'Inter',
    flag: '🇲🇾'
  },
  {
    id: 'ta-jantrust',
    apiId: 133,
    language: 'Tamil (தமிழ்)',
    languageCode: 'ta',
    translator: 'Jan Trust Foundation (ஜான் டிரஸ்ட்)',
    direction: 'ltr',
    defaultFont: 'Noto Sans Tamil',
    flag: '🇮🇳'
  },
  {
    id: 'none',
    apiId: null,
    language: 'None (Arabic Only)',
    languageCode: 'none',
    translator: 'No Translation (Arabic Scripture Only)',
    direction: 'ltr',
    defaultFont: 'Inter',
    flag: '🕌'
  }
];

export function getSuggestedFontsForLanguage(langCode?: string): TranslationFontInfo[] {
  if (!langCode) return SUPPORTED_TRANSLATION_FONTS;
  const directMatches = SUPPORTED_TRANSLATION_FONTS.filter(f => f.supportedLanguages.includes(langCode));
  if (directMatches.length > 0) return directMatches;
  return SUPPORTED_TRANSLATION_FONTS;
}

export function getTranslationOptionById(id?: string): QuranTranslationOption {
  if (!id) return QURAN_TRANSLATION_OPTIONS[0];
  const found = QURAN_TRANSLATION_OPTIONS.find(t => t.id === id || t.languageCode === id);
  return found || QURAN_TRANSLATION_OPTIONS[0];
}

export function getTaawwuzTranslation(langCode: string): string {
  switch (langCode) {
    case 'ur':
      return 'میں اللہ کی پناہ مانگتا ہوں شیطان مردود سے۔';
    case 'hi':
      return 'मैं अल्लाह की पनाह माँगता हूँ शैतान मरदूद से।';
    case 'id':
      return 'Aku berlindung kepada Allah dari godaan setan yang terkutuk.';
    case 'tr':
      return 'Kovulmuş şeytandan Allah\'a sığınırım.';
    case 'fr':
      return 'Je cherche refuge auprès d\'Allah contre Satan le maudit.';
    case 'bn':
      return 'আমি বিতাড়িত শয়তান থেকে আল্লাহর আশ্রয় চাইছি।';
    case 'es':
      return 'Me refugio en Al-lah de Satanás el maldito.';
    case 'de':
      return 'Ich nehme Zuflucht bei Allah vor dem verfluchten Satan.';
    case 'ru':
      return 'Прибегаю к защите Аллаха от проклятого сатаны.';
    case 'fa':
      return 'پناه می‌برم به خدا از شر شیطان رانده شده.';
    case 'none':
      return '';
    default:
      return 'I seek refuge in Allah from Satan, the expelled.';
  }
}

export function getTasmiyahTranslation(langCode: string): string {
  switch (langCode) {
    case 'ur':
      return 'شروع اللہ کے نام سے جو بڑا مہربان نہایت رحم والا ہے۔';
    case 'hi':
      return 'अल्लाह के नाम से जो बड़ा मेहरबान और निहायत रहम वाला है।';
    case 'id':
      return 'Dengan nama Allah Yang Maha Pengasih, Maha Penyayang.';
    case 'tr':
      return 'Rahman ve Rahim olan Allah\'ın adıyla.';
    case 'fr':
      return 'Au nom d\'Allah, le Tout Miséricordieux, le Très Miséricordieux.';
    case 'bn':
      return 'পরম করুণাময় ও অসীম দয়ালু আল্লাহর নামে।';
    case 'es':
      return 'En el nombre de Al-lah, el Compasivo, el Misericordioso.';
    case 'de':
      return 'Im Namen Allahs, des Allerbarmers, des Barmherzigen.';
    case 'ru':
      return 'Во имя Аллаха, Милостивого, Милосердного.';
    case 'fa':
      return 'به نام خداوند بخشنده و مهربان.';
    case 'none':
      return '';
    default:
      return 'In the name of Allah, the Entirely Merciful, the Especially Merciful.';
  }
}

// Built-in offline translations for Surah Al-Fatihah, Al-Ikhlas, Al-Falaq, An-Nas, Al-Kawthar, etc.
export const OFFLINE_SURAH_TRANSLATIONS: Record<string, Record<string, string>> = {
  // Surah Al-Fatihah (1)
  '1:1': {
    en: 'In the name of Allah, the Entirely Merciful, the Especially Merciful.',
    ur: 'شروع اللہ کے نام سے جو بڑا مہربان نہایت رحم والا ہے۔',
    hi: 'शुरू अल्लाह के नाम से जो बड़ा मेहरबान और निहायत रहम वाला है।',
    id: 'Dengan nama Allah Yang Maha Pengasih, Maha Penyayang.',
    tr: 'Rahmân ve Rahîm olan Allah\'ın adıyla.',
    fr: 'Au nom d\'Allah, le Tout Miséricordieux, le Très Miséricordieux.',
    bn: 'শুরু করছি আল্লাহর নামে যিনি পরম করুণাময়, অসীম দয়ালু।',
    es: 'En el nombre de Dios, el Compasivo, el Misericordioso.',
    de: 'Im Namen Allahs, des Allerbarmers, des Barmherzigen.',
    ru: 'Во имя Аллаха, Милостивого, Милосердного!',
    fa: 'به نام خداوند بخشنده و مهربان.'
  },
  '1:2': {
    en: '[All] praise is [due] to Allah, Lord of the worlds.',
    ur: 'سب تعریفیں اللہ کے لیے ہیں جو تمام جہانوں کا پروردگار ہے۔',
    hi: 'बड़ा मेहरबान और निहायत रहम वाला है।',
    id: 'Yang Maha Pengasih, Maha Penyayang.',
    tr: 'O, Rahmândır, Rahîmdir.',
    fr: 'Le Tout Miséricordieux, le Très Miséricordieux.',
    bn: 'পরম করুণাময়, অসীম দয়ালু।',
    es: 'El Compasivo, el Misericordioso.',
    de: 'Dem Allerbarmer, dem Barmherzigen.',
    ru: 'Милостивому, Милосердному.',
    fa: 'آن بخشنده و مهربان.'
  },
  '1:3': {
    en: 'The Entirely Merciful, the Especially Merciful.',
    ur: 'بڑا مہربان نہایت رحم والا ہے۔',
    hi: 'इंसाफ़ और बदले के दिन का मालिक।',
    id: 'Pemilik hari pembalasan.',
    tr: 'Ceza (hesap) gününün sahibidir.',
    fr: 'Maître du Jour de la rétribution.',
    bn: 'বিচার দিবসের মালিক।',
    es: 'Soberano del Día del Juicio.',
    de: 'Dem Herrscher am Tage des Gerichts.',
    ru: 'Властелину Дня воздаяния!',
    fa: 'پادشاه روز جزا.'
  },
  '1:4': {
    en: 'Sovereign of the Day of Recompense.',
    ur: 'روزِ جزا کا مالک و مختار ہے۔',
    hi: 'हम तेरी ही इबादत करते हैं और तुझ ही से मदद माँगते हैं।',
    id: 'Hanya kepada Engkaulah kami menyembah dan hanya kepada Engkaulah kami mohon pertolongan.',
    tr: '(Rabbimiz!) Yalnız sana kulluk eder ve yalnız senden yardım dileriz.',
    fr: 'C\'est Toi [Seul] que nous adorons, et c\'est Toi [Seul] dont nous implorons secours.',
    bn: 'আমরা কেবল তোমারই ইবাদত করি এবং কেবল তোমারই সাহায্য চাই।',
    es: 'Solo a Ti te adoramos y solo a Ti imploramos ayuda.',
    de: 'Dir allein dienen wir, und zu Dir allein flehen wir um Hilfe.',
    ru: 'Тебе одному мы поклоняемся и Тебя одного молим о помощи.',
    fa: 'تنها تو را می‌پرستیم و تنها از تو یاری می‌جوییم.'
  },
  '1:5': {
    en: 'It is You we worship and You we ask for help.',
    ur: 'ہم تیری ہی عبادت کرتے ہیں اور تجھ ہی سے مدد مانگتے ہیں۔',
    hi: 'हमें सीधा और सच्चा रास्ता दिखा।',
    id: 'Tunjukilah kami jalan yang lurus,',
    tr: 'Bizi doğru yola ilet;',
    fr: 'Guide-nous dans le droit chemin,',
    bn: 'আমাদের সরল সঠিক পথ দেখাও।',
    es: 'Guíanos por el camino recto,',
    de: 'Führe uns den geraden Weg,',
    ru: 'Веди нас прямым путем,',
    fa: 'ما را به راه راست هدایت فرما.'
  },
  '1:6': {
    en: 'Guide us to the straight path -',
    ur: 'ہمیں سیدھے راستے پر چلا۔',
    hi: 'उन लोगों का रास्ता जिन पर तूने इनाम फ़रमाया।',
    id: '(yaitu) jalan orang-orang yang telah Engkau beri nikmat kepadanya;',
    tr: 'Kendilerine nimet verdiklerinin yoluna;',
    fr: 'le chemin de ceux que Tu as comblés de faveurs,',
    bn: 'তাদের পথ, যাদের তুমি অনুগ্রহ দান করেছ।',
    es: 'el camino de los que has colmado de favores,',
    de: 'den Weg derer, denen Du Gnade erwiesen hast,',
    ru: 'путем тех, кого Ты облагодетельствовал,',
    fa: 'راه کسانی که به آنان نعمت دادی.'
  },
  '1:7': {
    en: 'The path of those upon whom You have bestowed favor, not of those who have evoked [Your] anger or of those who are astray.',
    ur: 'ان لوگوں کا راستہ جن پر تو نے انعام فرمایا، نہ کہ ان کا جن پر غضب نازل ہوا اور نہ گمراہوں کا۔',
    hi: 'ना उनका जिन पर ग़ज़ब हुआ और ना बहके हुए गुमराहों का।',
    id: 'bukan (jalan) mereka yang dimurkai dan bukan (pula jalan) mereka yang sesat.',
    tr: 'Gazaba uğramışların ve sapmışların yoluna değil.',
    fr: 'non pas de ceux qui ont encouru Ta colère, ni des égarés.',
    bn: 'যাদের ওপর তোমার ক্রোধ বর্ষিত হয়নি এবং যারা পথভ্রষ্ট নয়।',
    es: 'no el de los que han incurrido en Tu ira, ni el de los extraviados.',
    de: 'nicht derer, die [Deinen] Zorn erregt haben, und nicht der Irregehenden.',
    ru: 'не тех, на кого пал гнев, и не заблудших.',
    fa: 'نه راه غضب‌شدگان و نه گمراهان.'
  },

  // Surah Al-Ikhlas (112)
  '112:1': {
    en: 'Say, "He is Allah, [who is] One,',
    ur: 'آپ فرما دیجیے: وہ اللہ ایک (یکتا) ہے۔',
    hi: 'कहो कि वो अल्लाह एक है।',
    id: 'Katakanlah (Muhammad), "Dialah Allah, Yang Maha Esa.',
    tr: 'De ki: O, Allah birdir.',
    fr: 'Dis: «Il est Allah, Unique.',
    bn: 'বলুন, তিনিই আল্লাহ, একক।',
    es: 'Di: «Él es Al-lah, Uno.',
    de: 'Sprich: Er ist Allah, ein Einer,',
    ru: 'Скажи: «Он — Аллах Единый,',
    fa: 'بگو: او خداوند یکتاست.'
  },
  '112:2': {
    en: 'Allah, the Eternal Refuge.',
    ur: 'اللہ بے نیاز (سب اس کے محتاج ہیں)۔',
    hi: 'अल्लाह बेनियाज़ और सब का सहारा है।',
    id: 'Allah tempat meminta segala sesuatu.',
    tr: 'Allah sameddir (her şey O\'na muhtaç, O hiçbir şeye muhtaç değil).',
    fr: 'Allah, Le Seul à être imploré pour ce que nous désirons.',
    bn: 'আল্লাহ অমুখাপেক্ষী।',
    es: 'Al-lah, el Señor Absoluto.',
    de: 'Allah, der Absolute (Ewige).',
    ru: 'Аллах Самодостаточный.',
    fa: 'خداوندی بی‌نیاز.'
  },
  '112:3': {
    en: 'He neither begets nor is born,',
    ur: 'نہ اس سے کوئی پیدا ہوا اور نہ وہ کسی سے پیدا ہوا۔',
    hi: 'ना उससे कोई पैदा हुआ और ना वो किसी से पैदा हुआ।',
    id: '(Allah) tidak beranak dan tidak pula diperanakkan,',
    tr: 'O, doğurmamış ve doğmamıştır.',
    fr: 'Il n\'a jamais engendré, n\'a pas été engendré non plus.',
    bn: 'তিনি কাউকে জন্ম দেননি এবং কেউ তাঁকে জন্ম দেয়নি।',
    es: 'No ha engendrado ni ha sido engendrado.',
    de: 'Er zeugt nicht und ist nicht gezeugt worden,',
    ru: 'Он не родил и не был рожден,',
    fa: 'نه زاد و نه زاده شد.'
  },
  '112:4': {
    en: 'Nor is there to Him any equivalent."',
    ur: 'اور نہ کوئی اس کا ہمسر و ہم پلہ ہے۔',
    hi: 'और कोई भी उसके बराबर नहीं है।',
    id: 'dan tidak ada sesuatu yang setara dengan Dia."',
    tr: 'Ve hiçbir şey O\'nun dengi değildir.',
    fr: 'Et nul n\'est égal à Lui».',
    bn: 'এবং তাঁর সমতুল্য কেউই নেই।',
    es: 'Y no hay nadie que se Le compare».',
    de: 'und niemand ist Ihm ebenbürtig.',
    ru: 'и нет никого, равного Ему».',
    fa: 'و هیچ کس همتای او نبوده است.'
  },

  // Surah Al-Kawthar (108)
  '108:1': {
    en: 'Indeed, We have granted you, [O Muhammad], al-Kawthar.',
    ur: 'بیشک ہم نے آپ کو کوثر (بے انتہا خیر و فضل) عطا فرما دیا۔',
    hi: 'बेशक हमने आपको कौसर (अथाह भलाई) अता फ़रमाई।',
    id: 'Sungguh, Kami telah memberimu (Muhammad) nikmat yang banyak.',
    tr: 'Şüphesiz biz sana Kevser\'i verdik.',
    fr: 'Nous t\'avons certes accordé l\'Abondance.',
    bn: 'নিশ্চয় আমি আপনাকে কাউসার দান করেছি।',
    es: 'Por cierto que te hemos concedido la abundancia.',
    de: 'Wahrlich, Wir haben dir die Fülle des Guten gegeben.',
    ru: 'Мы даровали тебе Изобилие (реку в Раю).',
    fa: 'ما به تو کوثر (خیر فراوان) عطا کردیم.'
  },
  '108:2': {
    en: 'So pray to your Lord and sacrifice [to Him alone].',
    ur: 'پس آپ اپنے رب کے لیے نماز پڑھیے اور قربانی کیجیے۔',
    hi: 'तो आप अपने रब के लिए नमाज़ पढ़िए और क़ुर्बानी कीजिए।',
    id: 'Maka laksanakanlah salat karena Tuhanmu, dan berkurbanlah.',
    tr: 'O halde Rabbin için namaz kıl ve kurban kes.',
    fr: 'Accomplis donc la Salât pour ton Seigneur et sacrifie.',
    bn: 'অতএব আপনার পালনকর্তার উদ্দেশ্যে নামায পড়ুন এবং কোরবানী করুন।',
    es: 'Reza, pues, a tu Señor y haz sacrificios.',
    de: 'Bete darum zu deinem Herrn und schlachte.',
    ru: 'Посему совершай намаз ради своего Господа и закалывай жертву.',
    fa: 'پس برای پروردگارت نماز بخوان و قربانی کن.'
  },
  '108:3': {
    en: 'Indeed, your enemy is the one cut off.',
    ur: 'بیشک آپ کا دشمن ہی بے نام و نشاں (جڑ کٹا) ہے۔',
    hi: 'यक़ीनन आपका दुश्मन ही बेनाम-ओ-निशान रहेगा।',
    id: 'Sungguh, orang yang membencimu dialah yang terputus (dari rahmat Allah).',
    tr: 'Doğrusu sana kin besleyendir soyu kesik olan!',
    fr: 'Celui qui te hait sera certes sans postérité.',
    bn: 'নিশ্চয় আপনার শত্রুই নির্বংশ।',
    es: 'Ciertamente quien te aborrece es el privado de todo bien.',
    de: 'Wahrlich, der dich hasst, ist es, der abgeschnitten ist.',
    ru: 'Воистину, твой ненавистник сам окажется безвестным.',
    fa: 'به راستی دشمن تو خود بی‌تبار و بی‌نسل خواهد بود.'
  }
};

/**
 * Fetch a single verse translation from API with offline fallback
 */
export async function fetchSingleAyahTranslation(
  verseKey: string,
  translationOption: QuranTranslationOption
): Promise<string> {
  if (translationOption.id === 'none' || translationOption.apiId === null) {
    return '';
  }

  // Check built-in offline dictionary first
  const offlineMatch = OFFLINE_SURAH_TRANSLATIONS[verseKey]?.[translationOption.languageCode];
  if (offlineMatch) {
    return offlineMatch;
  }

  // Check IndexedDB/LocalStorage Cache
  try {
    const { getCachedTranslation, setCachedTranslation } = await import('./offlineStorage');
    const cached = await getCachedTranslation(verseKey, translationOption.languageCode);
    if (cached) return cached;
  } catch {
    // bypass cache
  }

  try {
    const apiId = translationOption.apiId || 20;
    const apiUrl = `https://api.quran.com/api/v4/verses/by_key/${verseKey}?language=${translationOption.languageCode}&words=false&translations=${apiId}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    const res = await fetch(apiUrl, { signal: controller.signal });
    clearTimeout(timeoutId);
    if (res.ok) {
      const data = await res.json();
      const rawText = data.verse?.translations?.[0]?.text || '';
      const clean = rawText
        .replace(/<sup[^>]*>.*?<\/sup>/gi, '')
        .replace(/<[^>]*>/g, '')
        .replace(/[\{\}\[\]]/g, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/\s*[-–—]\s*$/, '')
        .trim();
      if (clean) {
        try {
          const { setCachedTranslation } = await import('./offlineStorage');
          await setCachedTranslation(verseKey, translationOption.languageCode, clean);
        } catch {
          // ignore cache error
        }
        return clean;
      }
    }
  } catch (err) {
    console.warn(`[Translation API] Fetch failed for ${verseKey} (${translationOption.language}):`, err);
  }

  // Fallback to English or generic
  const enFallback = OFFLINE_SURAH_TRANSLATIONS[verseKey]?.en;
  if (enFallback) return enFallback;

  return `Ayah ${verseKey} (${translationOption.language})`;
}
