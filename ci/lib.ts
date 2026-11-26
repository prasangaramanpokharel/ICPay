// Shared helpers for every ci command. Kept deliberately small: each command
// file should read as the dfx invocation it wraps, not as plumbing.
import { spawn, spawnSync } from "node:child_process"
import { accessSync, constants, existsSync, readFileSync } from "node:fs"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const repo = resolve(dirname(fileURLToPath(import.meta.url)), "..")

export const BACKEND = resolve(repo, "backend")
export const FRONTEND = resolve(repo, "frontend")

export const CANISTER = "icp_wallet_backend"
export const TRADE_CANISTER = "icpay_trade"
export const OWNED_CANISTERS = [
  { name: "icp_wallet_backend", label: "backend" },
  { name: "icpay_trade", label: "trade" },
  { name: "icp_wallet_frontend", label: "frontend" },
  { name: "icp_blob_store", label: "blob store" },
  { name: "cnsmangment", label: "cns" },
  { name: "icpay_notifier", label: "notifier" },
  { name: "icpay_academy", label: "academy" },
  { name: "icpay_index", label: "index" },
  { name: "iccron", label: "cron" },
] as const
export type OwnedCanisterName = (typeof OWNED_CANISTERS)[number]["name"]

export function canisterIds(): Record<string, { ic?: string }> {
  const dfxPath = resolve(BACKEND, "canister_ids.json")
  if (existsSync(dfxPath)) {
    return JSON.parse(readFileSync(dfxPath, "utf8"))
  }
  const icpPath = resolve(BACKEND, ".icp/data/mappings/ic.ids.json")
  if (existsSync(icpPath)) {
    const raw = JSON.parse(readFileSync(icpPath, "utf8"))
    const mapped: Record<string, { ic?: string }> = {}
    for (const [k, v] of Object.entries(raw)) {
      mapped[k] = { ic: v as string }
    }
    return mapped
  }
  return {}
}

/** Resolve dfx canister name from shorthand: backend | frontend | blob | blob store | cns | notifier | academy | index | cron */
export function resolveOwnedCanister(target?: string): OwnedCanisterName | undefined {
  if (!target) return undefined
  const key = target.toLowerCase().replace(/_/g, " ").trim()
  const hit = OWNED_CANISTERS.find(
    (c) =>
      c.name === target ||
      c.label === key ||
      (key === "blob" && c.name === "icp_blob_store") ||
      (key === "trade" && c.name === "icpay_trade") ||
      (key === "cns" && c.name === "cnsmangment") ||
      (key === "cnsmangment" && c.name === "cnsmangment") ||
      (key === "notifier" && c.name === "icpay_notifier") ||
      (key === "academy" && c.name === "icpay_academy") ||
      (key === "index" && c.name === "icpay_index") ||
      (key === "cron" && c.name === "iccron") ||
      (key === "iccron" && c.name === "iccron"),
  )
  return hit?.name
}


export const WALLET_CANISTER_ID = canisterIds().icp_wallet_backend?.ic ?? ""
export const ICPAY_LEDGER_ID = "5fsnk-rqaaa-aaaan-q6m4q-cai"
export const ICPAY_INDEX_ID = canisterIds().icpay_index?.ic ?? "geode-2qaaa-aaaan-q6wuq-cai"
export const ICP_INDEX = "qhbym-qaaaa-aaaaa-aaafq-cai"

// dfx invokes whatever DFX_MOC_PATH names. A shell profile that sets
// DFX_MOC_PATH=moc-wrapper (the old default name) breaks builds when
// moc-wrapper is not on PATH — use the mops toolchain moc binary instead.
function resolveDfxMocPath(): string {
  const cur = process.env.DFX_MOC_PATH
  if (cur && cur !== "moc-wrapper") {
    try {
      accessSync(cur, constants.X_OK)
      return cur
    } catch {
      // ignore — fall through to mops
    }
  }
  const res = spawnSync("mops", ["toolchain", "bin", "moc"], {
    cwd: BACKEND,
    encoding: "utf8",
  })
  const path = res.stdout?.trim()
  if (res.status === 0 && path) return path

  const dfxCache = spawnSync("dfx", ["cache", "show"], { encoding: "utf8" })
  if (dfxCache.status === 0 && dfxCache.stdout) {
    const lines = dfxCache.stdout.trim().split("\n")
    const cacheDir = lines[lines.length - 1]?.trim()
    if (cacheDir) {
      const dfxMoc = resolve(cacheDir, "moc")
      try {
        accessSync(dfxMoc, constants.X_OK)
        return dfxMoc
      } catch {
        // ignore — fall through to error
      }
    }
  }

  console.error(
    "dfx needs a Motoko compiler. Run:\n  cd backend && mops toolchain use moc 1.13.0\n" +
      "If your shell sets DFX_MOC_PATH=moc-wrapper, run: unset DFX_MOC_PATH",
  )
  process.exit(1)
}

