#!/bin/bash
set -e

# CUTECUT PRO Linux Auto-Audio & Universal Output Router (Speaker / Headphone / Bluetooth)
export SNAP_DESKTOP_RUNTIME="${SNAP:-/snap/cutecut-pro/current}"

# 1. Automatic PulseAudio / PipeWire Socket Detection (Disabled: Let snap's desktop-launch auto-configure safe sandboxed socket)
# if [ -z "$PULSE_SERVER" ]; then
#   if [ -S "$XDG_RUNTIME_DIR/pulse/native" ]; then
#     export PULSE_SERVER="unix:$XDG_RUNTIME_DIR/pulse/native"
#   elif [ -S "/run/user/$(id -u)/pulse/native" ]; then
#     export PULSE_SERVER="unix:/run/user/$(id -u)/pulse/native"
#   elif [ -n "$SNAP_NAME" ] && [ -S "$XDG_RUNTIME_DIR/snap.$SNAP_NAME/pulse/native" ]; then
#     export PULSE_SERVER="unix:$XDG_RUNTIME_DIR/snap.$SNAP_NAME/pulse/native"
#   fi
# fi

# 2. ALSA Fallback Configuration to prevent card 0 hardcoding & ensure seamless headphone routing
if [ -d "$SNAP/usr/share/alsa" ]; then
  export ALSA_CONFIG_PATH="$SNAP/usr/share/alsa/alsa.conf"
fi
if [ -d "$SNAP/usr/lib/x86_64-linux-gnu/alsa-lib" ]; then
  export ALSA_PLUGIN_DIR="$SNAP/usr/lib/x86_64-linux-gnu/alsa-lib"
  export LD_LIBRARY_PATH="$SNAP/usr/lib/x86_64-linux-gnu/alsa-lib:$SNAP/usr/lib/x86_64-linux-gnu:$LD_LIBRARY_PATH"
fi

# 3. Chromium/Electron Flags for Seamless PulseAudio Out-of-Process Playback
EXTRA_FLAGS=(
  --no-sandbox
  --disable-gpu-sandbox
  --ozone-platform-hint=auto
  --disable-features=AudioServiceSandbox
  --try-supported-channel-layouts
)

# 4. Check for native GNOME/GTK desktop launchers or direct executable
if [ -f "$SNAP/command-chain/desktop-launch" ]; then
  exec "$SNAP/command-chain/desktop-launch" "$SNAP/cutecut-pro" "${EXTRA_FLAGS[@]}" "$@"
elif [ -f "$SNAP/bin/desktop-launch" ]; then
  exec "$SNAP/bin/desktop-launch" "$SNAP/cutecut-pro" "${EXTRA_FLAGS[@]}" "$@"
elif [ -f "$SNAP/cutecut-pro" ]; then
  exec "$SNAP/cutecut-pro" "${EXTRA_FLAGS[@]}" "$@"
else
  exec "$SNAP/usr/bin/cutecut-pro" "${EXTRA_FLAGS[@]}" "$@"
fi

