#!/usr/bin/env bash
# Reserve ICPay feature page names to prevent username collision
# Run from backend/ directory

set -e

export DFX_WARNING=-mainnet_plaintext_identity

NETWORK="${1:-ic}"

# New ICPay product brands
echo "Reserving product brands..."
dfx canister call icp_wallet_backend reserveUsername '("icfalcon")' --network "$NETWORK"
dfx canister call icp_wallet_backend reserveUsername '("icbucket")' --network "$NETWORK"

# New feature page names (route collision protection, <= 8 chars)
# Note: 'analytics' (9 chars) and 'transactions' (12 chars) cannot be reserved
# because Config.MAX_USERNAME_LENGTH is 8, which already inherently prevents any
# user from ever claiming them. 'admin' was claimed by an early user.
echo "Reserving feature pages..."
dfx canister call icp_wallet_backend reserveUsername '("about")' --network "$NETWORK"
dfx canister call icp_wallet_backend reserveUsername '("academy")' --network "$NETWORK"
dfx canister call icp_wallet_backend reserveUsername '("audit")' --network "$NETWORK"
dfx canister call icp_wallet_backend reserveUsername '("blog")' --network "$NETWORK"
dfx canister call icp_wallet_backend reserveUsername '("bucket")' --network "$NETWORK"
dfx canister call icp_wallet_backend reserveUsername '("canister")' --network "$NETWORK"
dfx canister call icp_wallet_backend reserveUsername '("channels")' --network "$NETWORK"
dfx canister call icp_wallet_backend reserveUsername '("charity")' --network "$NETWORK"
dfx canister call icp_wallet_backend reserveUsername '("contact")' --network "$NETWORK"
dfx canister call icp_wallet_backend reserveUsername '("courses")' --network "$NETWORK"
dfx canister call icp_wallet_backend reserveUsername '("deposit")' --network "$NETWORK"
dfx canister call icp_wallet_backend reserveUsername '("docs")' --network "$NETWORK"
dfx canister call icp_wallet_backend reserveUsername '("faq")' --network "$NETWORK"
dfx canister call icp_wallet_backend reserveUsername '("home")' --network "$NETWORK"
dfx canister call icp_wallet_backend reserveUsername '("launch")' --network "$NETWORK"
dfx canister call icp_wallet_backend reserveUsername '("live")' --network "$NETWORK"
dfx canister call icp_wallet_backend reserveUsername '("login")' --network "$NETWORK"
dfx canister call icp_wallet_backend reserveUsername '("payout")' --network "$NETWORK"
dfx canister call icp_wallet_backend reserveUsername '("privacy")' --network "$NETWORK"
dfx canister call icp_wallet_backend reserveUsername '("profile")' --network "$NETWORK"
dfx canister call icp_wallet_backend reserveUsername '("roadmap")' --network "$NETWORK"
dfx canister call icp_wallet_backend reserveUsername '("settings")' --network "$NETWORK"
dfx canister call icp_wallet_backend reserveUsername '("terms")' --network "$NETWORK"
dfx canister call icp_wallet_backend reserveUsername '("topup")' --network "$NETWORK"
dfx canister call icp_wallet_backend reserveUsername '("trade")' --network "$NETWORK"
dfx canister call icp_wallet_backend reserveUsername '("transfer")' --network "$NETWORK"
dfx canister call icp_wallet_backend reserveUsername '("verse")' --network "$NETWORK"
dfx canister call icp_wallet_backend reserveUsername '("withdraw")' --network "$NETWORK"

echo ""
echo "Done. Verify with:"
echo "dfx canister call icp_wallet_backend listReservedUsernames --network $NETWORK"
