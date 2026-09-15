/**
 * Google AdMob Manager for CuteCut Pro Android / Capacitor & Web
 * Configured with User Credentials:
 * - Application ID: ca-app-pub-8898043565822840~4018462556
 * - Banner Ad ID: ca-app-pub-8898043565822840/1719602275
 * - Interstitial Ad ID: ca-app-pub-8898043565822840/6780357267
 * - Rewarded Ad ID: ca-app-pub-8898043565822840/5391253975
 */

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

// Official Google AdMob Test Unit IDs (Use during local dev to protect AdMob account)
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
    const win = window as any;
    return !!(win.Capacitor && win.Capacitor.isNativePlatform && win.Capacitor.isNativePlatform());
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
      const win = window as any;
      if (win.Capacitor?.Plugins?.AdMob) {
        await win.Capacitor.Plugins.AdMob.initialize({
          testingDevices: ['EMULATOR'],
          initializeForTesting: this.isTestingMode,
        });
        console.log('[AdMob] Native Android SDK initialized with App ID:', ADMOB_CREDENTIALS.appId);
      } else {
        console.log('[AdMob] Web / Mobile Ready with credentials');
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
      const win = window as any;

      if (win.Capacitor?.Plugins?.AdMob) {
        await win.Capacitor.Plugins.AdMob.showBanner({
          adId: config.bannerId,
          adSize: 'ADAPTIVE_BANNER',
          position: 'BOTTOM_CENTER',
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
      const win = window as any;
      if (win.Capacitor?.Plugins?.AdMob) {
        await win.Capacitor.Plugins.AdMob.hideBanner();
      }
    } catch (err) {
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
      const win = window as any;

      if (win.Capacitor?.Plugins?.AdMob) {
        await win.Capacitor.Plugins.AdMob.prepareInterstitial({
          adId: config.interstitialId,
          isTesting: this.isTestingMode,
        });
        await win.Capacitor.Plugins.AdMob.showInterstitial();
        console.log('[AdMob] Interstitial ad shown after export:', config.interstitialId);
      } else {
        console.log('[AdMob Simulated] Interstitial Ad triggered for export completion:', config.interstitialId);
      }
    } catch (err) {
      console.warn('[AdMob] Interstitial ad notice:', err);
    }
  }

  /**
   * 3. Rewarded Video Ad (To unlock 1080p Export or Pro Video Filters)
   */
  public static async showRewarded(onRewardGranted: () => void): Promise<void> {
    try {
      await this.initialize();
      const config = this.getActiveConfig();
      const win = window as any;

      if (win.Capacitor?.Plugins?.AdMob) {
        const listener = await win.Capacitor.Plugins.AdMob.addListener(
          'onRewarded',
          () => {
            console.log('[AdMob] Rewarded video completed! Unlocking Pro features.');
            onRewardGranted();
            if (listener && typeof listener.remove === 'function') {
              listener.remove();
            }
          }
        );

        await win.Capacitor.Plugins.AdMob.prepareRewardVideoAd({
          adId: config.rewardedId,
          isTesting: this.isTestingMode,
        });
        await win.Capacitor.Plugins.AdMob.showRewardVideoAd();
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
