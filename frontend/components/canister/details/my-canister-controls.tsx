"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { toast } from "sonner"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowUp02Icon,
  Camera01Icon,
  ConnectIcon,
  Link01Icon,
  MoreHorizontalIcon,
  PlayIcon,
  RefreshIcon,
  SentIcon,
  Settings02Icon,
  StopIcon,
  UserAdd01Icon,
} from "@hugeicons/core-free-icons"
import { Spinner } from "@/components/ui/spinner"
import { Button } from "@/components/ui/button"
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MyCanisterTopupDialog } from "@/components/canister/details/my-canister-topup-dialog"
import { MyCanisterTransferDialog } from "@/components/canister/details/my-canister-transfer-dialog"
import { MyCanisterAddControllerDialog } from "@/components/canister/details/my-canister-add-controller-dialog"
import { useAuth } from "@/components/auth/auth-provider"
import {
  formatManageError,
  startCanister,
  stopCanister,
} from "@/services/canister/management"
import { rememberCanister } from "@/lib/canister/savedCanisters"
import type { CanisterStatusState } from "@/hooks/canister/useCanisterStatus"

export function MyCanisterControls({
  canisterId,
  status,
  onRefresh,
  onConnect,
  onSelectTab,
}: {
  canisterId: string
  status: CanisterStatusState
  onRefresh: () => void
  onConnect?: () => void
  onSelectTab?: (tab: "overview" | "settings" | "snapshots") => void
}) {
  const t = useTranslations("myCanisters")
  const { identity } = useAuth()
  const [busy, setBusy] = useState<"start" | "stop" | null>(null)
  const [stopOpen, setStopOpen] = useState(false)
  const [topupOpen, setTopupOpen] = useState(false)
  const [transferOpen, setTransferOpen] = useState(false)
  const [addControllerOpen, setAddControllerOpen] = useState(false)

  const canControl = status.kind === "ok" && status.data.isController
  const running = status.kind === "ok" && status.data.runStatus === "running"
  const isStopping = status.kind === "ok" && status.data.runStatus === "stopping"

  const run = async (action: "start" | "stop") => {
    if (!identity) return
    setBusy(action)
    try {
      if (action === "start") {
        await startCanister(identity, canisterId)
        toast.success("Canister started successfully")
      } else {
        await stopCanister(identity, canisterId)
        toast.success("Canister stopped successfully")
      }
      rememberCanister(identity.getPrincipal().toText(), canisterId)
      onRefresh()
    } catch (e) {
      toast.error(formatManageError(e))
    } finally {
      setBusy(null)
      setStopOpen(false)
    }
  }

  return (
    <>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon-sm"
          className="size-8 cursor-pointer"
          nativeButton={false}
          render={
            <a
              href={`https://dashboard.internetcomputer.org/canister/${canisterId}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="View on IC Dashboard"
            />
          }
        >
          <HugeiconsIcon icon={Link01Icon} className="size-4 text-muted-foreground" />
        </Button>

        {canControl ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setAddControllerOpen(true)}
            className="h-8 gap-1.5 px-3 text-xs font-medium cursor-pointer"
          >
            <HugeiconsIcon icon={UserAdd01Icon} className="size-3.5 text-muted-foreground" strokeWidth={1.75} />
            <span>Add controller</span>
          </Button>
        ) : onConnect ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onConnect}
            className="h-8 gap-1.5 px-3 text-xs font-medium cursor-pointer"
          >
            <HugeiconsIcon icon={ConnectIcon} className="size-3.5 text-muted-foreground" strokeWidth={1.75} />
            <span>Connect</span>
          </Button>
        ) : null}

        <Button
          type="button"
          size="sm"
          onClick={() => setTopupOpen(true)}
          className="h-8 gap-1.5 px-3.5 text-xs font-medium cursor-pointer"
        >
          <HugeiconsIcon icon={ArrowUp02Icon} className="size-3.5" strokeWidth={2} />
          <span>Top up</span>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                type="button"
                size="icon-sm"
                variant="outline"
                className="size-8 cursor-pointer"
                aria-label="More actions"
              />
            }
          >
            {busy != null ? (
              <Spinner className="size-3.5" />
            ) : (
              <HugeiconsIcon icon={MoreHorizontalIcon} className="size-4 text-muted-foreground" />
            )}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuGroup>
              {canControl && (
                <>
                  {running ? (
                    <DropdownMenuItem
                      onClick={() => setStopOpen(true)}
                      disabled={busy != null}
                      className="cursor-pointer gap-2 text-destructive focus:text-destructive focus:bg-destructive/10"
                    >
                      {busy === "stop" ? (
                        <Spinner className="size-4 text-destructive" />
                      ) : (
                        <HugeiconsIcon icon={StopIcon} className="size-4 text-destructive" />
                      )}
                      <span>{busy === "stop" ? t("stopping") : "Stop canister"}</span>
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem
                      onClick={() => void run("start")}
                      disabled={busy != null || isStopping}
                      className="cursor-pointer gap-2 text-success focus:text-success focus:bg-success/10"
                    >
                      {busy === "start" ? (
                        <Spinner className="size-4 text-success" />
                      ) : (
                        <HugeiconsIcon icon={PlayIcon} className="size-4 text-success" />
                      )}
                      <span>{busy === "start" ? t("starting") : isStopping ? "Stopping..." : "Start canister"}</span>
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuItem
                    onClick={() => setTransferOpen(true)}
                    className="cursor-pointer gap-2"
                  >
                    <HugeiconsIcon icon={SentIcon} className="size-4 text-muted-foreground" />
                    <span>{t("transfer")}</span>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />
                </>
              )}

              {onSelectTab && (
                <>
                  <DropdownMenuItem
                    onClick={() => onSelectTab("settings")}
                    className="cursor-pointer gap-2"
                  >
                    <HugeiconsIcon icon={Settings02Icon} className="size-4 text-muted-foreground" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onSelectTab("snapshots")}
                    className="cursor-pointer gap-2"
                  >
                    <HugeiconsIcon icon={Camera01Icon} className="size-4 text-muted-foreground" />
                    <span>Snapshots</span>
                  </DropdownMenuItem>
                </>
              )}

              <DropdownMenuItem
                onClick={onRefresh}
                className="cursor-pointer gap-2"
              >
                <HugeiconsIcon icon={RefreshIcon} className="size-4 text-muted-foreground" />
                <span>Reload status</span>
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                nativeButton={false}
                render={
                  <a
                    href={`https://dashboard.internetcomputer.org/canister/${canisterId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="cursor-pointer gap-2"
                  />
                }
              >
                <HugeiconsIcon icon={Link01Icon} className="size-4 text-muted-foreground" />
                <span>View on IC Dashboard</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <AlertDialog open={stopOpen} onOpenChange={setStopOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("stopConfirmTitle")}</AlertDialogTitle>
            <AlertDialogDescription>{t("stopConfirmBody")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <div className="flex items-center justify-end gap-2">
              <AlertDialogCancel>{t("topUpCancel")}</AlertDialogCancel>
              <AlertDialogAction
                variant="destructive"
                disabled={busy === "stop"}
                onClick={() => void run("stop")}
              >
                {busy === "stop" && <Spinner data-icon="inline-start" />}
                <span>{busy === "stop" ? t("stopping") : t("stop")}</span>
              </AlertDialogAction>
            </div>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <MyCanisterTopupDialog
        open={topupOpen}
        onOpenChange={setTopupOpen}
        canisterId={canisterId}
        onDone={onRefresh}
      />
      <MyCanisterTransferDialog
        open={transferOpen}
        onOpenChange={setTransferOpen}
        fromCanisterId={canisterId}
        onDone={onRefresh}
      />
      <MyCanisterAddControllerDialog
        open={addControllerOpen}
        onOpenChange={setAddControllerOpen}
        canisterId={canisterId}
        onDone={onRefresh}
      />
    </>
  )
}
