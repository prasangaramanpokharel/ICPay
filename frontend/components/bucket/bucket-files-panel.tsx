"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useTranslations } from "next-intl"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"
import { Drawer, DrawerContent } from "@/components/ui/drawer"
import { BucketFilePagination } from "@/components/bucket/bucket-file-pagination"
import { BucketFilePreviewPane } from "@/components/bucket/bucket-file-preview-pane"
import { BucketFileDeleteDialog } from "@/components/bucket/bucket-file-delete-dialog"
import { BucketSelectBar } from "@/components/bucket/bucket-select-bar"
import { BucketFilesToolbar, type FileSortKey } from "@/components/bucket/bucket-files-toolbar"
import { BucketFilesTable, entryKey } from "@/components/bucket/bucket-files-table"
import { BucketFilesGrid } from "@/components/bucket/bucket-files-grid"
import { getFileCategory, type FileCategory } from "@/components/bucket/bucket-file-icon"
import { useBucketExplorerHotkeys } from "@/hooks/bucket/useBucketExplorerHotkeys"
import { useBucketFiles, useBucketSearch, useBucketStats } from "@/hooks/bucket/useBucket"
import {
  folderTotals,
  joinObjectPath,
  listFolderEntries,
  nestedPrefix,
  normalizePrefix,
  pathsUnderFolder,
  stripLeadingSlash,
} from "@/lib/bucket/folderPath"
import type { FileListPage, FilePublic } from "@/services/bucket/types"
import type { FolderListEntry } from "@/lib/bucket/folderPath"

function sortEntries(
  entries: FolderListEntry<FilePublic>[],
  files: FilePublic[],
  prefix: string,
  sort: FileSortKey
): FolderListEntry<FilePublic>[] {
  return [...entries].sort((a, b) => {
    if (a.kind !== b.kind) return a.kind === "folder" ? -1 : 1
    if (sort === "size") {
      const as = a.kind === "folder" ? folderTotals(files, prefix, a.name).bytes : a.file.size
      const bs = b.kind === "folder" ? folderTotals(files, prefix, b.name).bytes : b.file.size
      return as === bs ? 0 : as > bs ? 1 : -1
    }
    if (sort === "type") {
      const at = a.kind === "folder" ? "folder" : a.file.contentType
      const bt = b.kind === "folder" ? "folder" : b.file.contentType
      return at.localeCompare(bt)
    }
    const an = a.kind === "folder" ? a.name : (a.file.path.split("/").pop() ?? "")
    const bn = b.kind === "folder" ? b.name : (b.file.path.split("/").pop() ?? "")
    return an.localeCompare(bn)
  })
}

