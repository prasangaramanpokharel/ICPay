import type { Principal } from "@icp-sdk/core/principal"

export type HttpMethodType = "GET" | "POST" | "HEAD"

export type RemoteJobTarget =
  | {
      CanisterCall: {
        canister_id: Principal
        method: string
        payload: Uint8Array
      }
    }
  | {
      HttpWebhook: {
        url: string
        method: { GET: null } | { POST: null } | { HEAD: null }
        headers: [string, string][]
        body: [] | [Uint8Array]
      }
    }

export interface RemoteCompiledCron {
  minutes: bigint
  hours: number
  days: number
  months: number
  weekdays: number
}

export type RemoteJobStatus =
  | { Active: null }
  | { Paused: null }
  | { Completed: null }
  | { ExhaustedCredits: null }
  | { DeadLetterQueue: null }
  | { AutoPausedDormant: null }
  | { TargetUnavailable: null }

export interface RemoteJobRecord {
  id: bigint
  project_id: bigint
  owner: Principal
  label: string
  target: RemoteJobTarget
  cron_expression: string
  compiled_cron: RemoteCompiledCron
  status: RemoteJobStatus
  max_retries: number
  consecutive_failures: number
  total_runs: bigint
  next_run_at: [] | [bigint]
  last_run_at: [] | [bigint]
  created_at: bigint
  updated_at: bigint
}

export interface RemoteProjectRecord {
  id: bigint
  owner: Principal
  name: string
  created_at: bigint
}

export interface RemoteCreateJobArgs {
  project_id: bigint
  label: string
  target: RemoteJobTarget
  cron_expression: string
  max_retries: [] | [number]
}

export interface RemoteJobSummary {
  id: bigint
  project_id: bigint
  label: string
  cron_expression: string
  target_type: string
  target_preview: string
  status: string
  consecutive_failures: number
  total_runs: bigint
  next_run_at: [] | [bigint]
  last_run_at: [] | [bigint]
}

export interface RemoteExecutionLog {
  log_id: bigint
  job_id: bigint
  started_at: bigint
  duration_ms: number
  success: boolean
  status_code: [] | [number]
  response_snippet: string
  error: [] | [string]
}

export interface RemoteApiKeySummary {
  key_hash: Uint8Array
  project_id: bigint
  label: string
  revoked: boolean
  created_at: bigint
}

export interface RemoteCreditBalance {
  free_runs_remaining: bigint
  prepaid_credits: bigint
  total_available: bigint
  total_used: bigint
}

export interface RemotePackQuote {
  pack_tier: number
  credits: bigint
  usd_cents: number
  icp_e8s: bigint
  treasury_principal: string
}
