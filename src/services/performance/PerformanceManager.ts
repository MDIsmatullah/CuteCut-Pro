/**
 * High-Performance Rendering System for CuteCut Pro
 * Adaptive optimization based on device capabilities
 * Supports: Desktop (NVIDIA/Intel/AMD), Mobile, Web, Snap App
 */

export interface DeviceCapabilities {
  cpuCores: number;
  totalMemory: number;
  gpuType: 'nvidia' | 'intel' | 'amd' | 'apple' | 'web' | 'unknown';
  gpuVram: number;
  isLowEnd: boolean;
  isMobile: boolean;
  supportsHardwareEncoding: boolean;
  supportedEncoders: string[];
  maxResolution: { width: number; height: number };
  estimatedPerformance: 'ultra' | 'high' | 'medium' | 'low';
}

export interface RenderOptimization {
  threadsToUse: number;
  chunkSizeFrames: number;
  previewQuality: number; // 0-1
  exportPreset: string; // 'ultrafast' | 'veryfast' | 'fast' | 'medium'
  useHardwareAccel: boolean;
  bufferPoolSize: number;
  useWebWorkers: boolean;
  maxConcurrentEncodes: number;
}

export class PerformanceManager {
  private static instance: PerformanceManager;
  private capabilities: DeviceCapabilities;
  private optimization: RenderOptimization;

  private constructor() {
    this.capabilities = this.detectDeviceCapabilities();
    this.optimization = this.calculateOptimization();
  }

  static getInstance(): PerformanceManager {
    if (!PerformanceManager.instance) {
      PerformanceManager.instance = new PerformanceManager();
    }
    return PerformanceManager.instance;
  }

  private detectDeviceCapabilities(): DeviceCapabilities {
    const nav = navigator as any;
    const cpuCores = nav.hardwareConcurrency || 4;
    const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(
      navigator.userAgent.toLowerCase()
    );

    let gpuType: DeviceCapabilities['gpuType'] = 'unknown';
    let supportsHardwareEncoding = false;
    let supportedEncoders: string[] = [];

    // Detect GPU type (browser only, electron needs native module)
    if (typeof navigator !== 'undefined' && nav.gpu) {
      gpuType = 'web';
      supportsHardwareEncoding = true;
      supportedEncoders = ['h264', 'vp9', 'vp8'];
    } else if (typeof process !== 'undefined' && process.platform === 'win32') {
      gpuType = 'unknown'; // Will be detected via electron
      supportsHardwareEncoding = true;
      supportedEncoders = ['h264_nvenc', 'h264_qsv', 'h264_amf'];
    } else if (typeof process !== 'undefined' && process.platform === 'linux') {
      gpuType = 'unknown'; // Will be detected via ffmpeg
      supportsHardwareEncoding = true;
      supportedEncoders = ['h264_nvenc', 'h264_qsv', 'h264_vaapi', 'h264_v4l2m2m'];
    } else if (typeof process !== 'undefined' && process.platform === 'darwin') {
      gpuType = 'apple';
      supportsHardwareEncoding = true;
      supportedEncoders = ['h264_videotoolbox'];
    }

    const totalMemory = nav.deviceMemory || 8;
    const isLowEnd = cpuCores <= 2 || totalMemory <= 2;

    return {
      cpuCores,
      totalMemory,
      gpuType,
      gpuVram: 4096, // Default, would need native detection
      isLowEnd,
      isMobile,
      supportsHardwareEncoding,
      supportedEncoders,
      maxResolution: isMobile ? { width: 1080, height: 1920 } : { width: 3840, height: 2160 },
      estimatedPerformance: this.estimatePerformance(cpuCores, totalMemory, isMobile)
    };
  }

  private estimatePerformance(
    cpuCores: number,
    totalMemory: number,
    isMobile: boolean
  ): 'ultra' | 'high' | 'medium' | 'low' {
    if (isMobile) return 'low';
    if (cpuCores >= 8 && totalMemory >= 16) return 'ultra';
    if (cpuCores >= 4 && totalMemory >= 8) return 'high';
    if (cpuCores >= 2 && totalMemory >= 4) return 'medium';
    return 'low';
  }

  private calculateOptimization(): RenderOptimization {
    const perf = this.capabilities.estimatedPerformance;
    const hwAccel = this.capabilities.supportsHardwareEncoding;

    const configs: Record<DeviceCapabilities['estimatedPerformance'], RenderOptimization> = {
      ultra: {
        threadsToUse: Math.max(this.capabilities.cpuCores - 2, 4),
        chunkSizeFrames: 300,
        previewQuality: 1.0,
        exportPreset: 'medium',
        useHardwareAccel: hwAccel,
        bufferPoolSize: 8,
        useWebWorkers: true,
        maxConcurrentEncodes: 3
      },
      high: {
        threadsToUse: Math.max(this.capabilities.cpuCores - 1, 3),
        chunkSizeFrames: 200,
        previewQuality: 0.9,
        exportPreset: 'fast',
        useHardwareAccel: hwAccel,
        bufferPoolSize: 6,
        useWebWorkers: true,
        maxConcurrentEncodes: 2
      },
      medium: {
        threadsToUse: Math.max(this.capabilities.cpuCores - 1, 2),
        chunkSizeFrames: 100,
        previewQuality: 0.75,
        exportPreset: 'veryfast',
        useHardwareAccel: hwAccel,
        bufferPoolSize: 4,
        useWebWorkers: true,
        maxConcurrentEncodes: 1
      },
      low: {
        threadsToUse: 1,
        chunkSizeFrames: 50,
        previewQuality: 0.5,
        exportPreset: 'ultrafast',
        useHardwareAccel: false,
        bufferPoolSize: 2,
        useWebWorkers: false,
        maxConcurrentEncodes: 1
      }
    };

    return configs[perf];
  }

  getCapabilities(): DeviceCapabilities {
    return this.capabilities;
  }

  getOptimization(): RenderOptimization {
    return this.optimization;
  }

  getPerformanceSummary(): string {
    const caps = this.capabilities;
    const opt = this.optimization;
    return `
Device: ${caps.gpuType.toUpperCase()} | CPU: ${caps.cpuCores} cores | RAM: ${caps.totalMemory}GB | Level: ${caps.estimatedPerformance.toUpperCase()}
Render: ${opt.exportPreset} preset | ${opt.threadsToUse} threads | HW Accel: ${opt.useHardwareAccel ? 'YES' : 'NO'}
Preview: ${Math.round(opt.previewQuality * 100)}% quality | Workers: ${opt.useWebWorkers ? 'YES' : 'NO'}
    `.trim();
  }
}

export default PerformanceManager;
