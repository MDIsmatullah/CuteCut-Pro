const fs = require('fs');
const path = require('path');

const targetPath = path.join(__dirname, '../node_modules/app-builder-lib/out/targets/snap/coreLegacy.js');

if (!fs.existsSync(targetPath)) {
  console.log('coreLegacy.js not found, skipping patch.');
  process.exit(0);
}

let content = fs.readFileSync(targetPath, 'utf8');

// 1. Patch buildWithTemplate to write clean command.sh with GNOME runtime paths and stage critical libraries
const templateTarget = 'const templateDir = await (0, electronGet_1.downloadBuilderToolset)({ releaseName, filenameWithExt, checksums, githubOrgRepo: "electron-userland/electron-builder-binaries" });';
const templatePatch = `const launcherScript = '#!/bin/bash\\n' +
          'export LD_LIBRARY_PATH="$SNAP:$SNAP/usr/lib/x86_64-linux-gnu:$SNAP/lib/x86_64-linux-gnu:$SNAP/usr/lib/x86_64-linux-gnu/pulseaudio:$SNAP/usr/lib/x86_64-linux-gnu/alsa-lib:$SNAP/usr/lib/x86_64-linux-gnu/nss:$SNAP/lib/x86_64-linux-gnu/nss:$SNAP/nss:/snap/gnome-42-2204/current/usr/lib/x86_64-linux-gnu:/snap/gnome-42-2204/current/usr/lib:/snap/gnome-42-2204/current/lib/x86_64-linux-gnu:/snap/gnome-42-2204/current/lib:/snap/core22/current/usr/lib/x86_64-linux-gnu:/snap/core22/current/lib/x86_64-linux-gnu:\${LD_LIBRARY_PATH:-}"\\n' +
          'export PATH="/snap/gnome-42-2204/current/usr/bin:$SNAP/bin:$SNAP/usr/bin:\$PATH"\\n' +
          'export XDG_DATA_DIRS="/snap/gnome-42-2204/current/usr/share:$SNAP/usr/share:\${XDG_DATA_DIRS:-/usr/local/share:/usr/share}"\\n' +
          'export GSETTINGS_SCHEMA_DIR="/snap/gnome-42-2204/current/usr/share/glib-2.0/schemas:$SNAP/usr/share/glib-2.0/schemas:/usr/share/glib-2.0/schemas:\${GSETTINGS_SCHEMA_DIR:-}"\\n' +
          'export GTK_PATH="/snap/gnome-42-2204/current/usr/lib/x86_64-linux-gnu/gtk-3.0"\\n' +
          'export GIO_MODULE_DIR="/snap/gnome-42-2204/current/usr/lib/x86_64-linux-gnu/gio/modules"\\n' +
          'REAL_UID=$(id -u 2>/dev/null || echo 1000)\\n' +
          'if [ -e "/run/user/$REAL_UID/pulse/native" ]; then\\n' +
          '  export PULSE_SERVER="unix:/run/user/$REAL_UID/pulse/native"\\n' +
          'elif [ -n "$XDG_RUNTIME_DIR" ] && [ -e "$XDG_RUNTIME_DIR/pulse/native" ]; then\\n' +
          '  export PULSE_SERVER="unix:$XDG_RUNTIME_DIR/pulse/native"\\n' +
          'elif [ -n "$XDG_RUNTIME_DIR" ] && [ -e "$XDG_RUNTIME_DIR/../pulse/native" ]; then\\n' +
          '  export PULSE_SERVER="unix:$XDG_RUNTIME_DIR/../pulse/native"\\n' +
          'fi\\n' +
          'if [ -e "/run/user/$REAL_UID/pipewire-0" ]; then\\n' +
          '  export PIPEWIRE_RUNTIME_DIR="/run/user/$REAL_UID"\\n' +
          'elif [ -n "$XDG_RUNTIME_DIR" ] && [ -e "$XDG_RUNTIME_DIR/pipewire-0" ]; then\\n' +
          '  export PIPEWIRE_RUNTIME_DIR="$XDG_RUNTIME_DIR"\\n' +
          'fi\\n' +
          'if [ -d "/snap/gnome-42-2204/current/usr/share/alsa" ]; then\\n' +
          '  export ALSA_CONFIG_PATH="/snap/gnome-42-2204/current/usr/share/alsa/alsa.conf"\\n' +
          'elif [ -f "/usr/share/alsa/alsa.conf" ]; then\\n' +
          '  export ALSA_CONFIG_PATH="/usr/share/alsa/alsa.conf"\\n' +
          'fi\\n' +
          'if [ -n "$WAYLAND_DISPLAY" ] && [ -e "$XDG_RUNTIME_DIR/$WAYLAND_DISPLAY" ]; then\\n' +
          '  PLATFORM_FLAGS="--ozone-platform-hint=auto"\\n' +
          'else\\n' +
          '  unset WAYLAND_DISPLAY\\n' +
          '  export GDK_BACKEND="x11"\\n' +
          '  PLATFORM_FLAGS="--ozone-platform=x11"\\n' +
          'fi\\n' +
          'exec "$SNAP/cutecut-pro" --no-sandbox --disable-dev-shm-usage --disable-features=AudioServiceSandbox,AudioServiceOutOfProcess $PLATFORM_FLAGS "$@"\\n';
        await (0, promises_1.writeFile)(path.join(templateDir, "command.sh"), launcherScript, { mode: 0o755 });
        const fsSync = require('fs');
        const pathSync = require('path');
        const sysLibDirs = [
          '/usr/lib/x86_64-linux-gnu',
          '/usr/lib/x86_64-linux-gnu/pulseaudio',
          '/usr/lib/x86_64-linux-gnu/alsa-lib',
          '/usr/lib/x86_64-linux-gnu/nss',
          '/lib/x86_64-linux-gnu',
          '/lib/x86_64-linux-gnu/nss',
          '/usr/lib',
          '/usr/lib/nss',
          '/lib'
        ];
        const prefixes = [
          'libnspr4', 'libplc4', 'libplds4',
          'libnss3', 'libnssutil3', 'libsmime3', 'libsoftokn3', 'libfreebl3', 'libfreeblpriv3', 'libnssdbm3', 'libnssckbi',
          'libatk-1.0', 'libatk-bridge', 'libatspi',
          'libcanberra',
          'libgtk-3', 'libgdk-3', 'libepoxy',
          'libcairo', 'libpixman-1',
          'libpango', 'libpangocairo', 'libpangoft2', 'libharfbuzz',
          'libfribidi', 'libthai', 'libdatrie', 'libgraphite2',
          'libwayland', 'libGL', 'libEGL', 'libGLES',
          'libgdk_pixbuf', 'libgio', 'libglib', 'libgobject', 'libgmodule',
          'libfontconfig', 'libfreetype',
          'libdrm', 'libgbm', 'libasound', 'libcups',
          'libpulse', 'libpipewire', 'libspa',
          'libavahi-common', 'libavahi-client', 'libgnutls',
          'libxkbcommon', 'libdbus-1',
          'libX', 'libx', 'libxcb', 'libexpat', 'libuuid', 'libbsd', 'libmd', 'libsecret',
          'libjpeg', 'libpng', 'libtiff', 'libwebp', 'libjbig', 'libdeflate', 'libopenjp2', 'liblcms2',
          'libz', 'liblzma', 'libzstd', 'liblz4', 'libsystemd', 'libcap', 'libgcrypt', 'libgpg-error',
          'libvorbis', 'libogg', 'libopus', 'libvpx', 'libva'
        ];
        for (const sDir of sysLibDirs) {
          if (fsSync.existsSync(sDir)) {
            try {
              for (const file of fsSync.readdirSync(sDir)) {
                if (prefixes.some(p => file.startsWith(p))) {
                  const sPath = pathSync.join(sDir, file);
                  const dPath = pathSync.join(appOutDir, file);
                  if (fsSync.statSync(sPath).isFile() && !fsSync.existsSync(dPath)) {
                    fsSync.copyFileSync(sPath, dPath);
                  }
                }
              }
            } catch (_) {}
          }
        }`;

