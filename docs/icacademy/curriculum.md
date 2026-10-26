# ICAcademy Curriculum Specifications

Flagship courses, module breakdown, and lesson outlines for the ICAcademy developer program.

---

## Flagship Course 1: Full-Stack Motoko & Canister Engineering
- **Level**: Intermediate
- **Total Duration**: 18 Hours
- **Lessons**: 24 Lessons across 4 Modules
- **Focus**: Orthogonal persistence, actor model, inter-canister calls, cycles management, and upgrade safety.

### Module 1: Actor Model & Orthogonal Persistence
- Lesson 1.1: WebAssembly & Orthogonal Persistence Fundamentals (18 min)
- Lesson 1.2: Persistent Actor Syntax vs Legacy Upgrades (22 min)
- Lesson 1.3: Stable Structures & 64-bit Memory Addressing (25 min)
- Lesson 1.4: Asynchronous Messaging & Trap Boundaries (20 min)

### Module 2: Layered Architecture & Service Orchestration
- Lesson 2.1: Designing API, Service, and Repository Layers (24 min)
- Lesson 2.2: Safe Motoko Keywords: Avoiding Reserved Traps (15 min)
- Lesson 2.3: Inter-Canister Calls & Two-Phase Commit Patterns (30 min)
- Lesson 2.4: Unit & Integration Testing with PocketIC (28 min)

### Module 3: Cycles Economics & Memory Ceilings
- Lesson 3.1: Understanding the 2.19 GB High-Water Mark (20 min)
- Lesson 3.2: Cycle Top-Ups via Cycles Ledger (16 min)
- Lesson 3.3: In-Place Migrations: Avoiding 3.0 GiB Upgrade Traps (25 min)
- Lesson 3.4: Autonomous Canister Management & Heartbeats (22 min)

### Module 4: Production Deployment & Mainnet Hardening
- Lesson 4.1: Securing Root Controllers & Blackholing Canisters (25 min)
- Lesson 4.2: CI/CD Pipeline Automation with DFX (20 min)
- Lesson 4.3: Monitoring, Heap Inspection, and Logging (24 min)
- Lesson 4.4: Final Capstone: Building a Production DAO Vault (45 min)

---

## Flagship Course 2: ICBucket & Decentralized S3 Cloud
- **Level**: Advanced
- **Total Duration**: 14 Hours
- **Lessons**: 18 Lessons across 3 Modules
- **Focus**: S3-compatible APIs, chunked uploads, boundary node caching, and zero egress fees.

### Module 1: The Zero-Egress Cloud Paradigm
- Lesson 1.1: Reverse Gas Tokenomics vs AWS Data Transfer Fees (18 min)
- Lesson 1.2: Chunked Upload Protocol & Streaming Queries (26 min)
- Lesson 1.3: Boundary Node Caching & HTTP Gateway Architecture (22 min)

### Module 2: Multi-Canister Sharding & Blob Store
- Lesson 2.1: 0 to 400 GB Sharding Architectures (30 min)
- Lesson 2.2: Scoped API Key Derivation & Cryptographic Nonces (24 min)
- Lesson 2.3: Integrating ICBucket SDK in React & Node.js (28 min)

### Module 3: Enterprise File Systems & Migrations
- Lesson 3.1: Moving from AWS S3 to On-Chain Storage (25 min)
- Lesson 3.2: Media Compression, Thumbnails, and Edge Delivery (20 min)
- Lesson 3.3: Capstone: Building an On-Chain Decentralized Drive (40 min)

---

## Flagship Course 3: Internet Identity & Custody Architectures
- **Level**: Beginner to Intermediate
- **Total Duration**: 10 Hours
- **Lessons**: 14 Lessons across 3 Modules
- **Focus**: Passkeys, WebAuthn, caller-derived subaccounts, and non-custodial fintech principles.

### Module 1: WebAuthn & Internet Identity
- Lesson 1.1: Eliminating Seed Phrases: Cryptographic Authenticator Tech (20 min)
- Lesson 1.2: Derivation Origins & Cross-Domain Security (22 min)
- Lesson 1.3: Delegated Identity Verification in Agent-JS (25 min)

### Module 2: Caller-Derived Subaccount Ledgers
- Lesson 2.1: The Custodial Model: Why Caller IS The Account (24 min)
- Lesson 2.2: ICRC-1 & ICRC-2 Token Standards (26 min)
- Lesson 2.3: Zero-Custody Secret Management: Why No Private Keys (20 min)

### Module 3: Fintech Payment Orchestration
- Lesson 3.1: Usernames and Identity Mapping in ICPay (22 min)
- Lesson 3.2: Real-time Transaction Notifications (18 min)
- Lesson 3.3: Capstone: Building a Peer-to-Peer Micro-Payment App (35 min)
