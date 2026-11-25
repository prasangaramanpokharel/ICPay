"use client"

import { useCallback } from "react"
import { useSWRConfig } from "swr"
import { useAuth } from "@/components/auth/auth-provider"
import { usePersistedSWR } from "@/hooks/cache/usePersistedSWR"
import { useEffectivePrincipal } from "@/lib/auth/lastPrincipal"
import {
  getJobLogs,
  getMyCredits,
  listApiKeys,
  listJobs,
  listProjects,
} from "@/services/cron/client"
import type {
  RemoteApiKeySummary,
  RemoteCreditBalance,
  RemoteExecutionLog,
  RemoteJobSummary,
  RemoteProjectRecord,
} from "@/services/cron/types"

export const CRON_QUERY = {
  revalidateOnFocus: false,
  revalidateIfStale: true,
  revalidateOnMount: true,
  errorRetryCount: 3,
} as const

export interface EnrichedCronApiKey extends RemoteApiKeySummary {
  projectName: string
}

const cronProjectsCacheKey = (principal: string) => `icpay:cron:projects:${principal}`
const cronJobsCacheKey = (principal: string, scope: string) =>
  `icpay:cron:jobs:${principal}:${scope}`
const cronCreditsCacheKey = (principal: string) => `icpay:cron:credits:${principal}`
const cronApiKeysCacheKey = (principal: string) => `icpay:cron:apikeys:${principal}`
const cronJobLogsCacheKey = (principal: string, jobId: string) =>
  `icpay:cron:logs:${principal}:${jobId}`

export function useInvalidateCronCache() {
  const { mutate } = useSWRConfig()

  return useCallback(async () => {
    await mutate(
      (key) => Array.isArray(key) && typeof key[0] === "string" && key[0].startsWith("cron:")
    )
  }, [mutate])
}

export function useCronProjects() {
  const { identity, isLoading: authLoading } = useAuth()
  const { principal } = useEffectivePrincipal()
  const callerPrincipal = identity?.getPrincipal().toText() ?? null

  const { resolved, error, isInitialLoading, isValidating, mutate } =
    usePersistedSWR<RemoteProjectRecord[]>(
      callerPrincipal ? ["cron:projects", callerPrincipal] : null,
      () => listProjects(identity),
      {
        ...CRON_QUERY,
        keepPreviousData: true,
        dedupingInterval: 15_000,
        cacheKey: principal ? cronProjectsCacheKey(principal) : null,
        maxAgeMs: 5 * 60_000,
        authPending: authLoading,
      }
    )

  return {
    projects: resolved ?? [],
    error,
    isLoading: isInitialLoading,
    isValidating,
    mutate,
  }
}

export function useCronJobs(projectId?: bigint) {
  const { identity, isLoading: authLoading } = useAuth()
  const { principal } = useEffectivePrincipal()
  const callerPrincipal = identity?.getPrincipal().toText() ?? null
  const scope = projectId !== undefined ? projectId.toString() : "all"

  const { resolved, error, isInitialLoading, isValidating, mutate } =
    usePersistedSWR<RemoteJobSummary[]>(
      callerPrincipal ? ["cron:jobs", callerPrincipal, scope] : null,
      () => listJobs(projectId, identity),
      {
        ...CRON_QUERY,
        keepPreviousData: true,
        dedupingInterval: 10_000,
        cacheKey: principal ? cronJobsCacheKey(principal, scope) : null,
        maxAgeMs: 3 * 60_000,
        authPending: authLoading,
      }
    )

  return {
    jobs: resolved ?? [],
    error,
    isLoading: isInitialLoading,
    isValidating,
    mutate,
  }
}

export function useCronCredits() {
  const { identity, isLoading: authLoading } = useAuth()
  const { principal } = useEffectivePrincipal()
  const callerPrincipal = identity?.getPrincipal().toText() ?? null

  const { resolved, error, isInitialLoading, isValidating, mutate } =
    usePersistedSWR<RemoteCreditBalance | null>(
      callerPrincipal ? ["cron:credits", callerPrincipal] : null,
      () => getMyCredits(identity).catch(() => null),
      {
        ...CRON_QUERY,
        keepPreviousData: true,
        dedupingInterval: 15_000,
        cacheKey: principal ? cronCreditsCacheKey(principal) : null,
        maxAgeMs: 2 * 60_000,
        authPending: authLoading,
      }
    )

  return {
    credits: resolved ?? null,
    error,
    isLoading: isInitialLoading,
    isValidating,
    mutate,
  }
}

export function useCronApiKeys(projects: RemoteProjectRecord[]) {
  const { identity, isLoading: authLoading } = useAuth()
  const { principal } = useEffectivePrincipal()
  const callerPrincipal = identity?.getPrincipal().toText() ?? null
  const projectsSig = projects.map((p) => p.id.toString()).sort().join(",")

  const { resolved, error, isInitialLoading, isValidating, mutate } =
    usePersistedSWR<EnrichedCronApiKey[]>(
      callerPrincipal && projects.length > 0
        ? ["cron:apikeys", callerPrincipal, projectsSig]
        : null,
      async () => {
        const nested = await Promise.all(
          projects.map(async (p) => {
            try {
              const projectKeys = await listApiKeys(p.id, identity)
              return projectKeys.map((k) => ({
                ...k,
                projectName: p.name,
              }))
            } catch {
              return []
            }
          })
        )
        return nested.flat().sort((a, b) => Number(b.created_at - a.created_at))
      },
      {
        ...CRON_QUERY,
        keepPreviousData: true,
        dedupingInterval: 15_000,
        cacheKey: principal ? cronApiKeysCacheKey(principal) : null,
        maxAgeMs: 5 * 60_000,
        authPending: authLoading,
      }
    )

  return {
    keys: resolved ?? [],
    error,
    isLoading: isInitialLoading,
    isValidating,
    mutate,
  }
}

export function useCronJobLogs(jobId: bigint | null, enabled: boolean = true) {
  const { identity, isLoading: authLoading } = useAuth()
  const { principal } = useEffectivePrincipal()
  const callerPrincipal = identity?.getPrincipal().toText() ?? null
  const jobIdStr = jobId !== null ? jobId.toString() : null

  const { resolved, error, isInitialLoading, isValidating, mutate } =
    usePersistedSWR<RemoteExecutionLog[]>(
      enabled && callerPrincipal && jobIdStr
        ? ["cron:logs", callerPrincipal, jobIdStr]
        : null,
      () => getJobLogs(jobId!, 50n, identity ?? undefined),
      {
        ...CRON_QUERY,
        keepPreviousData: true,
        dedupingInterval: 2_000,
        cacheKey: principal && jobIdStr ? cronJobLogsCacheKey(principal, jobIdStr) : null,
        maxAgeMs: 2 * 60_000,
        authPending: authLoading,
      }
    )

  return {
    logs: resolved ?? [],
    error,
    isLoading: isInitialLoading,
    isValidating,
    mutate,
  }
}