if (!content.includes(templatePatch) && content.includes(templateTarget)) {
  content = content.replace(templateTarget, templateTarget + '\n        ' + templatePatch);
}

// 2. Patch buildCommandShContent
const targetFunc = 'function buildCommandShContent(opts) {';
if (content.includes(targetFunc)) {
  const index = content.indexOf(targetFunc);
  const prefix = content.substring(0, index);
  const newFunc = `function buildCommandShContent(opts) {
    return '#!/bin/bash\\n' +
      'export LD_LIBRARY_PATH="$SNAP:$SNAP/usr/lib/x86_64-linux-gnu:$SNAP/lib/x86_64-linux-gnu:$SNAP/usr/lib/x86_64-linux-gnu/pulseaudio:$SNAP/usr/lib/x86_64-linux-gnu/alsa-lib:$SNAP/usr/lib/x86_64-linux-gnu/nss:$SNAP/lib/x86_64-linux-gnu/nss:$SNAP/nss:/snap/gnome-42-2204/current/usr/lib/x86_64-linux-gnu:/snap/gnome-42-2204/current/usr/lib:/snap/gnome-42-2204/current/lib/x86_64-linux-gnu:/snap/gnome-42-2204/current/lib:/snap/core22/current/usr/lib/x86_64-linux-gnu:/snap/core22/current/lib/x86_64-linux-gnu:\${LD_LIBRARY_PATH:-}"\\n' +
      'export PATH="/snap/gnome-42-2204/current/usr/bin:$SNAP/bin:$SNAP/usr/bin:\$PATH"\\n' +
      'export XDG_DATA_DIRS="/snap/gnome-42-2204/current/usr/share:$SNAP/usr/share:\${XDG_DATA_DIRS:-/usr/local/share:/usr/share}"\\n' +
      'export GSETTINGS_SCHEMA_DIR="/snap/gnome-42-2204/current/usr/share/glib-2.0/schemas:$SNAP/usr/share/glib-2.0/schemas:/usr/share/glib-2.0/schemas:\${GSETTINGS_SCHEMA_DIR:-}"\\n' +
      'export GTK_PATH="/snap/gnome-42-2204/current/usr/lib/x86_64-linux-gnu/gtk-3.0"\\n' +
      'export GIO_MODULE_DIR="/snap/gnome-42-2204/current/usr/lib/x86_64-linux-gnu/gio/modules"\\n' +
      'REAL_UID=$(id -u 2>/dev/null || echo 1000)\\n' +
      'if [ -e "/run/user/$REAL_UID/pulse/native" ]; then\\n' +
      '  export PULSE_SERVER="unix:/run/user/$REAL_UID/pulse/native"\\n' +
      'elif [ -n "$XDG_RUNTIME_DIR" ] && [ -e "$XDG_RUNTIME_DIR/pulse/native" ]; then\\n' +
      '  export PULSE_SERVER="unix:$XDG_RUNTIME_DIR/pulse/native"\\n' +
      'elif [ -n "$XDG_RUNTIME_DIR" ] && [ -e "$XDG_RUNTIME_DIR/../pulse/native" ]; then\\n' +
      '  export PULSE_SERVER="unix:$XDG_RUNTIME_DIR/../pulse/native"\\n' +
      'fi\\n' +
      'if [ -e "/run/user/$REAL_UID/pipewire-0" ]; then\\n' +
      '  export PIPEWIRE_RUNTIME_DIR="/run/user/$REAL_UID"\\n' +
      'elif [ -n "$XDG_RUNTIME_DIR" ] && [ -e "$XDG_RUNTIME_DIR/pipewire-0" ]; then\\n' +
      '  export PIPEWIRE_RUNTIME_DIR="$XDG_RUNTIME_DIR"\\n' +
      'fi\\n' +
      'if [ -d "/snap/gnome-42-2204/current/usr/share/alsa" ]; then\\n' +
      '  export ALSA_CONFIG_PATH="/snap/gnome-42-2204/current/usr/share/alsa/alsa.conf"\\n' +
      'elif [ -f "/usr/share/alsa/alsa.conf" ]; then\\n' +
      '  export ALSA_CONFIG_PATH="/usr/share/alsa/alsa.conf"\\n' +
      'fi\\n' +
      'if [ -n "$WAYLAND_DISPLAY" ] && [ -e "$XDG_RUNTIME_DIR/$WAYLAND_DISPLAY" ]; then\\n' +
      '  PLATFORM_FLAGS="--ozone-platform-hint=auto"\\n' +
      'else\\n' +
      '  unset WAYLAND_DISPLAY\\n' +
      '  export GDK_BACKEND="x11"\\n' +
      '  PLATFORM_FLAGS="--ozone-platform=x11"\\n' +
      'fi\\n' +
      'exec "$SNAP/cutecut-pro" --no-sandbox --disable-dev-shm-usage --disable-features=AudioServiceSandbox,AudioServiceOutOfProcess $PLATFORM_FLAGS "$@"\\n';
}
//# sourceMappingURL=coreLegacy.js.map`;
  content = prefix + newFunc;
  console.log('Successfully patched buildCommandShContent in coreLegacy.js.');
} else {
  console.warn('Warning: Could not find function buildCommandShContent to patch.');
}

