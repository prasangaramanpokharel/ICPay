"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { useTranslations } from "next-intl"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Add01Icon,
  ConnectIcon,
  Grid2X2Icon,
  Link01Icon,
  ListViewIcon,
  Package01Icon,
} from "@hugeicons/core-free-icons"
import { Alert, AlertAction, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { Card, CardContent } from "@/components/ui/card"
import { CopyButton } from "@/components/ui/copy-button"
import { Table, TableBody } from "@/components/ui/table"
import { LinkCanisterDialog } from "@/components/canister/link-canister-dialog"
import { ConnectControllerDialog } from "@/components/canister/connect-controller-dialog"
import { OnboardAgentButton } from "@/components/canister/onboard-agent-button"
import { MyCanisterRow } from "@/components/canister/my-canister-row"
import { MyCanisterCard } from "@/components/canister/my-canister-card"
import { MyCanisterTopupDialog } from "@/components/canister/my-canister-topup-dialog"
import { AppPage } from "@/components/layout/dashboard/app-page"
import { useAuth } from "@/components/auth/auth-provider"
import { useMineCanisters } from "@/hooks/canister/useMineCanisters"
import { useMineStatusMap } from "@/hooks/canister/useMineStatusMap"
import {
  useSavedCanisterEntries,
  useSyncCloudCanisters,
} from "@/hooks/canister/useSavedCanisters"
import { displayCanisterLabel } from "@/lib/canister/savedCanisters"
import { cn } from "@/lib/ui/utils"

function EmptyBlock({
  message,
  actions,
  loading = false,
}: {
  message: string
  actions?: React.ReactNode
  loading?: boolean
}) {
  return (
    <div className="flex flex-col items-center gap-3 px-3 py-10 text-center">
      {loading ? (
        <Spinner className="size-8 text-primary" />
      ) : (
        <HugeiconsIcon
          icon={Package01Icon}
          className="size-10 text-muted-foreground/40"
        />
      )}
      <p className="max-w-xs text-sm text-muted-foreground">{message}</p>
      {actions}
    </div>
  )
}

export function MyCanistersPanel() {
  const t = useTranslations("myCanisters")
  const { identity, isAuthenticated } = useAuth()
  const principal = identity?.getPrincipal().toText() ?? null
  const mine = useMineCanisters(principal)
  const entries = useSavedCanisterEntries(principal)
  useSyncCloudCanisters(identity)
  const nameById = useMemo(() => new Map(entries.map((e) => [e.id, e.name])), [entries])
  const [topUpTarget, setTopUpTarget] = useState<string | null>(null)
  const [topUpOpen, setTopUpOpen] = useState(false)
  const [linkOpen, setLinkOpen] = useState(false)
  const [connectOpen, setConnectOpen] = useState(false)
  const [connectCanisterId, setConnectCanisterId] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  const knownCanisters = useMemo(
    () => mine.ids.map((id) => ({ id, name: nameById.get(id) })),
    [mine.ids, nameById]
  )

  const previews = useMineStatusMap(
    identity,
    mine.ids,
    Boolean(isAuthenticated && mine.ids.length > 0)
  )

  const handleOpenConnect = (canisterId?: string) => {
    const target =
      canisterId ||
      knownCanisters.find((c) => previews.map[c.id]?.kind === "denied")?.id ||
      knownCanisters[0]?.id ||
      null
    setConnectCanisterId(target)
    setConnectOpen(true)
  }

  const openLink = () => {
    setLinkOpen(true)
  }

  return (
    <AppPage
      title={t("title")}
      description={t("subtitle")}
      actions={
        <div className="flex items-center gap-2">
          <OnboardAgentButton principal={principal} />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={openLink}
            className="h-8 gap-1.5 px-3 text-xs font-medium cursor-pointer"
          >
            <HugeiconsIcon icon={Link01Icon} className="size-3.5 text-muted-foreground" strokeWidth={1.75} />
            <span>{t("link")}</span>
          </Button>
          <Button
            size="sm"
            className="h-8 gap-1.5 px-3.5 text-xs font-medium cursor-pointer"
            nativeButton={false}
            render={<Link href="/canister/create" />}
          >
            <HugeiconsIcon icon={Add01Icon} className="size-3.5" strokeWidth={2} />
            <span>{t("create")}</span>
          </Button>
        </div>
      }
    >
      <Alert className="bg-muted/30 pr-28">
        <AlertTitle>{t("yourPrincipal")}</AlertTitle>
        <AlertDescription>
          <div className="flex items-center gap-1.5">
            <span className="break-all font-mono text-xs text-foreground">{principal ?? "—"}</span>
            {principal ? (
              <CopyButton
                variant="ghost"
                size="icon-xs"
                value={principal}
                className="size-5 shrink-0 p-0 text-muted-foreground hover:bg-transparent hover:text-foreground cursor-pointer"
                iconClassName="size-3.5"
                aria-label="Copy principal"
              />
            ) : null}
          </div>
        </AlertDescription>
        {principal ? (
          <AlertAction className="top-1/2 -translate-y-1/2 right-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 px-3 text-xs font-medium cursor-pointer"
              onClick={() => handleOpenConnect()}
            >
              <HugeiconsIcon icon={ConnectIcon} className="size-3.5 text-muted-foreground" strokeWidth={1.75} />
              <span>Connect</span>
            </Button>
          </AlertAction>
        ) : null}
      </Alert>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-foreground">Projects</h2>
          <div className="flex items-center gap-0.5 rounded-lg border border-border/60 bg-muted/30 p-0.5">
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={cn(
                "flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors cursor-pointer hover:text-foreground",
                viewMode === "grid" && "bg-background text-foreground shadow-xs",
              )}
              title="Grid view"
              aria-label="Grid view"
            >
              <HugeiconsIcon icon={Grid2X2Icon} className="size-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={cn(
                "flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors cursor-pointer hover:text-foreground",
                viewMode === "list" && "bg-background text-foreground shadow-xs",
              )}
              title="List view"
              aria-label="List view"
            >
              <HugeiconsIcon icon={ListViewIcon} className="size-3.5" />
            </button>
          </div>
        </div>

        {mine.isLoading ? (
          <Card className="min-w-0 overflow-hidden p-0">
            <CardContent className="p-2">
              <EmptyBlock message={t("loading")} loading />
            </CardContent>
          </Card>
        ) : mine.ids.length === 0 ? (
          <Card className="min-w-0 overflow-hidden p-0">
            <CardContent className="p-2">
              <EmptyBlock
                message={t("empty")}
                actions={
                  <div className="flex flex-wrap justify-center gap-2">
                    <Button type="button" variant="outline" onClick={openLink}>
                      {t("link")}
                    </Button>
                    <Button nativeButton={false} render={<Link href="/canister/create" />}>
                      {t("create")}
                    </Button>
                  </div>
                }
              />
            </CardContent>
          </Card>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
            {mine.ids.map((id) => {
              const row = mine.metaById.get(id)
              const savedName = nameById.get(id) ?? ""
              const label =
                savedName || row?.name || displayCanisterLabel({ id, name: "" })
              return (
                <MyCanisterCard
                  key={id}
                  id={id}
                  label={label}
                  status={previews.map[id]}
                  statusLoading={previews.isLoading}
                  onTopUp={() => {
                    setTopUpTarget(id)
                    setTopUpOpen(true)
                  }}
                  onConnect={() => handleOpenConnect(id)}
                />
              )
            })}
          </div>
        ) : (
          <Card className="min-w-0 overflow-hidden p-0">
            <CardContent className="p-0">
              <Table>
                <TableBody>
                  {mine.ids.map((id) => {
                    const row = mine.metaById.get(id)
                    const savedName = nameById.get(id) ?? ""
                    const label =
                      savedName || row?.name || displayCanisterLabel({ id, name: "" })
                    return (
                      <MyCanisterRow
                        key={id}
                        id={id}
                        label={label}
                        selected={false}
                        status={previews.map[id]}
                        statusLoading={previews.isLoading}
                        onTopUp={() => {
                          setTopUpTarget(id)
                          setTopUpOpen(true)
                        }}
                        onConnect={() => handleOpenConnect(id)}
                      />
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>

      <LinkCanisterDialog
        open={linkOpen}
        onOpenChange={setLinkOpen}
        onSuccess={() => {
          previews.refresh()
        }}
      />


      {topUpTarget && (
        <MyCanisterTopupDialog
          open={topUpOpen}
          onOpenChange={(open) => {
            setTopUpOpen(open)
            if (!open) setTopUpTarget(null)
          }}
          canisterId={topUpTarget}
          onDone={() => {
            previews.refresh()
          }}
        />
      )}

      <ConnectControllerDialog
        open={connectOpen}
        onOpenChange={(open) => {
          setConnectOpen(open)
          if (!open) setConnectCanisterId(null)
        }}
        principal={principal}
        canisters={knownCanisters}
        initialCanisterId={connectCanisterId}
      />
    </AppPage>
  )
}
