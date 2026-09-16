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
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Start Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` in your browser to test your local changes.

### 4. Build for Production

```bash
# Type check and build web app
npm run build

# Type check without building
npm run lint
```

---

## 🛠️ Contribution Workflow

1. **Create a New Branch:**
   ```bash
   git checkout -b feature/your-feature-name
   # or for bug fixes:
   git checkout -b fix/issue-description
   ```

2. **Make Your Changes:**
   - Write clean, type-safe TypeScript code.
   - Follow standard React 18 functional component and hook patterns.
   - Style components using Tailwind CSS classes.
   - Use Lucide icons (`lucide-react`) for UI icons.

3. **Verify Code Quality:**
   ```bash
   npm run lint
   npm run build
   ```
   Ensure there are no TypeScript compilation errors or broken dependencies.

4. **Commit Your Changes:**
   Use clear, descriptive commit messages:
   ```bash
   git commit -m "feat(audio): add parametric equalizer filter"
   # or
   git commit -m "fix(timeline): prevent snapping jitter on clip drag"
   ```

5. **Push and Open a Pull Request:**
   ```bash
   git push origin feature/your-feature-name
   ```
   Open a Pull Request on GitHub with a clear summary of your changes, screenshots/videos (if UI changes), and any related issue numbers.

---

## 💡 Reporting Bugs & Feature Requests

- **Bug Reports**: Before creating a new issue, check existing issues to avoid duplicates. Include your operating system, browser/app version, steps to reproduce, and console error logs.
- **Feature Requests**: Describe the problem you are solving, the proposed solution, and why it benefits CuteCut Pro users.

---

## 📜 License

By contributing to CuteCut Pro, you agree that your contributions will be licensed under the project's [LICENSE](LICENSE).
