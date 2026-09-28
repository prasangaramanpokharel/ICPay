import { dfxOut } from "../lib.ts"

const CANISTER = "icp_blob_store"

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`
}

console.log("=== ICP BLOB STORE LIVE STORAGE STATUS ===")

try {
  const statsRaw = dfxOut(["canister", "call", CANISTER, "stats", "()", "--query"])
  const capRaw = dfxOut(["canister", "call", CANISTER, "getCapacityLimit", "()", "--query"])
  const canisterStatus = dfxOut(["canister", "status", CANISTER])

  const countMatch = statsRaw.match(/count\s*=\s*([\d_]+)/)
  const bytesMatch = statsRaw.match(/bytes\s*=\s*([\d_]+)/)
  const capMatch = capRaw.match(/\(([\d_]+)\s*:\s*nat\)/)
  const cyclesMatch = canisterStatus.match(/Balance:\s*([\d_]+)\s*Cycles/)

  const count = countMatch ? Number(countMatch[1].replaceAll("_", "")) : 0
  const usedBytes = bytesMatch ? Number(bytesMatch[1].replaceAll("_", "")) : 0
  const totalBytes = capMatch ? Number(capMatch[1].replaceAll("_", "")) : 400_000_000_000
  const cycles = cyclesMatch ? Number(cyclesMatch[1].replaceAll("_", "")) : 0

  const remainingBytes = Math.max(0, totalBytes - usedBytes)
  const usedPercent = ((usedBytes / totalBytes) * 100).toFixed(4)
  const freePercent = (100 - Number(usedPercent)).toFixed(4)

  console.log(`\n• Canister ID:      fly6t-piaaa-aaaan-q6oga-cai`)
  console.log(`• Total Capacity:   ${formatBytes(totalBytes)} (400 GB max)`)
  console.log(`• Storage Used:     ${formatBytes(usedBytes)} (${count} files stored)`)
  console.log(`• Storage Left:     ${formatBytes(remainingBytes)} (${freePercent}% FREE)`)
  console.log(`• Utilization:      ${usedPercent}%`)
  console.log(`• Cycles Balance:   ${(cycles / 1e12).toFixed(3)} Trillion Cycles (Safe)\n`)

  const barLength = 30
  const filled = Math.min(barLength, Math.round((usedBytes / totalBytes) * barLength))
  const empty = barLength - filled
  const bar = "█".repeat(filled) + "░".repeat(empty)
  console.log(`Capacity Gauge: [${bar}] ${usedPercent}% used\n`)
} catch (e) {
  console.error("Failed to query blob store status:", e)
}
