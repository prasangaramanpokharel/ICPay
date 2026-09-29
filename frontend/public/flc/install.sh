#!/usr/bin/env bash
# ICPay icFalcon Motoko Canister Framework Installer
# Usage: curl -sSL https://icpay.app/flc/install.sh | bash

set -e

# Styling
CYAN='\033[0;36m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
BOLD='\033[1m'
NC='\033[0m' # No Color

echo -e "${BLUE}"
cat << "EOF"
    _      _____     _                 
   (_)___ |  ___|_ _| | ___ ___  _ __  
   | / __|| |_ / _` | |/ __/ _ \| '_ \ 
   | \__ \|  _| (_| | | (_| (_) | | | |
   |_|___/|_|  \__,_|_|\___\___/|_| |_|
EOF
echo -e "${NC}"
echo -e "${BOLD}icFalcon — Motoko Framework for Internet Computer (ICPay)${NC}"
echo -e "${CYAN}https://icpay.app/icfalcon${NC}"
echo ""

# 1. Check Node.js
echo -e "🔎 Checking development environment..."
if ! command -v node >/dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Node.js was not detected on your system.${NC}"
    echo -e "   Please install Node.js (v18+) to run the framework: https://nodejs.org"
    exit 1
fi
echo -e "   ✓ Node.js $(node -v) detected"

# 2. Check DFX (Internet Computer SDK)
if command -v dfx >/dev/null 2>&1; then
    echo -e "   ✓ DFX $(dfx --version) detected"
else
    echo -e "${YELLOW}ℹ  DFX is recommended for local canister development.${NC}"
    echo -e "   Install anytime via: sh -ci \"\$(curl -fsSL https://internetcomputer.org/install.sh)\""
fi

# 3. Install icfalcon CLI globally
echo ""
echo -e "📦 Installing icFalcon CLI tools..."
if npm install -g icfalcon >/dev/null 2>&1; then
    echo -e "${GREEN}✓ Successfully installed icfalcon globally!${NC}"
else
    echo -e "${YELLOW}ℹ Global install required permissions. You can also run directly with npx.${NC}"
fi

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BOLD}🦅 icFalcon is ready!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${BOLD}Create your first Motoko canister app in seconds:${NC}"
echo -e "  ${CYAN}npm create icfalcon@latest my-app${NC}"
echo ""
echo -e "${BOLD}Then start building:${NC}"
echo -e "  cd my-app"
echo -e "  npm run dev"
echo ""
echo -e "${BLUE}Documentation & Guides:${NC}"
echo -e "${CYAN}https://icpay.app/icfalcon${NC}"
echo ""
