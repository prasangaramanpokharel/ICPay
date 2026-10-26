import { Actor, type Identity } from "@icp-sdk/core/agent"
import { IDL } from "@icp-sdk/core/candid"
import { createAgent } from "@/services/icp"
import type { NotifierActor } from "@/services/notifier/types"

export const NOTIFIER_CANISTER_ID =
  process.env.NEXT_PUBLIC_NOTIFIER_CANISTER_ID || "2hvuh-xiaaa-aaaan-q6uua-cai"

export const notifierIdlFactory: IDL.InterfaceFactory = ({ IDL }) => {
  const Result = IDL.Variant({
    ok: IDL.Null,
    err: IDL.Text,
  })
  const NotifierStatus = IDL.Record({
    subscribersCount: IDL.Nat,
    totalEmailsSent: IDL.Nat,
    lastSweepAt: IDL.Int,
    timerActive: IDL.Bool,
    backendCanisterId: IDL.Principal,
  })
  return IDL.Service({
    registerEmail: IDL.Func([IDL.Text, IDL.Text], [Result], []),
    unregisterEmail: IDL.Func([IDL.Text], [Result], []),
    getEmail: IDL.Func([IDL.Text], [IDL.Opt(IDL.Text)], ["query"]),
    getStatus: IDL.Func([], [NotifierStatus], ["query"]),
  })
}

export async function getNotifierActor(
  identity?: Identity,
  canisterId = NOTIFIER_CANISTER_ID
): Promise<NotifierActor | null> {
  if (!canisterId) return null
  try {
    const agent = await createAgent(identity)
    return Actor.createActor<NotifierActor>(notifierIdlFactory, {
      agent,
      canisterId,
    })
  } catch (err) {
    console.error("Failed to initialize notifier actor", err)
    return null
  }
}

export async function registerBucketEmail(
  identity: Identity | undefined,
  bucketId: string,
  email: string
): Promise<string | null> {
  const actor = await getNotifierActor(identity)
  if (!actor) {
    try {
      if (typeof window !== "undefined") {
        window.localStorage.setItem(`icpay_bucket_email_${bucketId}`, email)
      }
      return null
    } catch {
      return "Notifier canister is not configured."
    }
  }

  try {
    const res = await actor.registerEmail(bucketId, email.trim())
    if ("err" in res && res.err) return res.err
    if (typeof window !== "undefined") {
      window.localStorage.setItem(`icpay_bucket_email_${bucketId}`, email)
    }
    return null
  } catch (e) {
    console.error(e)
    return e instanceof Error ? e.message : "Failed to register email"
  }
}

export async function unregisterBucketEmail(
  identity: Identity | undefined,
  bucketId: string
): Promise<string | null> {
  const actor = await getNotifierActor(identity)
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(`icpay_bucket_email_${bucketId}`)
  }
  if (!actor) return null

  try {
    const res = await actor.unregisterEmail(bucketId)
    if ("err" in res && res.err) return res.err
    return null
  } catch (e) {
    console.error(e)
    return e instanceof Error ? e.message : "Failed to unregister email"
  }
}

export async function getBucketEmail(
  identity: Identity | undefined,
  bucketId: string
): Promise<string | null> {
  const actor = await getNotifierActor(identity)
  if (!actor) {
    if (typeof window !== "undefined") {
      return window.localStorage.getItem(`icpay_bucket_email_${bucketId}`)
    }
    return null
  }

  try {
    const res = await actor.getEmail(bucketId)
    if (res.length > 0 && res[0]) return res[0]
    if (typeof window !== "undefined") {
      return window.localStorage.getItem(`icpay_bucket_email_${bucketId}`)
    }
    return null
  } catch (e) {
    console.error(e)
    if (typeof window !== "undefined") {
      return window.localStorage.getItem(`icpay_bucket_email_${bucketId}`)
    }
    return null
  }
}
