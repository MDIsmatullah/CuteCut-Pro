const fs = require('fs');
const path = require('path');

const targetPath = path.join(__dirname, '../node_modules/app-builder-lib/out/targets/snap/coreLegacy.js');

if (!fs.existsSync(targetPath)) {
  console.log('coreLegacy.js not found, skipping patch.');
  process.exit(0);
}

let content = fs.readFileSync(targetPath, 'utf8');

// The launcher shell script to be returned by buildCommandShContent
const customScriptLines = [
  '#!/bin/bash',
  'export LD_LIBRARY_PATH="$SNAP:$SNAP/usr/lib/x86_64-linux-gnu:$SNAP/lib/x86_64-linux-gnu:$SNAP/usr/lib/x86_64-linux-gnu/pulseaudio:$SNAP/usr/lib/x86_64-linux-gnu/alsa-lib:$SNAP/usr/lib/x86_64-linux-gnu/nss:$SNAP/lib/x86_64-linux-gnu/nss:$SNAP/nss:/snap/gnome-42-2204/current/usr/lib/x86_64-linux-gnu:/snap/gnome-42-2204/current/usr/lib:/snap/gnome-42-2204/current/lib/x86_64-linux-gnu:/snap/gnome-42-2204/current/lib:/snap/core22/current/usr/lib/x86_64-linux-gnu:/snap/core22/current/lib/x86_64-linux-gnu:${LD_LIBRARY_PATH:-}"',
  'export PATH="/snap/gnome-42-2204/current/usr/bin:$SNAP/bin:$SNAP/usr/bin:$PATH"',
  'export XDG_DATA_DIRS="/snap/gnome-42-2204/current/usr/share:$SNAP/usr/share:${XDG_DATA_DIRS:-/usr/local/share:/usr/share}"',
  'export GSETTINGS_SCHEMA_DIR="/snap/gnome-42-2204/current/usr/share/glib-2.0/schemas:$SNAP/usr/share/glib-2.0/schemas:/usr/share/glib-2.0/schemas:${GSETTINGS_SCHEMA_DIR:-}"',
  'export GTK_PATH="/snap/gnome-42-2204/current/usr/lib/x86_64-linux-gnu/gtk-3.0"',
  'export GIO_MODULE_DIR="/snap/gnome-42-2204/current/usr/lib/x86_64-linux-gnu/gio/modules"',
  'REAL_UID=$(id -u 2>/dev/null || echo 1000)',
  'mkdir -p "$SNAP_USER_DATA/.config/pulse" 2>/dev/null || true',
  'if [ -r "$SNAP_USER_DATA/.config/pulse/cookie" ]; then',
  '  export PULSE_COOKIE="$SNAP_USER_DATA/.config/pulse/cookie"',
  'else',
  '  unset PULSE_COOKIE',
  'fi',
  'if [ -n "$XDG_RUNTIME_DIR" ] && [ -S "$XDG_RUNTIME_DIR/pulse/native" ]; then',
  '  export PULSE_SERVER="unix:$XDG_RUNTIME_DIR/pulse/native"',
  'elif [ -n "$SNAP_NAME" ] && [ -S "/run/user/$REAL_UID/snap.$SNAP_NAME/pulse/native" ]; then',
  '  export PULSE_SERVER="unix:/run/user/$REAL_UID/snap.$SNAP_NAME/pulse/native"',
  'elif [ -S "/run/user/$REAL_UID/snap.cutecut-pro/pulse/native" ]; then',
  '  export PULSE_SERVER="unix:/run/user/$REAL_UID/snap.cutecut-pro/pulse/native"',
  'elif [ -n "$XDG_RUNTIME_DIR" ] && [ -S "$XDG_RUNTIME_DIR/../pulse/native" ]; then',
  '  export PULSE_SERVER="unix:$XDG_RUNTIME_DIR/../pulse/native"',
  'elif [ -S "/run/user/$REAL_UID/pulse/native" ]; then',
  '  export PULSE_SERVER="unix:/run/user/$REAL_UID/pulse/native"',
  'elif [ -S "/var/run/pulse/native" ]; then',
  '  export PULSE_SERVER="unix:/var/run/pulse/native"',
  'fi',
  'if [ -n "$XDG_RUNTIME_DIR" ] && [ -S "$XDG_RUNTIME_DIR/pipewire-0" ]; then',
  '  export PIPEWIRE_RUNTIME_DIR="$XDG_RUNTIME_DIR"',
  'elif [ -n "$SNAP_NAME" ] && [ -S "/run/user/$REAL_UID/snap.$SNAP_NAME/pipewire-0" ]; then',
  '  export PIPEWIRE_RUNTIME_DIR="/run/user/$REAL_UID/snap.$SNAP_NAME"',
  'elif [ -S "/run/user/$REAL_UID/snap.cutecut-pro/pipewire-0" ]; then',
  '  export PIPEWIRE_RUNTIME_DIR="/run/user/$REAL_UID/snap.cutecut-pro"',
  'elif [ -n "$XDG_RUNTIME_DIR" ] && [ -S "$XDG_RUNTIME_DIR/../pipewire-0" ]; then',
  '  export PIPEWIRE_RUNTIME_DIR="$XDG_RUNTIME_DIR/.."',
  'elif [ -S "/run/user/$REAL_UID/pipewire-0" ]; then',
  '  export PIPEWIRE_RUNTIME_DIR="/run/user/$REAL_UID"',
  'fi',
  'export ALSA_PLUGIN_DIR="$SNAP/usr/lib/x86_64-linux-gnu/alsa-lib:/snap/gnome-42-2204/current/usr/lib/x86_64-linux-gnu/alsa-lib:/snap/core22/current/usr/lib/x86_64-linux-gnu/alsa-lib:/usr/lib/x86_64-linux-gnu/alsa-lib"',
  'if [ -f "$SNAP/usr/share/alsa/alsa.conf" ]; then',
  '  export ALSA_CONFIG_PATH="$SNAP/usr/share/alsa/alsa.conf"',
  '  export ALSA_CONFIG_DIR="$SNAP/usr/share/alsa"',
  'elif [ -f "/snap/gnome-42-2204/current/usr/share/alsa/alsa.conf" ]; then',
  '  export ALSA_CONFIG_PATH="/snap/gnome-42-2204/current/usr/share/alsa/alsa.conf"',
  '  export ALSA_CONFIG_DIR="/snap/gnome-42-2204/current/usr/share/alsa"',
  'elif [ -f "/snap/core22/current/usr/share/alsa/alsa.conf" ]; then',
  '  export ALSA_CONFIG_PATH="/snap/core22/current/usr/share/alsa/alsa.conf"',
  '  export ALSA_CONFIG_DIR="/snap/core22/current/usr/share/alsa"',
  'elif [ -f "/usr/share/alsa/alsa.conf" ]; then',
  '  export ALSA_CONFIG_PATH="/usr/share/alsa/alsa.conf"',
  '  export ALSA_CONFIG_DIR="/usr/share/alsa"',
  'fi',
  'printf "pcm.!default {\\n  type pulse\\n  fallback \\"sysdefault\\"\\n}\\nctl.!default {\\n  type pulse\\n  fallback \\"sysdefault\\"\\n}\\n" > "$SNAP_USER_DATA/.asoundrc" 2>/dev/null || true',
  'if [ -n "$WAYLAND_DISPLAY" ] && [ -e "$XDG_RUNTIME_DIR/$WAYLAND_DISPLAY" ]; then',
  '  PLATFORM_FLAGS="--ozone-platform-hint=auto"',
  'else',
  '  unset WAYLAND_DISPLAY',
  '  export GDK_BACKEND="x11"',
  '  PLATFORM_FLAGS="--ozone-platform=x11"',
  'fi',
  'exec "$SNAP/cutecut-pro" --no-sandbox --disable-dev-shm-usage --disable-gpu-vsync --disable-features=AudioServiceSandbox --autoplay-policy=no-user-gesture-required --try-supported-channel-layouts $PLATFORM_FLAGS "$@"',
  ''
].join('\\n');

