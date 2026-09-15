import { app, BrowserWindow, session, ipcMain, dialog, safeStorage, shell } from 'electron';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import os from 'os';
import crypto from 'crypto';

const resolvedFilename = __filename;
const resolvedDirname = __dirname;

// Network & Web Security bypasses for Quran API media access
app.commandLine.appendSwitch('disable-web-security');
app.commandLine.appendSwitch('allow-running-insecure-content');
app.commandLine.appendSwitch('ignore-certificate-errors');
app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required');

// Safe GPU acceleration & Linux sandboxing (avoids Linux X11/Wayland/Snap launch crashes)
if (process.platform === 'linux') {
  app.commandLine.appendSwitch('no-sandbox');
  app.commandLine.appendSwitch('disable-setuid-sandbox');
  app.commandLine.appendSwitch('disable-gpu-sandbox');
  app.commandLine.appendSwitch('disable-dev-shm-usage');
  app.commandLine.appendSwitch('ignore-gpu-blocklist');
  app.commandLine.appendSwitch('enable-gpu-rasterization');
  app.commandLine.appendSwitch('disable-features', 'AudioServiceSandbox');
  app.commandLine.appendSwitch('alsa-output-device', 'default');

  const xdgRuntime = process.env.XDG_RUNTIME_DIR;
  const waylandDisplay = process.env.WAYLAND_DISPLAY;
  const isWaylandAvailable = !!(xdgRuntime && waylandDisplay && fs.existsSync(path.join(xdgRuntime, waylandDisplay)));

  if (isWaylandAvailable) {
    app.commandLine.appendSwitch('enable-features', 'VaapiVideoDecoder,UseOzonePlatform');
    app.commandLine.appendSwitch('ozone-platform-hint', 'auto');
  } else {
    app.commandLine.appendSwitch('ozone-platform', 'x11');
  }
} else {
  app.commandLine.appendSwitch('enable-gpu-rasterization');
  app.commandLine.appendSwitch('ignore-gpu-blocklist');
}

let mainWindow: BrowserWindow | null = null;
let oauthSession: { codeVerifier: string; state: string } | null = null;

// Register custom protocol scheme cutecutpro://
if (process.defaultApp) {
  if (process.argv.length >= 2) {
    app.setAsDefaultProtocolClient('cutecutpro', process.execPath, [path.resolve(process.argv[1])]);
  }
} else {
  app.setAsDefaultProtocolClient('cutecutpro');
}

// Token Encryption/Decryption Helpers
function encryptToken(token: string): string {
  try {
    if (safeStorage && safeStorage.isEncryptionAvailable()) {
      return safeStorage.encryptString(token).toString('base64');
    }
  } catch (e) {
    console.warn('[safeStorage] Encryption failed, falling back to base64 encoding:', e);
  }
  return Buffer.from(token).toString('base64');
}

function decryptToken(encrypted: string): string {
  try {
    if (safeStorage && safeStorage.isEncryptionAvailable()) {
      return safeStorage.decryptString(Buffer.from(encrypted, 'base64'));
    }
  } catch (e) {
    console.warn('[safeStorage] Decryption failed, falling back to base64 decoding:', e);
  }
  return Buffer.from(encrypted, 'base64').toString('utf-8');
}

function getTokensFilePath(): string {
  return path.join(app.getPath('userData'), 'secure-drive-tokens.json');
}

function saveSecureTokens(data: any) {
  try {
    const filePath = getTokensFilePath();
    const encryptedData = {
      tokens: {
        access_token: encryptToken(data.tokens.access_token),
        refresh_token: data.tokens.refresh_token ? encryptToken(data.tokens.refresh_token) : undefined,
        expires_in: data.tokens.expires_in,
        token_type: data.tokens.token_type,
        created_at: data.tokens.created_at || Date.now()
      },
      userProfile: data.userProfile
    };
    fs.writeFileSync(filePath, JSON.stringify(encryptedData, null, 2), 'utf-8');
  } catch (err) {
    console.error('[Electron Storage] Failed to save secure tokens:', err);
  }
}

function getSecureTokens() {
  try {
    const filePath = getTokensFilePath();
    if (!fs.existsSync(filePath)) return null;
    const raw = fs.readFileSync(filePath, 'utf-8');
    const encryptedData = JSON.parse(raw);
    
    return {
      tokens: {
        access_token: decryptToken(encryptedData.tokens.access_token),
        refresh_token: encryptedData.tokens.refresh_token ? decryptToken(encryptedData.tokens.refresh_token) : undefined,
        expires_in: encryptedData.tokens.expires_in,
        token_type: encryptedData.tokens.token_type,
        created_at: encryptedData.tokens.created_at
      },
      userProfile: encryptedData.userProfile
    };
  } catch (err) {
    console.error('[Electron Storage] Failed to load secure tokens:', err);
    return null;
  }
}

