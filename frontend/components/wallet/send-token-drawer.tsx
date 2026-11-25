"use client"

import { useState } from "react"
import { useLocale, useTranslations } from "next-intl"
import useSWR from "swr"
import { motion, AnimatePresence } from "motion/react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Spinner } from "@/components/ui/spinner"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import {
  formatTokenAmount,
  parseTokenAmount,
  toPlainTokenAmount,
  memoByteLength,
  MEMO_MAX_BYTES,
} from "@/lib/wallet/utils"
import { primeSuccessChime } from "@/lib/ui/successChime"
import { validateUsername } from "@/lib/profile/username"
import { RecipientLookup } from "@/components/transfer/recipient-card"
import { QrScanner } from "@/components/scan/scan"
import { addressText, detectTypedAddress, type ScannedAddress } from "@/lib/wallet/icpAddress"
import { parseIcrcPaymentUri } from "@/lib/wallet/paymentUri"
import { useResolvedUsername } from "@/hooks/wallet/useWalletData"
import { useAuth } from "@/components/auth/auth-provider"
import { fetchTransferConsentMessage } from "@/services/ledger/consent"
import { useDebounced } from "@/hooks/ui/useDebounced"
import { useBalanceVisibility } from "@/components/wallet/balance-visibility-provider"
import { cn } from "@/lib/ui/utils"
import type { TokenHolding } from "@/services/tokens"
import { ICP_LEDGER_ID } from "@/services/tokens"
import type { TransferMode } from "@/services/transfer/transfer"

const PERCENTAGES = [25, 50, 75, 100]

const modeFor: Record<ScannedAddress["kind"], TransferMode> = {
  account: "account",
  icrc1: "principal",
  principal: "principal",
  username: "username",
}

