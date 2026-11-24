# ICPay Desktop Architecture & Release Guide

Unified technical reference for building, packaging, deploying, and maintaining the ICPay cross-platform desktop application across macOS, Windows, and Linux.

---

## 1. Quick Navigation

- 🍎 **macOS Build Guide**: [`macguide.md`](file:///Users/prasangaramanpokharel/Desktop/icpay/docs/desktop/macguide.md) (Apple Silicon ARM64 & Intel x64 `.dmg` / `.zip`)
- 🪟 **Windows Build Guide**: [`windowguide.md`](file:///Users/prasangaramanpokharel/Desktop/icpay/docs/desktop/windowguide.md) (NSIS Setup `.exe` & Portable `.zip`)
- 🐧 **Linux Build Guide**: [`linuxguide.md`](file:///Users/prasangaramanpokharel/Desktop/icpay/docs/desktop/linuxguide.md) (Universal `.tar.gz` & unpacked binaries)

---

## 2. Directory Structure

```
desktop/
├── build.sh                  # Root bash wrapper: ./desktop/build.sh [all|mac|window|linux]
├── SHA256SUMS.txt            # SHA-256 cryptographic checksums for all release binaries
├── builder/                  # Electron-builder configuration and orchestration
│   ├── build.mjs             # Node.js build pipeline script
│   ├── main.js               # Electron main process (security sandbox, II popup handler)
│   ├── package.json          # Builder configuration, metadata, targets, and icons
│   ├── icon.icns             # Multi-resolution macOS icon (16x16 to 1024x1024)
│   ├── icon.ico              # Multi-resolution Windows icon (16x16 to 256x256)
│   └── icon.png              # High-resolution 512x512 Linux & fallback icon
├── mac/                      # macOS release output binaries
│   ├── ICPay-1.0.0-mac-arm64.dmg
│   ├── ICPay-1.0.0-mac-arm64.zip
│   ├── ICPay-1.0.0-mac-x64.dmg
│   ├── ICPay-1.0.0-mac-x64.zip
│   └── ICPay.app
├── window/                   # Windows release output binaries
│   ├── ICPay-1.0.0-windows-x64.exe
│   └── ICPay-1.0.0-windows-x64.zip
├── linux/                    # Linux release output binaries
│   └── ICPay-1.0.0-linux-x64.tar.gz
└── dist-builder/             # Intermediate builder cache and unpacked artifacts
```

---

## 3. Master Build Pipeline

To build all platforms in a single automated step:

```bash
./desktop/build.sh all
```

This will sequentially:
1. Build macOS Apple Silicon (`arm64`) & Intel (`x64`) `.dmg` and `.zip` archives.
2. Build Windows x64 NSIS installer (`.exe`) and portable archive (`.zip`).
3. Build Linux x64 universal tarball (`.tar.gz`).
4. Stage all binaries into `desktop/{mac,window,linux}/`.
5. Compute cryptographically secure SHA-256 hashes and save to `desktop/SHA256SUMS.txt`.

---

## 4. Cloudflare R2 Storage & CDN Hosting

All desktop release binaries are hosted on high-speed Cloudflare R2 Object Storage with edge CDN acceleration:

- **Account**: `Incpractical@gmail.com's Account` (`52ed3eb4e7e38e5b4114b0009536fb64`)
- **Bucket**: `icpay`
- **Public Domain**: `https://pub-5369792e75cb4166977efcd4cf9ea210.r2.dev/`

### Hosted Binaries Matrix

| OS / Format | CDN Path | Full Download URL |
|---|---|---|
| **macOS Apple Silicon (.dmg)** | `downloads/mac/ICPay-1.0.0-mac-arm64.dmg` | `https://pub-5369792e75cb4166977efcd4cf9ea210.r2.dev/downloads/mac/ICPay-1.0.0-mac-arm64.dmg` |
| **macOS Apple Silicon (.zip)** | `downloads/mac/ICPay-1.0.0-mac-arm64.zip` | `https://pub-5369792e75cb4166977efcd4cf9ea210.r2.dev/downloads/mac/ICPay-1.0.0-mac-arm64.zip` |
| **macOS Intel (.dmg)** | `downloads/mac/ICPay-1.0.0-mac-x64.dmg` | `https://pub-5369792e75cb4166977efcd4cf9ea210.r2.dev/downloads/mac/ICPay-1.0.0-mac-x64.dmg` |
| **macOS Intel (.zip)** | `downloads/mac/ICPay-1.0.0-mac-x64.zip` | `https://pub-5369792e75cb4166977efcd4cf9ea210.r2.dev/downloads/mac/ICPay-1.0.0-mac-x64.zip` |
| **Windows Installer (.exe)** | `downloads/window/ICPay-1.0.0-windows-x64.exe` | `https://pub-5369792e75cb4166977efcd4cf9ea210.r2.dev/downloads/window/ICPay-1.0.0-windows-x64.exe` |
| **Windows Portable (.zip)** | `downloads/window/ICPay-1.0.0-windows-x64.zip` | `https://pub-5369792e75cb4166977efcd4cf9ea210.r2.dev/downloads/window/ICPay-1.0.0-windows-x64.zip` |
| **Linux Tarball (.tar.gz)** | `downloads/linux/ICPay-1.0.0-linux-x64.tar.gz` | `https://pub-5369792e75cb4166977efcd4cf9ea210.r2.dev/downloads/linux/ICPay-1.0.0-linux-x64.tar.gz` |
| **Integrity Checksums** | `downloads/SHA256SUMS.txt` | `https://pub-5369792e75cb4166977efcd4cf9ea210.r2.dev/downloads/SHA256SUMS.txt` |

### Uploading New Releases to R2

Using the AWS S3 CLI with Cloudflare R2 credentials:
```bash
ENDPOINT="https://52ed3eb4e7e38e5b4114b0009536fb64.r2.cloudflarestorage.com"

# Upload macOS
aws s3 sync desktop/mac/ s3://icpay/downloads/mac/ --endpoint-url "$ENDPOINT"

# Upload Windows
aws s3 sync desktop/window/ s3://icpay/downloads/window/ --endpoint-url "$ENDPOINT"

# Upload Linux
aws s3 sync desktop/linux/ s3://icpay/downloads/linux/ --endpoint-url "$ENDPOINT"

# Upload Checksums
aws s3 cp desktop/SHA256SUMS.txt s3://icpay/downloads/SHA256SUMS.txt --endpoint-url "$ENDPOINT"
```

---

## 5. Security & Isolation Architecture

The desktop application enforces strict browser-grade security boundaries:
1. **Context Isolation**: `contextIsolation: true` prevents remote web code from executing privileged Node.js APIs.
2. **Sandbox Enforcement**: `sandbox: true` runs Chromium renderers within unprivileged OS sandbox profiles.
3. **Restricted Navigation**: Intercepts `will-navigate` events and blocks navigation to unapproved external domains, redirecting them safely to the OS default browser.
4. **Internet Identity Authentication Modal**:
   ```javascript
   win.webContents.setWindowOpenHandler(({ url }) => {
     const parsed = new URL(url)
     if (isAllowedHost(parsed.hostname)) {
       return {
         action: "allow",
         overrideBrowserWindowOptions: {
           width: 520,
           height: 720,
           center: true,
           title: "Internet Identity",
           webPreferences: {
             nodeIntegration: false,
             contextIsolation: true,
             sandbox: true,
           },
         },
       }
     }
     shell.openExternal(url)
     return { action: "deny" }
   })
   ```
   This guarantees that login flows with Internet Identity work seamlessly while isolating cryptographic web authentication from system host execution.
