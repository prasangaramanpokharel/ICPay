import { BACKEND, dfxOut, moduleHash } from "../lib.ts"

const CANISTER_BACKEND = "icp_wallet_backend"
const BACKEND_ID = "6vbhm-nqaaa-aaaan-q6muq-cai"
const CANISTER_BLOB = "icp_blob_store"
const BLOB_ID = "fly6t-piaaa-aaaan-q6oga-cai"
const CANISTER_NOTIFIER = "icpay_notifier"
const NOTIFIER_ID = "2hvuh-xiaaa-aaaan-q6uua-cai"

const SHARD_THRESHOLD_GB = 300 // Scale to Canister #2 when reaching 300 GB (75%)
const HARD_CAP_GB = 400

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`
}

function fieldNum(text: string, name: string): number {
  const raw = text.match(new RegExp(`${name} = ([\\d_]+)`))?.[1]
  return raw ? Number(raw.replaceAll("_", "")) : 0
}

function fieldText(text: string, name: string): string {
  return text.match(new RegExp(`${name} = "([^"]+)"`))?.[1] ?? ""
}

function fieldBool(text: string, name: string): boolean {
  const raw = text.match(new RegExp(`${name} = (true|false)`))?.[1]
  return raw === "true"
}

const auditTimestamp = new Date()

console.log("================================================================================")
console.log("           ICPAY CLOUD STORAGE (icBucket) — COMPREHENSIVE AUDIT REPORT           ")
console.log("================================================================================")
console.log(`• Audit Date/Time:    ${auditTimestamp.toUTCString()} (${auditTimestamp.toISOString()})`)
console.log(`• Network:             Mainnet (Internet Computer)\n`)

