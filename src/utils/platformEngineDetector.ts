import { checkWebCodecsSupport } from '../services/webCodecsExportService';
import { detectHardwareAVEngine } from '../services/rendering/nativeHardwareRenderEngine';

export type PlatformEnvironment = 'electron_windows' | 'electron_mac' | 'electron_linux' | 'android' | 'web_browser';

export interface PlatformEngineInfo {
  platform: PlatformEnvironment;
  platformName: string;
  platformBadge: string;
  engine: 'native_avengine' | 'webcodecs' | 'mediarecorder';
  engineName: string;
  engineBadge: string;
  engineDescription: string;
  isDesktopNative: boolean;
  isAndroid: boolean;
  isWeb: boolean;
  hardwareEncoderName: string;
}

/**
 * Determines whether the current execution runtime is an installed offline native application
 * (Windows .exe, macOS .dmg, Linux .deb/.snap/.AppImage, or Android native APK)
 * vs a standard web browser visit on the public website.
 */
export function isOfflineNativeApp(): boolean {
  if (typeof window === 'undefined') return false;

  try {
    // URL search param override for testing (?mode=desktop or ?mode=web)
    const searchParams = new URLSearchParams(window.location.search);
    if (searchParams.get('mode') === 'desktop' || searchParams.get('mode') === 'app' || searchParams.get('shell') === 'native') {
      return true;
    }
    if (searchParams.get('mode') === 'web' || searchParams.get('mode') === 'website') {
      return false;
    }
  } catch {
    // ignore
  }

  const userAgent = (navigator.userAgent || '').toLowerCase();

  // 1. Electron Desktop (.exe, .dmg, .deb, .snap, AppImage)
  const isElectron = !!(window as any).process?.versions?.electron ||
    /electron/i.test(userAgent) ||
    !!(window as any).ipcRenderer ||
    (typeof (window as any).require === 'function' && Boolean((window as any).require('electron')));

  // 2. Tauri Desktop / local file protocol
  const isTauri = !!(window as any).__TAURI__;
  const isLocalFile = window.location.protocol === 'file:';

  // 3. Capacitor Native Android / iOS APK shell
  const isCapacitor = !!(window as any).Capacitor;
  const isCapacitorNative = isCapacitor && (
    (typeof (window as any).Capacitor.isNativePlatform === 'function' && (window as any).Capacitor.isNativePlatform()) ||
    (window as any).Capacitor.getPlatform?.() === 'android' ||
    (window as any).Capacitor.getPlatform?.() === 'ios'
  );

  // 4. Native Android bridge interface (injected by WebChromeClient / WebView)
  const isAndroidBridge = !!(window as any).Android || !!(window as any).AndroidBridge;

  return !!(isElectron || isTauri || isLocalFile || isCapacitorNative || isAndroidBridge);
}

/**
 * Automatically detects the exact host operating system & runtime environment
 * (Windows .exe, macOS .dmg, Linux .deb/.snap/.AppImage, Android APK, or Web Browser)
 * and assigns the optimal offline rendering engine without manual user selection.
 */
