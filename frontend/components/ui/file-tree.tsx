"use client"

import * as React from "react"
import { Icon } from "@/components/ui/icon"
import { ArrowRightGlassIcon, FileGlassIcon, FolderGlassIcon } from "@thesvg/ui-react"

import { cn } from "@/lib/ui/utils"
import {
  collectFolderPaths,
  flattenVisible,
  type FileTreeFile,
  type FileTreeFolder,
  type FileTreeNode,
} from "@/lib/file-tree"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import { Kbd, KbdGroup } from "@/components/ui/kbd"
import { ScrollArea } from "@/components/ui/scroll-area"

const ROW_CLASS = cn(
  "flex min-h-8 w-full items-center gap-2 rounded-md px-2 text-start text-sm text-muted-foreground outline-none",
  "hover:bg-accent hover:text-foreground",
  "focus-visible:ring-2 focus-visible:ring-ring",
  "aria-selected:bg-accent aria-selected:text-foreground"
)

type TreeContext<T> = {
  selectedPath: string | undefined
  activePath: string | undefined
  isOpen: (path: string) => boolean
  setOpen: (path: string, open: boolean) => void
  onSelect: (file: FileTreeFile<T>) => void
  onFocusItem: (path: string) => void
  register: (path: string) => (element: HTMLElement | null) => void
  renderPreview?: (file: FileTreeFile<T>) => React.ReactNode
}

function NodeList<T>({
  nodes,
  ctx,
}: {
  nodes: readonly FileTreeNode<T>[]
  ctx: TreeContext<T>
}) {
  return (
    <>
      {nodes.map((node) =>
        node.kind === "folder" ? (
          <FolderNode key={node.path} node={node} ctx={ctx} />
        ) : (
          <FileNode key={node.path} node={node} ctx={ctx} />
        )
      )}
    </>
  )
}

function FolderNode<T>({
  node,
  ctx,
}: {
  node: FileTreeFolder<T>
  ctx: TreeContext<T>
}) {
  const open = ctx.isOpen(node.path)

  return (
    <Collapsible
      open={open}
      onOpenChange={(next) => ctx.setOpen(node.path, next)}
    >
      <CollapsibleTrigger
        role="treeitem"
        tabIndex={node.path === ctx.activePath ? 0 : -1}
        ref={ctx.register(node.path)}
        onFocus={() => ctx.onFocusItem(node.path)}
        className={ROW_CLASS}
      >
        <Icon
          icon={ArrowRightGlassIcon}
          className={cn("size-4 shrink-0 transition-transform", open && "rotate-90")}
        />
        <Icon
          icon={open ? FolderGlassIcon : FolderGlassIcon}
          className="size-4 shrink-0"
        />
        <span className="truncate">{node.name}</span>
      </CollapsibleTrigger>
      <CollapsibleContent role="group" className="ms-4 border-s border-border ps-1">
        <NodeList nodes={node.children} ctx={ctx} />
      </CollapsibleContent>
    </Collapsible>
  )
}

function FileNode<T>({
  node,
  ctx,
}: {
  node: FileTreeFile<T>
  ctx: TreeContext<T>
}) {
  const rowProps = {
    role: "treeitem",
    "aria-selected": node.path === ctx.selectedPath,
    tabIndex: node.path === ctx.activePath ? 0 : -1,
    ref: ctx.register(node.path),
    onClick: () => ctx.onSelect(node),
    onFocus: () => ctx.onFocusItem(node.path),
    className: ROW_CLASS,
  }

  const content = (
    <>
      <span className="size-4 shrink-0" aria-hidden />
      <Icon icon={FileGlassIcon} className="size-4 shrink-0" />
      <span className="truncate">{node.name}</span>
    </>
  )

  if (!ctx.renderPreview) {
    return (
      <button type="button" {...rowProps}>
        {content}
      </button>
    )
  }

  return (
    <HoverCard>
      <HoverCardTrigger
        render={<button type="button" {...rowProps} />}
      >
        {content}
      </HoverCardTrigger>
      <HoverCardContent side="right" align="start" className="w-72">
        {ctx.renderPreview(node)}
      </HoverCardContent>
    </HoverCard>
  )
}

