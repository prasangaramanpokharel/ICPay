"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useTranslations } from "next-intl"
import { toast } from "@/components/ui/toast"
import { Skeleton } from "@/components/ui/skeleton"
import { Card } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from "@/components/ui/empty"
import { Button } from "@/components/ui/button"
import { Icon } from "@/components/ui/icon"
import { FolderGlassIcon, UploadGlassIcon } from "@thesvg/ui-react"
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
import { useBucketAllFiles, useBucketFiles, useBucketSearch, useBucketStats } from "@/hooks/bucket/useBucket"
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
  onMoveFile,
  onBulkMoveFiles,
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
  onMoveFile?: (sourcePath: string, destinationPath: string) => Promise<string | null>
  onBulkMoveFiles?: (operations: { source: string; destination: string }[]) => Promise<string | null>
}) {
  const t = useTranslations("bucket")
  const [page, setPage] = useState(0)
  const [previewFile, setPreviewFile] = useState<FilePublic | null>(null)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [deleteTarget, setDeleteTarget] = useState<
    | { type: "file"; path: string; name: string }
    | { type: "folder"; name: string }
    | { type: "bulk"; count: number }
    | null
  >(null)
  const [deleting, setDeleting] = useState(false)
  const [movingToFolder, setMovingToFolder] = useState<string | null>(null)
  const [query, setQuery] = useState("")
  const [debouncedQuery, setDebouncedQuery] = useState("")
  const [sort, setSortState] = useState<FileSortKey>(() => {
    if (typeof window === "undefined") return "name"
    const saved = window.localStorage.getItem("icpay:bucket:sort-key")
    return saved === "name" || saved === "size" || saved === "type" ? saved : "name"
  })
  const [category, setCategory] = useState<FileCategory>("all")
  const [viewMode, setViewModeState] = useState<"list" | "grid">(() => {
    if (typeof window === "undefined") return "list"
    const saved = window.localStorage.getItem("icpay:bucket:view-mode")
    return saved === "list" || saved === "grid" ? saved : "list"
  })
  const [refreshing, setRefreshing] = useState(false)
  const searching = debouncedQuery.length > 0

  const setSort = useCallback((next: FileSortKey) => {
    setSortState(next)
    if (typeof window !== "undefined") {
      window.localStorage.setItem("icpay:bucket:sort-key", next)
    }
  }, [])

  const setViewMode = useCallback((next: "list" | "grid") => {
    setViewModeState(next)
    if (typeof window !== "undefined") {
      window.localStorage.setItem("icpay:bucket:view-mode", next)
    }
  }, [])

  const browse = useBucketFiles(searching ? null : bucketId, prefix, page)
  const search = useBucketSearch(searching ? bucketId : null, debouncedQuery, page)
  const active = searching ? search : browse
  const { files, total, totalPages, isLoading, refresh: refreshFiles } = active
  const { allFiles, isLoading: allFilesLoading, refresh: refreshAllFiles } = useBucketAllFiles(bucketId)
  const { stats: fetchedStats, refresh: refreshStats } = useBucketStats(bucketId)
  const resolvedBucketName = bucketName || fetchedStats?.name

  const [prevFilter, setPrevFilter] = useState({ prefix, debouncedQuery })
  if (prevFilter.prefix !== prefix || prevFilter.debouncedQuery !== debouncedQuery) {
    setPrevFilter({ prefix, debouncedQuery })
    setPage(0)
  }

  if (page > 0 && totalPages > 0 && page >= totalPages) {
    setPage(totalPages - 1)
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
    () => sortEntries(entries, allFiles.length > 0 ? allFiles : files, prefix, sort),
    [allFiles, entries, files, prefix, sort]
  )
  const entryKeys = useMemo(() => visible.map(entryKey), [visible])
  const entryKeySet = useMemo(() => new Set(entryKeys), [entryKeys])
  const activeSelected = useMemo(() => {
    if (selected.size === 0) return selected
    const next = new Set<string>()
    for (const key of selected) {
      if (entryKeySet.has(key)) next.add(key)
    }
    return next
  }, [entryKeySet, selected])
  const allSelected = entryKeys.length > 0 && entryKeys.every((k) => activeSelected.has(k))

  const pruneSelection = useCallback(
    (keysToRemove: Iterable<string>, folderPrefixesToRemove: string[] = []) => {
      const removeSet = new Set(keysToRemove)
      const normPrefixes = folderPrefixesToRemove.map((p) =>
        stripLeadingSlash(p).replace(/\/?$/, "/")
      )
      setSelected((prev) => {
        if (prev.size === 0) return prev
        let changed = false
        const next = new Set<string>()
        for (const k of prev) {
          if (removeSet.has(k)) {
            changed = true
            continue
          }
          if (k.startsWith("file:")) {
            const stripped = stripLeadingSlash(k.slice(5))
            if (normPrefixes.some((pref) => stripped.startsWith(pref))) {
              changed = true
              continue
            }
          }
          next.add(k)
        }
        return changed ? next : prev
      })
    },
    []
  )

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
    const stripped = stripLeadingSlash(path)
    pruneSelection([`file:${path}`, `file:/${stripped}`, `file:${stripped}`])
    if (previewFile && stripLeadingSlash(previewFile.path) === stripped) {
      setPreviewFile(null)
    }
    await removeFileFromCache(path)
    const err = await onDelete(path)
    if (err) {
      toast.error(err)
      await refreshFiles()
      void refreshStats()
    } else {
      const fileName = path.split("/").pop() ?? path
      toast.success(`Deleted ${fileName}`)
      void refreshAllFiles()
    }
    return err
  }

  const handleDeleteFolder = async (folderName: string) => {
    const folderPath = joinObjectPath(prefix, `${folderName}/`)
    const filesForPaths = allFiles.length > 0 ? allFiles : files
    const childPaths = pathsUnderFolder(filesForPaths, prefix, folderName)
    pruneSelection([`folder:${folderName}`], [folderPath])
    if (
      previewFile &&
      stripLeadingSlash(previewFile.path).startsWith(
        stripLeadingSlash(folderPath).replace(/\/?$/, "/")
      )
    ) {
      setPreviewFile(null)
    }
    await removePathsFromCache(childPaths, [folderPath])
    let err: string | null = null
    if (childPaths.length > 0) {
      err = await onDeletePaths(childPaths)
    }
    if (!err) {
      const folderErr = await onDeleteFolders([folderPath])
      if (folderErr) {
        const lower = folderErr.toLowerCase()
        if (!lower.includes("not found") && !lower.includes("does not exist")) {
          err = folderErr
        }
      }
    }
    if (err) {
      toast.error(err)
    } else {
      toast.success(`Deleted folder "${folderName}"`)
    }
    await refreshFiles()
    void refreshStats()
    void refreshAllFiles()
  }

  const handleDropFilesIntoFolder = async (paths: string[], targetFolderName: string) => {
    if (!canWrite || paths.length === 0) return
    const targetFolderPrefix = nestedPrefix(prefix, targetFolderName)
    const operations: { source: string; destination: string }[] = []

    for (const sourcePath of paths) {
      const fileName = sourcePath.split("/").pop() ?? sourcePath
      const destinationPath = joinObjectPath(targetFolderPrefix, fileName)
      if (sourcePath !== destinationPath) {
        operations.push({ source: sourcePath, destination: destinationPath })
      }
    }

    if (operations.length === 0) return

    setMovingToFolder(targetFolderName)
    try {
      const movedPathsSet = new Set(operations.map((op) => stripLeadingSlash(op.source)))
      pruneSelection(
        operations.flatMap((op) => {
          const s = stripLeadingSlash(op.source)
          return [`file:${op.source}`, `file:/${s}`, `file:${s}`]
        })
      )
      if (previewFile && movedPathsSet.has(stripLeadingSlash(previewFile.path))) {
        setPreviewFile(null)
      }

      await refreshFiles(
        (current: FileListPage | undefined) => {
          if (!current) return current
          const items = current.items.filter((f) => !movedPathsSet.has(stripLeadingSlash(f.path)))
          const nextTotal =
            current.total >= BigInt(movedPathsSet.size)
              ? current.total - BigInt(movedPathsSet.size)
              : 0n
          return { ...current, items, total: nextTotal }
        },
        { revalidate: false }
      )

      let err: string | null = null
      if (onBulkMoveFiles && operations.length > 1) {
        err = await onBulkMoveFiles(operations)
      } else if (onMoveFile && operations.length === 1) {
        err = await onMoveFile(operations[0].source, operations[0].destination)
      } else if (onMoveFile) {
        for (const op of operations) {
          const itemErr = await onMoveFile(op.source, op.destination)
          if (itemErr) {
            err = itemErr
            break
          }
        }
      }

      if (err) {
        toast.error(err)
        await refreshFiles()
      } else {
        const label =
          operations.length === 1
            ? `Moved ${operations[0].source.split("/").pop()} to ${targetFolderName}`
            : `Moved ${operations.length} items to ${targetFolderName}`
        toast.success(label)
        await refreshFiles()
        void refreshStats()
        void refreshAllFiles()
      }
    } finally {
      setMovingToFolder(null)
    }
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
    const filesForPaths = allFiles.length > 0 ? allFiles : files
    for (const key of activeSelected) {
      if (key.startsWith("file:")) {
        paths.push(key.slice(5))
        continue
      }
      const name = key.slice(7)
      paths.push(...pathsUnderFolder(filesForPaths, prefix, name))
      folderPaths.push(joinObjectPath(prefix, `${name}/`))
    }
    return { paths: [...new Set(paths)], folderPaths: [...new Set(folderPaths)] }
  }

  const confirmBulkDelete = async () => {
    const { paths, folderPaths } = resolveSelectedPaths()
    const selectedCount = activeSelected.size
    const singleName =
      paths.length === 1 && folderPaths.length === 0
        ? paths[0].split("/").pop() ?? paths[0]
        : folderPaths.length === 1
          ? folderPaths[0].replace(/\/$/, "").split("/").pop() ?? folderPaths[0]
          : null
    setDeleting(true)
    const prevSelected = new Set(activeSelected)
    if (previewFile) {
      const previewStripped = stripLeadingSlash(previewFile.path)
      const deletedPathSet = new Set(paths.map(stripLeadingSlash))
      const deletedFolderPrefixes = folderPaths.map((f) =>
        stripLeadingSlash(f).replace(/\/?$/, "/")
      )
      if (
        deletedPathSet.has(previewStripped) ||
        deletedFolderPrefixes.some((pref) => previewStripped.startsWith(pref))
      ) {
        setPreviewFile(null)
      }
    }
    await removePathsFromCache(paths, folderPaths)
    setSelected(new Set())

    try {
      const fileErr = paths.length > 0 ? await onDeletePaths(paths) : null
      let folderErr: string | null = null
      if (!fileErr && folderPaths.length > 0) {
        const rawFolderErr = await onDeleteFolders(folderPaths)
        if (rawFolderErr) {
          const lower = rawFolderErr.toLowerCase()
          if (!lower.includes("not found") && !lower.includes("does not exist")) {
            folderErr = rawFolderErr
          }
        }
      }
      const err = fileErr ?? folderErr
      if (err) {
        setSelected(prevSelected)
        toast.error(err)
        await refreshFiles()
        void refreshStats()
        return
      }
      const label =
        selectedCount === 1 && singleName
          ? `Deleted ${singleName}`
          : `Deleted ${selectedCount} items`
      toast.success(label)
      await refreshFiles()
      void refreshStats()
      void refreshAllFiles()
    } finally {
      setDeleting(false)
    }
  }

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return
    const target = deleteTarget

    setDeleting(true)
    try {
      if (target.type === "bulk") {
        await confirmBulkDelete()
      } else if (target.type === "file") {
        await handleDelete(target.path)
      } else if (target.type === "folder") {
        await handleDeleteFolder(target.name)
      }
    } finally {
      setDeleting(false)
      setDeleteTarget(null)
    }
  }

  const selectAll = useCallback(() => {
    setSelected(new Set(entryKeys))
  }, [entryKeys])

  const requestDelete = useCallback(() => {
    if (activeSelected.size === 0) return
    setDeleteTarget({ type: "bulk", count: activeSelected.size })
  }, [activeSelected.size])

  const navigatingFolderRef = useRef<string | null>(null)
  const navigationTimestampRef = useRef<number>(0)

  const handleOpenFolder = useCallback(
    (folderName: string) => {
      const now = Date.now()
      if (
        navigatingFolderRef.current === folderName &&
        now - navigationTimestampRef.current < 500
      ) {
        return
      }

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
      await Promise.all([refreshFiles(), refreshStats(), refreshAllFiles()])
    } finally {
      setRefreshing(false)
    }
  }

  const handleQuickLook = useCallback(() => {
    if (activeSelected.size !== 1) return
    const [onlyKey] = Array.from(activeSelected)
    if (!onlyKey.startsWith("file:")) return
    const targetPath = onlyKey.slice(5)
    const found = files.find((f) => f.path === targetPath)
    if (!found) return
    setPreviewFile((prev) => (prev?.id === found.id ? null : found))
  }, [activeSelected, files])

  useBucketExplorerHotkeys({
    enabled: true,
    canWrite,
    selectedCount: activeSelected.size,
    confirmOpen: deleteTarget !== null,
    previewOpen: previewFile !== null,
    onSelectAll: selectAll,
    onClearSelection: () => setSelected(new Set()),
    onClosePreview: () => setPreviewFile(null),
    onQuickLook: handleQuickLook,
    onRequestDelete: requestDelete,
    onCreateFolder,
    onConfirmDelete: () => {
      if (!deleting) void handleConfirmDelete()
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
          count={activeSelected.size}
          canWrite={canWrite}
          deleting={deleting}
          onClear={() => setSelected(new Set())}
          onDelete={() => {
            if (activeSelected.size > 0) {
              setDeleteTarget({ type: "bulk", count: activeSelected.size })
            }
          }}
        />
      ) : null}

      {isLoading && files.length === 0 ? (
        viewMode === "grid" ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-border/60 bg-card p-3 space-y-2.5">
                <Skeleton className="aspect-square w-full rounded-lg" />
                <div className="space-y-1.5">
                  <Skeleton className="h-3.5 w-3/4 rounded-md" />
                  <Skeleton className="h-3 w-1/2 rounded-md" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <Card className="overflow-hidden border-border/80 bg-card/60 py-0 shadow-xs">
            <Table>
              <TableHeader>
                <TableRow className="border-border/60 hover:bg-transparent">
                  {canWrite ? (
                    <TableHead className="w-10">
                      <Skeleton className="size-4 rounded" />
                    </TableHead>
                  ) : null}
                  <TableHead className="min-w-[200px]">{t("name")}</TableHead>
                  <TableHead className="w-24 text-center">Type</TableHead>
                  <TableHead className="w-28 text-right">{t("fileSize")}</TableHead>
                  <TableHead className="w-32 text-right">Modified</TableHead>
                  <TableHead className="w-12 text-right" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from({ length: 6 }).map((_, i) => (
                  <TableRow key={i} className="border-border/40">
                    {canWrite ? (
                      <TableCell className="w-10">
                        <Skeleton className="size-4 rounded" />
                      </TableCell>
                    ) : null}
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <Skeleton className="size-4 shrink-0 rounded" />
                        <Skeleton className="h-4 w-36 rounded-md" />
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Skeleton className="mx-auto h-5 w-14 rounded-full" />
                    </TableCell>
                    <TableCell className="text-right">
                      <Skeleton className="ml-auto h-3.5 w-16 rounded-md" />
                    </TableCell>
                    <TableCell className="text-right">
                      <Skeleton className="ml-auto h-3.5 w-20 rounded-md" />
                    </TableCell>
                    <TableCell className="text-right">
                      <Skeleton className="ml-auto size-7 rounded-md" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        )
      ) : empty ? (
        <Empty className="border border-dashed border-border/80 bg-card/20 py-14">
          <EmptyHeader>
            <EmptyMedia
              variant="icon"
              className="size-12 rounded-(--radius) border border-primary/20 bg-primary/10 text-primary shadow-xs"
            >
              <Icon icon={FolderGlassIcon} className="size-6" strokeWidth={1.75} />
            </EmptyMedia>
            <EmptyTitle className="text-base font-semibold text-foreground">
              {searching ? t("noFilterMatch") : t("noFiles")}
            </EmptyTitle>
            <EmptyDescription className="max-w-xs text-xs text-muted-foreground">
              {searching
                ? "No files or folders matched your search filters."
                : "Drag and drop files anywhere to upload, or use the buttons below to add files or folders."}
            </EmptyDescription>
          </EmptyHeader>
          {!searching && canWrite ? (
            <EmptyContent className="flex flex-wrap flex-row items-center justify-center gap-2 pt-2">
              <Button
                type="button"
                size="sm"
                onClick={() => document.getElementById("bucket-upload-input")?.click()}
                className="gap-1.5"
              >
                <Icon icon={UploadGlassIcon} className="size-4" strokeWidth={1.75} />
                <span>{t("upload")}</span>
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => document.getElementById("bucket-upload-folder-input")?.click()}
                className="gap-1.5"
              >
                <Icon icon={FolderGlassIcon} className="size-4" strokeWidth={1.75} />
                <span>Upload folder</span>
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onCreateFolder}
                className="gap-1.5"
              >
                <Icon icon={FolderGlassIcon} className="size-4" strokeWidth={1.75} />
                <span>{t("createFolder")}</span>
              </Button>
            </EmptyContent>
          ) : null}
        </Empty>
      ) : viewMode === "grid" ? (
        <BucketFilesGrid
          bucketId={bucketId}
          bucketName={resolvedBucketName}
          files={files}
          allFiles={allFiles}
          allFilesLoading={allFilesLoading}
          prefix={prefix}
          visible={visible}
          selected={activeSelected}
          previewId={previewFile?.id}
          canWrite={canWrite}
          onToggleKey={toggleKey}
          onOpenFolder={handleOpenFolder}
          onOpenFile={setPreviewFile}
          onDeleteFile={(p) => {
            const name = p.split("/").pop() ?? p
            setDeleteTarget({ type: "file", path: p, name })
          }}
          onDeleteFolder={(name) => {
            setDeleteTarget({ type: "folder", name })
          }}
          onDropFilesIntoFolder={handleDropFilesIntoFolder}
          movingToFolder={movingToFolder}
        />
      ) : (
        <BucketFilesTable
          bucketId={bucketId}
          bucketName={resolvedBucketName}
          files={files}
          allFiles={allFiles}
          allFilesLoading={allFilesLoading}
          prefix={prefix}
          visible={visible}
          selected={activeSelected}
          previewId={previewFile?.id}
          canWrite={canWrite}
          allSelected={allSelected}
          onToggleAll={(on) => setSelected(on ? new Set(entryKeys) : new Set())}
          onToggleKey={toggleKey}
          onOpenFolder={handleOpenFolder}
          onOpenFile={setPreviewFile}
          onDeleteFile={(p) => {
            const name = p.split("/").pop() ?? p
            setDeleteTarget({ type: "file", path: p, name })
          }}
          onDeleteFolder={(name) => {
            setDeleteTarget({ type: "folder", name })
          }}
          onDropFilesIntoFolder={handleDropFilesIntoFolder}
          movingToFolder={movingToFolder}
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
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open && !deleting) setDeleteTarget(null)
        }}
        fileName={
          deleteTarget?.type === "file" || deleteTarget?.type === "folder"
            ? deleteTarget.name
            : ""
        }
        isFolder={deleteTarget?.type === "folder"}
        count={deleteTarget?.type === "bulk" ? deleteTarget.count : 1}
        deleting={deleting}
        onConfirm={handleConfirmDelete}
      />
    </div>
  )
}