// Ensure cargo/rustup bin is at the front of PATH
const cargoBin = resolve(process.env.HOME ?? "", ".cargo/bin")
const pathWithCargo = `${cargoBin}:${process.env.PATH ?? ""}`

function resolveSdkRoot(): string | undefined {
  if (process.platform !== "darwin") return undefined
  if (process.env.SDKROOT) return process.env.SDKROOT
  const fallbackSdks = [
    "/Library/Developer/CommandLineTools/SDKs/MacOSX15.4.sdk",
    "/Library/Developer/CommandLineTools/SDKs/MacOSX15.sdk",
    "/Library/Developer/CommandLineTools/SDKs/MacOSX.sdk",
  ]
  for (const sdk of fallbackSdks) {
    try {
      accessSync(sdk, constants.R_OK)
      return sdk
    } catch {
      // try next
    }
  }
  return undefined
}

const resolvedSdkRoot = resolveSdkRoot()
if (resolvedSdkRoot && !process.env.SDKROOT) {
  process.env.SDKROOT = resolvedSdkRoot
}

// dfx refuses to touch mainnet with a plaintext identity unless this is set, and
// the controller key on this machine is plaintext.
const env = {
  ...process.env,
  PATH: pathWithCargo,
  ...(resolvedSdkRoot ? { SDKROOT: resolvedSdkRoot } : {}),
  DFX_WARNING: "-mainnet_plaintext_identity",
  DFX_MOC_PATH: resolveDfxMocPath(),
}

// Every command defaults to mainnet, because that is the only network this
// project actually runs on. --local is here for a replica session.
export const network = (): string => (process.argv.includes("--local") ? "local" : "ic")

const positional = (): string[] => process.argv.slice(3).filter((a) => !a.startsWith("--"))

export const arg = (i: number): string | undefined => positional()[i]

export function requireArg(i: number, usage: string): string {
  const value = positional()[i]
  if (!value) {
    console.error(`Usage: ${usage}`)
    process.exit(1)
  }
  return value
}

export function step(title: string): void {
  console.log(`\n=== ${title} ===`)
}

// Streams output rather than buffering: a deploy that hangs should show where.
export function run(cmd: string, args: string[], cwd: string = BACKEND): void {
  const res = spawnSync(cmd, args, { cwd, env: { ...env, ...process.env, PATH: pathWithCargo }, stdio: "inherit" })
  if (res.status !== 0) {
    console.error(`\nFAILED: ${cmd} ${args.join(" ")}`)
    process.exit(res.status ?? 1)
  }
}

export function capture(cmd: string, args: string[], cwd: string = BACKEND): string {
  const res = spawnSync(cmd, args, { cwd, env: { ...env, ...process.env, PATH: pathWithCargo }, encoding: "utf8" })
  if (res.status !== 0) {
    console.error(res.stderr?.trim() || `FAILED: ${cmd} ${args.join(" ")}`)
    process.exit(res.status ?? 1)
  }
  return res.stdout?.trim() ?? ""
}

export const icpEnv = (): string => (process.argv.includes("--local") ? "local" : "ic")

