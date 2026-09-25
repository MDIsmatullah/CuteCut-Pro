// CuteCut Pro License & AI Credits Management Service

export const GUMROAD_PURCHASE_URL = 'https://guldasta.gumroad.com/l/cutecut-pro';

const STORAGE_KEY_PRO_LICENSE = 'cutecut_pro_license_key';
const STORAGE_KEY_PRO_STATUS = 'cutecut_pro_is_activated';
const STORAGE_KEY_AI_CREDITS = 'cutecut_ai_video_credits';
const STORAGE_KEY_QURAN_CREDITS = 'cutecut_quran_visual_credits';
const STORAGE_KEY_CUSTOM_GEMINI_KEY = 'cutecut_custom_gemini_api_key';

const DEFAULT_FREE_AI_CREDITS = 0; // Strictly Paid - Pro License or Custom Gemini Key required!
const DEFAULT_FREE_QURAN_CREDITS = 0; // Strictly Paid - Pro License required!

export interface ProLicenseState {
  isPro: boolean;
  licenseKey: string | null;
  creditsRemaining: number;
  quranCreditsRemaining: number;
  customApiKey: string | null;
}

export class ProLicenseService {
  private static instance: ProLicenseService;

  private constructor() {
    // Reset free credits to 0 so all AI models require Pro License or BYOK
    const existingAi = localStorage.getItem(STORAGE_KEY_AI_CREDITS);
    if (existingAi === null || parseInt(existingAi, 10) > 0) {
      localStorage.setItem(STORAGE_KEY_AI_CREDITS, '0');
    }

    // Reset Quran Visual credits to 0
    const existingQuran = localStorage.getItem(STORAGE_KEY_QURAN_CREDITS);
    if (existingQuran === null || parseInt(existingQuran, 10) > 0) {
      localStorage.setItem(STORAGE_KEY_QURAN_CREDITS, '0');
    }
  }

  public static getInstance(): ProLicenseService {
    if (!ProLicenseService.instance) {
      ProLicenseService.instance = new ProLicenseService();
    }
    return ProLicenseService.instance;
  }

  public getState(): ProLicenseState {
    const isPro = localStorage.getItem(STORAGE_KEY_PRO_STATUS) === 'true';
    const licenseKey = localStorage.getItem(STORAGE_KEY_PRO_LICENSE);
    const creditsRemaining = parseInt(localStorage.getItem(STORAGE_KEY_AI_CREDITS) || '0', 10);
    const quranCreditsRemaining = parseInt(localStorage.getItem(STORAGE_KEY_QURAN_CREDITS) || '0', 10);
    const customApiKey = localStorage.getItem(STORAGE_KEY_CUSTOM_GEMINI_KEY) || localStorage.getItem('user_gemini_api_key');

    return {
      isPro,
      licenseKey,
      creditsRemaining: isNaN(creditsRemaining) ? 0 : creditsRemaining,
      quranCreditsRemaining: isNaN(quranCreditsRemaining) ? 0 : quranCreditsRemaining,
      customApiKey,
    };
  }

  public hasAccess(): boolean {
    const state = this.getState();
    if (state.isPro) return true;
    if (state.customApiKey && state.customApiKey.trim().length > 10) return true;
    return state.creditsRemaining > 0;
  }

  public hasQuranAccess(): boolean {
    const state = this.getState();
    if (state.isPro) return true;
    if (state.customApiKey && state.customApiKey.trim().length > 10) return true;
    return state.quranCreditsRemaining > 0;
  }

  public consumeCredit(): { success: boolean; isPro: boolean; remainingCredits: number } {
    const state = this.getState();
    if (state.isPro || (state.customApiKey && state.customApiKey.trim().length > 10)) {
      return { success: true, isPro: true, remainingCredits: 999 };
    }

    if (state.creditsRemaining > 0) {
      const newCredits = state.creditsRemaining - 1;
      localStorage.setItem(STORAGE_KEY_AI_CREDITS, String(newCredits));
      return { success: true, isPro: false, remainingCredits: newCredits };
    }

    return { success: false, isPro: false, remainingCredits: 0 };
  }

  public consumeQuranCredit(): { success: boolean; isPro: boolean; remainingCredits: number } {
    const state = this.getState();
    if (state.isPro || (state.customApiKey && state.customApiKey.trim().length > 10)) {
      return { success: true, isPro: true, remainingCredits: 999 };
    }

    if (state.quranCreditsRemaining > 0) {
      const newCredits = state.quranCreditsRemaining - 1;
      localStorage.setItem(STORAGE_KEY_QURAN_CREDITS, String(newCredits));
      return { success: true, isPro: false, remainingCredits: newCredits };
    }

    return { success: false, isPro: false, remainingCredits: 0 };
  }

  public addCredits(count: number): number {
    const current = this.getState().creditsRemaining;
    const updated = current + count;
    localStorage.setItem(STORAGE_KEY_AI_CREDITS, String(updated));
    return updated;
  }

  public activateLicense(key: string): { success: boolean; message: string } {
    const cleaned = key.trim().toUpperCase();
    if (!cleaned) {
      return { success: false, message: 'Please enter a valid license key.' };
    }

    // Accept valid format licenses (e.g. CUTECUT-PRO-XXXX, CCPRO-XXXX, or any 8+ character license code)
    if (cleaned.length >= 8) {
      localStorage.setItem(STORAGE_KEY_PRO_STATUS, 'true');
      localStorage.setItem(STORAGE_KEY_PRO_LICENSE, cleaned);
      return { success: true, message: '🎉 CuteCut Pro Lifetime License successfully activated!' };
    }

    return { success: false, message: 'Invalid license key format. Please check your purchase receipt.' };
  }

  public setCustomApiKey(apiKey: string): void {
    if (apiKey.trim()) {
      localStorage.setItem(STORAGE_KEY_CUSTOM_GEMINI_KEY, apiKey.trim());
      localStorage.setItem('user_gemini_api_key', apiKey.trim());
    } else {
      localStorage.removeItem(STORAGE_KEY_CUSTOM_GEMINI_KEY);
      localStorage.removeItem('user_gemini_api_key');
    }
  }

  public resetToFree(): void {
    localStorage.removeItem(STORAGE_KEY_PRO_STATUS);
    localStorage.removeItem(STORAGE_KEY_PRO_LICENSE);
  }
}
