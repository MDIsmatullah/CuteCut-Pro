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
        engineName: 'Native Offline C++ FFmpeg Engine',
        engineBadge: '🚀 Native C++ (NVENC / QSV)',
        engineDescription: '100% Offline Windows C++ Core with direct file writing to disk & zero cloud lag.',
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
        engineName: 'Native Offline C++ FFmpeg Engine',
        engineBadge: '🚀 Apple VideoToolbox / Metal C++',
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
      engineName: 'Native Offline C++ FFmpeg Engine',
      engineBadge: '🚀 Native C++ AVEngine (VAAPI / NVENC)',
      engineDescription: '100% Offline Linux C++ FFmpeg Core with direct Videos folder auto-save.',
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
      engineDescription: 'Auto-configured for Android: Hardware GPU rendering with direct DCIM/Gallery auto-save.',
      isDesktopNative: false,
      isAndroid: true,
      isWeb: false,
      hardwareEncoderName: 'Android Hardware Codec Core (H.264 / AAC)'
    };
  }

  // CASE C: Web Browser (Chrome, Edge, Safari, Firefox, Opera)
  const isWebCodecs = webCodecsSupport.supported;
  return {
    platform: 'web_browser',
    platformName: 'Web Browser (Online / PWA)',
    platformBadge: '🌐 Web Browser',
    engine: isWebCodecs ? 'webcodecs' : 'mediarecorder',
    engineName: isWebCodecs ? 'WebCodecs GPU Hardware Engine' : 'Offline Frame Step Media Engine',
    engineBadge: isWebCodecs ? '⚡ WebCodecs GPU (Auto)' : '🎥 Offline Frame Engine',
    engineDescription: isWebCodecs
      ? 'Auto-detected Web Environment: GPU Hardware Accelerated Frame-by-Frame MP4 Muxer (0% Dropped Frames).'
      : 'Auto-detected Web Environment: Offline Discrete Frame Pacing (Smooth Playback, No Live Timeline Play).',
    isDesktopNative: false,
    isAndroid: false,
    isWeb: true,
    hardwareEncoderName: isWebCodecs ? hwInfo.hardwareEncoderName : 'Client Canvas Media Pipeline'
  };
}