export function BucketFilesPanel({
  bucketId,
  bucketName,
  canWrite,
  prefix,
  onPrefixChange,
  onDelete,
  onDeletePaths,
  onDeleteFolders,
  onCreateFolder,
}: {
  bucketId: string
  bucketName?: string
  canWrite: boolean
  prefix: string
  onPrefixChange: (prefix: string) => void
  onDelete: (path: string) => Promise<string | null>
  onDeletePaths: (paths: string[]) => Promise<string | null>
  onDeleteFolders: (paths: string[]) => Promise<string | null>
  onCreateFolder: () => void
}) {
  const t = useTranslations("bucket")
  const [page, setPage] = useState(0)
  const [previewFile, setPreviewFile] = useState<FilePublic | null>(null)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [query, setQuery] = useState("")
  const [debouncedQuery, setDebouncedQuery] = useState("")
  const [sort, setSort] = useState<FileSortKey>("name")
  const [category, setCategory] = useState<FileCategory>("all")
  const [viewMode, setViewMode] = useState<"list" | "grid">("list")
  const [refreshing, setRefreshing] = useState(false)
  const searching = debouncedQuery.length > 0

  const browse = useBucketFiles(searching ? null : bucketId, prefix, page)
  const search = useBucketSearch(searching ? bucketId : null, debouncedQuery, page)
  const active = searching ? search : browse
  const { files, total, totalPages, isLoading, refresh: refreshFiles } = active
  const { stats: fetchedStats, refresh: refreshStats } = useBucketStats(bucketId)
  const resolvedBucketName = bucketName || fetchedStats?.name

  const [prevFilter, setPrevFilter] = useState({ prefix, debouncedQuery })
  if (prevFilter.prefix !== prefix || prevFilter.debouncedQuery !== debouncedQuery) {
    setPrevFilter({ prefix, debouncedQuery })
    setPage(0)
  }

  const [prevSelectedDep, setPrevSelectedDep] = useState({ prefix, page, debouncedQuery })
  if (
    prevSelectedDep.prefix !== prefix ||
    prevSelectedDep.page !== page ||
    prevSelectedDep.debouncedQuery !== debouncedQuery
  ) {
    setPrevSelectedDep({ prefix, page, debouncedQuery })
    setSelected(new Set())
  }

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedQuery(query.trim()), 300)
    return () => window.clearTimeout(timer)
  }, [query])

  const entries = useMemo(() => {
    const raw = searching
      ? files.map((file) => ({ kind: "file" as const, file }))
      : listFolderEntries(files, prefix, browse.folders)

    if (category === "all") return raw
    return raw.filter((entry) => {
      if (entry.kind === "folder") return false
      return getFileCategory(entry.file.contentType, entry.file.path) === category
    })
  }, [browse.folders, category, files, prefix, searching])

  const visible = useMemo(
    () => sortEntries(entries, files, prefix, sort),
    [entries, files, prefix, sort]
  )
  const entryKeys = useMemo(() => visible.map(entryKey), [visible])
  const allSelected = entryKeys.length > 0 && entryKeys.every((k) => selected.has(k))

  const removeFileFromCache = async (path: string) => {
    const stripped = stripLeadingSlash(path)
    await refreshFiles(
      (current: FileListPage | undefined) => {
        if (!current) return current
        const items = current.items.filter((f) => stripLeadingSlash(f.path) !== stripped)
        const nextTotal = current.total > 0n ? current.total - 1n : 0n
        return { ...current, items, total: nextTotal }
      },
      { revalidate: false }
    )
    void refreshStats()
  }

  const removePathsFromCache = async (deletedPaths: string[], deletedFolders: string[]) => {
    const pathSet = new Set(deletedPaths.map(stripLeadingSlash))
    const folderPrefixes = deletedFolders.map((f) => {
      const p = stripLeadingSlash(f)
      return p.endsWith("/") ? p : `${p}/`
    })
    const folderNames = new Set(
      deletedFolders.map((f) => {
        const segs = stripLeadingSlash(f).replace(/\/$/, "").split("/")
        return segs[segs.length - 1]
      })
    )

    await refreshFiles(
      (current: FileListPage | undefined) => {
        if (!current) return current
        const items = current.items.filter((file) => {
          const stripped = stripLeadingSlash(file.path)
          if (pathSet.has(stripped)) return false
          if (folderPrefixes.some((p) => stripped.startsWith(p))) return false
          return true
        })
        const folders = (current.folders ?? []).filter((f) => !folderNames.has(f))
        const removedItemsCount = BigInt(current.items.length - items.length)
        const nextTotal = current.total >= removedItemsCount ? current.total - removedItemsCount : 0n
        return {
          ...current,
          items,
          folders,
          total: nextTotal,
        }
      },
      { revalidate: false }
    )
    void refreshStats()
  }

  const handleDelete = async (path: string) => {
    await removeFileFromCache(path)
    const err = await onDelete(path)
    if (err) {
      await refreshFiles()
      void refreshStats()
    }
    return err
  }

  const handleDeleteFolder = async (folderName: string) => {
    const folderPath = joinObjectPath(prefix, `${folderName}/`)
    const childPaths = pathsUnderFolder(files, prefix, folderName)
    await removePathsFromCache(childPaths, [folderPath])
    if (childPaths.length > 0) {
      await onDeletePaths(childPaths)
    }
    await onDeleteFolders([folderPath])
    await refreshFiles()
    void refreshStats()
  }

  const toggleKey = (key: string, on: boolean) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (on) next.add(key)
      else next.delete(key)
      return next
    })
  }

  const resolveSelectedPaths = () => {
    const paths: string[] = []
    const folderPaths: string[] = []
    for (const key of selected) {
      if (key.startsWith("file:")) {
        paths.push(key.slice(5))
        continue
      }
      const name = key.slice(7)
      paths.push(...pathsUnderFolder(files, prefix, name))
      folderPaths.push(joinObjectPath(prefix, `${name}/`))
    }
    return { paths: [...new Set(paths)], folderPaths: [...new Set(folderPaths)] }
  }

  const confirmBulkDelete = async () => {
    const { paths, folderPaths } = resolveSelectedPaths()
    setDeleting(true)
    const prevSelected = new Set(selected)
    await removePathsFromCache(paths, folderPaths)
    setSelected(new Set())

    const fileErr = paths.length > 0 ? await onDeletePaths(paths) : null
    const folderErr = !fileErr && folderPaths.length > 0 ? await onDeleteFolders(folderPaths) : null
    setDeleting(false)
    const err = fileErr ?? folderErr
    if (err) {
      setSelected(prevSelected)
      await refreshFiles()
      void refreshStats()
      return
    }
    setConfirmOpen(false)
    await refreshFiles()
    void refreshStats()
  }

  const selectAll = useCallback(() => {
    setSelected(new Set(entryKeys))
  }, [entryKeys])

  const requestDelete = useCallback(() => {
    if (selected.size === 0) return
    setConfirmOpen(true)
  }, [selected.size])

  const navigatingFolderRef = useRef<string | null>(null)
  const navigationTimestampRef = useRef<number>(0)

  const handleOpenFolder = useCallback(
    (folderName: string) => {
      const now = Date.now()
      // Ignore rapid double clicks on the same folder within 500ms
      if (
        navigatingFolderRef.current === folderName &&
        now - navigationTimestampRef.current < 500
      ) {
        return
      }

      // If already navigated into this folder recently, avoid duplicate nested navigation
      const normalized = normalizePrefix(prefix)
      if (normalized.endsWith(`${folderName}/`) && now - navigationTimestampRef.current < 800) {
        return
      }

      navigatingFolderRef.current = folderName
      navigationTimestampRef.current = now

      onPrefixChange(nestedPrefix(prefix, folderName))
      setPreviewFile(null)
      setQuery("")
    },
    [onPrefixChange, prefix]
  )

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      await Promise.all([refreshFiles(), refreshStats()])
    } finally {
      setRefreshing(false)
    }
  }

  useBucketExplorerHotkeys({
    enabled: true,
    canWrite,
    selectedCount: selected.size,
    confirmOpen,
    onSelectAll: selectAll,
    onRequestDelete: requestDelete,
    onCreateFolder,
    onConfirmDelete: () => {
      if (!deleting) void confirmBulkDelete()
    },
  })

  const empty = !isLoading && files.length === 0 && (searching || entries.length === 0)

  return (
    <div className="space-y-4">
      <BucketFilesToolbar
        query={query}
        sort={sort}
        category={category}
        viewMode={viewMode}
        refreshing={refreshing}
        onQueryChange={setQuery}
        onSortChange={setSort}
        onCategoryChange={setCategory}
        onViewModeChange={setViewMode}
        onRefresh={() => void handleRefresh()}
      />

      {canWrite ? (
        <BucketSelectBar
          count={selected.size}
          canWrite={canWrite}
          deleting={deleting}
          onClear={() => setSelected(new Set())}
          onDelete={() => setConfirmOpen(true)}
        />
      ) : null}

      {isLoading && files.length === 0 ? (
        <Skeleton className="h-40 w-full rounded-2xl" />
      ) : empty ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            {searching ? t("noFilterMatch") : t("noFiles")}
          </CardContent>
        </Card>
      ) : viewMode === "grid" ? (
        <BucketFilesGrid
          bucketId={bucketId}
          bucketName={resolvedBucketName}
          files={files}
          prefix={prefix}
          visible={visible}
          selected={selected}
          previewId={previewFile?.id}
          canWrite={canWrite}
          onToggleKey={toggleKey}
          onOpenFolder={handleOpenFolder}
          onOpenFile={setPreviewFile}
          onDeleteFile={(p) => void handleDelete(p)}
          onDeleteFolder={(name) => void handleDeleteFolder(name)}
        />
      ) : (
        <BucketFilesTable
          bucketId={bucketId}
          bucketName={resolvedBucketName}
          files={files}
          prefix={prefix}
          visible={visible}
          selected={selected}
          previewId={previewFile?.id}
          canWrite={canWrite}
          allSelected={allSelected}
          onToggleAll={(on) => setSelected(on ? new Set(entryKeys) : new Set())}
          onToggleKey={toggleKey}
          onOpenFolder={handleOpenFolder}
          onOpenFile={setPreviewFile}
          onDeleteFile={(p) => void handleDelete(p)}
          onDeleteFolder={(name) => void handleDeleteFolder(name)}
        />
      )}

      <BucketFilePagination
        page={page}
        totalPages={totalPages}
        total={total}
        onPageChange={setPage}
      />

      <Drawer
        open={previewFile !== null}
        onOpenChange={(open) => {
          if (!open) setPreviewFile(null)
        }}
        swipeDirection="right"
      >
        <DrawerContent>
          {previewFile ? (
            <BucketFilePreviewPane
              bucketId={bucketId}
              bucketName={resolvedBucketName}
              file={previewFile}
              canWrite={canWrite}
              onDelete={handleDelete}
              onDeleted={() => setPreviewFile(null)}
            />
          ) : null}
        </DrawerContent>
      </Drawer>

      <BucketFileDeleteDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        fileName=""
        count={selected.size}
        deleting={deleting}
        onConfirm={confirmBulkDelete}
      />
    </div>
  )
}
