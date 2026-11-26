import type { Identity } from "@icp-sdk/core/agent"
import { AuthClient, type OpenIdProvider } from "@icp-sdk/auth/client"
import { getIdentityProvider, getDerivationOrigin, getHost } from "@/services/icp"
import { getWalletActor, clearActorCache } from "@/services/wallet"
import {
  DELEGATION_TTL,
  POPUP_FEATURES,
  II_BACKEND_CANISTER_ID,
} from "@/lib/auth/config"
import {
  prefersRedirectTransport,
  markRedirectPending,
  clearRedirectPending,
  hasRedirectPending,
  isInternetIdentityReturn,
  clearInternetIdentityReturnHash,
} from "@/lib/auth/transport"

export type LoginOptions = {
  openIdProvider?: OpenIdProvider
  transport?: "window" | "redirect"
  returnTo?: string
  prompt?: "none" | "login"
}

let clientPromise: Promise<AuthClient> | null = null
let readyClient: AuthClient | null = null

function wantsRedirectTransport(options?: LoginOptions): boolean {
  if (options?.transport === "window") return false
  if (options?.transport === "redirect") return true
  return prefersRedirectTransport()
}

function clientOptions(options?: LoginOptions) {
  const redirect = wantsRedirectTransport(options)
  const host = getHost()
  return {
    identityProvider: {
      authorizeUrl: getIdentityProvider(),
      canisterId: II_BACKEND_CANISTER_ID,
    },
    agentOptions: { host },
    derivationOrigin: getDerivationOrigin(),
    windowOpenerFeatures: POPUP_FEATURES,
    transport: redirect ? ("redirect" as const) : ("window" as const),
    resumable: true,
    ...(options?.prompt ? { prompt: options.prompt } : {}),
    ...(options?.openIdProvider ? { openIdProvider: options.openIdProvider } : {}),
  }
}

function signInOptions(returnTo?: string) {
  return {
    maxTimeToLive: DELEGATION_TTL,
    maxTimeToIdle: DELEGATION_TTL,
    ...(returnTo ? { returnTo } : {}),
  }
}

function ensureDefaultClient(): AuthClient {
  readyClient ??= new AuthClient(clientOptions())
  clientPromise ??= Promise.resolve(readyClient)
  return readyClient
}

function createClient(options?: LoginOptions): AuthClient {
  if (!options?.openIdProvider && !wantsRedirectTransport(options)) {
    return ensureDefaultClient()
  }
  return new AuthClient(clientOptions(options))
}

export async function createAuthClient(): Promise<AuthClient> {
  return ensureDefaultClient()
}

export class PopupBlockedError extends Error {
  constructor() {
    super("Popup blocked. Allow popups for this site, then try again.")
    this.name = "PopupBlockedError"
  }
}

async function signInWithAttributes(
  authClient: AuthClient,
  returnTo?: string,
): Promise<Identity | null> {
  return await authClient.signIn(signInOptions(returnTo))
}

export async function memoizeRedirectState<T>(
  produce: () => T | Promise<T>,
): Promise<T> {
  if (typeof window === "undefined") {
    return produce()
  }
  const authClient = await createAuthClient()
  return authClient.memoize(produce)
}

export async function resumeRedirectSignIn(): Promise<Identity | null> {
  if (!hasRedirectPending() && !isInternetIdentityReturn()) return null
  try {
    const options: LoginOptions = { transport: "redirect" }
    const identity = await signInWithAttributes(
      new AuthClient(clientOptions(options)),
    )
    clearRedirectPending()
    clearInternetIdentityReturnHash()
    return identity
  } catch (e) {
    clearRedirectPending()
    console.error("II redirect resume error:", e)
    return null
  }
}

export async function silentAuth(): Promise<Identity | null> {
  if (typeof window === "undefined") return null
  try {
    const authClient = await createAuthClient()
    if (authClient.isAuthenticated()) {
      return authClient.getIdentity()
    }
    const silentClient = createClient({ prompt: "none" })
    return await signInWithAttributes(silentClient)
  } catch {
    return null
  }
}

export async function login(options?: LoginOptions): Promise<Identity | null> {
  if (wantsRedirectTransport(options)) markRedirectPending()
  const authClient = createClient(options)

  return signInWithAttributes(authClient, options?.returnTo)
    .then((identity) => {
      if (wantsRedirectTransport(options)) {
        clearRedirectPending()
        clearInternetIdentityReturnHash()
      }
      return identity
    })
    .catch((e) => {
      if (wantsRedirectTransport(options)) clearRedirectPending()
      console.error("II login error:", e)
      if (e instanceof Error && /popup|blocked|could not be opened/i.test(e.message)) {
        throw new PopupBlockedError()
      }
      return null
    })
}

export async function logout(): Promise<void> {
  const authClient = await createAuthClient()
  await authClient.signOut({ returnTo: "/login" })
  authClient.dispose()

  clientPromise = null
  readyClient = null
  void createAuthClient()
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`timed out after ${ms}ms`)), ms),
    ),
  ])
}

export async function openBackendSession(identity: Identity): Promise<void> {
  const actor = await getWalletActor(identity)
  await withTimeout(actor.login(), 20_000)
}

export async function discardRejectedSession(): Promise<void> {
  await logout()
  clearActorCache()
}
