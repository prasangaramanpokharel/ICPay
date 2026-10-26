# Video Script: How to Build & Ship ICP Canisters with ICFalcon

**Document Path:** `docs/marketing/video/icfalcon-guide.md`  
**Topic:** End-to-End Developer Guide: Scaffolding, 4-Layer Architecture, icp-hub Packages & CLI Operations with ICFalcon  
**Target Audience:** Web3 Developers, Motoko Engineers, Full-Stack Builders, Hackathon Participants  
**Tone:** Practical, high-signal, developer-to-developer, punchy and authentic (no fluff)  
**Primary Formats:**  
1. **Full Tutorial / Walkthrough (~3:30 min)** for YouTube & X (Twitter)  
2. **60-Second Fast-Paced Short / Reel** for YouTube Shorts, X & TikTok  

---

## 1. Full Walkthrough Video (~3:30 Min)

### Video Metadata
* **Title:** Build Production ICP Canisters in 3 Minutes: The ICFalcon Guide
* **Thumbnail Concept:** Dark terminal split screen. Left side: `npm create icfalcon@latest` with a green checkmark. Right side: Diagram showing `api -> service -> repository -> storage`. Big bold text: *FULL-STACK ICP IN 3 MINS*.
* **Description / Links:** Learn how to scaffold, build, and deploy production-ready full-stack Internet Computer dApps using ICFalcon. Includes four-layer Motoko architecture, Next.js 16 with WebAuthn passkeys, icp-hub modular packages, and the unified `falcon` CLI.  
  * Portal: `https://icpay.app/icfalcon`  
  * Commands Reference: `https://icpay.app/products/icFalcon/commands`  
  * Packages Registry: `https://icpay.app/products/icFalcon/packages`

---

### Step-by-Step Visual Plan & Audio Voiceover

#### [0:00 - 0:35] The Problem: Why `dfx new` Isn't Enough for Production
* **Visual:** Split screen. On the left, a bloated 1,500-line monolithic `main.mo` actor file. On the right, a terminal error: `Canister trapped during upgrade: state deserialization failed`.
* **Audio Voiceover:**
  > "If you've ever started a project with `dfx new`, you know what happens next: you get a bare-bones 'Hello World' actor and a minimal frontend. 
  > 
  > Within a few weeks, your canister turns into a thousand-line monolithic file where state, HTTP routing, business logic, and database queries are tangled together. And the moment you push an upgrade, one deserialization panic can wipe out your persistent state or brick your canister.
  > 
  > That's why we created **ICFalcon**—the production-ready Motoko framework and CLI used by ICPay. Here is how to scaffold, build, and deploy an enterprise-grade ICP application in under three minutes."

---

#### [0:35 - 1:15] Step 1: Instant Scaffolding (`npm create icfalcon`)
* **Visual:** Screen opens terminal. User types:
  ```bash
  npm create icfalcon@latest my-app
  ```
  Watch the interactive scaffold prompt complete in 5 seconds.  
  Switch to VS Code to show the clean folder structure:
  - `backend/src/api/v1/`
  - `backend/src/services/`
  - `backend/src/repositories/`
  - `backend/src/storage/`
  - `frontend/` (Next.js App Router with Internet Identity & Passkeys)
* **Audio Voiceover:**
  > "Step one: open your terminal and run:
  > `npm create icfalcon@latest my-app`.
  > 
  > In five seconds, ICFalcon scaffolds a complete full-stack environment. 
  > 
  > Look at the backend architecture. ICFalcon strictly enforces a four-layer separation of concerns:
  > 1. **api/v1**: Validates callers and parses Candid types. Zero business logic.
  > 2. **services**: Orchestrates domain logic and cross-canister calls.
  > 3. **repositories**: Manages data querying and indexing.
  > 4. **storage**: Manages stable memory persistence across canister upgrades with zero data loss.
  > 
  > On the frontend, you get Next.js 16 wired with biometric WebAuthn authentication out of the box."

---

#### [1:15 - 1:55] Step 2: Generating Feature Modules with `falcon m:f`
* **Visual:** Terminal in the new project. Run:
  ```bash
  falcon m:f Order
  ```
  Watch the CLI instantly generate:
  - `backend/src/storage/OrderStorage.mo`
  - `backend/src/repositories/OrderRepository.mo`
  - `backend/src/services/OrderService.mo`
  - `backend/src/api/v1/OrderApi.mo`
  - `frontend/services/order.ts`
  Quickly open the generated files in VS Code to highlight the clean interfaces.
* **Audio Voiceover:**
  > "Now, what about adding new features? You don't have to write boilerplate by hand.
  > 
  > Run `falcon m:f Order`—that's module feature.
  > 
  > In a single command, ICFalcon scaffolds the entire vertical slice: the stable storage structure, the repository queries, the domain service, the Candid API endpoint, and even the frontend client hook.
  > 
  > Dependencies strictly flow downward. Your API never touches storage directly, preventing reentrancy bugs and race conditions."

---

