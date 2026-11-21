"use client"

import { useOptimistic, useState, useTransition } from "react"
import { useTranslations } from "next-intl"
import { mutate } from "swr"
import { toast } from "@/components/ui/sonner"
import { HugeiconsIcon } from "@hugeicons/react"
import { MoreHorizontalIcon, Delete02Icon } from "@hugeicons/core-free-icons"

import { SettingsSection } from "./settings-section"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { CopyButton } from "@/components/ui/copy-button"
import { useAuth } from "@/components/auth/auth-provider"
import {
  Principal,
  addController,
  removeController,
  formatManageError,
} from "@/services/canister/management"

function isValidPrincipal(text: string): boolean {
  try {
    const p = Principal.fromText(text.trim())
    return !p.isAnonymous()
  } catch {
    return false
  }
}

export function CanisterControllersCard({
  canisterId,
  controllers,
  isController,
  onRefresh,
}: {
  canisterId: string
  controllers: string[]
  isController: boolean
  onRefresh: () => void
}) {
  const t = useTranslations("myCanisters")
  const { identity } = useAuth()
  const principal = identity?.getPrincipal().toText() ?? null

  const [newControllerText, setNewControllerText] = useState("")
  const [removeTarget, setRemoveTarget] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const [optimisticControllers, setOptimisticControllers] = useOptimistic(
    controllers,
    (
      state,
      action: { type: "add"; principal: string } | { type: "remove"; principal: string }
    ) => {
      if (action.type === "add") return [...state, action.principal]
      return state.filter((ctrl) => ctrl !== action.principal)
    }
  )

  const isValid = isValidPrincipal(newControllerText)

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault()
    if (!identity || !canisterId || !isValid) return
    const text = newControllerText.trim()

    setNewControllerText("")
    startTransition(async () => {
      setOptimisticControllers({ type: "add", principal: text })
      try {
        await addController(identity, canisterId, text)
        toast.success(t("addControllerSuccessTitle"))
        void mutate(["canister-status", canisterId])
        void mutate(["canister-audit-info", canisterId])
        onRefresh()
      } catch (err) {
        toast.error(formatManageError(err))
      }
    })
  }

  const handleRemove = () => {
    if (!identity || !canisterId || !removeTarget) return
    const target = removeTarget
    setRemoveTarget(null)

    startTransition(async () => {
      setOptimisticControllers({ type: "remove", principal: target })
      try {
        await removeController(identity, canisterId, target)
        toast.success(t("controllerRemoved"))
        void mutate(["canister-status", canisterId])
        void mutate(["canister-audit-info", canisterId])
        onRefresh()
      } catch (err) {
        toast.error(formatManageError(err))
      }
    })
  }

  return (
    <>
      <SettingsSection
        title={t("controllersTitle")}
        description={t("controllersSubtitle")}
      >
        <div className="rounded-lg border border-border/40 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-border/40 hover:bg-transparent">
                <TableHead className="font-mono text-xs">{t("principal")}</TableHead>
                <TableHead className="text-xs">{t("role")}</TableHead>
                <TableHead className="w-10 text-right"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {optimisticControllers.map((ctrl) => {
                const isYou = principal === ctrl
                const isLast = optimisticControllers.length <= 1
                const cannotRemove = !isController || isYou || isLast

                return (
                  <TableRow key={ctrl} className="border-b border-border/20 transition-colors">
                    <TableCell className="font-mono text-xs text-foreground font-medium align-middle">
                      <div className="inline-flex items-center gap-1.5">
                        <span className="break-all">{ctrl}</span>
                        <CopyButton
                          value={ctrl}
                          aria-label={t("copy")}
                          className="size-4 p-0 text-muted-foreground hover:text-foreground cursor-pointer shrink-0"
                          iconClassName="size-2.5"
                        />
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap align-middle">
                      <div className="inline-flex items-center gap-1.5">
                        <span>{t("controllerRole")}</span>
                        {isYou && (
                          <span className="rounded border border-border/60 px-1.5 py-0.5 text-[10px] text-muted-foreground font-mono">
                            {t("you")}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right align-middle">
                      {cannotRemove ? (
                        <Tooltip>
                          <TooltipTrigger
                            render={
                              <span className="inline-block cursor-not-allowed">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon-xs"
                                  disabled
                                  className="size-7 text-muted-foreground/40 pointer-events-none"
                                  aria-label="Actions"
                                >
                                  <HugeiconsIcon icon={MoreHorizontalIcon} className="size-3.5" />
                                </Button>
                              </span>
                            }
                          />
                          <TooltipContent side="left">
                            {isYou ? t("cannotRemoveSelf") : t("cannotRemoveLast")}
                          </TooltipContent>
                        </Tooltip>
                      ) : (
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            render={
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon-xs"
                                className="size-7 cursor-pointer text-muted-foreground hover:text-foreground"
                                aria-label="Actions"
                              >
                                <HugeiconsIcon icon={MoreHorizontalIcon} className="size-3.5" />
                              </Button>
                            }
                          />
                          <DropdownMenuContent align="end" className="w-32">
                            <DropdownMenuItem
                              onClick={() => setRemoveTarget(ctrl)}
                              disabled={isPending}
                              className="cursor-pointer gap-2 text-xs text-destructive focus:text-destructive focus:bg-destructive/10"
                            >
                              <HugeiconsIcon icon={Delete02Icon} className="size-3.5" />
                              <span>{t("remove")}</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>

        {isController && (
          <form onSubmit={handleAdd} className="flex flex-col gap-2 pt-1">
            <label htmlFor="new-ctrl-input" className="text-xs font-medium text-foreground">
              {t("controllerLabel")}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-2 items-center">
              <Input
                id="new-ctrl-input"
                placeholder={t("principalPlaceholder")}
                value={newControllerText}
                onChange={(e) => setNewControllerText(e.target.value)}
                className="font-mono text-xs rounded-md"
                disabled={isPending}
              />
              <Button
                type="submit"
                size="sm"
                disabled={isPending || !isValid}
                className="h-8 cursor-pointer"
              >
                <span>{isPending ? "Adding…" : t("add")}</span>
              </Button>
            </div>
          </form>
        )}
      </SettingsSection>

      <AlertDialog
        open={removeTarget != null}
        onOpenChange={(open) => !open && setRemoveTarget(null)}
      >
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>{t("remove")}</AlertDialogTitle>
            <AlertDialogDescription className="space-y-1.5 text-xs text-muted-foreground">
              <p>{t("removeControllerConfirm")}</p>
              <p className="font-mono text-foreground break-all">{removeTarget}</p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={isPending}
              onClick={handleRemove}
            >
              {isPending ? "Removing…" : t("remove")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
