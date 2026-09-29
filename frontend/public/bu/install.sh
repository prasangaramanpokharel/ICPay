#!/usr/bin/env bash
# ICPay icBucket CLI Installer
# Usage: curl -sSL https://icpay.app/bu/install.sh | bash

set -e

# Styling
CYAN='\033[0;36m'
GREEN='\033[0;32m'
PURPLE='\033[0;35m'
YELLOW='\033[1;33m'
BOLD='\033[1m'
NC='\033[0m' # No Color

echo -e "${PURPLE}"
cat << "EOF"
    _     ____             _        _   
   (_)___| __ ) _   _  ___| | _____| |_ 
   | / __|  _ \| | | |/ __| |/ / _ \ __|
   | \__ \ |_) | |_| | (__|   <  __/ |_ 
   |_|___/____/ \__,_|\___|_|\_\___|\__|
EOF
echo -e "${NC}"
echo -e "${BOLD}icBucket — Decentralized On-Chain Cloud Storage (ICPay)${NC}"
echo -e "${CYAN}https://icpay.app/bucket${NC}"
echo ""

# 1. Check Node.js
echo -e "🔎 Checking local environment..."
if ! command -v node >/dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Node.js was not detected on your system.${NC}"
    echo -e "   Please install Node.js (v18+) to run the CLI: https://nodejs.org"
    echo -e "   Or install via fnm/nvm: curl -fsSL https://fnm.vercel.app/install | bash"
    exit 1
fi

NODE_VERSION=$(node -v)
echo -e "   ✓ Node.js ${NODE_VERSION} detected"

if ! command -v npm >/dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  npm is required to install icBucket CLI.${NC}"
    exit 1
fi
echo -e "   ✓ npm detected"

# 2. Install CLI
echo ""
echo -e "📦 Installing icBucket CLI globally..."

# Try npm install -g, fallback to user directory if sudo needed
if npm install -g icpay-bucket >/dev/null 2>&1; then
    echo -e "${GREEN}✓ Successfully installed icpay-bucket globally!${NC}"
else
    echo -e "${YELLOW}ℹ Global install required permissions, installing to local prefix...${NC}"
    npm install --prefix "${HOME}/.local" -g icpay-bucket >/dev/null 2>&1 || {
        echo -e "${YELLOW}Run manual install with:${NC} npm install -g icpay-bucket"
    }
fi

# 3. Setup Config Directory
CONFIG_DIR="${HOME}/.icpay"
mkdir -p "${CONFIG_DIR}"

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BOLD}🎉 icBucket CLI is ready!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${BOLD}Quickstart Guide:${NC}"
echo -e "  1. Get your ${CYAN}Free 1 GB Plan${NC} and API Key at:"
echo -e "     ${BOLD}https://icpay.app/bucket${NC}"
echo ""
echo -e "  2. Upload any file or folder directly on-chain:"
echo -e "     ${CYAN}icbucket upload ./my-folder${NC}"
echo ""
echo -e "  3. List your active buckets:"
echo -e "     ${CYAN}icbucket list${NC}"
echo ""
echo -e "${PURPLE}Need more storage? Instant 10 GB - 100 GB plans available at:${NC}"
echo -e "${CYAN}https://icpay.app/bucket/pricing${NC}"
echo ""
