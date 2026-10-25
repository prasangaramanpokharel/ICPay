import { HttpAgent, type Identity } from "@icp-sdk/core/agent"

const LOCAL_IC_HOST = "http://127.0.0.1:4943"
const IC_HOST = "https://icp0.io"
const LOCAL_CANISTER_ID = "u6s2n-gx777-77774-qaaba-cai"
const MAINNET_CANISTER_ID = "6vbhm-nqaaa-aaaan-q6muq-cai"
const MAINNET_TRADE_CANISTER_ID = "gomfy-saaaa-aaaan-q6onq-cai"
const LOCAL_II_CANISTER_ID = "rdmx6-jaaaa-aaaaa-aaadq-cai"

export function getIsLocal(): boolean {
  if (typeof window === "undefined") return false
  if (process.env.NEXT_PUBLIC_IC_NETWORK === "ic") return false
  const hostname = window.location.hostname
  return hostname === "localhost" || hostname === "127.0.0.1"
}

export function getHost(): string {
  return getIsLocal() ? LOCAL_IC_HOST : IC_HOST
}

let cachedAgent: HttpAgent | null = null
let cachedFor: Identity | null = null

export async function createAgent(identity?: Identity): Promise<HttpAgent> {
  if (cachedAgent && cachedFor === (identity ?? null)) return cachedAgent

  const host = getHost()
  const agent = HttpAgent.createSync({ identity, host })
  if (getIsLocal()) {
    await agent.fetchRootKey()
  }

  cachedAgent = agent
  cachedFor = identity ?? null
  return agent
}

export function clearAgentCache(): void {
  cachedAgent = null
  cachedFor = null
}

export const WALLET_CANISTER_ID = getIsLocal()
  ? LOCAL_CANISTER_ID
  : process.env.NEXT_PUBLIC_WALLET_CANISTER_ID ?? MAINNET_CANISTER_ID

export const TRADE_CANISTER_ID =
  process.env.NEXT_PUBLIC_TRADE_CANISTER_ID ?? MAINNET_TRADE_CANISTER_ID

export function getIdentityProvider(): string {
  if (getIsLocal()) return withAuthorizePath(`http://${LOCAL_II_CANISTER_ID}.localhost:4943`)
  return withAuthorizePath(process.env.NEXT_PUBLIC_II_URL ?? "https://id.ai")
}

function withAuthorizePath(url: string): string {
  if (url.includes("#")) return url
  const base = url.replace(/\/$/, "")
  return base.endsWith("/authorize") ? base : `${base}/authorize`
}

const ALTERNATIVE_ORIGINS = [
  "https://ic-pay.vercel.app",
  "https://icpay.app",
  "https://www.icpay.app",
  "https://icpay.cloud",
  "https://www.icpay.cloud",
  "https://63dke-waaaa-aaaan-q6mvq-cai.raw.icp0.io",
]

// Permanently pinned derivation origin. Changing this value alters
// every existing user's principal and permanently strands user funds.
export function getDerivationOrigin(): string | undefined {
  const origin = process.env.NEXT_PUBLIC_DERIVATION_ORIGIN || undefined
  if (!origin) return undefined
  if (typeof window === "undefined") return origin
  const here = window.location.origin
  if (here === origin) return origin
  return ALTERNATIVE_ORIGINS.includes(here) ? origin : undefined
}
