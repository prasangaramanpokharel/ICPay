---
name: icpay-rules
description: Anti-feature-creep and engineering quality gate for ICPay. Enforces YAGNI, KISS, SOLID, DRY, architectural boundaries, and the mandatory 5-point feature approval checklist before implementing any new feature or module.
---

# ICPay Engineering Rules & Anti-Feature-Creep Gate

Guidelines and mandatory validation gates to prevent **Feature Creep**, maintain clean architectural boundaries, and protect ICPay from unnecessary complexity and technical debt.

---

## 1. Core Engineering Principles

* **YAGNI (You Aren't Gonna Need It)**:
  * Never implement features, flags, or layers for hypothetical future needs.
  * Implement only what solves an immediate, verified requirement.
  * Reject speculative parameters, premature generalizations, and unused endpoints.
* **KISS (Keep It Simple, Stupid)**:
  * Choose the simplest, most direct implementation that completely solves the problem.
  * Avoid convoluted abstractions, nested indirection, or over-engineered design patterns.
* **DRY (Don't Repeat Yourself)**:
  * Do not duplicate business logic, canister calls, or validation rules across modules.
  * Consolidate shared logic into canonical utilities, but do not prematurely couple unrelated modules.
* **SOLID & Separation of Concerns**:
  * Every module, service, and component must have a single, well-defined responsibility.
  * Enforce strict directional dependencies: high-level business policies must not depend on low-level UI details.

---

## 2. Architectural Boundaries & Module Segregation

Every piece of code belongs to a strictly defined layer and canister boundary:

```
backend/
├── src/                      # Control Plane (icp_wallet_backend: 6vbhm-nqaaa-aaaan-q6muq-cai)
│   ├── api/v1/               # Thin handlers (caller + params -> ApiResult)
│   ├── services/             # Core wallet logic, ledger transfers, billing, registry
│   ├── repositories/         # Storage find / create / update operations
│   └── storage/              # Stable data structures (UserStorage, TransactionStorage)
│   # INVARIANT: NEVER store raw file chunks, logs, or third-party blobs here!
├── blob_store/               # Data Plane (icp_blob_store: fly6t-piaaa-aaaan-q6oga-cai)
│   # Dedicated raw file chunk storage and HTTP streaming (up to 400 GB)
├── notifier/                 # Notifier Plane (icpay_notifier: 2hvuh-xiaaa-aaaan-q6uua-cai)
│   # Autonomous daily sweeps and lifecycle alerts (keeps wallet canister lean)
└── rust/                     # Independent microservices (DEX, compute, stable structures)

frontend/
├── app/                      # Thin route layouts & pages (Static export only: no Node runtime)
├── components/               # Domain-isolated UI (shadcn primitives, zero comments, semantic colors)
├── services/                 # Actor / IC Agent integration layer (Never call HttpAgent in UI)
└── lib/                      # Pure, framework-agnostic utilities and helpers
```

---

## 3. The Mandatory Feature Approval Gate

Before writing code for ANY new module, endpoint, or feature—**even when explicitly asked by the user**—the agent MUST evaluate the request against this 5-point gate:

| Gate | Question to Answer | If Failed |
|---|---|---|
| **1. Real Problem** | Does this solve a concrete, documented problem for ICPay users? | Reject or challenge the request. Ask for the core user problem. |
| **2. Non-Duplication** | Does an existing feature, endpoint, or service already accomplish this? | Extend or reuse the existing implementation. Do not duplicate. |
| **3. Proper Boundary** | Does this belong in this specific module/canister without violating layering? | Move to the correct domain (e.g., Blob Store, Frontend, Rust canister). |
| **4. Cost & Memory** | Will this increase the canister memory high-water mark or idle burn runway? | Redesign for zero/minimal state growth. Memory allocations are permanent. |
| **5. YAGNI Test** | Is this strictly required right now, or is it an assumption about future needs? | Strip out hypothetical requirements. Deliver only the minimal viable delta. |

---

## 4. MoSCoW Prioritization

Classify every proposed change before starting implementation:

1. **Must Have (P1)**: Critical security, custody safety, broken ledger flows, or core invariants.
2. **Should Have (P2)**: High-impact UX, performance, or operational reliability for production paths.
3. **Could Have (P3)**: Minor convenience features that add zero architectural debt and can wait.
4. **Won't Have (Rejected / Backlog)**: Speculative ideas, unneeded dependencies, non-custodial clutter inside the wallet canister, or premature abstractions.

---

## 5. The 5 Golden Rules of ICPay Development

1. **No feature without a documented requirement**: Every addition must trace to a verified user outcome.
2. **No feature without a clear module owner**: Code must live in the designated layer and directory.
3. **No unnecessary abstraction**: Write concrete, simple code first. Abstract only when 3+ identical use cases exist.
4. **Refactor when complexity starts increasing**: When a service module approaches ~300 lines, split it into a domain subfolder. Keep files focused and lean.
5. **Intercept before implementing**: If a requested feature violates YAGNI or adds technical debt, pause, run the checklist, state the trade-offs, and recommend the simplest path.
