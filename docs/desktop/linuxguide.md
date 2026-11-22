# Linux Desktop Application Build Guide

Comprehensive documentation for building, packaging, and verifying native Linux releases for ICPay (`.tar.gz`, `AppImage`, `.deb`, `.rpm`).

---

## 1. Overview & Artifacts

The Linux build is designed for maximum compatibility across modern distributions (Ubuntu, Debian, Fedora, Arch Linux, openSUSE).

| Format | Artifact Name | Description |
|---|---|---|
| **Compressed Tarball** | `ICPay-1.0.0-linux-x64.tar.gz` | Universal, portable tarball containing the standalone binary bundle |
| **Unpacked Application** | `desktop/dist-builder/linux-unpacked/` | Directly executable directory with `icpay-wallet` and Chrome sandboxes |
| **Debian Package** (optional) | `ICPay-1.0.0-linux-amd64.deb` | Native package for Ubuntu / Debian (`apt` / `dpkg`) |
| **RedHat Package** (optional) | `ICPay-1.0.0-linux-x86_64.rpm` | Native package for Fedora / RHEL / openSUSE (`dnf` / `rpm`) |
| **AppImage** (optional) | `ICPay-1.0.0-linux-x86_64.AppImage` | Single-file executable container with all runtime dependencies |

---

## 2. Prerequisites & Environment

### Cross-Compiling from macOS or Windows
`electron-builder` natively supports building Linux `tar.gz` archives from any host OS (including macOS and Windows) without Docker or emulation:
- Node.js `v20.x` or `v22.x` LTS.
- `desktop/builder/icon.png` (512×512 PNG icon).

### Building Native `.deb`, `.rpm`, or `.AppImage`
Native packaging formats like `.deb` and `.rpm` on non-Linux hosts require Docker or Linux tools:
```bash
# On Ubuntu / Debian hosts:
sudo apt update && sudo apt install -y rpm fakeroot dpkg
```

---

## 3. Build Commands

### Option A: The Unified Orchestrator Script (Recommended)

Run the root desktop build script with the `linux` target:
```bash
./desktop/build.sh linux
```
*This runs `node desktop/builder/build.mjs linux`, which invokes `electron-builder --linux tar.gz --x64` and stages the archive in `desktop/linux/` and `downloads/linux/`.*

### Option B: Direct `electron-builder` CLI

Navigate to the builder package directory:
```bash
cd desktop/builder
```

1. **Build Universal Tarball (`.tar.gz`)**:
   ```bash
   npx --yes electron-builder --linux tar.gz --x64
   ```

2. **Build All Linux Formats (on Linux host with Docker/fpm)**:
   ```bash
   npx --yes electron-builder --linux AppImage deb rpm tar.gz --x64
   ```

---

## 4. Configuration Details (`desktop/builder/package.json`)

```json
"linux": {
  "target": [
    { "target": "AppImage", "arch": ["x64"] },
    { "target": "deb", "arch": ["x64"] },
    { "target": "rpm", "arch": ["x64"] },
    { "target": "tar.gz", "arch": ["x64"] }
  ],
  "icon": "icon.png",
  "category": "Finance",
  "maintainer": "ICPay <contact@icpay.app>",
  "synopsis": "Decentralized ICP wallet and on-chain storage client",
  "description": "Native desktop client for ICPay: custodial ICP wallet, username payments, and ICBucket on-chain storage.",
  "artifactName": "${productName}-${version}-linux-${arch}.${ext}"
}
```

---

## 5. Linux Permissions & SUID Sandbox (`chrome-sandbox`)

Modern Chromium builds require setuid root permissions for `chrome-sandbox` unless unprivileged user namespaces are enabled in the kernel:

1. **Extracting Tarball on Linux**:
   ```bash
   tar -xzf ICPay-1.0.0-linux-x64.tar.gz
   cd icpay-wallet/
   ```

2. **Configuring Sandbox**:
   ```bash
   # Set root ownership and SUID bit for the Chrome sandbox
   sudo chown root:root chrome-sandbox
   sudo chmod 4755 chrome-sandbox
   ```

3. **Running the App**:
   ```bash
   ./icpay-wallet
   ```

4. **Running in Containers / Without SUID Sandbox**:
   If running inside Docker, WSL, or systems without user namespace access:
   ```bash
   ./icpay-wallet --no-sandbox
   ```

---

## 6. Creating a Desktop Launcher (`icpay.desktop`)

To integrate ICPay into GNOME, KDE, or XFCE app menus:

Create `~/.local/share/applications/icpay.desktop` (or `/usr/share/applications/icpay.desktop` for system-wide):

```ini
[Desktop Entry]
Name=ICPay
Comment=Internet Computer Custodial Wallet and Cloud Client
Exec=/opt/icpay/icpay-wallet %U
Icon=/opt/icpay/resources/icon.png
Terminal=false
Type=Application
Categories=Finance;Network;Utility;
MimeType=x-scheme-handler/icpay;
```

Update desktop database:
```bash
update-desktop-database ~/.local/share/applications
```

---

## 7. Testing & Verification

1. **Test Archive Integrity**:
   ```bash
   tar -tzf desktop/linux/ICPay-1.0.0-linux-x64.tar.gz | head -n 20
   ```

2. **Compute Checksum**:
   ```bash
   shasum -a 256 desktop/linux/ICPay-1.0.0-linux-x64.tar.gz
   ```
