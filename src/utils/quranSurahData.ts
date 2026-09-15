/**
 * Canonical Surah Metadata and Mixed Ayah / Surah Collections
 * Supports Surah Header overlays (Arabic & English) and Mix Surah / Mix Ayah
 * auto-segmentation for Manzil, 40 Rabbana Duas, Ruqyah Shifa, Ayat-ul-Kursi, etc.
 */

export interface SurahMeta {
  id: number;
  nameArabic: string;
  nameEnglish: string;
  meaningEnglish: string;
  revelation: 'Meccan' | 'Medinan';
  totalAyahs: number;
}

export const ALL_114_SURAHS: readonly SurahMeta[] = [
  { id: 1, nameArabic: 'سُورَةُ الفَاتِحَة', nameEnglish: 'Surah Al-Fatihah', meaningEnglish: 'The Opening', revelation: 'Meccan', totalAyahs: 7 },
  { id: 2, nameArabic: 'سُورَةُ البَقَرَة', nameEnglish: 'Surah Al-Baqarah', meaningEnglish: 'The Cow', revelation: 'Medinan', totalAyahs: 286 },
  { id: 3, nameArabic: 'سُورَةُ آلِ عِمْرَان', nameEnglish: 'Surah Ali \'Imran', meaningEnglish: 'Family of Imran', revelation: 'Medinan', totalAyahs: 200 },
  { id: 4, nameArabic: 'سُورَةُ النِّسَاء', nameEnglish: 'Surah An-Nisa', meaningEnglish: 'The Women', revelation: 'Medinan', totalAyahs: 176 },
  { id: 5, nameArabic: 'سُورَةُ المَائِدَة', nameEnglish: 'Surah Al-Ma\'idah', meaningEnglish: 'The Table Spread', revelation: 'Medinan', totalAyahs: 120 },
  { id: 6, nameArabic: 'سُورَةُ الأَنْعَام', nameEnglish: 'Surah Al-An\'am', meaningEnglish: 'The Cattle', revelation: 'Meccan', totalAyahs: 165 },
  { id: 7, nameArabic: 'سُورَةُ الأَعْرَاف', nameEnglish: 'Surah Al-A\'raf', meaningEnglish: 'The Heights', revelation: 'Meccan', totalAyahs: 206 },
  { id: 8, nameArabic: 'سُورَةُ الأَنْفَال', nameEnglish: 'Surah Al-Anfal', meaningEnglish: 'The Spoils of War', revelation: 'Medinan', totalAyahs: 75 },
  { id: 9, nameArabic: 'سُورَةُ التَّوْبَة', nameEnglish: 'Surah At-Tawbah', meaningEnglish: 'The Repentance', revelation: 'Medinan', totalAyahs: 129 },
  { id: 10, nameArabic: 'سُورَةُ يُونُس', nameEnglish: 'Surah Yunus', meaningEnglish: 'Jonah', revelation: 'Meccan', totalAyahs: 109 },
  { id: 11, nameArabic: 'سُورَةُ هُود', nameEnglish: 'Surah Hud', meaningEnglish: 'Hud', revelation: 'Meccan', totalAyahs: 123 },
  { id: 12, nameArabic: 'سُورَةُ يُوسُف', nameEnglish: 'Surah Yusuf', meaningEnglish: 'Joseph', revelation: 'Meccan', totalAyahs: 111 },
  { id: 13, nameArabic: 'سُورَةُ الرَّعْد', nameEnglish: 'Surah Ar-Ra\'d', meaningEnglish: 'The Thunder', revelation: 'Medinan', totalAyahs: 43 },
  { id: 14, nameArabic: 'سُورَةُ إِبْرَاهِيم', nameEnglish: 'Surah Ibrahim', meaningEnglish: 'Abraham', revelation: 'Meccan', totalAyahs: 52 },
  { id: 15, nameArabic: 'سُورَةُ الحِجْر', nameEnglish: 'Surah Al-Hijr', meaningEnglish: 'The Rocky Tract', revelation: 'Meccan', totalAyahs: 99 },
  { id: 16, nameArabic: 'سُورَةُ النَّحْل', nameEnglish: 'Surah An-Nahl', meaningEnglish: 'The Bee', revelation: 'Meccan', totalAyahs: 128 },
  { id: 17, nameArabic: 'سُورَةُ الإِسْرَاء', nameEnglish: 'Surah Al-Isra', meaningEnglish: 'The Night Journey', revelation: 'Meccan', totalAyahs: 111 },
  { id: 18, nameArabic: 'سُورَةُ الكَهْف', nameEnglish: 'Surah Al-Kahf', meaningEnglish: 'The Cave', revelation: 'Meccan', totalAyahs: 110 },
  { id: 19, nameArabic: 'سُورَةُ مَرْيَم', nameEnglish: 'Surah Maryam', meaningEnglish: 'Mary', revelation: 'Meccan', totalAyahs: 98 },
  { id: 20, nameArabic: 'سُورَةُ طه', nameEnglish: 'Surah Taha', meaningEnglish: 'Taha', revelation: 'Meccan', totalAyahs: 135 },
  { id: 21, nameArabic: 'سُورَةُ الأَنْبِيَاء', nameEnglish: 'Surah Al-Anbiya', meaningEnglish: 'The Prophets', revelation: 'Meccan', totalAyahs: 112 },
  { id: 22, nameArabic: 'سُورَةُ الحَجّ', nameEnglish: 'Surah Al-Hajj', meaningEnglish: 'The Pilgrimage', revelation: 'Medinan', totalAyahs: 78 },
  { id: 23, nameArabic: 'سُورَةُ المُؤْمِنُون', nameEnglish: 'Surah Al-Mu\'minun', meaningEnglish: 'The Believers', revelation: 'Meccan', totalAyahs: 118 },
  { id: 24, nameArabic: 'سُورَةُ النُّور', nameEnglish: 'Surah An-Nur', meaningEnglish: 'The Light', revelation: 'Medinan', totalAyahs: 64 },
  { id: 25, nameArabic: 'سُورَةُ الفُرْقَان', nameEnglish: 'Surah Al-Furqan', meaningEnglish: 'The Criterion', revelation: 'Meccan', totalAyahs: 77 },
  { id: 26, nameArabic: 'سُورَةُ الشُّعَرَاء', nameEnglish: 'Surah Ash-Shu\'ara', meaningEnglish: 'The Poets', revelation: 'Meccan', totalAyahs: 227 },
  { id: 27, nameArabic: 'سُورَةُ النَّمْل', nameEnglish: 'Surah An-Naml', meaningEnglish: 'The Ant', revelation: 'Meccan', totalAyahs: 93 },
  { id: 28, nameArabic: 'سُورَةُ القَصَص', nameEnglish: 'Surah Al-Qasas', meaningEnglish: 'The Stories', revelation: 'Meccan', totalAyahs: 88 },
  { id: 29, nameArabic: 'سُورَةُ العَنْكَبُوت', nameEnglish: 'Surah Al-\'Ankabut', meaningEnglish: 'The Spider', revelation: 'Meccan', totalAyahs: 69 },
  { id: 30, nameArabic: 'سُورَةُ الرُّوم', nameEnglish: 'Surah Ar-Rum', meaningEnglish: 'The Romans', revelation: 'Meccan', totalAyahs: 60 },
  { id: 31, nameArabic: 'سُورَةُ لُقْمَان', nameEnglish: 'Surah Luqman', meaningEnglish: 'Luqman', revelation: 'Meccan', totalAyahs: 34 },
  { id: 32, nameArabic: 'سُورَةُ السَّجْدَة', nameEnglish: 'Surah As-Sajdah', meaningEnglish: 'The Prostration', revelation: 'Meccan', totalAyahs: 30 },
  { id: 33, nameArabic: 'سُورَةُ الأَحْزَاب', nameEnglish: 'Surah Al-Ahzab', meaningEnglish: 'The Combined Forces', revelation: 'Medinan', totalAyahs: 73 },
  { id: 34, nameArabic: 'سُورَةُ سَبَأ', nameEnglish: 'Surah Saba', meaningEnglish: 'Sheba', revelation: 'Meccan', totalAyahs: 54 },
  { id: 35, nameArabic: 'سُورَةُ فَاطِر', nameEnglish: 'Surah Fatir', meaningEnglish: 'The Originator', revelation: 'Meccan', totalAyahs: 45 },
  { id: 36, nameArabic: 'سُورَةُ يس', nameEnglish: 'Surah Ya-Sin', meaningEnglish: 'Ya-Sin', revelation: 'Meccan', totalAyahs: 83 },
  { id: 37, nameArabic: 'سُورَةُ الصَّافَّات', nameEnglish: 'Surah As-Saffat', meaningEnglish: 'Those Setting Ranks', revelation: 'Meccan', totalAyahs: 182 },
  { id: 38, nameArabic: 'سُورَةُ ص', nameEnglish: 'Surah Sad', meaningEnglish: 'The Letter Sad', revelation: 'Meccan', totalAyahs: 88 },
  { id: 39, nameArabic: 'سُورَةُ الزُّمَر', nameEnglish: 'Surah Az-Zumar', meaningEnglish: 'The Crowds', revelation: 'Meccan', totalAyahs: 75 },
  { id: 40, nameArabic: 'سُورَةُ غَافِر', nameEnglish: 'Surah Ghafir', meaningEnglish: 'The Forgiver', revelation: 'Meccan', totalAyahs: 85 },
  { id: 41, nameArabic: 'سُورَةُ فُصِّلَت', nameEnglish: 'Surah Fussilat', meaningEnglish: 'Expounded', revelation: 'Meccan', totalAyahs: 54 },
  { id: 42, nameArabic: 'سُورَةُ الشُّورَى', nameEnglish: 'Surah Ash-Shura', meaningEnglish: 'The Consultation', revelation: 'Meccan', totalAyahs: 53 },
  { id: 43, nameArabic: 'سُورَةُ الزُّخْرُف', nameEnglish: 'Surah Az-Zukhruf', meaningEnglish: 'The Gold Ornaments', revelation: 'Meccan', totalAyahs: 89 },
  { id: 44, nameArabic: 'سُورَةُ الدُّخَان', nameEnglish: 'Surah Ad-Dukhan', meaningEnglish: 'The Smoke', revelation: 'Meccan', totalAyahs: 59 },
  { id: 45, nameArabic: 'سُورَةُ الجَاثِيَة', nameEnglish: 'Surah Al-Jathiyah', meaningEnglish: 'The Kneeling', revelation: 'Meccan', totalAyahs: 37 },
  { id: 46, nameArabic: 'سُورَةُ الأَحْقَاف', nameEnglish: 'Surah Al-Ahqaf', meaningEnglish: 'The Winding Sand-tracts', revelation: 'Meccan', totalAyahs: 35 },
  { id: 47, nameArabic: 'سُورَةُ مُحَمَّد', nameEnglish: 'Surah Muhammad', meaningEnglish: 'Muhammad', revelation: 'Medinan', totalAyahs: 38 },
  { id: 48, nameArabic: 'سُورَةُ الفَتْح', nameEnglish: 'Surah Al-Fath', meaningEnglish: 'The Victory', revelation: 'Medinan', totalAyahs: 29 },
  { id: 49, nameArabic: 'سُورَةُ الحُجُرَات', nameEnglish: 'Surah Al-Hujurat', meaningEnglish: 'The Dwellings', revelation: 'Medinan', totalAyahs: 18 },
  { id: 50, nameArabic: 'سُورَةُ ق', nameEnglish: 'Surah Qaf', meaningEnglish: 'The Letter Qaf', revelation: 'Meccan', totalAyahs: 45 },
  { id: 51, nameArabic: 'سُورَةُ الذَّارِيَات', nameEnglish: 'Surah Adh-Dhariyat', meaningEnglish: 'The Scatterers', revelation: 'Meccan', totalAyahs: 60 },
  { id: 52, nameArabic: 'سُورَةُ الطُّور', nameEnglish: 'Surah At-Tur', meaningEnglish: 'The Mount', revelation: 'Meccan', totalAyahs: 49 },
  { id: 53, nameArabic: 'سُورَةُ النَّجْم', nameEnglish: 'Surah An-Najm', meaningEnglish: 'The Star', revelation: 'Meccan', totalAyahs: 62 },
  { id: 54, nameArabic: 'سُورَةُ القَمَر', nameEnglish: 'Surah Al-Qamar', meaningEnglish: 'The Moon', revelation: 'Meccan', totalAyahs: 55 },
  { id: 55, nameArabic: 'سُورَةُ الرَّحْمَٰن', nameEnglish: 'Surah Ar-Rahman', meaningEnglish: 'The Most Merciful', revelation: 'Medinan', totalAyahs: 78 },
  { id: 56, nameArabic: 'سُورَةُ الوَاقِعَة', nameEnglish: 'Surah Al-Waqi\'ah', meaningEnglish: 'The Inevitable', revelation: 'Meccan', totalAyahs: 96 },
  { id: 57, nameArabic: 'سُورَةُ الحَدِيد', nameEnglish: 'Surah Al-Hadid', meaningEnglish: 'The Iron', revelation: 'Medinan', totalAyahs: 29 },
  { id: 58, nameArabic: 'سُورَةُ المُجَادَلَة', nameEnglish: 'Surah Al-Mujadila', meaningEnglish: 'The Pleading Woman', revelation: 'Medinan', totalAyahs: 22 },
  { id: 59, nameArabic: 'سُورَةُ الحَشْر', nameEnglish: 'Surah Al-Hashr', meaningEnglish: 'The Exile', revelation: 'Medinan', totalAyahs: 24 },
  { id: 60, nameArabic: 'سُورَةُ المُمْتَحَنَة', nameEnglish: 'Surah Al-Mumtahanah', meaningEnglish: 'She That Is Examined', revelation: 'Medinan', totalAyahs: 13 },
  { id: 61, nameArabic: 'سُورَةُ الصَّفّ', nameEnglish: 'Surah As-Saff', meaningEnglish: 'The Ranks', revelation: 'Medinan', totalAyahs: 14 },
  { id: 62, nameArabic: 'سُورَةُ الجُمُعَة', nameEnglish: 'Surah Al-Jumu\'ah', meaningEnglish: 'The Congregation', revelation: 'Medinan', totalAyahs: 11 },
  { id: 63, nameArabic: 'سُورَةُ المُنَافِقُون', nameEnglish: 'Surah Al-Munafiqun', meaningEnglish: 'The Hypocrites', revelation: 'Medinan', totalAyahs: 11 },
  { id: 64, nameArabic: 'سُورَةُ التَّغَابُن', nameEnglish: 'Surah At-Taghabun', meaningEnglish: 'Mutual Disillusion', revelation: 'Medinan', totalAyahs: 18 },
  { id: 65, nameArabic: 'سُورَةُ الطَّلَاق', nameEnglish: 'Surah At-Talaq', meaningEnglish: 'The Divorce', revelation: 'Medinan', totalAyahs: 12 },
  { id: 66, nameArabic: 'سُورَةُ التَّحْرِيم', nameEnglish: 'Surah At-Tahrim', meaningEnglish: 'The Prohibition', revelation: 'Medinan', totalAyahs: 12 },
  { id: 67, nameArabic: 'سُورَةُ المُلْك', nameEnglish: 'Surah Al-Mulk', meaningEnglish: 'The Sovereignty', revelation: 'Meccan', totalAyahs: 30 },
  { id: 68, nameArabic: 'سُورَةُ القَلَم', nameEnglish: 'Surah Al-Qalam', meaningEnglish: 'The Pen', revelation: 'Meccan', totalAyahs: 52 },
  { id: 69, nameArabic: 'سُورَةُ الحَاقَّة', nameEnglish: 'Surah Al-Haqqah', meaningEnglish: 'The Inevitable Reality', revelation: 'Meccan', totalAyahs: 52 },
  { id: 70, nameArabic: 'سُورَةُ المَعَارِج', nameEnglish: 'Surah Al-Ma\'arij', meaningEnglish: 'The Ascending Stairways', revelation: 'Meccan', totalAyahs: 44 },
  { id: 71, nameArabic: 'سُورَةُ نُوح', nameEnglish: 'Surah Nuh', meaningEnglish: 'Noah', revelation: 'Meccan', totalAyahs: 28 },
  { id: 72, nameArabic: 'سُورَةُ الجِنّ', nameEnglish: 'Surah Al-Jinn', meaningEnglish: 'The Jinn', revelation: 'Meccan', totalAyahs: 28 },
  { id: 73, nameArabic: 'سُورَةُ المُزَّمِّل', nameEnglish: 'Surah Al-Muzzammil', meaningEnglish: 'The Enshrouded One', revelation: 'Meccan', totalAyahs: 20 },
  { id: 74, nameArabic: 'سُورَةُ المُدَّثِّر', nameEnglish: 'Surah Al-Muddaththir', meaningEnglish: 'The Cloaked One', revelation: 'Meccan', totalAyahs: 56 },
  { id: 75, nameArabic: 'سُورَةُ القِيَامَة', nameEnglish: 'Surah Al-Qiyamah', meaningEnglish: 'The Resurrection', revelation: 'Meccan', totalAyahs: 40 },
  { id: 76, nameArabic: 'سُورَةُ الإِنْسَان', nameEnglish: 'Surah Al-Insan', meaningEnglish: 'The Human', revelation: 'Medinan', totalAyahs: 31 },
  { id: 77, nameArabic: 'سُورَةُ المُرْسَلَات', nameEnglish: 'Surah Al-Mursalat', meaningEnglish: 'The Emissaries', revelation: 'Meccan', totalAyahs: 50 },
  { id: 78, nameArabic: 'سُورَةُ النَّبَأ', nameEnglish: 'Surah An-Naba', meaningEnglish: 'The Tidings', revelation: 'Meccan', totalAyahs: 40 },
  { id: 79, nameArabic: 'سُورَةُ النَّازِعَات', nameEnglish: 'Surah An-Nazi\'at', meaningEnglish: 'Those Who Drag Forth', revelation: 'Meccan', totalAyahs: 46 },
  { id: 80, nameArabic: 'سُورَةُ عَبَسَ', nameEnglish: 'Surah \'Abasa', meaningEnglish: 'He Frowned', revelation: 'Meccan', totalAyahs: 42 },
  { id: 81, nameArabic: 'سُورَةُ التَّكْوِير', nameEnglish: 'Surah At-Takwir', meaningEnglish: 'The Overthrowing', revelation: 'Meccan', totalAyahs: 29 },
  { id: 82, nameArabic: 'سُورَةُ الانْفِطَار', nameEnglish: 'Surah Al-Infitar', meaningEnglish: 'The Cleaving', revelation: 'Meccan', totalAyahs: 19 },
  { id: 83, nameArabic: 'سُورَةُ المُطَفِّفِين', nameEnglish: 'Surah Al-Mutaffifin', meaningEnglish: 'The Defrauding', revelation: 'Meccan', totalAyahs: 36 },
  { id: 84, nameArabic: 'سُورَةُ الانْشِقَاق', nameEnglish: 'Surah Al-Inshiqaq', meaningEnglish: 'The Splitting Open', revelation: 'Meccan', totalAyahs: 25 },
  { id: 85, nameArabic: 'سُورَةُ البُرُوج', nameEnglish: 'Surah Al-Buruj', meaningEnglish: 'The Mansions of the Stars', revelation: 'Meccan', totalAyahs: 22 },
  { id: 86, nameArabic: 'سُورَةُ الطَّارِق', nameEnglish: 'Surah At-Tariq', meaningEnglish: 'The Nightcomer', revelation: 'Meccan', totalAyahs: 17 },
  { id: 87, nameArabic: 'سُورَةُ الأَعْلَى', nameEnglish: 'Surah Al-A\'la', meaningEnglish: 'The Most High', revelation: 'Meccan', totalAyahs: 19 },
  { id: 88, nameArabic: 'سُورَةُ الغَاشِيَة', nameEnglish: 'Surah Al-Ghashiyah', meaningEnglish: 'The Overwhelming Event', revelation: 'Meccan', totalAyahs: 26 },
  { id: 89, nameArabic: 'سُورَةُ الفَجْر', nameEnglish: 'Surah Al-Fajr', meaningEnglish: 'The Dawn', revelation: 'Meccan', totalAyahs: 30 },
  { id: 90, nameArabic: 'سُورَةُ البَلَد', nameEnglish: 'Surah Al-Balad', meaningEnglish: 'The City', revelation: 'Meccan', totalAyahs: 20 },
  { id: 91, nameArabic: 'سُورَةُ الشَّمْس', nameEnglish: 'Surah Ash-Shams', meaningEnglish: 'The Sun', revelation: 'Meccan', totalAyahs: 15 },
  { id: 92, nameArabic: 'سُورَةُ اللَّيْل', nameEnglish: 'Surah Al-Layl', meaningEnglish: 'The Night', revelation: 'Meccan', totalAyahs: 21 },
  { id: 93, nameArabic: 'سُورَةُ الضُّحَى', nameEnglish: 'Surah Ad-Duha', meaningEnglish: 'The Morning Hours', revelation: 'Meccan', totalAyahs: 11 },
  { id: 94, nameArabic: 'سُورَةُ الشَّرْح', nameEnglish: 'Surah Ash-Sharh', meaningEnglish: 'The Relief', revelation: 'Meccan', totalAyahs: 8 },
  { id: 95, nameArabic: 'سُورَةُ التِّين', nameEnglish: 'Surah At-Tin', meaningEnglish: 'The Fig', revelation: 'Meccan', totalAyahs: 8 },
  { id: 96, nameArabic: 'سُورَةُ العَلَق', nameEnglish: 'Surah Al-\'Alaq', meaningEnglish: 'The Clot', revelation: 'Meccan', totalAyahs: 19 },
  { id: 97, nameArabic: 'سُورَةُ القَدْر', nameEnglish: 'Surah Al-Qadr', meaningEnglish: 'The Power', revelation: 'Meccan', totalAyahs: 5 },
  { id: 98, nameArabic: 'سُورَةُ البَيِّنَة', nameEnglish: 'Surah Al-Bayyinah', meaningEnglish: 'The Clear Proof', revelation: 'Medinan', totalAyahs: 8 },
  { id: 99, nameArabic: 'سُورَةُ الزَّلْزَلَة', nameEnglish: 'Surah Az-Zalzalah', meaningEnglish: 'The Earthquake', revelation: 'Medinan', totalAyahs: 8 },
  { id: 100, nameArabic: 'سُورَةُ العَادِيَات', nameEnglish: 'Surah Al-\'Adiyat', meaningEnglish: 'The Courser', revelation: 'Meccan', totalAyahs: 11 },
  { id: 101, nameArabic: 'سُورَةُ القَارِعَة', nameEnglish: 'Surah Al-Qari\'ah', meaningEnglish: 'The Calamity', revelation: 'Meccan', totalAyahs: 11 },
  { id: 102, nameArabic: 'سُورَةُ التَّكَاثُر', nameEnglish: 'Surah At-Takathur', meaningEnglish: 'The Rivalry in World Increase', revelation: 'Meccan', totalAyahs: 8 },
  { id: 103, nameArabic: 'سُورَةُ العَصْر', nameEnglish: 'Surah Al-\'Asr', meaningEnglish: 'The Declining Day', revelation: 'Meccan', totalAyahs: 3 },
  { id: 104, nameArabic: 'سُورَةُ الهُمَزَة', nameEnglish: 'Surah Al-Humazah', meaningEnglish: 'The Traducer', revelation: 'Meccan', totalAyahs: 9 },
  { id: 105, nameArabic: 'سُورَةُ الفِيل', nameEnglish: 'Surah Al-Fil', meaningEnglish: 'The Elephant', revelation: 'Meccan', totalAyahs: 5 },
  { id: 106, nameArabic: 'سُورَةُ قُرَيْش', nameEnglish: 'Surah Quraysh', meaningEnglish: 'Quraysh', revelation: 'Meccan', totalAyahs: 4 },
  { id: 107, nameArabic: 'سُورَةُ المَاعُون', nameEnglish: 'Surah Al-Ma\'un', meaningEnglish: 'The Small Kindness', revelation: 'Meccan', totalAyahs: 7 },
  { id: 108, nameArabic: 'سُورَةُ الكَوْثَر', nameEnglish: 'Surah Al-Kawthar', meaningEnglish: 'The Abundance', revelation: 'Meccan', totalAyahs: 3 },
  { id: 109, nameArabic: 'سُورَةُ الكَافِرُون', nameEnglish: 'Surah Al-Kafirun', meaningEnglish: 'The Disbelievers', revelation: 'Meccan', totalAyahs: 6 },
  { id: 110, nameArabic: 'سُورَةُ النَّصْر', nameEnglish: 'Surah An-Nasr', meaningEnglish: 'The Divine Support', revelation: 'Medinan', totalAyahs: 3 },
  { id: 111, nameArabic: 'سُورَةُ المَسَد', nameEnglish: 'Surah Al-Masad', meaningEnglish: 'The Palm Fiber', revelation: 'Meccan', totalAyahs: 5 },
  { id: 112, nameArabic: 'سُورَةُ الإِخْلَاص', nameEnglish: 'Surah Al-Ikhlas', meaningEnglish: 'The Sincerity', revelation: 'Meccan', totalAyahs: 4 },
  { id: 113, nameArabic: 'سُورَةُ الفَلَق', nameEnglish: 'Surah Al-Falaq', meaningEnglish: 'The Daybreak', revelation: 'Meccan', totalAyahs: 5 },
  { id: 114, nameArabic: 'سُورَةُ النَّاس', nameEnglish: 'Surah An-Nas', meaningEnglish: 'Mankind', revelation: 'Meccan', totalAyahs: 6 }
];