function clearSecureTokens() {
  try {
    const filePath = getTokensFilePath();
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (err) {
    console.error('[Electron Storage] Failed to clear secure tokens:', err);
  }
}

async function handleDeepLink(urlStr: string) {
  try {
    console.log('[Electron DeepLink] Captured OAuth redirect:', urlStr);
    
    // Parse protocol URL format (e.g. cutecutpro://auth-callback?code=xxx&state=yyy)
    const urlClean = urlStr.replace('cutecutpro://', 'http://localhost/');
    const parsedUrl = new URL(urlClean);
    const code = parsedUrl.searchParams.get('code');
    const state = parsedUrl.searchParams.get('state');

    if (!code) {
      console.warn('[Electron DeepLink] Redirect url did not contain authorization code.');
      return;
    }

    if (oauthSession && state && state !== oauthSession.state) {
      console.error('[Electron DeepLink] Anti-CSRF state verification failed!');
      return;
    }

    const codeVerifier = oauthSession?.codeVerifier || '';
    const client_id = process.env.GOOGLE_CLIENT_ID || '447393315446-u9m01qo1inee3vbkgtdi19t7fic2aun6.apps.googleusercontent.com';
    const client_secret = process.env.GOOGLE_CLIENT_SECRET || '';

    console.log('[Electron DeepLink] Commencing PKCE Google Token Exchange...');

    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id,
        client_secret,
        redirect_uri: 'cutecutpro://auth-callback',
        grant_type: 'authorization_code',
        code_verifier: codeVerifier
      }).toString()
    });

    if (!tokenRes.ok) {
      const errText = await tokenRes.text();
      throw new Error(`Google exchange error: ${errText}`);
    }

    const tokens = await tokenRes.json();

    // Fetch user details
    const userRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { 'Authorization': `Bearer ${tokens.access_token}` }
    });
    const userProfile = await userRes.json();

    const storedData = { tokens, userProfile };
    saveSecureTokens(storedData);

    if (mainWindow) {
      mainWindow.webContents.send('auth:google-login-success', storedData);
    }
  } catch (err: any) {
    console.error('[Electron DeepLink] OAuth pipeline crashed:', err);
    if (mainWindow) {
      mainWindow.webContents.send('auth:google-login-error', { error: err.message });
    }
  }
}

function resolveEntryHtml(): string {
  const appPath = app.getAppPath();
  const candidates = [
    path.join(appPath, 'dist', 'index.html'),
    path.join(appPath, 'index.html'),
    path.join(resolvedDirname, '../dist/index.html'),
    path.join(resolvedDirname, 'index.html'),
    path.join(process.cwd(), 'dist', 'index.html'),
    path.join(process.cwd(), 'index.html')
  ];

  for (const candidate of candidates) {
    if (candidate && fs.existsSync(candidate)) {
      return candidate;
    }
  }
  return path.join(appPath, 'dist', 'index.html');
}

