import type { Identity } from "@icp-sdk/core/agent"
import { query, unwrap } from "@/services/client"
import { ICP_LEDGER_ID } from "@/services/tokens"
import type { DashboardData } from "@/services/types"

export function getDashboard(
  identity: Identity | undefined,
  ledgerId: string = ICP_LEDGER_ID
): Promise<DashboardData> {
  return query(identity, async (actor) => unwrap(await actor.getDashboard(ledgerId)))
}