const SURAH_INDEX_MAP = new Map<number, SurahMeta>();
ALL_114_SURAHS.forEach(s => SURAH_INDEX_MAP.set(s.id, s));

/**
 * Returns Surah metadata by number (1-114)
 */
export function getSurahMeta(surahNumber: number): SurahMeta {
  const meta = SURAH_INDEX_MAP.get(surahNumber);
  if (meta) return meta;
  return {
    id: surahNumber,
    nameArabic: `سُورَةُ رقم ${surahNumber}`,
    nameEnglish: `Surah ${surahNumber}`,
    meaningEnglish: '',
    revelation: 'Meccan',
    totalAyahs: 0
  };
}

/**
 * Formats the Surah Header text for display atop the video/canvas
 */
export function formatSurahHeader(
  surahNumber: number,
  format: 'both' | 'arabic' | 'english' | 'numbered' = 'both'
): string {
  const s = getSurahMeta(surahNumber);
  switch (format) {
    case 'arabic':
      return s.nameArabic;
    case 'english':
      return s.nameEnglish;
    case 'numbered':
      return `${s.nameArabic} (${s.id}) • ${s.nameEnglish}`;
    case 'both':
    default:
      return `${s.nameArabic} • ${s.nameEnglish}`;
  }
}

/**
 * Famous Pre-compiled Mix Collections (Manzil, 40 Rabbana Duas, Ruqyah, etc.)
 */
