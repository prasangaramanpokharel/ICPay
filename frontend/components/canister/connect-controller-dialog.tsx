"use client"

import { useMemo, useState } from "react"
import { toast } from "@/components/ui/toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { CopyIconIndicator } from "@/components/ui/copy-button"
import { Input } from "@/components/ui/input"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import { Field, FieldLabel } from "@/components/ui/field"

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
  const [selectedOption, setSelectedOption] = useState<string>("")
  const [customId, setCustomId] = useState<string>("")
  const [copiedCmd, setCopiedCmd] = useState(false)

  const [prevOpen, setPrevOpen] = useState(open)
  const [prevInitial, setPrevInitial] = useState(initialCanisterId)

  if (open !== prevOpen || initialCanisterId !== prevInitial) {
    setPrevOpen(open)
    setPrevInitial(initialCanisterId)
    if (open) {
      if (initialCanisterId) {
        const found = canisters.some((c) => c.id === initialCanisterId)
        if (found) {
          setSelectedOption(initialCanisterId)
          setCustomId("")
        } else {
          setSelectedOption("custom")
          setCustomId(initialCanisterId)
        }
      } else if (canisters.length > 0) {
        setSelectedOption(canisters[0].id)
        setCustomId("")
      } else {
        setSelectedOption("custom")
        setCustomId("")
      }
    }
  }

  const isCustom = canisters.length === 0 || selectedOption === "custom"
  const activeCanisterId = isCustom ? customId.trim() : selectedOption

  const isReady = activeCanisterId.length > 0

  const displayCanisterId = isReady ? activeCanisterId : "<CANISTER_ID>"

  const generatedCommand = useMemo(() => {
    const safePrincipal = principal || "<YOUR_PRINCIPAL>"
    return `export DFX_WARNING=-mainnet_plaintext_identity\ndfx canister --network ic update-settings ${displayCanisterId} --add-controller ${safePrincipal}`
  }, [displayCanisterId, principal])

  const handleCopyCommand = async () => {
    if (!isReady) {
      toast.error("Please choose or enter a canister ID first")
      return
    }
    try {
      await navigator.clipboard.writeText(generatedCommand)
      setCopiedCmd(true)
      toast.success("Successfully copied")
      setTimeout(() => setCopiedCmd(false), 2000)
    } catch {
      toast.error("Failed to copy command")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md gap-5 w-full min-w-0 overflow-hidden">
        <DialogHeader>
          <DialogTitle>
            Connect Canister via CLI
          </DialogTitle>
          <DialogDescription className="text-xs">
            Add your Internet Identity as a controller to manage this canister.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 min-w-0 max-w-full">
          {canisters.length > 0 && (
            <Field className="gap-2 min-w-0 max-w-full">
              <FieldLabel htmlFor="connect-canister-select" className="text-xs font-medium">
                Canister
              </FieldLabel>
              <NativeSelect
                id="connect-canister-select"
                value={selectedOption}
                onChange={(e) => {
                  const val = e.target.value
                  setSelectedOption(val)
                  if (val !== "custom") {
                    setCustomId("")
                  }
                }}
                className="w-full text-xs"
              >
                {canisters.map((c) => (
                  <NativeSelectOption key={c.id} value={c.id}>
                    {c.name ? `${c.name} (${c.id.slice(0, 5)}…)` : c.id}
                  </NativeSelectOption>
                ))}
                <NativeSelectOption value="custom">Custom Canister ID…</NativeSelectOption>
              </NativeSelect>
            </Field>
          )}

          {isCustom && (
            <Field className="gap-2 min-w-0 max-w-full">
              <FieldLabel htmlFor="connect-custom-canister-id" className="text-xs font-medium">
                {canisters.length > 0 ? "Custom Canister ID" : "Canister ID"}
              </FieldLabel>
              <Input
                id="connect-custom-canister-id"
                value={customId}
                onChange={(e) => setCustomId(e.target.value.trim())}
                placeholder="aaaaa-aa..."
                className="font-mono text-xs w-full min-w-0"
                autoFocus={selectedOption === "custom"}
              />
            </Field>
          )}

          <div className="flex flex-col gap-1.5 min-w-0 max-w-full">
            <span className="text-xs font-medium text-foreground">Command</span>
            <div className="relative rounded-lg border border-border/60 bg-muted/40 p-3 text-foreground min-w-0 max-w-full overflow-hidden">
              <pre className="w-full min-w-0 max-w-full overflow-x-auto whitespace-pre-wrap break-all font-mono text-xs leading-relaxed text-foreground">
                <code>{generatedCommand}</code>
              </pre>
            </div>
            {!isReady ? (
              <p className="text-[11px] text-warning font-medium">
                Select a canister or enter an ID to complete the command.
              </p>
            ) : (
              <p className="text-[11px] text-muted-foreground">
                Run this in your terminal using your operator identity.
              </p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            className="w-full gap-1.5 cursor-pointer"
            disabled={!isReady}
            onClick={handleCopyCommand}
          >
            <CopyIconIndicator copied={copiedCmd} iconClassName="size-3.5" />
            <span>{copiedCmd ? "Copied!" : "Copy Command"}</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
