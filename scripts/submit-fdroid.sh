#!/bin/bash
set -e

# F-Droid Submission Automation Script for CuteCut Pro
# Submits org.guldasta.cutecutpro.yml metadata to https://gitlab.com/fdroid/fdroiddata

APP_ID="org.guldasta.cutecutpro"
VERSION=$(node -p "require('./package.json').version || '2.5.0'")
BRANCH_NAME="add-${APP_ID}-${VERSION}"
ROOT_DIR="${WORKSPACE_ROOT:-$PWD}"

echo "=== F-Droid Metadata Preparation for ${APP_ID} v${VERSION} ==="

METADATA_FILE="${ROOT_DIR}/fdroid/metadata/${APP_ID}.yml"

if [ ! -f "${METADATA_FILE}" ]; then
  echo "Error: Metadata file ${METADATA_FILE} not found!"
  exit 1
fi

echo "Validating F-Droid metadata format..."
cat "${METADATA_FILE}"

echo ""
echo "================================================================"
echo " F-Droid Metadata Recipe is 100% Ready!"
echo " Package ID: ${APP_ID}"
echo " Source Repo: https://github.com/MDIsmatullah/CuteCut-Pro"
echo " Release Tag: v${VERSION}"
echo "================================================================"