export interface MixAyahTarget {
  surah: number;
  ayah: number;
}

export interface MixCollectionPreset {
  id: string;
  nameUrdu: string;
  nameEnglish: string;
  description: string;
  rawString: string;
}

export const FAMOUS_MIX_COLLECTIONS: MixCollectionPreset[] = [
  {
    id: 'manzil',
    nameUrdu: 'منزل (۳۳ شفاء و حفاظت کی قرآنی آیات)',
    nameEnglish: 'Manzil (33 Healing & Protection Verses)',
    description: 'Surah Al-Fatihah, Al-Baqarah, Aal-Imran, Al-A\'raf, Al-Isra, Al-Mu\'minun, As-Saffat, Ar-Rahman, Al-Hashr, Al-Jinn, 4 Quls',
    rawString: '1:1-7, 2:1-5, 2:163, 2:255-257, 2:284-286, 3:18, 3:26-27, 7:54-56, 17:110-111, 23:115-118, 37:1-11, 55:33-40, 59:21-24, 72:1-4, 109:1-6, 112:1-4, 113:1-5, 114:1-6'
  },
  {
    id: '40_rabbana',
    nameUrdu: '۴۰ ربنا قرآنی دعائیں (مکمل)',
    nameEnglish: '40 Rabbana Quranic Duas',
    description: 'All 40 Rabbana Duas from across various Surahs',
    rawString: '2:127, 2:128, 2:201, 2:250, 2:286, 3:8, 3:9, 3:16, 3:53, 3:191, 3:192, 3:193, 3:194, 7:23, 7:47, 7:89, 7:126, 10:85-86, 14:38, 14:40, 14:41, 18:10, 21:87, 21:89, 23:109, 23:118, 25:65, 25:74, 27:19, 28:16, 40:7, 59:10, 60:4, 60:5, 66:8, 66:11, 71:28'
  },
  {
    id: 'ayatul_kursi_amanar_rasool',
    nameUrdu: 'آیت الکرسی اور آمن الرسول (۲:۲۵۵-۲۵۷، ۲:۲۸۵-۲۸۶)',
    nameEnglish: 'Ayat-ul-Kursi & Amanar-Rasool',
    description: 'Surah Al-Baqarah 255-257 and last two ayahs 285-286',
    rawString: '2:255-257, 2:285-286'
  },
  {
    id: 'ruqyah_shifa',
    nameUrdu: 'آیات شفاء و رقیہ شرعیہ',
    nameEnglish: 'Ruqyah Shariah & 6 Healing Verses',
    description: 'Verses of Shifa (9:14, 10:57, 16:69, 17:82, 26:80, 41:44) + 4 Quls',
    rawString: '9:14, 10:57, 16:69, 17:82, 26:80, 41:44, 109:1-6, 112:1-4, 113:1-5, 114:1-6'
  },
  {
    id: 'four_quls',
    nameUrdu: 'چاروں قل (۱۰۹، ۱۱۲، ۱۱۳، ۱۱۴)',
    nameEnglish: '4 Quls (Kafirun, Ikhlas, Falaq, Nas)',
    description: 'Surahs 109, 112, 113, 114 complete',
    rawString: '109:1-6, 112:1-4, 113:1-5, 114:1-6'
  },
  {
    id: 'last_10_surahs',
    nameUrdu: 'آخری ۱۰ سورتیں (فیل تا ناس)',
    nameEnglish: 'Last 10 Surahs (Al-Fil to An-Nas)',
    description: 'Surahs 105 through 114 complete',
    rawString: '105:1-5, 106:1-4, 107:1-7, 108:1-3, 109:1-6, 110:1-3, 111:1-5, 112:1-4, 113:1-5, 114:1-6'
  }
];

