import { UserProfile } from '../components/AuthModal';

export interface GoogleDriveUser {
  email: string;
  name: string;
  picture?: string;
  quotaUsed?: number;
  quotaLimit?: number;
}

export interface GoogleDriveTokens {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  created_at: number;
}

const CLIENT_ID = '447393315446-u9m01qo1inee3vbkgtdi19t7fic2aun6.apps.googleusercontent.com';

export class GoogleDriveService {
  private static instance: GoogleDriveService;
  private tokens: GoogleDriveTokens | null = null;
  private user: GoogleDriveUser | null = null;
  private onStateChangeCallbacks: ((connected: boolean) => void)[] = [];

  private constructor() {
    this.init();
  }

  public static getInstance(): GoogleDriveService {
    if (!GoogleDriveService.instance) {
      GoogleDriveService.instance = new GoogleDriveService();
    }
    return GoogleDriveService.instance;
  }

  private isElectron(): boolean {
    return typeof window !== 'undefined' && (
      !!(window as any).process?.versions?.electron || 
      /electron/i.test(navigator.userAgent) || 
      !!(window as any).ipcRenderer ||
      !!(window as any).require
    );
  }

  private getElectron() {
    if (this.isElectron() && (window as any).require) {
      return (window as any).require('electron');
    }
    return null;
  }

  private async init() {
    if (this.isElectron()) {
      const electron = this.getElectron();
      if (electron && electron.ipcRenderer) {
        // Load initial tokens if saved securely in main process
        try {
          const stored = await electron.ipcRenderer.invoke('auth:get-stored-tokens');
          if (stored) {
            this.tokens = stored.tokens;
            this.user = {
              email: stored.userProfile.email,
              name: stored.userProfile.name,
              picture: stored.userProfile.picture
            };
            this.notifyStateChange();
            // Fetch fresh quota details in background
            this.fetchQuotaDetails().catch(() => {});
          }
        } catch (err) {
          console.error('[GoogleDriveService] Failed to load stored Electron tokens:', err);
        }

        // Listen for successful login deep-link events from Electron Main Process
        electron.ipcRenderer.on('auth:google-login-success', (_event: any, data: any) => {
          console.log('[GoogleDriveService] Received Google Login success from main process');
          this.tokens = data.tokens;
          this.user = {
            email: data.userProfile.email,
            name: data.userProfile.name,
            picture: data.userProfile.picture
          };
          this.notifyStateChange();
          this.fetchQuotaDetails().catch(() => {});
        });
      }
    } else {
      // Web browser context: Fallback to localStorage
      try {
        const storedTokens = localStorage.getItem('google_drive_tokens');
        const storedUser = localStorage.getItem('google_drive_user');
        if (storedTokens && storedUser) {
          this.tokens = JSON.parse(storedTokens);
          this.user = JSON.parse(storedUser);
          this.notifyStateChange();
          this.fetchQuotaDetails().catch(() => {});
        }
      } catch (err) {
        console.error('[GoogleDriveService] Failed to load local web tokens:', err);
      }
    }
  }

  public registerStateChange(callback: (connected: boolean) => void) {
    this.onStateChangeCallbacks.push(callback);
    callback(this.isConnected());
  }

  public unregisterStateChange(callback: (connected: boolean) => void) {
    this.onStateChangeCallbacks = this.onStateChangeCallbacks.filter(cb => cb !== callback);
  }

  private notifyStateChange() {
    const connected = this.isConnected();
    this.onStateChangeCallbacks.forEach(cb => cb(connected));
  }

  public isConnected(): boolean {
    return !!this.tokens && !!this.user;
  }

  public getConnectedUser(): GoogleDriveUser | null {
    return this.user;
  }

  /**
   * Generates a web fallback URL for standard browser popup authentication.
   */
  public async getWebAuthUrl(): Promise<string> {
    const redirectUri = `${window.location.origin}/auth-callback`;
    const scopes = [
      'openid',
      'email',
      'profile',
      'https://www.googleapis.com/auth/drive.appdata',
      'https://www.googleapis.com/auth/drive.file'
    ].join(' ');

    const params = new URLSearchParams({
      client_id: CLIENT_ID,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: scopes,
      access_type: 'offline',
      prompt: 'consent'
    });

    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }

