"use client"

import { useMemo, useState, useTransition } from "react"
import { useTranslations } from "next-intl"
import { toast } from "@/components/ui/sonner"

import { SettingsSection } from "./settings-section"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useAuth } from "@/components/auth/auth-provider"
import {
  updateCanisterSettings,
  formatManageError,
  type CanisterStatusView,
} from "@/services/canister/management"
import { parseCyclesT, cyclesToTInput } from "@/lib/canister/format"
import { cn } from "@/lib/ui/utils"

const PRESETS = [
  { label: "Unlimited", value: "0" },
  { label: "1 T", value: "1" },
  { label: "5 T", value: "5" },
  { label: "10 T", value: "10" },
]

export function CanisterResourcesCard({
  canisterId,
  data,
  isController,
  onRefresh,
}: {
  canisterId: string
  data: CanisterStatusView
  isController: boolean
  onRefresh: () => void
}) {
  const t = useTranslations("myCanisters")
  const { identity } = useAuth()

  const initialDays =
    data.freezingThresholdSeconds != null
      ? Math.max(1, Math.round(Number(data.freezingThresholdSeconds) / 86400))
      : 30
  const initialCompute =
    data.computeAllocationPercent != null ? Number(data.computeAllocationPercent) : 0
  const initialMem =
    data.memoryAllocationBytes != null
      ? Math.round(Number(data.memoryAllocationBytes) / (1024 * 1024))
      : 0
  const initialWasmMem =
    data.wasmMemoryLimitBytes != null
      ? Math.round(Number(data.wasmMemoryLimitBytes) / (1024 * 1024))
      : 0
  const initialReservedLimit =
    data.reservedCyclesLimit != null ? cyclesToTInput(data.reservedCyclesLimit) : "0"

  const [freezingDays, setFreezingDays] = useState(String(initialDays))
  const [computePercent, setComputePercent] = useState(String(initialCompute))
  const [memoryMb, setMemoryMb] = useState(String(initialMem))
  const [wasmMemoryMb, setWasmMemoryMb] = useState(String(initialWasmMem))
  const [reservedCyclesT, setReservedCyclesT] = useState(initialReservedLimit)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const isDirty = useMemo(() => {
    return (
      freezingDays !== String(initialDays) ||
      computePercent !== String(initialCompute) ||
      memoryMb !== String(initialMem) ||
      wasmMemoryMb !== String(initialWasmMem) ||
      reservedCyclesT !== initialReservedLimit
    )
  }, [
    freezingDays,
    computePercent,
    memoryMb,
    wasmMemoryMb,
    reservedCyclesT,
    initialDays,
    initialCompute,
    initialMem,
    initialWasmMem,
    initialReservedLimit,
  ])

  const handleOpenConfirm = (e: React.FormEvent) => {
    e.preventDefault()
    if (!identity || !canisterId || !isDirty) return

    const days = parseInt(freezingDays, 10)
    const compute = parseInt(computePercent, 10)
    const memory = parseInt(memoryMb, 10)
    const wasmMem = parseInt(wasmMemoryMb, 10)
    const reserved = parseCyclesT(reservedCyclesT)

    if (isNaN(days) || days < 0) {
      toast.error(t("freezingThresholdHint"))
      return
    }
    if (isNaN(compute) || compute < 0 || compute > 100) {
      toast.error(t("computeAllocationHint"))
      return
    }
    if (isNaN(memory) || memory < 0) {
      toast.error(t("memoryAllocationHint"))
      return
    }
    if (isNaN(wasmMem) || wasmMem < 0) {
      toast.error(t("wasmMemoryLimitHint"))
      return
    }
    if (reserved == null || reserved < 0n) {
      toast.error(t("reservedCyclesLimitHint"))
      return
    }

    setConfirmOpen(true)
  }

  const handleExecuteSave = () => {
    if (!identity || !canisterId) return
    setConfirmOpen(false)

    startTransition(async () => {
      try {
        const days = parseInt(freezingDays, 10)
        const compute = parseInt(computePercent, 10)
        const memory = parseInt(memoryMb, 10)
        const wasmMem = parseInt(wasmMemoryMb, 10)
        const reserved = parseCyclesT(reservedCyclesT) ?? 0n

        const freezingThreshold = BigInt(days) * 86400n
        const computeAllocation = BigInt(compute)
        const memoryAllocation = BigInt(memory) * 1024n * 1024n
        const wasmMemoryLimit = wasmMem > 0 ? BigInt(wasmMem) * 1024n * 1024n : 0n

        await updateCanisterSettings(identity, canisterId, {
          freezingThreshold,
          computeAllocation,
          memoryAllocation,
          reservedCyclesLimit: reserved,
          ...(wasmMemoryLimit > 0n ? { wasmMemoryLimit } : {}),
        })

        toast.success(t("settingsSaved"))
        onRefresh()
      } catch (err) {
        toast.error(formatManageError(err))
      }
    })
  }

  return (
    <>
      <form onSubmit={handleOpenConfirm}>
        <SettingsSection
          title={t("resourcesTitle")}
          description={t("resourcesSubtitle")}
          footer={
            isController ? (
              <Button
                type="submit"
                disabled={!isDirty || isPending}
                size="sm"
                className="cursor-pointer"
              >
                <span>{isPending ? "Saving…" : t("save")}</span>
              </Button>
            ) : null
          }
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="res-freezing" className="text-xs font-medium text-foreground">
                {t("freezingThreshold")}
              </label>
              <div className="relative">
                <Input
                  id="res-freezing"
                  type="text"
                  inputMode="numeric"
                  value={freezingDays}
                  onChange={(e) => setFreezingDays(e.target.value.replace(/[^\d]/g, ""))}
                  disabled={!isController || isPending}
                  className="pr-12 text-xs font-mono"
                />
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground select-none">
                  days
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                {t("freezingThresholdHint")}
              </p>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="res-compute" className="text-xs font-medium text-foreground">
                {t("computeAllocation")}
              </label>
              <div className="relative">
                <Input
                  id="res-compute"
                  type="text"
                  inputMode="numeric"
                  value={computePercent}
                  onChange={(e) => setComputePercent(e.target.value.replace(/[^\d]/g, ""))}
                  disabled={!isController || isPending}
                  className="pr-8 text-xs font-mono"
                />
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground select-none">
                  %
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                {t("computeAllocationHint")}
              </p>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="res-mem" className="text-xs font-medium text-foreground">
                {t("memoryAllocation")}
              </label>
              <div className="relative">
                <Input
                  id="res-mem"
                  type="text"
                  inputMode="numeric"
                  value={memoryMb}
                  onChange={(e) => setMemoryMb(e.target.value.replace(/[^\d]/g, ""))}
                  disabled={!isController || isPending}
                  className="pr-12 text-xs font-mono"
                />
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground select-none">
                  MB
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                {t("memoryAllocationHint")}
              </p>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="res-wasm" className="text-xs font-medium text-foreground">
                {t("wasmMemoryLimit")}
              </label>
              <div className="relative">
                <Input
                  id="res-wasm"
                  type="text"
                  inputMode="numeric"
                  value={wasmMemoryMb}
                  onChange={(e) => setWasmMemoryMb(e.target.value.replace(/[^\d]/g, ""))}
                  disabled={!isController || isPending}
                  className="pr-12 text-xs font-mono"
                />
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground select-none">
                  MB
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                {t("wasmMemoryLimitHint")}
              </p>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="res-reserved" className="text-xs font-medium text-foreground">
                {t("reservedCyclesLimit")}
              </label>
              <div className="relative">
                <Input
                  id="res-reserved"
                  type="text"
                  value={reservedCyclesT}
                  onChange={(e) => setReservedCyclesT(e.target.value)}
                  disabled={!isController || isPending}
                  placeholder="0"
                  className="pr-8 text-xs font-mono"
                />
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground select-none">
                  T
                </span>
              </div>
              <div className="inline-flex items-center gap-1 rounded-md border border-border/60 bg-muted/20 p-0.5 text-xs">
                {PRESETS.map((preset) => (
                  <button
                    key={preset.value}
                    type="button"
                    disabled={!isController || isPending}
                    onClick={() => setReservedCyclesT(preset.value)}
                    className={cn(
                      "px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer",
                      reservedCyclesT === preset.value
                        ? "bg-background text-foreground shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {preset.value === "0" ? t("presetUnlimited") : preset.label}
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-muted-foreground">
                {t("reservedCyclesLimitHint")}
              </p>
            </div>
          </div>
        </SettingsSection>
      </form>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>{t("save")}</AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-muted-foreground">
              {t("resourcesSubtitle")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction disabled={isPending} onClick={handleExecuteSave}>
              {t("save")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