function createWindow() {
  const iconCandidates = [
    path.join(app.getAppPath(), 'public', process.platform === 'win32' ? 'icon.ico' : 'icon.png'),
    path.join(app.getAppPath(), 'build-resources', process.platform === 'win32' ? 'icon.ico' : 'icon.png'),
    path.join(app.getAppPath(), process.platform === 'win32' ? 'icon.ico' : 'icon.png'),
    path.join(process.cwd(), 'public', process.platform === 'win32' ? 'icon.ico' : 'icon.png'),
    path.join(process.cwd(), 'build-resources', process.platform === 'win32' ? 'icon.ico' : 'icon.png'),
    path.join(process.cwd(), process.platform === 'win32' ? 'icon.ico' : 'icon.png'),
    path.join(app.getAppPath(), 'public', 'icon.png'),
    path.join(app.getAppPath(), 'icon.png')
  ];
  const windowIcon = iconCandidates.find(p => fs.existsSync(p));

  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    title: 'CuteCut Pro',
    icon: windowIcon,
    backgroundColor: '#0a0a12',
    show: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false,
      allowRunningInsecureContent: true,
    },
  });

  mainWindow.once('ready-to-show', () => {
    if (mainWindow && !mainWindow.isVisible()) {
      mainWindow.show();
    }
  });

  // Comprehensive CORS & Network Bypass Rules for quran.com and external cloud streams
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    const responseHeaders = { ...details.responseHeaders };
    
    responseHeaders['access-control-allow-origin'] = ['*'];
    responseHeaders['Access-Control-Allow-Origin'] = ['*'];
    responseHeaders['access-control-allow-methods'] = ['GET, POST, OPTIONS, PUT, DELETE'];
    responseHeaders['Access-Control-Allow-Methods'] = ['GET, POST, OPTIONS, PUT, DELETE'];
    responseHeaders['access-control-allow-headers'] = ['*'];
    responseHeaders['Access-Control-Allow-Headers'] = ['*'];

    callback({
      responseHeaders,
    });
  });

  const devUrl = process.env.VITE_DEV_SERVER_URL || 'http://localhost:3000';
  
  if (process.env.NODE_ENV === 'development' || process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(devUrl);
  } else {
    const entryHtml = resolveEntryHtml();
    mainWindow.loadFile(entryHtml).catch(() => {
      mainWindow?.loadURL(devUrl);
    });
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// System Hardware Info IPC Handler
ipcMain.handle('get-system-hardware-info', async () => {
  return {
    cpus: os.cpus().length,
    totalMemoryGb: Math.round((os.totalmem() / (1024 * 1024 * 1024)) * 10) / 10,
    freeMemoryGb: Math.round((os.freemem() / (1024 * 1024 * 1024)) * 10) / 10,
    platform: process.platform,
    arch: process.arch,
    electronVersion: process.versions.electron,
    chromeVersion: process.versions.chrome
  };
});

// Register Native File Save IPC Handlers
ipcMain.handle('show-save-video-dialog', async (_event, defaultFilename: string) => {
  if (!mainWindow) return null;
  const ext = defaultFilename.endsWith('.mp4') ? 'mp4' : 'webm';
  const result = await dialog.showSaveDialog(mainWindow, {
    title: 'Save Exported Video',
    defaultPath: defaultFilename,
    filters: [
      { name: 'Video Files', extensions: [ext, 'webm', 'mp4'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  });
  if (result.canceled || !result.filePath) return null;
  return result.filePath;
});

ipcMain.handle('save-video-buffer-to-disk', async (_event, { filePath, buffer }: { filePath: string; buffer: Uint8Array | number[] }) => {
  try {
    const nodeBuf = Buffer.from(buffer);
    if (nodeBuf.length === 0) {
      throw new Error('Received 0 bytes buffer - aborted write');
    }
    await fs.promises.writeFile(filePath, nodeBuf);
    return { success: true, bytesWritten: nodeBuf.length, filePath };
  } catch (err: any) {
    console.error('[Electron IPC] Failed to write video to disk:', err);
    return { success: false, error: err.message };
  }
});

// Register Secure Google Drive Auth IPC Handlers
ipcMain.handle('auth:google-login', async () => {
  const codeVerifier = crypto.randomBytes(32).toString('base64url');
  const codeChallenge = crypto.createHash('sha256').update(codeVerifier).digest('base64url');
  const state = crypto.randomBytes(16).toString('hex');

  oauthSession = { codeVerifier, state };

  const client_id = process.env.GOOGLE_CLIENT_ID || '447393315446-u9m01qo1inee3vbkgtdi19t7fic2aun6.apps.googleusercontent.com';
  const redirect_uri = 'cutecutpro://auth-callback';
  const scopes = [
    'openid',
    'email',
    'profile',
    'https://www.googleapis.com/auth/drive.appdata',
    'https://www.googleapis.com/auth/drive.file'
  ].join(' ');

  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` + new URLSearchParams({
    client_id,
    redirect_uri,
    response_type: 'code',
    scope: scopes,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
    state,
    access_type: 'offline',
    prompt: 'consent'
  }).toString();

  shell.openExternal(authUrl);
  return { success: true };
});

ipcMain.handle('auth:get-stored-tokens', async () => {
  return getSecureTokens();
});

ipcMain.handle('auth:save-tokens', async (_event, data: any) => {
  saveSecureTokens(data);
  return { success: true };
});

ipcMain.handle('auth:clear-stored-tokens', async () => {
  clearSecureTokens();
  return { success: true };
});

// Lock Single Instance and capture deep links
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', (_event, commandLine) => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
    const url = commandLine.find(arg => arg.startsWith('cutecutpro://'));
    if (url) {
      handleDeepLink(url);
    }
  });

  app.on('open-url', (event, url) => {
    event.preventDefault();
    handleDeepLink(url);
  });

  app.whenReady().then(() => {
    createWindow();

    // Check if app was opened with a protocol deep link (Windows/Linux)
    const initialUrl = process.argv.find(arg => arg.startsWith('cutecutpro://'));
    if (initialUrl) {
      setTimeout(() => {
        handleDeepLink(initialUrl);
      }, 1500);
    }

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
      }
    });
  });
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
