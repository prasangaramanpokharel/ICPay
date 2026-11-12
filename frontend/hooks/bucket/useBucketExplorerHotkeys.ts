"use client"

import { useEffect } from "react"

function isTypingTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false
  return Boolean(target.closest("input, textarea, select, [contenteditable=true]"))
}

export function useBucketExplorerHotkeys({
  enabled,
  canWrite,
  selectedCount,
  confirmOpen,
  previewOpen,
  onSelectAll,
  onClearSelection,
  onClosePreview,
  onQuickLook,
  onRequestDelete,
  onCreateFolder,
  onConfirmDelete,
}: {
  enabled: boolean
  canWrite: boolean
  selectedCount: number
  confirmOpen: boolean
  previewOpen?: boolean
  onSelectAll: () => void
  onClearSelection?: () => void
  onClosePreview?: () => void
  onQuickLook?: () => void
  onRequestDelete: () => void
  onCreateFolder: () => void
  onConfirmDelete: () => void
}) {
  useEffect(() => {
    if (!enabled) return

    const onKey = (event: KeyboardEvent) => {
      if (event.repeat) return
      const mod = event.ctrlKey || event.metaKey

      if (confirmOpen) {
        if (event.key === "Enter" && canWrite && selectedCount > 0) {
          event.preventDefault()
          onConfirmDelete()
        }
        return
      }

      const typing = isTypingTarget(event.target)

      if (event.key === "Escape" && !typing) {
        if (previewOpen && onClosePreview) {
          event.preventDefault()
          onClosePreview()
          return
        }
        if (selectedCount > 0 && onClearSelection) {
          event.preventDefault()
          onClearSelection()
          return
        }
      }

      if (event.key === " " && !mod && !typing && selectedCount === 1 && onQuickLook) {
        event.preventDefault()
        onQuickLook()
        return
      }

      if (
        (event.key === "Delete" || event.key === "Backspace") &&
        !mod &&
        !typing &&
        canWrite &&
        selectedCount > 0
      ) {
        event.preventDefault()
        onRequestDelete()
        return
      }

      if (mod && event.key.toLowerCase() === "a" && !typing) {
        event.preventDefault()
        onSelectAll()
        return
      }

      if (mod && event.key.toLowerCase() === "d" && canWrite && selectedCount > 0 && !typing) {
        event.preventDefault()
        onRequestDelete()
        return
      }

      if (mod && event.key.toLowerCase() === "f" && canWrite) {
        event.preventDefault()
        onCreateFolder()
      }
    }

    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [
    enabled,
    canWrite,
    selectedCount,
    confirmOpen,
    previewOpen,
    onSelectAll,
    onClearSelection,
    onClosePreview,
    onQuickLook,
    onRequestDelete,
    onCreateFolder,
    onConfirmDelete,
  ])
}