export function detectPlatformAndOptimalEngine(): PlatformEngineInfo {
  if (typeof window === 'undefined') {
    return {
      platform: 'electron_linux',
      platformName: 'Linux Desktop (.deb / .snap / AppImage)',
      platformBadge: '🐧 Linux Desktop',
      engine: 'native_avengine',
      engineName: 'Native Offline C++ FFmpeg Engine',
      engineBadge: '🚀 Native Offline C++',
      engineDescription: '100% Offline C++ FFmpeg Core with GPU Hardware Acceleration',
      isDesktopNative: true,
      isAndroid: false,
      isWeb: false,
      hardwareEncoderName: 'Native C++ AVEngine (libx264 / NVENC / QSV)'
    };
  }

  const userAgent = (navigator.userAgent || '').toLowerCase();
  const platformStr = (navigator.platform || '').toLowerCase();
  
  // 1. Check Electron / Native Desktop Environment
  const isElectron = !!(window as any).process?.versions?.electron ||
    /electron/i.test(userAgent) ||
    !!(window as any).ipcRenderer ||
    (typeof (window as any).require === 'function' && Boolean((window as any).require('electron')));
  
  const isTauri = !!(window as any).__TAURI__;
  const isDesktopNative = isElectron || isTauri;

  // 2. Check Android Native Environment
  const isCapacitor = !!(window as any).Capacitor;
  const isCapacitorNative = isCapacitor && typeof (window as any).Capacitor.isNativePlatform === 'function' && (window as any).Capacitor.isNativePlatform();
  const isAndroid = isCapacitorNative || (isCapacitor && (window as any).Capacitor.getPlatform?.() === 'android') || (/android/i.test(userAgent) && !isDesktopNative);

  const hwInfo = detectHardwareAVEngine();
  const webCodecsSupport = checkWebCodecsSupport();

  // CASE A: Desktop Native App (Windows .exe, macOS .dmg, Linux .deb/.snap/.AppImage)
  if (isDesktopNative) {
    const isWindows = /windows|win32|win64/i.test(userAgent) || /win/i.test(platformStr);
    const isMac = /macintosh|mac os x|darwin/i.test(userAgent) || /mac/i.test(platformStr);

    if (isWindows) {
      return {
        platform: 'electron_windows',
        platformName: 'Windows Desktop (.exe)',
        platformBadge: '🪟 Windows (.exe)',
        engine: 'native_avengine',
        engineName: 'Native Offline C++ FFmpeg & GPU SDK Engine',
        engineBadge: '🚀 Native C++ / GPU SDKs (NVENC / QSV)',
        engineDescription: '100% Offline Windows C++ Core with NVIDIA NVENC / Intel QSV / AMD AMF GPU SDK direct hardware encoding.',
        isDesktopNative: true,
        isAndroid: false,
        isWeb: false,
        hardwareEncoderName: hwInfo.hardwareEncoderName
      };
    }

    if (isMac) {
      return {
        platform: 'electron_mac',
        platformName: 'macOS Desktop (.dmg)',
        platformBadge: '🍎 macOS (.dmg)',
        engine: 'native_avengine',
        engineName: 'Native Offline C++ & Apple Metal SDK Engine',
        engineBadge: '🚀 Apple VideoToolbox & Metal SDK',
        engineDescription: '100% Offline macOS Metal & VideoToolbox Core with direct Movies folder auto-save.',
        isDesktopNative: true,
        isAndroid: false,
        isWeb: false,
        hardwareEncoderName: hwInfo.hardwareEncoderName
      };
    }

    // Default Desktop Linux
    return {
      platform: 'electron_linux',
      platformName: 'Linux Desktop (.deb / .snap / AppImage)',
      platformBadge: '🐧 Linux (.deb / .snap)',
      engine: 'native_avengine',
      engineName: 'Native Offline C++ FFmpeg & GPU SDK Engine',
      engineBadge: '🚀 Native C++ / GPU SDKs (VAAPI / NVENC)',
      engineDescription: '100% Offline Linux C++ FFmpeg Core with VAAPI / NVENC GPU SDK direct hardware encoding.',
      isDesktopNative: true,
      isAndroid: false,
      isWeb: false,
      hardwareEncoderName: hwInfo.hardwareEncoderName
    };
  }

  // CASE B: Android Mobile Platform (Capacitor / Native APK / Mobile Web)
  if (isAndroid) {
    return {
      platform: 'android',
      platformName: 'Android Device (DCIM / Gallery)',
      platformBadge: '🤖 Android Mobile',
      engine: 'native_avengine',
      engineName: 'Android Native Hardware C++ Pipeline',
      engineBadge: '⚡ Native Hardware MediaStore',
      engineDescription: 'Auto-configured for Android: Hardware GPU MediaCodec SDK rendering with direct DCIM/Gallery auto-save.',
      isDesktopNative: false,
      isAndroid: true,
      isWeb: false,
      hardwareEncoderName: 'Android Hardware MediaCodec SDK (H.264 / AAC)'
    };
  }

  // CASE C: Web Browser (Chrome, Edge, Safari, Firefox, Opera)
  const isWebCodecs = webCodecsSupport.supported;
  return {
    platform: 'web_browser',
    platformName: 'Web Browser (Online / PWA)',
    platformBadge: '🌐 Web Browser',
    engine: isWebCodecs ? 'webcodecs' : 'mediarecorder',
    engineName: isWebCodecs ? 'WebCodecs GPU SDK Hardware Engine' : 'Offline Frame Step Media Engine',
    engineBadge: isWebCodecs ? '⚡ WebCodecs GPU SDK (Auto)' : '🎥 Offline Frame Engine',
    engineDescription: isWebCodecs
      ? 'Auto-detected Web Environment: GPU Hardware Accelerated Frame-by-Frame MP4 Muxer with Direct GPU SDK Pipeline.'
      : 'Auto-detected Web Environment: Offline Discrete Frame Pacing (Smooth Playback, No Live Timeline Play).',
    isDesktopNative: false,
    isAndroid: false,
    isWeb: true,
    hardwareEncoderName: isWebCodecs ? hwInfo.hardwareEncoderName : 'Client Canvas Media Pipeline'
  };
}
