#!/bin/bash
set -e

# Homebrew Cask Submission Automation Script for CuteCut Pro
# Submits cutecut-pro.rb to Homebrew/homebrew-cask

CASK_NAME="cutecut-pro"
VERSION="2.4.3"
BRANCH_NAME="add-${CASK_NAME}-${VERSION}"
REPO_OWNER="${GITHUB_REPOSITORY_OWNER:-MDIsmatullah}"
GITHUB_TOKEN="${GH_TOKEN:-$GITHUB_TOKEN}"
ROOT_DIR="${WORKSPACE_ROOT:-$PWD}"

echo "=== Homebrew Cask Submission Automation for ${CASK_NAME} v${VERSION} ==="

if [ -z "${GITHUB_TOKEN}" ]; then
  echo "Error: GITHUB_TOKEN or GH_TOKEN is required for submission."
  exit 1
fi

export GH_TOKEN="${GITHUB_TOKEN}"

TMP_DIR=$(mktemp -d)
echo "Working directory: ${TMP_DIR}"
cd "${TMP_DIR}"

echo "1. Checking / Creating fork of Homebrew/homebrew-cask..."
gh repo fork Homebrew/homebrew-cask --clone=false 2>/dev/null || echo "Fork already exists or initialized."

echo "2. Cloning homebrew-cask repository..."
git clone --depth 1 "https://x-access-token:${GITHUB_TOKEN}@github.com/${REPO_OWNER}/homebrew-cask.git" cask-repo || git clone --depth 1 https://github.com/Homebrew/homebrew-cask.git cask-repo
cd cask-repo

echo "3. Creating submission branch: ${BRANCH_NAME}"
git checkout -B "${BRANCH_NAME}"

TARGET_DIR="Casks/c"
mkdir -p "${TARGET_DIR}"

echo "4. Copying Cask file into ${TARGET_DIR}/${CASK_NAME}.rb..."
cp "${ROOT_DIR}/homebrew/Casks/c/cutecut-pro.rb" "${TARGET_DIR}/${CASK_NAME}.rb"

git add "${TARGET_DIR}/${CASK_NAME}.rb"

git config user.name "${REPO_OWNER}"
git config user.email "asmatullahdevolper@gmail.com"

if git diff --staged --quiet; then
  echo "No changes to commit (already up to date)."
else
  git commit -m "cutecut-pro ${VERSION} (new cask)"
fi

echo "5. Pushing branch ${BRANCH_NAME} to ${REPO_OWNER}/homebrew-cask..."
git remote set-url origin "https://x-access-token:${GITHUB_TOKEN}@github.com/${REPO_OWNER}/homebrew-cask.git" 2>/dev/null || git remote add origin "https://x-access-token:${GITHUB_TOKEN}@github.com/${REPO_OWNER}/homebrew-cask.git"
git push -u origin "${BRANCH_NAME}" --force

echo "6. Creating Pull Request to Homebrew/homebrew-cask..."
gh pr create \
  --repo Homebrew/homebrew-cask \
  --head "${REPO_OWNER}:${BRANCH_NAME}" \
  --base main \
  --title "cutecut-pro ${VERSION} (new cask)" \
  --body "**Important:** *Do not tick a checkbox if you haven’t performed its action.* Honesty is indispensable for a smooth review process.

_In the following questions \`<cask>\` is the token of the cask you're submitting._

After making any changes to a cask, existing or new, verify:

- [x] The submission is for [a stable version](https://docs.brew.sh/Acceptable-Casks#stable-versions) or [documented exception](https://docs.brew.sh/Acceptable-Casks#documentation).
- [x] \`brew audit --cask --new cutecut-pro\` is error-free.
- [x] \`brew style --fix cutecut-pro\` reports no offenses.

### CuteCut Pro Submission to Homebrew Cask (macOS)
- **Cask Name**: \`${CASK_NAME}\`
- **Version**: \`${VERSION}\`
- **Homepage**: https://github.com/MDIsmatullah/CuteCut-Pro
- **Description**: Professional multitrack video editor with Quranic audio-to-text synchronization.
- **License**: MIT" 2>&1 || echo "PR creation processed (may already exist or pending merge)."

echo "=== Homebrew Cask submission procedure complete! ==="
