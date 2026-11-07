# 🛠️ Development Setup Guide

## 🎯 Development Environment Configuration

This document describes the recommended development environment, core configuration files, and workflow for the AREA Web frontend.

---

## 🖥️ System Requirements

- **Node.js**: 18.x or later
- **Yarn**: 1.22.x (or Corepack-enabled Yarn)
- **Git**: Latest version
- **Recommended**: 8GB RAM for comfortable local builds

---

## 📂 Project Overview

- **Framework**: Next.js (App Router) with TypeScript
- **UI**: Mantine + CSS Modules (Tailwind may be used in parts)
- **Testing**: Jest (unit) and Cypress (E2E)

---

## 🚀 Key Scripts (package.json)

| Command                  | Description                          |
|--------------------------|--------------------------------------|
| `yarn dev`               | Run the development server          |
| `yarn build`             | Create a production build           |
| `yarn start`             | Start the production server         |
| `yarn lint` / `yarn lint:fix` | Lint and auto-fix code         |
| `yarn test` / `yarn test:watch` | Run unit tests               |
| `yarn cypress:open` / `yarn cypress:run` | Run E2E tests       |

---

## 🔧 Configuration Highlights

- **`tsconfig.json`**: TypeScript options and path aliases
- **`jest.config.js`**: Jest + Next.js configuration
- **`cypress.config.ts`**: E2E settings and base URL
- **`eslint.config.mjs`**: ESLint configuration and rules

---

## 🛠️ Recommended Editor & Extensions

- **Editor**: Visual Studio Code (VS Code)
- **Extensions**:
  - ESLint
  - Prettier
  - TypeScript
  - Tailwind CSS IntelliSense
  - Jest

### Workspace Settings

- Enable "Format on Save"
- Enable ESLint code actions on save

---

## 🗂️ Workflow & Tips

### Daily Workflow

1. Start the development server:
   ```bash
   yarn dev
   ```
2. Run tests while developing:
   ```bash
   yarn test:watch
   ```
3. Before creating a PR, run:
   ```bash
   yarn lint && yarn build
   ```

### Feature Branch Checklist

- Create a feature branch from `main` (or your target branch):
  ```bash
  git checkout -b feature/your-feature
  ```
- Add tests for new features.
- Run lint and tests locally.
- Push and open a PR with a clear description.

---

## 🛠️ Troubleshooting Quick Fixes

### Clear Next.js Cache
```bash
rm -rf .next
```

### Reinstall Dependencies
```bash
rm -rf node_modules yarn.lock && yarn install
```

### Increase Node.js Memory
```bash
NODE_OPTIONS=--max-old-space-size=4096 yarn build
```

---