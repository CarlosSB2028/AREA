## Installation

Follow these steps to install and run this Expo + React Native project with Gluestack UI.

### Prerequisites

- Node.js 18+
- Yarn (recommended). You can use classic Yarn 1.x or Yarn via Corepack
- Android Studio (for Android) / Xcode (for iOS on macOS)
- Expo CLI is optional — `npx expo` works fine

Check your Node version:

```bash
node -v
```

If you’re using Yarn via Corepack, enable it once on your machine:

```bash
corepack enable
```

If you opt for Yarn 2+ (Berry), React Native works best with the node-modules linker. Create `.yarnrc.yml` in the repo root with:

```
nodeLinker: node-modules
```

### 1) Install dependencies

From the project root:

```bash
yarn install
```

This will generate/update `yarn.lock` and install dependencies.

### 2) Start the app

```bash
yarn start
```

In the Expo terminal, choose a target:

- Android: press `a` (emulator required) or scan the QR code on a real device
- iOS: press `i` (macOS with Xcode required)
- Web: press `w`

Or run platform-specific scripts directly:

```bash
yarn android
yarn ios
yarn web
```

### 3) Project structure and theming

- Routing lives under `app/` (Expo Router)
- Gluestack theme/provider is wired in `app/_layout.tsx` via `GluestackUIProvider`
- NativeWind/Tailwind is configured via `global.css` and `tailwind.config.js`

### 4) Useful scripts

```bash
# Lint
yarn lint

# Run tests
yarn test

# Watch tests
yarn test:watch

# Collect coverage
yarn coverage

# Reset the scaffold (moves the example into app-example/)
yarn reset-project
```

### 5) Troubleshooting

- If Metro doesn’t pick up changes, stop and restart `yarn start`
- For Android, start an emulator from Android Studio before pressing `a`
- If you see Node compatibility errors, upgrade Node to 18+
- When using Yarn 2+, keep `nodeLinker: node-modules` for React Native and Expo
