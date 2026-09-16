#!/bin/bash
set -e

# AppImageHub Submission Automation Script for CuteCut Pro
# Submits CuteCut-Pro entry to AppImage/appimage.github.io catalog

APP_NAME="CuteCut-Pro"
REPO_OWNER="${GITHUB_REPOSITORY_OWNER:-MDIsmatullah}"
GITHUB_TOKEN="${GH_TOKEN:-$GITHUB_TOKEN}"
BRANCH_NAME="add-${APP_NAME}"

echo "=== AppImageHub Submission Automation for ${APP_NAME} ==="

if [ -z "${GITHUB_TOKEN}" ]; then
  echo "Error: GITHUB_TOKEN or GH_TOKEN is required for submission."
  exit 1
fi

export GH_TOKEN="${GITHUB_TOKEN}"

TMP_DIR=$(mktemp -d)
echo "Working directory: ${TMP_DIR}"
cd "${TMP_DIR}"

echo "1. Checking / Creating fork of AppImage/appimage.github.io..."
gh repo fork AppImage/appimage.github.io --clone=false 2>/dev/null || echo "Fork already exists or initialized."

echo "2. Cloning appimage.github.io repository..."
git clone --depth 1 "https://x-access-token:${GITHUB_TOKEN}@github.com/${REPO_OWNER}/appimage.github.io.git" appimage-repo || git clone --depth 1 https://github.com/AppImage/appimage.github.io.git appimage-repo
cd appimage-repo

echo "3. Creating submission branch: ${BRANCH_NAME}"
git checkout -B "${BRANCH_NAME}"

mkdir -p data
echo "https://github.com/MDIsmatullah/CuteCut-Pro" > "data/${APP_NAME}"

git add "data/${APP_NAME}"

git config user.name "${REPO_OWNER}"
git config user.email "asmatullahdevolper@gmail.com"

if git diff --staged --quiet; then
  echo "No changes to commit (already exists)."
else
  git commit -m "Add ${APP_NAME} to AppImage catalog"
fi

echo "4. Pushing branch ${BRANCH_NAME} to ${REPO_OWNER}/appimage.github.io..."
git remote set-url origin "https://x-access-token:${GITHUB_TOKEN}@github.com/${REPO_OWNER}/appimage.github.io.git" 2>/dev/null || git remote add origin "https://x-access-token:${GITHUB_TOKEN}@github.com/${REPO_OWNER}/appimage.github.io.git"
git push -u origin "${BRANCH_NAME}" --force

echo "5. Creating Pull Request to AppImage/appimage.github.io..."
gh pr create \
  --repo AppImage/appimage.github.io \
  --head "${REPO_OWNER}:${BRANCH_NAME}" \
  --base master \
  --title "Add ${APP_NAME}" \
  --body "### Add CuteCut Pro to AppImage Catalog

- **Application Name**: CuteCut Pro
- **GitHub Repository**: https://github.com/MDIsmatullah/CuteCut-Pro
- **Releases Page**: https://github.com/MDIsmatullah/CuteCut-Pro/releases/tag/v2.4.1
- **License**: MIT
- **Summary**: Professional offline-first multitrack video editor with Quranic audio-to-text synchronization.

Automated submission from official repository release." 2>&1 || echo "PR creation processed (may already exist)."

echo "=== AppImageHub submission complete! ==="
