#!/bin/bash
set -e

# Flathub Submission Automation Script for CUTECUT PRO
# Submits org.guldasta.cutecutpro manifest & assets to flathub/flathub

APP_ID="org.guldasta.cutecutpro"
BRANCH_NAME="add-${APP_ID}"
REPO_OWNER="${GITHUB_REPOSITORY_OWNER:-MDIsmatullah}"
GITHUB_TOKEN="${GH_TOKEN:-$GITHUB_TOKEN}"
ROOT_DIR="${WORKSPACE_ROOT:-$PWD}"

echo "=== Flathub Submission Automation for ${APP_ID} ==="

if [ -z "$GITHUB_TOKEN" ]; then
  echo "Error: GITHUB_TOKEN or GH_TOKEN is required for automated PR creation."
  echo "Usage: GH_TOKEN=<your-token> ./scripts/submit-flathub-pr.sh"
  exit 1
fi

export GH_TOKEN="${GITHUB_TOKEN}"

TMP_DIR=$(mktemp -d)
echo "Working directory: ${TMP_DIR}"

cd "${TMP_DIR}"

echo "1. Checking / Creating fork of flathub/flathub..."
gh repo fork flathub/flathub --clone=false 2>/dev/null || echo "Fork already exists or initialized."

echo "2. Cloning Flathub submission repository..."
git clone "https://x-access-token:${GITHUB_TOKEN}@github.com/${REPO_OWNER}/flathub.git" flathub-repo || git clone https://github.com/flathub/flathub.git flathub-repo
cd flathub-repo

git remote add upstream https://github.com/flathub/flathub.git 2>/dev/null || true
git fetch upstream new-pr

echo "3. Creating submission branch from upstream/new-pr: ${BRANCH_NAME}"
git checkout -B "${BRANCH_NAME}" upstream/new-pr

echo "4. Copying manifest files from root: ${ROOT_DIR}..."
cp "${ROOT_DIR}/org.guldasta.cutecutpro.yaml" ./
cp "${ROOT_DIR}/org.guldasta.cutecutpro.desktop" ./
cp "${ROOT_DIR}/org.guldasta.cutecutpro.metainfo.xml" ./
cp "${ROOT_DIR}/public/icon.png" ./icon.png 2>/dev/null || cp "${ROOT_DIR}/icon.png" ./icon.png 2>/dev/null || true
cp "${ROOT_DIR}/cutecut-pro" ./ 2>/dev/null || true

git add org.guldasta.cutecutpro.yaml org.guldasta.cutecutpro.desktop org.guldasta.cutecutpro.metainfo.xml
[ -f "icon.png" ] && git add icon.png
[ -f "cutecut-pro" ] && git add cutecut-pro

git config user.name "${REPO_OWNER}"
git config user.email "asmatullahdevolper@gmail.com"

if git diff --staged --quiet; then
  echo "No changes to commit (already up to date)."
else
  git commit -m "Add ${APP_ID}: CUTECUT PRO Professional Video Editor Suite"
fi

echo "5. Pushing branch ${BRANCH_NAME} to ${REPO_OWNER}/flathub..."
git remote set-url origin "https://x-access-token:${GITHUB_TOKEN}@github.com/${REPO_OWNER}/flathub.git" 2>/dev/null || git remote add origin "https://x-access-token:${GITHUB_TOKEN}@github.com/${REPO_OWNER}/flathub.git"
git push -u origin "${BRANCH_NAME}" --force

echo "6. Creating / Verifying Pull Request to flathub/flathub..."
gh pr create \
  --repo flathub/flathub \
  --head "${REPO_OWNER}:${BRANCH_NAME}" \
  --base new-pr \
  --title "Add ${APP_ID}" \
  --body "### New Application Submission: CUTECUT PRO

- **App ID**: \`${APP_ID}\`
- **Summary**: CUTECUT PRO Professional Video Editor Suite
- **License**: MIT
- **Homepage**: https://github.com/MDIsmatullah/CuteCut-Pro

Submitting official Flatpak manifest for automated build validation." 2>&1 || echo "PR creation processed (may already exist or pending merge)."

echo "=== Flathub submission procedure complete! ==="

