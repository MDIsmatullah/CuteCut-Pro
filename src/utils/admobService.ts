/**
 * Google AdMob & AdSense Manager for CuteCut Pro (Android, Web & Desktop)
 * 
 * Configured with User Credentials:
 * - Application ID: ca-app-pub-8898043565822840~4018462556
 * - Publisher ID: pub-8898043565822840
 * - Banner Ad ID: ca-app-pub-8898043565822840/1719602275
 * - Interstitial Ad ID: ca-app-pub-8898043565822840/6780357267
 * - Rewarded Ad ID: ca-app-pub-8898043565822840/5391253975
 * - Authorized Crawler Tag: google.com, pub-8898043565822840, DIRECT, f08c47fec0942fa0
 */

import { Capacitor } from '@capacitor/core';
import {
  AdMob,
  BannerAdPosition,
  BannerAdSize,
  InterstitialAdPluginEvents,
  RewardAdPluginEvents,
} from '@capacitor-community/admob';

export interface AdMobConfig {
  appId: string;
  publisherId: string;
  bannerId: string;
  interstitialId: string;
  rewardedId: string;
}

export const ADMOB_CREDENTIALS: AdMobConfig = {
  appId: 'ca-app-pub-8898043565822840~4018462556',
  publisherId: 'pub-8898043565822840',
  bannerId: 'ca-app-pub-8898043565822840/1719602275',
  interstitialId: 'ca-app-pub-8898043565822840/6780357267',
  rewardedId: 'ca-app-pub-8898043565822840/5391253975',
};

// Official Google AdMob Test Unit IDs
export const ADMOB_TEST_IDS: AdMobConfig = {
  appId: 'ca-app-pub-3940256099942544~3347511713',
  publisherId: 'pub-3940256099942544',
  bannerId: 'ca-app-pub-3940256099942544/6300978111',
  interstitialId: 'ca-app-pub-3940256099942544/1033173712',
  rewardedId: 'ca-app-pub-3940256099942544/5224354917',
};

export interface InAppAdPayload {
  id: string;
  type: 'app_open' | 'export_pre' | 'export_post' | 'rewarded';
  title: string;
  subtitle: string;
  publisherId: string;
  adUnitId: string;
  onDismiss: () => void;
  onReward?: () => void;
  countdownSeconds: number;
}

type InAppAdListener = (ad: InAppAdPayload | null) => void;

export class AdMobService {
  private static isInitialized = false;
  private static isTestingMode = false;
  private static activeInAppAd: InAppAdPayload | null = null;
  private static listeners: Set<InAppAdListener> = new Set();
  private static lastAppOpenTime = 0;

  public static isNativeAndroid(): boolean {
    if (typeof window === 'undefined') return false;
    return Capacitor.isNativePlatform();
  }

  public static setTestingMode(enable: boolean) {
    this.isTestingMode = enable;
  }

  public static getActiveConfig(): AdMobConfig {
    return this.isTestingMode ? ADMOB_TEST_IDS : ADMOB_CREDENTIALS;
  }

