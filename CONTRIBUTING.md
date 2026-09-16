# Contributing to CuteCut Pro

Thank you for your interest in contributing to **CuteCut Pro**! We welcome contributions from the community to help make CuteCut Pro the premier open-source, studio-grade video editor and Quran AI subtitling suite.

---

## 🌟 Code of Conduct

By participating in this project, you agree to maintain a respectful, welcoming, and collaborative environment for everyone. Please be polite, constructive, and helpful in all interactions.

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: `v18.x` or higher (LTS recommended)
- **npm**: `v9.x` or higher
- **Git** installed on your system

### 1. Fork & Clone the Repository

```bash
git clone https://github.com/MDismatullah/CuteCut-Pro.git
cd CuteCut-Pro

npm install
npm run dev
# Type check and build web app
npm run build

# Type check without building
npm run lint

git checkout -b feature/your-feature-name
# or for bug fixes:
git checkout -b fix/issue-description

npm run lint
npm run build

git commit -m "feat(audio): add parametric equalizer filter"
# or
git commit -m "fix(timeline): prevent snapping jitter on clip drag"

git push origin feature/your-feature-name

Open a Pull Request on GitHub with a clear summary of your changes, screenshots/videos (if UI changes), and any related issue numbers.
💡 Reporting Bugs & Feature Requests
Bug Reports: Before creating a new issue, check existing issues to avoid duplicates. Include your operating system, browser/app version, steps to reproduce, and console error logs.
Feature Requests: Describe the problem you are solving, the proposed solution, and why it benefits CuteCut Pro users.
📜 License
By contributing to CuteCut Pro, you agree that your contributions will be licensed under the project's LICENSE.
