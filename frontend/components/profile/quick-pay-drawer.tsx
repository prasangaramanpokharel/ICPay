"use client"

import { useEffect, useRef, useState } from "react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Spinner } from "@/components/ui/spinner"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { Icon } from "@/components/ui/icon"
import { ExternalLinkGlassIcon, CheckGlassOutlineIcon } from "@thesvg/ui-react"
import { AmountInput } from "@/components/shared/amount-input"
import { useBalanceVisibility } from "@/components/wallet/balance-visibility-provider"
import { primeSuccessChime, playSuccessChime } from "@/lib/ui/successChime"
import {
  E8S,
  ICP_FEE,
  copyText,
  explorerTxUrl,
  formatAmount,
  formatE8s,
  parseIcp,
} from "@/lib/wallet/utils"
import { cn } from "@/lib/ui/utils"

const PRESETS = [1n, 5n, 10n] as const

const PURPOSES = [
  { key: "payment", memo: "Payment" },
  { key: "tip", memo: "Tip" },
  { key: "utility", memo: "Utility bill" },
  { key: "entertainment", memo: "Entertainment" },
  { key: "food", memo: "Food & drink" },
  { key: "transport", memo: "Transport" },
  { key: "shopping", memo: "Shopping" },
  { key: "gift", memo: "Gift" },
  { key: "donation", memo: "Donation" },
  { key: "other", memo: "Other" },
] as const

type PurposeKey = (typeof PURPOSES)[number]["key"]

type Sent = { amount: bigint; blockIndex: bigint }