// 3. Patch snap subcommand to pack for modern snapcraft (v8+)
if (content.includes('const snapArgs = ["snap"')) {
  content = content.replace('const snapArgs = ["snap"', 'const snapArgs = ["pack"');
  console.log('Successfully patched snap subcommand to pack in coreLegacy.js.');
}

// 4. Force destructive mode so snapcraft doesn't require LXD
if (content.includes('const isDestructiveMode = process.env.SNAP_DESTRUCTIVE_MODE === "true";')) {
  content = content.replace('const isDestructiveMode = process.env.SNAP_DESTRUCTIVE_MODE === "true";', 'const isDestructiveMode = true;');
  console.log('Successfully forced destructive mode in coreLegacy.js.');
}

// 5. Enable reliable template app build for snap
const templateCondition = 'this.isUseTemplateApp = this.options.useTemplateApp !== false && (arch === builder_util_1.Arch.x64 || arch === builder_util_1.Arch.armv7l) && buildPackages.length === 0 && stageMatchesDefaults;';
if (content.includes(templateCondition)) {
  content = content.replace(templateCondition, 'this.isUseTemplateApp = this.options.useTemplateApp !== false && (arch === builder_util_1.Arch.x64 || arch === builder_util_1.Arch.armv7l);');
  console.log('Successfully enabled template app build in coreLegacy.js.');
}

fs.writeFileSync(targetPath, content, 'utf8');
console.log('Successfully patched coreLegacy.js for self-contained snap launcher.');