/**
 * Parses user input or preset string into sequential ordered MixAyahTarget array
 * Accepts formats:
 * - "2:255" -> Surah 2 Ayah 255
 * - "2:255-257" -> Surah 2 Ayahs 255, 256, 257
 * - "112" -> Surah 112 all ayahs
 * - "1:1-7, 2:1-5, 3:18"
 */
export function parseMixedAyahsString(input: string): MixAyahTarget[] {
  if (!input || !input.trim()) return [];
  const results: MixAyahTarget[] = [];
  const tokens = input.split(/[,;\n]+/).map(t => t.trim()).filter(Boolean);

  for (const token of tokens) {
    if (token.includes(':')) {
      const [surahPart, ayahPart] = token.split(':').map(s => s.trim());
      const surahNum = parseInt(surahPart, 10);
      if (isNaN(surahNum) || surahNum < 1 || surahNum > 114) continue;

      const surahMeta = getSurahMeta(surahNum);
      const maxAyah = surahMeta.totalAyahs || 286;

      if (ayahPart.includes('-')) {
        const [startStr, endStr] = ayahPart.split('-').map(s => s.trim());
        const startA = Math.max(1, parseInt(startStr, 10) || 1);
        const endA = Math.min(maxAyah, parseInt(endStr, 10) || startA);
        for (let a = Math.min(startA, endA); a <= Math.max(startA, endA); a++) {
          results.push({ surah: surahNum, ayah: a });
        }
      } else {
        const ayahNum = parseInt(ayahPart, 10);
        if (!isNaN(ayahNum) && ayahNum >= 1 && ayahNum <= maxAyah) {
          results.push({ surah: surahNum, ayah: ayahNum });
        }
      }
    } else {
      // Standalone surah number (e.g. "112" or "113")
      const surahNum = parseInt(token, 10);
      if (!isNaN(surahNum) && surahNum >= 1 && surahNum <= 114) {
        const surahMeta = getSurahMeta(surahNum);
        const maxAyah = surahMeta.totalAyahs || 7;
        for (let a = 1; a <= maxAyah; a++) {
          results.push({ surah: surahNum, ayah: a });
        }
      }
    }
  }

  return results;
}
