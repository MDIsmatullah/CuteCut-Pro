const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const png2icons = require('png2icons');

async function buildAllIcons() {
  const sourceImage = path.join(__dirname, '../src/assets/images/cutecut_app_icon_1787873470143.jpg');
  console.log('[ICON-BUILDER] Loading source image:', sourceImage);

  if (!fs.existsSync(sourceImage)) {
    throw new Error(`Source image not found: ${sourceImage}`);
  }

  // Ensure directories exist
  const dirs = [
    'build-resources',
    'build',
    'build/icons',
    'public',
    'src/assets',
    'assets',
    'src-tauri/icons'
  ];
  dirs.forEach(d => {
    if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
  });

  // Convert source to master 1024x1024 PNG without any white borders, crisp color
  const master1024 = await sharp(sourceImage)
    .resize(1024, 1024, { fit: 'cover' })
    .png({ compressionLevel: 9 })
    .toBuffer();

  const master512 = await sharp(sourceImage)
    .resize(512, 512, { fit: 'cover' })
    .png({ compressionLevel: 9 })
    .toBuffer();

  const master256 = await sharp(sourceImage)
    .resize(256, 256, { fit: 'cover' })
    .png({ compressionLevel: 9 })
    .toBuffer();

  // Generate all standard Linux / Electron / Web icon sizes
  const sizes = [1024, 512, 256, 128, 96, 72, 64, 48, 32, 24, 16];
  for (const s of sizes) {
    const buf = await sharp(sourceImage)
      .resize(s, s, { fit: 'cover' })
      .png({ compressionLevel: 9 })
      .toBuffer();

    fs.writeFileSync(`build-resources/${s}x${s}.png`, buf);
    if (s === 32 || s === 128 || s === 256 || s === 512) {
      fs.writeFileSync(`src-tauri/icons/${s}x${s}.png`, buf);
    }
  }

  fs.writeFileSync('build-resources/128x128@2x.png', master256);
  fs.writeFileSync('src-tauri/icons/128x128@2x.png', master256);

  // Write Master PNGs across all target paths for Linux AppImage, deb, snap, etc.
  const pngPaths = [
    'build-resources/icon.png',
    'build/icon.png',
    'build/icons/icon.png',
    'public/icon.png',
    'src/assets/icon.png',
    'assets/icon.png',
    'src-tauri/icons/icon.png',
    'icon.png'
  ];
  pngPaths.forEach(p => {
    fs.writeFileSync(p, master512);
  });

  // Windows .ico generation via png2icons
  console.log('[ICON-BUILDER] Generating multi-size Windows .ico...');
  const icoBuf = png2icons.createICO(master512, png2icons.BILINEAR, 0, false, true);
  if (icoBuf) {
    const icoPaths = [
      'build-resources/icon.ico',
      'build/icon.ico',
      'build/icons/icon.ico',
      'public/icon.ico',
      'src-tauri/icons/icon.ico',
      'icon.ico'
    ];
    icoPaths.forEach(p => fs.writeFileSync(p, icoBuf));
  }

  // macOS .icns generation via png2icons
  console.log('[ICON-BUILDER] Generating Apple macOS .icns...');
  const icnsBuf = png2icons.createICNS(master1024, png2icons.BILINEAR, 0);
  if (icnsBuf) {
    const icnsPaths = [
      'build-resources/icon.icns',
      'build/icon.icns',
      'build/icons/icon.icns',
      'public/icon.icns',
      'src-tauri/icons/icon.icns',
      'icon.icns'
    ];
    icnsPaths.forEach(p => fs.writeFileSync(p, icnsBuf));
  }

  console.log('[ICON-BUILDER] All installer icons (.deb, .AppImage, .snap, .dmg/macOS, .exe/Windows) updated successfully!');
}

buildAllIcons().catch(err => {
  console.error('[ICON-BUILDER] Error:', err);
  process.exit(1);
});
