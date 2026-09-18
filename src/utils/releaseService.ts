/**
 * Release Service
 * Dynamically fetches the latest GitHub Release data for CuteCut-Pro
 * to ensure all download buttons always point to the newest binaries.
 */

export interface ReleaseAsset {
  name: string;
  browser_download_url: string;
  size: number;
  content_type: string;
}

export interface ReleaseInfo {
  tagName: string;
  version: string;
  name: string;
  publishedAt: string;
  htmlUrl: string;
  assets: {
    windowsExe: string;
    macDmg: string;
    linuxAppImage: string;
    linuxDeb: string;
    androidApk?: string;
    flatpak?: string;
  };
}

const DEFAULT_TAG = 'v2.4.2';
const REPO_OWNER = 'MDIsmatullah';
const REPO_NAME = 'CuteCut-Pro';

export const fallbackReleaseInfo: ReleaseInfo = {
  tagName: DEFAULT_TAG,
  version: '2.4.2',
  name: 'CuteCut Pro V2.4.2',
  publishedAt: new Date().toISOString(),
  htmlUrl: `https://github.com/${REPO_OWNER}/${REPO_NAME}/releases/tag/${DEFAULT_TAG}`,
  assets: {
    windowsExe: `https://github.com/${REPO_OWNER}/${REPO_NAME}/releases/download/${DEFAULT_TAG}/CuteCut.Pro.Setup.2.4.2.exe`,
    macDmg: `https://github.com/${REPO_OWNER}/${REPO_NAME}/releases/download/${DEFAULT_TAG}/CuteCut.Pro-2.4.2-arm64.dmg`,
    linuxAppImage: `https://github.com/${REPO_OWNER}/${REPO_NAME}/releases/download/${DEFAULT_TAG}/CuteCut.Pro-2.4.2.AppImage`,
    linuxDeb: `https://github.com/${REPO_OWNER}/${REPO_NAME}/releases/download/${DEFAULT_TAG}/cutecut-pro_2.4.2_amd64.deb`,
    androidApk: `https://github.com/${REPO_OWNER}/${REPO_NAME}/releases/download/${DEFAULT_TAG}/CuteCut-Pro-v2.4.2.apk`,
    flatpak: `https://github.com/${REPO_OWNER}/${REPO_NAME}/releases/download/${DEFAULT_TAG}/org.guldasta.cutecutpro.flatpak`,
  }
};

let cachedRelease: ReleaseInfo | null = null;
let fetchPromise: Promise<ReleaseInfo> | null = null;

export async function fetchLatestRelease(): Promise<ReleaseInfo> {
  if (cachedRelease) return cachedRelease;
  if (fetchPromise) return fetchPromise;

  fetchPromise = (async () => {
    try {
      const res = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/releases/latest`, {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
        }
      });

      if (!res.ok) {
        console.warn(`[ReleaseService] GitHub API status: ${res.status}, using latest fallback`);
        return fallbackReleaseInfo;
      }

      const data = await res.json();
      const tagName: string = data.tag_name || DEFAULT_TAG;
      const cleanVer = tagName.replace(/^v/, '');
      const rawAssets: ReleaseAsset[] = data.assets || [];

      const findUrl = (predicate: (name: string) => boolean, defaultUrl: string) => {
        const found = rawAssets.find(a => predicate(a.name.toLowerCase()));
        return found ? found.browser_download_url : defaultUrl;
      };

      const baseDownload = `https://github.com/${REPO_OWNER}/${REPO_NAME}/releases/download/${tagName}`;

      const release: ReleaseInfo = {
        tagName,
        version: cleanVer,
        name: data.name || `CuteCut Pro ${tagName}`,
        publishedAt: data.published_at || new Date().toISOString(),
        htmlUrl: data.html_url || `https://github.com/${REPO_OWNER}/${REPO_NAME}/releases/tag/${tagName}`,
        assets: {
          windowsExe: findUrl(
            n => (n.endsWith('.exe') && !n.includes('blockmap')),
            `${baseDownload}/CuteCut.Pro.Setup.${cleanVer}.exe`
          ),
          macDmg: findUrl(
            n => n.endsWith('.dmg'),
            `${baseDownload}/CuteCut.Pro-${cleanVer}-arm64.dmg`
          ),
          linuxAppImage: findUrl(
            n => n.endsWith('.appimage'),
            `${baseDownload}/CuteCut.Pro-${cleanVer}.AppImage`
          ),
          linuxDeb: findUrl(
            n => n.endsWith('.deb'),
            `${baseDownload}/cutecut-pro_${cleanVer}_amd64.deb`
          ),
          androidApk: findUrl(
            n => n.endsWith('.apk') && !n.includes('debug'),
            `${baseDownload}/CuteCut-Pro-v${cleanVer}.apk`
          ),
          flatpak: findUrl(
            n => n.endsWith('.flatpak'),
            `${baseDownload}/org.guldasta.cutecutpro.flatpak`
          ),
        }
      };

      cachedRelease = release;
      return release;
    } catch (err) {
      console.warn('[ReleaseService] Failed to query latest release:', err);
      return fallbackReleaseInfo;
    }
  })();

  return fetchPromise;
}
