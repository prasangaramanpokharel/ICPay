# Windows Desktop Application Build Guide

Comprehensive documentation for building, packaging, and verifying native Windows releases for ICPay (`.exe` NSIS installer, `.zip` portable package).

---

## 1. Overview & Artifacts

The Windows build creates two distribution formats:

| Format | Artifact Name | Description |
|---|---|---|
| **NSIS Setup Installer** | `ICPay-1.0.0-windows-x64.exe` | Standard Windows Setup Wizard with custom directory selection, desktop/start menu shortcuts, and uninstaller |
| **Portable ZIP Archive** | `ICPay-1.0.0-windows-x64.zip` | Standalone portable bundle that can be extracted and run without administrator privileges or installation |
| **Unpacked Directory** | `desktop/dist-builder/win-unpacked/` | Raw unpacked Windows application binaries (`ICPay.exe`, Chromium DLLs, and resources) |

---

## 2. Prerequisites & Environment

### Cross-Compiling from macOS (Apple Silicon or Intel)
To build Windows `.exe` installers on a macOS host without running Windows, `electron-builder` relies on **NSIS** (Nullsoft Scriptable Install System).

#### Critical Pitfall: `spawn Unknown system error -86 (EBADARCH)`
On Apple Silicon (M1/M2/M3/M4) macOS, `electron-builder` downloads a precompiled x86_64 binary of `makensis`. On machines without Rosetta 2 or with mismatched binary architecture headers, this causes an `EBADARCH (-86)` error.

**The Permanent Fix**:
1. Install native ARM64 `makensis` using Homebrew:
   ```bash
   brew install makensis
   ```
2. Symlink the native Homebrew binary into the `electron-builder` cache:
   ```bash
   # Create the cache directory for NSIS 3.0.4.1 (or current version)
   mkdir -p "$HOME/Library/Caches/electron-builder/nsis/nsis-3.0.4.1/mac"
   
   # Symlink native makensis
   ln -sf "$(which makensis)" "$HOME/Library/Caches/electron-builder/nsis/nsis-3.0.4.1/mac/makensis"
   ```
3. Test that `makensis` runs natively:
   ```bash
   "$HOME/Library/Caches/electron-builder/nsis/nsis-3.0.4.1/mac/makensis" -VERSION
   # Output should be: v3.08 or v3.10+
   ```

### Building Natively on Windows
If building directly on Windows:
- Node.js `v20.x` or `v22.x` LTS.
- Git for Windows.
- No extra tools needed: `electron-builder` bundles Windows-native NSIS binaries automatically.

---

## 3. Build Commands

### Option A: The Unified Orchestrator Script (Recommended)

Run the root desktop build script with the `window` target:
```bash
./desktop/build.sh window
```
*This invokes `node desktop/builder/build.mjs window`, builds the NSIS installer and ZIP archive via `electron-builder --win --x64`, and copies output binaries to `desktop/window/` and `downloads/window/`.*

### Option B: Direct `electron-builder` CLI

Navigate to the builder package directory:
```bash
cd desktop/builder
npx --yes electron-builder --win --x64
```

To build only the NSIS `.exe` installer (skipping `.zip`):
```bash
npx --yes electron-builder --win nsis --x64
```

To build only the portable `.zip` package:
```bash
npx --yes electron-builder --win zip --x64
```

---

## 4. Configuration Details (`desktop/builder/package.json`)

```json
"win": {
  "target": [
    { "target": "nsis", "arch": ["x64"] },
    { "target": "zip", "arch": ["x64"] }
  ],
  "icon": "icon.ico",
  "artifactName": "${productName}-${version}-windows-${arch}.${ext}"
},
"nsis": {
  "oneClick": false,
  "allowToChangeInstallationDirectory": true,
  "createDesktopShortcut": true,
  "createStartMenuShortcut": true,
  "shortcutName": "ICPay",
  "uninstallDisplayName": "ICPay",
  "deleteAppDataOnUninstall": false
}
```

- **`oneClick: false`**: Provides a standard installation wizard instead of silent background installation.
- **`allowToChangeInstallationDirectory: true`**: Allows users to install to custom drives/folders (e.g. `D:\Apps\ICPay` instead of default `%LOCALAPPDATA%\Programs\ICPay`).
- **`createDesktopShortcut` & `createStartMenuShortcut`**: Automatically places shortcuts for quick launching.
- **`deleteAppDataOnUninstall: false`**: Retains user session and preferences if uninstalled and reinstalled later.

---

## 5. Icon Standards (`icon.ico`)

Windows requires a multi-resolution `.ico` container file placed at `desktop/builder/icon.ico`.

The `.ico` file must contain the following embedded bitmap sizes:
- `16×16` (Taskbar and window caption)
- `24×24` (Small menu items)
- `32×32` (Desktop icons on 100% DPI)
- `48×48` (Standard explorer list view)
- `64×64` (High DPI explorer views)
- `128×128` (Large tiles)
- `256×256` (Extra-large Windows Explorer icons)

In `main.js`, platform icon selection is handled automatically:
```javascript
function getIconPath() {
  if (process.platform === "win32") {
    return path.join(__dirname, "icon.ico")
  }
  return path.join(__dirname, "icon.png")
}
```

---

## 6. Testing & Verifying Builds

### Test 1: Verify Windows Filesystem Layout
Inspect `desktop/dist-builder/win-unpacked/`:
```bash
ls -la desktop/dist-builder/win-unpacked/
```
Key files required:
- `ICPay.exe` (Main entrypoint)
- `resources/app.asar` (Encapsulated application code and assets)
- `v8_context_snapshot.bin`, `icudtl.dat`, `ffmpeg.dll` (Chromium runtimes)

### Test 2: Generate & Verify Checksum
```bash
shasum -a 256 desktop/window/*.exe desktop/window/*.zip
```

### Test 3: Running on Windows or Virtual Machine
1. Run `ICPay-1.0.0-windows-x64.exe`.
2. Step through the NSIS installer wizard.
3. Launch from the created Desktop or Start Menu shortcut.
4. Test "Sign In" with Internet Identity: verify that the secondary authentication popup loads `identity.ic0.app` in a 520×720 window.