export function SendTokenDrawer({
  open,
  onOpenChange,
  token,
  onSend,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  token: TokenHolding
  onSend: (
    mode: TransferMode,
    to: string,
    amount: bigint,
    memo?: string,
    subaccount?: Uint8Array
  ) => Promise<string | null>
}) {
  const t = useTranslations("sendToken")
  const tc = useTranslations("common")
  const locale = useLocale()
  const { identity } = useAuth()
  const tt = useTranslations("transfer")
  const { hidden } = useBalanceVisibility()
  const [username, setUsername] = useState("")
  const [value, setValue] = useState("")
  const [memo, setMemo] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [scanOpen, setScanOpen] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [mode, setMode] = useState<TransferMode>("username")
  const [subaccount, setSubaccount] = useState<Uint8Array | null>(null)

  const amount = parseTokenAmount(value, token.decimals)
  const total = amount === null ? null : amount + token.fee
  const sendable = token.balance > token.fee ? token.balance - token.fee : 0n
  const insufficient = total !== null && total > token.balance
  const memoTooLong = memoByteLength(memo.trim()) > MEMO_MAX_BYTES
  const handle = username.trim().replace(/^@/, "").toLowerCase()
  const recipient = mode === "username" ? handle : username.trim()
  const isIcp = token.ledgerId === ICP_LEDGER_ID

  const applyAddress = (hit: ScannedAddress, raw?: string) => {
    if (hit.kind === "account" && !isIcp) {
      setError(t("accountIdIcpOnly", { symbol: token.symbol }))
      return
    }
    setMode(modeFor[hit.kind])
    setUsername(addressText(hit))
    setSubaccount(hit.kind === "icrc1" ? hit.subaccount : null)
    setError(null)

    if (raw) {
      const icrcPay = parseIcrcPaymentUri(raw)
      if (icrcPay?.amount) setValue(icrcPay.amount)
    }
  }

  const handleRecipientChange = (raw: string) => {
    const hit = detectTypedAddress(raw)
    if (hit) {
      applyAddress(hit)
      return
    }
    setUsername(raw)
    setMode("username")
    setSubaccount(null)
    setError(null)
  }

  const full = (v: bigint) => formatTokenAmount(v, token.decimals, token.decimals)
  const setAmount = (v: bigint) => {
    setValue(toPlainTokenAmount(v, token.decimals))
    setError(null)
  }
  const debouncedHandle = useDebounced(mode === "username" ? handle : "")
  const { principal: resolved, isLoading: resolving } = useResolvedUsername(debouncedHandle)
  const canSend =
    (mode === "username" ? validateUsername(handle) === null : recipient.length > 0) &&
    amount !== null &&
    !insufficient &&
    !memoTooLong &&
    !loading

  const { data: consentText } = useSWR(
    confirming && canSend && identity
      ? (["transfer-consent", token.ledgerId, locale] as const)
      : null,
    () => fetchTransferConsentMessage(identity, token.ledgerId, locale),
    { revalidateOnFocus: false }
  )

  const handleSend = async () => {
    if (amount === null) return
    primeSuccessChime()
    setLoading(true)
    setError(null)
    const err = await onSend(
      mode,
      recipient,
      amount,
      memo.trim() || undefined,
      subaccount ?? undefined
    )
    setLoading(false)
    if (err) {
      setError(err)
      return
    }
    setUsername("")
    setMode("username")
    setSubaccount(null)
    setValue("")
    setMemo("")
    setConfirming(false)
    onOpenChange(false)
  }

  const resetForm = () => {
    setConfirming(false)
    setUsername("")
    setMode("username")
    setSubaccount(null)
    setValue("")
    setMemo("")
    setError(null)
  }

  return (
    <Drawer
      open={open}
      onOpenChange={(next) => {
        if (!next) resetForm()
        onOpenChange(next)
      }}
      showSwipeHandle
    >
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle className="text-center">
            {confirming ? t("confirmTitle") : t("title", { symbol: token.symbol })}
          </DrawerTitle>
          <DrawerDescription className="text-center">
            {confirming
              ? t("confirmSubtitle", { symbol: token.symbol })
              : t("subtitle", { symbol: token.symbol })}
          </DrawerDescription>
        </DrawerHeader>

        <AnimatePresence mode="wait">
          {confirming ? (
            <motion.div
              key="confirm-step"
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ type: "spring", stiffness: 380, damping: 30 }}
              className="space-y-4 px-4"
            >
              <div className="space-y-2 rounded-2xl bg-muted/40 p-4 text-sm">
                <Row label={t("recipient")} value={recipient || "—"} />
                <Row
                  label={tc("amount")}
                  value={amount === null ? "—" : `${full(amount)} ${token.symbol}`}
                  emphasis
                />
                <Row label={tc("fee")} value={`${full(token.fee)} ${token.symbol}`} />
                <Row
                  label={t("total")}
                  value={total === null ? "—" : `${full(total)} ${token.symbol}`}
                  emphasis
                />
              </div>
              {consentText ? (
                <p className="rounded-xl border border-border/40 p-3 text-xs leading-relaxed text-muted-foreground">
                  {consentText}
                </p>
              ) : null}
              {error ? (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              ) : null}
            </motion.div>
          ) : (
            <motion.div
              key="compose-step"
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 12 }}
              transition={{ type: "spring", stiffness: 380, damping: 30 }}
            >
              <FieldGroup className="gap-4 px-4">
          <Field className="gap-2">
            <div className="flex min-h-6 items-center justify-between gap-2">
              <FieldLabel htmlFor="send-username" className="shrink-0">
                {tt("rowTo")}
              </FieldLabel>
              {username.trim() && mode !== "username" ? (
                <Badge variant="secondary" className="shrink-0 font-mono text-[10px] tracking-wider uppercase">
                  {mode === "principal" ? tt("tabPrincipal") : tt("tabAccount")}
                </Badge>
              ) : null}
            </div>
            <div className="relative">
              <Input
                id="send-username"
                size="xl"
                placeholder={t("recipientPlaceholder")}
                value={username}
                autoCapitalize="none"
                autoCorrect="off"
                autoComplete="off"
                spellCheck={false}
                onChange={(e) => handleRecipientChange(e.target.value)}
                className={cn(
                  "rounded-2xl pr-14",
                  mode !== "username" && "font-mono text-xs"
                )}
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setScanOpen(true)}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg text-xs text-muted-foreground"
              >
                {tt("scanQr")}
              </Button>
            </div>
            {mode === "username" && (
              <RecipientLookup
                username={handle}
                principal={resolved}
                isLoading={resolving || debouncedHandle !== handle}
              />
            )}
          </Field>

          <QrScanner
            open={scanOpen}
            onOpenChange={setScanOpen}
            onScan={(hit, raw) => applyAddress(hit, raw)}
          />

          <Field className="gap-2">
            <div className="flex min-h-6 items-center justify-between gap-2">
              <FieldLabel htmlFor="send-amount" className="shrink-0">{tc("amount")}</FieldLabel>
              <Badge variant="secondary" className="shrink-0 max-w-[65%] truncate font-normal tabular-nums">
                {tc("balance")}{" "}
                <span className="font-semibold text-foreground">
                  {hidden ? "••••••" : full(token.balance)}
                </span>
              </Badge>
            </div>
            <div className="relative">
              <Input
                id="send-amount"
                size="amount"
                inputMode="decimal"
                placeholder="0.0"
                value={value}
                onChange={(e) => {
                  setValue(e.target.value)
                  setError(null)
                }}
                className="rounded-2xl pr-16"
              />
              {sendable > 0n && (
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={() => setAmount(sendable)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg bg-muted font-semibold text-primary hover:bg-muted/70"
                >
                  {tc("max")}
                </Button>
              )}
            </div>
            {sendable > 0n && (
              <div className="flex gap-1.5">
                {PERCENTAGES.map((pct) => (
                  <Button
                    key={pct}
                    variant="outline"
                    size="xs"
                    onClick={() => setAmount((sendable * BigInt(pct)) / 100n)}
                    className={cn(
                      "h-7 flex-1 bg-background text-muted-foreground hover:bg-accent hover:text-foreground",
                      pct === 100 && "font-semibold text-primary"
                    )}
                  >
                    {pct}%
                  </Button>
                ))}
              </div>
            )}
            {value !== "" && amount === null && (
              <FieldError>
                {t("badAmount", { decimals: token.decimals })}
              </FieldError>
            )}
          </Field>

          <Field className="gap-2">
            <div className="flex min-h-6 items-center justify-between gap-2">
              <FieldLabel htmlFor="send-memo" className="shrink-0">{t("memoLabel")}</FieldLabel>
              <span
                className={cn(
                  "shrink-0 text-xs tabular-nums",
                  memoTooLong ? "font-medium text-destructive" : "text-muted-foreground"
                )}
              >
                {memoByteLength(memo.trim())}/{MEMO_MAX_BYTES}
              </span>
            </div>
            <Textarea
              id="send-memo"
              placeholder={t("memoPlaceholder")}
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              className="rounded-2xl"
            />
          </Field>

          <div className="space-y-1.5 rounded-2xl bg-muted/40 p-4">
            <Row label={tc("fee")} value={`${full(token.fee)} ${token.symbol}`} />
            <Row
              label={t("total")}
              value={total === null ? "—" : `${full(total)} ${token.symbol}`}
              emphasis
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
              </FieldGroup>
            </motion.div>
          )}
        </AnimatePresence>

        <DrawerFooter className={confirming ? "flex-row gap-2" : undefined}>
          {confirming ? (
            <>
              <Button type="button" variant="outline" className="flex-1" onClick={() => setConfirming(false)}>
                {tc("back")}
              </Button>
              <Button className="flex-1" disabled={!canSend} onClick={() => void handleSend()}>
                {loading && <Spinner data-icon="inline-start" />}
                <span>{loading ? t("sending") : t("confirmSend")}</span>
              </Button>
            </>
          ) : (
          <Button
            disabled={!canSend}
            onClick={() => {
              if (!canSend) return
              setConfirming(true)
            }}
          >
            <span>{insufficient ? t("insufficient") : t("send")}</span>
          </Button>
          )}
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

function Row({
  label,
  value,
  emphasis,
}: {
  label: string
  value: string
  emphasis?: boolean
}) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className="shrink-0 text-xs text-muted-foreground">{label}</span>
      <span
        className={`break-all text-right ${emphasis ? "font-semibold tabular-nums" : "tabular-nums"}`}
      >
        {value}
      </span>
    </div>
  )
}
