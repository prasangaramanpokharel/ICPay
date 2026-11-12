"use client"

import { useState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { PencilEdit01Icon } from "@hugeicons/core-free-icons"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Spinner } from "@/components/ui/spinner"
import { useAuth } from "@/components/auth/auth-provider"
import { updateSavedCanisterName } from "@/lib/canister/savedCanisters"
import { updateCanisterNameOnCloud } from "@/services/canister/cnsClient"

export function RenameCanisterDialog({
  open,
  onOpenChange,
  canisterId,
  currentName,
  onSuccess,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  canisterId: string
  currentName: string
  onSuccess?: (newName: string) => void
}) {
  const { identity } = useAuth()
  const principal = identity?.getPrincipal().toText() ?? null
  const [draftName, setDraftName] = useState(currentName)
  const [saving, setSaving] = useState(false)
  const [prevOpen, setPrevOpen] = useState(open)

  if (open !== prevOpen) {
    setPrevOpen(open)
    if (open) {
      setDraftName(currentName)
      setSaving(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!principal) return
    const next = draftName.trim()
    setSaving(true)
    try {
      updateSavedCanisterName(principal, canisterId, next)
      if (identity) {
        await updateCanisterNameOnCloud(identity, canisterId, next)
      }
      toast.success("Canister name updated")
      onSuccess?.(next)
      onOpenChange(false)
    } catch {
      toast.error("Failed to update canister name")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <HugeiconsIcon icon={PencilEdit01Icon} className="size-5 text-muted-foreground" strokeWidth={1.75} />
            <DialogTitle>Edit canister name</DialogTitle>
          </div>
          <DialogDescription>
            Update the display label for this canister. Synced on-chain to your Internet Identity.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="canister-rename-input">Canister name</FieldLabel>
              <Input
                id="canister-rename-input"
                value={draftName}
                onChange={(e) => setDraftName(e.target.value)}
                placeholder="e.g. backend"
                maxLength={64}
                autoFocus
                disabled={saving}
              />
            </Field>
          </FieldGroup>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? <Spinner data-icon="inline-start" /> : null}
              <span>Save</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
