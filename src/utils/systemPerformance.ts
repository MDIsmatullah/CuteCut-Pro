/**
 * System Hardware & Performance Optimization Engine
 * Detects host CPU cores, RAM, GPU tier, power state, and online/offline status
 * Dynamically adjusts canvas frame budgets, audio visualizer fidelity, and rendering resolution
 */

export type PerformanceTier = 'ultra' | 'high' | 'balanced' | 'power_saver';

export interface SystemSpecs {
  cpuCores: number;
  deviceMemoryGb: number;
  isOnline: boolean;
  isElectron: boolean;
  gpuRenderer: string;
  hasHardwareAcceleration: boolean;
  tier: PerformanceTier;
  recommendedDpiScale: number;
  recommendedMaxWaveformPoints: number;
  recommendedFps: number;
  enableSmoothTransitions: boolean;
}

/**
 * Detect host GPU renderer and WebGL hardware capabilities
 */
function getGpuInfo(): { renderer: string; hardwareAccelerated: boolean } {
  if (typeof window === 'undefined') return { renderer: 'Unknown', hardwareAccelerated: false };
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) return { renderer: 'Software fallback', hardwareAccelerated: false };

    const debugInfo = (gl as any).getExtension('WEBGL_debug_renderer_info');
    if (debugInfo) {
      const renderer = (gl as any).getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || '';
      const isSoftware = /swiftshader|llvmpipe|software|mesa/i.test(renderer);
      return {
        renderer: renderer || 'WebGL Hardware Accelerated',
        hardwareAccelerated: !isSoftware
      };
    }
    return { renderer: 'Generic WebGL', hardwareAccelerated: true };
  } catch {
    return { renderer: 'Canvas 2D', hardwareAccelerated: false };
  }
}

/**
 * Detect current system specs and compute optimal performance tier
 */
export function detectSystemSpecs(): SystemSpecs {
  if (typeof window === 'undefined') {
    return {
      cpuCores: 4,
      deviceMemoryGb: 8,
      isOnline: true,
      isElectron: false,
      gpuRenderer: 'Node / SSR',
      hasHardwareAcceleration: true,
      tier: 'high',
      recommendedDpiScale: 1.0,
      recommendedMaxWaveformPoints: 3000,
      recommendedFps: 60,
      enableSmoothTransitions: true,
    };
  }

  const cpuCores = navigator.hardwareConcurrency || 4;
  const deviceMemoryGb = (navigator as any).deviceMemory || 8;
  const isOnline = typeof navigator.onLine === 'boolean' ? navigator.onLine : true;
  const isElectron = !!(window as any).process?.versions?.electron || /electron/i.test(navigator.userAgent);
  const gpu = getGpuInfo();

  let tier: PerformanceTier = 'high';

  if (cpuCores >= 8 && deviceMemoryGb >= 8 && gpu.hardwareAccelerated) {
    tier = 'ultra';
  } else if (cpuCores >= 4 && deviceMemoryGb >= 4) {
    tier = 'high';
  } else if (cpuCores >= 2 && deviceMemoryGb >= 2) {
    tier = 'balanced';
  } else {
    tier = 'power_saver';
  }

  // Calculate configuration based on tier
  let recommendedDpiScale = 1.0;
  let recommendedMaxWaveformPoints = 2500;
  let recommendedFps = 60;
  let enableSmoothTransitions = true;

  switch (tier) {
    case 'ultra':
      recommendedDpiScale = Math.min(window.devicePixelRatio || 1.0, 2.0);
      recommendedMaxWaveformPoints = 5000;
      recommendedFps = 60;
      enableSmoothTransitions = true;
      break;
    case 'high':
      recommendedDpiScale = Math.min(window.devicePixelRatio || 1.0, 1.5);
      recommendedMaxWaveformPoints = 3000;
      recommendedFps = 60;
      enableSmoothTransitions = true;
      break;
    case 'balanced':
      recommendedDpiScale = 1.0;
      recommendedMaxWaveformPoints = 1800;
      recommendedFps = 45;
      enableSmoothTransitions = true;
      break;
    case 'power_saver':
      recommendedDpiScale = 0.85;
      recommendedMaxWaveformPoints = 1000;
      recommendedFps = 30;
      enableSmoothTransitions = false;
      break;
  }

  return {
    cpuCores,
    deviceMemoryGb,
    isOnline,
    isElectron,
    gpuRenderer: gpu.renderer,
    hasHardwareAcceleration: gpu.hardwareAccelerated,
    tier,
    recommendedDpiScale,
    recommendedMaxWaveformPoints,
    recommendedFps,
    enableSmoothTransitions,
  };
}

let cachedSpecs: SystemSpecs | null = null;

export function getSystemSpecs(): SystemSpecs {
  if (!cachedSpecs) {
    cachedSpecs = detectSystemSpecs();
  }
  return cachedSpecs;
}
