#!/usr/bin/env bash
# ICPay icFalcon Motoko Canister Framework Installer
# Usage: curl -sSL https://icpay.app/flc/install.sh | bash
#    or: curl -sSL https://icpay.app/flc/install.sh | bash -s -- my-app

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

# 1. Check Node.js (v18+ required)
echo -e "🔎 Checking development environment..."
if ! command -v node >/dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Node.js was not detected on your system.${NC}"
    echo -e "   Please install Node.js (v18+) to run the framework: https://nodejs.org"
    exit 1
fi

NODE_MAJOR=$(node -v | sed 's/v\([0-9]*\).*/\1/')
if [ "$NODE_MAJOR" -lt 18 ]; then
    echo -e "${YELLOW}⚠️  Node.js $(node -v) detected, but Node 18+ is required.${NC}"
    echo -e "   Please upgrade Node.js: https://nodejs.org"
    exit 1
fi
echo -e "   ✓ Node.js $(node -v) detected"

# 2. Check Git (required for scaffolding template)
if command -v git >/dev/null 2>&1; then
    echo -e "   ✓ Git $(git --version | awk '{print $3}') detected"
else
    echo -e "${YELLOW}⚠️  Git was not detected on your system.${NC}"
    echo -e "   Git is required to clone templates: https://git-scm.com"
    exit 1
fi

# 3. Check DFX (Internet Computer SDK)
if command -v dfx >/dev/null 2>&1; then
    echo -e "   ✓ DFX $(dfx --version) detected"
else
    echo -e "${YELLOW}ℹ  DFX is recommended for local canister development.${NC}"
    echo -e "   Install anytime via: sh -ci \"\$(curl -fsSL https://internetcomputer.org/install.sh)\""
fi

# 4. Check Mops (Motoko Package Manager)
if command -v mops >/dev/null 2>&1; then
    MOPS_VER=$(mops --version 2>/dev/null | head -n 1)
    echo -e "   ✓ Mops ${MOPS_VER} detected"
else
    echo -e "   📦 Installing Mops (Motoko package manager)..."
    npm install -g ic-mops >/dev/null 2>&1 || true
    if command -v mops >/dev/null 2>&1; then
        echo -e "   ✓ Mops installed successfully!"
    else
        echo -e "${YELLOW}ℹ  Mops install skipped. You can install anytime via: npm install -g ic-mops${NC}"
    fi
fi

# 5. Install create-icfalcon CLI globally
echo ""
echo -e "📦 Installing icFalcon CLI tools..."
if npm install -g create-icfalcon >/dev/null 2>&1; then
    echo -e "${GREEN}✓ Successfully installed create-icfalcon globally!${NC}"
else
    echo -e "${YELLOW}ℹ Global install skipped (permissions). Running via npx / npm create.${NC}"
fi

# 6. Interactive Project Creation
echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BOLD}🦅 Ready to scaffold your IcFalcon project!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

PROJECT_NAME=""
if [ -n "${1:-}" ]; then
    PROJECT_NAME="$1"
elif [ -t 0 ]; then
    read -r -p "Enter your project name (press Enter for 'my-app'): " USER_INPUT || USER_INPUT=""
    PROJECT_NAME="${USER_INPUT:-my-app}"
elif [ -p /dev/stdin ] && read -t 1 -r USER_INPUT 2>/dev/null; then
    PROJECT_NAME="${USER_INPUT:-my-app}"
elif [ -r /dev/tty ] && [ -w /dev/tty ]; then
    read -r -p "Enter your project name (press Enter for 'my-app'): " USER_INPUT </dev/tty 2>/dev/null || USER_INPUT=""
    PROJECT_NAME="${USER_INPUT:-my-app}"
else
    PROJECT_NAME="my-app"
fi

# Clean and normalize project name
PROJECT_NAME="$(echo "${PROJECT_NAME}" | tr -d '[:space:]')"
PROJECT_NAME="${PROJECT_NAME:-my-app}"

echo ""
echo -e "🚀 Creating IcFalcon project: ${CYAN}${BOLD}${PROJECT_NAME}${NC}..."
echo ""

# Run project creation without interactive prompts for package download
if command -v create-icfalcon >/dev/null 2>&1; then
    create-icfalcon "${PROJECT_NAME}"
else
    npm create --yes icfalcon@latest "${PROJECT_NAME}"
fi

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BOLD}🚀 Project ready! Start building:${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "  ${CYAN}cd ${PROJECT_NAME}${NC}"
echo -e "  ${CYAN}falcon f:dev${NC}       ${NC}# Start Next.js frontend dev server${NC}"
echo -e "  ${CYAN}falcon b:test${NC}      ${NC}# Run Motoko backend unit tests${NC}"
echo -e "  ${CYAN}falcon help${NC}        ${NC}# View all commands (deploy, scaffold, audit)${NC}"
echo ""
echo -e "${BLUE}Documentation & Guides:${NC}"
echo -e "${CYAN}https://icpay.app/icfalcon${NC}"
echo ""
