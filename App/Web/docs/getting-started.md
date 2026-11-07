# 🚀 Getting Started Guide

## 👋 Welcome to AREA Web Frontend

This guide will help new team members get up and running with our Next.js frontend project.

---

## 📋 Prerequisites

Before you start, ensure you have the following installed:

- **Node.js**: 18.x or later ([Download here](https://nodejs.org/))
- **Git**: Latest version ([Download here](https://git-scm.com/))
- **Yarn**: Package manager (we'll install this below)
- **VS Code**: Recommended editor ([Download here](https://code.visualstudio.com/))

---

## 🛠️ Initial Setup

### 1. Install Yarn

#### Option A: Using npm
```bash
npm install -g yarn
```

#### Option B: Using Corepack (Node 16.10+)
```bash
corepack enable
```

Verify the installation:
```bash
yarn --version
# Should show: 1.22.x or later
```

### 2. Clone the Repository

```bash
git clone <repo-url>
cd AREA_Web
```

### 3. Install Dependencies

```bash
yarn install
```

### 4. Configure Environment Variables

If an `.env.example` file is provided, copy it to `.env.local`:
```bash
cp .env.example .env.local
```
Update the values in `.env.local` as needed.

---

## 🚀 Run the Application

Start the development server:
```bash
yarn dev
```
Open your browser and navigate to:
```
http://localhost:3000
```

---

## 🔧 Useful Scripts

| Command                  | Description                          |
|--------------------------|--------------------------------------|
| `yarn dev`               | Start the development server        |
| `yarn build`             | Create a production build           |
| `yarn start`             | Run the production server           |
| `yarn lint`              | Lint the code                       |
| `yarn test`              | Run unit tests                      |
| `yarn cypress:open`      | Open the Cypress E2E test runner    |

---

## ✅ First PR Checklist

1. Create a feature branch:
   ```bash
   git checkout -b feature/your-feature
   ```
2. Add tests for new functionality.
3. Run linting and tests locally:
   ```bash
   yarn lint && yarn test
   ```
4. Push your branch and open a pull request with a clear description.

---

If you need further assistance, check the `docs/` folder or contact the team.