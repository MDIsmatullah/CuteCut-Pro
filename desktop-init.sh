#!/bin/bash
set -euo pipefail

# Let the GNOME desktop extension and snapd's pulseaudio interface configure
# the host audio socket. Overriding ALSA_PLUGIN_DIR/ALSA_CONFIG_PATH here can
# make Electron search for PulseAudio ALSA modules that are not in the Snap.
SNAP_ROOT="${SNAP:-/snap/cutecut-pro/current}"
export SNAP_DESKTOP_RUNTIME="$SNAP_ROOT"

# Electron flags for a strictly confined Snap. Disable GPU initialization on
# systems where ANGLE/GLX is unavailable; this is independent of audio but
# otherwise causes repeated GPU-process failures during startup.
EXTRA_FLAGS=(
  --no-sandbox
  --disable-gpu-sandbox
  --disable-gpu
  --ozone-platform-hint=auto
  --disable-features=AudioServiceSandbox
  --try-supported-channel-layouts
)

if [ -f "$SNAP_ROOT/command-chain/desktop-launch" ]; then
  exec "$SNAP_ROOT/command-chain/desktop-launch" "$SNAP_ROOT/cutecut-pro" "${EXTRA_FLAGS[@]}" "$@"
elif [ -f "$SNAP_ROOT/bin/desktop-launch" ]; then
  exec "$SNAP_ROOT/bin/desktop-launch" "$SNAP_ROOT/cutecut-pro" "${EXTRA_FLAGS[@]}" "$@"
elif [ -f "$SNAP_ROOT/cutecut-pro" ]; then
  exec "$SNAP_ROOT/cutecut-pro" "${EXTRA_FLAGS[@]}" "$@"
else
  exec "$SNAP_ROOT/usr/bin/cutecut-pro" "${EXTRA_FLAGS[@]}" "$@"
fi
