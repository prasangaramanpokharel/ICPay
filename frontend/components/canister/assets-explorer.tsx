"use client"

import * as React from "react"
import Image from "next/image"
import useSWR from "swr"

import {
  buildFileTree,
  countFiles,
  filterFileTree,
  toTreePath,
  type FileTreeFile,
} from "@/lib/file-tree"
import { Button } from "@/components/ui/button"
import { CopyButton } from "@/components/ui/copy-button"
import { FileTree, FileTreeHints } from "@/components/ui/file-tree"
import { Input } from "@/components/ui/input"
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"

export type AssetEncoding = {
  content_encoding: string
  sha256?: [] | [Uint8Array | number[]]
  sha256Hex?: string
  length: bigint
  modified: bigint
}

export type AssetEntry = {
  key: string
  content_type: string
  encodings: AssetEncoding[]
}

export type AssetsExplorerLabels = {
  search: string
  tree: string
  empty: string
  noSelection: string
  type: string
  encoding: string
  size: string
  modified: string
  hash: string
  download: string
  delete: string
  hints: { navigate: string; expand: string; open: string }
}

export type AssetPreviewResult = {
  text?: string
  imageUrl?: string
  isBinary?: boolean
}

const BYTE_UNITS = ["B", "KB", "MB", "GB"] as const

function formatBytes(length: bigint): string {
  let value = Number(length)
  let unit = 0
  while (value >= 1024 && unit < BYTE_UNITS.length - 1) {
    value /= 1024
    unit += 1
  }
  return `${unit === 0 ? value : value.toFixed(2)} ${BYTE_UNITS[unit]}`
}

function formatModified(nanoseconds: bigint): string {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(Number(nanoseconds / 1_000_000n)))
}

function readHash(encoding: AssetEncoding): string | undefined {
  if (encoding.sha256Hex && encoding.sha256Hex !== "—") return encoding.sha256Hex
  if (!encoding.sha256 || encoding.sha256.length === 0) return undefined
  return Array.from(encoding.sha256[0], (byte) => byte.toString(16).padStart(2, "0")).join("")
}

function MetaList({ children }: { children: React.ReactNode }) {
  return (
    <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-1 text-sm [&_dt]:text-muted-foreground [&_dd]:truncate">
      {children}
    </dl>
  )
}

function AssetPreview({
  asset,
  labels,
}: {
  asset: AssetEntry
  labels: AssetsExplorerLabels
}) {
  const first = asset.encodings[0]
  return (
    <MetaList>
      <dt>{labels.type}</dt>
      <dd className="font-mono">{asset.content_type}</dd>
      {first && (
        <>
          <dt>{labels.size}</dt>
          <dd>{formatBytes(first.length)}</dd>
          <dt>{labels.modified}</dt>
          <dd>{formatModified(first.modified)}</dd>
        </>
      )}
    </MetaList>
  )
}

