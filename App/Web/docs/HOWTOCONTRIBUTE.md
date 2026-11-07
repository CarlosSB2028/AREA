# Contributing to AREA Web

Thank you for your interest in contributing to AREA Web! This guide explains the expected workflow, coding standards, and how to submit a pull request.

---

## 🛠️ Prerequisites

Before contributing, ensure you have the following:

- **Node.js**: 18.x or later
- **Yarn**: Installed globally
- **Git**: Access to the repository

---

## 🚀 Quick Start

1. **Fork the Repository**
   ```bash
   git clone https://github.com/your-username/AREA_Web.git
   cd AREA_Web
   ```

2. **Add Upstream Remote**
   ```bash
   git remote add upstream https://github.com/SamTess/AREA_Web.git
   git fetch upstream
   ```

3. **Create a Feature Branch**
   ```bash
   git checkout -b feature/your-feature
   ```

---

## ✅ Development Checklist

- **Install Dependencies**:
  ```bash
  yarn install
  ```
- **Set Up Environment Variables**:
  ```bash
  cp .env.example .env.local
  ```
  Update the values in `.env.local` as needed.
- **Run the Development Server**:
  ```bash
  yarn dev
  ```
- **Run Unit Tests**:
  ```bash
  yarn test
  ```
- **Lint Your Code**:
  ```bash
  yarn lint
  ```

---

## 🧑‍💻 Coding Standards

- **Use TypeScript**: All new code should be written in TypeScript.
- **Follow ESLint and Prettier Rules**: Run `yarn lint` before committing.
- **Write Small, Focused Pull Requests**: Each PR should have a clear purpose.
- **Add Unit Tests**: Ensure new logic and components are covered.

---

## 🧪 Testing

- **Unit Tests**:
  ```bash
  yarn test
  ```
- **E2E Tests**:
  ```bash
  yarn cypress:run
  ```
  For interactive runs:
  ```bash
  yarn cypress:open
  ```

---

## 📤 Submitting a Pull Request

1. **Commit Your Changes**:
   ```bash
   git add .
   git commit -m "feat(area): add area creation flow"
   git push origin feature/your-feature
   ```

2. **Open a Pull Request**:
   - Target the `main` branch (or the branch specified by the maintainers).
   - Include the following in your PR description:
     - What the change does
     - Any migration or environment variable changes
     - How to test locally

---

## 📚 More Resources

- **Project Documentation**: See the `docs/` folder.
- **Development Setup**: [development-setup.md](./development-setup.md)
- **Testing Strategy**: [testing-strategy.md](./testing-strategy.md)

---

Thank you for helping improve AREA Web! 🎉