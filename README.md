<div align="center">

# 🎬 CUTECUT PRO
### The Next-Gen Desktop Video Editor & Islamic Media Studio

[![Get it from the Snap Store](https://snapcraft.io/static/images/badges/en/snap-store-black.svg)](https://snapcraft.io/cutecut-pro)
[![Snap Status](https://snapcraft.io/cutecut-pro/badge.svg)](https://snapcraft.io/cutecut-pro)
[![Release](https://img.shields.io/github/v/release/MDIsmatullah/CuteCut-Pro?color=blue&logo=github)](https://github.com/MDIsmatullah/CuteCut-Pro/releases)
[![License: Non-Commercial](https://img.shields.io/badge/License-Non--Commercial%20%2F%20No--Sale-red.svg)](LICENSE)
[![Platform](https://img.shields.io/badge/Platform-Linux%20%7C%20Windows%20%7C%20Web-orange)](https://github.com/MDIsmatullah/CuteCut-Pro)

**A professional, offline-first multitrack video editing suite with real-time FFmpeg processing, dynamic audio waveforms, and dedicated Quran scripture synchronization.**

</div>

---

## 📥 Installation Guide

### 🐧 1. Linux Installation (Snap Store - Recommended)

Install with a single command on Ubuntu, Debian, Fedora, Manjaro, Arch Linux, Linux Mint, and all snap-supported distributions:

```bash
# Install stable release from Snap Store
sudo snap install cutecut-pro

# (Optional) For testing edge/nightly builds
sudo snap install cutecut-pro --edge
```

#### Connect Necessary Hardware Permissions:
```bash
# Allow audio capture & microphone
sudo snap connect cutecut-pro:audio-record

# Allow hardware camera access
sudo snap connect cutecut-pro:camera

# Allow removable storage / USB access (optional)
sudo snap connect cutecut-pro:removable-media
```

---

### 📦 2. Linux Debian / Ubuntu (.deb Package)

Download the latest `.deb` file from [GitHub Releases](https://github.com/MDIsmatullah/CuteCut-Pro/releases/latest):

```bash
# Download the latest .deb installer
wget https://github.com/MDIsmatullah/CuteCut-Pro/releases/download/v2.4.1/cutecut-pro_2.4.1_amd64.deb

# Install the package
sudo dpkg -i cutecut-pro_2.4.1_amd64.deb

# Fix any missing dependencies if prompted
sudo apt-get install -f
```

---

### 🚀 3. Universal Linux AppImage (No Installation Required)

Download and run directly on any Linux distribution without root privileges:

```bash
# Download latest AppImage
wget https://github.com/MDIsmatullah/CuteCut-Pro/releases/download/v2.4.1/CUTECUT.PRO-2.4.1.AppImage

# Make it executable
chmod +x CUTECUT.PRO-2.4.1.AppImage

# Run CUTECUT PRO
./CUTECUT.PRO-2.4.1.AppImage
```

---

### 🪟 4. Windows Installation (.exe)

1. Go to [Latest GitHub Releases](https://github.com/MDIsmatullah/CuteCut-Pro/releases/latest).
2. Download `CUTECUT.PRO.Setup.2.4.1.exe` (Installer) or `CUTECUT-PRO-2.4.1-win-portable.zip` (Portable).
3. Double-click the installer and launch CUTECUT PRO from your Start Menu.

---

### 💻 5. Build and Run from Source (Developers)

```bash
# Clone the repository
git clone https://github.com/MDIsmatullah/CuteCut-Pro.git

# Navigate into project directory
cd CuteCut-Pro

# Install dependencies
npm install

# Start the interactive development server
npm run dev

# Build production desktop installers
npm run dist:all
```

---

## 🔄 Updating & Uninstallation

### To Update:
```bash
# Update Snap package to the latest version
sudo snap refresh cutecut-pro
```

### To Uninstall:
```bash
# Uninstall Snap package
sudo snap remove cutecut-pro

# Or uninstall Debian package (.deb)
sudo apt remove cutecut-pro
```

---

## 🛒 Official Pro License (Gumroad)
To unlock full lifetime features, 4K rendering capabilities, and the complete Quran AI Studio module:  
👉 **[Get CuteCut Pro Lifetime License on Gumroad](https://8327535504967.gumroad.com/l/cutecut-pro)**

---

## ✨ Key Features & Capabilities
- **Multitrack Timeline:** Layer video, audio, text overlays, keyframes, dynamic transitions, and speed curves.
- **Quran AI & Micro-Sync:** Arabic Uthmani typography with Urdu & English synchronized verse alignment.
- **5 Dynamic Audio Visualizers:** Real-time audio waveform spectrum generation for podcasts and recitations.
- **Cinematic Filters & FX:** Chroma key (Green Screen), VHS Retro, Glitch, Vignette, and Color Grading.
- **Hardware-Accelerated Engine:** GPU-optimized rendering supporting 1080p and high-bitrate 4K 60 FPS exports.
- **Offline & Private:** 100% in-browser / on-device FFmpeg & WebCodecs rendering with zero cloud dependency.

---

## 🤝 Support & Community
- **Official Website:** [CuteCutPro.com](https://cutecutpro.com)
- **Bug Reports & Feature Requests:** [GitHub Issues](https://github.com/MDIsmatullah/CuteCut-Pro/issues)
- **Snap Store Listing:** [snapcraft.io/cutecut-pro](https://snapcraft.io/cutecut-pro)
- **AppImageHub Catalog:** [AppImageHub](https://appimage.github.io)
- **Email:** `aasmatallah@gmail.com`

---

## 📜 License & Usage Policy
CuteCut Pro is **Source-Available under a Strict Non-Commercial License** (Copyright © 2026 Asmatullah Developer).
- ✅ **Permitted:** Anyone may clone, study, inspect, fork, and use this software for **personal and educational non-commercial purposes**.
- ❌ **Strictly Prohibited:** Selling, reselling, sublicensing, repackaging for paid distribution, or commercially monetizing this codebase or its binaries without express written authorization from the Author.
- See full terms in the [LICENSE](LICENSE) file.

---

## 🔍 Search & SEO Keywords

CuteCut Pro is a lightweight, high-performance **desktop video editor**, **CapCut alternative**, and **Filmora alternative** engineered for Linux (Ubuntu, Debian, Fedora, Arch), Windows 10/11, macOS, and Web browsers.

### Key Discovery Categories:
* **Video Editing:** `video-editor-linux`, `capcut-for-pc`, `filmora-alternative`, `free-video-editor`, `multi-track-timeline`, `4k-video-editor`, `60fps-video-renderer`, `chroma-key-editor`.
* **Quran & Islamic Media:** `quran-video-maker`, `quran-ayah-sync`, `islamic-reels-generator`, `uthmani-quran-calligraphy`, `automated-quran-subtitles`, `audio-waveform-visualizer`.
* **Cross-Platform Formats:** `appimage-video-editor`, `snapcraft-video-editor`, `flatpak-video-editor`, `windows-exe-video-editor`, `pwa-video-editor`.
