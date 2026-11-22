# macOS Desktop Application Build Guide

Comprehensive documentation for building, packaging, and verifying native macOS releases for ICPay (`ICPay.app`, `.dmg`, `.zip`).

---

## 1. Overview & Artifacts

The macOS build targets both modern Apple Silicon (ARM64) and legacy Intel (x64) architectures.

| Architecture | Artifact Name | Format | Primary Use Case |
|---|---|---|---|
| **Apple Silicon (M1/M2/M3/M4)** | `ICPay-1.0.0-mac-arm64.dmg` | Apple Disk Image | Standard drag-and-drop installer for Apple Silicon Macs |
| **Apple Silicon (M1/M2/M3/M4)** | `ICPay-1.0.0-mac-arm64.zip` | Compressed Archive | Portable / CLI extraction without mounting |
| **Intel (x86_64)** | `ICPay-1.0.0-mac-x64.dmg` | Apple Disk Image | Standard installer for Intel-based Macs |
| **Intel (x86_64)** | `ICPay-1.0.0-mac-x64.zip` | Compressed Archive | Portable / CLI extraction for Intel Macs |
| **Standalone App Bundle** | `desktop/mac/ICPay.app` | macOS Application | Directly executable local application bundle |

---

## 2. Prerequisites & Environment

1. **Host OS**: macOS 13.0+ (Ventura, Sonoma, or Sequoia) recommended.
2. **Node.js**: Node.js `v20.x` or `v22.x` LTS.
3. **Xcode Command Line Tools**:
   ```bash
   xcode-select --install
   ```
4. **App Icons**:
   - `desktop/builder/icon.icns`: Multi-layer Apple Icon Set (up to 1024×1024 px).
   - `desktop/builder/icon.png`: 512×512 high-resolution fallback.

---

## 3. Build Commands

### Option A: The Unified Orchestrator Script (Recommended)

Run the root desktop build script with the `mac` target:
```bash
./desktop/build.sh mac
```
*Under the hood, this executes `node desktop/builder/build.mjs mac`, which invokes `electron-builder` with `--mac --arm64 --x64` and mirrors the artifacts into `desktop/mac/` and `downloads/mac/`.*

### Option B: Direct `electron-builder` CLI

Navigate to the builder package directory:
```bash
cd desktop/builder
```

1. **Build both Apple Silicon and Intel**:
   ```bash
   npx --yes electron-builder --mac --arm64 --x64
   ```

2. **Build Apple Silicon (ARM64) only**:
   ```bash
   npx --yes electron-builder --mac --arm64
   ```

3. **Build Intel (x64) only**:
   ```bash
   npx --yes electron-builder --mac --x64
   ```

---

## 4. Configuration Details (`desktop/builder/package.json`)

The builder specifies the following parameters under `"build.mac"` and `"build.dmg"`:

```json
"mac": {
  "category": "public.app-category.finance",
  "target": [
    { "target": "dmg", "arch": ["arm64", "x64"] },
    { "target": "zip", "arch": ["arm64", "x64"] }
  ],
  "icon": "icon.icns",
  "hardenedRuntime": true,
  "gatekeeperAssess": false,
  "artifactName": "${productName}-${version}-mac-${arch}.${ext}"
},
"dmg": {
  "contents": [
    { "x": 130, "y": 220 },
    { "x": 410, "y": 220, "type": "link", "path": "/Applications" }
  ],
  "window": { "width": 540, "height": 380 }
}
```

- **App ID**: `com.icpay.wallet`
- **Electron Version**: Pinned to `33.2.0` (Chromium 130 runtime).
- **Asar Archive**: Enabled (`"asar": true`) to bundle script assets into a protected package.
- **DMG Layout**: Configured with a 540×380 px installer window featuring the ICPay icon on the left (x:130) and a direct symlink to `/Applications` on the right (x:410).

---

## 5. Runtime Architecture & Internet Identity (`main.js`)

The macOS desktop client wraps the production web app (`https://icpay.app/home`) with strict sandboxing and security safeguards:

1. **Security Isolation**:
   - `nodeIntegration: false`
   - `contextIsolation: true`
   - `sandbox: true`
   - `webSecurity: true`
2. **Single Instance Lock**:
   - Uses `app.requestSingleInstanceLock()`. If a secondary instance is launched, the primary window focuses and restores automatically.
3. **Internet Identity Authentication Handler**:
   - When a user clicks "Sign In with Internet Identity", the app intercepts `window.open` via `setWindowOpenHandler`.
   - Permitted authentication origins (`identity.ic0.app`, `id.ai`, `ic0.app`, `icp0.io`, `icpay.app`) open in an isolated, centered 520×720 authentication dialog window.
   - Any external non-whitelisted URLs are intercepted and opened in the user's default system browser via `shell.openExternal`.

---

## 6. Testing & Verifying Builds

### Test 1: Launch Local `.app`
```bash
open desktop/mac/ICPay.app
```

### Test 2: Mount & Inspect DMG
```bash
# 1. Attach DMG
hdiutil attach desktop/mac/ICPay-1.0.0-mac-arm64.dmg

# 2. Verify volume contents
ls -la /Volumes/ICPay\ 1.0.0/

# 3. Check code signature status
codesign --verify --deep --strict --verbose=2 /Volumes/ICPay\ 1.0.0/ICPay.app

# 4. Detach volume
hdiutil detach /Volumes/ICPay\ 1.0.0
```

### Test 3: Generate Checksum
```bash
shasum -a 256 desktop/mac/*.dmg desktop/mac/*.zip
```

---

## 7. Known Issues & Troubleshooting

- **Error: `Cannot compute electron version from installed node modules`**:
  - *Cause*: Building with `npx electron-builder` when `electron` is not in root `dependencies`.
  - *Fix*: `"electronVersion": "33.2.0"` is explicitly pinned in `desktop/builder/package.json`.
- **macOS Gatekeeper Warning ("App is damaged or cannot be opened")**:
  - *Cause*: When distributing unsigned or ad-hoc signed binaries outside the Mac App Store or Apple Developer ID Notarization.
  - *User Fix*: Run `xattr -cr /Applications/ICPay.app` in Terminal, or right-click the app in Finder and choose **Open**.
