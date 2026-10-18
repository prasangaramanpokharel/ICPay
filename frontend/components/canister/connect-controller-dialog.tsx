"use client"

import { useMemo, useState } from "react"
import { toast } from "sonner"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Cancel01Icon,
  ConnectIcon,
  Copy01Icon,
  Tick02Icon,
} from "@hugeicons/core-free-icons"
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
import { Field, FieldLabel } from "@/components/ui/field"
import { cn } from "@/lib/ui/utils"

export interface KnownCanister {
  id: string
  name?: string
}

interface ConnectControllerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  principal: string | null
  canisters?: KnownCanister[]
  initialCanisterId?: string | null
}

export function ConnectControllerDialog({
  open,
  onOpenChange,
  principal,
  canisters = [],
  initialCanisterId,
}: ConnectControllerDialogProps) {
  const [targetId, setTargetId] = useState("")
  const [copiedCmd, setCopiedCmd] = useState(false)
  const [copiedPrincipal, setCopiedPrincipal] = useState(false)

  // Synchronize targetId when dialog opens or initialCanisterId changes without cascading effect renders
  const [prevOpen, setPrevOpen] = useState(open)
  const [prevInitial, setPrevInitial] = useState(initialCanisterId)

  if (open !== prevOpen || initialCanisterId !== prevInitial) {
    setPrevOpen(open)
    setPrevInitial(initialCanisterId)
    if (open) {
      if (initialCanisterId) {
        setTargetId(initialCanisterId)
      } else if (canisters.length > 0) {
        setTargetId(canisters[0].id)
      } else {
        setTargetId("")
      }
    }
  }

  const isReady = targetId.trim().length > 0

  const activeCanisterId = useMemo(() => {
    const trimmed = targetId.trim()
    return trimmed.length > 0 ? trimmed : "<CANISTER_ID>"
  }, [targetId])

  const generatedCommand = useMemo(() => {
    const safePrincipal = principal || "<YOUR_PRINCIPAL>"
    return `export DFX_WARNING=-mainnet_plaintext_identity\ndfx canister --network ic update-settings ${activeCanisterId} --add-controller ${safePrincipal}`
  }, [activeCanisterId, principal])

  const handleCopyCommand = async () => {
    if (!isReady) {
      toast.error("Please choose or enter a canister ID first")
      return
    }
    try {
      await navigator.clipboard.writeText(generatedCommand)
      setCopiedCmd(true)
      toast.success("Command copied to clipboard")
      setTimeout(() => setCopiedCmd(false), 2000)
    } catch {
      toast.error("Failed to copy command")
    }
  }

  const handleCopyPrincipal = async () => {
    if (!principal) return
    try {
      await navigator.clipboard.writeText(principal)
      setCopiedPrincipal(true)
      toast.success("Principal copied")
      setTimeout(() => setCopiedPrincipal(false), 2000)
    } catch {
      toast.error("Failed to copy principal")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg gap-5 w-full min-w-0 overflow-hidden">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <HugeiconsIcon icon={ConnectIcon} className="size-4" />
            </div>
            <DialogTitle>Connect Canister via CLI</DialogTitle>
          </div>
          <DialogDescription>
            Run this command on your machine to add your Internet Identity as a controller.
            Once added, ICPay can monitor live cycles, status, and manage the canister.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 min-w-0 max-w-full">
          {/* Target Canister Field */}
          <Field className="gap-2 min-w-0 max-w-full">
            <FieldLabel htmlFor="connect-canister-id" className="text-xs font-medium">
              Choose or enter Canister ID
            </FieldLabel>
            <div className="relative min-w-0 max-w-full">
              <Input
                id="connect-canister-id"
                value={targetId}
                onChange={(e) => setTargetId(e.target.value)}
                placeholder="Enter or select a Canister ID..."
                className="font-mono text-xs pr-8 w-full min-w-0"
              />
              {targetId && (
                <button
                  type="button"
                  onClick={() => setTargetId("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  <HugeiconsIcon icon={Cancel01Icon} className="size-3.5" />
                </button>
              )}
            </div>

            {/* Quick Pick Chips */}
            {canisters.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 pt-1 min-w-0 max-w-full">
                <span className="text-[11px] text-muted-foreground">Quick select:</span>
                {canisters.map((c) => {
                  const isSelected = targetId === c.id
                  const label = c.name ? `${c.name} (${c.id.slice(0, 5)}…)` : c.id
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setTargetId(c.id)}
                      className={cn(
                        "inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] transition-colors cursor-pointer bg-transparent",
                        isSelected
                          ? "border-foreground/50 text-foreground font-medium"
                          : "border-border/60 text-muted-foreground hover:border-foreground/30 hover:text-foreground"
                      )}
                    >
                      {label}
                    </button>
                  )
                })}
              </div>
            )}
          </Field>

          {/* Generated dfx Command */}
          <div className="flex flex-col gap-1.5 min-w-0 max-w-full">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-foreground">Generated Command</span>
              <Button
                type="button"
                variant="ghost"
                size="xs"
                className="h-6 gap-1 px-2 text-[11px]"
                onClick={handleCopyCommand}
                disabled={!isReady}
              >
                <HugeiconsIcon
                  icon={copiedCmd ? Tick02Icon : Copy01Icon}
                  className={cn("size-3", copiedCmd && "text-emerald-500")}
                />
                <span>{copiedCmd ? "Copied" : "Copy command"}</span>
              </Button>
            </div>

            <div className="relative rounded-lg border border-border/60 bg-zinc-950 p-3 text-zinc-100 dark:border-zinc-800 dark:bg-black/50 min-w-0 max-w-full overflow-hidden">
              <pre className="w-full min-w-0 max-w-full overflow-x-auto whitespace-pre-wrap break-all font-mono text-xs leading-relaxed text-zinc-200">
                <code>{generatedCommand}</code>
              </pre>
            </div>
            {!isReady ? (
              <p className="text-[11px] text-amber-500 font-medium">
                Choose a canister from the list above or enter a canister ID to complete the command.
              </p>
            ) : (
              <p className="text-[11px] text-muted-foreground">
                Run this in your terminal using your operator identity (e.g. <code>default</code>).
              </p>
            )}
          </div>

          {/* Your Internet Identity Info */}
          <div className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/20 px-3 py-2 text-xs min-w-0 max-w-full gap-2">
            <div className="min-w-0 flex-1">
              <span className="text-[11px] text-muted-foreground block">Your Internet Identity Principal:</span>
              <span className="font-mono text-xs font-medium text-foreground truncate block">
                {principal ?? "—"}
              </span>
            </div>
            {principal && (
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                aria-label="Copy Principal"
                onClick={handleCopyPrincipal}
              >
                <HugeiconsIcon
                  icon={copiedPrincipal ? Tick02Icon : Copy01Icon}
                  className={cn("size-3.5", copiedPrincipal && "text-emerald-500")}
                />
              </Button>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2 sm:justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
          <Button
            type="button"
            className="gap-1.5"
            disabled={!isReady}
            onClick={handleCopyCommand}
          >
            <HugeiconsIcon icon={copiedCmd ? Tick02Icon : Copy01Icon} className="size-3.5" />
            <span>{copiedCmd ? "Copied!" : "Copy Command"}</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
