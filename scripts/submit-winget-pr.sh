#!/bin/bash
set -e

# Microsoft WinGet Submission Automation Script for CuteCut Pro
# Submits CuteCutPro.CuteCutPro package manifests to microsoft/winget-pkgs

APP_ID="CuteCutPro.CuteCutPro"
VERSION="2.4.2"
BRANCH_NAME="add-${APP_ID}-${VERSION}"
REPO_OWNER="${GITHUB_REPOSITORY_OWNER:-MDIsmatullah}"
GITHUB_TOKEN="${GH_TOKEN:-$GITHUB_TOKEN}"
ROOT_DIR="${WORKSPACE_ROOT:-$PWD}"

echo "=== Microsoft WinGet Submission Automation for ${APP_ID} v${VERSION} ==="

if [ -z "${GITHUB_TOKEN}" ]; then
  echo "Error: GITHUB_TOKEN or GH_TOKEN is required for submission."
  exit 1
fi

export GH_TOKEN="${GITHUB_TOKEN}"

TMP_DIR=$(mktemp -d)
echo "Working directory: ${TMP_DIR}"
cd "${TMP_DIR}"

echo "1. Checking / Creating fork of microsoft/winget-pkgs..."
gh repo fork microsoft/winget-pkgs --clone=false 2>/dev/null || echo "Fork already exists or initialized."

echo "2. Cloning winget-pkgs repository..."
git clone --depth 1 "https://x-access-token:${GITHUB_TOKEN}@github.com/${REPO_OWNER}/winget-pkgs.git" winget-repo || git clone --depth 1 https://github.com/microsoft/winget-pkgs.git winget-repo
cd winget-repo

echo "3. Creating submission branch: ${BRANCH_NAME}"
git checkout -B "${BRANCH_NAME}"

TARGET_DIR="manifests/c/CuteCutPro/CuteCutPro/${VERSION}"
mkdir -p "${TARGET_DIR}"

echo "4. Copying WinGet manifest files into ${TARGET_DIR}..."
cp "${ROOT_DIR}/winget/manifests/c/CuteCutPro/CuteCutPro/${VERSION}/"* "${TARGET_DIR}/"

git add "${TARGET_DIR}"

git config user.name "${REPO_OWNER}"
git config user.email "asmatullahdevolper@gmail.com"

if git diff --staged --quiet; then
  echo "No changes to commit (already up to date)."
else
  git commit -m "New package: ${APP_ID} version ${VERSION}"
fi

echo "5. Pushing branch ${BRANCH_NAME} to ${REPO_OWNER}/winget-pkgs..."
git remote set-url origin "https://x-access-token:${GITHUB_TOKEN}@github.com/${REPO_OWNER}/winget-pkgs.git" 2>/dev/null || git remote add origin "https://x-access-token:${GITHUB_TOKEN}@github.com/${REPO_OWNER}/winget-pkgs.git"
git push -u origin "${BRANCH_NAME}" --force

echo "6. Creating Pull Request to microsoft/winget-pkgs..."
gh pr create \
  --repo microsoft/winget-pkgs \
  --head "${REPO_OWNER}:${BRANCH_NAME}" \
  --base master \
  --title "New package: ${APP_ID} version ${VERSION}" \
  --body "### CuteCut Pro Submission to Windows Package Manager (WinGet)

- **Package Identifier**: \`${APP_ID}\`
- **Package Version**: \`${VERSION}\`
- **Publisher**: Asmatullah Developer
- **License**: MIT
- **Homepage**: https://github.com/MDIsmatullah/CuteCut-Pro
- **Release**: https://github.com/MDIsmatullah/CuteCut-Pro/releases/tag/v${VERSION}

Submitting official verified Nullsoft (NSIS) installer manifests with silent /S switches for automated pipeline validation." 2>&1 || echo "PR creation processed (may already exist or pending merge)."

echo "=== WinGet submission procedure complete! ==="
