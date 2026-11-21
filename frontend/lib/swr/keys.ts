import { mutate } from "swr"

export const swrKeys = {
  canisterStatus: (id: string, principal?: string | null) =>
    principal ? (["canister-status", id.trim(), principal] as const) : null,

  canisterAudit: (id: string) => ["canister-audit-info", id.trim()] as const,

  mineStatusMap: (principal: string, idsJoined: string) =>
    ["mine-status-map", principal, idsJoined] as const,
} as const

export function invalidateCanisterStatus(canisterId: string): Promise<unknown[]> {
  const trimmed = canisterId.trim()
  return Promise.all([
    mutate(
      (key: unknown) =>
        Array.isArray(key) && key[0] === "canister-status" && key[1] === trimmed
    ),
    mutate(
      (key: unknown) =>
        Array.isArray(key) && key[0] === "canister-audit-info" && key[1] === trimmed
    ),
  ])
}