  /**
   * Initiates Google OAuth Login Flow.
   * Leverages Electron external browser custom-protocol linking,
   * or Web-based OAuth popup as a sandbox fallback.
   */
  public async connect(): Promise<boolean> {
    if (this.isElectron()) {
      const electron = this.getElectron();
      if (electron && electron.ipcRenderer) {
        try {
          await electron.ipcRenderer.invoke('auth:google-login');
          return true;
        } catch (err) {
          console.error('[GoogleDriveService] Electron OAuth trigger failed:', err);
          return false;
        }
      }
    }

    // Web Fallback (AI Studio preview embedded context)
    return new Promise<boolean>(async (resolve) => {
      try {
        const authUrl = await this.getWebAuthUrl();
        const popup = window.open(
          authUrl,
          'google_drive_oauth_popup',
          'width=600,height=700,status=no,toolbar=no,menubar=no'
        );

        if (!popup) {
          alert('Please allow popups to connect your Google Drive account.');
          resolve(false);
          return;
        }

        const handleMessage = (event: MessageEvent) => {
          if (event.data?.type === 'GOOGLE_DRIVE_AUTH_SUCCESS') {
            const { tokens, userProfile } = event.data.payload;
            
            this.tokens = tokens;
            this.user = {
              email: userProfile.email,
              name: userProfile.name,
              picture: userProfile.picture
            };

            localStorage.setItem('google_drive_tokens', JSON.stringify(tokens));
            localStorage.setItem('google_drive_user', JSON.stringify(userProfile));
            
            this.notifyStateChange();
            this.fetchQuotaDetails().catch(() => {});
            
            window.removeEventListener('message', handleMessage);
            resolve(true);
          }
        };

        window.addEventListener('message', handleMessage);
      } catch (err) {
        console.error('[GoogleDriveService] Web OAuth trigger failed:', err);
        resolve(false);
      }
    });
  }

  /**
   * Disconnects Google Account and wipes credentials securely.
   */
  public async disconnect() {
    this.tokens = null;
    this.user = null;

    if (this.isElectron()) {
      const electron = this.getElectron();
      if (electron && electron.ipcRenderer) {
        await electron.ipcRenderer.invoke('auth:clear-stored-tokens');
      }
    } else {
      localStorage.removeItem('google_drive_tokens');
      localStorage.removeItem('google_drive_user');
    }

    this.notifyStateChange();
  }