function AssetDetails({
  asset,
  labels,
  onDelete,
  onFetchPreview,
}: {
  asset: AssetEntry | undefined
  labels: AssetsExplorerLabels
  onDelete?: (key: string) => void
  onFetchPreview?: (key: string) => Promise<AssetPreviewResult>
}) {
  const { data: preview, isLoading: loading } = useSWR(
    asset && onFetchPreview ? ["asset-file-preview", asset.key] : null,
    () => (asset && onFetchPreview ? onFetchPreview(asset.key) : null),
    { revalidateOnFocus: false }
  )

  if (!asset) {
    return <p className="p-6 text-sm text-muted-foreground">{labels.noSelection}</p>
  }

  const first = asset.encodings[0]
  const hash = first ? readHash(first) : undefined

  return (
    <ScrollArea className="h-full">
      <div className="grid gap-4 p-5">
        <header className="flex items-center justify-between gap-4 border-b border-border/40 pb-3">
          <div className="min-w-0 space-y-1">
            <h3 className="truncate font-mono text-sm font-semibold text-foreground">{asset.key}</h3>
            <div className="flex flex-wrap items-center gap-2 font-mono text-xs text-muted-foreground">
              <span>{asset.content_type}</span>
              {first && (
                <>
                  <span>·</span>
                  <span>{formatBytes(first.length)}</span>
                  <span>·</span>
                  <span>{formatModified(first.modified)}</span>
                </>
              )}
            </div>
          </div>
          {onDelete && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onDelete(asset.key)}
              className="shrink-0 h-7 text-xs cursor-pointer"
            >
              {labels.delete}
            </Button>
          )}
        </header>

        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-44 w-full rounded-lg" />
          </div>
        ) : preview?.text ? (
          <div className="rounded-lg border border-border/40 bg-muted/20 overflow-hidden">
            <div className="flex items-center justify-between border-b border-border/40 px-3 py-1.5 bg-muted/40 text-[11px] text-muted-foreground font-mono">
              <span>{asset.key.split("/").pop()}</span>
              <CopyButton value={preview.text} size="icon-xs" variant="ghost" />
            </div>
            <pre className="p-3 text-xs font-mono overflow-auto max-h-72 whitespace-pre-wrap select-text text-foreground">
              {preview.text}
            </pre>
          </div>
        ) : preview?.imageUrl ? (
          <div className="rounded-lg border border-border/40 p-4 bg-muted/10 flex items-center justify-center">
            <Image
              src={preview.imageUrl}
              alt={asset.key}
              unoptimized
              width={400}
              height={300}
              className="max-h-72 w-auto max-w-full rounded object-contain"
            />
          </div>
        ) : preview?.isBinary ? (
          <div className="rounded-lg border border-border/40 bg-muted/10 p-6 text-center text-xs text-muted-foreground">
            Binary asset ({formatBytes(first?.length ?? 0n)}) · Preview unavailable
          </div>
        ) : null}

        {hash && (
          <div className="rounded-md border border-border/40 bg-muted/20 p-2.5 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-muted-foreground">{labels.hash}</span>
              <CopyButton value={hash} size="icon-xs" variant="ghost" />
            </div>
            <p className="font-mono text-[11px] break-all text-muted-foreground select-all">{hash}</p>
          </div>
        )}
      </div>
    </ScrollArea>
  )
}

export type AssetsExplorerProps = {
  assets: readonly AssetEntry[]
  labels: AssetsExplorerLabels
  onDelete?: (key: string) => void
  onFetchPreview?: (key: string) => Promise<AssetPreviewResult>
}

export function AssetsExplorer({
  assets,
  labels,
  onDelete,
  onFetchPreview,
}: AssetsExplorerProps) {
  const [query, setQuery] = React.useState("")
  const [selectedKey, setSelectedKey] = React.useState<string>(assets[0]?.key)

  const nodes = React.useMemo(() => buildFileTree(assets, (asset) => asset.key), [assets])
  const filtered = React.useMemo(() => filterFileTree(nodes, query), [nodes, query])
  const selected = assets.find((asset) => asset.key === selectedKey) ?? assets[0]

  const handleSelect = (file: FileTreeFile<AssetEntry>) => setSelectedKey(file.data.key)

  return (
    <div className="grid gap-4">
      <Input
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder={labels.search}
        aria-label={labels.search}
      />

      <div className="h-96 overflow-hidden rounded-lg border border-border">
        <ResizablePanelGroup orientation="horizontal">
          <ResizablePanel defaultSize={35} minSize={20}>
            {countFiles(filtered) === 0 ? (
              <p className="p-6 text-sm text-muted-foreground">{labels.empty}</p>
            ) : (
              <FileTree
                label={labels.tree}
                nodes={filtered}
                selectedPath={selected ? toTreePath(selected.key) : undefined}
                onSelect={handleSelect}
                forceExpand={query.trim().length > 0}
                renderPreview={(file) => <AssetPreview asset={file.data} labels={labels} />}
              />
            )}
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={65} minSize={30}>
            <AssetDetails
              asset={selected}
              labels={labels}
              onDelete={onDelete}
              onFetchPreview={onFetchPreview}
            />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      <FileTreeHints labels={labels.hints} />
    </div>
  )
}
