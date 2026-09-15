#!/bin/bash
set -e

# Flathub Submission Helper Script for CUTECUT PRO
# Submits org.guldasta.cutecutpro manifest & assets to flathub/flathub

APP_ID="org.guldasta.cutecutpro"
BRANCH_NAME="add-${APP_ID}"
REPO_OWNER="${GITHUB_REPOSITORY_OWNER:-guldastaislamorquran}"
GITHUB_TOKEN="${GH_TOKEN:-$GITHUB_TOKEN}"

echo "=== Flathub Submission Automation for ${APP_ID} ==="

if [ -z "$GITHUB_TOKEN" ]; then
  echo "Error: GITHUB_TOKEN or GH_TOKEN is required for automated PR creation."
  echo "Usage: GH_TOKEN=<your-token> ./scripts/submit-flathub-pr.sh"
  exit 1
fi

TMP_DIR=$(mktemp -d)
echo "Working directory: ${TMP_DIR}"

cd "${TMP_DIR}"

echo "Cloning Flathub main repository..."
git clone https://github.com/flathub/flathub.git flathub-repo
cd flathub-repo

echo "Creating submission branch: ${BRANCH_NAME}"
git checkout -b "${BRANCH_NAME}"

# Copy submission files from source workspace
echo "Copying manifest files..."
cp "${WORKSPACE_ROOT:-$PWD}/org.guldasta.cutecutpro.yaml" ./
cp "${WORKSPACE_ROOT:-$PWD}/org.guldasta.cutecutpro.desktop" ./
cp "${WORKSPACE_ROOT:-$PWD}/org.guldasta.cutecutpro.metainfo.xml" ./
cp "${WORKSPACE_ROOT:-$PWD}/icon.png" ./

git add org.guldasta.cutecutpro.yaml org.guldasta.cutecutpro.desktop org.guldasta.cutecutpro.metainfo.xml icon.png

git config user.name "Guldasta Islam Or Quran Bot"
git config user.email "guldastaislamorquran@gmail.com"

git commit -m "Add ${APP_ID}: CUTECUT PRO Professional Video Editor Suite" || echo "No changes to commit"

echo "Pushing branch ${BRANCH_NAME} to fork..."
git remote add fork "https://x-access-token:${GITHUB_TOKEN}@github.com/${REPO_OWNER}/flathub.git" || true
git push -u fork "${BRANCH_NAME}" --force

echo "Creating Pull Request to flathub/flathub..."
gh pr create \
  --repo flathub/flathub \
  --head "${REPO_OWNER}:${BRANCH_NAME}" \
  --base master \
  --title "Add ${APP_ID}" \
  --body "### New Application Submission: CUTECUT PRO

- **App ID**: \`${APP_ID}\`
- **Summary**: CUTECUT PRO Professional Video Editor Suite
- **License**: MIT
- **Homepage**: https://github.com/guldastaislamorquran/cutecut-pro

Submitting official Flatpak manifest for automated build validation." || echo "PR creation initiated or already exists."

echo "=== Flathub submission procedure complete! ==="
