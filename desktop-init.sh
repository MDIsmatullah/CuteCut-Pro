#!/bin/bash
set -euo pipefail

# Keep audio inside the Snap's interfaces. Do not force a host PulseAudio
# socket: on PipeWire systems it can bypass snapd's pulseaudio proxy.
SNAP_ROOT="${SNAP:-/snap/cutecut-pro/current}"
export SNAP_DESKTOP_RUNTIME="$SNAP_ROOT"

if [ -z "${PULSE_SERVER:-}" ] && [ -n "${XDG_RUNTIME_DIR:-}" ] && [ -S "$XDG_RUNTIME_DIR/pulse/native" ]; then
  export PULSE_SERVER="unix:$XDG_RUNTIME_DIR/pulse/native"
fi

# Only use the bundled ALSA configuration when it is complete. An invalid
# ALSA_CONFIG_PATH makes Chromium/Electron silently lose audio output.
if [ -f "$SNAP_ROOT/usr/share/alsa/alsa.conf" ]; then
  export ALSA_CONFIG_PATH="$SNAP_ROOT/usr/share/alsa/alsa.conf"
fi
if [ -d "$SNAP_ROOT/usr/lib/x86_64-linux-gnu/alsa-lib" ]; then
  export ALSA_PLUGIN_DIR="$SNAP_ROOT/usr/lib/x86_64-linux-gnu/alsa-lib"
  export LD_LIBRARY_PATH="$SNAP_ROOT/usr/lib/x86_64-linux-gnu/alsa-lib:$SNAP_ROOT/usr/lib/x86_64-linux-gnu:${LD_LIBRARY_PATH:-}"
fi

# Electron flags required for audio in a strictly confined Snap.
EXTRA_FLAGS=(
  --no-sandbox
  --disable-gpu-sandbox
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
