---
name: icpay-services-standard
description: Typed canister and API service layer in services/ — folder-per-module, zero inline fetches, typed DTOs. Read before adding or modifying anything under frontend/services/.
---

# ICPay — `services/` Standard

All backend and canister calls go through a typed **service layer**, organized **folder-first by module** (mirrors the components rule). Components and pages call services or data hooks — **never `fetch()` or instantiate actors inline**.

---

## 1. Directory Structure

```
services/
├── icp.ts               # Internet Identity auth client, agent derivation, login/logout
├── client.ts            # canister actor factory, IDL declarations
├── tokens.ts            # ICP & ICRC-1 ledger constants and canister IDs
├── wallet.ts            # backend canister caller bindings
├── types.ts             # shared DTOs (User, Wallet, ApiKey, Payment, Ticket, …)
├── auth/                # session management and delegation
├── account/             # account balance and subaccount resolution
├── transfer/            # ICP & ICRC token transfers
├── withdraw/            # canister subaccount withdrawal
├── deposit/             # subaccount generation and balance sync
├── buy/                 # ICPay token acquisition
├── profile/             # username registration, lookup, avatar updates
├── canister/            # developer canister creation, top-up, cycles management
├── dashboard/           # dashboard metrics, user summary
└── community/           # on-chain community channels, messages, reactions
```

---

## 2. Core Rules

1. **Folder-first by domain**: One module = one folder; one resource = one file (`<module>/<resource>.ts`).
2. **Named async functions only**: Export named async functions returning strongly-typed DTOs. No default exports.
3. **Never instantiate HttpAgent in UI components**: Agent resolution and actor creation must strictly go through `services/icp.ts` and `services/client.ts`.
4. **Origin Parity**: Ensure `ALTERNATIVE_ORIGINS` in `services/icp.ts` matches `frontend/public/.well-known/ii-alternative-origins` exactly.
5. **Zero inline calls**: Components must never call the Internet Computer or run raw `fetch()` directly; always invoke `services/` or `hooks/`.
6. **Error handling**: Handle canister traps and agent errors at the service boundary. Return clean DTOs or thrown typed errors (`ApiError`) with user-friendly messages for toasts (`Sonner` / `Alert`).

---

## 3. Related Standards

| Standard | Path |
|---|---|
| Master frontend skills | [`SKILLS.md`](../../SKILLS.md) |
| Pure helpers standard | [`skills/lib-standard/SKILL.md`](../lib-standard/SKILL.md) |
| Data hooks standard | [`skills/hooks-standard/SKILL.md`](../hooks-standard/SKILL.md) |
| Backend Motoko skill | [`.claude/skills/icpay-backend/SKILL.md`](../../../../.claude/skills/icpay-backend/SKILL.md) |
