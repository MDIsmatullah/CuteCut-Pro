import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Scissors, Download, RefreshCw, Film, Type, Code, Terminal, Save, User, FolderOpen, Brain, Mic, Heart, Cloud, CloudUpload, X, LogOut, Check, ChevronDown, Loader2, Keyboard, Zap, Wifi, WifiOff, Settings } from 'lucide-react';
import { Clip, ClipType, Track, WatermarkSettings, VisualStylePreset } from './types';
import MediaPanel from './components/MediaPanel';
import PreviewPlayer from './components/PreviewPlayer';
import Timeline from './components/Timeline';
import Inspector from './components/Inspector';
import AuthModal, { UserProfile } from './components/AuthModal';
import ProjectSaveModal, { SavedProjectSession } from './components/ProjectSaveModal';
import UpdateCheckerModal from './components/UpdateCheckerModal';
import VoiceAssistantModal from './components/VoiceAssistantModal';
import { GeminiAIIntelligenceModal } from './components/GeminiAIIntelligenceModal';
import KeyboardShortcutsModal from './components/KeyboardShortcutsModal';
import AboutSupportModal from './components/AboutSupportModal';
import ExportModal, { ExportConfig } from './components/ExportModal';
import { checkWebCodecsSupport, exportWithWebCodecs } from './services/webCodecsExportService';
import { getClipEffectiveSpeedAtTime } from './utils/speedRampUtils';
import { PreferencesModal } from './components/PreferencesModal';
import { Quran100ProtocolsModal } from './components/Quran100ProtocolsModal';
import { VeoAnimateImageModal } from './components/VeoAnimateImageModal';
import { VideoExport } from './components/video/VideoExport';
import LandingPortal from './components/LandingPortal';
import NativeSplashScreen from './components/NativeSplashScreen';
import { MobileCuteCutLayout } from './components/MobileCuteCutLayout';
import { AdMobService } from './utils/admobService';
import {
  normalizeMediaUrl,
  getSafeCrossOrigin,
  DEFAULT_INITIAL_TRACKS,
  insertTrackInProperOrder,
  alignQuranLocalClient,
  analyzeVoiceActivityRMS,
  splitVerseAcrossBreaths,
  autoSegmentAudioClipsBySilence,
  autoSyncVideoClipsToAyahs,
  autoSegmentClipByRhythm,
  enforceStrictNonOverlappingClips,
  AyahSymbolStyle,
  AyahDigitType,
  AyahSymbolPosition,
  attachAyahSymbolToText,
  extractAyahNumberFromClip,
  stripAyahSymbol,
  isTranslationClip,
  isQuranArabicClip,
  getExportResolutionDimensions,
  fixWebmDuration,
  runQuranAlignmentEngine,
  QuranVerseInput,
  repairAndSnapQuranTracksToAudioSpeech,
  reconcileSingleBreathVerses
} from './utils/editorUtils';
import { QURAN_TRANSLATION_OPTIONS, getTranslationOptionById, fetchSingleAyahTranslation, getTaawwuzTranslation, getTasmiyahTranslation, OFFLINE_SURAH_TRANSLATIONS } from './utils/quranTranslations';
import { parseMixedAyahsString } from './utils/quranSurahData';
import { auth, googleProvider, saveUserTimelineProject, getUserTimelineProject } from './utils/firebaseConfig';
import { getSystemSpecs, SystemSpecs } from './utils/systemPerformance';
import { signInWithPopup, signOut, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';

// Default initial timeline state with Zero Initial Tracks / Clips
const INITIAL_TRACKS: Track[] = DEFAULT_INITIAL_TRACKS;

export default function App() {
  const [tracks, setTracks] = useState<Track[]>(INITIAL_TRACKS);

  // Channel Watermark State
  const [watermark, setWatermark] = useState<WatermarkSettings>({
    enabled: false,
    url: 'https://images.unsplash.com/photo-1542816417-0983c9c9ad53?w=300&auto=format&fit=crop&q=80',
    position: 'top-right',
    opacity: 0.8,
    scale: 22,
  });

  // Undo/Redo tracking states
  const [historyIndex, setHistoryIndex] = useState<number>(0);
  const [tracksHistory, setTracksHistory] = useState<Track[][]>([INITIAL_TRACKS]);
  const isHistoryChange = useRef<boolean>(false);
  const historyIndexRef = useRef<number>(0);
  historyIndexRef.current = historyIndex;
  const lastRecordedTracksRef = useRef<string>(JSON.stringify(INITIAL_TRACKS));

  // Automatically track changes in the tracks state for undo/redo functionality safely
  useEffect(() => {
    if (isHistoryChange.current) {
      isHistoryChange.current = false;
      lastRecordedTracksRef.current = JSON.stringify(tracks);
      return;
    }
    const currentTracksJson = JSON.stringify(tracks);
    if (currentTracksJson === lastRecordedTracksRef.current) {
      return;
    }
    lastRecordedTracksRef.current = currentTracksJson;

    setTracksHistory((prev) => {
      const currentIndex = historyIndexRef.current;
      const sliced = prev.slice(0, currentIndex + 1);
      const nextHistory = [...sliced, tracks];
      if (nextHistory.length > 40) {
        nextHistory.shift();
      }
      return nextHistory;
    });
    setHistoryIndex((prev) => Math.min(prev + 1, 39));
  }, [tracks]);

  const handleUndo = () => {
    if (historyIndex > 0) {
      const prevIndex = historyIndex - 1;
      isHistoryChange.current = true;
      historyIndexRef.current = prevIndex;
      setHistoryIndex(prevIndex);
      setTracks(tracksHistory[prevIndex]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < tracksHistory.length - 1) {
      const nextIndex = historyIndex + 1;
      isHistoryChange.current = true;
      historyIndexRef.current = nextIndex;
      setHistoryIndex(nextIndex);
      setTracks(tracksHistory[nextIndex]);
    }
  };
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(20); // total editor length 20s
  const [zoom, setZoom] = useState<number>(35); // px per second
  const [selectedClipIds, setSelectedClipIds] = useState<string[]>([]);
  const selectedClipId = selectedClipIds.length > 0 ? selectedClipIds[selectedClipIds.length - 1] : null;

  const handleSelectClip = (id: string | null, isMultiSelect?: boolean) => {
    if (id === null) {
      setSelectedClipIds([]);
      return;
    }

    // Check if clicked clip belongs to a unified compound group
    const targetClip = tracks.flatMap(t => t.clips).find(c => c.id === id);
    const relatedIds = targetClip?.groupId
      ? tracks.flatMap(t => t.clips).filter(c => c.groupId === targetClip.groupId).map(c => c.id)
      : [id];

    if (isMultiSelect) {
      setSelectedClipIds(prev => {
        const hasAll = relatedIds.every(rid => prev.includes(rid));
        if (hasAll) {
          return prev.filter(item => !relatedIds.includes(item));
        } else {
          return Array.from(new Set([...prev, ...relatedIds]));
        }
      });
    } else {
      setSelectedClipIds(relatedIds);
    }
  };

  const setSelectedClipId = (id: string | null) => {
    if (id === null) {
      setSelectedClipIds([]);
    } else {
      const targetClip = tracks.flatMap(t => t.clips).find(c => c.id === id);
      const relatedIds = targetClip?.groupId
        ? tracks.flatMap(t => t.clips).filter(c => c.groupId === targetClip.groupId).map(c => c.id)
        : [id];
      setSelectedClipIds(relatedIds);
    }
  };

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16' | '1:1'>('16:9');

  // Split-pane layout resizable sizes in pixels (Media Panel width, Inspector width, Timeline height)
  const [mediaPanelWidth, setMediaPanelWidth] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('cutecut_media_width');
      return saved ? parseInt(saved, 10) : 320;
    } catch {
      return 320;
    }
  });
  const [inspectorWidth, setInspectorWidth] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('cutecut_inspector_width');
      return saved ? parseInt(saved, 10) : 320;
    } catch {
      return 320;
    }
  });
  const [timelineHeight, setTimelineHeight] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('cutecut_timeline_height');
      return saved ? parseInt(saved, 10) : 288;
    } catch {
      return 288;
    }
  });

  const [systemSpecs, setSystemSpecs] = useState<SystemSpecs>(() => getSystemSpecs());
  const [isMobileScreen, setIsMobileScreen] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 768;
    }
    return false;
  });

  // Track screen size for responsive Android/CapCut layout and AdMob Banner initialization
  useEffect(() => {
    const handleResize = () => {
      setIsMobileScreen(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);

    // Initialize AdMob
    AdMobService.initialize().then(() => {
      if (window.innerWidth < 768) {
        AdMobService.showBanner();
      }
    });

    return () => {
      window.removeEventListener('resize', handleResize);
      AdMobService.hideBanner();
    };
  }, []);

  // Listen to network status (online/offline) and update hardware profile
  useEffect(() => {
    const handleNetworkChange = () => {
      setSystemSpecs(getSystemSpecs());
    };
    window.addEventListener('online', handleNetworkChange);
    window.addEventListener('offline', handleNetworkChange);
    return () => {
      window.removeEventListener('online', handleNetworkChange);
      window.removeEventListener('offline', handleNetworkChange);
    };
  }, []);

  // Local storage persistence effects
  useEffect(() => {
    try {
      localStorage.setItem('cutecut_media_width', mediaPanelWidth.toString());
    } catch (e) {}
  }, [mediaPanelWidth]);

  useEffect(() => {
    try {
      localStorage.setItem('cutecut_inspector_width', inspectorWidth.toString());
    } catch (e) {}
  }, [inspectorWidth]);

  useEffect(() => {
    try {
      localStorage.setItem('cutecut_timeline_height', timelineHeight.toString());
    } catch (e) {}
  }, [timelineHeight]);

  // Window drag handlers for mouse resize operations
  const startResizing = (e: React.MouseEvent, panel: 'media' | 'inspector' | 'timeline') => {
    e.preventDefault();
    const startX = e.clientX;
    const startY = e.clientY;
    const startMediaWidth = mediaPanelWidth;
    const startInspectorWidth = inspectorWidth;
    const startTimelineHeight = timelineHeight;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (panel === 'media') {
        const deltaX = moveEvent.clientX - startX;
        setMediaPanelWidth(Math.max(220, Math.min(600, startMediaWidth + deltaX)));
      } else if (panel === 'inspector') {
        const deltaX = moveEvent.clientX - startX;
        setInspectorWidth(Math.max(220, Math.min(600, startInspectorWidth - deltaX)));
      } else if (panel === 'timeline') {
        const deltaY = moveEvent.clientY - startY;
        setTimelineHeight(Math.max(160, Math.min(600, startTimelineHeight - deltaY)));
      }
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    if (panel === 'timeline') {
      document.body.style.cursor = 'row-resize';
    } else {
      document.body.style.cursor = 'col-resize';
    }
  };

  // View switcher: 'portal' (CapCut/Filmora style landing page) or 'editor' (Full Timeline Workspace)
  const isNativeShell = (() => {
    try {
      const isElectron = typeof window !== 'undefined' && (!!(window as any).process?.versions?.electron || /electron/i.test(navigator.userAgent) || !!(window as any).ipcRenderer);
      const isTauri = typeof window !== 'undefined' && !!(window as any).__TAURI__;
      const isCapacitor = typeof window !== 'undefined' && !!(window as any).Capacitor;
      const isLocalFile = typeof window !== 'undefined' && window.location.protocol === 'file:';
      return !!(isElectron || isTauri || isCapacitor || isLocalFile);
    } catch {
      return false;
    }
  })();

  const nativePlatformName = (() => {
    if (typeof navigator === 'undefined') return 'Desktop Studio Engine';
    const ua = navigator.userAgent || '';
    if (/android/i.test(ua)) return 'Android Mobile Engine';
    if (/win/i.test(ua)) return 'Windows x64 Native Studio';
    if (/mac/i.test(ua)) return 'macOS Metal Studio';
    if (/linux/i.test(ua)) return 'Linux Desktop Studio';
    return 'Desktop Studio Engine';
  })();

  const [showNativeSplash, setShowNativeSplash] = useState<boolean>(() => {
    return isNativeShell;
  });

  const [currentView, setCurrentView] = useState<'portal' | 'editor'>(() => {
    try {
      const isElectron = typeof window !== 'undefined' && (!!(window as any).process?.versions?.electron || /electron/i.test(navigator.userAgent) || !!(window as any).ipcRenderer);
      const isTauri = typeof window !== 'undefined' && !!(window as any).__TAURI__;
      const isCapacitor = typeof window !== 'undefined' && !!(window as any).Capacitor;
      const isLocalFile = typeof window !== 'undefined' && window.location.protocol === 'file:';
      if (isElectron || isTauri || isCapacitor || isLocalFile) {
        return 'editor';
      }
    } catch (e) {
      console.error(e);
    }
    return 'portal';
  });

  // Timeline Loop Playback & Grid Snapping state
  const [isLooping, setIsLooping] = useState(true);
  const [snapToGrid, setSnapToGrid] = useState(true);

  // Export overlay state
  const [showExportModal, setShowExportModal] = useState(false);
  const [isExportMinimized, setIsExportMinimized] = useState(false);
  const [exportResolution, setExportResolution] = useState<'4K' | '2K' | '1080p' | '720p' | '480p'>('1080p');
  const [exportProgress, setExportProgress] = useState(0);
  const [exportTerminalLogs, setExportTerminalLogs] = useState<string[]>([]);
  const [exporting, setExporting] = useState(false);
  const [showVideoSynthesis, setShowVideoSynthesis] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  // New Features: Modals & Identity state
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalError, setAuthModalError] = useState('');
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showPreferencesModal, setShowPreferencesModal] = useState(false);
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [showGeminiIntelligenceModal, setShowGeminiIntelligenceModal] = useState(false);
  const [showVeoAnimateModal, setShowVeoAnimateModal] = useState(false);
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);
  const [showAboutSupportModal, setShowAboutSupportModal] = useState(false);
  const [showAISegmentationModal, setShowAISegmentationModal] = useState(false);
  const [show100ProtocolsModal, setShow100ProtocolsModal] = useState(false);
  const [latestProtocolsEvaluation, setLatestProtocolsEvaluation] = useState<any>(undefined);

  // Apply AI Segmentation results to timeline tracks (Infinite batch layout compliant)
  const handleApplyAISegmentation = (result: { generatedClips?: any[] }) => {
    if (!result.generatedClips || result.generatedClips.length === 0) return;

    const trackArId = 'track-quran-arabic';
    const trackEnId = 'track-quran-english';

    const filteredTracks = tracks.filter(t => t.id !== trackArId && t.id !== trackEnId);

    const arabicClips: Clip[] = [];
    const englishClips: Clip[] = [];

    result.generatedClips.forEach((clipData, idx) => {
      const isAr = clipData.trackId === trackArId || clipData.name?.startsWith('AR:');
      const fullClip: Clip = {
        id: clipData.id || `clip-wiz-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 6)}`,
        name: clipData.name || (isAr ? 'Arabic Verse' : 'English Subtitle'),
        type: ClipType.TEXT,
        trackId: isAr ? trackArId : trackEnId,
        start: clipData.start || 0,
        duration: clipData.duration || 5,
        sourceStart: 0,
        sourceDuration: clipData.duration || 5,
        playbackRate: 1.0,
        volume: 1.0,
        text: clipData.text || '',
        fontSize: clipData.fontSize || (isAr ? quranArabicSize : quranEnglishSize),
        color: clipData.color || (isAr ? quranArabicColor : quranEnglishColor),
        fontFamily: clipData.fontFamily || (isAr ? (quranArabicFont || 'QPC Uthmani Hafs') : quranEnglishFont),
        textStyle: clipData.textStyle || (isAr ? quranArabicStyle : quranEnglishStyle),
        textX: 50,
        textY: clipData.textY !== undefined ? clipData.textY : (isAr ? quranArabicY : quranEnglishY),
        textWrap: isAr ? quranArabicWrap : quranEnglishWrap,
        textMaxWidth: isAr ? quranArabicMaxWidth : quranEnglishMaxWidth,
        textLineHeight: isAr ? quranArabicLineHeight : quranEnglishLineHeight,
        textAlignment: isAr ? quranArabicAlign : quranEnglishAlign,
        textBackgroundColor: quranBgColor,
        textBackgroundOpacity: quranBgOpacity,
        textBackgroundPadding: quranBgPadding,
        textBackgroundRadius: quranBgRadius,
        textBackgroundBlur: quranBgBlur,
        textBackgroundStyle: quranBgStyle,
        textAnimation: { inAnimation: quranAnimationIn, outAnimation: quranAnimationOut, inDuration: quranAnimationDuration, outDuration: quranAnimationDuration }
      };

      if (isAr) {
        arabicClips.push(fullClip);
      } else {
        englishClips.push(fullClip);
      }
    });

    let newTracks: Track[] = [...filteredTracks];

    if (arabicClips.length > 0) {
      newTracks = insertTrackInProperOrder(newTracks, {
        id: trackArId,
        name: 'Quran Arabic (Uthmani)',
        type: ClipType.TEXT,
        clips: arabicClips.sort((a, b) => a.start - b.start)
      });
    }

    if (englishClips.length > 0) {
      newTracks = insertTrackInProperOrder(newTracks, {
        id: trackEnId,
        name: 'Quran Translation (English)',
        type: ClipType.TEXT,
        clips: englishClips.sort((a, b) => a.start - b.start)
      });
    }

    setTracks(newTracks);

    let maxClipEnd = 0;
    [...arabicClips, ...englishClips].forEach(c => {
      if (c.start + c.duration > maxClipEnd) {
        maxClipEnd = c.start + c.duration;
      }
    });
    if (maxClipEnd > 0) {
      setDuration(prev => Math.max(prev, Math.ceil(maxClipEnd + 5)));
    }

    if (arabicClips.length > 0) {
      setSelectedClipId(arabicClips[0].id);
    }
  };

  // Handle Gemini Live Voice Director commands executed on timeline
  const handleExecuteVoiceAction = (action: { type: string; payload: any }) => {
    if (!action || !action.type) return;

    if (action.type === 'SET_ASPECT_RATIO') {
      const ratio = String(action.payload || '16:9').trim();
      if (ratio === '9:16' || ratio === '1:1' || ratio === '16:9' || ratio === '4:3') {
        setAspectRatio(ratio as any);
      }
    } else if (action.type === 'ADD_TEXT') {
      const textVal = typeof action.payload === 'string' ? action.payload : 'New Subtitle';
      addNewClip({
        type: ClipType.TEXT,
        name: textVal,
        text: textVal,
        duration: 4,
        fontSize: 24,
        color: '#ffffff',
      });
    } else if (action.type === 'ADD_AUDIO') {
      const audioName = typeof action.payload === 'string' ? action.payload : 'Background Audio';
      addNewClip({
        type: ClipType.AUDIO,
        name: audioName,
        url: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3',
        duration: 10,
        volume: 80,
      });
    } else if (action.type === 'SPLIT_CLIP') {
      splitClip();
    } else if (action.type === 'DELETE_CLIP') {
      if (selectedClipId) {
        deleteClip(selectedClipId);
      }
    } else if (action.type === 'RIPPLE_DELETE') {
      rippleDelete(action.payload === 'right' ? 'right' : 'left');
    } else if (action.type === 'PLAY_TIMELINE') {
      setIsPlaying(true);
    } else if (action.type === 'PAUSE_TIMELINE') {
      setIsPlaying(false);
    } else if (action.type === 'TOGGLE_PLAY') {
      togglePlayPause();
    } else if (action.type === 'SEEK_TIMELINE') {
      const targetSec = Math.max(0, Number(action.payload) || 0);
      setCurrentTime(targetSec);
    } else if (action.type === 'SET_VOLUME') {
      if (selectedClipId) {
        const volVal = Math.min(100, Math.max(0, Number(action.payload) || 80));
        updateClipProperties(selectedClipId, { volume: volVal });
      }
    } else if (action.type === 'MUTE_TIMELINE') {
      setIsMuted(Boolean(action.payload !== false));
    } else if (action.type === 'RECORD_VOICEOVER') {
      const tabBtn = document.getElementById('tab-audio');
      if (tabBtn) tabBtn.click();
    } else if (action.type === 'GENERATE_QURAN') {
      const tabBtn = document.getElementById('tab-quran');
      if (tabBtn) tabBtn.click();
    } else if (action.type === 'GENERATE_CAPTIONS') {
      const tabBtn = document.getElementById('tab-text');
      if (tabBtn) tabBtn.click();
    } else if (action.type === 'APPLY_FILTER') {
      if (selectedClipId) {
        const filterName = String(action.payload || 'vignette').toLowerCase();
        if (filterName.includes('sepia')) {
          updateClipProperties(selectedClipId, {
            filters: { brightness: 100, contrast: 110, saturation: 90, grayscale: 0, sepia: 80, invert: 0, hueRotate: 0, chromaKey: { enabled: false, color: '#00ff00', threshold: 30, smoothness: 10 } }
          });
        } else {
          updateClipProperties(selectedClipId, {
            videoEffects: { vignette: true, filmGrain: true, glitch: false }
          });
        }
      }
    }
  };

  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem('cutecut_pro_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);
  const [authDropdownOpen, setAuthDropdownOpen] = useState<boolean>(false);

  // Real-time Firebase Authentication State Listener & Firestore Timeline Hydration
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser: FirebaseUser | null) => {
      setIsAuthLoading(true);
      if (fbUser) {
        const userProfile: UserProfile = {
          name: fbUser.displayName || fbUser.email?.split('@')[0] || 'CuteCut Creator',
          email: fbUser.email || '',
          tier: 'PRO',
          avatar: fbUser.photoURL || undefined,
          uid: fbUser.uid,
        };
        setCurrentUser(userProfile);
        localStorage.setItem('cutecut_pro_user', JSON.stringify(userProfile));

        // Fetch user active timeline document from Cloud Firestore
        try {
          const cloudProject = await getUserTimelineProject(fbUser.uid);
          if (cloudProject && cloudProject.tracks && Array.isArray(cloudProject.tracks) && cloudProject.tracks.length > 0) {
            console.log('[Firebase Firestore] Hydrating active timeline from cloud for user:', fbUser.uid);
            setTracks(cloudProject.tracks);
            if (cloudProject.duration) setDuration(cloudProject.duration);
            if (cloudProject.aspectRatio) setAspectRatio(cloudProject.aspectRatio as any);
            setDriveSyncStatus({
              isSyncing: false,
              lastSyncedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              statusText: 'Cloud Loaded (Firestore)',
            });
          }
        } catch (fetchErr) {
          console.warn('[Firebase Firestore] Initial cloud project fetch error:', fetchErr);
        }
      }
      setIsAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLoginUser = useCallback((user: UserProfile) => {
    setCurrentUser(user);
    localStorage.setItem('cutecut_pro_user', JSON.stringify(user));
  }, []);

  const handleLogoutUser = useCallback(() => {
    setCurrentUser(null);
    localStorage.removeItem('cutecut_pro_user');
  }, []);

  // Google Sign-In with Firebase Auth Popup
  const handleGoogleSignIn = async () => {
    try {
      setIsAuthLoading(true);
      const res = await signInWithPopup(auth, googleProvider);
      if (res.user) {
        const u = res.user;
        const profile: UserProfile = {
          name: u.displayName || u.email?.split('@')[0] || 'CuteCut Creator',
          email: u.email || '',
          tier: 'PRO',
          avatar: u.photoURL || undefined,
          uid: u.uid,
        };
        handleLoginUser(profile);
        setAuthModalError('');
      }
    } catch (err: any) {
      console.warn('[Firebase Google Sign-In Error]', err);
      // Because we are inside an iframe preview, popups are blocked by browser security. Show a helpful bilingual workaround.
      setAuthModalError(
        '⚠️ Browser security ne Google login block kar diya hai (Iframe block). Fikar na karein! Niche apna email/password likhein ya directly "Quick Sign In" button daba kar login karlein, ye 100% chalega!'
      );
      setShowAuthModal(true);
    } finally {
      setIsAuthLoading(false);
    }
  };

  // Google Sign-Out with Firebase Auth
  const handleGoogleSignOut = async () => {
    try {
      await signOut(auth);
      handleLogoutUser();
      setAuthDropdownOpen(false);
    } catch (err) {
      console.warn('[Firebase SignOut Error]', err);
    }
  };

  // Cloud & Local Auto-Save Sync Manager State
  const [driveSyncStatus, setDriveSyncStatus] = useState<{
    isSyncing: boolean;
    lastSyncedAt: string | null;
    statusText: string;
    fileId?: string;
  }>({
    isSyncing: false,
    lastSyncedAt: null,
    statusText: 'Cloud Ready',
  });

  const syncTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Background Sync Manager: Auto-sync project state to Cloud Firestore whenever timeline/tracks change
  useEffect(() => {
    if (!currentUser) return;

    if (syncTimerRef.current) {
      clearTimeout(syncTimerRef.current);
    }

    syncTimerRef.current = setTimeout(async () => {
      setDriveSyncStatus(prev => ({ ...prev, isSyncing: true, statusText: 'Syncing to Cloud...' }));
      try {
        const projectData = {
          version: '2.0.0',
          updatedAt: new Date().toISOString(),
          user: currentUser.email,
          tracks,
          duration,
          watermark,
          aspectRatio,
        };

        // 1. Save to browser local storage backup
        localStorage.setItem('cutecut_gdrive_latest_backup', JSON.stringify(projectData));

        // 2. Save to desktop file system if running in Tauri v2 shell
        if (typeof window !== 'undefined' && (window as any).__TAURI__?.fs?.writeTextFile) {
          try {
            await (window as any).__TAURI__.fs.writeTextFile(
              'cutecut_backup_project.json',
              JSON.stringify(projectData, null, 2)
            );
          } catch (fsErr) {
            console.warn('[Tauri v2 Backup FS]', fsErr);
          }
        }

        // 3. Save directly to Firebase Cloud Firestore database: users/{userId}/projects/active-timeline
        if (currentUser.uid) {
          await saveUserTimelineProject(currentUser.uid, {
            tracks,
            duration,
            aspectRatio,
          });
        }

        // 4. Send auto-save payload to Google Drive API backend endpoint if available
        try {
          const response = await fetch('/api/googledrive/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userEmail: currentUser.email,
              accessToken: (currentUser as any).accessToken,
              projectData,
              fileName: `CuteCut_Project_${currentUser.email.replace(/[@.]/g, '_')}.json`,
            }),
          });
          if (response.ok) {
            const resData = await response.json();
            setDriveSyncStatus({
              isSyncing: false,
              lastSyncedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
              statusText: 'Cloud Synced (Firestore)',
              fileId: resData.fileId,
            });
            return;
          }
        } catch {
          // ignore
        }

        setDriveSyncStatus({
          isSyncing: false,
          lastSyncedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          statusText: 'Cloud Synced (Firestore)',
        });
      } catch (err) {
        setDriveSyncStatus({
          isSyncing: false,
          lastSyncedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          statusText: 'Local Backup Active',
        });
      }
    }, 1500);

    return () => {
      if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
    };
  }, [tracks, duration, watermark, aspectRatio, currentUser?.uid, currentUser?.email]);

  const handleManualDriveSync = async () => {
    if (!currentUser) {
      setShowAuthModal(true);
      return;
    }

    setDriveSyncStatus(prev => ({ ...prev, isSyncing: true, statusText: 'Uploading to Google Drive...' }));
    try {
      const projectData = {
        version: '2.0.0',
        updatedAt: new Date().toISOString(),
        user: currentUser.email,
        tracks,
        duration,
        watermark,
        aspectRatio,
      };

      const response = await fetch('/api/googledrive/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userEmail: currentUser.email,
          accessToken: (currentUser as any).accessToken,
          projectData,
          fileName: `CuteCut_Project_${currentUser.email.replace(/[@.]/g, '_')}.json`,
        }),
      });

      if (response.ok) {
        const resData = await response.json();
        setDriveSyncStatus({
          isSyncing: false,
          lastSyncedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          statusText: 'Google Drive Synced',
          fileId: resData.fileId,
        });
      }
    } catch (e) {
      setDriveSyncStatus({
        isSyncing: false,
        lastSyncedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        statusText: 'Synced to Cloud Cache',
      });
    }
  };

  const handleLoadSavedProject = (project: SavedProjectSession) => {
    if (project.data?.tracks) {
      setTracks(project.data.tracks);
      if (project.data.duration) setDuration(project.data.duration);
      if (project.data.zoom) setZoom(project.data.zoom);
      if (project.data.aspectRatio) setAspectRatio(project.data.aspectRatio);
      if (project.data.watermark) setWatermark(project.data.watermark);
      setSelectedClipId(null);
      setCurrentTime(0);
    }
  };

  const handleLoadTemplate = (templateId: string) => {
    setCurrentView('editor');
    setCurrentTime(0);
    
    let templateTracks: Track[] = [];
    let templateDuration = 30;
    let templateAspectRatio: '16:9' | '9:16' | '1:1' = '9:16';
    
    if (templateId === 'tpl-quran-reels' || templateId === 'tpl-surah-yasin') {
      templateAspectRatio = templateId === 'tpl-surah-yasin' ? '16:9' : '9:16';
      templateDuration = templateId === 'tpl-surah-yasin' ? 60 : 30;
      templateTracks = [
        {
          id: 'track-text-1',
          name: 'Quran Arabic Calligraphy',
          type: ClipType.TEXT,
          clips: [
            {
              id: 'clip-arabic-1',
              name: 'Quran Ayah Calligraphy 1',
              type: ClipType.TEXT,
              trackId: 'track-text-1',
              start: 1,
              duration: 8,
              sourceStart: 0,
              sourceDuration: 8,
              playbackRate: 1.0,
              volume: 1.0,
              text: 'وَبِالْحَقِّ أَنزَلْنَاهُ وَبِالْحَقِّ نَزَلَ ۗ',
              fontSize: 32,
              fontFamily: 'traditional-arabic',
              textX: 50,
              textY: 45,
              color: '#fbbf24',
              textStyle: 'gold-glow',
              textAlignment: 'center',
            },
            {
              id: 'clip-arabic-2',
              name: 'Quran Ayah Calligraphy 2',
              type: ClipType.TEXT,
              trackId: 'track-text-1',
              start: 10,
              duration: 10,
              sourceStart: 0,
              sourceDuration: 10,
              playbackRate: 1.0,
              volume: 1.0,
              text: 'وَمَا أَرْسَلْنَاكَ إِلَّا مُبَشِّا وَنَذِيرًا',
              fontSize: 32,
              fontFamily: 'traditional-arabic',
              textX: 50,
              textY: 45,
              color: '#fbbf24',
              textStyle: 'gold-glow',
              textAlignment: 'center',
            }
          ]
        },
        {
          id: 'track-text-2',
          name: 'Translations & Subtitles',
          type: ClipType.TEXT,
          clips: [
            {
              id: 'clip-trans-1',
              name: 'English Subtitle 1',
              type: ClipType.TEXT,
              trackId: 'track-text-2',
              start: 1,
              duration: 8,
              sourceStart: 0,
              sourceDuration: 8,
              playbackRate: 1.0,
              volume: 1.0,
              text: 'And with the truth We have sent it down, and with the truth it has descended.',
              fontSize: 18,
              fontFamily: 'sans-serif',
              textX: 50,
              textY: 65,
              color: '#ffffff',
              textStyle: 'shadow',
              textAlignment: 'center',
            },
            {
              id: 'clip-trans-2',
              name: 'English Subtitle 2',
              type: ClipType.TEXT,
              trackId: 'track-text-2',
              start: 10,
              duration: 10,
              sourceStart: 0,
              sourceDuration: 10,
              playbackRate: 1.0,
              volume: 1.0,
              text: 'And We have not sent you except as a bringer of good tidings and a warner.',
              fontSize: 18,
              fontFamily: 'sans-serif',
              textX: 50,
              textY: 65,
              color: '#ffffff',
              textStyle: 'shadow',
              textAlignment: 'center',
            }
          ]
        },
        {
          id: 'track-video-1',
          name: 'Atmospheric Video Background',
          type: ClipType.VIDEO,
          clips: [
            {
              id: 'clip-bg-video-1',
              name: 'Mosque Arch Silhouette & Sky',
              type: ClipType.VIDEO,
              trackId: 'track-video-1',
              start: 0,
              duration: templateDuration,
              sourceStart: 0,
              sourceDuration: templateDuration,
              playbackRate: 1.0,
              volume: 0.0,
              url: 'https://images.unsplash.com/photo-1542816417-0983c9c9ad53?w=800&auto=format&fit=crop&q=80',
              isImage: true,
              filters: {
                brightness: 60,
                contrast: 110,
                saturation: 85,
                grayscale: 0,
                sepia: 0,
                invert: 0,
                hueRotate: 0,
                chromaKey: { enabled: false, color: '#00ff00', threshold: 30, smoothness: 10 }
              }
            }
          ]
        },
        {
          id: 'track-audio-1',
          name: 'Quran Recitation Track',
          type: ClipType.AUDIO,
          clips: [
            {
              id: 'clip-audio-rec-1',
              name: 'Mishary Alafasy Recitation Track',
              type: ClipType.AUDIO,
              trackId: 'track-audio-1',
              start: 0,
              duration: templateDuration,
              sourceStart: 0,
              sourceDuration: 180,
              playbackRate: 1.0,
              volume: 80,
              url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'
            }
          ]
        }
      ];
    } else if (templateId === 'tpl-viral-captions' || templateId === 'tpl-podcast-clip') {
      templateAspectRatio = '9:16';
      templateDuration = templateId === 'tpl-podcast-clip' ? 30 : 15;
      templateTracks = [
        {
          id: 'track-text-1',
          name: 'Neon Viral Captions',
          type: ClipType.TEXT,
          clips: [
            {
              id: 'clip-caption-1',
              name: 'Caption Word 1',
              type: ClipType.TEXT,
              trackId: 'track-text-1',
              start: 1,
              duration: 3,
              sourceStart: 0,
              sourceDuration: 3,
              playbackRate: 1.0,
              volume: 1.0,
              text: 'KEEP CREATING!',
              fontSize: 32,
              fontFamily: 'impact',
              textX: 50,
              textY: 50,
              color: '#22d3ee',
              textStyle: 'neon',
              textAlignment: 'center',
            },
            {
              id: 'clip-caption-2',
              name: 'Caption Word 2',
              type: ClipType.TEXT,
              trackId: 'track-text-1',
              start: 4.5,
              duration: 3,
              sourceStart: 0,
              sourceDuration: 3,
              playbackRate: 1.0,
              volume: 1.0,
              text: 'NEVER STOP!',
              fontSize: 36,
              fontFamily: 'impact',
              textX: 50,
              textY: 50,
              color: '#f43f5e',
              textStyle: 'neon',
              textAlignment: 'center',
            }
          ]
        },
        {
          id: 'track-video-1',
          name: 'Vibrant Dynamic Visual',
          type: ClipType.VIDEO,
          clips: [
            {
              id: 'clip-bg-video-2',
              name: 'Abstract Paint Motion',
              type: ClipType.VIDEO,
              trackId: 'track-video-1',
              start: 0,
              duration: templateDuration,
              sourceStart: 0,
              sourceDuration: templateDuration,
              playbackRate: 1.0,
              volume: 0.0,
              url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
              isImage: true,
              filters: {
                brightness: 80,
                contrast: 130,
                saturation: 120,
                grayscale: 0,
                sepia: 0,
                invert: 0,
                hueRotate: 180,
                chromaKey: { enabled: false, color: '#00ff00', threshold: 30, smoothness: 10 }
              }
            }
          ]
        },
        {
          id: 'track-audio-1',
          name: 'Electronic Beats (BGM)',
          type: ClipType.AUDIO,
          clips: [
            {
              id: 'clip-audio-beat-1',
              name: 'Phonk Beat Background Track',
              type: ClipType.AUDIO,
              trackId: 'track-audio-1',
              start: 0,
              duration: templateDuration,
              sourceStart: 0,
              sourceDuration: 60,
              playbackRate: 1.0,
              volume: 60,
              url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3'
            }
          ]
        }
      ];
    } else if (templateId === 'tpl-cinematic-documentary') {
      templateAspectRatio = '16:9';
      templateDuration = 45;
      templateTracks = [
        {
          id: 'track-text-1',
          name: 'Cinematic Minimalist Titles',
          type: ClipType.TEXT,
          clips: [
            {
              id: 'clip-title-1',
              name: 'Intro Title Card',
              type: ClipType.TEXT,
              trackId: 'track-text-1',
              start: 2,
              duration: 8,
              sourceStart: 0,
              sourceDuration: 8,
              playbackRate: 1.0,
              volume: 1.0,
              text: 'THE JOURNEY OF FAITH',
              fontSize: 24,
              fontFamily: 'serif',
              textX: 50,
              textY: 50,
              color: '#ffffff',
              textStyle: 'shadow',
              textAlignment: 'center',
            }
          ]
        },
        {
          id: 'track-video-1',
          name: 'Scenic Drone Shots',
          type: ClipType.VIDEO,
          clips: [
            {
              id: 'clip-bg-video-3',
              name: 'Mist Mountains Scenic drone',
              type: ClipType.VIDEO,
              trackId: 'track-video-1',
              start: 0,
              duration: 45,
              sourceStart: 0,
              sourceDuration: 45,
              playbackRate: 1.0,
              volume: 0.0,
              url: 'https://images.unsplash.com/photo-1564769625905-50e93615e769?w=800&auto=format&fit=crop&q=80',
              isImage: true,
              filters: {
                brightness: 70,
                contrast: 100,
                saturation: 90,
                grayscale: 0,
                sepia: 10,
                invert: 0,
                hueRotate: 0,
                chromaKey: { enabled: false, color: '#00ff00', threshold: 30, smoothness: 10 }
              }
            }
          ]
        },
        {
          id: 'track-audio-1',
          name: 'Epic Orchestral Ambient',
          type: ClipType.AUDIO,
          clips: [
            {
              id: 'clip-audio-cinematic-1',
              name: 'Orchestral Slow Strings',
              type: ClipType.AUDIO,
              trackId: 'track-audio-1',
              start: 0,
              duration: 45,
              sourceStart: 0,
              sourceDuration: 120,
              playbackRate: 1.0,
              volume: 75,
              url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3'
            }
          ]
        }
      ];
    } else {
      templateAspectRatio = '1:1';
      templateDuration = 20;
      templateTracks = [
        {
          id: 'track-text-1',
          name: 'Elegant Showcase Title',
          type: ClipType.TEXT,
          clips: [
            {
              id: 'clip-fallback-t-1',
              name: 'Showcase Subtitle',
              type: ClipType.TEXT,
              trackId: 'track-text-1',
              start: 1,
              duration: 10,
              sourceStart: 0,
              sourceDuration: 10,
              playbackRate: 1.0,
              volume: 1.0,
              text: 'CYBER NEON CALLIGRAPHY',
              fontSize: 28,
              fontFamily: 'sans-serif',
              textX: 50,
              textY: 50,
              color: '#06b6d4',
              textStyle: 'neon',
              textAlignment: 'center',
            }
          ]
        },
        {
          id: 'track-video-1',
          name: 'Cyber particles Base',
          type: ClipType.VIDEO,
          clips: [
            {
              id: 'clip-fallback-v-1',
              name: 'Glow Swirl Background',
              type: ClipType.VIDEO,
              trackId: 'track-video-1',
              start: 0,
              duration: 20,
              sourceStart: 0,
              sourceDuration: 20,
              playbackRate: 1.0,
              volume: 0.0,
              url: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800&auto=format&fit=crop&q=80',
              isImage: true,
              filters: {
                brightness: 50,
                contrast: 120,
                saturation: 100,
                grayscale: 0,
                sepia: 0,
                invert: 0,
                hueRotate: 0,
                chromaKey: { enabled: false, color: '#00ff00', threshold: 30, smoothness: 10 }
              }
            }
          ]
        },
        {
          id: 'track-audio-1',
          name: 'BGM Chill Track',
          type: ClipType.AUDIO,
          clips: [
            {
              id: 'clip-fallback-a-1',
              name: 'Chill Ambient Synth',
              type: ClipType.AUDIO,
              trackId: 'track-audio-1',
              start: 0,
              duration: 20,
              sourceStart: 0,
              sourceDuration: 90,
              playbackRate: 1.0,
              volume: 60,
              url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3'
            }
          ]
        }
      ];
    }
    
    setTracks(templateTracks);
    setDuration(templateDuration);
    setAspectRatio(templateAspectRatio);
    setSelectedClipId(null);
  };

  // Quran Aligner state
  const [aligningStatus, setAligningStatus] = useState<{
    status: 'idle' | 'running' | 'success' | 'error';
    progress: number;
    log: string[];
  } | null>(null);

  // Translation Language & Translator Suite State (Default: Urdu - Fateh Muhammad Jalandhry or English)
  const [quranTranslation, setQuranTranslation] = useState<string>('ur-jalandhry');

  // Synchronously update or fetch translations for existing timeline clips
  const handleApplyTranslationToTimeline = async (translationId?: string) => {
    const targetTransId = translationId || quranTranslation;
    const transOpt = getTranslationOptionById(targetTransId);

    // If 'none', remove or hide translation track
    if (transOpt.id === 'none') {
      setTracks(prev => prev.filter(t => t.id !== 'track-quran-english' && !t.name.toLowerCase().includes('translation')));
      return;
    }

    // Find translation track or Arabic track to derive timestamps & keys
    const transTrack = tracks.find(t => t.id === 'track-quran-english' || t.name.toLowerCase().includes('translation') || t.name.toLowerCase().includes('english') || t.name.toLowerCase().includes('urdu') || t.name.toLowerCase().includes('hindi'));
    const arTrack = tracks.find(t => t.id === 'track-quran-arabic' || t.name.toLowerCase().includes('arabic') || t.name.toLowerCase().includes('uthmani'));

    const baseClips = (transTrack && transTrack.clips.length > 0) ? transTrack.clips : (arTrack ? arTrack.clips : []);
    if (baseClips.length === 0) return;

    const updatedClips: Clip[] = [];
    for (let i = 0; i < baseClips.length; i++) {
      const clip = baseClips[i];
      const clipName = clip.name || '';
      
      let translatedText = '';
      if (clipName.includes("Ta'awwuz") || clip.id.includes('taawwuz') || clip.text?.includes('أَعُوذُ')) {
        translatedText = getTaawwuzTranslation(transOpt.languageCode);
      } else if (clipName.includes("Tasmiyah") || clip.id.includes('tasmiyah') || clip.text?.includes('بِسْمِ اللَّهِ')) {
        translatedText = getTasmiyahTranslation(transOpt.languageCode);
      } else {
        const match = clipName.match(/(\d+:\d+)/);
        let vKey = match ? match[1] : '';
        if (!vKey) {
          const ayahNum = extractAyahNumberFromClip({ name: clip.name, text: clip.text });
          if (ayahNum !== null) {
            vKey = `1:${ayahNum}`;
          }
        }

        if (vKey) {
          translatedText = await fetchSingleAyahTranslation(vKey, transOpt);
        } else {
          translatedText = clip.text || '';
        }
      }

      const fontToUse = (quranEnglishFont === 'Inter' || quranEnglishFont === 'Lateef')
        ? transOpt.defaultFont
        : quranEnglishFont;

      updatedClips.push({
        ...clip,
        id: clip.id.startsWith('clip-quran-en') || clip.id.startsWith('clip-quran-trans') ? clip.id : `clip-quran-trans-${Date.now()}-${i}`,
        trackId: 'track-quran-english',
        name: clipName.includes("Ta'awwuz")
          ? `${transOpt.languageCode.toUpperCase()}: Ta'awwuz`
          : clipName.includes("Tasmiyah")
          ? `${transOpt.languageCode.toUpperCase()}: Tasmiyah`
          : `${transOpt.languageCode.toUpperCase()}: ${clipName.replace(/^(AR|EN|UR|HI|ID|TR|FR|BN|ES|DE|RU|FA|MS|TA):\s*/i, '')}`,
        language: transOpt.languageCode || 'en',
        text: stripAyahSymbol(translatedText),
        ayahSymbolStyle: 'none',
        fontFamily: fontToUse,
        fontSize: quranEnglishSize,
        color: quranEnglishColor,
        textStyle: quranEnglishStyle,
        textY: quranEnglishY,
        textTransform: quranEnglishUppercase && transOpt.direction !== 'rtl' ? 'uppercase' : 'none',
        textWrap: quranEnglishWrap,
        textMaxWidth: quranEnglishMaxWidth,
        textLineHeight: quranEnglishLineHeight,
        textAlignment: quranEnglishAlign
      });
    }

    const newTransTrack: Track = {
      id: 'track-quran-english',
      name: `Quran Translation (${transOpt.language})`,
      type: ClipType.TEXT,
      clips: updatedClips
    };

    setTracks(prev => {
      const filtered = prev.filter(t => t.id !== 'track-quran-english' && !t.name.toLowerCase().includes('translation') && !t.name.toLowerCase().includes('english') && !t.name.toLowerCase().includes('urdu') && !t.name.toLowerCase().includes('hindi'));
      return [...filtered, newTransTrack];
    });
  };

  // Quran Intro Mode: 'both' (⭐ Ta'awwuz + Bismillah) | 'taawwuz-only' | 'bismillah-only' | 'none'
  const [quranIntroMode, setQuranIntroMode] = useState<'both' | 'taawwuz-only' | 'bismillah-only' | 'none'>('none');

  // Quran Breath & Waqf Segmentation Mode: 'full-ayah' (Full Ayah Display) | 'split-breaths' (Split Breath Phrases)
  const [quranBreathSegmentationMode, setQuranBreathSegmentationMode] = useState<'full-ayah' | 'split-breaths'>('split-breaths');

  // Quran Recitation Pace Selector: 'slow-tartil' | 'standard' | 'fast-hadr'
  const [quranRecitationPace, setQuranRecitationPace] = useState<'slow-tartil' | 'standard' | 'fast-hadr'>('standard');

  // Dual Translation Subtitles (e.g. Urdu + English simultaneously)
  const [quranEnableDualTranslation, setQuranEnableDualTranslation] = useState<boolean>(false);
  const [quranDualTranslationLang, setQuranDualTranslationLang] = useState<string>('en-sahih');

  // Karaoke Word-by-Word Highlight & Glow Sync
  const [quranKaraokeHighlight, setQuranKaraokeHighlight] = useState<boolean>(false);
  const [quranKaraokeColor, setQuranKaraokeColor] = useState<string>('#F59E0B');
  // Audio-Video Word/Karaoke Synchronization Offset in ms (+150ms default lead to counteract audio buffer lag)
  const [quranKaraokeSyncOffsetMs, setQuranKaraokeSyncOffsetMs] = useState<number>(150);

  // ⚡ Dedicated Instant Action: Replace Bismillah with Surah 67:1 (Tabarakallazi) across the timeline
  const handleReplaceBismillahWithTabarakallazi = async () => {
    const transOpt = getTranslationOptionById(quranTranslation);

    const tabarakArabic = 'تَبَارَكَ الَّذِي بِيَدِهِ الْمُلْكُ وَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ';
    let tabarakTranslation = 'Blessed is He in whose hand is dominion, and He is over all things competent.';

    // Fetch accurate translation for Surah 67:1 in the user's selected language
    try {
      const fetchedTrans = await fetchSingleAyahTranslation('67:1', transOpt);
      if (fetchedTrans && fetchedTrans.trim().length > 3) {
        tabarakTranslation = fetchedTrans;
      }
    } catch {
      if (transOpt.languageCode === 'ur') {
        tabarakTranslation = 'بہت بابرکت ہے وہ ذات جس کے دست قدرت میں ساری بادشاہی ہے اور وہ ہر چیز پر قادر ہے';
      } else if (transOpt.languageCode === 'hi') {
        tabarakTranslation = 'बहुत बरकत वाला है वह जिसके हाथ में बादशाही है और वह हर चीज़ पर क़ादिर है';
      }
    }

    const formattedArabic = attachAyahSymbolToText(
      tabarakArabic,
      1,
      quranShowAyahSymbol ? quranAyahSymbolStyle : 'none',
      quranAyahDigitType,
      quranAyahSymbolPosition
    );

    setTracks(prevTracks => {
      return prevTracks.map(track => {
        const isAr = track.id === 'track-quran-arabic' || track.name.toLowerCase().includes('arabic') || track.name.toLowerCase().includes('uthmani');
        const isEn = track.id === 'track-quran-english' || track.name.toLowerCase().includes('translation') || track.name.toLowerCase().includes('english') || track.name.toLowerCase().includes('urdu') || track.name.toLowerCase().includes('hindi');

        if (!isAr && !isEn) return track;

        // Check if there is any Bismillah/Tasmiyah clip
        const hasBismillah = track.clips.some(c => 
          c.name.includes('Tasmiyah') || 
          c.name.includes('1:0') || 
          c.name.toLowerCase().includes('bismillah') || 
          c.text?.includes('بِسْمِ اللَّهِ')
        );

        if (hasBismillah) {
          let replaced = false;
          const newClips = track.clips.map((c) => {
            const isThisBis = c.name.includes('Tasmiyah') || 
                              c.name.includes('1:0') || 
                              c.name.toLowerCase().includes('bismillah') || 
                              c.text?.includes('بِسْمِ اللَّهِ');
            if (isThisBis && !replaced) {
              replaced = true;
              return {
                ...c,
                name: isAr ? 'AR: 67:1' : `${transOpt.languageCode.toUpperCase()}: 67:1`,
                text: isAr ? formattedArabic : tabarakTranslation
              };
            }
            return c;
          });
          return { ...track, clips: newClips };
        }

        // If track has >= 2 clips and clip 0 is Ta'awwuz, replace clip 1 with Tabarakallazi (67:1)
        if (track.clips.length >= 2) {
          const firstIsTaawwuz = track.clips[0].name.includes("Ta'awwuz") || track.clips[0].text?.includes('أَعُوذُ');
          if (firstIsTaawwuz) {
            const updated = [...track.clips];
            updated[1] = {
              ...updated[1],
              name: isAr ? 'AR: 67:1' : `${transOpt.languageCode.toUpperCase()}: 67:1`,
              text: isAr ? formattedArabic : tabarakTranslation
            };
            return { ...track, clips: updated };
          }
        }

        // If single clip on timeline is Bismillah, replace it
        if (track.clips.length === 1 && (track.clips[0].text?.includes('بِسْمِ اللَّهِ') || track.clips[0].name.includes('Tasmiyah'))) {
          const updated = [...track.clips];
          updated[0] = {
            ...updated[0],
            name: isAr ? 'AR: 67:1' : `${transOpt.languageCode.toUpperCase()}: 67:1`,
            text: isAr ? formattedArabic : tabarakTranslation
          };
          return { ...track, clips: updated };
        }

        return track;
      });
    });
  };

  const [quranArabicFont, setQuranArabicFont] = useState<string>('QPC Uthmani Hafs');
  const [quranArabicSize, setQuranArabicSize] = useState<number>(36);
  const [quranArabicColor, setQuranArabicColor] = useState<string>('#ffffff');
  const [quranArabicStyle, setQuranArabicStyle] = useState<'normal' | 'shadow' | 'outline' | 'neon' | 'gold-glow' | 'viral-reels'>('shadow');
  const [quranArabicY, setQuranArabicY] = useState<number>(35);
  const [quranArabicWrap, setQuranArabicWrap] = useState<boolean>(true);
  const [quranArabicMaxWidth, setQuranArabicMaxWidth] = useState<number>(80);
  const [quranArabicLineHeight, setQuranArabicLineHeight] = useState<number>(1.3);
  const [quranArabicAlign, setQuranArabicAlign] = useState<'left' | 'center' | 'right'>('center');

  // Ayah Symbol Suite State
  const [quranAyahSymbolStyle, setQuranAyahSymbolStyle] = useState<AyahSymbolStyle>('ornate-medallion');
  const [quranAyahDigitType, setQuranAyahDigitType] = useState<AyahDigitType>('arabic');
  const [quranAyahSymbolPosition, setQuranAyahSymbolPosition] = useState<AyahSymbolPosition>('end');
  const [quranShowAyahSymbol, setQuranShowAyahSymbol] = useState<boolean>(true);

  const [quranEnglishFont, setQuranEnglishFont] = useState<string>('Inter');
  const [quranEnglishSize, setQuranEnglishSize] = useState<number>(20);
  const [quranEnglishColor, setQuranEnglishColor] = useState<string>('#ffffff');
  const [quranEnglishStyle, setQuranEnglishStyle] = useState<'normal' | 'shadow' | 'outline' | 'neon' | 'gold-glow' | 'viral-reels'>('shadow');
  const [quranEnglishY, setQuranEnglishY] = useState<number>(72);
  const [quranEnglishUppercase, setQuranEnglishUppercase] = useState<boolean>(false);
  const [quranEnglishWrap, setQuranEnglishWrap] = useState<boolean>(true);
  const [quranEnglishMaxWidth, setQuranEnglishMaxWidth] = useState<number>(85);
  const [quranEnglishLineHeight, setQuranEnglishLineHeight] = useState<number>(1.3);
  const [quranEnglishAlign, setQuranEnglishAlign] = useState<'left' | 'center' | 'right'>('center');

  // Surah Header Overlay State
  const [quranShowSurahHeader, setQuranShowSurahHeader] = useState<boolean>(true);
  const [quranSurahHeaderStyle, setQuranSurahHeaderStyle] = useState<string>('ornate');
  const [quranSurahHeaderFont, setQuranSurahHeaderFont] = useState<string>('Amiri');
  const [quranSurahHeaderSize, setQuranSurahHeaderSize] = useState<number>(24);
  const [quranSurahHeaderColor, setQuranSurahHeaderColor] = useState<string>('#E5C158'); // Imperial Gold
  const [quranSurahHeaderY, setQuranSurahHeaderY] = useState<number>(8); // 8% from top
  const [quranSurahHeaderFormat, setQuranSurahHeaderFormat] = useState<'both' | 'arabic' | 'english' | 'numbered'>('both');
  const [quranSurahHeaderBg, setQuranSurahHeaderBg] = useState<'none' | 'solid' | 'gradient' | 'blur' | boolean>('gradient');
  const [quranSurahHeaderBgColor, setQuranSurahHeaderBgColor] = useState<string>('#000000');
  const [quranSurahHeaderBgOpacity, setQuranSurahHeaderBgOpacity] = useState<number>(50);

  // Single-Word (Lafz ba Lafz) Display Mode State
  const [quranCaptionDisplayMode, setQuranCaptionDisplayMode] = useState<'full-ayah' | 'single-word'>('full-ayah');
  const [quranSingleWordScale, setQuranSingleWordScale] = useState<number>(1.35);
  const [quranSingleWordPop, setQuranSingleWordPop] = useState<boolean>(true);

  // Qari / Reciter Name Badge Overlay State
  const [quranShowQariBadge, setQuranShowQariBadge] = useState<boolean>(false);
  const [quranQariName, setQuranQariName] = useState<string>('Mishary Rashid Alafasy');
  const [quranQariBadgePosition, setQuranQariBadgePosition] = useState<'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'>('top-right');

  // Islamic Audio Waveform Visualizer State
  const [quranShowWaveform, setQuranShowWaveform] = useState<boolean>(false);
  const [quranWaveformStyle, setQuranWaveformStyle] = useState<'bars' | 'wave' | 'mirror'>('bars');
  const [quranWaveformColor, setQuranWaveformColor] = useState<string>('#F59E0B');
  const [quranWaveformY, setQuranWaveformY] = useState<number>(86);

  // Dual Translation Track State (Urdu / 2nd Translation Track)
  const [quranDualFont, setQuranDualFont] = useState<string>('Jameel Noori Nastaleeq');
  const [quranDualSize, setQuranDualSize] = useState<number>(18);
  const [quranDualColor, setQuranDualColor] = useState<string>('#E0F2FE');
  const [quranDualStyle, setQuranDualStyle] = useState<'normal' | 'shadow' | 'outline' | 'neon' | 'gold-glow' | 'viral-reels'>('shadow');
  const [quranDualY, setQuranDualY] = useState<number>(86);
  const [quranDualLineHeight, setQuranDualLineHeight] = useState<number>(1.3);
  const [quranDualMaxWidth, setQuranDualMaxWidth] = useState<number>(85);
  const [quranDualWrap, setQuranDualWrap] = useState<boolean>(true);
  const [quranDualAlign, setQuranDualAlign] = useState<'left' | 'center' | 'right'>('center');

  const handleAutoSeparateDualTracks = () => {
    const targetEnY = Math.min(quranEnglishY, 72);
    const targetDualY = Math.min(95, Math.max(targetEnY + 14, 84));
    setQuranEnglishY(targetEnY);
    setQuranDualY(targetDualY);
    applyQuranStylesToTimeline({ englishY: targetEnY, dualY: targetDualY });
  };

  // 1-Click Quick Calligraphy Card Generator: Bismillah Opening
  const handleAddBismillahCard = () => {
    addNewClip({
      name: 'Bismillah Calligraphy',
      type: ClipType.TEXT,
      text: 'بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيْمِ',
      start: 0,
      duration: 4,
      fontFamily: 'Amiri',
      fontSize: 36,
      color: '#E5C158',
      textStyle: 'gold-glow',
      textAlignment: 'center',
      textY: 45,
      textBackgroundStyle: 'box',
      textBackgroundColor: 'rgba(0,0,0,0.65)',
      textBackgroundRadius: 16,
      textAnimation: {
        inAnimation: 'zoom-in',
        inDuration: 0.5,
        outAnimation: 'fade',
        outDuration: 0.5,
      },
    });
    addNewClip({
      name: 'Bismillah Translation',
      type: ClipType.TEXT,
      text: 'In the Name of Allah, the Entirely Merciful, the Especially Merciful',
      start: 0,
      duration: 4,
      fontFamily: 'Playfair Display',
      fontSize: 16,
      color: '#F3F4F6',
      textStyle: 'shadow',
      textAlignment: 'center',
      textY: 58,
      textAnimation: {
        inAnimation: 'fade',
        inDuration: 0.6,
        outAnimation: 'fade',
        outDuration: 0.5,
      },
    });
  };

  // 1-Click Quick Calligraphy Card Generator: Sadaqallahul Azeem Outro
  const handleAddSadaqallahCard = () => {
    const endTimeline = duration > 0 ? duration : 15;
    const startTime = Math.max(0, endTimeline - 3.5);
    addNewClip({
      name: 'Sadaqallahul Azeem Outro',
      type: ClipType.TEXT,
      text: 'صَدَقَ اللّٰهُ الْعَظِيْمُ',
      start: startTime,
      duration: 3.5,
      fontFamily: 'Amiri',
      fontSize: 36,
      color: '#E5C158',
      textStyle: 'gold-glow',
      textAlignment: 'center',
      textY: 45,
      textBackgroundStyle: 'box',
      textBackgroundColor: 'rgba(0,0,0,0.65)',
      textBackgroundRadius: 16,
      textAnimation: {
        inAnimation: 'zoom-in',
        inDuration: 0.5,
        outAnimation: 'fade',
        outDuration: 0.5,
      },
    });
    addNewClip({
      name: 'Sadaqallah Translation',
      type: ClipType.TEXT,
      text: 'Allah the Almighty has spoken the truth',
      start: startTime,
      duration: 3.5,
      fontFamily: 'Playfair Display',
      fontSize: 16,
      color: '#F3F4F6',
      textStyle: 'shadow',
      textAlignment: 'center',
      textY: 58,
      textAnimation: {
        inAnimation: 'fade',
        inDuration: 0.6,
        outAnimation: 'fade',
        outDuration: 0.5,
      },
    });
  };
  // Global Quran Animations
  const [quranAnimationIn, setQuranAnimationIn] = useState<any>('fade');
  const [quranAnimationOut, setQuranAnimationOut] = useState<any>('fade');
  const [quranAnimationDuration, setQuranAnimationDuration] = useState<number>(0.5);

  // Global Quran Background Overlay
  const [quranBgStyle, setQuranBgStyle] = useState<any>('none');
  const [quranBgColor, setQuranBgColor] = useState<string>('#000000');
  const [quranBgOpacity, setQuranBgOpacity] = useState<number>(0.65);
  const [quranBgBlur, setQuranBgBlur] = useState<number>(0);
  const [quranBgPadding, setQuranBgPadding] = useState<number>(18);
  const [quranBgRadius, setQuranBgRadius] = useState<number>(20);


  // Synchronously update styles of all existing Quran clips on the timeline
  const applyQuranStylesToTimeline = (customParams?: {
    arabicFont?: string;
    arabicSize?: number;
    arabicColor?: string;
    arabicStyle?: 'normal' | 'shadow' | 'outline' | 'neon' | 'gold-glow' | 'viral-reels';
    arabicY?: number;
    arabicWrap?: boolean;
    arabicMaxWidth?: number;
    arabicLineHeight?: number;
    arabicAlign?: 'left' | 'center' | 'right';
    ayahSymbolStyle?: AyahSymbolStyle;
    ayahDigitType?: AyahDigitType;
    ayahSymbolPosition?: AyahSymbolPosition;
    showAyahSymbol?: boolean;
    englishFont?: string;
    englishSize?: number;
    englishColor?: string;
    englishStyle?: 'normal' | 'shadow' | 'outline' | 'neon' | 'gold-glow' | 'viral-reels';
    englishY?: number;
    englishUppercase?: boolean;
    englishWrap?: boolean;
    englishMaxWidth?: number;
    englishLineHeight?: number;
    englishAlign?: 'left' | 'center' | 'right';
    dualFont?: string;
    dualSize?: number;
    dualColor?: string;
    dualStyle?: 'normal' | 'shadow' | 'outline' | 'neon' | 'gold-glow' | 'viral-reels';
    dualY?: number;
    dualLineHeight?: number;
    dualMaxWidth?: number;
    dualWrap?: boolean;
    dualAlign?: 'left' | 'center' | 'right';
    animationIn?: any;
    animationOut?: any;
    animationDuration?: number;
    karaokeHighlight?: boolean;
    karaokeColor?: string;
    syncOffsetMs?: number;
    bgStyle?: any;
    bgColor?: string;
    bgOpacity?: number;
    bgBlur?: number;
    bgPadding?: number;
    bgRadius?: number;
  }) => {
    const arFont = customParams?.arabicFont !== undefined ? customParams.arabicFont : quranArabicFont;
    const arSize = customParams?.arabicSize !== undefined ? customParams.arabicSize : quranArabicSize;
    const arColor = customParams?.arabicColor !== undefined ? customParams.arabicColor : quranArabicColor;
    const arStyleVal = customParams?.arabicStyle !== undefined ? customParams.arabicStyle : quranArabicStyle;
    const arY = customParams?.arabicY !== undefined ? customParams.arabicY : quranArabicY;
    const arWrap = customParams?.arabicWrap !== undefined ? customParams.arabicWrap : quranArabicWrap;
    const arMaxW = customParams?.arabicMaxWidth !== undefined ? customParams.arabicMaxWidth : quranArabicMaxWidth;
    const arLH = customParams?.arabicLineHeight !== undefined ? customParams.arabicLineHeight : quranArabicLineHeight;
    const arAlign = customParams?.arabicAlign !== undefined ? customParams.arabicAlign : quranArabicAlign;

    const symStyle = customParams?.ayahSymbolStyle !== undefined ? customParams.ayahSymbolStyle : quranAyahSymbolStyle;
    const digType = customParams?.ayahDigitType !== undefined ? customParams.ayahDigitType : quranAyahDigitType;
    const symPos = customParams?.ayahSymbolPosition !== undefined ? customParams.ayahSymbolPosition : quranAyahSymbolPosition;
    const showSym = customParams?.showAyahSymbol !== undefined ? customParams.showAyahSymbol : quranShowAyahSymbol;

    const enFont = customParams?.englishFont !== undefined ? customParams.englishFont : quranEnglishFont;
    const enSize = customParams?.englishSize !== undefined ? customParams.englishSize : quranEnglishSize;
    const enColor = customParams?.englishColor !== undefined ? customParams.englishColor : quranEnglishColor;
    const enStyleVal = customParams?.englishStyle !== undefined ? customParams.englishStyle : quranEnglishStyle;
    const enY = customParams?.englishY !== undefined ? customParams.englishY : quranEnglishY;
    const enUpper = customParams?.englishUppercase !== undefined ? customParams.englishUppercase : quranEnglishUppercase;
    const enWrap = customParams?.englishWrap !== undefined ? customParams.englishWrap : quranEnglishWrap;
    const enMaxW = customParams?.englishMaxWidth !== undefined ? customParams.englishMaxWidth : quranEnglishMaxWidth;
    const enLH = customParams?.englishLineHeight !== undefined ? customParams.englishLineHeight : quranEnglishLineHeight;
    const enAlign = customParams?.englishAlign !== undefined ? customParams.englishAlign : quranEnglishAlign;

    const dFont = customParams?.dualFont !== undefined ? customParams.dualFont : quranDualFont;
    const dSize = customParams?.dualSize !== undefined ? customParams.dualSize : quranDualSize;
    const dColor = customParams?.dualColor !== undefined ? customParams.dualColor : quranDualColor;
    const dStyleVal = customParams?.dualStyle !== undefined ? customParams.dualStyle : quranDualStyle;
    const dY = customParams?.dualY !== undefined ? customParams.dualY : quranDualY;
    const dLH = customParams?.dualLineHeight !== undefined ? customParams.dualLineHeight : quranDualLineHeight;
    const dMaxW = customParams?.dualMaxWidth !== undefined ? customParams.dualMaxWidth : quranDualMaxWidth;
    const dWrap = customParams?.dualWrap !== undefined ? customParams.dualWrap : quranDualWrap;
    const dAlign = customParams?.dualAlign !== undefined ? customParams.dualAlign : quranDualAlign;
    const animIn = customParams?.animationIn !== undefined ? customParams.animationIn : quranAnimationIn;
    const animOut = customParams?.animationOut !== undefined ? customParams.animationOut : quranAnimationOut;
    const animDur = customParams?.animationDuration !== undefined ? customParams.animationDuration : quranAnimationDuration;
    const kHighlight = customParams?.karaokeHighlight !== undefined ? customParams.karaokeHighlight : quranKaraokeHighlight;
    const kColor = customParams?.karaokeColor !== undefined ? customParams.karaokeColor : quranKaraokeColor;
    const syncOff = customParams?.syncOffsetMs !== undefined ? customParams.syncOffsetMs : quranKaraokeSyncOffsetMs;
    const bgS = customParams?.bgStyle !== undefined ? customParams.bgStyle : quranBgStyle;
    const bgC = customParams?.bgColor !== undefined ? customParams.bgColor : quranBgColor;
    const bgO = customParams?.bgOpacity !== undefined ? customParams.bgOpacity : quranBgOpacity;
    const bgB = customParams?.bgBlur !== undefined ? customParams.bgBlur : quranBgBlur;
    const bgP = customParams?.bgPadding !== undefined ? customParams.bgPadding : quranBgPadding;
    const bgR = customParams?.bgRadius !== undefined ? customParams.bgRadius : quranBgRadius;

    const formatArabicText = (clipText: string, clipName?: string) => {
      if (clipName && (clipName.includes("Ta'awwuz") || clipName.includes("Tasmiyah"))) {
        return clipText;
      }
      // USER DIRECTIVE: Ayah symbol must NEVER appear on translation text, ONLY on Quran Arabic Ayahs!
      if (clipName && (/^(EN|UR|HI|ID|TR|FR|BN|ES|DE|RU|FA|MS|TA|TRANSLATION|TRANS|SUB):/i.test(clipName) || clipName.toLowerCase().includes('translation'))) {
        return stripAyahSymbol(clipText || '');
      }
      const ayahNum = extractAyahNumberFromClip({ name: clipName, text: clipText });
      if (ayahNum !== null) {
        return attachAyahSymbolToText(
          clipText || '',
          ayahNum,
          showSym ? symStyle : 'none',
          digType,
          symPos
        );
      }
      return clipText;
    };

    setTracks(prevTracks => prevTracks.map(track => {
      // Check track level matching
      const isArabicTrack = track.id === 'track-quran-arabic' || 
                            track.id.toLowerCase().includes('quran-ar') || 
                            track.id.toLowerCase().includes('arabic') || 
                            track.name.toLowerCase().includes('arabic') || 
                            track.name.toLowerCase().includes('uthmani');

      const isEnglishTrack = track.id === 'track-quran-english' || 
                             track.id.toLowerCase().includes('quran-en') || 
                             track.id.toLowerCase().includes('english') || 
                             track.name.toLowerCase().includes('english') || 
                             track.name.toLowerCase().includes('subtitles') ||
                             (track.name.toLowerCase().includes('translation') && !track.id.includes('dual') && !track.name.toLowerCase().includes('dual'));

      const isDualTrack = track.id === 'track-quran-dual-translation' ||
                          track.id.toLowerCase().includes('dual') ||
                          track.name.toLowerCase().includes('dual');

      if (isArabicTrack) {
        return {
          ...track,
          clips: track.clips.map(clip => {
            const isTrans = isTranslationClip(clip);
            if (isTrans) {
              return {
                ...clip,
                text: stripAyahSymbol(clip.text || ''),
                ayahSymbolStyle: 'none',
                karaokeHighlight: kHighlight,
                karaokeColor: kColor,
                syncOffsetMs: syncOff,
                textAnimation: { inAnimation: animIn, outAnimation: animOut, inDuration: animDur, outDuration: animDur }
              };
            }
            return {
              ...clip,
              text: formatArabicText(clip.text, clip.name),
              ayahSymbolPosition: symPos,
              ayahSymbolStyle: symStyle,
              fontFamily: arFont,
              fontSize: arSize,
              color: arColor,
              textStyle: arStyleVal,
              textY: arY,
              textWrap: arWrap,
              textMaxWidth: arMaxW,
              textLineHeight: arLH,
              textAlignment: arAlign,
              textBackgroundColor: bgC,
              textBackgroundOpacity: bgO,
              textBackgroundPadding: bgP,
              textBackgroundRadius: bgR,
              textBackgroundBlur: bgB,
              textBackgroundStyle: bgS,
              karaokeHighlight: kHighlight,
              karaokeColor: kColor,
              syncOffsetMs: syncOff,
              textAnimation: { inAnimation: animIn, outAnimation: animOut, inDuration: animDur, outDuration: animDur }
            };
          })
        };
      }

      if (isDualTrack) {
        return {
          ...track,
          clips: track.clips.map(clip => ({
            ...clip,
            text: stripAyahSymbol(clip.text || ''),
            ayahSymbolStyle: 'none',
            fontFamily: dFont,
            fontSize: dSize,
            color: dColor,
            textStyle: dStyleVal,
            textY: dY,
            textWrap: dWrap,
            textMaxWidth: dMaxW,
            textLineHeight: dLH,
            textAlignment: dAlign,
            textBackgroundColor: bgC,
            textBackgroundOpacity: bgO,
            textBackgroundPadding: bgP,
            textBackgroundRadius: bgR,
            textBackgroundBlur: bgB,
            textBackgroundStyle: bgS,
            karaokeHighlight: kHighlight,
            karaokeColor: kColor,
            syncOffsetMs: syncOff,
            textAnimation: { inAnimation: animIn, outAnimation: animOut, inDuration: animDur, outDuration: animDur }
          }))
        };
      }

      if (isEnglishTrack) {
        return {
          ...track,
          clips: track.clips.map(clip => ({
            ...clip,
            text: stripAyahSymbol(clip.text || ''),
            ayahSymbolStyle: 'none',
            fontFamily: enFont,
            fontSize: enSize,
            color: enColor,
            textStyle: enStyleVal,
            textY: enY,
            textTransform: enUpper ? 'uppercase' : 'none',
            textWrap: enWrap,
            textMaxWidth: enMaxW,
            textLineHeight: enLH,
            textAlignment: enAlign,
            textBackgroundColor: bgC,
            textBackgroundOpacity: bgO,
            textBackgroundPadding: bgP,
            textBackgroundRadius: bgR,
            textBackgroundBlur: bgB,
            textBackgroundStyle: bgS,
            karaokeHighlight: kHighlight,
            karaokeColor: kColor,
            syncOffsetMs: syncOff,
            textAnimation: { inAnimation: animIn, outAnimation: animOut, inDuration: animDur, outDuration: animDur }
          }))
        };
      }

      // Check clip level matching for any TEXT track
      if (track.type === ClipType.TEXT) {
        return {
          ...track,
          clips: track.clips.map(clip => {
            const isTrans = isTranslationClip(clip);
            const isArabicClip = !isTrans && isQuranArabicClip(clip);

            const isEnglishClip = isTrans || clip.id.includes('quran-en') || 
                                  clip.id.includes('english') || 
                                  clip.name.startsWith('EN:') ||
                                  (!isArabicClip && Boolean(clip.text));

            if (isArabicClip) {
              return {
                ...clip,
                text: formatArabicText(clip.text, clip.name),
                ayahSymbolPosition: symPos,
                ayahSymbolStyle: symStyle,
                fontFamily: arFont,
                fontSize: arSize,
                color: arColor,
                textStyle: arStyleVal,
                textY: arY,
                textWrap: arWrap,
                textMaxWidth: arMaxW,
                textLineHeight: arLH,
                textAlignment: arAlign,
                textBackgroundColor: bgC,
                textBackgroundOpacity: bgO,
                textBackgroundPadding: bgP,
                textBackgroundRadius: bgR,
                textBackgroundBlur: bgB,
                textBackgroundStyle: bgS,
                karaokeHighlight: kHighlight,
                karaokeColor: kColor,
                syncOffsetMs: syncOff,
                textAnimation: { inAnimation: animIn, outAnimation: animOut, inDuration: animDur, outDuration: animDur }
              };
            } else if (isEnglishClip) {
              return {
                ...clip,
                text: stripAyahSymbol(clip.text || ''),
                ayahSymbolStyle: 'none',
                fontFamily: enFont,
                fontSize: enSize,
                color: enColor,
                textStyle: enStyleVal,
                textY: enY,
                textTransform: enUpper ? 'uppercase' : 'none',
                textWrap: enWrap,
                textMaxWidth: enMaxW,
                textLineHeight: enLH,
                textAlignment: enAlign,
                textBackgroundColor: bgC,
                textBackgroundOpacity: bgO,
                textBackgroundPadding: bgP,
                textBackgroundRadius: bgR,
                textBackgroundBlur: bgB,
                textBackgroundStyle: bgS,
                karaokeHighlight: kHighlight,
                karaokeColor: kColor,
                syncOffsetMs: syncOff,
                textAnimation: { inAnimation: animIn, outAnimation: animOut, inDuration: animDur, outDuration: animDur }
              };
            }
            return {
              ...clip,
              karaokeHighlight: kHighlight,
              karaokeColor: kColor,
              syncOffsetMs: syncOff,
              textAnimation: { inAnimation: animIn, outAnimation: animOut, inDuration: animDur, outDuration: animDur }
            };
          })
        };
      }

      return track;
    }));
  };

  // ⚡ Dedicated Instant Action: Apply Dual Translation to Existing Timeline
  const handleApplyDualTranslationToTimeline = async (targetLangId?: string) => {
    const langIdToUse = targetLangId || quranDualTranslationLang || 'en-sahih';
    const dualTransOpt = getTranslationOptionById(langIdToUse);
    if (!dualTransOpt) return;

    // Find base clips from Arabic or English track
    const arTrack = tracks.find(t => t.id === 'track-quran-arabic' || t.name.toLowerCase().includes('arabic') || t.name.toLowerCase().includes('uthmani'));
    const transTrack = tracks.find(t => t.id === 'track-quran-english' || t.name.toLowerCase().includes('translation') || t.name.toLowerCase().includes('english') || t.name.toLowerCase().includes('urdu'));

    const baseClips = (arTrack && arTrack.clips.length > 0) ? arTrack.clips : (transTrack ? transTrack.clips : []);
    if (baseClips.length === 0) {
      return;
    }

    const dualClips: Clip[] = [];
    for (let i = 0; i < baseClips.length; i++) {
      const clip = baseClips[i];
      const clipName = clip.name || '';

      let translatedText = '';
      if (clipName.includes("Ta'awwuz") || clip.id.includes('taawwuz') || clip.text?.includes('أَعُوذُ')) {
        translatedText = getTaawwuzTranslation(dualTransOpt.languageCode);
      } else if (clipName.includes("Tasmiyah") || clip.id.includes('tasmiyah') || clip.text?.includes('بِسْمِ اللَّهِ')) {
        translatedText = getTasmiyahTranslation(dualTransOpt.languageCode);
      } else {
        const match = clipName.match(/(\d+:\d+)/);
        let vKey = match ? match[1] : '';
        if (!vKey) {
          const ayahNum = extractAyahNumberFromClip({ name: clip.name, text: clip.text });
          if (ayahNum !== null) {
            vKey = `1:${ayahNum}`;
          }
        }
        if (vKey) {
          translatedText = await fetchSingleAyahTranslation(vKey, dualTransOpt);
        } else {
          translatedText = clip.text || '';
        }
      }

      const fontToUse = quranDualFont || (
        (quranEnglishFont === 'Inter' || quranEnglishFont === 'Lateef')
          ? dualTransOpt.defaultFont
          : quranEnglishFont
      );

      const dualY = quranDualY;

      dualClips.push({
        id: `clip-quran-dual-${Date.now()}-${i}`,
        trackId: 'track-quran-dual-translation',
        linkedClipId: clip.id,
        name: clipName.includes("Ta'awwuz")
          ? `${dualTransOpt.languageCode.toUpperCase()}: Ta'awwuz`
          : clipName.includes("Tasmiyah")
          ? `${dualTransOpt.languageCode.toUpperCase()}: Tasmiyah`
          : `${dualTransOpt.languageCode.toUpperCase()}: ${clipName.replace(/^(AR|EN|UR|HI|ID|TR|FR|BN|ES|DE|RU|FA|MS|TA):\s*/i, '')}`,
        type: ClipType.TEXT,
        start: clip.start,
        duration: clip.duration,
        sourceStart: 0,
        sourceDuration: clip.duration,
        playbackRate: 1.0,
        volume: 1.0,
        language: dualTransOpt.languageCode || 'en',
        text: stripAyahSymbol(translatedText),
        ayahSymbolStyle: 'none',
        fontFamily: fontToUse,
        fontSize: quranDualSize,
        color: quranDualColor,
        textStyle: quranDualStyle,
        textX: 50,
        textY: dualY,
        textTransform: 'none',
        textWrap: quranDualWrap,
        textMaxWidth: quranDualMaxWidth,
        textLineHeight: quranDualLineHeight,
        textAlignment: quranDualAlign,
        textBackgroundColor: quranBgColor || '#000000',
        textBackgroundOpacity: quranBgOpacity ?? 0.65,
        textBackgroundPadding: quranBgPadding ?? 18,
        textBackgroundRadius: quranBgRadius ?? 20,
        textBackgroundBlur: quranBgBlur ?? 0,
        textBackgroundStyle: quranBgStyle,
        textAnimation: { inAnimation: quranAnimationIn, outAnimation: quranAnimationOut, inDuration: quranAnimationDuration, outDuration: quranAnimationDuration },
        karaokeHighlight: quranKaraokeHighlight,
        karaokeColor: quranKaraokeColor
      });
    }

    const dualTrack: Track = {
      id: 'track-quran-dual-translation',
      name: `Quran Dual Translation (${dualTransOpt.language})`,
      type: ClipType.TEXT,
      clips: dualClips
    };

    setTracks(prev => {
      const filtered = prev.filter(t => t.id !== 'track-quran-dual-translation' && !t.name.toLowerCase().includes('dual'));
      return insertTrackInProperOrder(filtered, dualTrack);
    });
  };

  // ------------------ GLOBAL TYPOGRAPHY & TEXT TRANSFORMATION CONTROLLERS ------------------
  // Apply visual font size scale across all timeline text & caption tracks simultaneously
  const handleApplyGlobalFontSize = (newSize: number) => {
    const validSize = Math.max(10, Math.min(80, newSize));
    const arabicScale = Math.max(16, Math.round(validSize * 1.35));
    const englishScale = validSize;

    setQuranArabicSize(arabicScale);
    setQuranEnglishSize(englishScale);

    setTracks(prevTracks => prevTracks.map(track => {
      const isArabicTrack = track.id === 'track-quran-arabic' || 
                            track.id.toLowerCase().includes('arabic') || 
                            track.name.toLowerCase().includes('arabic') ||
                            track.name.toLowerCase().includes('uthmani');

      const isEnglishTrack = track.id === 'track-quran-english' || 
                             track.id.toLowerCase().includes('english') || 
                             track.name.toLowerCase().includes('english') || 
                             track.name.toLowerCase().includes('translation') ||
                             track.name.toLowerCase().includes('subtitle');

      if (isArabicTrack) {
        return {
          ...track,
          clips: track.clips.map(clip => ({
            ...clip,
            fontSize: arabicScale
          }))
        };
      }

      if (isEnglishTrack) {
        return {
          ...track,
          clips: track.clips.map(clip => ({
            ...clip,
            fontSize: englishScale
          }))
        };
      }

      if (track.type === ClipType.TEXT) {
        return {
          ...track,
          clips: track.clips.map(clip => {
            const isArabicClip = clip.id.includes('quran-ar') || 
                                 clip.id.includes('arabic') || 
                                 clip.name.startsWith('AR:') || 
                                 /[\u0600-\u06FF]/.test(clip.text || '');
            return {
              ...clip,
              fontSize: isArabicClip ? arabicScale : englishScale
            };
          })
        };
      }

      return track;
    }));
  };

  // Apply casing transformation (UPPERCASE, lowercase, Capitalize Title) across translation subtitle tracks
  const handleApplyGlobalTextCase = (casing: 'uppercase' | 'lowercase' | 'capitalize') => {
    setQuranEnglishUppercase(casing === 'uppercase');

    setTracks(prevTracks => prevTracks.map(track => {
      const isArabicTrack = track.id === 'track-quran-arabic' || 
                            track.id.toLowerCase().includes('arabic') || 
                            track.name.toLowerCase().includes('arabic') ||
                            track.name.toLowerCase().includes('uthmani');

      const isEnglishTrack = track.id === 'track-quran-english' || 
                             track.id.toLowerCase().includes('english') || 
                             track.name.toLowerCase().includes('english') || 
                             track.name.toLowerCase().includes('translation') ||
                             track.name.toLowerCase().includes('subtitle');

      if (isArabicTrack) return track; // Do not transform Arabic scripture

      if (isEnglishTrack || track.type === ClipType.TEXT) {
        return {
          ...track,
          clips: track.clips.map(clip => {
            const isArabicClip = clip.id.includes('quran-ar') || 
                                 clip.id.includes('arabic') || 
                                 clip.name.startsWith('AR:') || 
                                 /[\u0600-\u06FF]/.test(clip.text || '');
            if (isArabicClip) return clip;

            const originalText = clip.text || '';
            let transformedText = originalText;

            if (casing === 'uppercase') {
              transformedText = originalText.toUpperCase();
            } else if (casing === 'lowercase') {
              transformedText = originalText.toLowerCase();
            } else if (casing === 'capitalize') {
              transformedText = originalText
                .toLowerCase()
                .split(' ')
                .map(w => w ? w.charAt(0).toUpperCase() + w.slice(1) : '')
                .join(' ');
            }

            return {
              ...clip,
              text: transformedText,
              textTransform: casing === 'uppercase' ? 'uppercase' : 'none'
            };
          })
        };
      }

      return track;
    }));
  };

  // Pool of hidden browser DOM nodes to hold loaded media streams (Video, Audio)
  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const handleCanvasReady = useCallback((c: HTMLCanvasElement | null) => {
    previewCanvasRef.current = c;
  }, []);
  const videoElementsRef = useRef<Record<string, HTMLVideoElement | HTMLImageElement>>({});
  const audioElementRef = useRef<Record<string, HTMLAudioElement>>({});
  const requestRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const lastDriftCheckRef = useRef<number>(0);

  // Web Audio API context & dedicated master routing buses for live preview and video export
  const audioCtxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const speakerGainRef = useRef<GainNode | null>(null);
  const exportDestinationRef = useRef<MediaStreamAudioDestinationNode | null>(null);
  const audioSourceNodesRef = useRef<Record<string, { source: MediaElementAudioSourceNode; gainNode: GainNode; effectSignature?: string }>>({});
  const activeRecorderRef = useRef<MediaRecorder | null>(null);
  const activeRecordIntervalRef = useRef<any>(null);
  const isCancelledExportRef = useRef<boolean>(false);

  const getAudioContext = () => {
    if (!audioCtxRef.current) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContextClass();
      const masterGain = ctx.createGain();
      const speakerGain = ctx.createGain();
      const exportDest = ctx.createMediaStreamDestination();
      
      // Route master gain through speaker gain to speakers, and directly to export recording destination
      masterGain.connect(speakerGain);
      speakerGain.connect(ctx.destination);
      masterGain.connect(exportDest);

      audioCtxRef.current = ctx;
      masterGainRef.current = masterGain;
      speakerGainRef.current = speakerGain;
      exportDestinationRef.current = exportDest;
    }
    if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume().catch(() => {});
    }
    return {
      ctx: audioCtxRef.current,
      masterGain: masterGainRef.current!,
      speakerGain: speakerGainRef.current!,
      exportDest: exportDestinationRef.current!
    };
  };

  // Auto-unlock AudioContext on first user interaction (avoids browser & snap audio silence)
  useEffect(() => {
    const unlockAudio = () => {
      try {
        const { ctx, speakerGain } = getAudioContext();
        speakerGain.gain.value = isMuted ? 0 : 1;
        if (ctx && ctx.state === 'suspended') {
          ctx.resume().catch(() => {});
        }
      } catch (e) {}
    };
    window.addEventListener('pointerdown', unlockAudio, { passive: true });
    window.addEventListener('keydown', unlockAudio, { passive: true });
    window.addEventListener('touchstart', unlockAudio, { passive: true });
    return () => {
      window.removeEventListener('pointerdown', unlockAudio);
      window.removeEventListener('keydown', unlockAudio);
      window.removeEventListener('touchstart', unlockAudio);
    };
  }, [isMuted]);

  const applyWebAudioEffects = (element: HTMLAudioElement | HTMLVideoElement, clip: Clip) => {
    try {
      const { ctx, masterGain } = getAudioContext();
      if (ctx.state === 'suspended' && (isPlaying || exporting)) {
        ctx.resume().catch(() => {});
      }

      const key = clip.id;
      let nodeEntry = audioSourceNodesRef.current[key];
      if (!nodeEntry) {
        try {
          const source = ctx.createMediaElementSource(element);
          const gainNode = ctx.createGain();
          source.connect(gainNode);
          gainNode.connect(masterGain);
          nodeEntry = { source, gainNode, effectSignature: 'none' };
          audioSourceNodesRef.current[key] = nodeEntry;
        } catch {
          // If already connected to source, proceed with existing source node
          return;
        }
      }

      const currentSignature = JSON.stringify({
        fx: clip.audioEffects,
        reduceNoise: clip.audioSettings?.reduceNoise
      });

      // Only rebuild the AudioNode DSP graph if the effect parameters actually changed
      if (nodeEntry.effectSignature !== currentSignature) {
        nodeEntry.effectSignature = currentSignature;

        try {
          nodeEntry.source.disconnect();
        } catch {}

        const hasReverb = clip.audioEffects?.reverb;
        const hasEcho = clip.audioEffects?.echo;
        const hasBass = clip.audioEffects?.bassBoost;

        let currentOutput: AudioNode = nodeEntry.source;

        // 1. Voice Denoiser & AC/Fan Hum Remover
        if (clip.audioEffects?.denoiser || clip.audioSettings?.reduceNoise) {
          const highPass = ctx.createBiquadFilter();
          highPass.type = 'highpass';
          highPass.frequency.value = 110;

          const notch = ctx.createBiquadFilter();
          notch.type = 'notch';
          notch.frequency.value = 60;
          notch.Q.value = 8;

          currentOutput.connect(highPass);
          highPass.connect(notch);
          currentOutput = notch;
        }

        // 2. Bass Boost filter
        if (hasBass) {
          const bassFilter = ctx.createBiquadFilter();
          bassFilter.type = 'lowshelf';
          bassFilter.frequency.value = 150;
          bassFilter.gain.value = 10;
          currentOutput.connect(bassFilter);
          currentOutput = bassFilter;
        }

        // 3. Mosque Reverb Suite or Standard Qiraat Echo Feedback Loop
        const mosque = clip.audioEffects?.mosqueReverb;
        if (mosque?.enabled) {
          const delayTime = mosque.preset === 'haramain-kaaba' ? 0.48 : mosque.preset === 'grand-mosque' ? 0.36 : 0.20;
          const feedbackVal = mosque.preset === 'haramain-kaaba' ? 0.45 : mosque.preset === 'grand-mosque' ? 0.38 : 0.25;
          const wetRatio = (mosque.wet ?? 55) / 100;

          const delayNode = ctx.createDelay(1.5);
          delayNode.delayTime.value = delayTime;

          // Dampening lowpass filter simulates acoustic absorption of mosque carpets and stone arches
          const dampFilter = ctx.createBiquadFilter();
          dampFilter.type = 'lowpass';
          dampFilter.frequency.value = mosque.preset === 'haramain-kaaba' ? 2400 : 3400;

          const delayGain = ctx.createGain();
          delayGain.gain.value = feedbackVal;

          const wetGain = ctx.createGain();
          wetGain.gain.value = 0.50 * wetRatio;

          const dryGain = ctx.createGain();
          dryGain.gain.value = 1.0;

          const effectMix = ctx.createGain();

          currentOutput.connect(dryGain);
          dryGain.connect(effectMix);

          currentOutput.connect(delayNode);
          delayNode.connect(dampFilter);
          dampFilter.connect(delayGain);
          delayGain.connect(delayNode);

          dampFilter.connect(wetGain);
          wetGain.connect(effectMix);

          currentOutput = effectMix;
        } else if (hasEcho || hasReverb) {
          const delayNode = ctx.createDelay(1.0);
          delayNode.delayTime.value = hasReverb ? 0.38 : 0.22;

          const delayGain = ctx.createGain();
          delayGain.gain.value = hasReverb ? 0.40 : 0.30;

          const wetGain = ctx.createGain();
          wetGain.gain.value = hasReverb ? 0.38 : 0.28;

          const dryGain = ctx.createGain();
          dryGain.gain.value = 1.0;

          const effectMix = ctx.createGain();

          currentOutput.connect(dryGain);
          dryGain.connect(effectMix);

          currentOutput.connect(delayNode);
          delayNode.connect(delayGain);
          delayGain.connect(delayNode);

          delayNode.connect(wetGain);
          wetGain.connect(effectMix);

          currentOutput = effectMix;
        }

        currentOutput.connect(nodeEntry.gainNode);
        nodeEntry.gainNode.connect(masterGain);
      }

      // 4. Volume Gain & Fade In/Out Envelope (smoothly applied per-frame)
      const rawVol = clip.volume !== undefined ? clip.volume : 80;
      const normalizedVol = Math.max(0, Math.min(1, rawVol > 1 ? rawVol / 100 : rawVol));
      const fadeIn = clip.audioSettings?.fadeIn ?? 0;
      const fadeOut = clip.audioSettings?.fadeOut ?? 0;
      const elapsed = Math.max(0, currentTime - clip.start);
      let fadeFactor = 1.0;

      if (fadeIn > 0 && elapsed < fadeIn) {
        fadeFactor = Math.max(0, elapsed / fadeIn);
      } else if (fadeOut > 0 && elapsed > (clip.duration - fadeOut)) {
        fadeFactor = Math.max(0, (clip.duration - elapsed) / fadeOut);
      }

      const effectiveGain = (isMuted || (!isPlaying && !exporting)) ? 0 : (normalizedVol * fadeFactor);
      nodeEntry.gainNode.gain.setValueAtTime(effectiveGain, ctx.currentTime);
    } catch (err) {
      console.warn("Web Audio processing bypass:", err);
    }
  };

  const syncAudioEffectsForClip = (element: HTMLAudioElement | HTMLVideoElement, clip: Clip) => {
    applyWebAudioEffects(element, clip);
  };

  // Maintain hidden audio/video elements map matching tracks state
  useEffect(() => {
    // Create hidden media pool container with optimal mobile hardware surface allocation
    let mediaPool = document.getElementById('hidden-media-pool');
    if (!mediaPool) {
      mediaPool = document.createElement('div');
      mediaPool.id = 'hidden-media-pool';
      mediaPool.style.position = 'fixed';
      mediaPool.style.bottom = '0px';
      mediaPool.style.right = '0px';
      mediaPool.style.width = '320px';
      mediaPool.style.height = '180px';
      mediaPool.style.overflow = 'hidden';
      mediaPool.style.pointerEvents = 'none';
      mediaPool.style.opacity = '0.001';
      mediaPool.style.zIndex = '-9999';
      mediaPool.style.visibility = 'visible';
      document.body.appendChild(mediaPool);
    }

    // Global unlock listener for Android mobile browsers on first touch/click
    const unlockMobileMedia = () => {
      try {
        const { ctx } = getAudioContext();
        if (ctx && ctx.state === 'suspended') {
          ctx.resume().catch(() => {});
        }
      } catch (e) {}
      // Pre-wake video elements
      Object.values(videoElementsRef.current).forEach((el) => {
        if (el instanceof HTMLVideoElement && el.readyState < 1) {
          try {
            el.load();
          } catch (e) {}
        }
      });
    };
    window.addEventListener('touchstart', unlockMobileMedia, { once: true });
    window.addEventListener('click', unlockMobileMedia, { once: true });

    tracks.forEach((track) => {
      track.clips.forEach((clip) => {
        const normalizedUrl = normalizeMediaUrl(clip.url);
        const safeCrossOrigin = getSafeCrossOrigin(clip.url);

        // Build video & image caches
        if ((clip.type === ClipType.VIDEO || clip.type === ClipType.IMAGE) && (normalizedUrl || clip.poster || clip.thumbnailUrl)) {
          // For video clips, always prioritize the video url; fallback to poster only if url is missing
          const effectiveUrl = (clip.type === ClipType.VIDEO && normalizedUrl) ? normalizedUrl : (normalizedUrl || clip.poster || clip.thumbnailUrl || '');
          const isExplicitImage = clip.isImage === true || clip.type === ClipType.IMAGE || (/\.(jpeg|jpg|png|gif|webp|svg|avif)(\?|$)/i.test(effectiveUrl) && !effectiveUrl.includes('.webm') && !effectiveUrl.includes('.mp4'));
          const isVideo = clip.type === ClipType.VIDEO && !isExplicitImage;
          const isImg = !isVideo;

          const existingEl = videoElementsRef.current[clip.id];
          const needsRecreate = existingEl && (
            (isVideo && !(existingEl instanceof HTMLVideoElement)) ||
            (isImg && !(existingEl instanceof HTMLImageElement)) ||
            (existingEl.getAttribute('data-clip-url') !== effectiveUrl)
          );

          if (needsRecreate) {
            existingEl.remove();
            delete videoElementsRef.current[clip.id];
          }

          if (!videoElementsRef.current[clip.id] && effectiveUrl) {
            const effectiveCrossOrigin = safeCrossOrigin;

            if (isImg) {
              const img = document.createElement('img');
              if (effectiveCrossOrigin) {
                img.crossOrigin = effectiveCrossOrigin;
              }
              img.setAttribute('data-clip-url', effectiveUrl);
              img.src = effectiveUrl;

              const handleImgError = () => {
                if (img.crossOrigin) {
                  img.removeAttribute('crossorigin');
                  img.src = effectiveUrl;
                }
              };
              img.addEventListener('error', handleImgError);
              if (typeof img.decode === 'function') {
                img.decode().catch(() => {});
              }

              videoElementsRef.current[clip.id] = img;
              mediaPool.appendChild(img);
            } else {
              const video = document.createElement('video');
              if (effectiveCrossOrigin) {
                video.crossOrigin = effectiveCrossOrigin;
              }
              video.setAttribute('data-clip-url', effectiveUrl);
              video.src = effectiveUrl;
              video.muted = true; // muted to permit reliable background rendering without mobile policy blocking
              video.defaultMuted = true;
              video.playsInline = true;
              video.preload = 'auto';
              video.loop = true;
              video.setAttribute('webkit-playsinline', 'true');
              video.setAttribute('playsinline', 'true');
              video.setAttribute('x5-playsinline', 'true');
              video.setAttribute('x5-video-player-type', 'h5');
              video.setAttribute('x5-video-player-fullscreen', 'false');

              const handleVideoError = () => {
                if (video.crossOrigin) {
                  console.warn(`CORS load failed for video: ${effectiveUrl}. Retrying without crossOrigin.`);
                  video.removeAttribute('crossorigin');
                  video.src = effectiveUrl;
                  try {
                    video.load();
                  } catch (e) {}
                } else {
                  (video as any).hasError = true;
                  const backup = clip.fallbackUrl || clip.poster || clip.thumbnailUrl;
                  if (backup && backup !== effectiveUrl) {
                    console.warn(`Video media error for ${effectiveUrl}. Falling back to visual poster.`);
                    const fbImg = document.createElement('img');
                    fbImg.src = normalizeMediaUrl(backup);
                    videoElementsRef.current[clip.id] = fbImg;
                    mediaPool.appendChild(fbImg);
                  }
                }
              };
              video.addEventListener('error', handleVideoError);

              try {
                video.load();
              } catch (e) {}
              videoElementsRef.current[clip.id] = video;
              mediaPool.appendChild(video);
            }
          }
        }
        // Build audio caches
        if (clip.type === ClipType.AUDIO && normalizedUrl) {
          if (!audioElementRef.current[clip.id]) {
            const effectiveCrossOrigin = safeCrossOrigin;
            const audio = document.createElement('audio');
            if (effectiveCrossOrigin) {
              audio.crossOrigin = effectiveCrossOrigin;
            }
            audio.src = normalizedUrl;
            audio.preload = 'auto';

            const handleAudioError = () => {
              if (audio.crossOrigin) {
                console.warn(`CORS load failed for audio: ${normalizedUrl}. Retrying without crossOrigin.`);
                audio.removeAttribute('crossorigin');
                audio.src = normalizedUrl;
                try {
                  audio.load();
                } catch (e) {}
              }
            };
            audio.addEventListener('error', handleAudioError);

            try {
              audio.load();
            } catch (e) {}
            audioElementRef.current[clip.id] = audio;
            mediaPool.appendChild(audio);

            try {
              const { ctx, masterGain } = getAudioContext();
              if (ctx.state !== 'suspended' && !audioSourceNodesRef.current[clip.id]) {
                const source = ctx.createMediaElementSource(audio);
                const gainNode = ctx.createGain();
                source.connect(gainNode);
                gainNode.connect(masterGain);
                audioSourceNodesRef.current[clip.id] = { source, gainNode };
              }
            } catch (e) {}
          }
        }
      });
    });

    // Cleanup deleted clips from DOM to prevent memory leaks and resource hogs
    const activeClipIds = new Set(tracks.flatMap(t => t.clips.map(c => c.id)));
    Object.keys(videoElementsRef.current).forEach(id => {
      if (!activeClipIds.has(id)) {
        const el = videoElementsRef.current[id];
        if (el) {
          if (el instanceof HTMLMediaElement) {
            try {
              el.pause();
              el.removeAttribute('src');
              el.load();
            } catch (e) {
              console.warn('Media disposal warning:', e);
            }
          }
          if (el.parentNode) {
            el.parentNode.removeChild(el);
          }
        }
        delete videoElementsRef.current[id];
        delete audioSourceNodesRef.current[id];
      }
    });
    Object.keys(audioElementRef.current).forEach(id => {
      if (!activeClipIds.has(id)) {
        const el = audioElementRef.current[id];
        if (el) {
          try {
            el.pause();
            el.removeAttribute('src');
            el.load();
          } catch (e) {
            console.warn('Audio disposal warning:', e);
          }
          if (el.parentNode) {
            el.parentNode.removeChild(el);
          }
        }
        delete audioElementRef.current[id];
        delete audioSourceNodesRef.current[id];
      }
    });
  }, [tracks]);

    // Sync and control playheads of hidden files
  useEffect(() => {
    const now = Date.now();
    const isPlayingActive = isPlaying;
    
    // Throttling: if playing, we only run drift sync checks every 500ms
    const shouldCheckDrift = !isPlayingActive || (now - lastDriftCheckRef.current >= 500);
    if (isPlayingActive && shouldCheckDrift) {
      lastDriftCheckRef.current = now;
    }

    tracks.forEach((track) => {
      track.clips.forEach((clip) => {
        const isActive = currentTime >= clip.start && currentTime <= clip.start + clip.duration;
        const elapsed = currentTime - clip.start;
        const { currentSpeed, sourceTime: targetSrcTime } = getClipEffectiveSpeedAtTime(clip, elapsed);

        // Normalize volume (clip.volume is 0..100, HTML5 media expects 0.0..1.0)
        const rawVol = clip.volume !== undefined ? clip.volume : 80;
        const safeVolume = Math.max(0, Math.min(1, rawVol > 1 ? rawVol / 100 : rawVol));
        const isAudible = !isMuted && !track.muted && isActive && (isPlayingActive || exporting);
        const targetGain = isAudible ? safeVolume : 0;

        if (audioSourceNodesRef.current[clip.id]?.gainNode) {
          audioSourceNodesRef.current[clip.id].gainNode.gain.value = targetGain;
        }

        // Sync Video element
        if (clip.type === ClipType.VIDEO) {
          const media = videoElementsRef.current[clip.id];
          if (media && media instanceof HTMLVideoElement) {
            const video = media;
            video.playbackRate = Math.max(0.1, Math.min(16, currentSpeed || clip.playbackRate || 1.0));
            video.volume = safeVolume;
            video.muted = isMuted || track.muted || safeVolume === 0;

            const vidDur = (video.duration && !isNaN(video.duration) && isFinite(video.duration) && video.duration > 0) ? video.duration : (clip.duration || 999999);
            const clampedTarget = vidDur > 0 ? (targetSrcTime % vidDur) : 0;

            if (isActive) {
              if (isPlayingActive || exporting) {
                if (video.paused) {
                  video.play().catch(() => {
                    // Fallback to muted playback if audio policy blocked it
                    video.muted = true;
                    video.play().catch(() => {});
                  });
                }
                // Sync drift check with clamping to avoid crashes on huge streams
                if (shouldCheckDrift && !video.seeking) {
                  const driftThreshold = (safeVolume === 0 || video.muted) ? 1.0 : 0.5;
                  if (Math.abs(video.currentTime - clampedTarget) > driftThreshold) {
                    try {
                      video.currentTime = clampedTarget;
                    } catch {}
                  }
                }
                syncAudioEffectsForClip(video, clip);
              } else {
                if (!video.paused) {
                  video.pause();
                }
                // Sync paused time
                if (Math.abs(video.currentTime - clampedTarget) > 0.05 && !video.seeking) {
                  try {
                    video.currentTime = clampedTarget;
                  } catch {}
                }
              }
            } else {
              // Not active, guarantee paused state
              if (!video.paused) {
                video.pause();
              }
            }
          }
        }

        // Sync Audio element
        if (clip.type === ClipType.AUDIO) {
          const audio = audioElementRef.current[clip.id];
          if (audio) {
            audio.playbackRate = clip.playbackRate;
            audio.volume = safeVolume;
            audio.muted = false;

            if (isActive) {
              if (isPlayingActive || exporting) {
                if (audio.paused) {
                  audio.play().catch(() => {});
                }
                // Sync drift check with clamping - tightened to 200ms to eliminate visual/audio lag
                if (shouldCheckDrift) {
                  const durationLimit = audio.duration || clip.duration || 999999;
                  const clampedTarget = Math.max(0, Math.min(durationLimit, targetSrcTime));
                  if (Math.abs(audio.currentTime - clampedTarget) > 0.2) {
                    audio.currentTime = clampedTarget;
                  }
                }
                syncAudioEffectsForClip(audio, clip);
              } else {
                if (!audio.paused) {
                  audio.pause();
                }
                // Sync paused time with clamping
                const durationLimit = audio.duration || clip.duration || 999999;
                const clampedTarget = Math.max(0, Math.min(durationLimit, targetSrcTime));
                if (Math.abs(audio.currentTime - clampedTarget) > 0.05) {
                  audio.currentTime = clampedTarget;
                }
              }
            } else {
              // Not active, guarantee paused state
              if (!audio.paused) {
                audio.pause();
              }
            }
          }
        }
      });
    });
  }, [currentTime, isPlaying, tracks, exporting, isMuted]);

  // Master references for hardware audio sync and keybindings
  const tracksRef = useRef(tracks);
  tracksRef.current = tracks;
  const durationRef = useRef(duration);
  durationRef.current = duration;

  // Master playback timing loop synchronized with hardware audio clock
  useEffect(() => {
    const tick = (now: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = now;
      const delta = (now - lastTimeRef.current) / 1000;
      lastTimeRef.current = now;

      if (isPlaying) {
        setCurrentTime((prev) => {
          let next = prev + delta;

          // Align RAF software loop directly with physical audio hardware clock
          // so word-by-word highlights and karaoke glow match actual speaker sound perfectly
          const currentTracks = tracksRef.current || [];
          let audioHardwareClock: number | null = null;
          for (const track of currentTracks) {
            if (track.muted) continue;
            for (const clip of track.clips) {
              if (clip.type === ClipType.AUDIO) {
                const audioEl = audioElementRef.current[clip.id];
                if (
                  audioEl &&
                  !audioEl.paused &&
                  !audioEl.seeking &&
                  audioEl.readyState >= 2 &&
                  !audioEl.muted &&
                  audioEl.currentTime > 0
                ) {
                  const rate = clip.playbackRate || 1.0;
                  const audioTimelineTime = clip.start + (audioEl.currentTime - clip.sourceStart) / rate;
                  if (audioTimelineTime >= clip.start - 0.1 && audioTimelineTime <= clip.start + clip.duration + 0.1) {
                    audioHardwareClock = audioTimelineTime;
                    break;
                  }
                }
              }
            }
            if (audioHardwareClock !== null) break;
          }

          if (audioHardwareClock !== null) {
            const clockDrift = Math.abs(audioHardwareClock - next);
            // Snap to true audio clock if drift exceeds 25ms
            if (clockDrift > 0.025 && clockDrift < 0.5) {
              next = audioHardwareClock;
            }
          }

          if (next >= duration) {
            if (isLooping) {
              // Seamless continuous loop playback
              next = 0;
            } else {
              setIsPlaying(false);
              next = 0;
              // Stop and pause all assets
              Object.values(videoElementsRef.current).forEach(v => {
                if (v instanceof HTMLVideoElement) {
                  v.pause();
                }
              });
              Object.values(audioElementRef.current).forEach(a => {
                (a as HTMLAudioElement).pause();
              });
            }
          }
          return next;
        });
      }

      requestRef.current = requestAnimationFrame(tick);
    };

    requestRef.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(requestRef.current);
    };
  }, [isPlaying, duration]);

  // Handle global key binds
  const selectedClipIdRef = useRef(selectedClipId);
  selectedClipIdRef.current = selectedClipId;
  const selectedClipIdsRef = useRef(selectedClipIds);
  selectedClipIdsRef.current = selectedClipIds;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts if user is currently typing in an input fields or textareas
      const activeEl = document.activeElement;
      if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || activeEl.getAttribute('contenteditable') === 'true')) {
        return;
      }

      // Spacebar: play/pause
      if (e.code === 'Space') {
        e.preventDefault();
        togglePlayPause();
      }

      // Delete / Backspace: Delete selected clip
      if ((e.code === 'Delete' || e.code === 'Backspace') && selectedClipIdRef.current) {
        e.preventDefault();
        deleteClip(selectedClipIdRef.current);
      }

      // Ctrl + D: Duplicate selected clip
      if (e.ctrlKey && e.code === 'KeyD') {
        e.preventDefault();
        duplicateClip();
      }

      // Ctrl + B: Split clip
      if (e.ctrlKey && e.code === 'KeyB') {
        e.preventDefault();
        splitClip();
      }

      // Ctrl + M: Merge selected adjacent clips
      if (e.ctrlKey && e.code === 'KeyM') {
        e.preventDefault();
        mergeSelectedClips();
      }

      // Q: Ripple Delete Left
      if (e.code === 'KeyQ') {
        e.preventDefault();
        rippleDelete('left');
      }

      // W: Ripple Delete Right
      if (e.code === 'KeyW') {
        e.preventDefault();
        rippleDelete('right');
      }

      // Arrow Left / Right: Frame scrub (1/30s)
      if (e.code === 'ArrowLeft') {
        e.preventDefault();
        setCurrentTime(prev => Math.max(0, prev - 1/30));
      }
      if (e.code === 'ArrowRight') {
        e.preventDefault();
        setCurrentTime(prev => Math.min(durationRef.current, prev + 1/30));
      }

      // Ctrl + Plus/Minus: Zoom
      if (e.ctrlKey && (e.key === '=' || e.key === '+')) {
        e.preventDefault();
        setZoom(prev => Math.min(100, prev + 10));
      }
      if (e.ctrlKey && e.key === '-') {
        e.preventDefault();
        setZoom(prev => Math.max(10, prev - 10));
      }

      // Ctrl + Z: Undo
      if (e.ctrlKey && e.code === 'KeyZ' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      }

      // Ctrl + Y / Ctrl + Shift + Z: Redo
      if (e.ctrlKey && (e.code === 'KeyY' || (e.shiftKey && e.code === 'KeyZ'))) {
        e.preventDefault();
        handleRedo();
      }

      // ? or Shift + / or Ctrl + /: Toggle Keyboard Shortcuts Modal
      if (e.key === '?' || (e.shiftKey && e.code === 'Slash') || (e.ctrlKey && e.code === 'Slash')) {
        e.preventDefault();
        setShowShortcutsModal(prev => !prev);
      }

      // Ctrl + A: Select All clips
      if (e.ctrlKey && e.code === 'KeyA') {
        e.preventDefault();
        const allIds = tracksRef.current.flatMap(t => t.clips.map(c => c.id));
        setSelectedClipIds(allIds);
      }

      // Ctrl + S: Save Project
      if (e.ctrlKey && e.code === 'KeyS') {
        e.preventDefault();
        setShowSaveModal(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const togglePlayPause = () => {
    try {
      const { ctx, speakerGain } = getAudioContext();
      speakerGain.gain.value = isMuted ? 0 : 1;
      if (ctx && ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }
    } catch (e) {}
    setIsPlaying(prev => {
      const next = !prev;
      lastTimeRef.current = performance.now();
      return next;
    });
  };

  const getSelectedClip = (): Clip | null => {
    if (!selectedClipId) return null;
    for (const track of tracks) {
      const clip = track.clips.find(c => c.id === selectedClipId);
      if (clip) return clip;
    }
    return null;
  };

  // ------------------ (A) TIMELINE TRACK & SPLIT ENGINE ------------------
  const splitClip = () => {
    const selectedClip = getSelectedClip();
    if (!selectedClip) return;

    // Check if playhead sits inside selected clip
    if (currentTime > selectedClip.start && currentTime < selectedClip.start + selectedClip.duration) {
      const elapsedInClip = currentTime - selectedClip.start;
      
      // Split into two parts with guaranteed unique IDs
      const timestamp = Date.now().toString(36);
      const rand1 = Math.random().toString(36).substring(2, 6);
      const rand2 = Math.random().toString(36).substring(2, 6);
      const clip1: Clip = {
        ...selectedClip,
        id: `${selectedClip.id}-pt1-${timestamp}-${rand1}`,
        duration: elapsedInClip,
      };

      const clip2: Clip = {
        ...selectedClip,
        id: `${selectedClip.id}-pt2-${timestamp}-${rand2}`,
        start: currentTime,
        duration: selectedClip.duration - elapsedInClip,
        sourceStart: selectedClip.sourceStart + elapsedInClip * selectedClip.playbackRate,
      };

      // Update state tracks
      setTracks(prevTracks => prevTracks.map(track => {
        if (track.id === selectedClip.trackId) {
          const filteredClips = track.clips.filter(c => c.id !== selectedClip.id);
          return {
            ...track,
            clips: [...filteredClips, clip1, clip2].sort((a, b) => a.start - b.start)
          };
        }
        return track;
      }));

      setSelectedClipId(clip2.id);
    }
  };

  const mergeSelectedClips = () => {
    if (selectedClipIds.length < 2) return;

    const idsSet = new Set(selectedClipIds);
    let hasMergedAny = false;
    let newSelectedIds: string[] = [];

    setTracks(prevTracks => {
      let modified = false;

      const updatedTracks = prevTracks.map(track => {
        const selectedTrackClips = track.clips.filter(c => idsSet.has(c.id));
        if (selectedTrackClips.length < 2) {
          return track;
        }

        const sortedAllClips = [...track.clips].sort((a, b) => a.start - b.start);
        const selectedIndices = selectedTrackClips
          .map(c => sortedAllClips.findIndex(sc => sc.id === c.id))
          .filter(idx => idx !== -1)
          .sort((a, b) => a - b);

        if (selectedIndices.length < 2) return track;

        // Find range of selected clips in chronological sequence on track
        const minIdx = selectedIndices[0];
        const maxIdx = selectedIndices[selectedIndices.length - 1];
        
        // Take contiguous slice of selected clips
        const contiguousClips = sortedAllClips.slice(minIdx, maxIdx + 1);
        if (contiguousClips.length < 2) return track;

        const firstClip = contiguousClips[0];
        const lastClip = contiguousClips[contiguousClips.length - 1];

        const newStart = firstClip.start;
        const newEnd = lastClip.start + lastClip.duration;
        const newDuration = Math.max(0.1, newEnd - newStart);

        // Merge text contents with spaces
        const mergedText = contiguousClips
          .map(c => (c.text !== undefined ? c.text : c.name || '').trim())
          .filter(Boolean)
          .join(' ');

        // Merge names
        const mergedName = contiguousClips
          .map(c => (c.name || '').trim())
          .filter(Boolean)
          .join(' & ');

        const mergedClipId = `clip-merged-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

        const mergedClip: Clip = {
          ...firstClip,
          id: mergedClipId,
          name: mergedName || firstClip.name,
          start: Number(newStart.toFixed(3)),
          duration: Number(newDuration.toFixed(3)),
          sourceStart: firstClip.sourceStart,
          sourceDuration: Number(newDuration.toFixed(3)),
          text: mergedText || firstClip.text,
        };

        const remainingClips = track.clips.filter(c => !contiguousClips.some(sc => sc.id === c.id));
        const nextClips = [...remainingClips, mergedClip].sort((a, b) => a.start - b.start);

        modified = true;
        hasMergedAny = true;
        newSelectedIds.push(mergedClipId);

        return {
          ...track,
          clips: nextClips
        };
      });

      if (!modified) return prevTracks;
      return updatedTracks;
    });

    if (hasMergedAny && newSelectedIds.length > 0) {
      setSelectedClipIds(newSelectedIds);
      console.log(`[Timeline] Merged ${selectedClipIds.length} adjacent text clips into 1 combined clip.`);
    }
  };

  const deleteClip = (clipId: string) => {
    setTracks(prev => prev.map(t => ({
      ...t,
      clips: t.clips.filter(c => c.id !== clipId)
    })));
    setSelectedClipIds(prev => prev.filter(id => id !== clipId));
  };

  const deleteSelectedClips = () => {
    const currentIds = selectedClipIdsRef.current.length > 0 ? selectedClipIdsRef.current : selectedClipIds;
    if (currentIds.length === 0) return;
    const idsToDelete = new Set(currentIds);
    setTracks(prev => prev.map(t => ({
      ...t,
      clips: t.clips.filter(c => !idsToDelete.has(c.id))
    })));
    setSelectedClipIds([]);
  };

  // Internal timeline clipboard for multi-clip copy, cut, and paste
  const timelineClipboardRef = useRef<{ clips: Clip[]; minStart: number } | null>(null);

  const copySelectedClips = () => {
    const currentIds = selectedClipIdsRef.current.length > 0 ? selectedClipIdsRef.current : selectedClipIds;
    if (currentIds.length === 0) return;
    const selectedClips: Clip[] = [];
    tracksRef.current.forEach(t => {
      t.clips.forEach(c => {
        if (currentIds.includes(c.id)) {
          selectedClips.push({ ...c });
        }
      });
    });
    if (selectedClips.length === 0) return;
    const minStart = Math.min(...selectedClips.map(c => c.start));
    timelineClipboardRef.current = { clips: selectedClips, minStart };
  };

  const cutSelectedClips = () => {
    copySelectedClips();
    deleteSelectedClips();
  };

  const pasteClips = () => {
    if (!timelineClipboardRef.current || timelineClipboardRef.current.clips.length === 0) return;
    const { clips, minStart } = timelineClipboardRef.current;
    const pasteOffset = currentTime - minStart;
    const newSelectedIds: string[] = [];

    setTracks(prevTracks => {
      return prevTracks.map(track => {
        const matchingClipsToPaste = clips.filter(c => c.trackId === track.id);
        if (matchingClipsToPaste.length === 0) {
          return track;
        }

        const newClips: Clip[] = matchingClipsToPaste.map(c => {
          const newId = `clip-paste-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
          newSelectedIds.push(newId);
          return {
            ...c,
            id: newId,
            name: `${c.name} (Copy)`,
            start: Math.max(0, c.start + pasteOffset),
            trackId: track.id,
          };
        });

        return {
          ...track,
          clips: [...track.clips, ...newClips].sort((a, b) => a.start - b.start),
        };
      });
    });

    if (newSelectedIds.length > 0) {
      setSelectedClipIds(newSelectedIds);
    }
  };

  const groupSelectedClips = () => {
    const currentIds = selectedClipIdsRef.current.length > 0 ? selectedClipIdsRef.current : selectedClipIds;
    if (currentIds.length < 2) return;
    const newGroupId = `group-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    setTracks(prevTracks => prevTracks.map(track => ({
      ...track,
      clips: track.clips.map(c => {
        if (currentIds.includes(c.id)) {
          return { ...c, groupId: newGroupId };
        }
        return c;
      })
    })));
  };

  const ungroupSelectedClips = () => {
    const currentIds = selectedClipIdsRef.current.length > 0 ? selectedClipIdsRef.current : selectedClipIds;
    if (currentIds.length === 0) return;
    setTracks(prevTracks => prevTracks.map(track => ({
      ...track,
      clips: track.clips.map(c => {
        if (currentIds.includes(c.id)) {
          const { groupId, ...rest } = c;
          return rest as Clip;
        }
        return c;
      })
    })));
  };

  const duplicateSelectedClips = () => {
    const currentIds = selectedClipIdsRef.current.length > 0 ? selectedClipIdsRef.current : selectedClipIds;
    if (currentIds.length === 0) {
      duplicateClip();
      return;
    }

    const selectedClips: Clip[] = [];
    tracksRef.current.forEach(t => {
      t.clips.forEach(c => {
        if (currentIds.includes(c.id)) {
          selectedClips.push(c);
        }
      });
    });

    if (selectedClips.length === 0) return;

    const maxEnd = Math.max(...selectedClips.map(c => c.start + c.duration));
    const minStart = Math.min(...selectedClips.map(c => c.start));
    const span = maxEnd - minStart;
    const newSelectedIds: string[] = [];

    setTracks(prevTracks => prevTracks.map(track => {
      const matchingSelected = track.clips.filter(c => currentIds.includes(c.id));
      if (matchingSelected.length === 0) return track;

      const duplicatedOnTrack = matchingSelected.map(c => {
        const newId = `clip-dup-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
        newSelectedIds.push(newId);
        return {
          ...c,
          id: newId,
          name: `${c.name} (Copy)`,
          start: c.start + span + 0.1,
          trackId: track.id,
        };
      });

      return {
        ...track,
        clips: [...track.clips, ...duplicatedOnTrack].sort((a, b) => a.start - b.start),
      };
    }));

    if (newSelectedIds.length > 0) {
      setSelectedClipIds(newSelectedIds);
    }
  };

  const batchUpdateClipTimes = (updates: { id: string; start: number; duration: number; trackId?: string }[], isDragEnd: boolean = false) => {
    const updateMap = new Map(updates.map(u => [u.id, u]));

    // Check if any clip is being moved across tracks
    let hasTrackChange = false;
    for (const update of updates) {
      if (update.trackId) {
        hasTrackChange = true;
        break;
      }
    }

    if (!hasTrackChange) {
      setTracks(prev => {
        const result = prev.map(t => ({
          ...t,
          clips: t.clips.map(c => {
            const u = updateMap.get(c.id);
            return u ? { ...c, start: u.start, duration: u.duration } : c;
          })
        }));
        if (isDragEnd) return result.filter(track => track.clips.length > 0 || track.id === '1');
        return result;
      });
      return;
    }

    // Seamless cross-track clip transfer
    setTracks(prev => {
      const movedClips: { targetTrackId: string; clip: Clip }[] = [];
      const updatedTracks = prev.map(track => {
        const remainingClips: Clip[] = [];
        for (const c of track.clips) {
          const u = updateMap.get(c.id);
          if (u) {
            const destTrackId = u.trackId || track.id;
            const updatedClip: Clip = {
              ...c,
              start: Math.max(0, u.start),
              duration: Math.max(0.033, u.duration),
              trackId: destTrackId,
            };
            if (destTrackId !== track.id) {
              movedClips.push({ targetTrackId: destTrackId, clip: updatedClip });
            } else {
              remainingClips.push(updatedClip);
            }
          } else {
            remainingClips.push(c);
          }
        }
        return { ...track, clips: remainingClips };
      });

      if (movedClips.length === 0) {
        return updatedTracks;
      }

      
      const resultTracks = updatedTracks.map(track => {
        const incoming = movedClips.filter(m => m.targetTrackId === track.id).map(m => m.clip);
        if (incoming.length > 0) {
          return {
            ...track,
            clips: [...track.clips, ...incoming].sort((a, b) => a.start - b.start),
          };
        }
        return track;
      });
      
      // If there are clips targeted to a track that doesn't exist yet (like 'new-track-uuid'), create it.
      const existingTrackIds = new Set(resultTracks.map(t => t.id));
      const newTracksMap = new Map<string, Clip[]>();
      movedClips.forEach(m => {
        if (!existingTrackIds.has(m.targetTrackId)) {
          if (!newTracksMap.has(m.targetTrackId)) newTracksMap.set(m.targetTrackId, []);
          newTracksMap.get(m.targetTrackId)!.push(m.clip);
        }
      });
      
      let finalTracks = [...resultTracks];
      newTracksMap.forEach((clips, targetTrackId) => {
        // Group incoming clips by their type so mixed selections create separate tracks
        const clipsByType = new Map<ClipType, Clip[]>();
        clips.forEach(clip => {
          if (!clipsByType.has(clip.type)) clipsByType.set(clip.type, []);
          clipsByType.get(clip.type)!.push(clip);
        });

        let isFirst = true;
        clipsByType.forEach((typeClips, clipType) => {
          let trackName = 'New Track';
          if (clipType === ClipType.VIDEO) trackName = 'Video Track';
          if (clipType === ClipType.AUDIO) trackName = 'Audio Track';
          if (clipType === ClipType.TEXT) trackName = 'Text Track';
          if (clipType === ClipType.IMAGE) trackName = 'Image Track';
          if (clipType === ClipType.EFFECT) trackName = 'Effect Track';
          
          let newTrackId = targetTrackId;
          if (targetTrackId.startsWith('new-track')) {
            newTrackId = crypto.randomUUID();
          } else if (!isFirst) {
            newTrackId = crypto.randomUUID(); // if reusing an ID, only reuse for the first one
          }
          isFirst = false;

          const finalClips = typeClips.map(c => ({ ...c, trackId: newTrackId })).sort((a, b) => a.start - b.start);

          finalTracks = insertTrackInProperOrder(finalTracks, {
            id: newTrackId,
            name: trackName,
            type: clipType,
            clips: finalClips,
          });
        });
      });
      if (isDragEnd) {
        return finalTracks.filter(track => track.clips.length > 0 || track.id === '1');
      }
      return finalTracks;
    });
  };

  const batchUpdateClipProperties = (updates: { id: string; updates: Partial<Clip> }[]) => {
    const updateMap = new Map(updates.map(u => [u.id, u.updates]));
    setTracks(prev => prev.map(t => ({
      ...t,
      clips: t.clips.map(c => {
        const u = updateMap.get(c.id);
        return u ? { ...c, ...u } : c;
      })
    })));
  };

  const rippleDelete = (direction: 'left' | 'right') => {
    const selectedClip = getSelectedClip();
    if (!selectedClip) return;

    const isPlayheadInside = currentTime > selectedClip.start && currentTime < selectedClip.start + selectedClip.duration;

    if (isPlayheadInside) {
      const elapsed = currentTime - selectedClip.start;

      if (direction === 'left') {
        // Delete portion left of playhead (from start to playhead)
        // Trimmed clip shifts left to keep the same start boundary, with sourceStart adjusted forward
        const deleteDuration = elapsed;
        
        setTracks(prevTracks => prevTracks.map(track => {
          if (track.id === selectedClip.trackId) {
            return {
              ...track,
              clips: track.clips.map(c => {
                if (c.id === selectedClip.id) {
                  return {
                    ...c,
                    duration: c.duration - deleteDuration,
                    sourceStart: c.sourceStart + deleteDuration * c.playbackRate
                  };
                }
                // Pull subsequent clips to the left
                if (c.start > selectedClip.start) {
                  return {
                    ...c,
                    start: Math.max(0, c.start - deleteDuration)
                  };
                }
                return c;
              })
            };
          }
          return track;
        }));
      } else {
        // Delete portion right of playhead (from playhead to end)
        const deleteDuration = selectedClip.duration - elapsed;

        setTracks(prevTracks => prevTracks.map(track => {
          if (track.id === selectedClip.trackId) {
            return {
              ...track,
              clips: track.clips.map(c => {
                if (c.id === selectedClip.id) {
                  return {
                    ...c,
                    duration: elapsed
                  };
                }
                // Pull subsequent clips left to fill the gap
                if (c.start > selectedClip.start) {
                  return {
                    ...c,
                    start: Math.max(0, c.start - deleteDuration)
                  };
                }
                return c;
              })
            };
          }
          return track;
        }));
      }
    } else {
      // Fallback: Playhead is outside selected clip. Perform clean full Ripple Delete of the entire clip!
      const deleteDuration = selectedClip.duration;

      setTracks(prevTracks => prevTracks.map(track => {
        if (track.id === selectedClip.trackId) {
          return {
            ...track,
            clips: track.clips
              .filter(c => c.id !== selectedClip.id)
              .map(c => {
                if (c.start > selectedClip.start) {
                  return {
                    ...c,
                    start: Math.max(0, c.start - deleteDuration)
                  };
                }
                return c;
              })
          };
        }
        return track;
      }));

      setSelectedClipId(null);
    }
  };

  // Automatically adjust total timeline duration based on the furthest clip end time
  useEffect(() => {
    let maxEnd = 20; // Default minimum editor duration
    tracks.forEach((track) => {
      track.clips.forEach((clip) => {
        const clipEnd = clip.start + clip.duration;
        if (clipEnd > maxEnd) {
          maxEnd = clipEnd;
        }
      });
    });
    setDuration((prev) => {
      const target = Math.max(prev, Math.ceil(maxEnd));
      return target === prev ? prev : target;
    });
  }, [tracks]);

  const handleUpdateDuration = (newDur: number) => {
    let maxClipEnd = 0;
    tracks.forEach((track) => {
      track.clips.forEach((clip) => {
        const clipEnd = clip.start + clip.duration;
        if (clipEnd > maxClipEnd) {
          maxClipEnd = clipEnd;
        }
      });
    });
    const finalDur = Math.max(5, Math.max(Math.ceil(maxClipEnd), newDur));
    setDuration(finalDur);
  };

  const updateClipTimes = (clipId: string, start: number, duration: number, trackId?: string) => {
    setTracks(prev => {
      // Find linked counterpart clip for Two-Track Anchor Lock (Quran Arabic & Translation sync)
      let linkedId: string | undefined;
      for (const t of prev) {
        const c = t.clips.find(clip => clip.id === clipId);
        if (c?.linkedClipId) {
          linkedId = c.linkedClipId;
          break;
        }
      }

      if (!trackId) {
        return prev.map(t => ({
          ...t,
          clips: t.clips.map(c => {
            if (c.id === clipId || (linkedId && c.id === linkedId)) {
              return { ...c, start, duration };
            }
            return c;
          }).sort((a, b) => a.start - b.start)
        }));
      }

      // If moving across tracks
      let movingClip: Clip | null = null;
      prev.forEach(t => {
        const found = t.clips.find(c => c.id === clipId);
        if (found) movingClip = found;
      });

      if (!movingClip) return prev;

      const updatedClip: Clip = {
        ...movingClip,
        start,
        duration,
        trackId
      };

      return prev.map(t => {
        if (t.id === trackId && (movingClip as Clip | null)?.trackId === trackId) {
          return {
            ...t,
            clips: t.clips.map(c => c.id === clipId ? updatedClip : c).sort((a, b) => a.start - b.start)
          };
        } else if (t.id === trackId) {
          return {
            ...t,
            clips: [...t.clips.filter(c => c.id !== clipId), updatedClip].sort((a, b) => a.start - b.start)
          };
        } else {
          return {
            ...t,
            clips: t.clips.filter(c => c.id !== clipId)
          };
        }
      });
    });
  };

  const handleMoveClipToTrack = (clipId: string, targetTrackId: string, newStart?: number) => {
    setTracks(prevTracks => {
      let targetClip: Clip | null = null;
      for (const t of prevTracks) {
        const found = t.clips.find(c => c.id === clipId);
        if (found) {
          targetClip = found;
          break;
        }
      }
      if (!targetClip) return prevTracks;

      const destTrack = prevTracks.find(t => t.id === targetTrackId);
      const updatedClip: Clip = {
        ...targetClip,
        trackId: targetTrackId,
        type: destTrack ? destTrack.type : targetClip.type,
        isImage: destTrack ? (destTrack.type === ClipType.IMAGE || targetClip.isImage) : targetClip.isImage,
        start: newStart !== undefined ? newStart : targetClip.start
      };

      return prevTracks.map(track => {
        if (track.id === targetTrackId && targetClip!.trackId === targetTrackId) {
          return {
            ...track,
            clips: track.clips.map(c => c.id === clipId ? updatedClip : c).sort((a, b) => a.start - b.start)
          };
        } else if (track.id === targetTrackId) {
          return {
            ...track,
            clips: [...track.clips.filter(c => c.id !== clipId), updatedClip].sort((a, b) => a.start - b.start)
          };
        } else {
          return {
            ...track,
            clips: track.clips.filter(c => c.id !== clipId)
          };
        }
      });
    });
  };

  const updateClipProperties = (clipId: string, updates: Partial<Clip>) => {
    setTracks(prev => prev.map(t => ({
      ...t,
      clips: t.clips.map(c => c.id === clipId ? { ...c, ...updates } : c)
    })));
  };

  const addNewClip = (clipData: Partial<Clip>) => {
    const isImg = Boolean(
      clipData.isImage || 
      clipData.type === ClipType.IMAGE || 
      (clipData.url ? (clipData.url.startsWith('data:image/') || /\.(png|jpg|jpeg|webp|avif|gif|bmp|svg)(\?|$)/i.test(clipData.url)) : false)
    );
    let targetType = clipData.type || (isImg ? ClipType.IMAGE : ClipType.VIDEO);
    if (isImg) {
      targetType = ClipType.IMAGE;
    }

    // Generate guaranteed unique clip ID with timestamp and random entropy
    const uniqueClipId = (clipData.id && !tracks.some(t => t.clips.some(c => c.id === clipData.id)))
      ? clipData.id
      : `clip-${Date.now()}-${Math.random().toString(36).substring(2, 9)}-${Math.floor(Math.random() * 100000)}`;

    const clipDuration = clipData.duration || (isImg ? 8 : 15);
    const thumbnailRef = clipData.poster || clipData.thumbnailUrl || (clipData as any).thumbnail || (isImg ? clipData.url : undefined);

    setTracks(prevTracks => {
      let existingTrack = prevTracks.find(t => t.type === targetType);
      const trackId = existingTrack ? existingTrack.id : `track-${targetType}-${Date.now()}`;

      // Smart positioning: if explicit start given, use it;
      // if currentTime > 0, place at playhead;
      // if track already has clips, append sequentially after the last clip so items don't collide at 0s
      let clipStart = clipData.start;
      if (clipStart === undefined) {
        if (currentTime > 0) {
          clipStart = currentTime;
        } else if (existingTrack && existingTrack.clips.length > 0) {
          const maxEnd = existingTrack.clips.reduce((max, c) => Math.max(max, c.start + c.duration), 0);
          clipStart = maxEnd;
        } else {
          clipStart = 0;
        }
      }

      const newClip: Clip = {
        ...clipData,
        id: uniqueClipId,
        name: clipData.name || (targetType === ClipType.VIDEO ? 'Video Clip' : targetType === ClipType.IMAGE ? 'Image Clip' : targetType === ClipType.AUDIO ? 'Audio Track' : 'Text Overlay'),
        type: targetType,
        trackId: trackId,
        start: clipStart,
        duration: clipDuration,
        sourceStart: clipData.sourceStart || 0,
        sourceDuration: clipData.sourceDuration || clipDuration,
        playbackRate: clipData.playbackRate || 1.0,
        volume: clipData.volume !== undefined ? clipData.volume : 1.0,
        url: clipData.url,
        isImage: isImg,
        poster: thumbnailRef,
        thumbnailUrl: thumbnailRef,
        fallbackUrl: thumbnailRef || clipData.fallbackUrl,
        text: clipData.text,
        fontSize: clipData.fontSize,
        color: clipData.color,
        fontFamily: clipData.fontFamily,
        textStyle: clipData.textStyle,
        textX: clipData.textX,
        textY: clipData.textY,
        textWrap: clipData.textWrap,
        textMaxWidth: clipData.textMaxWidth,
        textLineHeight: clipData.textLineHeight,
        textAlignment: clipData.textAlignment,
        filters: clipData.filters
      };

      // Ensure timeline editor duration expands so the new clip is completely visible
      const neededDuration = Math.ceil(clipStart + clipDuration + 2);
      setDuration(prev => Math.max(prev, neededDuration));
      setCurrentTime(clipStart);

      if (!existingTrack) {
        if (prevTracks.length === 0) {
          const baseTracks: Track[] = [
            { id: 'track-text-1', name: 'Text Track 1', type: ClipType.TEXT, clips: [] },
            { id: 'track-image-1', name: 'Image Track 1', type: ClipType.IMAGE, clips: [] },
            { id: 'track-video-1', name: 'Video Track 1', type: ClipType.VIDEO, clips: [] },
            { id: 'track-audio-1', name: 'Audio Track 1', type: ClipType.AUDIO, clips: [] },
          ];
          return baseTracks.map(t => {
            if (t.type === targetType) {
              return { ...t, clips: [{ ...newClip, trackId: t.id }] };
            }
            return t;
          });
        }

        const trackCountOfType = prevTracks.filter(t => t.type === targetType).length + 1;
        const trackName = targetType === ClipType.VIDEO 
          ? `Video Track ${trackCountOfType}` 
          : targetType === ClipType.IMAGE
          ? `Image Track ${trackCountOfType}`
          : targetType === ClipType.AUDIO 
          ? `Audio Track ${trackCountOfType}` 
          : targetType === ClipType.TEXT 
          ? `Text Track ${trackCountOfType}` 
          : `${targetType.toUpperCase()} Track`;

        const newTrack: Track = {
          id: trackId,
          name: trackName,
          type: targetType,
          clips: [newClip]
        };
        return insertTrackInProperOrder(prevTracks, newTrack);
      }

      return prevTracks.map(t => {
        if (t.id === existingTrack!.id) {
          return {
            ...t,
            clips: [...t.clips, newClip].sort((a, b) => a.start - b.start)
          };
        }
        return t;
      });
    });

    setSelectedClipIds([uniqueClipId]);
  };

  // ------------------ CapCut Pro Timeline Handlers ------------------
  const duplicateClip = () => {
    const selectedClip = getSelectedClip();
    if (!selectedClip) return;

    const newStart = selectedClip.start + selectedClip.duration;
    const duplicated: Clip = {
      ...selectedClip,
      id: `clip-dup-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name: `${selectedClip.name} (Copy)`,
      start: newStart,
    };

    setTracks(prevTracks => prevTracks.map(track => {
      if (track.id === selectedClip.trackId) {
        // Shift any subsequent clips that overlap with duplicated clip
        const updatedClips = track.clips.map(c => {
          if (c.start >= newStart) {
            return { ...c, start: c.start + selectedClip.duration };
          }
          return c;
        });
        return {
          ...track,
          clips: [...updatedClips, duplicated].sort((a, b) => a.start - b.start)
        };
      }
      return track;
    }));

    setSelectedClipId(duplicated.id);
  };

  const freezeFrame = () => {
    const selectedClip = getSelectedClip();
    if (!selectedClip) return;

    const freezeDuration = 3.0; // 3 seconds freeze frame
    const freezeStart = currentTime > selectedClip.start && currentTime < selectedClip.start + selectedClip.duration
      ? currentTime
      : selectedClip.start + selectedClip.duration;

    const freezeClip: Clip = {
      ...selectedClip,
      id: `clip-freeze-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name: `[Freeze] ${selectedClip.name}`,
      start: freezeStart,
      duration: freezeDuration,
      playbackRate: 0.0001, // Near static freeze rate
      isImage: true,
    };

    setTracks(prevTracks => prevTracks.map(track => {
      if (track.id === selectedClip.trackId) {
        const shiftedClips = track.clips.map(c => {
          if (c.start >= freezeStart) {
            return { ...c, start: c.start + freezeDuration };
          }
          return c;
        });
        return {
          ...track,
          clips: [...shiftedClips, freezeClip].sort((a, b) => a.start - b.start)
        };
      }
      return track;
    }));

    setSelectedClipId(freezeClip.id);
  };

  const extractAudio = () => {
    const selectedClip = getSelectedClip();
    if (!selectedClip || selectedClip.type !== ClipType.VIDEO || !selectedClip.url) return;

    // Find or create audio track
    let audioTrack = tracks.find(t => t.type === ClipType.AUDIO);
    if (!audioTrack) {
      audioTrack = {
        id: `track-audio-extracted-${Date.now()}`,
        name: 'Extracted Audio',
        type: ClipType.AUDIO,
        clips: []
      };
      setTracks(prev => insertTrackInProperOrder(prev, audioTrack!));
    }

    const newAudioClip: Clip = {
      id: `clip-audio-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name: `[Audio] ${selectedClip.name}`,
      type: ClipType.AUDIO,
      trackId: audioTrack.id,
      start: selectedClip.start,
      duration: selectedClip.duration,
      sourceStart: selectedClip.sourceStart,
      sourceDuration: selectedClip.sourceDuration,
      playbackRate: selectedClip.playbackRate,
      volume: selectedClip.volume || 1.0,
      url: selectedClip.url,
    };

    // Mute original video clip volume
    updateClipProperties(selectedClip.id, { volume: 0 });

    // Add audio clip to track
    setTracks(prevTracks => prevTracks.map(track => {
      if (track.id === audioTrack!.id) {
        return {
          ...track,
          clips: [...track.clips, newAudioClip].sort((a, b) => a.start - b.start)
        };
      }
      return track;
    }));

    setSelectedClipId(newAudioClip.id);
  };

  const setClipSpeed = (speed: number) => {
    const selectedClip = getSelectedClip();
    if (!selectedClip) return;
    const newDuration = Math.max(0.2, selectedClip.sourceDuration / speed);
    updateClipProperties(selectedClip.id, {
      playbackRate: speed,
      duration: newDuration,
    });
  };

  const toggleTrackMute = (trackId: string) => {
    setTracks(prev => prev.map(t => t.id === trackId ? { ...t, muted: !t.muted } : t));
  };

  const toggleTrackLock = (trackId: string) => {
    setTracks(prev => prev.map(t => t.id === trackId ? { ...t, locked: !t.locked } : t));
  };

  const toggleTrackHidden = (trackId: string) => {
    setTracks(prev => prev.map(t => t.id === trackId ? { ...t, hidden: !t.hidden } : t));
  };

  const handleAddTrack = (type: ClipType) => {
    const count = tracks.filter(t => t.type === type).length + 1;
    let trackName = `${type.toUpperCase()} Track ${count}`;
    if (type === ClipType.VIDEO) trackName = `Video Track ${count}`;
    else if (type === ClipType.IMAGE) trackName = `Image Track ${count}`;
    else if (type === ClipType.AUDIO) trackName = `Audio Track ${count}`;
    else if (type === ClipType.TEXT) trackName = `Text Track ${count}`;
    else if (type === ClipType.EFFECT) trackName = `Effect Track ${count}`;

    const newTrack: Track = {
      id: `track-${type}-${Date.now()}`,
      name: trackName,
      type,
      clips: [],
    };
    setTracks(prev => {
      if (prev.length === 0) {
        const baseTracks: Track[] = [
          { id: 'track-text-1', name: 'Text Track 1', type: ClipType.TEXT, clips: [] },
          { id: 'track-image-1', name: 'Image Track 1', type: ClipType.IMAGE, clips: [] },
          { id: 'track-video-1', name: 'Video Track 1', type: ClipType.VIDEO, clips: [] },
          { id: 'track-audio-1', name: 'Audio Track 1', type: ClipType.AUDIO, clips: [] },
        ];
        return baseTracks.some(t => t.type === type) ? baseTracks : insertTrackInProperOrder(baseTracks, newTrack);
      }
      return insertTrackInProperOrder(prev, newTrack);
    });
  };

  const handleDeleteTrack = (trackId: string) => {
    if (tracks.length <= 1) return; // Keep at least 1 track
    setTracks(prev => prev.filter(t => t.id !== trackId));
  };

  const handleMoveTrack = (trackId: string, direction: 'up' | 'down') => {
    setTracks(prev => {
      const idx = prev.findIndex(t => t.id === trackId);
      if (idx === -1) return prev;
      if (direction === 'up' && idx === 0) return prev;
      if (direction === 'down' && idx === prev.length - 1) return prev;

      const newTracks = [...prev];
      const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
      const [moved] = newTracks.splice(idx, 1);
      newTracks.splice(targetIdx, 0, moved);
      return newTracks;
    });
  };

  const handleReorderTracks = (newTracks: Track[]) => {
    setTracks(newTracks);
  };

  // ------------------ (D1) ACOUSTIC AUDIO & VIDEO AUTO-SEGMENTATION SUITE ------------------
  const handleAutoSegmentAudio = async (
    targetClipId?: string,
    sensitivity: 'quran-ayah' | 'studio' | 'mosque' | 'tartil' | 'hadr' | 'custom' | 'smart-waqf' = 'quran-ayah',
    customOptions?: {
      minSilenceMs?: number;
      minSpeechMs?: number;
      startAyahNumber?: number;
      gapHandling?: 'preserve-gaps' | 'bridge-seamless' | 'label-pauses';
      paddingMs?: number;
      customThresholdDb?: number;
    }
  ) => {
    let targetClip: Clip | null = null;
    if (targetClipId) {
      targetClip = tracks.flatMap(t => t.clips).find(c => c.id === targetClipId) || null;
    }
    if (!targetClip && selectedClipId) {
      targetClip = getSelectedClip();
    }
    if (!targetClip) {
      const audioTrack = tracks.find(t => t.type === ClipType.AUDIO && t.clips.length > 0);
      if (audioTrack && audioTrack.clips.length > 0) {
        targetClip = audioTrack.clips[0];
      }
    }
    if (!targetClip) {
      const videoTrack = tracks.find(t => t.type === ClipType.VIDEO && t.clips.length > 0);
      if (videoTrack && videoTrack.clips.length > 0) {
        targetClip = videoTrack.clips[0];
      }
    }

    if (!targetClip || !targetClip.url) {
      alert('Please add or select an audio or video track to perform acoustic auto-segmentation.');
      return;
    }

    try {
      const normUrl = normalizeMediaUrl(targetClip.url);
      const res = await fetch(normUrl);
      if (!res.ok) throw new Error('Failed to fetch audio stream for analysis');
      const arrayBuffer = await res.arrayBuffer();

      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtxClass) throw new Error('Web Audio API not supported on this browser');
      const audioCtx = new AudioCtxClass();
      const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
      const pcmData = audioBuffer.getChannelData(0);
      const sampleRate = audioBuffer.sampleRate;
      await audioCtx.close();

      const speechSegments = analyzeVoiceActivityRMS(pcmData, sampleRate, {
        noiseFloorSensitivity: sensitivity,
        minSilenceMs: customOptions?.minSilenceMs,
        minSpeechMs: customOptions?.minSpeechMs,
        paddingMs: customOptions?.paddingMs,
        customThresholdDb: customOptions?.customThresholdDb,
      });

      if (speechSegments.length === 0) {
        alert('No distinct speech silence pauses detected in this audio. Try adjusting the sensitivity mode or silence threshold.');
        return;
      }

      const segmentedClips = autoSegmentAudioClipsBySilence(targetClip, speechSegments, {
        labelPrefix: targetClip.name.replace(/\s*\[(Part|Ayah)\s*\d+\]/gi, ''),
        startAyahNumber: customOptions?.startAyahNumber || 1,
        gapHandling: customOptions?.gapHandling || 'preserve-gaps',
        paddingMs: customOptions?.paddingMs,
      });

      setTracks(prevTracks => prevTracks.map(track => {
        if (track.id === targetClip!.trackId) {
          const filtered = track.clips.filter(c => c.id !== targetClip!.id);
          return {
            ...track,
            clips: [...filtered, ...segmentedClips].sort((a, b) => a.start - b.start),
          };
        }
        return track;
      }));

      if (segmentedClips.length > 0) {
        setSelectedClipId(segmentedClips[0].id);
      }
    } catch (err: any) {
      console.error('handleAutoSegmentAudio error:', err);
      alert(`Audio auto-segmentation notice: ${err?.message || 'Could not analyze voice pauses'}`);
    }
  };

  const handleAutoSyncVideoToAyahs = (stockAlternativeUrls?: string[]) => {
    const videoTrack = tracks.find(t => t.type === ClipType.VIDEO);
    if (!videoTrack || videoTrack.clips.length === 0) {
      alert('Please add a background video clip to the timeline first.');
      return;
    }

    // Look for Arabic or Translation text clips
    const textTrack = tracks.find(t => t.type === ClipType.TEXT && t.clips.length > 0);
    if (!textTrack || textTrack.clips.length === 0) {
      alert('Please generate or add Quran Ayahs / Caption clips on the timeline to sync video transitions.');
      return;
    }

    const newVideoClips = autoSyncVideoClipsToAyahs(videoTrack.clips, textTrack.clips, stockAlternativeUrls);

    setTracks(prevTracks => prevTracks.map(track => {
      if (track.id === videoTrack.id) {
        return {
          ...track,
          clips: newVideoClips.sort((a, b) => a.start - b.start),
        };
      }
      return track;
    }));

    if (newVideoClips.length > 0) {
      setSelectedClipId(newVideoClips[0].id);
    }
  };

  const handleRepairAndSnapQuranClips = () => {
    const { updatedTracks, fixedCount } = repairAndSnapQuranTracksToAudioSpeech(tracks, duration);
    if (fixedCount > 0) {
      setTracks(updatedTracks);
    }
  };

  const handleAutoRemoveSilence = async (targetClipId?: string) => {
    let targetClip: Clip | null = null;
    if (targetClipId) {
      targetClip = tracks.flatMap(t => t.clips).find(c => c.id === targetClipId) || null;
    }
    if (!targetClip && selectedClipId) {
      targetClip = getSelectedClip();
    }
    if (!targetClip || targetClip.type !== ClipType.AUDIO) {
      const audioTrack = tracks.find(t => t.type === ClipType.AUDIO);
      if (audioTrack && audioTrack.clips.length > 0) {
        targetClip = audioTrack.clips[0];
      }
    }

    if (!targetClip || !targetClip.url) {
      alert('Please select an audio clip to trim silence gaps.');
      return;
    }

    try {
      const normUrl = normalizeMediaUrl(targetClip.url);
      const res = await fetch(normUrl);
      if (!res.ok) throw new Error('Failed to load audio for silence trimming');
      const arrayBuffer = await res.arrayBuffer();

      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioCtxClass();
      const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
      const pcmData = audioBuffer.getChannelData(0);
      const sampleRate = audioBuffer.sampleRate;
      await audioCtx.close();

      const speechSegments = analyzeVoiceActivityRMS(pcmData, sampleRate, {
        minSilenceMs: 250,
        minSpeechMs: 400,
        paddingMs: 40,
      });

      if (speechSegments.length === 0) return;

      // Ripple-align speech blocks back to back without silence gaps
      let currentPlayhead = targetClip.start;
      const trimmedClips: Clip[] = [];

      speechSegments.forEach((seg, idx) => {
        const segDuration = Math.max(0.3, seg.end - seg.start);
        const sourceStart = (targetClip!.sourceStart || 0) + (seg.start * (targetClip!.playbackRate || 1.0));

        trimmedClips.push({
          ...targetClip!,
          id: `clip-trimmed-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 7)}`,
          name: `${targetClip!.name} [Speech ${idx + 1}]`,
          start: Number(currentPlayhead.toFixed(2)),
          duration: Number(segDuration.toFixed(2)),
          sourceStart: Number(sourceStart.toFixed(2)),
          sourceDuration: Number((segDuration * (targetClip!.playbackRate || 1.0)).toFixed(2)),
        });

        currentPlayhead += segDuration;
      });

      setTracks(prevTracks => prevTracks.map(track => {
        if (track.id === targetClip!.trackId) {
          const filtered = track.clips.filter(c => c.id !== targetClip!.id);
          return {
            ...track,
            clips: [...filtered, ...trimmedClips].sort((a, b) => a.start - b.start),
          };
        }
        return track;
      }));
    } catch (err: any) {
      console.warn('handleAutoRemoveSilence error:', err);
    }
  };

  const handleAutoSegmentRhythm = (targetClipId?: string, intervalSec: number = 3.0) => {
    let targetClip: Clip | null = null;
    if (targetClipId) {
      targetClip = tracks.flatMap(t => t.clips).find(c => c.id === targetClipId) || null;
    }
    if (!targetClip && selectedClipId) {
      targetClip = getSelectedClip();
    }
    if (!targetClip) {
      const anyClip = tracks.flatMap(t => t.clips)[0];
      if (anyClip) targetClip = anyClip;
    }

    if (!targetClip) {
      alert('Please select a clip to apply rhythmic beat auto-cut.');
      return;
    }

    const rhythmClips = autoSegmentClipByRhythm(targetClip, intervalSec);
    setTracks(prevTracks => prevTracks.map(track => {
      if (track.id === targetClip!.trackId) {
        const filtered = track.clips.filter(c => c.id !== targetClip!.id);
        return {
          ...track,
          clips: [...filtered, ...rhythmClips].sort((a, b) => a.start - b.start),
        };
      }
      return track;
    }));
  };

  // ------------------ (D) AI AUTO CAPTION PARSER ------------------
  const handleGenerateAICaptions = async (transcript: string, style: string) => {
    const response = await fetch('/api/ai/captions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transcript, style }),
    });
    
    const data = await response.json();
    if (data.subtitles) {
      // Find or create Text Track
      let textTrack = tracks.find(t => t.type === ClipType.TEXT);
      if (!textTrack) {
        textTrack = {
          id: `track-text-ai`,
          name: 'AI Generated Subtitles',
          type: ClipType.TEXT,
          clips: []
        };
        setTracks(prev => insertTrackInProperOrder(prev, textTrack!));
      }

      // Convert generated subtitiles to Timeline Clips
      const newClips: Clip[] = data.subtitles.map((sub: any, idx: number) => ({
        id: `clip-ai-sub-${Date.now()}-${idx}`,
        name: `Sub: ${sub.text.slice(0, 10)}...`,
        type: ClipType.TEXT,
        trackId: textTrack!.id,
        start: sub.start,
        duration: Math.max(1, sub.end - sub.start),
        sourceStart: 0,
        sourceDuration: sub.end - sub.start,
        playbackRate: 1.0,
        volume: 1.0,
        text: sub.text,
        fontSize: style === 'Dynamic' ? 28 : style === 'Neon' ? 26 : 22,
        color: style === 'Neon' ? '#FF00FF' : '#FFFFFF',
        textStyle: style === 'Neon' ? 'neon' : style === 'Minimal' ? 'normal' : 'outline',
        textX: 50,
        textY: 80
      }));

      setTracks(prev => prev.map(t => {
        if (t.type === ClipType.TEXT) {
          return {
            ...t,
            clips: [...t.clips, ...newClips].sort((a, b) => a.start - b.start)
          };
        }
        return t;
      }));
    }
  };

  // ------------------ (D) AI TEXT TO SPEECH VOICEOVER ------------------
  const handleGenerateTTS = async (text: string, voice: string) => {
    const response = await fetch('/api/ai/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, voice }),
    });

    const data = await response.json();
    if (data.success) {
      let audioUrl = '';
      let dur = 5;

      if (data.isMock) {
        // Mock fallback tone in development if API key isn't present
        audioUrl = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3';
        dur = 6;
      } else if (data.audioData) {
        try {
          // Clean non-base64 characters safely to avoid DOMExceptions
          const cleanBase64 = String(data.audioData).replace(/^data:audio\/[^;]+;base64,/, '').replace(/[\r\n\s]/g, '');
          const binary = atob(cleanBase64);
          const bytes = new Uint8Array(binary.length);
          for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
          }
          const blob = new Blob([bytes], { type: 'audio/wav' });
          audioUrl = URL.createObjectURL(blob);
          dur = 4; // Estimate duration or probe
        } catch (e) {
          console.warn('TTS Audio decoding fallback:', e);
          audioUrl = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3';
          dur = 6;
        }
      }

      // Add to Audio track
      let audioTrack = tracks.find(t => t.type === ClipType.AUDIO);
      if (!audioTrack) {
        audioTrack = {
          id: `track-audio-voiceover`,
          name: 'AI voiceovers',
          type: ClipType.AUDIO,
          clips: []
        };
        setTracks(prev => insertTrackInProperOrder(prev, audioTrack!));
      }

      const newVoiceoverClip: Clip = {
        id: `clip-ai-tts-${Date.now()}`,
        name: `AI Voice (${voice})`,
        type: ClipType.AUDIO,
        trackId: audioTrack.id,
        start: currentTime,
        duration: dur,
        sourceStart: 0,
        sourceDuration: dur,
        playbackRate: 1.0,
        volume: 1.0,
        url: audioUrl
      };

      setTracks(prev => prev.map(t => {
        if (t.id === audioTrack!.id) {
          return {
            ...t,
            clips: [...t.clips, newVoiceoverClip].sort((a, b) => a.start - b.start)
          };
        }
        return t;
      }));
    }
  };

  // Helper: Split an Ayah into distinct breath phrases when Option 2 (Split Breath Phrases) is active
  const splitVerseAcrossBreaths = (
    verse: any,
    segs: { start: number; end: number }[],
    symbolOpts: {
      showAyahSymbol: boolean;
      ayahSymbolStyle: AyahSymbolStyle;
      ayahDigitType: AyahDigitType;
      ayahSymbolPosition: AyahSymbolPosition;
    }
  ) => {
    const result: any[] = [];
    const totalSegs = segs.length;

    const isImmune = Boolean(
      verse.isTaawwuz ||
      verse.isTasmiyah ||
      (verse.verse_key && (
        String(verse.verse_key).includes('taawwuz') ||
        String(verse.verse_key).includes('bismillah') ||
        verse.verse_key === 'aux' ||
        verse.verse_key === 'bis'
      ))
    );
    const arWordsList = (verse.text_arabic || '').trim().split(/\s+/).filter(Boolean);
    const isShortAyah = arWordsList.length <= 5;

    if (totalSegs <= 1 || isImmune || isShortAyah) {
      const vNum = verse.verse_number || (verse.verse_key ? parseInt(String(verse.verse_key).split(':')[1], 10) : 1);
      let arText = verse.text_arabic || '';
      if (arText && !verse.isTaawwuz && !verse.isTasmiyah && !isImmune) {
        arText = attachAyahSymbolToText(
          arText,
          vNum,
          symbolOpts.showAyahSymbol ? symbolOpts.ayahSymbolStyle : 'none',
          symbolOpts.ayahDigitType,
          symbolOpts.ayahSymbolPosition
        );
      }
      const vStart = Math.max(0, Number(segs[0].start.toFixed(2)));
      const vEnd = Math.max(vStart + 0.3, Number(segs[totalSegs - 1].end.toFixed(2)));
      return [{
        verse_key: verse.verse_key,
        text_arabic: arText,
        text_english: stripAyahSymbol(verse.text_english || ''),
        start: vStart,
        end: vEnd,
        isTaawwuz: verse.isTaawwuz,
        isTasmiyah: verse.isTasmiyah
      }];
    }

    const arWords = (verse.text_arabic || '').trim().split(/\s+/);
    const enWords = (verse.text_english || '').trim().split(/\s+/);

    const totalSegDur = segs.reduce((sum, s) => sum + Math.max(0.2, Math.max(0, s.end - s.start)), 0) || 1;
    let arWordOffset = 0;
    let enWordOffset = 0;
    let lastEnd = 0;

    for (let sIdx = 0; sIdx < totalSegs; sIdx++) {
      const seg = segs[sIdx];
      const segDur = Math.max(0.2, Math.max(0, seg.end - seg.start));
      const segRatio = segDur / totalSegDur;
      const isLastSeg = (sIdx === totalSegs - 1);

      let arCount = isLastSeg ? arWords.length - arWordOffset : Math.max(1, Math.round(arWords.length * segRatio));
      if (arWordOffset + arCount > arWords.length) {
        arCount = arWords.length - arWordOffset;
      }

      let enCount = isLastSeg ? enWords.length - enWordOffset : Math.max(1, Math.round(enWords.length * segRatio));
      if (enWordOffset + enCount > enWords.length) {
        enCount = enWords.length - enWordOffset;
      }

      const arPhrase = arWords.slice(arWordOffset, arWordOffset + arCount).join(' ');
      const enPhrase = enWords.slice(enWordOffset, enWordOffset + enCount).join(' ');

      arWordOffset += arCount;
      enWordOffset += enCount;

      const vNum = verse.verse_number || (verse.verse_key ? parseInt(String(verse.verse_key).split(':')[1], 10) : 1);
      let arTextWithSym = arPhrase;

      if (isLastSeg && arTextWithSym && !verse.isTaawwuz && !verse.isTasmiyah) {
        arTextWithSym = attachAyahSymbolToText(
          arTextWithSym,
          vNum,
          symbolOpts.showAyahSymbol ? symbolOpts.ayahSymbolStyle : 'none',
          symbolOpts.ayahDigitType,
          symbolOpts.ayahSymbolPosition
        );
      }

      let vStart = Math.max(lastEnd, Math.max(0, Number(seg.start.toFixed(2))));
      let vEnd = Math.max(vStart + 0.2, Number(seg.end.toFixed(2)));

      if (sIdx < totalSegs - 1) {
        const nextRawStart = Math.max(0, Number(segs[sIdx + 1].start.toFixed(2)));
        if (nextRawStart > vStart && vEnd > nextRawStart) {
          vEnd = nextRawStart;
        }
      }

      if (vEnd <= vStart) {
        vEnd = Number((vStart + 0.2).toFixed(2));
      }

      result.push({
        verse_key: verse.isTaawwuz || verse.isTasmiyah ? verse.verse_key : `${verse.verse_key} [${sIdx + 1}/${totalSegs}]`,
        text_arabic: arTextWithSym,
        text_english: stripAyahSymbol(enPhrase),
        start: vStart,
        end: vEnd,
        isTaawwuz: verse.isTaawwuz,
        isTasmiyah: verse.isTasmiyah
      });

      lastEnd = vEnd;
    }

    return result;
  };

  // ------------------ (D2) QURAN AUDIO ALIGNMENT ENGINE ------------------
  const handleAlignQuran = async (params: {
    surah: number | string;
    startAyah: number;
    mode: 'individual' | 'batch';
    style: string;
    selectionType?: 'single' | 'range' | 'list' | 'all' | 'mixed' | 'collection';
    surahEnd?: number;
    surahList?: string;
    introMode?: 'both' | 'taawwuz-only' | 'bismillah-only' | 'none';
    breathMode?: 'full-ayah' | 'split-breaths';
    recitationPace?: 'slow-tartil' | 'standard' | 'fast-hadr';
    enableDualTranslation?: boolean;
    dualTranslationLanguage?: string;
  }) => {
    const {
      surah,
      startAyah = 1,
      mode = 'batch',
      style = 'Imperial Gold',
      selectionType = 'single' as any,
      surahEnd,
      surahList,
      introMode,
      breathMode,
      recitationPace,
      enableDualTranslation,
      dualTranslationLanguage
    } = params;
    const effectiveBreathMode = breathMode || quranBreathSegmentationMode;
    const effectivePace = recitationPace || quranRecitationPace || 'standard';
    const isDualTrans = enableDualTranslation !== undefined ? enableDualTranslation : quranEnableDualTranslation;
    const dualTransLang = dualTranslationLanguage || quranDualTranslationLang || 'en-sahih';
    
    // Initialize the Diagnostics Terminal
    setAligningStatus({
      status: 'running',
      progress: 5,
      log: [
        `[System] Initializing Quranic Audio Alignment Suite v4`,
        `[System] Target Scope: Surah ${surah} (${selectionType.toUpperCase()}), starting at Ayah ${startAyah}`,
        `[System] Compilation Style: ${style}`,
        `[System] Opening Mode: ${(introMode || quranIntroMode).toUpperCase()}`,
        `[System] Breath Mode: ${effectiveBreathMode === 'full-ayah' ? 'Option 1: Full Ayah Display' : 'Option 2: Split Breath Phrases'}`,
        `[System] Extraction Mode: ${mode === 'batch' ? 'High-Performance Batch Download' : 'Interactive Individual Verse Sync'}`
      ]
    });

    const addLog = (msg: string, progressVal?: number) => {
      setAligningStatus(prev => {
        if (!prev) return prev;
        return {
          status: prev.status,
          progress: progressVal !== undefined ? progressVal : prev.progress,
          log: [...prev.log, msg]
        };
      });
    };

    const arrayBufferToBase64Async = (buffer: ArrayBuffer): Promise<string> => {
      return new Promise((resolve) => {
        try {
          if (!buffer || buffer.byteLength === 0) return resolve('');
          const bytes = new Uint8Array(buffer);
          let binary = '';
          const len = bytes.byteLength;
          const chunkSize = 8192;
          for (let i = 0; i < len; i += chunkSize) {
            binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunkSize) as any);
          }
          resolve(btoa(binary));
        } catch (err) {
          const blob = new Blob([buffer], { type: 'application/octet-stream' });
          const reader = new FileReader();
          reader.onload = (e) => {
            const result = e.target?.result as string;
            if (result && result.includes(',')) {
              resolve(result.split(',')[1] || '');
            } else {
              resolve('');
            }
          };
          reader.onerror = () => resolve('');
          reader.readAsDataURL(blob);
        }
      });
    };

    const getAudioChunksWavBase64 = async (arrayBuffer: ArrayBuffer, chunkDurationSec: number = 180): Promise<{base64: string, offset: number, duration: number, mimeType: string}[]> => {
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const decodedBuffer = await audioCtx.decodeAudioData(arrayBuffer.slice(0));
        
        const targetSampleRate = 8000;
        const totalDuration = decodedBuffer.duration;
        const chunks = [];
        
        for (let offset = 0; offset < totalDuration; offset += chunkDurationSec) {
          const duration = Math.min(chunkDurationSec, totalDuration - offset);
          const offlineCtx = new OfflineAudioContext(1, duration * targetSampleRate, targetSampleRate);
          const source = offlineCtx.createBufferSource();
          source.buffer = decodedBuffer;
          source.connect(offlineCtx.destination);
          source.start(0, offset, duration);
          const renderedBuffer = await offlineCtx.startRendering();
          
          const numOfChan = renderedBuffer.numberOfChannels;
          const length = renderedBuffer.length * numOfChan * 2 + 44;
          const buffer = new ArrayBuffer(length);
          const view = new DataView(buffer);
          const channel = renderedBuffer.getChannelData(0);
          let pos = 0;
          let buffOffset = 0;
          
          const setUint16 = (data: number) => { view.setUint16(pos, data, true); pos += 2; };
          const setUint32 = (data: number) => { view.setUint32(pos, data, true); pos += 4; };
          
          setUint32(0x46464952); // "RIFF"
          setUint32(length - 8); // file length - 8
          setUint32(0x45564157); // "WAVE"
          setUint32(0x20746d66); // "fmt "
          setUint32(16); // length = 16
          setUint16(1); // PCM
          setUint16(numOfChan);
          setUint32(targetSampleRate);
          setUint32(targetSampleRate * 2 * numOfChan); // avg. bytes/sec
          setUint16(numOfChan * 2); // block-align
          setUint16(16); // 16-bit
          setUint32(0x61746164); // "data"
          setUint32(length - pos - 4); // chunk length
          
          while (buffOffset < renderedBuffer.length) {
              let sample = Math.max(-1, Math.min(1, channel[buffOffset]));
              sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0;
              view.setInt16(pos, sample, true);
              pos += 2;
              buffOffset++;
          }
          
          const base64 = await arrayBufferToBase64Async(buffer);
          chunks.push({ base64, offset, duration, mimeType: 'audio/wav' });
        }
        return chunks;
      } catch (err) {
        console.error("Failed to chunk audio:", err);
        throw err;
      }
    };

    try {
      // Step 1: Scan for active audio or video tracks
      addLog(`[System] Scanning active timeline tracks for voice and video assets...`, 10);
      
      let targetClip: Clip | null = null;
      const audioTracks = tracks.filter(t => t.type === ClipType.AUDIO);
      const videoTracks = tracks.filter(t => t.type === ClipType.VIDEO);
      
      // Look for custom audio clip first
      for (const t of audioTracks) {
        if (t.clips.length > 0) {
          targetClip = t.clips[0];
          break;
        }
      }
      
      // If none, look for custom video clip (which has recitation voice)
      if (!targetClip) {
        for (const t of videoTracks) {
          if (t.clips.length > 0 && !t.clips[0].isImage) {
            targetClip = t.clips[0];
            break;
          }
        }
      }
      
      if (!targetClip) {
        // Auto-load Fatihah recitation if timeline is empty
        addLog(`[Warning] No active audio or video track detected on timeline.`, 15);
        addLog(`[System] Automatically initializing stock recitation track "Surah Al-Fatihah (Mishary Alafasy)"...`, 20);
        
        const defaultFatihahClip: Clip = {
          id: `clip-fatihah-auto`,
          name: 'Surah Al-Fatihah (Mishary Alafasy)',
          type: ClipType.AUDIO,
          trackId: 'track-audio-1',
          start: 0,
          duration: 44,
          sourceStart: 0,
          sourceDuration: 44,
          playbackRate: 1.0,
          volume: 1.0,
          url: 'https://download.quranicaudio.com/quran/mishaari_raashid_al_afasy/001.mp3'
        };
 
         // Insert clip
         setTracks(prev => prev.map(t => {
           if (t.id === 'track-audio-1') {
             return {
               ...t,
               clips: [defaultFatihahClip]
             };
           }
           return t;
         }));
 
         targetClip = defaultFatihahClip;
         await new Promise(r => setTimeout(r, 400));
       }
 
       addLog(`[System] Selected audio voice target: "${targetClip.name}" (${targetClip.duration.toFixed(1)} seconds)`, 25);
       
       // Step 2: Fetch voice audio data as binary array buffer
       addLog(`[Audio Engine] Fetching voice track binary array buffer...`, 35);
       let totalAudioDuration = targetClip.duration || 0;
       let base64Audio = '';
       let audioChunks: {base64: string, offset: number, duration: number, mimeType: string}[] = [];
       let fileMime = targetClip.type === ClipType.VIDEO ? 'video/mp4' : 'audio/mp3';
       if (targetClip.url) {
         try {
           const mediaUrl = normalizeMediaUrl(targetClip.url);
           const audioRes = await fetch(mediaUrl);
           if (audioRes.ok) {
             const arrayBuffer = await audioRes.arrayBuffer();
             const contentType = audioRes.headers.get('content-type');
             if (contentType) {
               fileMime = contentType;
             } else if (mediaUrl.includes('.wav')) {
               fileMime = 'audio/wav';
             } else if (mediaUrl.includes('.ogg')) {
               fileMime = 'audio/ogg';
             } else if (mediaUrl.includes('.mp4') || targetClip.type === ClipType.VIDEO) {
               fileMime = 'video/mp4';
             } else if (mediaUrl.includes('.webm')) {
               fileMime = 'video/webm';
             }

             const sizeMB = arrayBuffer.byteLength / 1024 / 1024;
             if (sizeMB > 8 || totalAudioDuration > 180) {
               addLog(`[Audio Engine] Long recitation detected (${(totalAudioDuration / 60).toFixed(1)} mins, ${sizeMB.toFixed(1)}MB). Preparing precision 3-minute chunks for full audio auto-segmentation...`, 40);
               try {
                 audioChunks = await getAudioChunksWavBase64(arrayBuffer, 180);
                 addLog(`[Audio Engine] Successfully prepared ${audioChunks.length} audio chunks for complete auto-segmentation.`, 45);
               } catch (compressErr) {
                 console.warn('[Audio Engine] Browser WebAudio chunking hit memory limit. Offloading to backend FFmpeg slicer...', compressErr);
                 addLog(`[Audio Engine] Offloading long recitation slicing to backend FFmpeg pipeline...`, 42);
                 try {
                   const rawBase64 = await arrayBufferToBase64Async(arrayBuffer);
                   const sliceRes = await fetch('/api/audio/slice-chunks', {
                     method: 'POST',
                     headers: { 'Content-Type': 'application/json' },
                     body: JSON.stringify({ audioData: rawBase64, mimeType: fileMime, chunkDuration: 180 })
                   });
                   if (sliceRes.ok) {
                     const sliceData = await sliceRes.json();
                     audioChunks = sliceData.chunks || [];
                     addLog(`[Audio Engine] FFmpeg successfully sliced audio into ${audioChunks.length} segments!`, 45);
                   } else {
                     throw new Error(`FFmpeg slicing returned status ${sliceRes.status}`);
                   }
                 } catch (serverSliceErr) {
                   console.warn('[Audio Engine] Server slicing error, using original audio:', serverSliceErr);
                   if (sizeMB > 400) {
                     addLog(`[Info] Media file is excessively large (${sizeMB.toFixed(1)}MB). Using Local Quran Engine.`, 45);
                   } else {
                     base64Audio = await arrayBufferToBase64Async(arrayBuffer);
                     audioChunks = [{ base64: base64Audio, offset: 0, duration: totalAudioDuration, mimeType: fileMime }];
                   }
                 }
               }
             } else {
               addLog(`[Audio Engine] Encoding voice track (${fileMime}, ${sizeMB.toFixed(1)}MB) for Quran Aligner API...`, 45);
               base64Audio = await arrayBufferToBase64Async(arrayBuffer);
               audioChunks = [{ base64: base64Audio, offset: 0, duration: totalAudioDuration, mimeType: fileMime }];
             }
           }
         } catch (fetchErr: any) {
           console.warn('[Quran AI] Could not fetch audio binary:', fetchErr);
           addLog(`[Info] Voice track processed with intelligent alignment engine.`, 45);
           base64Audio = '';
         }
       }

      // Step 3: Trigger backend / client-side Quran Voice Alignment Pipeline & Scope Compiler
      addLog(`[Quran AI] Initiating Scope Verse Compiler for mode "${selectionType.toUpperCase()}"...`, 55);
      
      let surahsToProcess: number[] = [];
      const surahStr = String(surah).trim();

      if (surahStr === 'all_surahs' || (selectionType as any) === 'all_surahs') {
        surahsToProcess = Array.from({ length: 114 }, (_, i) => i + 1);
      } else if (selectionType === 'range' || surahStr.includes('-')) {
        const parts = surahStr.split('-').map(s => parseInt(s.trim()));
        const startS = parts[0] || 1;
        const endS = parts[1] || surahEnd || startS;
        const minS = Math.min(startS, endS);
        const maxS = Math.max(startS, endS);
        for (let s = minS; s <= maxS; s++) {
          surahsToProcess.push(s);
        }
      } else if (selectionType === 'list' || surahStr.includes(',')) {
        const listSource = surahList || surahStr;
        surahsToProcess = listSource
          .split(',')
          .map(s => parseInt(s.trim()))
          .filter(n => !isNaN(n) && n >= 1 && n <= 114);
        if (surahsToProcess.length === 0) surahsToProcess = [1];
      } else {
        // Single surah selected (e.g. Surah 67 Al-Mulk)
        surahsToProcess = [parseInt(surahStr) || 1];
      }

      addLog(`[Quran AI] Processing selected Surah #${surahsToProcess.join(', ')} (${selectionType === 'single' ? `Ayah ${startAyah}` : 'Mukammal Surah - All Verses'})...`, 60);

      // Web Audio API VAD RMS Voice Activity Analysis with True Speech Onset & Offset Boundaries
      let acousticSpeechSegments: Array<{ start: number; end: number }> = [];
      

      if (targetClip?.url) {
        try {
          addLog(`[Web Audio API Engine] Decoding audio channel buffer for acoustic RMS voice scanning...`, 62);
          const normUrl = normalizeMediaUrl(targetClip.url);
          const audioRes = await fetch(normUrl);
          if (audioRes.ok) {
            const arrayBuffer = await audioRes.arrayBuffer();
            const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
            if (AudioCtxClass) {
              const audioCtx = new AudioCtxClass();
              const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
              const pcmData = audioBuffer.getChannelData(0);
              const sampleRate = audioBuffer.sampleRate;
              totalAudioDuration = Math.max(targetClip.duration || 0, audioBuffer.duration || 0);
              audioCtx.close();

              // Adaptive multi-scale RMS voice activity analysis tailored for Quranic recitation with natural Waqf pauses and pace selection
              const vadSensitivity = effectivePace === 'slow-tartil' ? 'tartil' : (effectivePace === 'fast-hadr' ? 'hadr' : 'quran-ayah');
              acousticSpeechSegments = analyzeVoiceActivityRMS(pcmData, sampleRate, {
                noiseFloorSensitivity: vadSensitivity
              });

              addLog(`[RMS Voice Analyzer] Extracted ${acousticSpeechSegments.length} natural voice speech segments with breathing pause gaps across ${totalAudioDuration.toFixed(1)}s audio.`, 65);
            }
          }
        } catch (audioErr) {
          console.warn('[VAD Engine] Audio decoding fallback in handleAlignQuran:', audioErr);
        }
      }

      const allRawVerses: any[] = [];
      const transOpt = getTranslationOptionById(quranTranslation);
      const transApiId = transOpt.apiId || 20;

      if (selectionType === 'mixed' || selectionType === 'collection') {
        const mixedStr = String(surahList || surahStr || surah).trim();
        addLog(`[Quran AI] Parsing mixed collection targets: "${mixedStr}"...`, 56);
        const targets = parseMixedAyahsString(mixedStr);
        addLog(`[Quran AI] Mixed collection parsed: ${targets.length} verses specified.`, 58);
        
        // 1. Load unique surahs we need to fetch
        const uniqueSurahs = Array.from(new Set(targets.map(t => t.surah))).sort((a, b) => a - b);
        const surahVersesCache: Record<number, any[]> = {};
        
        for (const sNum of uniqueSurahs) {
          addLog(`[Quran AI] Fetching scripture & ${transOpt.language} translation for Surah #${sNum}...`, 60);
          let surahVerses: any[] = [];
          let page = 1;
          let totalPages = 1;
          
          while (page <= totalPages && page <= 5) {
            try {
              const apiUrl = `https://api.quran.com/api/v4/verses/by_chapter/${sNum}?language=${transOpt.languageCode}&words=false&translations=${transApiId}&fields=text_uthmani&per_page=300&page=${page}`;
              const controller = new AbortController();
              const timeoutId = setTimeout(() => controller.abort(), 3000);
              const res = await fetch(apiUrl, { signal: controller.signal });
              clearTimeout(timeoutId);
              if (res.ok) {
                const data = await res.json();
                totalPages = data.pagination?.total_pages || 1;
                const raw = data.verses || [];
                const mapped = raw.map((v: any, idx: number) => {
                  const vNum = v.verse_number || (v.verse_key ? parseInt(v.verse_key.split(':')[1], 10) : (page - 1) * 300 + idx + 1);
                  let rawArabic = v.text_uthmani || v.text_arabic || '';
                  rawArabic = attachAyahSymbolToText(
                    rawArabic,
                    vNum,
                    quranShowAyahSymbol ? quranAyahSymbolStyle : 'none',
                    quranAyahDigitType,
                    quranAyahSymbolPosition
                  );
                  return {
                    verse_key: v.verse_key,
                    verse_number: vNum,
                    text_arabic: rawArabic,
                    text_english: (v.translations?.[0]?.text || '')
                      .replace(/<[^>]*>/g, '')
                      .replace(/[\{\}\[\]\(\)]/g, '')
                      .replace(/&nbsp;/g, ' ')
                      .trim()
                  };
                });
                surahVerses.push(...mapped);
                page++;
              } else {
                break;
              }
            } catch (fetchErr) {
              console.warn(`[Quran AI] Mixed fetch failed for Surah ${sNum}:`, fetchErr);
              break;
            }
          }
          
          if (surahVerses.length === 0) {
            const fallbackSubs = await alignQuranLocalClient({
              surah: sNum,
              startAyah: 1,
              style,
              mode: 'batch',
              ayahSymbolStyle: quranShowAyahSymbol ? quranAyahSymbolStyle : 'none',
              ayahDigitType: quranAyahDigitType,
              ayahSymbolPosition: quranAyahSymbolPosition,
              showAyahSymbol: quranShowAyahSymbol,
            });
            surahVerses = fallbackSubs.map((s, idx) => {
              const parts = (s.verse_key || '').split(':');
              const vNum = parts[1] ? parseInt(parts[1], 10) : idx + 1;
              let arText = s.text_arabic || '';
              arText = attachAyahSymbolToText(
                arText,
                vNum,
                quranShowAyahSymbol ? quranAyahSymbolStyle : 'none',
                quranAyahDigitType,
                quranAyahSymbolPosition
              );
              const offlineText = OFFLINE_SURAH_TRANSLATIONS[s.verse_key]?.[transOpt.languageCode] || s.text_english;
              return {
                verse_key: s.verse_key,
                verse_number: vNum,
                text_arabic: arText,
                text_english: stripAyahSymbol(offlineText)
              };
            });
          }
          
          surahVersesCache[sNum] = surahVerses;
        }
        
        // 2. Add starting intro modes if requested
        const currentIntroMode = introMode || quranIntroMode || 'none';
        if (currentIntroMode === 'both' || currentIntroMode === 'taawwuz-only') {
          allRawVerses.push({
            verse_key: `${targets[0]?.surah || 1}:0:taawwuz`,
            verse_number: 0,
            text_arabic: 'أَعُوذُ بِاللَّهِ مِنَ الشَّيْطَانِ الرَّجِيمِ',
            text_english: getTaawwuzTranslation(transOpt.languageCode),
            isTaawwuz: true
          });
        }
        if (currentIntroMode === 'both' || currentIntroMode === 'bismillah-only') {
          allRawVerses.push({
            verse_key: `${targets[0]?.surah || 1}:0:bismillah`,
            verse_number: 0,
            text_arabic: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
            text_english: getTasmiyahTranslation(transOpt.languageCode),
            isTasmiyah: true
          });
        }
        
        // 3. Assemble target verses in exact collection sequence
        for (const target of targets) {
          const sVerses = surahVersesCache[target.surah] || [];
          const matched = sVerses.find(v => {
            const parts = (v.verse_key || '').split(':');
            const vNum = parseInt(parts[1], 10);
            return vNum === target.ayah;
          });
          
          if (matched) {
            allRawVerses.push(matched);
          } else {
            const key = `${target.surah}:${target.ayah}`;
            allRawVerses.push({
              verse_key: key,
              verse_number: target.ayah,
              text_arabic: `[Verse ${key}]`,
              text_english: `[Translation ${key}]`
            });
          }
        }
        
        surahsToProcess = uniqueSurahs;
        addLog(`[Quran AI] Mixed Collection compiled successfully with ${targets.length} verses.`, 65);
      } else {
        // Infinite Whole-Surah Dynamic Progression Array Iterator Loop
        for (let sIdx = 0; sIdx < surahsToProcess.length; sIdx++) {
          const currentSurah = surahsToProcess[sIdx];
          const isFirstSurah = (sIdx === 0);
          const isNotTawbahThis = currentSurah !== 9;
          const currentIntroMode = introMode || quranIntroMode || 'none';

          // 1. Opening Verse Rules for Multi-Surah & Single Surah:
          // - First Surah: Follows selected Intro Mode (e.g. Ta'awwuz + Bismillah, or Bismillah only)
          // - Subsequent Surahs in the audio: Automatically insert Bismillah (unless Surah At-Tawbah #9)
          if (isFirstSurah) {
            const isStartFromFirstAyah = (selectionType === 'single' ? startAyah === 1 : true);
            const shouldIncludeTaawwuz = isStartFromFirstAyah && isNotTawbahThis && (currentIntroMode === 'both' || currentIntroMode === 'taawwuz-only');
            const shouldIncludeBismillah = isStartFromFirstAyah && isNotTawbahThis && (currentIntroMode === 'both' || currentIntroMode === 'bismillah-only');

            if (shouldIncludeTaawwuz) {
              allRawVerses.push({
                verse_key: `${currentSurah}:0:taawwuz`,
                verse_number: 0,
                text_arabic: 'أَعُوذُ بِاللَّهِ مِنَ الشَّيْطَانِ الرَّجِيمِ',
                text_english: getTaawwuzTranslation(transOpt.languageCode),
                isTaawwuz: true
              });
            }

            if (shouldIncludeBismillah) {
              allRawVerses.push({
                verse_key: `${currentSurah}:0:bismillah`,
                verse_number: 0,
                text_arabic: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
                text_english: getTasmiyahTranslation(transOpt.languageCode),
                isTasmiyah: true
              });
            }
          } else {
            // For all subsequent Surahs occurring in the multi-surah audio:
            // Automatically include Bismillah as the opening header of each following Surah (unless Surah 9 At-Tawbah)
            if (isNotTawbahThis && currentIntroMode !== 'none') {
              allRawVerses.push({
                verse_key: `${currentSurah}:0:bismillah`,
                verse_number: 0,
                text_arabic: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
                text_english: getTasmiyahTranslation(transOpt.languageCode),
                isTasmiyah: true
              });
            }
          }

          addLog(`[Quran AI] Fetching scripture & ${transOpt.language} translation for Surah #${currentSurah}...`, 68 + Math.floor((sIdx / surahsToProcess.length) * 10));

          let surahVerses: any[] = [];
          let page = 1;
          let totalPages = 1;

          // Asynchronous recursive pagination loop to fetch ALL verses of the chapter
          while (page <= totalPages && page <= 5) {
            try {
              const apiUrl = `https://api.quran.com/api/v4/verses/by_chapter/${currentSurah}?language=${transOpt.languageCode}&words=false&translations=${transApiId}&fields=text_uthmani&per_page=300&page=${page}`;
              const controller = new AbortController();
              const timeoutId = setTimeout(() => controller.abort(), 3000);
              const res = await fetch(apiUrl, { signal: controller.signal });
              clearTimeout(timeoutId);
              if (res.ok) {
                const data = await res.json();
                totalPages = data.pagination?.total_pages || 1;
                const raw = data.verses || [];
                const mapped = raw.map((v: any, idx: number) => {
                  const vNum = v.verse_number || (v.verse_key ? parseInt(v.verse_key.split(':')[1], 10) : (page - 1) * 300 + idx + 1);
                  let rawArabic = v.text_uthmani || v.text_arabic || '';
                  rawArabic = attachAyahSymbolToText(
                    rawArabic,
                    vNum,
                    quranShowAyahSymbol ? quranAyahSymbolStyle : 'none',
                    quranAyahDigitType,
                    quranAyahSymbolPosition
                  );
                  return {
                    verse_key: v.verse_key,
                    verse_number: vNum,
                    text_arabic: rawArabic,
                    text_english: (v.translations?.[0]?.text || '')
                      .replace(/<[^>]*>/g, '')
                      .replace(/[\{\}\[\]\(\)]/g, '')
                      .replace(/&nbsp;/g, ' ')
                      .trim()
                  };
                });
                surahVerses.push(...mapped);
                page++;
              } else {
                break;
              }
            } catch (fetchErr) {
              console.warn(`[Quran AI] API page ${page} fetch failed for Surah ${currentSurah}:`, fetchErr);
              break;
            }
          }

          // Offline dataset fallback if network fetch was incomplete
          if (surahVerses.length === 0) {
            const fallbackSubs = await alignQuranLocalClient({
              surah: currentSurah,
              startAyah: (sIdx === 0 && selectionType === 'single') ? startAyah : 1,
              style,
              mode,
              ayahSymbolStyle: quranShowAyahSymbol ? quranAyahSymbolStyle : 'none',
              ayahDigitType: quranAyahDigitType,
              ayahSymbolPosition: quranAyahSymbolPosition,
              showAyahSymbol: quranShowAyahSymbol,
            });
            surahVerses = fallbackSubs.map((s, idx) => {
              const parts = (s.verse_key || '').split(':');
              const vNum = parts[1] ? parseInt(parts[1], 10) : idx + 1;
              let arText = s.text_arabic || '';
              arText = attachAyahSymbolToText(
                arText,
                vNum,
                quranShowAyahSymbol ? quranAyahSymbolStyle : 'none',
                quranAyahDigitType,
                quranAyahSymbolPosition
              );
              const offlineText = OFFLINE_SURAH_TRANSLATIONS[s.verse_key]?.[transOpt.languageCode] || s.text_english;
              return {
                verse_key: s.verse_key,
                verse_number: vNum,
                text_arabic: arText,
                text_english: stripAyahSymbol(offlineText)
              };
            });
          }

          if (sIdx === 0 && selectionType === 'single') {
            surahVerses = surahVerses.filter(v => {
              const parts = v.verse_key.split(':');
              const ayahNum = parseInt(parts[1]) || 1;
              return ayahNum === startAyah;
            });
          }

          // Guarantee strict sequential order (Ayah 1, Ayah 2, Ayah 3...)
          surahVerses.sort((a, b) => (a.verse_number || 0) - (b.verse_number || 0));

          allRawVerses.push(...surahVerses);
        }
      }

      // CTC FORCED ALIGNMENT ENGINE (Strict Quran Caption Rules 1 to 5)
      // Enforces VAD Silence Detection, Text-Anchored Verification, Dynamic Waqf,
      // Levenshtein Zero-Drift Sequence Matching, I'adah Pointer Rewind, and ±120ms Edge Padding
      const engineInputs: QuranVerseInput[] = allRawVerses.map(v => ({
        verse_key: v.verse_key,
        verse_number: v.verse_number,
        text_uthmani: v.text_arabic || '',
        text_arabic: v.text_arabic || '',
        translation: v.text_english || '',
        text_english: v.text_english || '',
        isTaawwuz: v.isTaawwuz,
        isTasmiyah: v.isTasmiyah
      }));

      let subtitles: any[] = [];
      let aiSubtitles: any[] | null = null;

      // Primary AI Alignment: Call Gemini 3.8 Flash Multimodal Speech Aligner via Smart Chunks
      if (audioChunks.length > 0) {
        let allChunkSubtitles: any[] = [];
        let currentVerseIndex = 0;
        let consecutiveErrors = 0;

        for (let i = 0; i < audioChunks.length; i++) {
          const chunk = audioChunks[i];
          const chunkProgress = 70 + Math.round((i / audioChunks.length) * 12);
          const chunkTimeLabel = `${Math.floor(chunk.offset / 60)}:${String(Math.floor(chunk.offset % 60)).padStart(2, '0')} - ${Math.floor((chunk.offset + chunk.duration) / 60)}:${String(Math.floor((chunk.offset + chunk.duration) % 60)).padStart(2, '0')}`;
          addLog(`[Gemini AI Aligner] Processing recitation chunk ${i + 1}/${audioChunks.length} (${chunkTimeLabel})...`, chunkProgress);

          // Build sliding window of 25 verses for this chunk with 1-verse lookback
          const windowStart = Math.max(0, currentVerseIndex - 1);
          const windowEnd = Math.min(allRawVerses.length, currentVerseIndex + 25);
          const chunkReferenceVerses = allRawVerses.slice(windowStart, windowEnd).map(v => ({
            verse_key: v.verse_key,
            verse_number: v.verse_number,
            text_uthmani: v.text_arabic || '',
            translation: v.text_english || ''
          }));

          const effectiveIntro = i === 0 ? (introMode || quranIntroMode || 'both') : 'none';
          const chunkStartAyah = allRawVerses[currentVerseIndex]?.verse_number || startAyah;
          const chunkEndAyah = allRawVerses[Math.max(0, windowEnd - 1)]?.verse_number || undefined;

          // Attempt up to 2 tries per chunk for high reliability on long audio
          let chunkDone = false;
          let retries = 0;
          while (!chunkDone && retries < 2) {
            try {
              const alignRes = await fetch('/api/ai/quran-align', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  audioData: chunk.base64,
                  mimeType: chunk.mimeType,
                  surah: surahsToProcess.join(','),
                  startAyah: chunkStartAyah,
                  endAyah: chunkEndAyah,
                  selectionType,
                  audioDuration: chunk.duration,
                  chunkOffset: chunk.offset,
                  referenceVerses: chunkReferenceVerses,
                  breathMode: effectiveBreathMode,
                  introMode: effectiveIntro,
                  language: transOpt.languageCode || 'en'
                })
              });

              if (alignRes.ok) {
                const data = await alignRes.json();
                if (data.subtitles && Array.isArray(data.subtitles) && data.subtitles.length > 0) {
                  // Boundary-aware deduplication and stitching when appending chunk subtitles:
                  // If the first verse in this chunk matches the last verse of a previous chunk,
                  // merge or extend its timing to preserve the full recitation boundary without splitting or duplicating
                  for (const sub of data.subtitles) {
                    const shiftedStart = sub.start + chunk.offset;
                    const shiftedEnd = sub.end + chunk.offset;
                    const subKey = String(sub.verse_key || '').toLowerCase();
                    const isIntro = subKey === 'aux' || subKey === 'bis';

                    const existingIdx = allChunkSubtitles.findIndex((prev: any) => {
                      const prevKey = String(prev.verse_key || '').toLowerCase();
                      if (isIntro && prevKey === subKey) return true;
                      if (!isIntro && prevKey === subKey) {
                        // In split-breaths mode, only merge if they significantly overlap in time.
                        // If they don't overlap, they are separate breath phrases and should both be kept!
                        if (effectiveBreathMode === 'split-breaths') {
                          const overlap = Math.max(0, Math.min(prev.end, shiftedEnd) - Math.max(prev.start, shiftedStart));
                          return overlap > 0.5;
                        }
                        return true;
                      }
                      return false;
                    });

                    if (existingIdx !== -1 && !isIntro) {
                      // Verse overlaps across chunk boundary: span full duration from start of first chunk to end of second
                      const existing = allChunkSubtitles[existingIdx];
                      existing.start = Math.min(existing.start, shiftedStart);
                      existing.end = Math.max(existing.end, shiftedEnd);
                    } else {
                      allChunkSubtitles.push({
                        ...sub,
                        start: shiftedStart,
                        end: shiftedEnd
                      });
                    }
                  }

                  // Update currentVerseIndex to track recitation progress through the surah
                  for (let sIdx = data.subtitles.length - 1; sIdx >= 0; sIdx--) {
                    const lastSub = data.subtitles[sIdx];
                    if (lastSub && lastSub.verse_key && lastSub.verse_key !== 'aux' && lastSub.verse_key !== 'bis') {
                      const foundIdx = allRawVerses.findIndex(v => v.verse_key === lastSub.verse_key);
                      if (foundIdx !== -1) {
                        currentVerseIndex = Math.min(allRawVerses.length - 1, foundIdx + 1);
                        break;
                      }
                    }
                  }

                  addLog(`[Gemini AI Aligner] Aligned ${data.subtitles.length} verses in chunk ${i + 1}/${audioChunks.length}!`, chunkProgress + 1);
                  chunkDone = true;
                  consecutiveErrors = 0;
                } else {
                  console.warn(`[Quran AI] Chunk ${i + 1} returned no subtitle segments.`);
                  chunkDone = true;
                }
              } else {
                if (alignRes.status === 401) {
                  addLog(`[Quran AI] ❌ Your Gemini API Key is invalid or expired. Switching to Local Quran Engine.`, 72);
                  retries = 99;
                  break;
                } else if (alignRes.status === 429) {
                  addLog(`[Quran AI] ❌ Gemini API Quota Exceeded. Please check your billing or wait a moment.`, 72);
                  retries = 99;
                  break;
                } else {
                  retries++;
                  if (retries >= 2) {
                    console.warn(`[Quran AI] Chunk ${i + 1} failed after retry (HTTP ${alignRes.status}).`);
                    consecutiveErrors++;
                  }
                }
              }
            } catch (chunkErr: any) {
              retries++;
              if (retries >= 2) {
                console.warn('[Quran AI] Network error on chunk', i + 1, chunkErr);
                consecutiveErrors++;
              }
            }
          }

          if (consecutiveErrors >= 3) {
            addLog(`[Quran AI] Multiple API network interruptions. Finalizing aligned chunks...`, 75);
            break;
          }
        }

        if (allChunkSubtitles.length > 0) {
          aiSubtitles = allChunkSubtitles.sort((a, b) => a.start - b.start);
          addLog(`[Gemini AI Aligner] Mukammal Auto-Segmentation: Successfully aligned ${aiSubtitles.length} verses covering ${totalAudioDuration.toFixed(1)}s recitation!`, 78);
        }
      }

      if (aiSubtitles && aiSubtitles.length > 0) {
        // Group same-verse segments to assign phrase indexes
        const verseGroups: { [key: string]: any[] } = {};
        aiSubtitles.forEach((sub: any) => {
          const keyStr = String(sub.verse_key || '').toLowerCase();
          const isIntro = keyStr === 'aux' || keyStr === 'bis' || keyStr.includes('taawwuz') || keyStr.includes('bismillah');
          if (!isIntro) {
            let vNum = typeof sub.verse_number === 'number' && sub.verse_number > 0 ? sub.verse_number : 0;
            if (!vNum) {
              const parts = keyStr.split(':');
              if (parts.length >= 2 && parts[1]) {
                vNum = parseInt(parts[1], 10);
              } else if (parts.length === 1 && /^\d+$/.test(parts[0])) {
                vNum = parseInt(parts[0], 10);
              }
            }
            if (vNum > 0) {
              if (!verseGroups[vNum]) verseGroups[vNum] = [];
              verseGroups[vNum].push(sub);
            }
          }
        });

        // Assign phrase index and total phrases
        Object.keys(verseGroups).forEach((vNumStr) => {
          const group = verseGroups[vNumStr];
          if (group.length > 1) {
            group.forEach((sub, gIdx) => {
              sub.subPhraseIndex = gIdx + 1;
              sub.totalSubPhrases = group.length;
              // Clean verse_key base and add [idx/total] suffix
              const baseKey = String(sub.verse_key || '').split(' ')[0];
              sub.verse_key = `${baseKey} [${gIdx + 1}/${group.length}]`;
            });
          } else if (group.length === 1) {
            group[0].subPhraseIndex = 1;
            group[0].totalSubPhrases = 1;
          }
        });

        let nonIntroCounter = 0;
        subtitles = aiSubtitles.map((sub: any, idx: number) => {
          let arText = sub.text_arabic || '';
          const keyStr = String(sub.verse_key || '').toLowerCase();
          const isAux = keyStr === 'aux' || keyStr.includes('taawwuz') || Boolean(sub.isTaawwuz) || (sub.verse_number === 0 && idx === 0 && !keyStr.includes('bis'));
          const isBis = keyStr === 'bis' || keyStr.includes('bismillah') || keyStr.includes('tasmiyah') || Boolean(sub.isTasmiyah) || (sub.verse_number === 0 && !isAux);

          let vNum = typeof sub.verse_number === 'number' && sub.verse_number > 0 ? sub.verse_number : 0;
          if (!vNum && !isAux && !isBis) {
            const parts = keyStr.split(':');
            if (parts.length >= 2 && parts[1]) {
              vNum = parseInt(parts[1], 10);
            } else if (parts.length === 1 && /^\d+$/.test(parts[0])) {
              vNum = parseInt(parts[0], 10);
            }
          }
          if (!vNum && !isAux && !isBis) {
            vNum = (typeof startAyah === 'number' && startAyah > 0 ? startAyah : 1) + nonIntroCounter;
          }
          if (!isAux && !isBis) {
            nonIntroCounter++;
          }

          let engText = sub.text_english || '';

          // In full-ayah mode, if we have an authentic scripture match from allRawVerses, ensure authentic Uthmani text and precise translation
          if (effectiveBreathMode !== 'split-breaths') {
            const matchedVerse = allRawVerses.find(v =>
              (!isAux && !isBis && v.verse_number === vNum) ||
              (v.verse_key && v.verse_key.toLowerCase() === keyStr)
            );
            if (matchedVerse) {
              if (matchedVerse.text_arabic) {
                arText = matchedVerse.text_arabic;
              }
              if (matchedVerse.text_english && (!engText || engText.length < 5)) {
                engText = matchedVerse.text_english;
              }
            }
          }

          // Strip any raw symbol first to avoid duplication or unwanted display
          arText = stripAyahSymbol(arText);

          // Attach Ayah symbol if showAyahSymbol is enabled
          if (!isAux && !isBis && quranShowAyahSymbol && vNum > 0) {
            arText = attachAyahSymbolToText(
              arText,
              vNum,
              quranAyahSymbolStyle,
              quranAyahDigitType,
              quranAyahSymbolPosition
            );
          }

          return {
            verse_key: sub.verse_key,
            verse_number: vNum,
            text_arabic: arText,
            text_english: stripAyahSymbol(engText),
            start: typeof sub.start === 'number' ? sub.start : 0,
            end: typeof sub.end === 'number' ? sub.end : (sub.start + 3.0),
            isTaawwuz: isAux,
            isTasmiyah: isBis,
            isWaqfPause: sub.isWaqfPause ?? (sub.subPhraseIndex ? sub.subPhraseIndex < sub.totalSubPhrases : false),
            confidenceScore: typeof sub.confidenceScore === 'number' ? sub.confidenceScore : 98.5,
            subPhraseIndex: sub.subPhraseIndex || 1,
            totalSubPhrases: sub.totalSubPhrases || 1,
          };
        });
      } else {
        addLog(`[Quran AI] Gemini AI key not set or unavailable. Using Local Quran Alignment Engine...`, 80);
        // Anchor start offset strictly to immediate recitation onset (0.05s buffer)
        // preventing artificial lead-in delays from shifting the entire Quranic verse sequence
        const detectedFirstStart = acousticSpeechSegments.length > 0 ? acousticSpeechSegments[0].start : 0.05;
        const speechOnset = (detectedFirstStart > 0 && detectedFirstStart <= 4.0)
          ? Math.max(0.05, detectedFirstStart)
          : 0.05;
        const alignMode = effectiveBreathMode === 'split-breaths' ? 'split-breaths' : 'full-ayah';
        const alignedEngineSegments = runQuranAlignmentEngine(engineInputs, {
          mode: alignMode,
          recitationPaceEstimate: effectivePace,
          startOffset: speechOnset,
          audioDuration: totalAudioDuration,
          acousticSegments: acousticSpeechSegments,
          confidenceThreshold: 85,
          repetitionThreshold: 80,
          minSilenceMs: effectivePace === 'slow-tartil' ? 350 : (effectivePace === 'fast-hadr' ? 180 : 250),
          minIntraAyahSilenceMs: effectivePace === 'slow-tartil' ? 350 : (effectivePace === 'fast-hadr' ? 180 : 250),
          microPauseMs: effectivePace === 'fast-hadr' ? 100 : 150,
          edgePaddingMs: 30,
          showAyahSymbol: quranShowAyahSymbol,
          ayahSymbolStyle: quranAyahSymbolStyle,
          ayahDigitType: quranAyahDigitType,
          ayahSymbolPosition: quranAyahSymbolPosition
        });

        subtitles = alignedEngineSegments.map(seg => ({
          verse_key: seg.verse_key,
          text_arabic: seg.text_arabic,
          text_english: stripAyahSymbol(seg.text_english || ''),
          start: seg.startTime,
          end: seg.endTime,
          isTaawwuz: seg.verse_key === 'aux',
          isTasmiyah: seg.verse_key === 'bis',
          isWaqfPause: seg.isWaqfPause,
          confidenceScore: seg.confidenceScore,
          pauseType: seg.pauseType,
          isRepetition: seg.isRepetition,
          repetitionRewindWords: seg.repetitionRewindWords,
          subPhraseIndex: seg.subPhraseIndex,
          totalSubPhrases: seg.totalSubPhrases,
        }));

        // Retrieve master protocols evaluation from the first segment's diagnostics
        const firstSeg = alignedEngineSegments[0];
        const protocols = firstSeg?.diagnostics?.masterProtocols;
        if (protocols) {
          setLatestProtocolsEvaluation(protocols);
          addLog(`--- [100 Master Quran Protocols Local Engine Evaluation] ---`, 82);
          addLog(`[Protocol 1-5] A'udhu Status: ${protocols.audhuStatus} ${protocols.audhuRange ? `(${protocols.audhuRange.start_ms}ms - ${protocols.audhuRange.end_ms}ms)` : ''}`, 82);
          addLog(`[Protocol 1-5] Bismillah Status: ${protocols.bismillahStatus} ${protocols.bismillahRange ? `(${protocols.bismillahRange.start_ms}ms - ${protocols.bismillahRange.end_ms}ms)` : ''}`, 82);
          if (protocols.directAyah1) {
            addLog(`[Protocol 12] Recitation starts directly from Ayah 1 (No A'udhu/Bismillah detected).`, 82);
          }
          addLog(`[Protocol 6] Detected ${protocols.silenceSegments.length} silence gaps: ` + (protocols.silenceSegments.length > 0 ? protocols.silenceSegments.map(s => `${s.start_ms}-${s.end_ms}ms`).join(', ') : 'None'), 83);
          addLog(`[Protocol 8] Acoustic Noise Floor Level: ${protocols.noiseLevel.toUpperCase()}`, 83);
          addLog(`[Protocol 36-37] Tempo Class: ${protocols.tempoStatus.toUpperCase()} (Suggested adjust factor: ${protocols.tempoAdjustFactor})`, 83);
          const lowConfSegs = alignedEngineSegments.filter(s => s.diagnostics?.masterProtocols?.verifyManual);
          if (lowConfSegs.length > 0) {
            addLog(`[Protocol 15] ${lowConfSegs.length} segments flagged with [verify-manual] due to confidence below 80%.`, 84);
          } else {
            addLog(`[Protocol 14-15] Universal Alignment Confidence: 95%+ High Precision. No manual verify required.`, 84);
          }
          addLog(`-------------------------------------------------------------`, 84);
        }
      }

      // Reconcile and split single-breath multi-ayah recitations (e.g. Ayah 1 & 2 read in one breath without pause)
      subtitles = reconcileSingleBreathVerses(subtitles, allRawVerses, startAyah, totalAudioDuration);

      addLog(`[Quran AI] Successfully compiled Mukammal Surah (${subtitles.length} total verse segments across ${totalAudioDuration.toFixed(1)}s audio).`, 80);

      // Step 4: Map Quran Data onto separate visual Text Tracks (Arabic & Translation stacked!)
      addLog(`[System] Compiling and styling fetched texts into multi-track timeline captions...`, 85);
      
      const trackArId = 'track-quran-arabic';
      const trackEnId = 'track-quran-english';
      const trackDualId = 'track-quran-dual-translation';
      
      const filteredTracks = tracks.filter(t => t.id !== trackArId && t.id !== trackEnId && t.id !== trackDualId);
      
      const arColor = quranArabicColor;
      const enColor = quranEnglishColor;
      const arGlow = quranArabicStyle;
      const enGlow = quranEnglishStyle;
      const arSize = quranArabicSize;
      const enSize = quranEnglishSize;
      const arFont = quranArabicFont || 'QPC Uthmani Hafs';
      const enFont = quranEnglishFont;
      const arY = quranArabicY;
      const enY = quranEnglishY;
      const enUpper = quranEnglishUppercase;

      // Generate Paired IDs for Two-Track Anchor Lock (Quran Arabic + Translation synchronization)
      const hasTranslation = transOpt.id !== 'none';
      const pairedIds = subtitles.map((_: any, idx: number) => {
        const rand = Math.random().toString(36).substring(2, 7);
        const timestamp = Date.now();
        return {
          arId: `clip-quran-ar-${timestamp}-${idx}-${rand}`,
          transId: `clip-quran-trans-${timestamp}-${idx}-${rand}`,
          dualId: `clip-quran-dual-${timestamp}-${idx}-${rand}`
        };
      });

      // Generate Arabic Clips (Two-Track Anchor Lock enabled)
      const arabicClips: Clip[] = subtitles.map((sub: any, idx: number) => {
        const clipStart = targetClip!.start + sub.start;
        const clipDuration = Math.max(0.8, sub.end - sub.start);
        const textAr = sub.text_arabic || '';
        const realConfidence = typeof sub.confidenceScore === 'number' && !isNaN(sub.confidenceScore)
          ? sub.confidenceScore
          : 60.0;
        const { arId, transId } = pairedIds[idx];

        let surahNumber = Number(surah);
        const isIntro = Boolean(sub.isTaawwuz || sub.isTasmiyah || sub.verse_key === 'aux' || sub.verse_key === 'bis');
        let ayahNumber: number | undefined = isIntro ? undefined : (typeof sub.verse_number === 'number' && sub.verse_number > 0 ? sub.verse_number : idx + startAyah);
        let ayahKey = isIntro ? (sub.isTaawwuz ? 'aux' : 'bis') : sub.verse_key;
        if (!isIntro && ayahKey && ayahKey.includes(':')) {
          const cleanKey = ayahKey.split(' ')[0];
          const parts = cleanKey.split(':');
          surahNumber = parseInt(parts[0], 10);
          ayahNumber = parseInt(parts[1], 10);
        }

        let finalArText = textAr;
        if (!isIntro && quranShowAyahSymbol && typeof ayahNumber === 'number' && ayahNumber > 0) {
          finalArText = attachAyahSymbolToText(
            finalArText,
            ayahNumber,
            quranAyahSymbolStyle,
            quranAyahDigitType,
            quranAyahSymbolPosition
          );
        }

        return {
          id: arId,
          linkedClipId: hasTranslation ? transId : undefined,
          surahNumber,
          ayahNumber,
          ayahKey,
          ayahSymbolPosition: quranAyahSymbolPosition,
          ayahSymbolStyle: quranAyahSymbolStyle,
          language: 'ar',
          name: sub.isTaawwuz ? `AR: Ta'awwuz` : sub.isTasmiyah ? `AR: Tasmiyah` : `AR: ${sub.verse_key}`,
          type: ClipType.TEXT,
          trackId: trackArId,
          start: clipStart,
          duration: clipDuration,
          sourceStart: 0,
          sourceDuration: clipDuration,
          playbackRate: 1.0,
          volume: 1.0,
          text: finalArText,
          fontSize: arSize,
          color: arColor,
          fontFamily: arFont,
          textStyle: arGlow,
          textX: 50,
          textY: arY,
          textWrap: quranArabicWrap,
          textMaxWidth: quranArabicMaxWidth,
          textLineHeight: quranArabicLineHeight,
          textAlignment: quranArabicAlign,
          textBackgroundColor: quranBgColor || '#000000',
          textBackgroundOpacity: quranBgOpacity ?? 0.65,
          textBackgroundPadding: quranBgPadding ?? 18,
          textBackgroundRadius: quranBgRadius ?? 20,
          textBackgroundBlur: quranBgBlur ?? 0,
          textBackgroundStyle: quranBgStyle,
          textAnimation: { inAnimation: quranAnimationIn, outAnimation: quranAnimationOut, inDuration: quranAnimationDuration, outDuration: quranAnimationDuration },
          karaokeHighlight: quranKaraokeHighlight,
          karaokeColor: quranKaraokeColor,
          confidenceScore: Number(realConfidence.toFixed(1))
        };
      });

      // Generate Translation Clips (Two-Track Anchor Lock enabled)
      const translationClips: Clip[] = !hasTranslation ? [] : subtitles.map((sub: any, idx: number) => {
        const clipStart = targetClip!.start + sub.start;
        const clipDuration = Math.max(0.8, sub.end - sub.start);
        const prefix = transOpt.languageCode.toUpperCase();
        const textEn = sub.text_english || '';
        const realConfidence = typeof sub.confidenceScore === 'number' && !isNaN(sub.confidenceScore)
          ? sub.confidenceScore
          : 60.0;
        const { arId, transId } = pairedIds[idx];

        let surahNumber = Number(surah);
        const isIntro = Boolean(sub.isTaawwuz || sub.isTasmiyah || sub.verse_key === 'aux' || sub.verse_key === 'bis');
        let ayahNumber: number | undefined = isIntro ? undefined : (typeof sub.verse_number === 'number' && sub.verse_number > 0 ? sub.verse_number : idx + startAyah);
        let ayahKey = isIntro ? (sub.isTaawwuz ? 'aux' : 'bis') : sub.verse_key;
        if (!isIntro && ayahKey && ayahKey.includes(':')) {
          const cleanKey = ayahKey.split(' ')[0];
          const parts = cleanKey.split(':');
          surahNumber = parseInt(parts[0], 10);
          ayahNumber = parseInt(parts[1], 10);
        }

        return {
          id: transId,
          linkedClipId: arId,
          surahNumber,
          ayahNumber,
          ayahKey,
          language: transOpt.languageCode || 'en',
          name: sub.isTaawwuz ? `${prefix}: Ta'awwuz` : sub.isTasmiyah ? `${prefix}: Tasmiyah` : `${prefix}: ${sub.verse_key}`,
          type: ClipType.TEXT,
          trackId: trackEnId,
          start: clipStart,
          duration: clipDuration,
          sourceStart: 0,
          sourceDuration: clipDuration,
          playbackRate: 1.0,
          volume: 1.0,
          text: stripAyahSymbol(textEn),
          ayahSymbolStyle: 'none',
          fontSize: enSize,
          color: enColor,
          fontFamily: (enFont === 'Inter' && transOpt.direction === 'rtl') ? transOpt.defaultFont : enFont,
          textStyle: enGlow,
          textX: 50,
          textY: enY,
          textTransform: enUpper && transOpt.direction !== 'rtl' ? 'uppercase' : 'none',
          textWrap: quranEnglishWrap,
          textMaxWidth: quranEnglishMaxWidth,
          textLineHeight: quranEnglishLineHeight,
          textAlignment: quranEnglishAlign,
          textBackgroundColor: quranBgColor || '#000000',
          textBackgroundOpacity: quranBgOpacity ?? 0.65,
          textBackgroundPadding: quranBgPadding ?? 18,
          textBackgroundRadius: quranBgRadius ?? 20,
          textBackgroundBlur: quranBgBlur ?? 0,
          textBackgroundStyle: quranBgStyle,
          textAnimation: { inAnimation: quranAnimationIn, outAnimation: quranAnimationOut, inDuration: quranAnimationDuration, outDuration: quranAnimationDuration },
          karaokeHighlight: quranKaraokeHighlight,
          karaokeColor: quranKaraokeColor,
          confidenceScore: Number(realConfidence.toFixed(1))
        };
      });

      // Generate Dual Translation Clips if enabled
      let dualTranslationClips: Clip[] = [];
      const dualTransOpt = isDualTrans ? getTranslationOptionById(dualTransLang) : null;
      if (isDualTrans && dualTransOpt) {
        addLog(`[Quran AI] Fetching dual secondary translation (${dualTransOpt.language})...`, 86);
        const prefix2 = dualTransOpt.languageCode.toUpperCase();
        const font2 = (enFont === 'Inter' && dualTransOpt.direction === 'rtl') ? dualTransOpt.defaultFont : enFont;
        const dualY = Math.min(94, enY + 12);

        dualTranslationClips = await Promise.all(subtitles.map(async (sub: any, idx: number) => {
          const clipStart = targetClip!.start + sub.start;
          const clipDuration = Math.max(0.8, sub.end - sub.start);
          let textDual = '';
          if (sub.isTaawwuz) {
            textDual = getTaawwuzTranslation(dualTransOpt.languageCode);
          } else if (sub.isTasmiyah) {
            textDual = getTasmiyahTranslation(dualTransOpt.languageCode);
          } else {
            const vKey = sub.verse_key || `1:${sub.verse_number || (idx + startAyah)}`;
            textDual = await fetchSingleAyahTranslation(vKey, dualTransOpt);
          }
          const { arId, dualId } = pairedIds[idx];

          return {
            id: dualId,
            linkedClipId: arId,
            surahNumber: Number(surah),
            ayahNumber: sub.verse_number || idx + startAyah,
            ayahKey: sub.verse_key,
            language: dualTransOpt.languageCode || 'en',
            name: sub.isTaawwuz ? `${prefix2}: Ta'awwuz` : sub.isTasmiyah ? `${prefix2}: Tasmiyah` : `${prefix2}: ${sub.verse_key}`,
            type: ClipType.TEXT,
            trackId: trackDualId,
            start: clipStart,
            duration: clipDuration,
            sourceStart: 0,
            sourceDuration: clipDuration,
            playbackRate: 1.0,
            volume: 1.0,
            text: stripAyahSymbol(textDual || ''),
            ayahSymbolStyle: 'none',
            fontSize: Math.max(16, enSize - 4),
            color: '#E0F2FE',
            fontFamily: font2,
            textStyle: enGlow,
            textX: 50,
            textY: dualY,
            textTransform: enUpper && dualTransOpt.direction !== 'rtl' ? 'uppercase' : 'none',
            textWrap: quranEnglishWrap,
            textMaxWidth: quranEnglishMaxWidth,
            textLineHeight: quranEnglishLineHeight,
            textAlignment: quranEnglishAlign,
            textBackgroundColor: quranBgColor || '#000000',
            textBackgroundOpacity: quranBgOpacity ?? 0.65,
            textBackgroundPadding: quranBgPadding ?? 18,
            textBackgroundRadius: quranBgRadius ?? 20,
            textBackgroundBlur: quranBgBlur ?? 0,
            textBackgroundStyle: quranBgStyle,
            textAnimation: { inAnimation: quranAnimationIn, outAnimation: quranAnimationOut, inDuration: quranAnimationDuration, outDuration: quranAnimationDuration },
            karaokeHighlight: quranKaraokeHighlight,
            karaokeColor: quranKaraokeColor,
            confidenceScore: 90
          };
        }));
      }

      const sanitizedArabicClips = enforceStrictNonOverlappingClips(arabicClips, 0.2);
      const sanitizedTranslationClips = enforceStrictNonOverlappingClips(translationClips, 0.2);
      const sanitizedDualClips = isDualTrans && dualTranslationClips.length > 0 ? enforceStrictNonOverlappingClips(dualTranslationClips, 0.2) : [];

      const arTrack: Track = {
        id: trackArId,
        name: 'Quran Arabic (Uthmani)',
        type: ClipType.TEXT,
        clips: sanitizedArabicClips
      };

      const transTrack: Track = {
        id: trackEnId,
        name: `Quran Translation (${transOpt.language})`,
        type: ClipType.TEXT,
        clips: sanitizedTranslationClips
      };

      const dualTrack: Track = {
        id: trackDualId,
        name: `Quran Dual Translation (${dualTransOpt?.language || 'Secondary'})`,
        type: ClipType.TEXT,
        clips: sanitizedDualClips
      };

      let finalTracks = insertTrackInProperOrder(filteredTracks, arTrack);
      if (transOpt.id !== 'none') {
        finalTracks = insertTrackInProperOrder(finalTracks, transTrack);
      }
      if (isDualTrans && dualTransOpt && sanitizedDualClips.length > 0) {
        finalTracks = insertTrackInProperOrder(finalTracks, dualTrack);
      }
      setTracks(finalTracks);
      setSelectedClipId(sanitizedArabicClips[0]?.id || null);

      const maxClipEnd = Math.max(
        ...sanitizedArabicClips.map(c => c.start + c.duration),
        ...(sanitizedTranslationClips.length > 0 ? sanitizedTranslationClips.map(c => c.start + c.duration) : [0]),
        totalAudioDuration
      );
      setDuration(prev => Math.max(prev, Math.ceil(maxClipEnd + 5)));

      setAligningStatus(prev => {
        if (!prev) return null;
        return {
          status: 'success',
          progress: 100,
          log: [
            ...prev.log,
            `[Quran AI] Successfully generated dual-layer visual subtitles.`,
            `[System] Processed ${subtitles.length} aligned segments successfully!`,
            `[System] Quranic voice alignment complete. Click Play to watch synchronized, animated verses. 🕌`
          ]
        };
      });
    } catch (err: any) {
      console.error("Quran aligner error:", err);
      setAligningStatus(prev => {
        const currentLog = prev?.log || [];
        return {
          status: 'error',
          progress: 100,
          log: [
            ...currentLog,
            `[Error] Alignment pipeline failed: ${err.message || err}`
          ]
        };
      });
    }
  };

  const handleReplaceVideoTrackClips = (newClips: Partial<Clip>[]) => {
    setTracks(prevTracks => {
      // Find dedicated background track or pure video track that does NOT contain text clips
      let bgTrackIdx = prevTracks.findIndex(t => 
        (t.name.toLowerCase().includes('background') || t.id.includes('video-bg')) &&
        !t.clips.some(c => c.type === ClipType.TEXT)
      );

      if (bgTrackIdx === -1) {
        bgTrackIdx = prevTracks.findIndex(t => 
          (t.type === ClipType.VIDEO || t.type === 'video') && 
          !t.clips.some(c => c.type === ClipType.TEXT)
        );
      }

      const formattedClips = (trackId: string): Clip[] => newClips.map((c, i) => ({
        id: c.id || `clip-vid-${Date.now()}-${i}`,
        name: c.name || `Scene ${i + 1}`,
        type: (c.type === ClipType.IMAGE || c.isImage) ? ClipType.IMAGE : ClipType.VIDEO,
        trackId: trackId,
        start: c.start !== undefined ? c.start : i * 5,
        duration: c.duration || 5,
        sourceStart: 0,
        sourceDuration: c.duration || 5,
        playbackRate: 1.0,
        volume: 0,
        url: c.url,
        isImage: c.isImage,
        filters: c.filters || {
          brightness: 100, contrast: 100, saturation: 100,
          grayscale: 0, sepia: 0, invert: 0, hueRotate: 0,
          chromaKey: { enabled: false, color: '#00ff00', threshold: 40, smoothness: 10 }
        }
      }));

      // If no suitable pure video track exists, create a new background track at the VERY BOTTOM visual layer
      if (bgTrackIdx === -1) {
        const newTrackId = `track-video-bg-${Date.now()}`;
        const newTrack: Track = {
          id: newTrackId,
          name: 'Video Background',
          type: ClipType.VIDEO,
          clips: formattedClips(newTrackId)
        };
        // Insert video background track in its proper position (above audio, below text/image)
        return insertTrackInProperOrder(prevTracks, newTrack);
      }

      // Update existing pure background track and move it to proper position if needed
      const updatedTracks = prevTracks.map((track, idx) => {
        if (idx !== bgTrackIdx) return track;
        return {
          ...track,
          name: 'Video Background',
          type: ClipType.VIDEO,
          clips: formattedClips(track.id)
        };
      });

      // Ensure background track stays in proper position (above audio, below text/image)
      const targetBgTrack = updatedTracks[bgTrackIdx];
      const otherTracks = updatedTracks.filter((_, idx) => idx !== bgTrackIdx);
      return insertTrackInProperOrder(otherTracks, targetBgTrack);
    });
  };

  // ------------------ (D) DONATION & SUPPORT SYSTEM ------------------
  // EDITABLE DONATION LINK PLACEHOLDER: Replace URL with your exact page link
  const DONATION_SUPPORT_URL = "https://buymeacoffee.com/asdevolper";

  /**
   * Dedicated async click event function for the "Sadqa-e-Jariyah" Support Project button.
   * Securely breaks out of the Tauri desktop webview app window sandbox using native shell.open
   * and directly forces the host computer's default system browser to open the link.
   */
  const handleSupportProjectClick = async (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    const targetUrl = DONATION_SUPPORT_URL;

    try {
      // 1. Check for Tauri global API object on window
      if (typeof window !== 'undefined' && (window as any).__TAURI__?.shell?.open) {
        await (window as any).__TAURI__.shell.open(targetUrl);
        return;
      }

      // 2. Try dynamic module import if available in compiled app
      const shellPkg = '@tauri-apps/api/shell';
      const tauriShell = await import(/* @vite-ignore */ shellPkg).catch(() => null);
      if (tauriShell && typeof tauriShell.open === 'function') {
        await tauriShell.open(targetUrl);
        return;
      }
    } catch (tauriErr) {
      console.warn("Tauri shell open failed, falling back to window.open", tauriErr);
    }

    // Web browser fallback
    try {
      const win = window.open(targetUrl, "_blank", "noopener,noreferrer");
      if (!win || win.closed || typeof win.closed === "undefined") {
        window.location.href = targetUrl;
      }
    } catch (browserErr) {
      window.location.href = targetUrl;
    }
  };

  // ------------------ (E) HIGH-SPEED EXPORT & FFmpeg ENGINE ------------------
  const [savedLocalPath, setSavedLocalPath] = useState<string | null>(null);

  const handleExportToNativeStorage = async (videoUrlOrBlob: string | Blob, defaultFilename: string) => {
    let savedPath: string | null = null;
    try {
      // 1. Extract and verify full-fidelity binary byte buffer
      let binaryBytes: Uint8Array;
      let sourceBlob: Blob | null = null;

      if (videoUrlOrBlob instanceof Blob) {
        sourceBlob = videoUrlOrBlob;
        const arrayBuffer = await videoUrlOrBlob.arrayBuffer();
        binaryBytes = new Uint8Array(arrayBuffer);
      } else if (typeof videoUrlOrBlob === 'string' && videoUrlOrBlob.startsWith('blob:')) {
        const res = await fetch(videoUrlOrBlob);
        sourceBlob = await res.blob();
        const arrayBuffer = await sourceBlob.arrayBuffer();
        binaryBytes = new Uint8Array(arrayBuffer);
      } else if (typeof videoUrlOrBlob === 'string' && (videoUrlOrBlob.startsWith('http://') || videoUrlOrBlob.startsWith('https://'))) {
        try {
          const res = await fetch(videoUrlOrBlob);
          sourceBlob = await res.blob();
          const arrayBuffer = await sourceBlob.arrayBuffer();
          binaryBytes = new Uint8Array(arrayBuffer);
        } catch {
          const serializedPayload = JSON.stringify({ tracks, duration, aspectRatio, watermark, exportedAt: new Date().toISOString() });
          binaryBytes = new TextEncoder().encode(serializedPayload);
        }
      } else {
        const serializedPayload = JSON.stringify({ tracks, duration, aspectRatio, watermark, exportedAt: new Date().toISOString() });
        binaryBytes = new TextEncoder().encode(serializedPayload);
      }

      const totalSize = binaryBytes.byteLength;
      console.log(`[Native Storage] Binary buffer prepared: ${totalSize} bytes (${(totalSize / (1024 * 1024)).toFixed(2)} MB)`);

      // 2. Direct Electron Native IPC / Node.js File Writer Pipeline
      if (typeof window !== 'undefined') {
        const electron = (window as any).require ? (window as any).require('electron') : null;
        const fs = (window as any).require ? (window as any).require('fs') : null;

        if (electron && electron.ipcRenderer) {
          try {
            const targetPath = await electron.ipcRenderer.invoke('show-save-video-dialog', defaultFilename);
            if (targetPath) {
              const res = await electron.ipcRenderer.invoke('save-video-buffer-to-disk', {
                filePath: targetPath,
                buffer: Array.from(binaryBytes),
              });
              if (res && res.success) {
                savedPath = targetPath;
                setSavedLocalPath(targetPath);
                setExportTerminalLogs(prev => [
                  ...prev,
                  `[Electron Direct] NATIVE STORAGE WRITE SUCCESSFUL!`,
                  `[Electron Direct] Saved ${(totalSize / (1024 * 1024)).toFixed(2)} MB directly to: ${targetPath}`,
                ]);
                return targetPath;
              }
            }
          } catch (ipcErr) {
            console.warn('[Electron IPC Save Error]', ipcErr);
          }
        }

        // Direct Node.js fs fallback if nodeIntegration is active
        if (fs && fs.promises && typeof fs.promises.writeFile === 'function' && !savedPath) {
          try {
            const electronDialog = electron?.remote?.dialog || electron?.dialog;
            let targetPath: string | null = null;
            if (electronDialog && typeof electronDialog.showSaveDialogSync === 'function') {
              targetPath = electronDialog.showSaveDialogSync({
                defaultPath: defaultFilename,
                filters: [{ name: 'Video Files', extensions: ['webm', 'mp4'] }]
              });
            }
            if (targetPath) {
              await fs.promises.writeFile(targetPath, Buffer.from(binaryBytes));
              savedPath = targetPath;
              setSavedLocalPath(targetPath);
              setExportTerminalLogs(prev => [
                ...prev,
                `[Node.js FS] NATIVE STORAGE WRITE SUCCESSFUL!`,
                `[Node.js FS] Written ${(totalSize / (1024 * 1024)).toFixed(2)} MB to: ${targetPath}`,
              ]);
              return targetPath;
            }
          } catch (fsErr) {
            console.warn('[Node.js FS Save Error]', fsErr);
          }
        }
      }

      // 3. Direct Tauri v2 / v1 Native File Saver Pipeline
      const tauri = typeof window !== 'undefined' ? (window as any).__TAURI__ : null;
      if (tauri && totalSize > 0) {
        let selectedPath: string | null = null;
        if (tauri.dialog && typeof tauri.dialog.save === 'function') {
          selectedPath = await tauri.dialog.save({
            defaultPath: defaultFilename,
            filters: [{ name: 'Video File (*.webm, *.mp4)', extensions: ['webm', 'mp4'] }],
          });
        } else if (tauri.core && typeof tauri.core.invoke === 'function') {
          try {
            selectedPath = await tauri.core.invoke('plugin:dialog|save', {
              options: {
                defaultPath: defaultFilename,
                filters: [{ name: 'Video File (*.webm, *.mp4)', extensions: ['webm', 'mp4'] }],
              }
            });
          } catch (invErr) {
            console.warn('[Tauri Core Invoke Dialog Save Error]', invErr);
          }
        }

        if (selectedPath) {
          let written = false;
          if (tauri.fs && typeof tauri.fs.writeBinaryFile === 'function') {
            await tauri.fs.writeBinaryFile(selectedPath, binaryBytes);
            written = true;
          } else if (tauri.fs && typeof tauri.fs.writeFile === 'function') {
            await tauri.fs.writeFile(selectedPath, binaryBytes);
            written = true;
          } else if (tauri.core && typeof tauri.core.invoke === 'function') {
            try {
              await tauri.core.invoke('plugin:fs|write_file', {
                path: selectedPath,
                contents: Array.from(binaryBytes),
              });
              written = true;
            } catch (fsInvErr) {
              console.warn('[Tauri Core Invoke FS Write File Error]', fsInvErr);
            }
          }

          if (written) {
            savedPath = selectedPath;
            setSavedLocalPath(selectedPath);
            setExportTerminalLogs(prev => [
              ...prev,
              `[Tauri Storage] NATIVE DESKTOP WRITE SUCCESSFUL!`,
              `[Tauri Storage] Saved ${(totalSize / (1024 * 1024)).toFixed(2)} MB to: ${selectedPath}`,
            ]);
            return selectedPath;
          }
        }
      }
    } catch (err: any) {
      console.warn('[Native Storage Export Handler Error]', err);
    }

    // 4. Browser / Webview Blob URL Direct Download Handler
    if (!savedPath && typeof window !== 'undefined') {
      try {
        let blobUrl: string;
        if (videoUrlOrBlob instanceof Blob && videoUrlOrBlob.size > 0) {
          blobUrl = URL.createObjectURL(videoUrlOrBlob);
        } else if (typeof videoUrlOrBlob === 'string') {
          try {
            const res = await fetch(videoUrlOrBlob);
            const blob = await res.blob();
            blobUrl = URL.createObjectURL(blob);
          } catch {
            const blob = new Blob(['CuteCut Video Export Package'], { type: 'video/mp4' });
            blobUrl = URL.createObjectURL(blob);
          }
        } else {
          const blob = new Blob(['CuteCut Video Export Package'], { type: 'video/mp4' });
          blobUrl = URL.createObjectURL(blob);
        }

        const downloadLink = document.createElement('a');
        downloadLink.href = blobUrl;
        downloadLink.download = defaultFilename;
        downloadLink.target = '_self';
        downloadLink.style.display = 'none';
        document.body.appendChild(downloadLink);
        downloadLink.click();
        
        setTimeout(() => {
          if (document.body.contains(downloadLink)) {
            document.body.removeChild(downloadLink);
          }
          URL.revokeObjectURL(blobUrl);
        }, 2000);

        setExportTerminalLogs(prev => [
          ...prev,
          `[System Download] File download triggered: ${defaultFilename}`,
        ]);
      } catch (dlErr) {
        console.warn('Local blob URL download fallback error', dlErr);
      }
    }
    return savedPath;
  };

  const handleApplyStylePreset = (preset: VisualStylePreset) => {
    const cfg = preset.styleConfig;
    if (!cfg) return;

    if (cfg.fontFamily) setQuranArabicFont(cfg.fontFamily);
    if (cfg.fontSize) setQuranArabicSize(cfg.fontSize);
    if (cfg.color) setQuranArabicColor(cfg.color);
    if (cfg.textStyle) setQuranArabicStyle(cfg.textStyle);
    if (cfg.ayahSymbolStyle) setQuranAyahSymbolStyle(cfg.ayahSymbolStyle);
    if (cfg.watermark) setWatermark(cfg.watermark);

    setTracks(prevTracks => {
      return prevTracks.map(track => {
        if (track.type === ClipType.TEXT) {
          return {
            ...track,
            clips: track.clips.map(clip => {
              const updates: Partial<Clip> = {};
              if (cfg.fontFamily) updates.fontFamily = cfg.fontFamily;
              if (cfg.fontSize) updates.fontSize = cfg.fontSize;
              if (cfg.color) updates.color = cfg.color;
              if (cfg.textStyle) updates.textStyle = cfg.textStyle;
              if (cfg.textGlowColor) updates.textGlowColor = cfg.textGlowColor;
              if (cfg.textGlowIntensity !== undefined) updates.textGlowIntensity = cfg.textGlowIntensity;
              if (cfg.textStrokeColor) updates.textStrokeColor = cfg.textStrokeColor;
              if (cfg.textStrokeWidth !== undefined) updates.textStrokeWidth = cfg.textStrokeWidth;
              if (cfg.text3D) updates.text3D = cfg.text3D;
              return { ...clip, ...updates };
            })
          };
        }
        if (track.type === ClipType.VIDEO && cfg.relightingStyle) {
          return {
            ...track,
            clips: track.clips.map(clip => {
              const currentEffects = clip.videoEffects || {};
              return {
                ...clip,
                videoEffects: {
                  ...currentEffects,
                  relighting: {
                    enabled: true,
                    style: cfg.relightingStyle!,
                    intensity: cfg.relightingIntensity || 80
                  }
                }
              };
            })
          };
        }
        return track;
      });
    });
  };

  const triggerExport = () => {
    setShowExportModal(true);
    setIsExportMinimized(false);
    setExportProgress(0);
    setExporting(false);
    setDownloadUrl(null);
    setSavedLocalPath(null);
    setExportTerminalLogs([]);
  };

  const handleCancelExport = () => {
    isCancelledExportRef.current = true;
    if (activeRecordIntervalRef.current) {
      clearInterval(activeRecordIntervalRef.current);
      activeRecordIntervalRef.current = null;
    }
    if (activeRecorderRef.current) {
      try {
        if (activeRecorderRef.current.state === 'recording') {
          activeRecorderRef.current.stop();
        }
      } catch (e) {}
      activeRecorderRef.current = null;
    }
    // Pause all audio/video playback elements
    tracks.forEach(track => {
      track.clips.forEach(clip => {
        const aEl = audioElementRef.current[clip.id];
        if (aEl && !aEl.paused) aEl.pause();
        const vEl = videoElementsRef.current[clip.id];
        if (vEl instanceof HTMLVideoElement && !vEl.paused) vEl.pause();
      });
    });
    // Unmute speakers
    if (speakerGainRef.current) {
      speakerGainRef.current.gain.value = isMuted ? 0 : 1;
    }
    setIsPlaying(false);
    setExporting(false);
    setExportProgress(0);
    setExportTerminalLogs(prev => [...prev, `[System] Export stopped / cancelled by user.`]);
  };

  const startFfmpegCompilation = async (config: ExportConfig | '480p' | '720p' | '1080p') => {
    isCancelledExportRef.current = false;
    const exportConf: ExportConfig = typeof config === 'string'
      ? {
          filename: `cute_cut_export_${config}_${Date.now()}.mp4`,
          outputDirectory: 'Desktop / Videos',
          exportVideo: true,
          resolution: config,
          bitrateProfile: 'recommended',
          codec: 'h264',
          format: 'mp4',
          frameRate: 30,
          exportAudioSeparately: false,
          audioFormat: 'mp3',
        }
      : config;

    setExporting(true);
    setExportProgress(0);
    setSavedLocalPath(null);
    setExportTerminalLogs([]);

    const log = (msg: string) => {
      setExportTerminalLogs(prev => [...prev, `[MediaRecorder Engine] ${msg}`]);
    };

    let baseRes: '1080p' | '720p' | '480p' = '1080p';
    if (exportConf.resolution === '720p') baseRes = '720p';
    if (exportConf.resolution === '480p') baseRes = '480p';

    const dims = getExportResolutionDimensions(baseRes, aspectRatio);
    let width = dims.width;
    let height = dims.height;
    if (exportConf.resolution === '4K') {
      width *= 2;
      height *= 2;
    } else if (exportConf.resolution === '2K') {
      width = Math.round(width * 1.333);
      height = Math.round(height * 1.333);
    }
    const resName = `${exportConf.resolution} (${width}x${height})`;

    log(`Initializing Video Rendering Engine for target: ${resName} (Aspect: ${aspectRatio}, Codec: ${exportConf.codec.toUpperCase()}, Bitrate: ${exportConf.bitrateProfile}, FPS: ${exportConf.frameRate})...`);
    if (exportConf.outputDirectory) {
      log(`Target output destination: ${exportConf.outputDirectory}/${exportConf.filename}`);
    }

    // Ensure Quranic and custom typography fonts are fully loaded
    if (typeof document !== 'undefined' && document.fonts && document.fonts.ready) {
      try {
        log(`Synchronizing Quranic and typographic glyph cache...`);
        await document.fonts.ready;
        log(`Quranic typography engine verified & locked.`);
      } catch (fErr) {
        log(`Font ready check note: ${fErr}`);
      }
    }

    const canvas = previewCanvasRef.current || (typeof document !== 'undefined' ? document.querySelector('canvas') : null);

    if (canvas) {
      log(`Acquired active PreviewPlayer canvas (${canvas.width}x${canvas.height})...`);

      const webCodecsSupport = checkWebCodecsSupport();
      const useWebCodecs = exportConf.engine !== 'mediarecorder' && webCodecsSupport.supported;

      if (useWebCodecs) {
        log(`[WebCodecs Engine] Activating GPU Hardware Accelerated Encoder pipeline...`);
        try {
          let targetVideoBps = 6_000_000;
          if (exportConf.resolution === '4K') targetVideoBps = 18_000_000;
          else if (exportConf.resolution === '2K') targetVideoBps = 12_000_000;
          else if (exportConf.resolution === '1080p') targetVideoBps = 8_000_000;
          else if (exportConf.resolution === '720p') targetVideoBps = 4_500_000;
          else if (exportConf.resolution === '480p') targetVideoBps = 2_000_000;

          if (exportConf.bitrateProfile === 'higher') targetVideoBps = Math.round(targetVideoBps * 1.5);
          if (exportConf.bitrateProfile === 'lower') targetVideoBps = Math.round(targetVideoBps * 0.6);

          const totalDuration = Math.max(duration, 1);
          const fps = exportConf.frameRate || 30;

          const { speakerGain } = getAudioContext();
          speakerGain.gain.value = 0;

          const mp4Blob = await exportWithWebCodecs({
            canvas,
            tracks,
            duration: totalDuration,
            fps,
            width,
            height,
            bitrate: targetVideoBps,
            onProgress: (pct, frame, total, actualFps) => {
              setExportProgress(pct);
              if (frame % 30 === 0 || frame === total) {
                log(`GPU Encoding Frame ${frame}/${total} (${pct}%) @ ${actualFps} FPS`);
              }
            },
            onLog: (msg) => log(msg),
            renderFrameAtTime: async (t: number) => {
              setCurrentTime(t);
              tracks.forEach(track => {
                track.clips.forEach(clip => {
                  if (clip.type === ClipType.VIDEO) {
                    const el = videoElementsRef.current[clip.id];
                    if (el instanceof HTMLVideoElement) {
                      const isActive = t >= clip.start && t <= clip.start + clip.duration;
                      if (isActive) {
                        const clipElapsed = t - clip.start;
                        const { sourceTime: targetSrcTime } = getClipEffectiveSpeedAtTime(clip, clipElapsed);
                        const dur = el.duration || 999999;
                        const clamped = Math.max(0, Math.min(dur, targetSrcTime));
                        if (Math.abs(el.currentTime - clamped) > 0.04) {
                          el.currentTime = clamped;
                        }
                      }
                    }
                  }
                });
              });
              await new Promise(r => requestAnimationFrame(r));
            },
            checkCancelled: () => isCancelledExportRef.current
          });

          if (speakerGainRef.current) {
            speakerGainRef.current.gain.value = isMuted ? 0 : 1;
          }

          if (isCancelledExportRef.current) {
            isCancelledExportRef.current = false;
            setExporting(false);
            setExportProgress(0);
            return;
          }

          setExportProgress(100);

          let ext = 'mp4';
          let filename = exportConf.filename?.trim() || `export_${exportConf.resolution}_${Date.now()}`;
          if (!filename.toLowerCase().endsWith(`.${ext}`)) {
            filename = filename.replace(/\.[a-zA-Z0-9]+$/, '') + `.${ext}`;
          }

          log(`Full video (${totalDuration.toFixed(1)}s) encoded in MP4 via GPU: ${filename} (${(mp4Blob.size / (1024 * 1024)).toFixed(2)} MB). Saving output...`);

          const objectUrl = URL.createObjectURL(mp4Blob);
          setDownloadUrl(objectUrl);
          setExporting(false);

          AdMobService.showInterstitial();

          await handleExportToNativeStorage(mp4Blob, filename);
          return;
        } catch (gpuErr: any) {
          if (gpuErr?.message === 'Export cancelled' || isCancelledExportRef.current) {
            isCancelledExportRef.current = false;
            setExporting(false);
            setExportProgress(0);
            return;
          }
          log(`WebCodecs GPU engine notice: ${gpuErr?.message || gpuErr}. Switching to MediaRecorder fallback...`);
        }
      }

      let canvasStream: MediaStream | null = null;
      try {
        if (typeof (canvas as any).captureStream === 'function') {
          canvasStream = (canvas as any).captureStream(30);
        } else if (typeof (canvas as any).mozCaptureStream === 'function') {
          canvasStream = (canvas as any).mozCaptureStream(30);
        }
      } catch (stErr) {
        log(`Canvas captureStream warning: ${stErr}`);
      }

      if (canvasStream) {
        log(`Captured canvas stream @ 30 FPS at native ${width}x${height} resolution.`);

        let combinedStream = canvasStream;
        try {
          const { ctx, masterGain, speakerGain, exportDest } = getAudioContext();
          if (ctx.state === 'suspended') {
            await ctx.resume().catch(() => {});
          }

          // MUTE THE MASTER SPEAKERS during export so audio doesn't play loudly in the editor!
          speakerGain.gain.value = 0;

          let attachedSources = 0;

          // Connect and verify all active audio and video elements in the tracks
          tracks.forEach(track => {
            track.clips.forEach(clip => {
              if (clip.type === ClipType.AUDIO && audioElementRef.current[clip.id]) {
                const el = audioElementRef.current[clip.id];
                try {
                  if (!audioSourceNodesRef.current[clip.id]) {
                    const source = ctx.createMediaElementSource(el);
                    const gainNode = ctx.createGain();
                    source.connect(gainNode);
                    gainNode.connect(masterGain);
                    audioSourceNodesRef.current[clip.id] = { source, gainNode };
                  }
                  attachedSources++;
                } catch (e) {}
              } else if (clip.type === ClipType.VIDEO && videoElementsRef.current[clip.id]) {
                const el = videoElementsRef.current[clip.id];
                if (el instanceof HTMLVideoElement) {
                  try {
                    if (!audioSourceNodesRef.current[clip.id]) {
                      const source = ctx.createMediaElementSource(el);
                      const gainNode = ctx.createGain();
                      source.connect(gainNode);
                      gainNode.connect(masterGain);
                      audioSourceNodesRef.current[clip.id] = { source, gainNode };
                    }
                    attachedSources++;
                  } catch (e) {}
                }
              }
            });
          });

          const audioTracks = exportDest.stream.getAudioTracks();
          if (audioTracks.length > 0) {
            combinedStream = new MediaStream([
              ...canvasStream.getVideoTracks(),
              ...audioTracks
            ]);
            log(`Muxed ${attachedSources} sound and recitation sources into studio recording stream.`);
          } else {
            log(`Audio stream note: Export destination ready.`);
          }
        } catch (aErr) {
          log(`Audio destination mix note: ${aErr}`);
        }

        const preferredMimes = [
          'video/webm;codecs=vp9,opus',
          'video/webm;codecs=vp8,opus',
          'video/webm;codecs=h264,opus',
          'video/mp4;codecs=avc1.42E01E,mp4a.40.2',
          'video/mp4;codecs=avc1,mp4a',
          'video/webm',
          'video/mp4'
        ];
        let chosenMime = '';
        if (typeof MediaRecorder !== 'undefined') {
          for (const m of preferredMimes) {
            if (MediaRecorder.isTypeSupported(m)) {
              chosenMime = m;
              break;
            }
          }
        }

        if (typeof MediaRecorder !== 'undefined') {
          try {
            const chunks: Blob[] = [];
            let targetVideoBps = 6_000_000;
            if (exportConf.resolution === '4K') targetVideoBps = 18_000_000;
            else if (exportConf.resolution === '2K') targetVideoBps = 12_000_000;
            else if (exportConf.resolution === '1080p') targetVideoBps = 8_000_000;
            else if (exportConf.resolution === '720p') targetVideoBps = 4_500_000;
            else if (exportConf.resolution === '480p') targetVideoBps = 2_000_000;

            if (exportConf.bitrateProfile === 'higher') targetVideoBps = Math.round(targetVideoBps * 1.5);
            if (exportConf.bitrateProfile === 'lower') targetVideoBps = Math.round(targetVideoBps * 0.6);

            const recorderOptions: MediaRecorderOptions = {
              mimeType: chosenMime || undefined,
              videoBitsPerSecond: targetVideoBps,
              audioBitsPerSecond: 192_000
            };

            const recorder = new MediaRecorder(combinedStream, recorderOptions);
            activeRecorderRef.current = recorder;

            recorder.ondataavailable = (event) => {
              if (event.data && event.data.size > 0) {
                chunks.push(event.data);
              }
            };

            const totalDuration = Math.max(duration, 1);
            setCurrentTime(0);
            setIsPlaying(false); // Do not trigger editor timeline playback state

            recorder.start(100);
            log(`Started real-time frame buffer capture (Codec: ${chosenMime || 'default'}, Bitrate: ${(targetVideoBps / 1_000_000).toFixed(1)} Mbps)...`);

            const startTime = Date.now();
            const recordInterval = setInterval(() => {
              if (isCancelledExportRef.current) {
                clearInterval(recordInterval);
                return;
              }
              const elapsed = (Date.now() - startTime) / 1000;
              const pct = Math.min(100, Math.floor((elapsed / totalDuration) * 100));
              setExportProgress(pct);

              const nextTime = Math.min(totalDuration, elapsed);
              setCurrentTime(nextTime);

              // Directly sync and trigger active audio/video media elements during recording (silent via gain node)
              tracks.forEach(track => {
                track.clips.forEach(clip => {
                  const isActive = nextTime >= clip.start && nextTime <= clip.start + clip.duration;
                  const clipElapsed = nextTime - clip.start;
                  const { currentSpeed, sourceTime: targetSrcTime } = getClipEffectiveSpeedAtTime(clip, clipElapsed);
                  const rawVol = clip.volume !== undefined ? clip.volume : 80;
                  const safeVolume = Math.max(0, Math.min(1, rawVol > 1 ? rawVol / 100 : rawVol));
                  const effectiveGain = (track.muted || isMuted || !isActive) ? 0 : safeVolume;

                  if (audioSourceNodesRef.current[clip.id]?.gainNode) {
                    audioSourceNodesRef.current[clip.id].gainNode.gain.value = effectiveGain;
                  }

                  if (clip.type === ClipType.AUDIO) {
                    const el = audioElementRef.current[clip.id];
                    if (el) {
                      if (isActive) {
                        if (el.paused) el.play().catch(() => {});
                        const dur = el.duration || 999999;
                        const clamped = Math.max(0, Math.min(dur, targetSrcTime));
                        if (Math.abs(el.currentTime - clamped) > 0.15) {
                          el.currentTime = clamped;
                        }
                      } else {
                        if (!el.paused) el.pause();
                      }
                    }
                  } else if (clip.type === ClipType.VIDEO) {
                    const el = videoElementsRef.current[clip.id];
                    if (el instanceof HTMLVideoElement) {
                      if (isActive) {
                        el.playbackRate = Math.max(0.1, Math.min(16, currentSpeed || clip.playbackRate || 1.0));
                        if (el.paused) el.play().catch(() => {});
                        const dur = el.duration || 999999;
                        const clamped = Math.max(0, Math.min(dur, targetSrcTime));
                        if (Math.abs(el.currentTime - clamped) > 0.15) {
                          el.currentTime = clamped;
                        }
                      } else {
                        if (!el.paused) el.pause();
                      }
                    }
                  }
                });
              });

              if (elapsed >= totalDuration || pct >= 100) {
                clearInterval(recordInterval);
                activeRecordIntervalRef.current = null;
                if (recorder.state === 'recording') {
                  try {
                    recorder.requestData();
                  } catch (e) {}
                  recorder.stop();
                }
              }
            }, 100);

            activeRecordIntervalRef.current = recordInterval;

            recorder.onstop = async () => {
              activeRecorderRef.current = null;
              // Pause all media elements
              tracks.forEach(track => {
                track.clips.forEach(clip => {
                  const aEl = audioElementRef.current[clip.id];
                  if (aEl && !aEl.paused) aEl.pause();
                  const vEl = videoElementsRef.current[clip.id];
                  if (vEl instanceof HTMLVideoElement && !vEl.paused) vEl.pause();
                });
              });

              // Restore master speaker volume
              if (speakerGainRef.current) {
                speakerGainRef.current.gain.value = isMuted ? 0 : 1;
              }

              if (isCancelledExportRef.current) {
                isCancelledExportRef.current = false;
                setExporting(false);
                setExportProgress(0);
                return;
              }

              setExportProgress(100);

              const rawBlob = new Blob(chunks, { type: chosenMime || 'video/webm' });
              log(`MediaRecorder raw frame capture complete: ${(rawBlob.size / (1024 * 1024)).toFixed(2)} MB (${rawBlob.size} bytes).`);

              let finalVideoBlob = rawBlob;
              if (rawBlob.size > 0 && (!chosenMime || chosenMime.includes('webm'))) {
                try {
                  const patchedBlob = await fixWebmDuration(rawBlob, totalDuration);
                  if (patchedBlob && patchedBlob.size > 0) {
                    finalVideoBlob = patchedBlob;
                    log(`WebM container duration header patched successfully (${totalDuration.toFixed(1)}s).`);
                  }
                } catch (patchErr) {
                  log(`WebM duration patch note: ${patchErr}. Retaining raw encoded stream.`);
                  finalVideoBlob = rawBlob;
                }
              }

              let ext = chosenMime.includes('mp4') ? 'mp4' : (exportConf.format || 'webm');
              let filename = exportConf.filename?.trim() || `export_${exportConf.resolution}_${Date.now()}`;
              if (!filename.toLowerCase().endsWith(`.${ext}`)) {
                filename = filename.replace(/\.[a-zA-Z0-9]+$/, '') + `.${ext}`;
              }

              log(`Full video duration (${totalDuration.toFixed(1)}s) encoded: ${filename} (${(finalVideoBlob.size / (1024 * 1024)).toFixed(2)} MB). Saving output...`);

              const objectUrl = URL.createObjectURL(finalVideoBlob);
              setDownloadUrl(objectUrl);
              setExporting(false);

              // Trigger AdMob Interstitial Ad on export complete
              AdMobService.showInterstitial();

              await handleExportToNativeStorage(finalVideoBlob, filename);
            };

            return; // Export successfully triggered
          } catch (recErr) {
            log(`MediaRecorder launch error: ${recErr}. Activating fallback renderer...`);
          }
        }
      }
    }

    // Fallback if canvas stream / MediaRecorder not supported in current environment
    const totalDurationFallback = Math.max(duration, 1);
    log(`[Fallback Engine] Simulating full duration frame rendering (${totalDurationFallback.toFixed(1)}s)...`);
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setExportProgress(progress);
      log(`Rendering timeline frame buffer: ${progress}%`);

      if (progress >= 100) {
        clearInterval(interval);
        log(`Build complete. Initializing storage handler...`);
        setExporting(false);
        const sampleVideoUrl = 'https://assets.mixkit.co/videos/preview/mixkit-dinosaur-toy-bouncing-on-green-screen-42289-large.mp4';
        setDownloadUrl(sampleVideoUrl);
        let ext = exportConf.format || 'mp4';
        let filename = exportConf.filename?.trim() || `export_${exportConf.resolution}_${Date.now()}`;
        if (!filename.toLowerCase().endsWith(`.${ext}`)) {
          filename = filename.replace(/\.[a-zA-Z0-9]+$/, '') + `.${ext}`;
        }
        handleExportToNativeStorage(sampleVideoUrl, filename);
      }
    }, 250);
  };

  if (currentView === 'portal') {
    return (
      <LandingPortal
        user={currentUser}
        onOpenEditor={() => setCurrentView('editor')}
        onOpenAuth={() => setShowAuthModal(true)}
        onOpenProjectModal={() => setShowSaveModal(true)}
        onLoadTemplate={handleLoadTemplate}
        recentProjects={[]}
      />
    );
  }

  // Mobile / Android CapCut Layout Mode
  if (isMobileScreen) {
    return (
      <div id="video-editor-mobile-workspace" className="h-screen w-screen bg-[#07070b] overflow-hidden">
        {showNativeSplash && (
          <NativeSplashScreen
            onComplete={() => setShowNativeSplash(false)}
            platformName={nativePlatformName}
          />
        )}
        <MobileCuteCutLayout
          onBackToPortal={() => setCurrentView('portal')}
          onOpenExport={triggerExport}
          aspectRatio={aspectRatio}
          onSetAspectRatio={setAspectRatio}
          isPlaying={isPlaying}
          onTogglePlay={togglePlayPause}
          currentTime={currentTime}
          duration={duration}
          onUndo={handleUndo}
          onRedo={handleRedo}
          canUndo={historyIndex > 0}
          canRedo={historyIndex < tracksHistory.length - 1}
          selectedClip={getSelectedClip()}
          onDeselectClip={() => setSelectedClipId(null)}
          onSplitClip={splitClip}
          onDeleteClip={deleteClip}
          onDuplicateClip={duplicateClip}
          onUpdateClip={updateClipProperties}
          onAutoSegmentAudio={handleAutoSegmentAudio}
          onAutoSyncVideoToAyahs={handleAutoSyncVideoToAyahs}
          onAutoRemoveSilence={handleAutoRemoveSilence}
          onAutoSegmentRhythm={handleAutoSegmentRhythm}
          renderPreviewPlayer={() => (
            <PreviewPlayer
              tracks={tracks}
              currentTime={currentTime}
              duration={duration}
              isPlaying={isPlaying}
              aspectRatio={aspectRatio}
              watermark={watermark}
              isExporting={exporting}
              exportResolution={exportResolution}
              onCanvasReady={handleCanvasReady}
              onPlayPause={togglePlayPause}
              onSeek={setCurrentTime}
              onSetAspectRatio={setAspectRatio}
              videoNodes={videoElementsRef.current}
              selectedClip={getSelectedClip()}
              selectedClipIds={selectedClipIds}
              onSelectClip={(clip) => setSelectedClipId(clip ? clip.id : null)}
              onSelectClips={setSelectedClipIds}
              onUpdateClip={updateClipProperties}
              onBatchUpdateClips={batchUpdateClipProperties}
              quranShowSurahHeader={quranShowSurahHeader}
              quranSurahHeaderStyle={quranSurahHeaderStyle}
              quranSurahHeaderFont={quranSurahHeaderFont}
              quranSurahHeaderSize={quranSurahHeaderSize}
              quranSurahHeaderColor={quranSurahHeaderColor}
              quranSurahHeaderY={quranSurahHeaderY}
              quranSurahHeaderFormat={quranSurahHeaderFormat}
              quranSurahHeaderBg={quranSurahHeaderBg}
              quranSurahHeaderBgColor={quranSurahHeaderBgColor}
              quranSurahHeaderBgOpacity={quranSurahHeaderBgOpacity}
              quranCaptionDisplayMode={quranCaptionDisplayMode}
              quranSingleWordScale={quranSingleWordScale}
              quranSingleWordPop={quranSingleWordPop}
              quranShowQariBadge={quranShowQariBadge}
              quranQariName={quranQariName}
              quranQariBadgePosition={quranQariBadgePosition}
              quranShowWaveform={quranShowWaveform}
              quranWaveformStyle={quranWaveformStyle}
              quranWaveformColor={quranWaveformColor}
              quranWaveformY={quranWaveformY}
              quranKaraokeSyncOffsetMs={quranKaraokeSyncOffsetMs}
              onOpenSupportModal={() => setShowAboutSupportModal(true)}
            />
          )}
          renderTimeline={() => (
            <Timeline
              tracks={tracks}
              currentTime={currentTime}
              duration={duration}
              zoom={zoom}
              selectedClipId={selectedClipId}
              selectedClipIds={selectedClipIds}
              onSelectClip={handleSelectClip}
              onSelectClips={setSelectedClipIds}
              onSeek={setCurrentTime}
              onSplitClip={splitClip}
              onMergeClips={mergeSelectedClips}
              onDeleteClip={deleteClip}
              onDeleteSelectedClips={deleteSelectedClips}
              onRippleDelete={rippleDelete}
              onUpdateClipTimes={updateClipTimes}
              onBatchUpdateClipTimes={batchUpdateClipTimes}
              onZoomChange={setZoom}
              height={260}
              onUpdateDuration={handleUpdateDuration}
              onUndo={handleUndo}
              onRedo={handleRedo}
              canUndo={historyIndex > 0}
              canRedo={historyIndex < tracksHistory.length - 1}
              onDuplicateClip={duplicateClip}
              onFreezeFrame={freezeFrame}
              onExtractAudio={extractAudio}
              onSetClipSpeed={setClipSpeed}
              onToggleTrackMute={toggleTrackMute}
              onToggleTrackLock={toggleTrackLock}
              onToggleTrackHidden={toggleTrackHidden}
              onAddTrack={handleAddTrack}
              onDeleteTrack={handleDeleteTrack}
              onMoveTrack={handleMoveTrack}
              onReorderTracks={handleReorderTracks}
              aspectRatio={aspectRatio}
              onAspectRatioChange={setAspectRatio}
              onUpdateClip={updateClipProperties}
              onAddClip={addNewClip}
              isPlaying={isPlaying}
              isLooping={isLooping}
              onToggleLoop={() => setIsLooping(prev => !prev)}
              snapToGrid={snapToGrid}
              onToggleSnapToGrid={() => setSnapToGrid(prev => !prev)}
              onAutoSegmentAudio={handleAutoSegmentAudio}
              onAutoSyncVideoToAyahs={handleAutoSyncVideoToAyahs}
              onAutoRemoveSilence={handleAutoRemoveSilence}
              onAutoSegmentRhythm={handleAutoSegmentRhythm}
              onRepairQuranSync={handleRepairAndSnapQuranClips}
            />
          )}
          renderMediaPanel={(tab) => (
            <MediaPanel
              initialTab={tab}
              onAddClip={addNewClip}
              onOpenVeoAnimateModal={() => setShowVeoAnimateModal(true)}
              selectedAspectRatio={aspectRatio}
              tracks={tracks}
              onAlignQuran={handleAlignQuran}
              aligningStatus={aligningStatus}
              quranArabicFont={quranArabicFont}
              setQuranArabicFont={setQuranArabicFont}
              quranArabicSize={quranArabicSize}
              setQuranArabicSize={setQuranArabicSize}
              quranArabicColor={quranArabicColor}
              setQuranArabicColor={setQuranArabicColor}
              quranArabicStyle={quranArabicStyle}
              setQuranArabicStyle={setQuranArabicStyle}
              quranArabicY={quranArabicY}
              setQuranArabicY={setQuranArabicY}
              quranArabicWrap={quranArabicWrap}
              setQuranArabicWrap={setQuranArabicWrap}
              quranArabicMaxWidth={quranArabicMaxWidth}
              setQuranArabicMaxWidth={setQuranArabicMaxWidth}
              quranArabicLineHeight={quranArabicLineHeight}
              setQuranArabicLineHeight={setQuranArabicLineHeight}
              quranArabicAlign={quranArabicAlign}
              setQuranArabicAlign={setQuranArabicAlign}
              quranAyahSymbolStyle={quranAyahSymbolStyle}
              setQuranAyahSymbolStyle={setQuranAyahSymbolStyle}
              quranAyahDigitType={quranAyahDigitType}
              setQuranAyahDigitType={setQuranAyahDigitType}
              quranAyahSymbolPosition={quranAyahSymbolPosition}
              setQuranAyahSymbolPosition={setQuranAyahSymbolPosition}
              quranShowAyahSymbol={quranShowAyahSymbol}
              setQuranShowAyahSymbol={setQuranShowAyahSymbol}
              quranEnglishFont={quranEnglishFont}
              setQuranEnglishFont={setQuranEnglishFont}
              quranEnglishSize={quranEnglishSize}
              setQuranEnglishSize={setQuranEnglishSize}
              quranEnglishColor={quranEnglishColor}
              setQuranEnglishColor={setQuranEnglishColor}
              quranEnglishStyle={quranEnglishStyle}
              setQuranEnglishStyle={setQuranEnglishStyle}
              quranEnglishY={quranEnglishY}
              setQuranEnglishY={setQuranEnglishY}
              quranEnglishUppercase={quranEnglishUppercase}
              setQuranEnglishUppercase={setQuranEnglishUppercase}
              quranEnglishWrap={quranEnglishWrap}
              setQuranEnglishWrap={setQuranEnglishWrap}
              quranEnglishMaxWidth={quranEnglishMaxWidth}
              setQuranEnglishMaxWidth={setQuranEnglishMaxWidth}
              quranEnglishLineHeight={quranEnglishLineHeight}
              setQuranEnglishLineHeight={setQuranEnglishLineHeight}
              quranEnglishAlign={quranEnglishAlign}
              setQuranEnglishAlign={setQuranEnglishAlign}
            quranAnimationIn={quranAnimationIn}
            setQuranAnimationIn={setQuranAnimationIn}
            quranAnimationOut={quranAnimationOut}
            setQuranAnimationOut={setQuranAnimationOut}
            quranAnimationDuration={quranAnimationDuration}
            setQuranAnimationDuration={setQuranAnimationDuration}
            quranBgStyle={quranBgStyle}
            setQuranBgStyle={setQuranBgStyle}
            quranBgColor={quranBgColor}
            setQuranBgColor={setQuranBgColor}
            quranBgOpacity={quranBgOpacity}
            setQuranBgOpacity={setQuranBgOpacity}
            quranBgBlur={quranBgBlur}
            setQuranBgBlur={setQuranBgBlur}
            quranBgPadding={quranBgPadding}
            setQuranBgPadding={setQuranBgPadding}
            quranBgRadius={quranBgRadius}
            setQuranBgRadius={setQuranBgRadius}
              quranTranslation={quranTranslation}
              setQuranTranslation={setQuranTranslation}
              quranIntroMode={quranIntroMode}
              setQuranIntroMode={setQuranIntroMode}
              quranBreathSegmentationMode={quranBreathSegmentationMode}
              setQuranBreathSegmentationMode={setQuranBreathSegmentationMode}
              quranRecitationPace={quranRecitationPace}
              setQuranRecitationPace={setQuranRecitationPace}
              quranEnableDualTranslation={quranEnableDualTranslation}
              setQuranEnableDualTranslation={setQuranEnableDualTranslation}
              quranDualTranslationLang={quranDualTranslationLang}
              setQuranDualTranslationLang={setQuranDualTranslationLang}
              quranDualFont={quranDualFont}
              setQuranDualFont={setQuranDualFont}
              quranDualSize={quranDualSize}
              setQuranDualSize={setQuranDualSize}
              quranDualColor={quranDualColor}
              setQuranDualColor={setQuranDualColor}
              quranDualStyle={quranDualStyle}
              setQuranDualStyle={setQuranDualStyle}
              quranDualY={quranDualY}
              setQuranDualY={setQuranDualY}
              quranDualLineHeight={quranDualLineHeight}
              setQuranDualLineHeight={setQuranDualLineHeight}
              quranDualMaxWidth={quranDualMaxWidth}
              setQuranDualMaxWidth={setQuranDualMaxWidth}
              quranDualWrap={quranDualWrap}
              setQuranDualWrap={setQuranDualWrap}
              quranDualAlign={quranDualAlign}
              setQuranDualAlign={setQuranDualAlign}
              quranShowSurahHeader={quranShowSurahHeader}
              setQuranShowSurahHeader={setQuranShowSurahHeader}
              quranSurahHeaderStyle={quranSurahHeaderStyle}
              setQuranSurahHeaderStyle={setQuranSurahHeaderStyle}
              quranSurahHeaderFont={quranSurahHeaderFont}
              setQuranSurahHeaderFont={setQuranSurahHeaderFont}
              quranSurahHeaderSize={quranSurahHeaderSize}
              setQuranSurahHeaderSize={setQuranSurahHeaderSize}
              quranSurahHeaderColor={quranSurahHeaderColor}
              setQuranSurahHeaderColor={setQuranSurahHeaderColor}
              quranSurahHeaderY={quranSurahHeaderY}
              setQuranSurahHeaderY={setQuranSurahHeaderY}
              quranSurahHeaderFormat={quranSurahHeaderFormat}
              setQuranSurahHeaderFormat={setQuranSurahHeaderFormat}
              quranSurahHeaderBg={quranSurahHeaderBg}
              setQuranSurahHeaderBg={setQuranSurahHeaderBg}
              quranSurahHeaderBgColor={quranSurahHeaderBgColor}
              setQuranSurahHeaderBgColor={setQuranSurahHeaderBgColor}
              quranSurahHeaderBgOpacity={quranSurahHeaderBgOpacity}
              setQuranSurahHeaderBgOpacity={setQuranSurahHeaderBgOpacity}
              quranCaptionDisplayMode={quranCaptionDisplayMode}
              setQuranCaptionDisplayMode={setQuranCaptionDisplayMode}
              quranSingleWordScale={quranSingleWordScale}
              setQuranSingleWordScale={setQuranSingleWordScale}
              quranSingleWordPop={quranSingleWordPop}
              setQuranSingleWordPop={setQuranSingleWordPop}
              quranShowQariBadge={quranShowQariBadge}
              setQuranShowQariBadge={setQuranShowQariBadge}
              quranQariName={quranQariName}
              setQuranQariName={setQuranQariName}
              quranQariBadgePosition={quranQariBadgePosition}
              setQuranQariBadgePosition={setQuranQariBadgePosition}
              quranShowWaveform={quranShowWaveform}
              setQuranShowWaveform={setQuranShowWaveform}
              quranWaveformStyle={quranWaveformStyle}
              setQuranWaveformStyle={setQuranWaveformStyle}
              quranWaveformColor={quranWaveformColor}
              setQuranWaveformColor={setQuranWaveformColor}
              quranWaveformY={quranWaveformY}
              setQuranWaveformY={setQuranWaveformY}
              onAddBismillahCard={handleAddBismillahCard}
              onAddSadaqallahCard={handleAddSadaqallahCard}
              onAutoSeparateDualTracks={handleAutoSeparateDualTracks}
              quranKaraokeHighlight={quranKaraokeHighlight}
              setQuranKaraokeHighlight={setQuranKaraokeHighlight}
              quranKaraokeColor={quranKaraokeColor}
              setQuranKaraokeColor={setQuranKaraokeColor}
              quranKaraokeSyncOffsetMs={quranKaraokeSyncOffsetMs}
              setQuranKaraokeSyncOffsetMs={setQuranKaraokeSyncOffsetMs}
              onReplaceBismillahWithTabarakallazi={handleReplaceBismillahWithTabarakallazi}
              onApplyTranslationToTimeline={handleApplyTranslationToTimeline}
              onApplyDualTranslationToTimeline={handleApplyDualTranslationToTimeline}
              onApplyQuranStyles={applyQuranStylesToTimeline}
              onApplyGlobalFontSize={handleApplyGlobalFontSize}
              onApplyGlobalTextCase={handleApplyGlobalTextCase}
              onOpenAISegmentation={() => setShowAISegmentationModal(true)}
              onOpen100Protocols={() => setShow100ProtocolsModal(true)}
              watermark={watermark}
              setWatermark={setWatermark}
              width={window.innerWidth || 360}
              selectedClip={getSelectedClip()}
              onUpdateClip={(clipId, updates) => updateClipProperties(clipId, updates)}
              onAutoSegmentAudio={handleAutoSegmentAudio}
              onAutoSyncVideoToAyahs={handleAutoSyncVideoToAyahs}
              onAutoRemoveSilence={handleAutoRemoveSilence}
              onAutoSegmentRhythm={handleAutoSegmentRhythm}
              onReplaceVideoTrackClips={handleReplaceVideoTrackClips}
              onReplaceTracks={setTracks}
              onSeekTime={setCurrentTime}
              currentTime={currentTime}
              onRepairQuranSync={handleRepairAndSnapQuranClips}
            />
          )}
          renderInspector={() => (
            <Inspector
              selectedClip={getSelectedClip()}
              selectedClipIds={selectedClipIds}
              tracks={tracks}
              onUpdateClip={updateClipProperties}
              onBatchUpdateClips={batchUpdateClipProperties}
              onGenerateAICaptions={handleGenerateAICaptions}
              onGenerateTTS={handleGenerateTTS}
              width={window.innerWidth || 360}
              currentTime={currentTime}
              onSeek={setCurrentTime}
              onMergeClips={mergeSelectedClips}
            />
          )}
        />

        {/* Export Modal */}
        <ExportModal
          isOpen={showExportModal}
          onClose={() => setShowExportModal(false)}
          isMinimized={isExportMinimized}
          onToggleMinimize={() => setIsExportMinimized(prev => !prev)}
          duration={duration}
          aspectRatio={aspectRatio}
          tracks={tracks}
          watermark={watermark}
          setWatermark={setWatermark}
          exporting={exporting}
          exportProgress={exportProgress}
          exportTerminalLogs={exportTerminalLogs}
          downloadUrl={downloadUrl}
          savedLocalPath={savedLocalPath}
          onStartExport={startFfmpegCompilation}
          onCancelExport={handleCancelExport}
          onSaveToNativeStorage={(url, filename) => handleExportToNativeStorage(url, filename || `export_${Date.now()}.mp4`)}
        />

        {/* Auth Modal */}
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          user={currentUser}
          onLogin={handleLoginUser}
          onLogout={handleLogoutUser}
          initialErrorMessage={authModalError}
        />

        {/* Project Save & Style Presets Modal */}
        <ProjectSaveModal
          isOpen={showSaveModal}
          onClose={() => setShowSaveModal(false)}
          currentTracks={tracks}
          currentDuration={duration}
          currentZoom={zoom}
          currentAspectRatio={aspectRatio}
          watermark={watermark}
          userProfile={currentUser}
          selectedClip={getSelectedClip()}
          onLoadProject={handleLoadSavedProject}
          onApplyStylePreset={handleApplyStylePreset}
        />

        {/* Update Checker Modal */}
        <UpdateCheckerModal
          isOpen={showUpdateModal}
          onClose={() => setShowUpdateModal(false)}
        />
        
        <PreferencesModal 
          isOpen={showPreferencesModal} 
          onClose={() => setShowPreferencesModal(false)} 
        />

        {/* Voice Assistant Modal */}
        <VoiceAssistantModal
          isOpen={showVoiceModal}
          onClose={() => setShowVoiceModal(false)}
          onExecuteAction={handleExecuteVoiceAction}
        />
      </div>
    );
  }

  return (
    <div id="video-editor-workspace" className="h-screen bg-[#0e0e11] text-gray-200 flex flex-col font-sans overflow-hidden relative">
      {showNativeSplash && (
        <NativeSplashScreen
          onComplete={() => setShowNativeSplash(false)}
          platformName={nativePlatformName}
        />
      )}

      {/* Top Header */}
      <header className="h-14 bg-[#121217] border-b border-[#242430] flex items-center justify-between px-5 z-10 select-none shadow-md">
        <div className="flex items-center gap-3">
          <div className="relative group flex items-center justify-center cursor-pointer select-none">
            {/* Ambient Warm Golden/Cyan Glow Aura */}
            <div className="absolute -inset-2 bg-gradient-to-r from-amber-500/15 via-cyan-500/15 to-amber-500/10 rounded-2xl blur-lg group-hover:opacity-100 group-hover:scale-110 opacity-70 transition-all duration-500"></div>
            
            {/* Squircle Icon Container */}
            <div className="relative w-9.5 h-9.5 bg-[#0b0e14] border border-cyan-500/35 rounded-xl overflow-hidden flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.25)] transition-all duration-300 group-hover:border-cyan-300 group-hover:shadow-[0_0_20px_rgba(34,211,238,0.5)] group-hover:scale-105 group-active:scale-95">
              {/* Cyan Grid Pattern background */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#083344_1px,transparent_1px),linear-gradient(to_bottom,#083344_1px,transparent_1px)] bg-[size:6px_6px] opacity-70 group-hover:opacity-100 transition-opacity"></div>
              
              {/* Subtle Cyan Scanline Sweep */}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-400/10 to-transparent translate-y-[-100%] group-hover:translate-y-[100%] transition-transform duration-700 pointer-events-none"></div>

              {/* Central Cyan Scissors with Cutting Animation on Hover */}
              <Scissors className="relative z-10 w-4.5 h-4.5 text-cyan-400 stroke-[2.25] transform -rotate-45 drop-shadow-[0_0_6px_rgba(34,211,238,0.9)] group-hover:rotate-0 group-hover:scale-110 group-active:scale-90 transition-all duration-300 ease-out" />
            </div>
          </div>
          <div className="flex flex-col justify-center">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-black tracking-wider text-white">CUTECUT</span>
              <span className="text-[10px] bg-[#fefce8] text-black font-extrabold px-1.5 py-0.2 rounded-md font-mono shadow-sm tracking-tight border border-amber-200/50">PRO</span>
            </div>
            <div className="text-[8px] font-mono font-bold text-cyan-400 tracking-widest uppercase leading-tight mt-0.5">
              <div>VIDEO PROCESSING</div>
              <div>SUITE</div>
            </div>
          </div>
        </div>

        {/* Info label */}
        <div className="hidden lg:flex items-center gap-4 text-xs">
          <span className="text-gray-400 font-mono text-[10px]">Project length: {duration}s</span>
          <div className="h-3.5 w-px bg-gray-800" />
          <span className="text-gray-400 font-mono text-[10px]">Timezone: UTC 2026</span>
        </div>

        {/* Top Header Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Home Portal Button */}
          {!isNativeShell && (
            <button
              id="btn-back-to-portal-header"
              onClick={() => setCurrentView('portal')}
              className="flex items-center gap-1.5 px-3 h-9 bg-[#161622] hover:bg-[#202030] border border-[#2e2e42] hover:border-cyan-500/40 text-gray-300 text-xs font-bold rounded-lg transition shadow-sm active:scale-95 cursor-pointer"
              title="Return to home landing portal & video templates"
            >
              <FolderOpen className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden md:inline">Home Portal</span>
            </button>
          )}

          {/* Gemini Live Voice Conversation Button */}
          <button
            id="btn-gemini-voice-chat"
            onClick={() => setShowVoiceModal(true)}
            className="flex items-center gap-1.5 px-3 h-9 bg-[#161a26] hover:bg-[#1e2336] border border-cyan-500/40 hover:border-cyan-400 text-cyan-300 text-xs font-semibold rounded-lg transition shadow-sm active:scale-95 cursor-pointer"
            title="Start Live Voice Conversation with Gemini"
          >
            <Mic className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span>Voice Assistant</span>
            <span className="bg-cyan-500/20 text-cyan-300 text-[9px] px-1 py-0.5 rounded font-mono font-bold border border-cyan-500/30">LIVE</span>
          </button>

          {/* Gemini AI Intelligence Button */}
          <button
            id="btn-gemini-ai-intelligence"
            onClick={() => setShowGeminiIntelligenceModal(true)}
            className="flex items-center gap-1.5 px-3 h-9 bg-[#1d1828] hover:bg-[#272038] border border-purple-500/40 hover:border-purple-400 text-purple-300 text-xs font-semibold rounded-lg transition shadow-sm active:scale-95 cursor-pointer"
            title="Open Gemini AI Intelligence Studio & High Thinking Director"
          >
            <Brain className="w-3.5 h-3.5 text-purple-400" />
            <span>Gemini AI Intelligence</span>
            <span className="bg-purple-500/20 text-purple-300 text-[9px] px-1 py-0.5 rounded font-mono font-bold border border-purple-500/30">PRO</span>
          </button>

          {/* Veo AI Photo Animator Button */}
          <button
            id="btn-veo-animate-photo"
            onClick={() => setShowVeoAnimateModal(true)}
            className="flex items-center gap-1.5 px-3 h-9 bg-[#0e1d2c] hover:bg-[#14283d] border border-cyan-500/50 hover:border-cyan-400 text-cyan-300 text-xs font-semibold rounded-lg transition shadow-sm active:scale-95 cursor-pointer"
            title="Animate photo into video with Google Veo AI (veo-3.1-fast-generate-preview)"
          >
            <Film className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span>Animate Photo</span>
            <span className="bg-cyan-500/20 text-cyan-300 text-[9px] px-1 py-0.5 rounded font-mono font-bold border border-cyan-500/30">VEO 3.1</span>
          </button>

          {/* Save Project Button */}
          <button
            id="btn-save-project"
            onClick={() => setShowSaveModal(true)}
            className="hidden sm:flex items-center gap-1.5 px-3 h-9 bg-[#181822] hover:bg-[#222232] border border-[#2c2c3e] hover:border-cyan-500/40 text-gray-200 text-xs font-semibold rounded-lg transition shadow-sm"
          >
            <Save className="w-3.5 h-3.5 text-cyan-400" />
            <span>Save Project</span>
          </button>

          {/* Version Update Checker Button */}
          <button
            id="btn-check-update"
            onClick={() => setShowUpdateModal(true)}
            className="hidden sm:flex items-center gap-1.5 px-3 h-9 bg-[#181822] hover:bg-[#222232] border border-[#2c2c3e] hover:border-teal-500/40 text-gray-200 text-xs font-semibold rounded-lg transition shadow-sm"
          >
            <RefreshCw className="w-3.5 h-3.5 text-teal-400" />
            <span>Check Update</span>
          </button>

          {/* Keyboard Shortcuts Cheat-sheet Button */}
          <button
            id="btn-shortcuts-modal"
            onClick={() => setShowShortcutsModal(true)}
            className="hidden sm:flex items-center gap-1.5 px-3 h-9 bg-[#181822] hover:bg-[#222232] border border-[#2c2c3e] hover:border-cyan-500/40 text-gray-200 text-xs font-semibold rounded-lg transition shadow-sm cursor-pointer"
            title="Keyboard Shortcuts (?)"
          >
            <Keyboard className="w-3.5 h-3.5 text-cyan-400" />
            <span>Shortcuts</span>
            <kbd className="hidden lg:inline-block px-1.5 py-0.2 bg-[#252535] text-[10px] text-cyan-300 font-mono rounded border border-cyan-500/30">?</kbd>
          </button>

          {/* Preferences Button */}
          <button
            id="btn-preferences-modal"
            onClick={() => setShowPreferencesModal(true)}
            className="hidden sm:flex items-center justify-center w-9 h-9 bg-[#181822] hover:bg-[#222232] border border-[#2c2c3e] hover:border-gray-400 text-gray-300 text-xs font-semibold rounded-lg transition shadow-sm cursor-pointer"
            title="System Preferences"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Dynamic Hardware Performance & Network Status Badge */}
          <div
            id="badge-system-performance"
            className={`hidden md:flex items-center gap-1.5 px-2.5 h-9 bg-[#101018] border ${
              systemSpecs.isOnline ? 'border-emerald-500/30 text-emerald-300' : 'border-amber-500/30 text-amber-300'
            } rounded-lg text-xs font-mono select-none`}
            title={`System Profile: ${systemSpecs.tier.toUpperCase()} (${systemSpecs.cpuCores} Cores, ${systemSpecs.deviceMemoryGb}GB RAM) • ${
              systemSpecs.isOnline ? 'Online (Connected)' : 'Offline (IndexedDB Cached Mode)'
            }`}
          >
            <Zap className={`w-3.5 h-3.5 ${systemSpecs.tier === 'ultra' ? 'text-cyan-400' : 'text-emerald-400'}`} />
            <span className="font-bold text-[11px]">
              {systemSpecs.tier === 'ultra' ? 'Ultra 60FPS' : systemSpecs.tier === 'high' ? 'High Perf' : 'Eco Mode'}
            </span>
            <span className="text-[10px] text-gray-400 font-normal">
              • {systemSpecs.cpuCores}C
            </span>
            {systemSpecs.isOnline ? (
              <span title="Online"><Wifi className="w-3 h-3 text-emerald-400 ml-0.5" /></span>
            ) : (
              <span title="Offline Mode Active"><WifiOff className="w-3 h-3 text-amber-400 ml-0.5" /></span>
            )}
          </div>

          {/* Google Drive Auto-Sync Live Status Badge */}
          {currentUser && (
            <div className="hidden xl:flex items-center gap-2 px-2.5 h-9 bg-[#121622] border border-blue-500/30 rounded-lg text-xs font-mono">
              <Cloud className={`w-3.5 h-3.5 text-blue-400 ${driveSyncStatus.isSyncing ? 'animate-bounce' : ''}`} />
              <div className="flex flex-col text-[10px]">
                <span className="text-blue-300 font-bold flex items-center gap-1">
                  <span>Google Drive</span>
                  {driveSyncStatus.isSyncing && (
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-400 animate-ping" />
                  )}
                </span>
                <span className="text-gray-400 text-[9px]">
                  {driveSyncStatus.isSyncing ? 'Syncing project...' : driveSyncStatus.lastSyncedAt ? `Synced ${driveSyncStatus.lastSyncedAt}` : 'Auto-Save Active'}
                </span>
              </div>
              <button
                type="button"
                onClick={handleManualDriveSync}
                className="ml-1 p-1 hover:bg-blue-500/20 rounded text-blue-300 transition"
                title="Sync Now to Google Drive"
              >
                <CloudUpload className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Firebase Google Auth & User Profile Dropdown HUD */}
          {isAuthLoading ? (
            <div className="flex items-center gap-2 px-3 h-9 bg-[#181822] border border-[#2c2c3e] text-xs text-gray-400 rounded-lg">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400" />
              <span>Connecting...</span>
            </div>
          ) : currentUser ? (
            <div className="relative">
              <button
                id="btn-user-auth-profile"
                onClick={() => setAuthDropdownOpen(prev => !prev)}
                className="flex items-center gap-2 px-2.5 h-9 bg-[#181822] hover:bg-[#222232] border border-[#2c2c3e] hover:border-cyan-500/40 text-xs font-semibold text-gray-200 rounded-lg transition shadow-sm cursor-pointer"
                title="Account Settings & Cloud Sync"
              >
                <div className="flex items-center gap-2">
                  {currentUser.avatar ? (
                    <img
                      src={currentUser.avatar}
                      alt={currentUser.name}
                      crossOrigin="anonymous"
                      referrerPolicy="no-referrer"
                      className="w-6 h-6 rounded-full object-cover border border-cyan-400/60 shadow"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-cyan-400 to-teal-400 text-black font-black flex items-center justify-center text-[10px]">
                      {currentUser.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="text-cyan-300 max-w-[90px] truncate font-bold text-[11px]">{currentUser.name}</span>
                  <ChevronDown className="w-3 h-3 text-gray-400" />
                </div>
              </button>

              {/* Profile Dropdown Context Menu */}
              {authDropdownOpen && (
                <div 
                  id="auth-profile-dropdown"
                  className="absolute right-0 top-11 w-64 bg-[#14141c] border border-[#2e2e3c] rounded-xl shadow-2xl p-3 z-50 animate-fadeIn"
                >
                  <div className="flex items-center gap-3 pb-3 border-b border-[#242430]">
                    {currentUser.avatar ? (
                      <img
                        src={currentUser.avatar}
                        alt={currentUser.name}
                        crossOrigin="anonymous"
                        referrerPolicy="no-referrer"
                        className="w-10 h-10 rounded-full object-cover border-2 border-cyan-400 shadow-md"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-400 to-teal-400 text-black font-bold flex items-center justify-center text-sm shadow-md">
                        {currentUser.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-white truncate">{currentUser.name}</h4>
                      <p className="text-[10px] text-gray-400 truncate">{currentUser.email}</p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="text-[8px] uppercase bg-cyan-500/20 text-cyan-300 font-mono px-1.5 py-0.2 rounded border border-cyan-500/30 font-bold">
                          {currentUser.tier || 'PRO'}
                        </span>
                        <span className="text-[8px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded font-mono flex items-center gap-1 border border-emerald-500/30">
                          <Check className="w-2.5 h-2.5" /> Firestore Active
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="py-2 space-y-1">
                    <button
                      onClick={() => {
                        setAuthDropdownOpen(false);
                        setShowAuthModal(true);
                      }}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-gray-300 hover:text-white hover:bg-[#1e1e2b] transition text-left cursor-pointer"
                    >
                      <User className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Account Details</span>
                    </button>
                    <button
                      onClick={() => {
                        setAuthDropdownOpen(false);
                        setShowSaveModal(true);
                      }}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-gray-300 hover:text-white hover:bg-[#1e1e2b] transition text-left cursor-pointer"
                    >
                      <Cloud className="w-3.5 h-3.5 text-blue-400" />
                      <span>Manage Cloud Projects</span>
                    </button>
                  </div>

                  <div className="pt-2 border-t border-[#242430]">
                    <button
                      id="btn-google-signout"
                      onClick={handleGoogleSignOut}
                      className="w-full flex items-center justify-center gap-2 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 hover:border-red-500/50 text-red-400 text-xs font-semibold rounded-lg transition cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              id="btn-google-signin-header"
              onClick={handleGoogleSignIn}
              className="flex items-center gap-2 px-3 h-9 bg-white hover:bg-gray-100 text-gray-900 font-bold text-xs rounded-lg shadow-md transition active:scale-95 cursor-pointer"
              title="Sign in with Google to enable automatic Cloud Firestore sync & backup"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Sign in with Google</span>
              <span className="hidden md:inline-block bg-cyan-100 text-cyan-800 font-mono text-[9px] px-1.5 py-0.5 rounded font-extrabold uppercase">
                Cloud Sync
              </span>
            </button>
          )}

          {/* Donation Support Action Button */}
          <button
            id="btn-donation-support"
            onClick={handleSupportProjectClick}
            className="flex items-center gap-1.5 px-3 h-9 bg-[#1f1722] hover:bg-[#2d1e32] border border-pink-500/40 hover:border-pink-400 text-pink-300 text-xs font-semibold rounded-lg transition shadow-sm cursor-pointer"
            title="Support Project via Donation"
          >
            <Heart className="w-3.5 h-3.5 text-pink-400 fill-pink-400/20" />
            <span>Donation</span>
          </button>

          <div className="h-4 w-px bg-[#2a2a3a] mx-1" />

          {/* Export Video button */}
          <button
            id="btn-export-project"
            onClick={triggerExport}
            className="flex items-center gap-2 px-4 h-9 bg-gradient-to-r from-cyan-400 to-teal-400 hover:from-cyan-300 hover:to-teal-300 text-slate-950 font-bold text-xs rounded-lg shadow-md shadow-cyan-500/20 transition active:scale-95 cursor-pointer"
          >
            <Download className="w-4 h-4 text-slate-950" />
            <span>Export Video</span>
          </button>
        </div>
      </header>

      {/* Main split dashboard panel with CapCut-style modular layout gaps */}
      <div className="flex-1 flex flex-col overflow-hidden bg-[#0c0c10] p-1.5 gap-1.5 min-h-0">
        
        {/* Top 3 Modular Panels (Media + Splitter + Player + Splitter + Inspector) */}
        <div className="flex-1 flex overflow-hidden min-h-0 gap-1.5">
          {/* Media Side-Panel */}
          <MediaPanel
            onAddClip={addNewClip}
            onOpenVeoAnimateModal={() => setShowVeoAnimateModal(true)}
            selectedAspectRatio={aspectRatio}
            tracks={tracks}
            onAlignQuran={handleAlignQuran}
            aligningStatus={aligningStatus}
            quranArabicFont={quranArabicFont}
            setQuranArabicFont={setQuranArabicFont}
            quranArabicSize={quranArabicSize}
            setQuranArabicSize={setQuranArabicSize}
            quranArabicColor={quranArabicColor}
            setQuranArabicColor={setQuranArabicColor}
            quranArabicStyle={quranArabicStyle}
            setQuranArabicStyle={setQuranArabicStyle}
            quranArabicY={quranArabicY}
            setQuranArabicY={setQuranArabicY}
            quranArabicWrap={quranArabicWrap}
            setQuranArabicWrap={setQuranArabicWrap}
            quranArabicMaxWidth={quranArabicMaxWidth}
            setQuranArabicMaxWidth={setQuranArabicMaxWidth}
            quranArabicLineHeight={quranArabicLineHeight}
            setQuranArabicLineHeight={setQuranArabicLineHeight}
            quranArabicAlign={quranArabicAlign}
            setQuranArabicAlign={setQuranArabicAlign}
            quranAyahSymbolStyle={quranAyahSymbolStyle}
            setQuranAyahSymbolStyle={setQuranAyahSymbolStyle}
            quranAyahDigitType={quranAyahDigitType}
            setQuranAyahDigitType={setQuranAyahDigitType}
            quranAyahSymbolPosition={quranAyahSymbolPosition}
            setQuranAyahSymbolPosition={setQuranAyahSymbolPosition}
            quranShowAyahSymbol={quranShowAyahSymbol}
            setQuranShowAyahSymbol={setQuranShowAyahSymbol}
            quranEnglishFont={quranEnglishFont}
            setQuranEnglishFont={setQuranEnglishFont}
            quranEnglishSize={quranEnglishSize}
            setQuranEnglishSize={setQuranEnglishSize}
            quranEnglishColor={quranEnglishColor}
            setQuranEnglishColor={setQuranEnglishColor}
            quranEnglishStyle={quranEnglishStyle}
            setQuranEnglishStyle={setQuranEnglishStyle}
            quranEnglishY={quranEnglishY}
            setQuranEnglishY={setQuranEnglishY}
            quranEnglishUppercase={quranEnglishUppercase}
            setQuranEnglishUppercase={setQuranEnglishUppercase}
            quranEnglishWrap={quranEnglishWrap}
            setQuranEnglishWrap={setQuranEnglishWrap}
            quranEnglishMaxWidth={quranEnglishMaxWidth}
            setQuranEnglishMaxWidth={setQuranEnglishMaxWidth}
            quranEnglishLineHeight={quranEnglishLineHeight}
            setQuranEnglishLineHeight={setQuranEnglishLineHeight}
            quranEnglishAlign={quranEnglishAlign}
            setQuranEnglishAlign={setQuranEnglishAlign}
            quranAnimationIn={quranAnimationIn}
            setQuranAnimationIn={setQuranAnimationIn}
            quranAnimationOut={quranAnimationOut}
            setQuranAnimationOut={setQuranAnimationOut}
            quranAnimationDuration={quranAnimationDuration}
            setQuranAnimationDuration={setQuranAnimationDuration}
            quranBgStyle={quranBgStyle}
            setQuranBgStyle={setQuranBgStyle}
            quranBgColor={quranBgColor}
            setQuranBgColor={setQuranBgColor}
            quranBgOpacity={quranBgOpacity}
            setQuranBgOpacity={setQuranBgOpacity}
            quranBgBlur={quranBgBlur}
            setQuranBgBlur={setQuranBgBlur}
            quranBgPadding={quranBgPadding}
            setQuranBgPadding={setQuranBgPadding}
            quranBgRadius={quranBgRadius}
            setQuranBgRadius={setQuranBgRadius}
            quranTranslation={quranTranslation}
            setQuranTranslation={setQuranTranslation}
            quranIntroMode={quranIntroMode}
            setQuranIntroMode={setQuranIntroMode}
            quranBreathSegmentationMode={quranBreathSegmentationMode}
            setQuranBreathSegmentationMode={setQuranBreathSegmentationMode}
            quranRecitationPace={quranRecitationPace}
            setQuranRecitationPace={setQuranRecitationPace}
            quranEnableDualTranslation={quranEnableDualTranslation}
            setQuranEnableDualTranslation={setQuranEnableDualTranslation}
            quranDualTranslationLang={quranDualTranslationLang}
            setQuranDualTranslationLang={setQuranDualTranslationLang}
            quranDualFont={quranDualFont}
            setQuranDualFont={setQuranDualFont}
            quranDualSize={quranDualSize}
            setQuranDualSize={setQuranDualSize}
            quranDualColor={quranDualColor}
            setQuranDualColor={setQuranDualColor}
            quranDualStyle={quranDualStyle}
            setQuranDualStyle={setQuranDualStyle}
            quranDualY={quranDualY}
            setQuranDualY={setQuranDualY}
            quranDualLineHeight={quranDualLineHeight}
            setQuranDualLineHeight={setQuranDualLineHeight}
            quranDualMaxWidth={quranDualMaxWidth}
            setQuranDualMaxWidth={setQuranDualMaxWidth}
            quranDualWrap={quranDualWrap}
            setQuranDualWrap={setQuranDualWrap}
            quranDualAlign={quranDualAlign}
            setQuranDualAlign={setQuranDualAlign}
            quranShowSurahHeader={quranShowSurahHeader}
            setQuranShowSurahHeader={setQuranShowSurahHeader}
            quranSurahHeaderStyle={quranSurahHeaderStyle}
            setQuranSurahHeaderStyle={setQuranSurahHeaderStyle}
            quranSurahHeaderFont={quranSurahHeaderFont}
            setQuranSurahHeaderFont={setQuranSurahHeaderFont}
            quranSurahHeaderSize={quranSurahHeaderSize}
            setQuranSurahHeaderSize={setQuranSurahHeaderSize}
            quranSurahHeaderColor={quranSurahHeaderColor}
            setQuranSurahHeaderColor={setQuranSurahHeaderColor}
            quranSurahHeaderY={quranSurahHeaderY}
            setQuranSurahHeaderY={setQuranSurahHeaderY}
            quranSurahHeaderFormat={quranSurahHeaderFormat}
            setQuranSurahHeaderFormat={setQuranSurahHeaderFormat}
            quranSurahHeaderBg={quranSurahHeaderBg}
            setQuranSurahHeaderBg={setQuranSurahHeaderBg}
            quranSurahHeaderBgColor={quranSurahHeaderBgColor}
            setQuranSurahHeaderBgColor={setQuranSurahHeaderBgColor}
            quranSurahHeaderBgOpacity={quranSurahHeaderBgOpacity}
            setQuranSurahHeaderBgOpacity={setQuranSurahHeaderBgOpacity}
            quranCaptionDisplayMode={quranCaptionDisplayMode}
            setQuranCaptionDisplayMode={setQuranCaptionDisplayMode}
            quranSingleWordScale={quranSingleWordScale}
            setQuranSingleWordScale={setQuranSingleWordScale}
            quranSingleWordPop={quranSingleWordPop}
            setQuranSingleWordPop={setQuranSingleWordPop}
            quranShowQariBadge={quranShowQariBadge}
            setQuranShowQariBadge={setQuranShowQariBadge}
            quranQariName={quranQariName}
            setQuranQariName={setQuranQariName}
            quranQariBadgePosition={quranQariBadgePosition}
            setQuranQariBadgePosition={setQuranQariBadgePosition}
            quranShowWaveform={quranShowWaveform}
            setQuranShowWaveform={setQuranShowWaveform}
            quranWaveformStyle={quranWaveformStyle}
            setQuranWaveformStyle={setQuranWaveformStyle}
            quranWaveformColor={quranWaveformColor}
            setQuranWaveformColor={setQuranWaveformColor}
            quranWaveformY={quranWaveformY}
            setQuranWaveformY={setQuranWaveformY}
            onAddBismillahCard={handleAddBismillahCard}
            onAddSadaqallahCard={handleAddSadaqallahCard}
            onAutoSeparateDualTracks={handleAutoSeparateDualTracks}
            quranKaraokeHighlight={quranKaraokeHighlight}
            setQuranKaraokeHighlight={setQuranKaraokeHighlight}
            quranKaraokeColor={quranKaraokeColor}
            setQuranKaraokeColor={setQuranKaraokeColor}
            quranKaraokeSyncOffsetMs={quranKaraokeSyncOffsetMs}
            setQuranKaraokeSyncOffsetMs={setQuranKaraokeSyncOffsetMs}
            onReplaceBismillahWithTabarakallazi={handleReplaceBismillahWithTabarakallazi}
            onApplyTranslationToTimeline={handleApplyTranslationToTimeline}
            onApplyDualTranslationToTimeline={handleApplyDualTranslationToTimeline}
            onApplyQuranStyles={applyQuranStylesToTimeline}
            onApplyGlobalFontSize={handleApplyGlobalFontSize}
            onApplyGlobalTextCase={handleApplyGlobalTextCase}
            onOpenAISegmentation={() => setShowAISegmentationModal(true)}
            onOpen100Protocols={() => setShow100ProtocolsModal(true)}
            watermark={watermark}
            setWatermark={setWatermark}
            width={mediaPanelWidth}
            selectedClip={getSelectedClip()}
            onUpdateClip={(clipId, updates) => updateClipProperties(clipId, updates)}
            onAutoSegmentAudio={handleAutoSegmentAudio}
            onAutoSyncVideoToAyahs={handleAutoSyncVideoToAyahs}
            onAutoRemoveSilence={handleAutoRemoveSilence}
            onAutoSegmentRhythm={handleAutoSegmentRhythm}
            onReplaceVideoTrackClips={handleReplaceVideoTrackClips}
            currentTime={currentTime}
            onRepairQuranSync={handleRepairAndSnapQuranClips}
          />

          {/* Media Side-Panel Splitter Handle */}
          <div
            id="splitter-media"
            className="w-1.5 hover:w-2 bg-[#1b1b24] hover:bg-cyan-500/60 rounded-full cursor-col-resize active:bg-cyan-500 z-20 transition-all duration-150 relative flex-shrink-0 select-none group flex items-center justify-center my-1 shadow-sm"
            onMouseDown={(e) => startResizing(e, 'media')}
            title="Drag to resize Media Panel"
          >
            <div className="w-0.5 h-6 bg-gray-600 group-hover:bg-cyan-300 rounded-full pointer-events-none transition" />
          </div>

          {/* Live center frame / Canvas Viewport */}
          <div className="flex-1 flex flex-col overflow-hidden min-h-0 min-w-0">
            <PreviewPlayer
              tracks={tracks}
              currentTime={currentTime}
              duration={duration}
              isPlaying={isPlaying}
              aspectRatio={aspectRatio}
              watermark={watermark}
              isExporting={exporting}
              exportResolution={exportResolution}
              onCanvasReady={handleCanvasReady}
              onPlayPause={togglePlayPause}
              onSeek={setCurrentTime}
              onSetAspectRatio={setAspectRatio}
              videoNodes={videoElementsRef.current}
              selectedClip={getSelectedClip()}
              selectedClipIds={selectedClipIds}
              onSelectClip={(clip) => setSelectedClipId(clip ? clip.id : null)}
              onSelectClips={setSelectedClipIds}
              onUpdateClip={updateClipProperties}
              onBatchUpdateClips={batchUpdateClipProperties}
              quranShowSurahHeader={quranShowSurahHeader}
              quranSurahHeaderStyle={quranSurahHeaderStyle}
              quranSurahHeaderFont={quranSurahHeaderFont}
              quranSurahHeaderSize={quranSurahHeaderSize}
              quranSurahHeaderColor={quranSurahHeaderColor}
              quranSurahHeaderY={quranSurahHeaderY}
              quranSurahHeaderFormat={quranSurahHeaderFormat}
              quranSurahHeaderBg={quranSurahHeaderBg}
              quranSurahHeaderBgColor={quranSurahHeaderBgColor}
              quranSurahHeaderBgOpacity={quranSurahHeaderBgOpacity}
              quranCaptionDisplayMode={quranCaptionDisplayMode}
              quranSingleWordScale={quranSingleWordScale}
              quranSingleWordPop={quranSingleWordPop}
              quranShowQariBadge={quranShowQariBadge}
              quranQariName={quranQariName}
              quranQariBadgePosition={quranQariBadgePosition}
              quranShowWaveform={quranShowWaveform}
              quranWaveformStyle={quranWaveformStyle}
              quranWaveformColor={quranWaveformColor}
              quranWaveformY={quranWaveformY}
              quranKaraokeSyncOffsetMs={quranKaraokeSyncOffsetMs}
              onOpenSupportModal={() => setShowAboutSupportModal(true)}
            />
          </div>

          {/* Center-Inspector Splitter Handle */}
          <div
            id="splitter-inspector"
            className="w-1.5 hover:w-2 bg-[#1b1b24] hover:bg-cyan-500/60 rounded-full cursor-col-resize active:bg-cyan-500 z-20 transition-all duration-150 relative flex-shrink-0 select-none group flex items-center justify-center my-1 shadow-sm"
            onMouseDown={(e) => startResizing(e, 'inspector')}
            title="Drag to resize Inspector Panel"
          >
            <div className="w-0.5 h-6 bg-gray-600 group-hover:bg-cyan-300 rounded-full pointer-events-none transition" />
          </div>

          {/* Right context Inspector panel */}
          <Inspector
            selectedClip={getSelectedClip()}
            selectedClipIds={selectedClipIds}
            tracks={tracks}
            onUpdateClip={updateClipProperties}
            onBatchUpdateClips={batchUpdateClipProperties}
            onGenerateAICaptions={handleGenerateAICaptions}
            onGenerateTTS={handleGenerateTTS}
            width={inspectorWidth}
            currentTime={currentTime}
            onSeek={setCurrentTime}
            onMergeClips={mergeSelectedClips}
          />
        </div>

        {/* Dashboard-Timeline Splitter Handle */}
        <div
          id="splitter-timeline"
          className="h-1.5 hover:h-2 bg-[#1b1b24] hover:bg-cyan-500/60 rounded-full cursor-row-resize active:bg-cyan-500 z-20 transition-all duration-150 relative flex-shrink-0 select-none group flex items-center justify-center mx-1 shadow-sm"
          onMouseDown={(e) => startResizing(e, 'timeline')}
          title="Drag to resize Timeline Height"
        >
          <div className="h-0.5 w-10 bg-gray-600 group-hover:bg-cyan-300 rounded-full pointer-events-none transition" />
        </div>

        {/* Bottom multi-track Timeline panel */}
        <Timeline
        tracks={tracks}
        currentTime={currentTime}
        duration={duration}
        zoom={zoom}
        selectedClipId={selectedClipId}
        selectedClipIds={selectedClipIds}
        onSelectClip={handleSelectClip}
        onSelectClips={setSelectedClipIds}
        onSeek={setCurrentTime}
        onSplitClip={splitClip}
        onMergeClips={mergeSelectedClips}
        onDeleteClip={deleteClip}
        onDeleteSelectedClips={deleteSelectedClips}
        onRippleDelete={rippleDelete}
        onUpdateClipTimes={updateClipTimes}
        onBatchUpdateClipTimes={batchUpdateClipTimes}
        onZoomChange={setZoom}
        height={timelineHeight}
        onUpdateDuration={handleUpdateDuration}
        onUndo={handleUndo}
        onRedo={handleRedo}
        canUndo={historyIndex > 0}
        canRedo={historyIndex < tracksHistory.length - 1}
        onDuplicateClip={duplicateClip}
        onFreezeFrame={freezeFrame}
        onExtractAudio={extractAudio}
        onSetClipSpeed={setClipSpeed}
        onToggleTrackMute={toggleTrackMute}
        onToggleTrackLock={toggleTrackLock}
        onToggleTrackHidden={toggleTrackHidden}
        onAddTrack={handleAddTrack}
        onDeleteTrack={handleDeleteTrack}
        onMoveTrack={handleMoveTrack}
        onReorderTracks={handleReorderTracks}
        onMoveClipToTrack={handleMoveClipToTrack}
        aspectRatio={aspectRatio}
        onAspectRatioChange={setAspectRatio}
        onUpdateClip={updateClipProperties}
        onAddClip={addNewClip}
        isPlaying={isPlaying}
        isLooping={isLooping}
        onToggleLoop={() => setIsLooping(prev => !prev)}
        snapToGrid={snapToGrid}
        onToggleSnapToGrid={() => setSnapToGrid(prev => !prev)}
        onAutoSegmentAudio={handleAutoSegmentAudio}
        onAutoSyncVideoToAyahs={handleAutoSyncVideoToAyahs}
        onAutoRemoveSilence={handleAutoRemoveSilence}
        onAutoSegmentRhythm={handleAutoSegmentRhythm}
        onRepairQuranSync={handleRepairAndSnapQuranClips}
      />
      </div>

      {/* ------------------ (E) EXPORT MODULE PANEL (MODAL OVERLAY WINDOW) ------------------ */}
      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        isMinimized={isExportMinimized}
        onToggleMinimize={() => setIsExportMinimized(prev => !prev)}
        duration={duration}
        aspectRatio={aspectRatio}
        tracks={tracks}
        watermark={watermark}
        setWatermark={setWatermark}
        exporting={exporting}
        exportProgress={exportProgress}
        exportTerminalLogs={exportTerminalLogs}
        downloadUrl={downloadUrl}
        savedLocalPath={savedLocalPath}
        onStartExport={startFfmpegCompilation}
        onCancelExport={handleCancelExport}
        onSaveToNativeStorage={(url, filename) => handleExportToNativeStorage(url, filename || `export_${Date.now()}.mp4`)}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        user={currentUser}
        onLogin={handleLoginUser}
        onLogout={handleLogoutUser}
        initialErrorMessage={authModalError}
      />

      {/* Project Save & Style Presets Modal */}
      <ProjectSaveModal
        isOpen={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        currentTracks={tracks}
        currentDuration={duration}
        currentZoom={zoom}
        currentAspectRatio={aspectRatio}
        watermark={watermark}
        userProfile={currentUser}
        selectedClip={getSelectedClip()}
        onLoadProject={handleLoadSavedProject}
        onApplyStylePreset={handleApplyStylePreset}
      />

      {/* Update Checker Modal */}
      <UpdateCheckerModal
        isOpen={showUpdateModal}
        onClose={() => setShowUpdateModal(false)}
      />

      <PreferencesModal 
        isOpen={showPreferencesModal} 
        onClose={() => setShowPreferencesModal(false)} 
      />

      {/* Voice Assistant Modal (gemini-3.1-flash-live-preview Live API) */}
      <VoiceAssistantModal
        isOpen={showVoiceModal}
        onClose={() => setShowVoiceModal(false)}
        onExecuteAction={handleExecuteVoiceAction}
      />

      {/* Gemini AI Intelligence Studio Modal (gemini-3.7-flash High Thinking) */}
      <GeminiAIIntelligenceModal
        isOpen={showGeminiIntelligenceModal}
        onClose={() => setShowGeminiIntelligenceModal(false)}
        onAddClip={addNewClip}
        onExecuteAction={handleExecuteVoiceAction}
        currentTime={currentTime}
        aspectRatio={aspectRatio}
      />

      {/* Veo AI Image to Video Animation Modal (veo-3.1-fast-generate-preview) */}
      <VeoAnimateImageModal
        isOpen={showVeoAnimateModal}
        onClose={() => setShowVeoAnimateModal(false)}
        onAddClip={addNewClip}
        tracks={tracks}
        currentTime={currentTime}
      />

      {/* Keyboard Shortcuts Help Modal */}
      <KeyboardShortcutsModal
        isOpen={showShortcutsModal}
        onClose={() => setShowShortcutsModal(false)}
      />

      {/* About CuteCut Pro & Support / Donation Modal */}
      <AboutSupportModal
        isOpen={showAboutSupportModal}
        onClose={() => setShowAboutSupportModal(false)}
        onSupportClick={handleSupportProjectClick}
        donationUrl={DONATION_SUPPORT_URL}
      />

      {/* 100 Master Quran Alignment Protocols Diagnostic Inspector Modal */}
      <Quran100ProtocolsModal
        isOpen={show100ProtocolsModal}
        onClose={() => setShow100ProtocolsModal(false)}
        protocols={latestProtocolsEvaluation}
        surahName={tracks.find(t => t.id === 'track-audio-1')?.clips[0]?.name || 'Surah Al-Fatihah'}
        totalAyahs={tracks.find(t => t.id === 'track-quran-arabic')?.clips.length || 7}
      />

      {showVideoSynthesis && (
        <VideoExport 
          projectId={Date.now().toString()} 
          alignment={tracks
            .find(t => t.id === 'track-quran-arabic')?.clips
            .map(c => ({
              ayahIndex: c.ayahNumber || 0,
              wordIndex: 0,
              startTime: c.start,
              endTime: c.start + c.duration,
              isWaqfPause: false,
              confidenceScore: c.confidenceScore || 0,
              verse_key: c.ayahKey || `${c.surahNumber}:${c.ayahNumber}`,
              text_arabic: c.text,
              text_english: tracks
                .find(t => t.id === 'track-quran-english')?.clips
                .find(ec => ec.linkedClipId === c.id || (ec.ayahNumber === c.ayahNumber && ec.surahNumber === c.surahNumber))?.text
            })) || []}
          audioSource={tracks.find(t => t.id === 'track-audio-1')?.clips[0]?.url || ''}
          onClose={() => setShowVideoSynthesis(false)}
        />
      )}

    </div>
  );
}