  /**
   * Guarantees a valid access token. Background refreshes using the refresh_token if expired.
   */
  public async getAccessToken(): Promise<string | null> {
    if (!this.tokens) return null;

    const EXPIRY_BUFFER_MS = 5 * 60 * 1000; // 5 mins buffer
    const expiresAt = (this.tokens.created_at || Date.now()) + (this.tokens.expires_in * 1000);
    const isExpired = Date.now() + EXPIRY_BUFFER_MS > expiresAt;

    if (!isExpired) {
      return this.tokens.access_token;
    }

    // Attempt token refresh
    if (!this.tokens.refresh_token) {
      console.warn('[GoogleDriveService] Token expired and no refresh_token found.');
      return null;
    }

    try {
      console.log('[GoogleDriveService] Access token expired. Triggering background refresh...');
      const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: CLIENT_ID,
          refresh_token: this.tokens.refresh_token,
          grant_type: 'refresh_token'
        }).toString()
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Refresh token endpoint returned status ${response.status}: ${text}`);
      }

      const fresh = await response.json();
      
      this.tokens = {
        ...this.tokens,
        access_token: fresh.access_token,
        expires_in: fresh.expires_in,
        created_at: Date.now()
      };

      if (this.isElectron()) {
        const electron = this.getElectron();
        if (electron && electron.ipcRenderer) {
          // Tell main process to save updated tokens
          await electron.ipcRenderer.invoke('auth:save-tokens', {
            tokens: this.tokens,
            userProfile: {
              email: this.user?.email,
              name: this.user?.name,
              picture: this.user?.picture
            }
          });
        }
      } else {
        localStorage.setItem('google_drive_tokens', JSON.stringify(this.tokens));
      }

      console.log('[GoogleDriveService] Access token refreshed successfully.');
      return this.tokens.access_token;
    } catch (err) {
      console.error('[GoogleDriveService] Failed to background-refresh access token:', err);
      return null;
    }
  }

  /**
   * Fetches the user profile details and storage quota info from Google Drive.
   */
  public async fetchQuotaDetails(): Promise<GoogleDriveUser | null> {
    const token = await this.getAccessToken();
    if (!token) return null;

    try {
      const response = await fetch('https://www.googleapis.com/drive/v3/about?fields=user,storageQuota', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch Google Drive status: ${response.statusText}`);
      }

      const details = await response.json();
      
      if (this.user) {
        this.user = {
          ...this.user,
          quotaUsed: parseInt(details.storageQuota.usage || '0', 10),
          quotaLimit: parseInt(details.storageQuota.limit || '0', 10),
          name: details.user.displayName || this.user.name,
          picture: details.user.photoLink || this.user.picture
        };

        if (!this.isElectron()) {
          localStorage.setItem('google_drive_user', JSON.stringify(this.user));
        }
        
        this.notifyStateChange();
      }

      return this.user;
    } catch (err) {
      console.error('[GoogleDriveService] Quota retrieval failed:', err);
      return this.user;
    }
  }

  /**
   * Uploads binary or text data directly to the user's personal Google Drive.
   * Works on a fully streams-safe binary Blob layout.
   */
  public async uploadVideoToDrive(
    fileName: string,
    fileBlob: Blob,
    onProgress?: (progress: number) => void
  ): Promise<{ success: boolean; fileId?: string; fileUrl?: string; error?: string }> {
    const token = await this.getAccessToken();
    if (!token) {
      return { success: false, error: 'Google Drive is disconnected. Connect to upload.' };
    }

    try {
      console.log(`[GoogleDriveService] Commencing drive upload of file: ${fileName} (${fileBlob.size} bytes)`);
      
      const fileMetadata = {
        name: fileName,
        mimeType: fileBlob.type || 'video/mp4',
        description: 'Exported from CuteCut Pro Desktop Video Editor'
      };

      const boundary = 'cutecut_multipart_boundary';
      const delimiterBlob = new Blob([`\r\n--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n`], { type: 'text/plain' });
      const metadataBlob = new Blob([JSON.stringify(fileMetadata)], { type: 'application/json' });
      const mediaDelimiterBlob = new Blob([`\r\n--${boundary}\r\nContent-Type: ${fileBlob.type || 'video/mp4'}\r\n\r\n`], { type: 'text/plain' });
      const closeDelimiterBlob = new Blob([`\r\n--${boundary}--`], { type: 'text/plain' });

      // Build safe binary multipart body Blob
      const multipartBody = new Blob([
        delimiterBlob,
        metadataBlob,
        mediaDelimiterBlob,
        fileBlob,
        closeDelimiterBlob
      ], { type: `multipart/related; boundary=${boundary}` });

      const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': `multipart/related; boundary=${boundary}`
        },
        body: multipartBody
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Google API returned status ${response.status}: ${errorText}`);
      }

      const resJson = await response.json();
      console.log(`[GoogleDriveService] Successfully uploaded. Google File ID: ${resJson.id}`);

      if (onProgress) {
        onProgress(100);
      }

      return {
        success: true,
        fileId: resJson.id,
        fileUrl: `https://drive.google.com/file/d/${resJson.id}/view`
      };
    } catch (err: any) {
      console.error('[GoogleDriveService] Upload failed:', err);
      return { success: false, error: err.message || 'Google Drive upload failed.' };
    }
  }

  /**
   * Backs up project/app configuration schemas inside the safe user's App Data Folder.
   */
  public async syncConfigToAppData(
    configName: string,
    jsonData: any
  ): Promise<{ success: boolean; fileId?: string; error?: string }> {
    const token = await this.getAccessToken();
    if (!token) return { success: false, error: 'Not authenticated.' };

    try {
      const metadata = {
        name: configName,
        parents: ['appDataFolder'],
        mimeType: 'application/json'
      };

      const jsonBlob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
      const boundary = 'cutecut_appdata_boundary';
      
      const delimiterBlob = new Blob([`\r\n--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n`], { type: 'text/plain' });
      const metadataBlob = new Blob([JSON.stringify(metadata)], { type: 'application/json' });
      const mediaDelimiterBlob = new Blob([`\r\n--${boundary}\r\nContent-Type: application/json\r\n\r\n`], { type: 'text/plain' });
      const closeDelimiterBlob = new Blob([`\r\n--${boundary}--`], { type: 'text/plain' });

      const multipartBody = new Blob([
        delimiterBlob,
        metadataBlob,
        mediaDelimiterBlob,
        jsonBlob,
        closeDelimiterBlob
      ], { type: `multipart/related; boundary=${boundary}` });

      const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': `multipart/related; boundary=${boundary}`
        },
        body: multipartBody
      });

      if (!response.ok) {
        throw new Error(`Google API returned status ${response.status}`);
      }

      const resJson = await response.json();
      return { success: true, fileId: resJson.id };
    } catch (err: any) {
      console.error('[GoogleDriveService] App Data sync failed:', err);
      return { success: false, error: err.message };
    }
  }
}
