"use client"

import { useCallback, useEffect, useState } from "react"
import useSWR from "swr"
import { useAuth } from "@/components/auth/auth-provider"
import { optionalText } from "@/lib/bucket/bucket"
import {
  bytesToObjectUrl,
  fetchBucketFileBlob,
  normalizePublicFileUrl,
  revokeObjectUrl,
} from "@/lib/bucket/filePreview"
import { bucketFilePreviewKey } from "@/lib/bucket/cacheKeys"
import { BUCKET_QUERY } from "@/hooks/bucket/useBucket"
import { downloadFileBlob } from "@/services/bucket/bucket"
import type { FilePublic } from "@/services/bucket/types"

export function useBucketFilePreview(bucketId: string, file: FilePublic | null) {
  const { identity } = useAuth()
  const publicRaw = file ? optionalText(file.publicUrl) : null
  const publicUrl = publicRaw ? normalizePublicFileUrl(publicRaw) : null
  const path = file?.path ?? ""

  const [cdnFailedPath, setCdnFailedPath] = useState<string | null>(null)
  const useCanister = !publicUrl || cdnFailedPath === path

  const swrKey =
    file && identity && useCanister
      ? bucketFilePreviewKey(identity, bucketId, file.path)
      : null

  const { data: blobUrl, isLoading, error, mutate } = useSWR(
    swrKey,
    async () => {
      const bytes = await downloadFileBlob(identity!, bucketId, file!.path)
      return bytesToObjectUrl(bytes, file!.contentType)
    },
    {
      ...BUCKET_QUERY,
      dedupingInterval: 120_000,
    }
  )

  useEffect(() => {
    return () => {
      revokeObjectUrl(blobUrl)
    }
  }, [blobUrl])

  const previewUrl = useCanister ? (blobUrl ?? null) : publicUrl
  const loading = useCanister && isLoading && !blobUrl

  const handleImageError = useCallback(() => {
    if (publicUrl && path) setCdnFailedPath(path)
  }, [publicUrl, path])

  const refresh = useCallback(async () => {
    if (useCanister) await mutate()
  }, [mutate, useCanister])

  return {
    previewUrl,
    publicUrl,
    loading,
    error,
    handleImageError,
    refresh,
    viaCanister: useCanister,
  }
}

export function useBucketTextPreview(bucketId: string, file: FilePublic | null) {
  const { identity } = useAuth()
  const publicUrl = file ? optionalText(file.publicUrl) : null

  const swrKey = file
    ? ["bucket-text-preview", bucketId, file.path, String(file.updatedAt)]
    : null

  const { data: text, isLoading, error } = useSWR(
    swrKey,
    async () => {
      const blob = await fetchBucketFileBlob({
        publicUrl,
        identity: identity ?? undefined,
        bucketId,
        path: file!.path,
        contentType: file!.contentType,
      })
      const raw = await blob.text()
      return raw.slice(0, 100_000)
    },
    {
      ...BUCKET_QUERY,
      dedupingInterval: 120_000,
    }
  )

  return {
    text: text ?? null,
    loading: isLoading && text === undefined,
    error,
  }
}