export function QuickPayDrawer({
  open,
  onOpenChange,
  username,
  balance,
  request,
  onPay,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  username: string
  balance?: bigint
  request?: { amount: bigint; memo?: string }
  onPay: (amount: bigint, message?: string) => Promise<{ blockIndex: bigint } | string>
}) {
  const t = useTranslations("quickPay")
  const tc = useTranslations("common")
  const { hidden } = useBalanceVisibility()
  const [selected, setSelected] = useState<bigint | null>(E8S)
  const [custom, setCustom] = useState("")
  const [purpose, setPurpose] = useState<PurposeKey>(PURPOSES[0].key)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState<Sent | null>(null)

  const amount = request ? request.amount : (selected ?? parseIcp(custom))
  const memo = request ? request.memo : PURPOSES.find((p) => p.key === purpose)?.memo
  const total = amount === null ? null : amount + ICP_FEE
  const sendable = balance === undefined ? undefined : balance > ICP_FEE ? balance - ICP_FEE : 0n
  const insufficient = total !== null && balance !== undefined && total > balance
  const canSend = amount !== null && amount > 0n && !insufficient && !loading

  const handleSend = async () => {
    if (amount === null) return
    primeSuccessChime()
    setLoading(true)
    setError(null)
    const result = await onPay(amount, memo)
    setLoading(false)
    if (typeof result === "string") {
      setError(result)
      return
    }
    setSent({ amount, blockIndex: result.blockIndex })
  }

  const handleOpenChange = (next: boolean) => {
    onOpenChange(next)
    if (next) return
    setSent(null)
    setError(null)
    setPurpose(PURPOSES[0].key)
    setCustom("")
    setSelected(E8S)
  }

  return (
    <Drawer open={open} onOpenChange={handleOpenChange} showSwipeHandle>
      <DrawerContent>
        {sent ? (
          <PaySuccess
            username={username}
            amount={sent.amount}
            blockIndex={sent.blockIndex}
            onDone={() => handleOpenChange(false)}
          />
        ) : (
          <>
            <DrawerHeader>
              <DrawerTitle className="text-center">{t("title", { name: username })}</DrawerTitle>
              <DrawerDescription className="text-center">
                {request ? t("requestSubtitle", { name: username }) : t("subtitle")}
              </DrawerDescription>
            </DrawerHeader>

            <FieldGroup className="gap-4 px-4">
              {request ? (
                <div className="space-y-3 rounded-2xl bg-muted/40 p-5 text-center">
                  <p className="text-4xl font-bold tracking-tight tabular-nums">
                    {formatE8s(request.amount)}
                  </p>
                  <p className="text-xs text-muted-foreground">ICP</p>
                  {balance !== undefined && (
                    <Badge variant="secondary" className="mx-auto mt-2 font-normal tabular-nums">
                      {tc("balance")}{" "}
                      <span className="font-semibold text-foreground">
                        {hidden ? "••••••" : `${formatAmount(balance)} ICP`}
                      </span>
                    </Badge>
                  )}
                  {request.memo && (
                    <p className="border-t pt-3 text-sm">{request.memo}</p>
                  )}
                </div>
              ) : (
                <>
                  <Field className="gap-2">
                    <div className="flex min-h-6 items-center justify-between gap-2">
                      <FieldLabel className="shrink-0">{tc("amount")}</FieldLabel>
                      {balance !== undefined && (
                        <Badge variant="secondary" className="shrink-0 max-w-[65%] truncate font-normal tabular-nums">
                          {tc("balance")}{" "}
                          <span className="font-semibold text-foreground">
                            {hidden ? "••••••" : `${formatAmount(balance)} ICP`}
                          </span>
                        </Badge>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      {PRESETS.map((icp) => {
                        const value = icp * E8S
                        const active = selected === value
                        const tooBig = sendable !== undefined && value > sendable
                        return (
                          <Button
                            key={icp.toString()}
                            variant={active ? "default" : "outline"}
                            disabled={tooBig}
                            onClick={() => {
                              setSelected(value)
                              setError(null)
                            }}
                            className={cn(
                              "h-14 rounded-2xl text-base font-semibold",
                              active &&
                                "bg-primary/10 text-primary ring-1 ring-primary hover:bg-primary/15"
                            )}
                          >
                            {icp.toString()} ICP
                          </Button>
                        )
                      })}
                      <Button
                        variant={selected === null ? "default" : "outline"}
                        onClick={() => {
                          setSelected(null)
                          setError(null)
                        }}
                        className={cn(
                          "h-14 flex-col gap-0 rounded-2xl text-xs font-semibold",
                          selected === null &&
                            "bg-primary/10 text-primary ring-1 ring-primary hover:bg-primary/15"
                        )}
                      >
                        <span className="text-base leading-none">···</span>
                        {t("custom")}
                      </Button>
                    </div>
                  </Field>

                  {selected === null && (
                    <AmountInput
                      id="quick-pay-amount"
                      label={tc("amount")}
                      value={custom}
                      onChange={(v) => {
                        setCustom(v)
                        setError(null)
                      }}
                      balance={balance}
                      maxE8s={sendable}
                    />
                  )}

                  <Field className="gap-2">
                    <FieldLabel htmlFor="quick-pay-purpose">{t("purposeLabel")}</FieldLabel>
                    <Select
                      value={purpose}
                      onValueChange={(value) => setPurpose((value as PurposeKey) ?? PURPOSES[0].key)}
                    >
                      <SelectTrigger id="quick-pay-purpose" className="h-12 w-full rounded-2xl">
                        <SelectValue placeholder={t("purposePlaceholder")} />
                      </SelectTrigger>
                      <SelectContent>
                        {PURPOSES.map((option) => (
                          <SelectItem key={option.key} value={option.key}>
                            {t(`purposes.${option.key}`)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                </>
              )}

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </FieldGroup>

            <DrawerFooter>
              <Button disabled={!canSend} onClick={handleSend}>
                {loading && <Spinner data-icon="inline-start" />}
                <span>
                  {loading
                    ? t("sending")
                    : insufficient
                      ? t("insufficient")
                      : amount !== null && amount > 0n
                        ? t("confirmAmount", { amount: formatAmount(amount) })
                        : t("confirm")}
                </span>
              </Button>
            </DrawerFooter>
          </>
        )}
      </DrawerContent>
    </Drawer>
  )
}

function PaySuccess({
  username,
  amount,
  blockIndex,
  onDone,
}: {
  username: string
  amount: bigint
  blockIndex: bigint
  onDone: () => void
}) {
  const t = useTranslations("quickPay")
  const tc = useTranslations("common")
  const chimed = useRef(false)
  useEffect(() => {
    if (chimed.current) return
    chimed.current = true
    playSuccessChime()
  }, [])

  const [shared, setShared] = useState(false)
  const link = explorerTxUrl(blockIndex)

  const handleShare = async () => {
    const payload = {
      title: t("shareSheetTitle"),
      text: t("shareSheetText", { amount: formatE8s(amount), name: username }),
      url: link,
    }
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share(payload)
        return
      } catch (e) {
        if (e instanceof Error && e.name === "AbortError") return
      }
    }
    await copyText(link)
    setShared(true)
    setTimeout(() => setShared(false), 1500)
  }

  return (
    <div className="flex flex-col items-center px-4 pb-8 pt-10 text-center">
      <div className="animate-in fade-in zoom-in-75 flex size-18 items-center justify-center rounded-full bg-success/10 duration-300 ease-out">
        <span className="flex size-13 items-center justify-center rounded-full bg-success text-success-foreground shadow-sm">
          <Icon icon={CheckGlassOutlineIcon} className="size-8 text-success-foreground" strokeWidth={3} />
        </span>
      </div>

      <p className="mt-6 text-3xl font-bold tracking-tight tabular-nums">
        {formatE8s(amount)} ICP
      </p>
      <p className="mt-2 text-sm text-muted-foreground">{t("sentTo", { name: username })}</p>

      <a
        href={explorerTxUrl(blockIndex)}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 inline-flex items-center gap-1 text-xs text-muted-foreground underline underline-offset-2"
      >
        {t("viewOnDashboard")}
        <Icon icon={ExternalLinkGlassIcon} className="size-3" />
      </a>

      <div className="mt-8 flex w-full items-center gap-2">
        <Button className="flex-1" onClick={onDone}>
          {tc("done")}
        </Button>
        <Button
          variant="outline"
          onClick={handleShare}
          className="shrink-0"
        >
          {shared ? tc("copied") : t("shareReceipt")}
        </Button>
      </div>
    </div>
  )
}
