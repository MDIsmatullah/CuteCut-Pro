/**
 * Google AdMob Manager for CuteCut Pro Android / Capacitor & Web
 * Configured with User Credentials:
 * - Application ID: ca-app-pub-8898043565822840~4018462556
 * - Banner Ad ID: ca-app-pub-8898043565822840/1719602275
 * - Interstitial Ad ID: ca-app-pub-8898043565822840/6780357267
 * - Rewarded Ad ID: ca-app-pub-8898043565822840/5391253975
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
  bannerId: string;
  interstitialId: string;
  rewardedId: string;
}

export const ADMOB_CREDENTIALS: AdMobConfig = {
  appId: 'ca-app-pub-8898043565822840~4018462556',
  bannerId: 'ca-app-pub-8898043565822840/1719602275',
  interstitialId: 'ca-app-pub-8898043565822840/6780357267',
  rewardedId: 'ca-app-pub-8898043565822840/5391253975',
};

// Official Google AdMob Test Unit IDs
export const ADMOB_TEST_IDS: AdMobConfig = {
  appId: 'ca-app-pub-3940256099942544~3347511713',
  bannerId: 'ca-app-pub-3940256099942544/6300978111',
  interstitialId: 'ca-app-pub-3940256099942544/1033173712',
  rewardedId: 'ca-app-pub-3940256099942544/5224354917',
};

export class AdMobService {
  private static isInitialized = false;
  private static isTestingMode = false;

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
        console.log('[AdMob] Web / Mobile Platform ready with credentials');
      }
      this.isInitialized = true;
    } catch (err) {
      console.warn('[AdMob] Native initialization notice:', err);
      this.isInitialized = true;
    }
  }

  /**
   * 1. Bottom Sticky Banner Ad
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
   * 2. Full-Screen Interstitial Ad (Shown after video render/export completes)
   */
  public static async showInterstitial(): Promise<void> {
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
      } else {
        console.log('[AdMob Simulated] Interstitial Ad triggered for export completion:', config.interstitialId);
      }
    } catch (err) {
      console.warn('[AdMob] Interstitial ad notice:', err);
    }
  }

  /**
   * 3. Pre-Export Full-Screen Ad
   * Displays Google AdMob interstitial on Native Android or triggers the in-app ad modal on web/mobile.
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

    // Safety timeout: 4 seconds maximum wait for native ad
    const fallbackTimer = setTimeout(() => {
      console.log('[AdMob] Pre-export ad fallback timer reached, starting export.');
      finish();
    }, 4500);

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
            console.log('[AdMob] Pre-export ad dismissed by user. Starting export.');
            finish();
          }
        );

        failListener = await AdMob.addListener(
          InterstitialAdPluginEvents.FailedToShow,
          () => {
            cleanup();
            console.warn('[AdMob] Native ad failed to show, launching in-app sponsor ad or export.');
            if (onShowInAppAd) {
              onShowInAppAd();
            } else {
              finish();
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
        // On web/mobile browser, trigger in-app ad experience so user actually sees an ad
        if (onShowInAppAd) {
          onShowInAppAd();
        } else {
          setTimeout(finish, 800);
        }
      }
    } catch (err) {
      console.warn('[AdMob] showExportAd notice:', err);
      clearTimeout(fallbackTimer);
      if (onShowInAppAd) {
        onShowInAppAd();
      } else {
        finish();
      }
    }
  }

  /**
   * 4. Rewarded Video Ad (To unlock 1080p Export or Pro Video Filters)
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
        console.log('[AdMob Simulated] Rewarded Video watched:', config.rewardedId);
        onRewardGranted();
      }
    } catch (err) {
      console.warn('[AdMob] Rewarded ad fallback:', err);
      onRewardGranted();
    }
  }
}