// 1. Replace buildCommandShContent function cleanly with JSON stringified content
const targetFunc = 'function buildCommandShContent(opts) {';
if (content.includes(targetFunc)) {
  const index = content.indexOf(targetFunc);
  const prefix = content.substring(0, index);
  const newFunc = `function buildCommandShContent(opts) {
    return ${JSON.stringify(customScriptLines)};
}
//# sourceMappingURL=coreLegacy.js.map`;
  content = prefix + newFunc;
  console.log('Successfully replaced buildCommandShContent in coreLegacy.js.');
}

// 2. Patch snap subcommand to pack for modern snapcraft (v8+)
if (content.includes('const snapArgs = ["snap"')) {
  content = content.replace('const snapArgs = ["snap"', 'const snapArgs = ["pack"');
  console.log('Successfully patched snap subcommand to pack in coreLegacy.js.');
}

// 3. Force destructive mode so snapcraft doesn't require LXD
if (content.includes('const isDestructiveMode = process.env.SNAP_DESTRUCTIVE_MODE === "true";')) {
  content = content.replace('const isDestructiveMode = process.env.SNAP_DESTRUCTIVE_MODE === "true";', 'const isDestructiveMode = true;');
  console.log('Successfully forced destructive mode in coreLegacy.js.');
}

fs.writeFileSync(targetPath, content, 'utf8');
console.log('Successfully patched coreLegacy.js.');
