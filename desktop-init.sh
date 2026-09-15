#!/bin/bash
set -e

# Desktop launcher wrapper for CUTECUT PRO snap (Revision 3)
export SNAP_DESKTOP_RUNTIME="${SNAP:-/snap/cutecut-pro/current}"

# Check for native GNOME/GTK desktop launchers or direct executable
if [ -f "$SNAP/command-chain/desktop-launch" ]; then
  exec "$SNAP/command-chain/desktop-launch" "$SNAP/cutecut-pro" "$@"
elif [ -f "$SNAP/bin/desktop-launch" ]; then
  exec "$SNAP/bin/desktop-launch" "$SNAP/cutecut-pro" "$@"
elif [ -f "$SNAP/cutecut-pro" ]; then
  exec "$SNAP/cutecut-pro" "$@"
else
  exec "$SNAP/usr/bin/cutecut-pro" "$@"
fi
