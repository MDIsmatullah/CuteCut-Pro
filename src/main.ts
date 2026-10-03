import { app, BrowserWindow, session, ipcMain, dialog, safeStorage, shell } from 'electron';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import os from 'os';
import crypto from 'crypto';
import { spawn, execSync, ChildProcess } from 'child_process';

const resolvedFilename = __filename;
const resolvedDirname = __dirname;

// Network & Web Security bypasses for Quran API media access
app.commandLine.appendSwitch('disable-web-security');
app.commandLine.appendSwitch('allow-running-insecure-content');
app.commandLine.appendSwitch('ignore-certificate-errors');
app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required');

// Safe GPU acceleration & Linux sandboxing (avoids Linux X11/Wayland/Snap launch crashes & fixes audio)
if (process.platform === 'linux') {
  app.commandLine.appendSwitch('no-sandbox');
  app.commandLine.appendSwitch('disable-setuid-sandbox');
  app.commandLine.appendSwitch('disable-gpu-sandbox');
  app.commandLine.appendSwitch('disable-dev-shm-usage');
  app.commandLine.appendSwitch('ignore-gpu-blocklist');
  app.commandLine.appendSwitch('enable-gpu-rasterization');
  
  // Safe Audio & Video Configuration for Linux (.deb, Snap, AppImage, PulseAudio & PipeWire)
  app.commandLine.appendSwitch('disable-features', 'AudioServiceSandbox');
  app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required');
  app.commandLine.appendSwitch('try-supported-channel-layouts');

  // Fix ALSA configuration path and plugin path if running in Snap or constrained environment
  const possibleAlsaPaths = [
    process.env.SNAP ? path.join(process.env.SNAP, 'usr/share/alsa/alsa.conf') : '',
    '/snap/gnome-42-2204/current/usr/share/alsa/alsa.conf',
    '/snap/core22/current/usr/share/alsa/alsa.conf',
    '/snap/gnome-3-28-1804/current/usr/share/alsa/alsa.conf',
    '/snap/core18/current/usr/share/alsa/alsa.conf',
    '/usr/share/alsa/alsa.conf'
  ].filter(Boolean);

  for (const p of possibleAlsaPaths) {
    if (fs.existsSync(p)) {
      process.env.ALSA_CONFIG_PATH = p;
      process.env.ALSA_CONFIG_DIR = path.dirname(p);
      break;
    }
  }

  if (process.env.SNAP) {
    const alsaPluginPaths = [
      path.join(process.env.SNAP, 'usr/lib/x86_64-linux-gnu/alsa-lib'),
      '/snap/gnome-42-2204/current/usr/lib/x86_64-linux-gnu/alsa-lib',
      '/snap/core22/current/usr/lib/x86_64-linux-gnu/alsa-lib',
      '/usr/lib/x86_64-linux-gnu/alsa-lib'
    ].filter(p => fs.existsSync(p));
    if (alsaPluginPaths.length > 0) {
      process.env.ALSA_PLUGIN_DIR = alsaPluginPaths.join(':');
    }
  }

  const xdgRuntime = process.env.XDG_RUNTIME_DIR;
  const realUid = typeof process.getuid === 'function' ? process.getuid() : 1000;
  const snapName = process.env.SNAP_NAME || 'cutecut-pro';

  // Auto-connect PulseAudio and ALSA if in Snap
  if (process.env.SNAP) {
    // If running in Snap, prioritize user runtime directory or direct snap pulse path
    if (xdgRuntime && fs.existsSync(path.join(xdgRuntime, 'pulse/native'))) {
      process.env.PULSE_SERVER = `unix:${path.join(xdgRuntime, 'pulse/native')}`;
    }
  }

  // Handle PulseAudio cookie cleanly (avoid AppArmor permission denied in Snap)
  if (process.env.SNAP && process.env.SNAP_USER_DATA) {
    const snapCookie = path.join(process.env.SNAP_USER_DATA, '.config/pulse/cookie');
    if (fs.existsSync(snapCookie)) {
      process.env.PULSE_COOKIE = snapCookie;
    } else {
      delete process.env.PULSE_COOKIE;
    }
  }

  if (!process.env.PULSE_SERVER) {
    const pulsePaths = [
      xdgRuntime ? path.join(xdgRuntime, 'pulse/native') : '',
      `/run/user/${realUid}/snap.${snapName}/pulse/native`,
      `/run/user/${realUid}/snap.cutecut-pro/pulse/native`,
      xdgRuntime ? path.join(xdgRuntime, '../pulse/native') : '',
      `/run/user/${realUid}/pulse/native`,
      '/var/run/pulse/native'
    ].filter(Boolean);
    for (const p of pulsePaths) {
      if (fs.existsSync(p)) {
        process.env.PULSE_SERVER = `unix:${p}`;
        break;
      }
    }
  }

  if (!process.env.PIPEWIRE_RUNTIME_DIR) {
    const pipewirePaths = [
      xdgRuntime && fs.existsSync(path.join(xdgRuntime, 'pipewire-0')) ? xdgRuntime : '',
      fs.existsSync(`/run/user/${realUid}/snap.${snapName}/pipewire-0`) ? `/run/user/${realUid}/snap.${snapName}` : '',
      fs.existsSync(`/run/user/${realUid}/snap.cutecut-pro/pipewire-0`) ? `/run/user/${realUid}/snap.cutecut-pro` : '',
      xdgRuntime && fs.existsSync(path.join(xdgRuntime, '../pipewire-0')) ? path.join(xdgRuntime, '..') : '',
      fs.existsSync(`/run/user/${realUid}/pipewire-0`) ? `/run/user/${realUid}` : ''
    ].filter(Boolean);
    if (pipewirePaths[0]) {
      process.env.PIPEWIRE_RUNTIME_DIR = pipewirePaths[0];
    }
  }

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

  // Ensure window always opens maximized like a professional desktop studio
  mainWindow.maximize();

  mainWindow.once('ready-to-show', () => {
    if (mainWindow) {
      mainWindow.maximize();
      if (!mainWindow.isVisible()) {
        mainWindow.show();
      }
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

  mainWindow.webContents.on('before-input-event', (event, input) => {
    if (input.key === 'F12' || (input.control && input.shift && input.key.toLowerCase() === 'i')) {
      mainWindow?.webContents.toggleDevTools();
      event.preventDefault();
    }
  });

  mainWindow.webContents.on('did-fail-load', (_event, errorCode, errorDescription, validatedURL) => {
    console.error(`[Electron] Failed to load URL: ${validatedURL}, Error: ${errorDescription} (${errorCode})`);
  });

  const devUrl = process.env.VITE_DEV_SERVER_URL || 'http://localhost:3000';
  
  if (process.env.NODE_ENV === 'development' || process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(devUrl);
  } else {
    const entryHtml = resolveEntryHtml();
    mainWindow.loadFile(entryHtml).catch((err) => {
      console.warn(`[Electron] loadFile failed for ${entryHtml}, falling back to devUrl:`, err);
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
ipcMain.handle('show-open-dialog-folder', async () => {
  if (!mainWindow) return null;
  const result = await dialog.showOpenDialog(mainWindow, {
    title: 'Select Export Destination Folder',
    properties: ['openDirectory', 'createDirectory']
  });
  if (result.canceled || !result.filePaths || result.filePaths.length === 0) return null;
  return result.filePaths[0];
});

ipcMain.handle('open-folder-in-explorer', async (_event, targetPath: string) => {
  try {
    if (fs.existsSync(targetPath)) {
      const stats = fs.statSync(targetPath);
      if (stats.isDirectory()) {
        shell.openPath(targetPath);
      } else {
        shell.showItemInFolder(targetPath);
      }
      return { success: true };
    }
    return { success: false, error: 'Target path does not exist' };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
});

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
    const dir = path.dirname(filePath);
    await fs.promises.mkdir(dir, { recursive: true });
    await fs.promises.writeFile(filePath, nodeBuf);
    return { success: true, bytesWritten: nodeBuf.length, filePath };
  } catch (err: any) {
    console.error('[Electron IPC] Failed to write video to disk:', err);
    return { success: false, error: err.message };
  }
});

// ----------------------------------------------------
// Native C++ Multimedia Video Engine (CapCut & Filmora Architecture)
// ----------------------------------------------------
let activeFfmpegProcess: ChildProcess | null = null;

function findSystemFfmpeg(): string | null {
  const customPaths = [
    process.env.FFMPEG_PATH,
    process.env.SNAP ? path.join(process.env.SNAP, 'usr/bin/ffmpeg') : null,
    process.env.SNAP ? path.join(process.env.SNAP, 'bin/ffmpeg') : null,
    path.join(process.resourcesPath || '', 'ffmpeg'),
    path.join(process.resourcesPath || '', 'bin/ffmpeg'),
    path.join(process.resourcesPath || '', 'bin/ffmpeg.exe'),
    '/usr/bin/ffmpeg',
    '/usr/local/bin/ffmpeg',
    '/snap/bin/ffmpeg',
    'ffmpeg'
  ].filter(Boolean) as string[];

  for (const p of customPaths) {
    try {
      if (fs.existsSync(p)) return p;
    } catch {}
  }
  return 'ffmpeg';
}

let cachedGpuEncoders: { bestEncoder: string; encoders: string[]; hwaccel: string } | null = null;

function probeGpuHardwareEncoders(ffmpegPath: string) {
  if (cachedGpuEncoders) return cachedGpuEncoders;
  try {
    const output = execSync(`"${ffmpegPath}" -encoders`, { timeout: 3000, encoding: 'utf8' });
    const encoders: string[] = [];
    if (output.includes('h264_nvenc')) encoders.push('h264_nvenc');
    if (output.includes('hevc_nvenc')) encoders.push('hevc_nvenc');
    if (output.includes('h264_qsv')) encoders.push('h264_qsv');
    if (output.includes('h264_vaapi')) encoders.push('h264_vaapi');
    if (output.includes('h264_videotoolbox')) encoders.push('h264_videotoolbox');
    if (output.includes('libx264')) encoders.push('libx264');

    let bestEncoder = 'libx264';
    let hwaccel = 'none';

    if (process.platform === 'win32') {
      if (encoders.includes('h264_nvenc')) { bestEncoder = 'h264_nvenc'; hwaccel = 'cuda'; }
      else if (encoders.includes('h264_qsv')) { bestEncoder = 'h264_qsv'; hwaccel = 'qsv'; }
    } else if (process.platform === 'darwin') {
      if (encoders.includes('h264_videotoolbox')) { bestEncoder = 'h264_videotoolbox'; hwaccel = 'videotoolbox'; }
    } else if (process.platform === 'linux') {
      if (encoders.includes('h264_nvenc')) { bestEncoder = 'h264_nvenc'; hwaccel = 'cuda'; }
      else if (encoders.includes('h264_vaapi')) { bestEncoder = 'h264_vaapi'; hwaccel = 'vaapi'; }
    }

    cachedGpuEncoders = { bestEncoder, encoders, hwaccel };
    return cachedGpuEncoders;
  } catch (e) {
    cachedGpuEncoders = { bestEncoder: 'libx264', encoders: ['libx264'], hwaccel: 'none' };
    return cachedGpuEncoders;
  }
}

ipcMain.handle('native-engine:probe', async () => {
  const ffmpegPath = findSystemFfmpeg() || 'ffmpeg';
  const info = probeGpuHardwareEncoders(ffmpegPath);
  return {
    ready: true,
    engineName: 'CuteCut Pro Native C++ AVEngine (CapCut/Filmora Core)',
    ffmpegPath,
    bestEncoder: info.bestEncoder,
    hardwareEncoders: info.encoders,
    hwaccel: info.hwaccel,
    platform: process.platform,
    isOfflineReady: true
  };
});

ipcMain.handle('native-engine:cancel', async () => {
  if (activeFfmpegProcess) {
    try {
      activeFfmpegProcess.kill('SIGKILL');
    } catch {}
    activeFfmpegProcess = null;
    return { success: true };
  }
  return { success: false };
});

ipcMain.handle('native-engine:render-local-video', async (_event, {
  inputBuffer,
  outputFilePath,
  fps = 30,
  resolution = '1080p',
  bitrate = '16M',
  crf = 17
}: {
  inputBuffer: Uint8Array | number[];
  outputFilePath: string;
  fps?: number;
  resolution?: string;
  bitrate?: string;
  crf?: number;
}) => {
  const ffmpegPath = findSystemFfmpeg() || 'ffmpeg';
  const gpuInfo = probeGpuHardwareEncoders(ffmpegPath);
  const tempDir = os.tmpdir();
  const tempInput = path.join(tempDir, `cutecut_in_${Date.now()}_${Math.random().toString(36).substring(2, 6)}.raw`);
  
  await fs.promises.writeFile(tempInput, Buffer.from(inputBuffer));

  return new Promise((resolve) => {
    let bestCodec = gpuInfo.bestEncoder;
    const args: string[] = ['-y', '-nostats', '-loglevel', 'error', '-i', tempInput];

    if (bestCodec === 'h264_nvenc') {
      args.push(
        '-c:v', 'h264_nvenc',
        '-preset', 'p3',
        '-tune', 'hq',
        '-cq', String(crf || 18),
        '-b:v', bitrate || '28M',
        '-maxrate', '45M',
        '-bufsize', '60M',
        '-spatial-aq', '1',
        '-temporal-aq', '1',
        '-threads', '0'
      );
    } else if (bestCodec === 'h264_videotoolbox') {
      args.push(
        '-c:v', 'h264_videotoolbox',
        '-realtime', '0',
        '-b:v', bitrate || '28M',
        '-threads', '0'
      );
    } else if (bestCodec === 'h264_qsv') {
      args.push(
        '-c:v', 'h264_qsv',
        '-global_quality', String(crf || 18),
        '-preset', 'veryfast',
        '-look_ahead', '0',
        '-b:v', bitrate || '28M',
        '-threads', '0'
      );
    } else if (bestCodec === 'h264_vaapi') {
      args.push(
        '-c:v', 'h264_vaapi',
        '-b:v', bitrate || '28M',
        '-threads', '0'
      );
    } else {
      args.push(
        '-c:v', 'libx264',
        '-preset', 'veryfast',
        '-threads', '0',
        '-tune', 'fastdecode',
        '-crf', String(crf || 18),
        '-profile:v', 'high',
        '-level', '4.2'
      );
    }

    args.push(
      '-pix_fmt', 'yuv420p',
      '-r', String(fps),
      '-c:a', 'aac',
      '-b:a', '256k',
      '-ar', '44100',
      '-ac', '2',
      '-movflags', '+faststart',
      outputFilePath
    );

    console.log(`[Native C++ AVEngine] Executing offline GPU render with ${bestCodec}: ${outputFilePath}`);
    const proc = spawn(ffmpegPath, args);
    activeFfmpegProcess = proc;

    let errLog = '';
    proc.stderr.on('data', (d) => { errLog += d.toString(); });

    proc.on('close', async (code) => {
      activeFfmpegProcess = null;
      try { if (fs.existsSync(tempInput)) await fs.promises.unlink(tempInput); } catch {}

      if (code === 0 && fs.existsSync(outputFilePath) && fs.statSync(outputFilePath).size > 0) {
        const stats = fs.statSync(outputFilePath);
        resolve({
          success: true,
          outputFilePath,
          fileSizeMb: Math.round((stats.size / (1024 * 1024)) * 100) / 100,
          encoderUsed: bestCodec,
          hardwareAccelerated: bestCodec !== 'libx264'
        });
      } else {
        console.warn('[Native C++ AVEngine] Render error:', errLog);
        resolve({ success: false, error: errLog || `FFmpeg exited with code ${code}` });
      }
    });

    proc.on('error', (err) => {
      activeFfmpegProcess = null;
      try { if (fs.existsSync(tempInput)) fs.unlinkSync(tempInput); } catch {}
      resolve({ success: false, error: err.message });
    });
  });
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