  /**
   * Register listener for in-app ad modal presentations (Web, Desktop, or Fallback)
   */
  public static subscribeInAppAd(listener: InAppAdListener): () => void {
    this.listeners.add(listener);
    listener(this.activeInAppAd);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private static triggerInAppAd(payload: InAppAdPayload | null) {
    this.activeInAppAd = payload;
    this.listeners.forEach((cb) => cb(payload));
  }

  public static dismissCurrentInAppAd() {
    if (this.activeInAppAd) {
      const dismissCallback = this.activeInAppAd.onDismiss;
      this.activeInAppAd = null;
      this.listeners.forEach((cb) => cb(null));
      try {
        dismissCallback?.();
      } catch (err) {
        console.warn('[AdMob] In-app ad dismiss error:', err);
      }
    }
  }

  public static async initialize(): Promise<void> {
    if (this.isInitialized) return;
    try {
      if (Capacitor.isNativePlatform()) {
        await AdMob.initialize({
          testingDevices: ['EMULATOR'],
          initializeForTesting: this.isTestingMode,
        });
        console.log('[AdMob] Native Android SDK initialized with App ID:', ADMOB_CREDENTIALS.appId);
      } else {
        console.log('[AdMob] Web / Cloud Platform ready with Publisher ID:', ADMOB_CREDENTIALS.publisherId);
      }
      this.isInitialized = true;
    } catch (err) {
      console.warn('[AdMob] Native initialization notice:', err);
      this.isInitialized = true;
    }
  }

  /**
   * 1. App Open Ad (Triggered when user opens the app)
   */
  public static async showAppOpenAd(onDismiss?: () => void): Promise<void> {
    const now = Date.now();
    // Cooldown protection: prevent opening multiple times within 15 seconds
    if (now - this.lastAppOpenTime < 15000) {
      onDismiss?.();
      return;
    }
    this.lastAppOpenTime = now;

    let finished = false;
    const finish = () => {
      if (!finished) {
        finished = true;
        onDismiss?.();
      }
    };

    try {
      await this.initialize();
      const config = this.getActiveConfig();

      if (Capacitor.isNativePlatform()) {
        let dismissListener: any;
        let failListener: any;

        const cleanup = () => {
          if (dismissListener && typeof dismissListener.remove === 'function') dismissListener.remove();
          if (failListener && typeof failListener.remove === 'function') failListener.remove();
        };

        dismissListener = await AdMob.addListener(InterstitialAdPluginEvents.Dismissed, () => {
          cleanup();
          console.log('[AdMob] Native App Open ad closed.');
          finish();
        });

        failListener = await AdMob.addListener(InterstitialAdPluginEvents.FailedToShow, () => {
          cleanup();
          console.warn('[AdMob] Native App Open ad failed, using fallback.');
          this.showInAppAdDialog('app_open', finish);
        });

        await AdMob.prepareInterstitial({
          adId: config.interstitialId,
          isTesting: this.isTestingMode,
        });
        await AdMob.showInterstitial();
      } else {
        // Web / Desktop / WebView App Open Ad
        this.showInAppAdDialog('app_open', finish);
      }
    } catch (err) {
      console.warn('[AdMob] App open ad notice:', err);
      this.showInAppAdDialog('app_open', finish);
    }
  }

  /**
   * 2. Bottom Sticky Adaptive Banner Ad
   */
  public static async showBanner(): Promise<void> {
    try {
      await this.initialize();
      const config = this.getActiveConfig();

      if (Capacitor.isNativePlatform()) {
        await AdMob.showBanner({
          adId: config.bannerId,
          adSize: BannerAdSize.ADAPTIVE_BANNER,
          position: BannerAdPosition.BOTTOM_CENTER,
          margin: 0,
          isTesting: this.isTestingMode,
        });
        console.log('[AdMob] Bottom banner ad displayed:', config.bannerId);
      }
    } catch (err) {
      console.warn('[AdMob] Banner load notice:', err);
    }
  }

  public static async hideBanner(): Promise<void> {
    try {
      if (Capacitor.isNativePlatform()) {
        await AdMob.hideBanner();
      }
    } catch {
      // Ignored
    }
  }

  /**
   * 3. Pre-Export Full-Screen Ad
   * Shown when the user initiates video export
   */
  public static async showExportAd(
    onComplete: () => void,
    onShowInAppAd?: () => void
  ): Promise<void> {
    let completed = false;
    const finish = () => {
      if (!completed) {
        completed = true;
        onComplete();
      }
    };

    // Safety timeout: 5 seconds max wait
    const fallbackTimer = setTimeout(() => {
      console.log('[AdMob] Pre-export ad safety timer reached, proceeding to export.');
      finish();
    }, 5500);

    try {
      await this.initialize();
      const config = this.getActiveConfig();

      if (Capacitor.isNativePlatform()) {
        let dismissListener: any;
        let failListener: any;

        const cleanup = () => {
          clearTimeout(fallbackTimer);
          if (dismissListener && typeof dismissListener.remove === 'function') dismissListener.remove();
          if (failListener && typeof failListener.remove === 'function') failListener.remove();
        };

        dismissListener = await AdMob.addListener(
          InterstitialAdPluginEvents.Dismissed,
          () => {
            cleanup();
            console.log('[AdMob] Pre-export ad dismissed by user. Starting render.');
            finish();
          }
        );

        failListener = await AdMob.addListener(
          InterstitialAdPluginEvents.FailedToShow,
          () => {
            cleanup();
            console.warn('[AdMob] Native ad failed to show, displaying in-app sponsor ad.');
            if (onShowInAppAd) {
              onShowInAppAd();
            } else {
              this.showInAppAdDialog('export_pre', finish);
            }
          }
        );

        await AdMob.prepareInterstitial({
          adId: config.interstitialId,
          isTesting: this.isTestingMode,
        });

        await AdMob.showInterstitial();
      } else {
        clearTimeout(fallbackTimer);
        if (onShowInAppAd) {
          onShowInAppAd();
        } else {
          this.showInAppAdDialog('export_pre', finish);
        }
      }
    } catch (err) {
      console.warn('[AdMob] showExportAd notice:', err);
      clearTimeout(fallbackTimer);
      if (onShowInAppAd) {
        onShowInAppAd();
      } else {
        this.showInAppAdDialog('export_pre', finish);
      }
    }
  }

  /**
   * 4. Full-Screen Interstitial Ad (Shown after video render/export completes)
   */
  public static async showInterstitial(onDismiss?: () => void): Promise<void> {
    try {
      await this.initialize();
      const config = this.getActiveConfig();

      if (Capacitor.isNativePlatform()) {
        await AdMob.prepareInterstitial({
          adId: config.interstitialId,
          isTesting: this.isTestingMode,
        });
        await AdMob.showInterstitial();
        console.log('[AdMob] Interstitial ad shown after export:', config.interstitialId);
        onDismiss?.();
      } else {
        console.log('[AdMob Web] Interstitial ad shown after export:', config.interstitialId);
        this.showInAppAdDialog('export_post', () => onDismiss?.());
      }
    } catch (err) {
      console.warn('[AdMob] Interstitial ad notice:', err);
      onDismiss?.();
    }
  }

  /**
   * 5. Rewarded Video Ad (To unlock 1080p Export or Pro Video Filters)
   */
  public static async showRewarded(onRewardGranted: () => void): Promise<void> {
    try {
      await this.initialize();
      const config = this.getActiveConfig();

      if (Capacitor.isNativePlatform()) {
        const listener = await AdMob.addListener(
          RewardAdPluginEvents.Rewarded,
          () => {
            console.log('[AdMob] Rewarded video completed! Unlocking Pro features.');
            onRewardGranted();
            if (listener && typeof listener.remove === 'function') {
              listener.remove();
            }
          }
        );

        await AdMob.prepareRewardVideoAd({
          adId: config.rewardedId,
          isTesting: this.isTestingMode,
        });
        await AdMob.showRewardVideoAd();
      } else {
        this.showInAppAdDialog('rewarded', onRewardGranted, onRewardGranted);
      }
    } catch (err) {
      console.warn('[AdMob] Rewarded ad fallback:', err);
      onRewardGranted();
    }
  }

  /**
   * Display Web/Desktop/Fallback In-App Ad Modal
   */
  private static showInAppAdDialog(
    type: 'app_open' | 'export_pre' | 'export_post' | 'rewarded',
    onDismiss: () => void,
    onReward?: () => void
  ) {
    const config = this.getActiveConfig();
    let title = 'Google AdMob Sponsored Partner';
    let subtitle = 'Supporting Free 4K Video Editing & AI Quran Studio';
    let countdownSeconds = 3;

    if (type === 'app_open') {
      title = 'Google AdMob App Open Ad';
      subtitle = 'Welcome to CuteCut Pro • Hardware Accelerated Video Studio';
      countdownSeconds = 3;
    } else if (type === 'export_pre') {
      title = 'Exporting Sponsor • Google AdMob';
      subtitle = 'Hardware NVENC / MediaCodec Render starting in a moment...';
      countdownSeconds = 4;
    } else if (type === 'export_post') {
      title = 'Export Complete • Google AdMob Partner';
      subtitle = 'Your high quality video has been rendered successfully!';
      countdownSeconds = 3;
    } else if (type === 'rewarded') {
      title = 'Rewarded Video Ad • Google AdMob';
      subtitle = 'Watch to unlock Pro High Bitrate 4K Export';
      countdownSeconds = 5;
    }

    this.triggerInAppAd({
      id: `ad_${Date.now()}`,
      type,
      title,
      subtitle,
      publisherId: config.publisherId,
      adUnitId: type === 'rewarded' ? config.rewardedId : config.interstitialId,
      onDismiss,
      onReward,
      countdownSeconds,
    });
  }

  /**
   * Diagnostic test to verify app-ads.txt accessibility and crawler readiness
   */
  public static async testAdsTxtCrawler(): Promise<{
    success: boolean;
    url: string;
    content: string;
    hasPublisherId: boolean;
    message: string;
  }> {
    try {
      const url = `${typeof window !== 'undefined' ? window.location.origin : ''}/app-ads.txt`;
      const res = await fetch(url);
      if (!res.ok) {
        return {
          success: false,
          url,
          content: '',
          hasPublisherId: false,
          message: `HTTP error ${res.status}: Failed to reach /app-ads.txt`,
        };
      }
      const text = await res.text();
      const hasPub = text.includes(ADMOB_CREDENTIALS.publisherId);
      return {
        success: hasPub,
        url,
        content: text.trim(),
        hasPublisherId: hasPub,
        message: hasPub
          ? 'app-ads.txt is perfectly reachable and crawler-compliant!'
          : 'app-ads.txt is reachable, but publisher ID is not found in content.',
      };
    } catch (err: any) {
      return {
        success: false,
        url: '/app-ads.txt',
        content: '',
        hasPublisherId: false,
        message: err?.message || 'Network error fetching /app-ads.txt',
      };
    }
  }
}