export function translateDfxToIcp(args: string[]): string[] {
  if (args[0] === "canister") {
    const sub = args[1]
    const rawTarget = args[2]
    const target = rawTarget ? (resolveOwnedCanister(rawTarget) ?? rawTarget) : CANISTER
    if (sub === "id") {
      return ["canister", "status", target, "--id-only", "-e", icpEnv()]
    }
    if (sub === "info") {
      return ["canister", "status", target, "-p", "-e", icpEnv()]
    }
    if (sub === "status") {
      return ["canister", "status", target, "-e", icpEnv()]
    }
    if (sub === "logs") {
      return ["canister", "logs", target, "-e", icpEnv()]
    }
    if (sub === "call") {
      const method = args[3]
      const callArgs = args.slice(4).filter((a) => a !== "--network" && a !== "ic" && a !== "local")
      return ["canister", "call", target, method, ...callArgs, "-e", icpEnv()]
    }
    if (sub === "create") {
      return ["canister", "create", target, "-e", icpEnv()]
    }
    if (sub === "stop") {
      return ["canister", "stop", target, "-e", icpEnv()]
    }
    if (sub === "delete") {
      const rest = args.slice(3).filter((a) => a !== "--network" && a !== "ic" && a !== "local")
      return ["canister", "delete", target, ...rest, "-e", icpEnv()]
    }
  }
  if (args[0] === "build") {
    const target = args[1] ? (resolveOwnedCanister(args[1]) ?? args[1]) : CANISTER
    return ["build", target, "-e", icpEnv()]
  }
  if (args[0] === "deploy") {
    const target = args[1] ? (resolveOwnedCanister(args[1]) ?? args[1]) : CANISTER
    const rest = args.slice(2).filter((a) => a !== "--network" && a !== "ic" && a !== "local")
    return ["deploy", target, ...rest, "-e", icpEnv()]
  }
  if (args[0] === "cycles") {
    return ["cycles", ...args.slice(1)]
  }
  if (args[0] === "ledger") {
    if (args[1] === "balance") {
      return ["token", "balance", "icp", ...args.slice(2), "-e", icpEnv()]
    }
    if (args[1] === "transfer") {
      return ["token", "transfer", "icp", ...args.slice(2), "-e", icpEnv()]
    }
  }
  return [...args, "-e", icpEnv()]
}

export const icp = (args: string[], cwd?: string): void =>
  run("icp", [...args, "-e", icpEnv()], cwd)

export const icpOut = (args: string[], cwd?: string): string =>
  capture("icp", [...args, "-e", icpEnv()], cwd)

export const dfx = (args: string[], cwd?: string): void =>
  run("icp", translateDfxToIcp(args), cwd)

export const dfxOut = (args: string[], cwd?: string): string =>
  capture("icp", translateDfxToIcp(args), cwd)

export function dfxOutMany(argSets: string[][], cwd?: string): Promise<string[]> {
  return Promise.all(
    argSets.map(
      (args) =>
        new Promise<string>((done) => {
          const translated = translateDfxToIcp(args)
          const child = spawn("icp", translated, { cwd: cwd ?? BACKEND, env })
          let stdout = ""
          child.stdout.on("data", (chunk) => (stdout += chunk))
          child.on("close", () => done(stdout))
        }),
    ),
  )
}

export function moduleHash(canister: string = CANISTER): string {
  const target = resolveOwnedCanister(canister) ?? canister
  const res = capture("icp", ["canister", "status", target, "-p", "-e", icpEnv()], BACKEND)
  return res.match(/Module hash: (0x[0-9a-f]+)/)?.[1] ?? "unknown"
}

// A mainnet write is irreversible and this canister custodies real ICP, so every
// one of them stops here first. CI never reaches this: it has no TTY, and the
// workflow runs no deploy commands at all.
export function confirm(action: string): void {
  if (network() === "local") return
  if (!process.stdin.isTTY) {
    console.error(`Refusing to ${action} without an interactive terminal.`)
    process.exit(1)
  }
  // Reads and prompts through /dev/tty rather than stdin, because capture()
  // spawns with piped stdio: `read` would hit EOF immediately, return empty and
  // abort every deploy. stderr is redirected too -- `read -p` writes its prompt
  // there, so without it the prompt is captured and the process waits silently
  // on what looks like a hang. Only the answer goes to stdout, to be captured.
  const answer = capture("bash", [
    "-c",
    `read -r -p "About to ${action}. Type yes: " a < /dev/tty 2> /dev/tty; echo "$a"`,
  ])
  if (answer !== "yes") {
    console.log("Aborted.")
    process.exit(1)
  }
}