#### [1:55 - 2:35] Step 3: Plug-and-Play Packages from `icp-hub`
* **Visual:** Browser showing `https://icpay.app/products/icFalcon/packages`.  
  Show package cards: `crud`, `rbac`, `errors`, `validate-text`.  
  Back to terminal, run:
  ```bash
  falcon add pkg crud
  falcon add pkg rbac
  ```
  Show the packages being imported directly into Motoko code with `import Crud "mo:pkg/crud/crud"`.
* **Audio Voiceover:**
  > "Need reusable building blocks? ICFalcon connects directly to `icp-hub`—our decentralized registry of verified Motoko modules.
  > 
  > Need CRUD map helpers? Run `falcon add pkg crud`.
  > Need role-based access control? Run `falcon add pkg rbac`.
  > 
  > Every package is pre-tested, follows the same four-layer standard, and imports cleanly without dependency hell."

---

#### [2:35 - 3:05] Step 4: Health Checks, Cycle Runway & Safe Deployment
* **Visual:** Terminal showing operational commands:
  ```bash
  # Check canister health & cycles runway
  falcon y:bal
  falcon c:status

  # Run tests and deploy safely
  falcon b:test
  falcon b:deploy
  ```
  Highlight that `falcon b:deploy` is upgrade-only, preventing accidental `--mode=reinstall`.
* **Audio Voiceover:**
  > "When it's time to test and deploy, the unified Falcon CLI handles operations:
  > 
  > Check your cycles balance and estimated runway with `falcon y:bal`.
  > Inspect canister health and memory allocation with `falcon c:status`.
  > Run your automated test suite with `falcon b:test`.
  > 
  > And when you deploy with `falcon b:deploy`, ICFalcon builds the WASM, verifies its SHA-256 hash, and upgrades safely. Accidental reinstall flags are blocked by default, protecting your production database."

---

#### [3:05 - 3:30] Wrap-up & Call to Action
* **Visual:** Pan across the ICFalcon documentation portal (`https://icpay.app/icfalcon`), npm downloads badge, and community Discord/X links. End slide with install command: `npm create icfalcon@latest`.
* **Audio Voiceover:**
  > "Stop reinventing canister architecture from scratch. With over 400 weekly downloads, ICFalcon gives you the exact production tooling powering ICPay.
  > 
  > Run `npm create icfalcon@latest` today, or visit `icpay.app/icfalcon` to explore the complete documentation and package registry.
  > 
  > Happy building on the Internet Computer!"

---

## 2. 60-Second Short / Reel / TikTok Version

**Format:** 9:16 Vertical Video  
**Pacing:** Fast, high energy, punchy  
**Music:** Modern lo-fi tech synth beat  

| Timestamp | Visual on Screen | Spoken Audio (Punchy & Direct) |
|---|---|---|
| **0:00 - 0:08** | Fast zoom on terminal error: `Canister trapped: state lost`. Split screen with head shake. | *"Stop building Internet Computer canisters in one giant monolithic file that crashes on every upgrade."* |
| **0:08 - 0:18** | Screen recording: User types `npm create icfalcon@latest my-app`. Green checkmark pops up. | *"Instead, run `npm create icfalcon`. In five seconds, you get a production-ready full-stack ICP dApp."* |
| **0:18 - 0:32** | Quick pan over folder structure: `api/v1 -> services -> repositories -> storage`. Next.js passkey UI appears. | *"It enforces strict 4-layer Motoko architecture so your stable memory never gets corrupted, paired with Next.js and biometric Face ID logins."* |
| **0:32 - 0:44** | Typing `falcon m:f Order` in terminal. 5 files generate automatically across backend & frontend. | *"Need a new feature? Type `falcon m:f Order`. It generates your storage, repository, service, API, and frontend hook in one second."* |
| **0:44 - 0:54** | Terminal runs `falcon y:bal` (shows cycle runway) and `falcon b:deploy` (safe upgrade). | *"Monitor your cycle burn with `falcon y:bal` and deploy with zero reinstall risk using `falcon b:deploy`."* |
| **0:54 - 1:00** | End screen with big text: `npm create icfalcon@latest` and `icpay.app/icfalcon`. | *"Start building production canisters the right way. Run `npm create icfalcon` or visit icpay.app/icfalcon."* |

---

## 3. Creator Cheatsheet & Recording Checklist

Before hitting record, have these terminal windows and browser tabs staged:

1. **Terminal Tab 1:** In an empty scratch directory ready to execute `npm create icfalcon@latest demo-app`.
2. **Terminal Tab 2:** Pre-scaffolded ICFalcon project to instantly demo `falcon m:f Order` and `falcon y:bal`.
3. **Browser Tab 1:** `https://icpay.app/icfalcon` (Hero page with dark mode and particle effects).
4. **Browser Tab 2:** `https://icpay.app/products/icFalcon/packages` (Showing `crud`, `rbac`, `errors` cards).
5. **Browser Tab 3:** `https://icpay.app/products/icFalcon/commands` (Reference table for quick B-roll overlay).
