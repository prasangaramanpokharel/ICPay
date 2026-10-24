# Video Script: Canister Snapshots & 1-Click Disaster Recovery

**Document Path:** `docs/marketing/video/snapshot.md`  
**Topic:** Canister Snapshots, Point-in-Time Backups & Zero-Downtime Rollbacks on the Internet Computer  
**Target Audience:** Web3 Developers, Canister Engineers, DevOps, ICP Founders  
**Tone:** Confident, high-signal, practical, developer-to-developer (no empty hype)  
**Primary Platform:** YouTube & X (Twitter) Video (~2:30 min) + 60-Second Short/Reel Cut  

---

## 1. Full Walkthrough Video (~2:30 Min)

### Video Metadata
* **Title:** Never Fear a Bad Deploy: 1-Click Canister Snapshots & Rollbacks on ICP
* **Thumbnail Concept:** Dark theme screenshot of ICPay Snapshots UI with a red "Broken Deploy" arrow pointing to a green "Restored in 2s" badge. Big text: *1-CLICK CANISTER RESTORE*.
* **Description / Links:** Learn how to create point-in-time state snapshots and execute instant emergency rollbacks on Internet Computer canisters using ICPay (`https://icpay.app`). No CLI or terminal required.

---

### Step-by-Step Visual Plan & Audio Script

#### [0:00 - 0:25] The Problem & The Nightmare Scenario
* **Visual:** Full-screen capture of terminal throwing a dreaded deployment trap error: `Canister trapped: update call failed / Memory allocation exceeded`. Quick cut to a broken frontend 404 page.
* **Audio Voiceover:**
  > "Every developer knows this sinking feeling: you push an upgrade to production, and something breaks. 
  > 
  > On traditional servers, you just redeploy the previous Docker container. But on the Internet Computer, canisters hold live, orthogonal persistent state. If a bad upgrade or database migration corrupts your memory, recovering without an exact state backup can turn into a multi-day nightmare.
  > 
  > Here is how you get instant, 1-click disaster recovery for your canisters using ICPay Snapshots."

---

#### [0:25 - 0:55] What is an IC Canister Snapshot?
* **Visual:** Smooth transition to `https://icpay.app/canister`. Click on a running canister (e.g. `Frontend` or `Backend`). Navigate to the **Snapshots** tab. Highlight the 4 architecture info-cards on screen:
  1. *Point-in-Time State*
  2. *Pre-Upgrade Safety*
  3. *Restore Considerations*
  4. *Storage & Cycles Cost*
* **Audio Voiceover:**
  > "Under the hood, the Internet Computer management canister supports native snapshots. A snapshot freezes the exact state of your canister at a single execution round.
  > 
  > It captures the compiled WebAssembly binary, active heap memory, and 64-bit stable memory structures into a cryptographic backup checkpoint. 
  > 
  > With ICPay's management suite, you don't need to juggle command-line flags or PEM identity keys. You can inspect and trigger snapshots straight from your browser."

---

#### [0:55 - 1:30] Live Demo: Creating a Pre-Upgrade Safety Checkpoint
* **Visual:** Cursor moves to the pink button: **`Take snapshot`**. Click it. Show the biometric Face ID / Touch ID prompt passing seamlessly. 
* A new row appears instantly in the **Available Snapshots** list showing:
  - Snapshot ID (`000000000000000a...`)
  - Snapshot size (e.g. `109 MB`)
  - Date & Timestamp (`19/10/2026, 22:12:03`)
* **Audio Voiceover:**
  > "Here’s best practice before deploying any code upgrade:
  > 
  > Step one: Head to the Snapshots tab and click 'Take snapshot'. 
  > 
  > In less than three seconds, verified by your WebAuthn passkey, the subnet takes a complete freeze-frame of your canister. You now have an immutable insurance policy sitting safely on the subnet."

---

#### [1:30 - 2:05] The Magic: Instant Rollback (`Load`) vs Cleanup (`Delete`)
* **Visual:** Zoom in on the two action buttons on the snapshot row: **`Load`** and **`Delete`**.
* Hover over **`Load`** (highlight in subtle alert color).
* Show graphic: *Broken State → Click Load → Restored State in 2.5s*.
* **Audio Voiceover:**
  > "Now, what happens if your new deploy crashes or drops unexpected errors?
  > 
  > You don't have to scramble to find old git commits, recompile WASMs, or write recovery scripts. 
  > 
  > You simply find your pre-upgrade snapshot and click **`Load`**. 
  > 
  > In a single transaction, the management canister overwrites the corrupted memory and replaces the active WASM module with the exact working state. Your dApp is restored immediately.
  > 
  > And once your upgrade is battle-tested and stable, click **`Delete`** to free up subnet memory and stop recurring storage cycle burn."

---

#### [2:05 - 2:30] Summary & Call to Action
* **Visual:** Pan out to show the full ICPay Canister Suite (Cycles telemetry, runway projection, Snapshots, and Controllers). End title slide with URL: `https://icpay.app`.
* **Audio Voiceover:**
  > "Snapshots are the ultimate peace of mind for anyone running production canisters on the Internet Computer.
  > 
  > Connect your canister, check your runway, and take your first snapshot in ten seconds at `icpay.app`.
  > 
  > Check the link in the description to get started, and subscribe for more production IC engineering tutorials."

---

## 2. 60-Second Short / Reel / TikTok Version

**Format:** 9:16 Vertical Video  
**Pacing:** Fast, punchy, background tech synth beat  

| Timestamp | Visual on Screen | Spoken Audio (Punchy & Fast) |
|---|---|---|
| **0:00 - 0:10** | Red flashing text: *"NEVER BREAK YOUR SMART CONTRACT AGAIN"*. Screen recording of terminal error. | *"If you deploy a broken smart contract on the Internet Computer, how do you roll back without losing user data?"* |
| **0:10 - 0:25** | Screen recording zooms into ICPay Canister dashboard -> Snapshots tab. | *"Most devs don't know the IC has native state snapshots. It freezes your entire WASM code, heap, and 64-bit stable memory at an exact second."* |
| **0:25 - 0:40** | Mouse clicks pink **`Take snapshot`** button. Row appears with timestamp and size (109 MB). | *"Before pushing any code, open ICPay and click 'Take snapshot'. Secured by Face ID. Boom—instant backup created."* |
| **0:40 - 0:52** | Hover over **`Load`** button with green checkmark animation. | *"If your new deploy traps or crashes? Don't panic. Just hit 'Load'. It reverts the entire canister to the working checkpoint in 2 seconds."* |
| **0:52 - 1:00** | Full ICPay dashboard showing URL `icpay.app`. | *"Manage cycles, monitor runway, and protect your canisters at icpay.app. Follow for more Web3 dev tips!"* |

---

## 3. Production Recording Checklist for the Creator

Before hitting record, set up your screen:
1. **Window Setup:** Open `icpay.app/canister` on desktop (dark mode enabled).
2. **Resolution:** 1920x1080 (or 4K 16:9 for YouTube; 1080x1920 for Shorts).
3. **Cursor Settings:** Turn on cursor highlight / smooth mouse movement.
4. **Target Canister:** Use a test canister or your Frontend canister where you already have at least 1 active snapshot created (e.g. the 109 MB snapshot from your dashboard).
5. **Key Talking Point to Remember:** Emphasize that taking a snapshot **does not disrupt** the live canister or stop user traffic.
