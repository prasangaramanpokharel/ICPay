export type NotifierActor = {
  registerEmail: (
    bucketId: string,
    email: string
  ) => Promise<{ ok: null; err?: never } | { err: string; ok?: never }>
  unregisterEmail: (
    bucketId: string
  ) => Promise<{ ok: null; err?: never } | { err: string; ok?: never }>
  getEmail: (bucketId: string) => Promise<[] | [string]>
  getStatus?: () => Promise<{
    subscribersCount: bigint
    totalEmailsSent: bigint
    lastSweepAt: bigint
    timerActive: boolean
    backendCanisterId: { toText: () => string }
  }>
}
