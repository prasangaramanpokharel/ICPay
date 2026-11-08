import type { Identity } from "@icp-sdk/core/agent"
import { createCronActor } from "./actor"
import type {
  RemoteApiKeySummary,
  RemoteCreateJobArgs,
  RemoteCreditBalance,
  RemoteExecutionLog,
  RemoteJobRecord,
  RemoteJobSummary,
  RemotePackQuote,
  RemoteProjectRecord,
} from "./types"

export async function listProjects(identity?: Identity): Promise<RemoteProjectRecord[]> {
  const actor = await createCronActor(identity)
  return actor.list_my_projects()
}

export async function createProject(
  name: string,
  identity?: Identity
): Promise<RemoteProjectRecord> {
  const actor = await createCronActor(identity)
  const res = await actor.create_project(name)
  if ("Ok" in res) return res.Ok
  throw new Error(res.Err)
}

export async function deleteProject(
  projectId: bigint,
  identity?: Identity
): Promise<void> {
  const actor = await createCronActor(identity)
  const res = await actor.delete_project(projectId)
  if ("Ok" in res) return
  throw new Error(res.Err)
}

export async function listJobs(
  projectId?: bigint,
  identity?: Identity
): Promise<RemoteJobSummary[]> {
  const actor = await createCronActor(identity)
  return actor.list_jobs(projectId ? [projectId] : [])
}

export async function getJob(
  jobId: bigint,
  identity?: Identity
): Promise<RemoteJobRecord> {
  const actor = await createCronActor(identity)
  const res = await actor.get_job(jobId)
  if ("Ok" in res) return res.Ok
  throw new Error(res.Err)
}

export async function createJob(
  args: RemoteCreateJobArgs,
  identity?: Identity
): Promise<RemoteJobRecord> {
  const actor = await createCronActor(identity)
  const res = await actor.create_job(args)
  if ("Ok" in res) return res.Ok
  throw new Error(res.Err)
}

export async function deleteJob(
  jobId: bigint,
  identity?: Identity
): Promise<void> {
  const actor = await createCronActor(identity)
  const res = await actor.delete_job(jobId)
  if ("Ok" in res) return
  throw new Error(res.Err)
}

export async function pauseJob(
  jobId: bigint,
  identity?: Identity
): Promise<void> {
  const actor = await createCronActor(identity)
  const res = await actor.pause_job(jobId)
  if ("Ok" in res) return
  throw new Error(res.Err)
}

export async function resumeJob(
  jobId: bigint,
  identity?: Identity
): Promise<void> {
  const actor = await createCronActor(identity)
  const res = await actor.resume_job(jobId)
  if ("Ok" in res) return
  throw new Error(res.Err)
}

export async function triggerJob(
  jobId: bigint,
  identity?: Identity
): Promise<void> {
  const actor = await createCronActor(identity)
  const res = await actor.trigger_job(jobId)
  if ("Ok" in res) return
  throw new Error(res.Err)
}

export async function getJobLogs(
  jobId: bigint,
  limit?: bigint,
  identity?: Identity
): Promise<RemoteExecutionLog[]> {
  const actor = await createCronActor(identity)
  return actor.get_job_logs(jobId, limit ? [limit] : [])
}

export async function listApiKeys(
  projectId: bigint,
  identity?: Identity
): Promise<RemoteApiKeySummary[]> {
  const actor = await createCronActor(identity)
  const res = await actor.list_api_keys(projectId)
  if ("Ok" in res) return res.Ok
  throw new Error(res.Err)
}

export async function createApiKey(
  projectId: bigint,
  label: string,
  identity?: Identity
): Promise<string> {
  const actor = await createCronActor(identity)
  const res = await actor.create_api_key(projectId, label)
  if ("Ok" in res) return res.Ok
  throw new Error(res.Err)
}

export async function revokeApiKey(
  keyHash: Uint8Array | number[],
  identity?: Identity
): Promise<void> {
  const actor = await createCronActor(identity)
  const res = await actor.revoke_api_key(keyHash)
  if ("Ok" in res) return
  throw new Error(res.Err)
}

export async function deleteApiKey(
  keyHash: Uint8Array | number[],
  identity?: Identity
): Promise<void> {
  const actor = await createCronActor(identity)
  const res = await actor.delete_api_key(keyHash)
  if ("Ok" in res) return
  throw new Error(res.Err)
}

export async function getMyCredits(
  identity?: Identity
): Promise<RemoteCreditBalance> {
  const actor = await createCronActor(identity)
  return actor.get_my_credits()
}

export async function getPackQuotes(
  identity?: Identity
): Promise<RemotePackQuote[]> {
  const actor = await createCronActor(identity)
  return actor.get_pack_quotes()
}

export async function buyPack(
  tier: number,
  blockIndex: bigint,
  identity?: Identity
): Promise<bigint> {
  const actor = await createCronActor(identity)
  const res = await actor.buy_pack(tier, blockIndex)
  if ("Ok" in res) return res.Ok
  throw new Error(res.Err)
}
