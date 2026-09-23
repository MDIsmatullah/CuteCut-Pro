#!/bin/bash
set -euo pipefail

SNAP_ROOT="${SNAP:-/snap/cutecut-pro/current}"
export SNAP_DESKTOP_RUNTIME="$SNAP_ROOT"

# desktop-launch may export the host path /usr/share/alsa/alsa.conf, which is
# not visible inside strict confinement. Prefer the copy staged in the Snap.
if [ -f "$SNAP_ROOT/usr/share/alsa/alsa.conf" ]; then
  export ALSA_CONFIG_PATH="$SNAP_ROOT/usr/share/alsa/alsa.conf"
  export ALSA_CONFIG_DIR="$SNAP_ROOT/usr/share/alsa"
fi

# Use a plugin directory only when it really contains the PulseAudio ALSA
# modules. This avoids pointing ALSA at a nonexistent host or GNOME path.
for alsa_plugin_dir in \
  "$SNAP_ROOT/usr/lib/x86_64-linux-gnu/alsa-lib" \
  "$SNAP_ROOT/usr/lib/aarch64-linux-gnu/alsa-lib" \
  "$SNAP_ROOT/usr/lib/alsa-lib"; do
  if [ -f "$alsa_plugin_dir/libasound_module_pcm_pulse.so" ] && [ -f "$alsa_plugin_dir/libasound_module_conf_pulse.so" ]; then
    export ALSA_PLUGIN_DIR="$alsa_plugin_dir"
    export LD_LIBRARY_PATH="$alsa_plugin_dir:${LD_LIBRARY_PATH:-}"
    break
  fi
done

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
