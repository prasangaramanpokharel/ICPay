import { BACKEND, dfxOut, network } from "../lib.ts"

const CANISTER = "iccron"

function fieldNum(text: string, name: string): number {
  const raw = text.match(new RegExp(`${name}\\s*=\\s*([\\d_]+)`))?.[1]
  return raw ? Number(raw.replaceAll("_", "")) : 0
}

function fieldBigInt(text: string, name: string): bigint {
  const raw = text.match(new RegExp(`${name}\\s*=\\s*([\\d_]+)`))?.[1]
  return raw ? BigInt(raw.replaceAll("_", "")) : 0n
}

function fieldText(text: string, name: string): string {
  return text.match(new RegExp(`${name}\\s*=\\s*"([^"]+)"`))?.[1] ?? ""
}

const auditTimestamp = new Date()
const net = network()

console.log("================================================================================")
console.log("             ICCRON DECENTRALIZED SCHEDULER — AUDIT REPORT                      ")
console.log("================================================================================")
console.log(`• Audit Date/Time:     ${auditTimestamp.toUTCString()} (${auditTimestamp.toISOString()})`)
console.log(`• Network:              ${net === "local" ? "Local Replica (127.0.0.1:4943)" : "Mainnet (Internet Computer)"}`)

try {
  let canisterId = "Unknown"
  try {
    canisterId = dfxOut(["canister", "id", CANISTER], BACKEND)
  } catch {
    canisterId = "Not found"
  }
  console.log(`• Canister ID:          ${canisterId}\n`)

  const statsRaw = dfxOut(["canister", "call", CANISTER, "get_audit_stats", "()", "--query"], BACKEND)

  const totalProjects = fieldNum(statsRaw, "total_projects")
  const totalJobs = fieldNum(statsRaw, "total_jobs")
  const activeJobs = fieldNum(statsRaw, "active_jobs")
  const pausedJobs = fieldNum(statsRaw, "paused_jobs")
  const otherJobs = fieldNum(statsRaw, "other_jobs")
  const totalRuns = fieldNum(statsRaw, "total_runs_executed")

  const totalApiKeys = fieldNum(statsRaw, "total_api_keys")
  const activeApiKeys = fieldNum(statsRaw, "active_api_keys")
  const revokedApiKeys = fieldNum(statsRaw, "revoked_api_keys")

  const rateMicros = fieldNum(statsRaw, "rate_per_run_usd_micros")
  const treasuryPrincipal = fieldText(statsRaw, "treasury_principal")
  const totalUsersCredits = fieldNum(statsRaw, "total_users_with_credits")
  const totalPrepaidHeld = fieldNum(statsRaw, "total_prepaid_credits_held")
  const totalPurchased = fieldNum(statsRaw, "total_lifetime_credits_purchased")
  const totalUsed = fieldNum(statsRaw, "total_lifetime_credits_used")

  const cycles = fieldBigInt(statsRaw, "cycles_balance")
  const memoryPages = fieldNum(statsRaw, "memory_pages")
  const memoryBytes = memoryPages * 65536
  const memoryMB = (memoryBytes / (1024 * 1024)).toFixed(2)
  const cyclesTrillions = (Number(cycles) / 1e12).toFixed(4)

  const rateDollars = (rateMicros / 1_000_000).toFixed(6)
  const per1kDollars = ((rateMicros * 1_000) / 1_000_000).toFixed(2)

  console.log("--------------------------------------------------------------------------------")
  console.log("  1. PROJECTS & CRON WORKLOADS")
  console.log("--------------------------------------------------------------------------------")
  console.log(`• Total Projects:       ${totalProjects}`)
  console.log(`• Total Jobs:           ${totalJobs}`)
  console.log(`  ├─ Active Jobs:       ${activeJobs}`)
  console.log(`  ├─ Paused Jobs:       ${pausedJobs}`)
  console.log(`  └─ Dormant / Other:   ${otherJobs}`)
  console.log(`• Total Executions:     ${totalRuns.toLocaleString()} runs executed\n`)

  console.log("--------------------------------------------------------------------------------")
  console.log("  2. API KEYS & ACCESS")
  console.log("--------------------------------------------------------------------------------")
  console.log(`• Total API Keys:       ${totalApiKeys}`)
  console.log(`  ├─ Active:            ${activeApiKeys}`)
  console.log(`  └─ Revoked:           ${revokedApiKeys}\n`)

  console.log("--------------------------------------------------------------------------------")
  console.log("  3. ECONOMICS & PRICING")
  console.log("--------------------------------------------------------------------------------")
  console.log(`• Current Rate:         $${rateDollars} / run ($${per1kDollars} per 1,000 runs) [${rateMicros} micros]`)
  console.log(`• Treasury Principal:   ${treasuryPrincipal}`)
  console.log(`• Users with Credits:   ${totalUsersCredits}`)
  console.log(`• Prepaid Runs Held:    ${totalPrepaidHeld.toLocaleString()} runs`)
  console.log(`• Lifetime Purchased:   ${totalPurchased.toLocaleString()} runs`)
  console.log(`• Lifetime Consumed:    ${totalUsed.toLocaleString()} runs\n`)

  console.log("--------------------------------------------------------------------------------")
  console.log("  4. CANISTER RESOURCE CONSUMPTION")
  console.log("--------------------------------------------------------------------------------")
  console.log(`• Cycles Balance:       ${cyclesTrillions} Trillion cycles (${cycles.toLocaleString()} cycles)`)
  console.log(`• Memory Allocation:    ${memoryMB} MB (${memoryPages.toLocaleString()} stable pages)`)
  console.log("================================================================================\n")
} catch (err) {
  console.error("Failed to run iccron audit:", err)
  process.exit(1)
}
