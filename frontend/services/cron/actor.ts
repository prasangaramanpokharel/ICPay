import { Actor, HttpAgent, type Identity } from "@icp-sdk/core/agent"
import { Principal } from "@icp-sdk/core/principal"
import { cronIdl } from "./idl"
import type {
  RemoteApiKeySummary,
  RemoteCreateJobArgs,
  RemoteCreditBalance,
  RemoteCronAuditStats,
  RemoteExecutionLog,
  RemoteJobRecord,
  RemoteJobSummary,
  RemotePackQuote,
  RemoteProjectRecord,
  RemoteUpdateJobArgs,
} from "./types"

export const CRON_CANISTER_ID =
  process.env.NEXT_PUBLIC_CRON_CANISTER_ID?.trim() || "uzt4z-lp777-77774-qaabq-cai"

export const CRON_HOST =
  process.env.NEXT_PUBLIC_CRON_HOST?.trim() || "https://icp0.io"

export type CronService = {
  create_project: (name: string) => Promise<{ Ok: RemoteProjectRecord } | { Err: string }>
  rename_project: (
    projectId: bigint,
    newName: string
  ) => Promise<{ Ok: RemoteProjectRecord } | { Err: string }>
  pause_project: (projectId: bigint) => Promise<{ Ok: bigint } | { Err: string }>
  resume_project: (projectId: bigint) => Promise<{ Ok: bigint } | { Err: string }>
  delete_project: (projectId: bigint) => Promise<{ Ok: null } | { Err: string }>
  list_my_projects: () => Promise<RemoteProjectRecord[]>

  create_job: (args: RemoteCreateJobArgs) => Promise<{ Ok: RemoteJobRecord } | { Err: string }>
  update_job: (args: RemoteUpdateJobArgs) => Promise<{ Ok: RemoteJobRecord } | { Err: string }>
  delete_job: (jobId: bigint) => Promise<{ Ok: null } | { Err: string }>
  pause_job: (jobId: bigint) => Promise<{ Ok: null } | { Err: string }>
  resume_job: (jobId: bigint) => Promise<{ Ok: null } | { Err: string }>
  trigger_job: (jobId: bigint) => Promise<{ Ok: null } | { Err: string }>
  list_jobs: (projectId: [] | [bigint]) => Promise<RemoteJobSummary[]>
  get_job: (jobId: bigint) => Promise<{ Ok: RemoteJobRecord } | { Err: string }>
  get_job_logs: (jobId: bigint, limit: [] | [bigint]) => Promise<RemoteExecutionLog[]>

  create_api_key: (projectId: bigint, label: string) => Promise<{ Ok: string } | { Err: string }>
  revoke_api_key: (keyHash: Uint8Array | number[]) => Promise<{ Ok: null } | { Err: string }>
  delete_api_key: (keyHash: Uint8Array | number[]) => Promise<{ Ok: null } | { Err: string }>
  list_api_keys: (projectId: bigint) => Promise<{ Ok: RemoteApiKeySummary[] } | { Err: string }>

  get_my_credits: () => Promise<RemoteCreditBalance>
  get_pack_quotes: () => Promise<RemotePackQuote[]>
  buy_pack: (tier: number, blockIndex: bigint) => Promise<{ Ok: bigint } | { Err: string }>
  quote_credits: (credits: bigint) => Promise<RemotePackQuote>
  buy_credits: (credits: bigint, blockIndex: bigint) => Promise<{ Ok: bigint } | { Err: string }>
  set_rate_per_run: (usdMicros: bigint) => Promise<{ Ok: bigint } | { Err: string }>
  get_rate_per_run: () => Promise<bigint>
  get_audit_stats: () => Promise<RemoteCronAuditStats>
}

export async function createCronActor(
  identity?: Identity,
  canisterIdText: string = CRON_CANISTER_ID
): Promise<CronService> {
  const host = CRON_HOST
  const isLocal = host.includes("127.0.0.1") || host.includes("localhost")
  const agent = HttpAgent.createSync({ identity, host })
  if (isLocal) {
    await agent.fetchRootKey()
  }

  return Actor.createActor<CronService>(cronIdl, {
    agent,
    canisterId: Principal.fromText(canisterIdText),
  })
}
