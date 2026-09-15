const fs = require('fs');
const path = require('path');

async function buildAllIcons() {
  const iconExists = fs.existsSync('build-resources/icon.png') && 
                     fs.existsSync('build-resources/icon.ico') && 
                     fs.existsSync('build-resources/icon.icns');

  let sharp;
  let png2icons;
  try {
    sharp = require('sharp');
    png2icons = require('png2icons');
  } catch (loadErr) {
    console.warn('[ICON-BUILDER] Warning: Native sharp or png2icons module not available for this platform architecture:', loadErr.message);
    if (iconExists) {
      console.log('[ICON-BUILDER] Pre-generated luxury icons exist in build-resources/. Skipping regeneration safely.');
      return;
    }
  }

  if (!sharp || !png2icons) {
    if (iconExists) {
      console.log('[ICON-BUILDER] Icons already present. Skipping icon generation.');
      return;
    }
    console.warn('[ICON-BUILDER] Could not generate new icons, but continuing build with existing files.');
    return;
  }

  const sourceImage = path.join(__dirname, '../src/assets/images/cutecut_premium_icon_1787874857899.jpg');
  console.log('[ICON-BUILDER] Loading luxury icon source:', sourceImage);

  if (!fs.existsSync(sourceImage)) {
    if (iconExists) {
      console.log('[ICON-BUILDER] Source image missing, but pre-built icons exist. Proceeding safely.');
      return;
    }
    console.warn(`[ICON-BUILDER] Source image not found: ${sourceImage}`);
    return;
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

  // Convert source to master 1024x1024 PNG without white border
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

  // Generate standard Linux / Electron / Web sizes
  const sizes = [1024, 512, 256, 128, 96, 72, 64, 48, 32, 24, 16];
  for (const s of sizes) {
    const buf = await sharp(sourceImage)
      .resize(s, s, { fit: 'cover' })
      .png({ compressionLevel: 9 })
      .toBuffer();

    fs.writeFileSync(`build-resources/${s}x${s}.png`, buf);
    fs.writeFileSync(`build/icons/${s}x${s}.png`, buf);
    if (s === 32 || s === 128 || s === 256 || s === 512) {
      fs.writeFileSync(`src-tauri/icons/${s}x${s}.png`, buf);
    }
  }

  fs.writeFileSync('build-resources/128x128@2x.png', master256);
  fs.writeFileSync('src-tauri/icons/128x128@2x.png', master256);

  // Write Master PNGs across all target paths
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
  pngPaths.forEach(p => fs.writeFileSync(p, master512));

  // Windows .ico generation
  console.log('[ICON-BUILDER] Generating multi-size Windows .ico...');
  const icoBuf = png2icons.createICO(master512, png2icons.BILINEAR, 0, false, true);
  if (icoBuf) {
    [
      'build-resources/icon.ico',
      'build/icon.ico',
      'build/icons/icon.ico',
      'public/icon.ico',
      'src-tauri/icons/icon.ico',
      'icon.ico'
    ].forEach(p => fs.writeFileSync(p, icoBuf));
  }

  // macOS .icns generation
  console.log('[ICON-BUILDER] Generating Apple macOS .icns...');
  const icnsBuf = png2icons.createICNS(master1024, png2icons.BILINEAR, 0);
  if (icnsBuf) {
    [
      'build-resources/icon.icns',
      'build/icon.icns',
      'build/icons/icon.icns',
      'public/icon.icns',
      'src-tauri/icons/icon.icns',
      'icon.icns'
    ].forEach(p => fs.writeFileSync(p, icnsBuf));
  }

  console.log('[ICON-BUILDER] All installer icons updated with the new luxury borderless emblem!');
}

buildAllIcons().catch(err => {
  console.warn('[ICON-BUILDER] Non-fatal icon build warning:', err.message);
  if (fs.existsSync('build-resources/icon.ico') && fs.existsSync('build-resources/icon.icns')) {
    console.log('[ICON-BUILDER] Pre-packaged icons exist. Continuing build successfully.');
    process.exit(0);
  }
  process.exit(0);
});
