# 🚀 Manual Release Guide

## Overview
The AREA Mobile app uses a manual release workflow that allows you to create staging or production releases on-demand.

## How to Create a Release

### Step 1: Navigate to GitHub Actions
1. Go to your repository on GitHub
2. Click on the **"Actions"** tab
3. In the left sidebar, click on **"🚀 Manual Release"**

### Step 2: Trigger the Workflow
1. Click the **"Run workflow"** button (top right)
2. Fill in the required information:

   - **🎯 Release Type**: Choose between:
     - **`staging`** - For testing and QA (marked as pre-release)
     - **`production`** - For public releases (marked as stable)

   - **📦 Version Number**: Enter the version (e.g., `1.0.0`, `2.1.3`)
     - Follow [Semantic Versioning](https://semver.org/): `MAJOR.MINOR.PATCH`
     - Example: `1.0.0` for first release, `1.0.1` for bug fixes, `1.1.0` for new features

   - **📝 Release Notes** (optional): Add any additional notes
     - What's new in this version
     - Bug fixes
     - Known issues
     - Special instructions

3. Click **"Run workflow"**

### Step 3: Wait for Build
- The workflow takes approximately **15-20 minutes** to complete
- You can monitor progress in real-time
- The workflow will:
  - ✅ Install dependencies
  - ✅ Build the Android APK
  - ✅ Create a GitHub release
  - ✅ Upload the APK file

## Release Types

### 🧪 Staging Release
- **Purpose**: Internal testing, QA, beta testing
- **Marked as**: Pre-release (shows up with a "Pre-release" badge)
- **Tag format**: `v1.0.0-staging`
- **Use when**: Testing new features before production

### 🎉 Production Release
- **Purpose**: Public release for end users
- **Marked as**: Stable release (latest release)
- **Tag format**: `v1.0.0-production`
- **Use when**: Ready for production deployment

## Example Release Notes

### Good Example:
```
## What's New
- Added user authentication with Google Sign-In
- Improved app performance by 30%
- New dark mode theme

## Bug Fixes
- Fixed crash on Android 12+
- Resolved memory leak in image loading

## Known Issues
- Profile pictures may take longer to load on slow connections
```

### Simple Example:
```
Bug fixes and performance improvements
```

## Release Artifacts

Each release includes:
- 📱 **APK file**: `app-release.apk` (ready to install on Android devices)
- 📋 **Release description**: Detailed information about the release
- 🏷️ **Git tag**: Version tag for tracking

## Version Numbering Guidelines

### Semantic Versioning (Recommended)
- **MAJOR** (1.0.0): Breaking changes, major new features
- **MINOR** (1.1.0): New features, backwards compatible
- **PATCH** (1.0.1): Bug fixes, small improvements

### Examples:
- `1.0.0` - First production release
- `1.0.1` - Bug fix for 1.0.0
- `1.1.0` - New features added
- `2.0.0` - Major redesign or breaking changes

## Finding Your Releases

### On GitHub:
1. Go to the main repository page
2. Click on **"Releases"** (right sidebar)
3. All releases are listed with their APK files

### Direct Link:
`https://github.com/YOUR_USERNAME/AREA_Mobile/releases`

## Installing the APK

### For Testers:
1. Download the APK from the release page
2. Transfer to your Android device
3. Enable "Install from Unknown Sources" in Settings
4. Open the APK file and install

### For Distribution:
- Share the release URL with testers
- Use a Mobile Device Management (MDM) system
- Upload to internal app distribution platforms (Firebase App Distribution, TestFlight alternative)

## Troubleshooting

### Build Failed?
- Check the workflow logs in GitHub Actions
- Common issues:
  - Build errors in code
  - Missing dependencies
  - Android build configuration issues

### Can't Create Release?
- Make sure you have **write permissions** on the repository
- Check that the workflow has `contents: write` permission

### APK Not Uploading?
- Verify the APK was built successfully
- Check the file path in the workflow logs
- Ensure the release step completed

## Best Practices

1. **Test First**: Always create a staging release before production
2. **Version Increment**: Always increment the version number
3. **Clear Notes**: Write clear, concise release notes
4. **Test APK**: Download and test the APK before sharing
5. **Backup**: Keep previous releases available for rollback

## Automated vs Manual Releases

- **CI Workflow** (`AREA_MOBILE_CI.yml`): Runs on every push, tests code quality
- **Release Workflow** (`release.yml`): Manual trigger only, creates releases
- This separation ensures you control when releases happen

## Questions?

If you encounter issues or have questions about the release process:
1. Check the [GitHub Actions logs](../../../actions)
2. Review this documentation
3. Contact the development team