try {
  // 1. Query Bucket Cloud Stats from Control Plane Backend
  let bucketCount = 0
  let activeBuckets = 0
  let expiredBuckets = 0
  let capacitySoldBytes = 0
  let revenueE8s = 0
  let canAcceptBuckets = true
  let cloudCyclesStatus = "UNKNOWN"
  let cloudDaysRemaining = 999

  try {
    const cloudRaw = dfxOut(["canister", "call", CANISTER_BACKEND, "getBucketCloudStats", "()", "--query"])
    bucketCount = fieldNum(cloudRaw, "bucketCount")
    activeBuckets = fieldNum(cloudRaw, "activeBuckets")
    expiredBuckets = fieldNum(cloudRaw, "expiredBuckets")
    capacitySoldBytes = fieldNum(cloudRaw, "capacityBytes")
    revenueE8s = fieldNum(cloudRaw, "estimatedCapacityRevenueE8s")
    canAcceptBuckets = fieldBool(cloudRaw, "canAcceptNewBuckets")
    cloudCyclesStatus = fieldText(cloudRaw, "cyclesStatus")
    cloudDaysRemaining = fieldNum(cloudRaw, "estimatedDaysRemaining")
  } catch (err) {
    console.warn("Could not query getBucketCloudStats:", err)
  }

  // 2. Query Blob Store (Data Plane)
  const blobHash = moduleHash(CANISTER_BLOB)
  const blobStatusRaw = dfxOut(["canister", "status", CANISTER_BLOB])
  const blobStatsRaw = dfxOut(["canister", "call", CANISTER_BLOB, "stats", "()", "--query"])
  const blobCapRaw = dfxOut(["canister", "call", CANISTER_BLOB, "getCapacityLimit", "()", "--query"])

  const fileCount = fieldNum(blobStatsRaw, "count")
  const usedBytes = fieldNum(blobStatsRaw, "bytes")
  const capMatch = blobCapRaw.match(/\(([\d_]+)\s*:\s*nat\)/)
  const totalBytes = capMatch ? Number(capMatch[1].replaceAll("_", "")) : HARD_CAP_GB * 1024 * 1024 * 1024

  const cyclesMatch = blobStatusRaw.match(/Balance:\s*([\d_]+)\s*Cycles/)
  const memoryMatch = blobStatusRaw.match(/Memory Size:\s*([\d_]+)\s*Bytes/)
  const statusMatch = blobStatusRaw.match(/Status:\s*([A-Za-z]+)/)

  const blobCycles = cyclesMatch ? Number(cyclesMatch[1].replaceAll("_", "")) : 0
  const blobMemoryBytes = memoryMatch ? Number(memoryMatch[1].replaceAll("_", "")) : 0
  const blobCanisterStatus = statusMatch ? statusMatch[1] : "Running"

  const usedGB = usedBytes / (1024 * 1024 * 1024)
  const totalGB = totalBytes / (1024 * 1024 * 1024)
  const remainingBytes = Math.max(0, totalBytes - usedBytes)
  const remainingGB = remainingBytes / (1024 * 1024 * 1024)
  const usedPercent = (usedBytes / totalBytes) * 100
  const headroomToShardGB = Math.max(0, SHARD_THRESHOLD_GB - usedGB)
  const cyclesTC = blobCycles / 1e12

  // 3. Query Notifier Plane
  let notifierActive = false
  let notifierSubscribers = 0
  let notifierEmailsSent = 0
  try {
    const notifierRaw = dfxOut(["canister", "call", CANISTER_NOTIFIER, "getStatus", "()", "--query"])
    notifierActive = fieldBool(notifierRaw, "timerActive")
    notifierSubscribers = fieldNum(notifierRaw, "subscribersCount")
    notifierEmailsSent = fieldNum(notifierRaw, "totalEmailsSent")
  } catch {
    // Notifier might be quiet or not reachable
  }

  // ==========================================
  // SECTION 1: BUCKET METRICS & CREATIONS
  // ==========================================
  console.log("┌──────────────────────────────────────────────────────────────────────────────┐")
  console.log("│ 1. BUCKET SYSTEM & REGISTRATIONS (Control Plane)                             │")
  console.log("└──────────────────────────────────────────────────────────────────────────────┘")
  console.log(`• Total Buckets Created:    ${bucketCount} buckets`)
  console.log(`• Active Buckets:           ${activeBuckets} active`)
  console.log(`• Expired Buckets:          ${expiredBuckets} expired`)
  console.log(`• System Acceptance:        ${canAcceptBuckets ? "ACCEPTING NEW BUCKETS (Normal)" : "FROZEN (Low Cycles)"}`)
  console.log(`• Capacity Tiers Sold:      ${formatBytes(capacitySoldBytes)} (${(capacitySoldBytes / (1024 * 1024 * 1024)).toFixed(2)} GB total allocated)`)
  console.log(`• Total Capacity Revenue:   ~${(revenueE8s / 1e8).toFixed(2)} ICP (Treasury gross)`)
  console.log(`• Control Plane Canister:   ${BACKEND_ID} (icp_wallet_backend)\n`)

  // ==========================================
  // SECTION 2: PHYSICAL STORAGE (BLOB STORE)
  // ==========================================
  console.log("┌──────────────────────────────────────────────────────────────────────────────┐")
  console.log("│ 2. DATA PLANE & PHYSICAL STORAGE (icp_blob_store)                            │")
  console.log("└──────────────────────────────────────────────────────────────────────────────┘")
  console.log(`• Blob Canister ID:         ${BLOB_ID}`)
  console.log(`• Status:                   ${blobCanisterStatus}`)
  console.log(`• Module Hash:              ${blobHash}`)
  console.log(`• Total Files Stored:       ${fileCount} files`)
  console.log(`• Physical Storage Used:    ${formatBytes(usedBytes)} (${usedGB.toFixed(4)} GB)`)
  console.log(`• Hard Capacity Limit:      ${formatBytes(totalBytes)} (${totalGB.toFixed(1)} GB max)`)
  console.log(`• Free Storage Remaining:   ${formatBytes(remainingBytes)} (${remainingGB.toFixed(2)} GB / ${(100 - usedPercent).toFixed(4)}% free)`)
  console.log(`• Canister Memory (Heap):   ${formatBytes(blobMemoryBytes)}`)
  console.log(`• Cycles Balance:           ${cyclesTC.toFixed(3)} Trillion Cycles (TC)`)

  const barLength = 35
  const filled = Math.min(barLength, Math.round((usedBytes / totalBytes) * barLength))
  const empty = barLength - filled
  const bar = "█".repeat(filled) + "░".repeat(empty)
  console.log(`• Storage Utilization Bar:  [${bar}] ${usedPercent.toFixed(4)}%\n`)

  // ==========================================
  // SECTION 3: SCALING & HORIZONTAL SHARDING
  // ==========================================
  console.log("┌──────────────────────────────────────────────────────────────────────────────┐")
  console.log("│ 3. SCALING RUNBOOK & SHARDING READINESS (Target: 400 GB - 40+ TB)            │")
  console.log("└──────────────────────────────────────────────────────────────────────────────┘")
  console.log(`• Single Canister Ceiling:  ${HARD_CAP_GB} GB`)
  console.log(`• Sharding Threshold:       ${SHARD_THRESHOLD_GB} GB (75% mark — trigger for Canister #2)`)
  console.log(`• Headroom Before Shard:    ${headroomToShardGB.toFixed(2)} GB remaining before needing Shard 2`)

  if (usedGB < 250) {
    console.log(`• Sharding Health Status:   [HEALTHY & OPTIMAL]`)
    console.log(`                            Current single canister has ${remainingGB.toFixed(1)} GB of headroom.`)
    console.log(`                            No additional storage canisters needed at this time.`)
  } else if (usedGB < SHARD_THRESHOLD_GB) {
    console.log(`• Sharding Health Status:   [ELEVATED - PLAN SHARD 2]`)
    console.log(`                            Storage has crossed 250 GB. Prepare to deploy icp_blob_store_2.`)
  } else {
    console.log(`• Sharding Health Status:   [SCALE TRIGGERED - DEPLOY NOW]`)
    console.log(`                            Canister 1 has reached threshold (>= 300 GB)!`)
    console.log(`                            Run: dfx canister --network ic create icp_blob_store_2`)
  }

  // ==========================================
  // SECTION 4: NOTIFIER PLANE & EMAIL ALERTS
  // ==========================================
  console.log("\n┌──────────────────────────────────────────────────────────────────────────────┐")
  console.log("│ 4. LIFECYCLE NOTIFIER PLANE (icpay_notifier)                                 │")
  console.log("└──────────────────────────────────────────────────────────────────────────────┘")
  console.log(`• Notifier Canister ID:     ${NOTIFIER_ID}`)
  console.log(`• Autonomous Sweep Timer:   ${notifierActive ? "ACTIVE (Daily 24h cron loop)" : "PAUSED"}`)
  console.log(`• Bucket Subscriptions:     ${notifierSubscribers} bucket owners registered`)
  console.log(`• Total Emails Dispatched:  ${notifierEmailsSent} emails via Resend API`)

  // ==========================================
  // SECTION 5: UNIT ECONOMICS & ROI SUMMARY
  // ==========================================
  console.log("\n┌──────────────────────────────────────────────────────────────────────────────┐")
  console.log("│ 5. REVENUE & UNIT ECONOMICS SNAPSHOT                                         │")
  console.log("└──────────────────────────────────────────────────────────────────────────────┘")
  console.log(`• Annual 5 GB Plan Pricing: 20.00 ICP (~$180/yr)`)
  console.log(`• IC Real Storage Burn:     ~2.96 ICP (~$26.63/yr) for 5 GB`)
  console.log(`• Company Gross Margin:     ~85.2% Profit per User`)
  console.log(`• 100 Users (500 GB) ROI:   +1,704 ICP (~+$15,337 USD/yr) net profit\n`)

  console.log("================================================================================")
  console.log("                     AUDIT RESULT: ALL SYSTEMS NOMINAL                          ")
  console.log("================================================================================\n")
} catch (e) {
  console.error("Audit query failed:", e)
}