export type FileTreeProps<T> = {
  nodes: readonly FileTreeNode<T>[]
  selectedPath?: string
  onSelect: (file: FileTreeFile<T>) => void
  renderPreview?: (file: FileTreeFile<T>) => React.ReactNode
  forceExpand?: boolean
  defaultExpandedDepth?: number
  label: string
  className?: string
}

export function FileTree<T>({
  nodes,
  selectedPath,
  onSelect,
  renderPreview,
  forceExpand = false,
  defaultExpandedDepth = 1,
  label,
  className,
}: FileTreeProps<T>) {
  const [expanded, setExpanded] = React.useState<ReadonlySet<string>>(() =>
    collectFolderPaths(nodes, defaultExpandedDepth)
  )
  const [focusedPath, setFocusedPath] = React.useState<string>()
  const itemRefs = React.useRef(new Map<string, HTMLElement>())

  const isOpen = React.useCallback(
    (path: string) => forceExpand || expanded.has(path),
    [forceExpand, expanded]
  )

  const setOpen = React.useCallback((path: string, open: boolean) => {
    setExpanded((previous) => {
      const next = new Set(previous)
      if (open) next.add(path)
      else next.delete(path)
      return next
    })
  }, [])

  const visible = React.useMemo(
    () => flattenVisible(nodes, isOpen),
    [nodes, isOpen]
  )

  const activePath =
    [focusedPath, selectedPath].find(
      (path) => path !== undefined && visible.some((item) => item.node.path === path)
    ) ?? visible[0]?.node.path

  const register = React.useCallback(
    (path: string) => (element: HTMLElement | null) => {
      if (element) itemRefs.current.set(path, element)
      else itemRefs.current.delete(path)
    },
    []
  )

  const focusPath = (path: string | undefined) => {
    if (path) itemRefs.current.get(path)?.focus()
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const index = visible.findIndex((item) => item.node.path === activePath)
    const current = visible[index]
    if (!current) return

    const focusAt = (next: number) =>
      focusPath(visible[Math.min(Math.max(next, 0), visible.length - 1)]?.node.path)

    switch (event.key) {
      case "ArrowDown":
        focusAt(index + 1)
        break
      case "ArrowUp":
        focusAt(index - 1)
        break
      case "Home":
        focusAt(0)
        break
      case "End":
        focusAt(visible.length - 1)
        break
      case "ArrowRight":
        if (current.node.kind !== "folder") return
        if (isOpen(current.node.path)) focusAt(index + 1)
        else setOpen(current.node.path, true)
        break
      case "ArrowLeft":
        if (current.node.kind === "folder" && isOpen(current.node.path) && !forceExpand) {
          setOpen(current.node.path, false)
        } else {
          focusPath(current.parentPath)
        }
        break
      default:
        return
    }
    event.preventDefault()
  }

  const ctx: TreeContext<T> = {
    selectedPath,
    activePath,
    isOpen,
    setOpen,
    onSelect,
    onFocusItem: setFocusedPath,
    register,
    renderPreview,
  }

  return (
    <ScrollArea className={cn("h-full", className)}>
      <div
        role="tree"
        aria-label={label}
        onKeyDown={handleKeyDown}
        className="grid gap-0.5 p-2"
      >
        <NodeList nodes={nodes} ctx={ctx} />
      </div>
    </ScrollArea>
  )
}

export type FileTreeHintsProps = {
  labels: { navigate: string; expand: string; open: string }
  className?: string
}

export function FileTreeHints({ labels, className }: FileTreeHintsProps) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground",
        className
      )}
    >
      <span className="flex items-center gap-1.5">
        <KbdGroup>
          <Kbd>↑</Kbd>
          <Kbd>↓</Kbd>
        </KbdGroup>
        {labels.navigate}
      </span>
      <span className="flex items-center gap-1.5">
        <KbdGroup>
          <Kbd>←</Kbd>
          <Kbd>→</Kbd>
        </KbdGroup>
        {labels.expand}
      </span>
      <span className="flex items-center gap-1.5">
        <Kbd>Enter</Kbd>
        {labels.open}
      </span>
    </div>
  )
}
