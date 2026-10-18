"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { useTranslations } from "next-intl"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ConnectIcon,
  InformationCircleIcon,
  Package01Icon,
} from "@hugeicons/core-free-icons"
import { Alert, AlertAction, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { LinkCanisterDialog } from "@/components/canister/link-canister-dialog"
import { ConnectControllerDialog } from "@/components/canister/connect-controller-dialog"
import { MyCanisterRow } from "@/components/canister/my-canister-row"
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
import { subnetLabel } from "@/services/canister/controlledCanisters"
import { shortSubnetId } from "@/services/canister/subnetLocations"

function EmptyBlock({
  message,
  actions,
}: {
  message: string
  actions?: React.ReactNode
}) {
  return (
    <div className="flex flex-col items-center gap-3 px-3 py-10 text-center">
      <HugeiconsIcon
        icon={Package01Icon}
        className="size-10 text-muted-foreground/40"
      />
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
        <ButtonGroup>
          <Button type="button" variant="outline" size="sm" onClick={openLink}>
            {t("link")}
          </Button>
          <Button size="sm" nativeButton={false} render={<Link href="/canister/create" />}>
            {t("create")}
          </Button>
        </ButtonGroup>
      }
    >
      <Alert className="bg-muted/30">
        <HugeiconsIcon icon={InformationCircleIcon} />
        <AlertTitle>{t("yourPrincipal")}</AlertTitle>
        <AlertDescription>
          <p className="break-all font-mono text-xs text-foreground">{principal ?? "—"}</p>
        </AlertDescription>
        {principal ? (
          <AlertAction>
            <Button
              type="button"
              variant="outline"
              size="xs"
              className="h-7 gap-1 px-2.5 text-xs font-medium"
              onClick={() => handleOpenConnect()}
            >
              <HugeiconsIcon icon={ConnectIcon} className="size-3.5 text-primary" />
              <span>Connect</span>
            </Button>
          </AlertAction>
        ) : null}
      </Alert>

      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        <Card className="min-w-0 flex-1 gap-0">
          <CardHeader className="border-b pb-3">
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle className="text-base">{t("listTitle")}</CardTitle>
              <Badge variant="secondary">{t("count", { count: mine.ids.length })}</Badge>
            </div>
            <CardDescription>{t("listHint")}</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {mine.isLoading ? (
              <div className="p-2">
                <EmptyBlock message={t("loading")} />
              </div>
            ) : mine.ids.length === 0 ? (
              <div className="p-2">
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
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("listTitle")}</TableHead>
                    <TableHead className="text-right">Cycles</TableHead>
                    <TableHead className="w-[140px] text-right">{t("menuActions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mine.ids.map((id) => {
                    const row = mine.metaById.get(id)
                    const savedName = nameById.get(id) ?? ""
                    const label =
                      savedName || row?.name || displayCanisterLabel({ id, name: "" })
                    const hasFlags = Boolean(row?.countries.length)
                    const place = row
                      ? hasFlags
                        ? row.nodeCount > 0
                          ? `${row.nodeCount} nodes`
                          : ""
                        : subnetLabel(row) || shortSubnetId(row.subnetId)
                      : ""
                    return (
                      <MyCanisterRow
                        key={id}
                        id={id}
                        label={label}
                        place={place}
                        countries={row?.countries}
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
            )}
          </CardContent>
        </Card>
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
