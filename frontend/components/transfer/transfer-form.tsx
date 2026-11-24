"use client"

import { useEffect, useState } from "react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import {
  formatAmount,
  memoByteLength,
  MEMO_MAX_BYTES,
  parseIcp,
  isHexAccountId,
  ICP_FEE,
  E8S,
} from "@/lib/wallet/utils"
import { Icon } from "@/components/ui/icon"
import { BookmarkGlassIcon, QrCodeGlassIcon } from "@thesvg/ui-react"
import { AmountInput } from "@/components/shared/amount-input"
import { RecipientCard, RecipientLookup } from "@/components/transfer/recipient-card"
import { BookmarkDrawer, BookmarkButton } from "@/components/bookmark/bookmark-drawer"
import { useBalanceVisibility } from "@/components/wallet/balance-visibility-provider"
import { useResolvedUsername, useRecipientProfile } from "@/hooks/wallet/useWalletData"
import { useDebounced } from "@/hooks/ui/useDebounced"
import { useIcpPrice } from "@/hooks/market/useIcpPrice"
import { useFiatValue } from "@/hooks/fiat/useFiatValue"
import { Principal } from "@icp-sdk/core/principal"
import { QrScanner, takeScannedAddress } from "@/components/scan/scan"
import { primeSuccessChime } from "@/lib/ui/successChime"
import { addressText, detectTypedAddress, type ScannedAddress } from "@/lib/wallet/icpAddress"
import { parseIcrcPaymentUri } from "@/lib/wallet/paymentUri"
import { parsePaymentLink, amountFieldValue } from "@/services/pay/pay"
import type { TransferMode } from "@/services/transfer/transfer"
import { USERNAME_MIN_LENGTH } from "@/lib/profile/username"
import { cn } from "@/lib/ui/utils"

const modeFor: Record<ScannedAddress["kind"], TransferMode> = {
  account: "account",
  icrc1: "principal",
  principal: "principal",
  username: "username",
}

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
}

function classifyMode(value: string): TransferMode {
  const trimmed = value.trim().replace(/^@/, "")
  if (!trimmed) return "username"
  if (isHexAccountId(trimmed)) return "account"
  if (trimmed.includes("-") || trimmed.length > 20) {
    try {
      Principal.fromText(trimmed)
      return "principal"
    } catch {
      return "username"
    }
  }
  return "username"
}

function isValidFor(mode: TransferMode, v: string): boolean {
  const t = v.trim().replace(/^@/, "")
  if (!t) return false
  if (mode === "account") return isHexAccountId(t)
  if (mode === "principal") {
    try {
      Principal.fromText(t)
      return true
    } catch {
      return false
    }
  }
  return t.length >= USERNAME_MIN_LENGTH
}

export function TransferForm({
  onTransfer,
  balance,
  initialTo,
}: {
  onTransfer: (
    mode: TransferMode,
    to: string,
    amount: bigint,
    memo?: string,
    subaccount?: Uint8Array
  ) => Promise<string | null>
  balance?: bigint
  initialTo?: string
}) {
  const t = useTranslations("transfer")
  const tc = useTranslations("common")
  const { hidden } = useBalanceVisibility()
  const [mode, setMode] = useState<TransferMode>(() =>
    initialTo ? classifyMode(initialTo) : "username"
  )
  const [to, setTo] = useState(() => initialTo ?? "")
  const [amount, setAmount] = useState("")
  const [memo, setMemo] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [scanOpen, setScanOpen] = useState(false)
  const [bookmarkOpen, setBookmarkOpen] = useState(false)
  const [subaccount, setSubaccount] = useState<Uint8Array | null>(null)

  const applyScan = (hit: ScannedAddress, raw: string) => {
    setMode(modeFor[hit.kind])
    setTo(addressText(hit))
    setSubaccount(hit.kind === "icrc1" ? hit.subaccount : null)
    setError(null)

    const req = parsePaymentLink(raw)
    if (req) {
      if (req.amount !== undefined) setAmount(amountFieldValue(req.amount))
      if (req.memo !== undefined) setMemo(req.memo)
      return
    }

    const icrcPay = parseIcrcPaymentUri(raw)
    if (icrcPay?.amount) setAmount(icrcPay.amount)
  }

  const handleRecipientChange = (raw: string) => {
    const trimmed = raw.trim()
    const hit = detectTypedAddress(trimmed)
    if (hit) {
      applyScan(hit, trimmed)
      return
    }
    setTo(raw)
    setSubaccount(null)
    setError(null)
    setMode(classifyMode(raw))
  }

  useEffect(() => {
    const scanned = takeScannedAddress()
    if (scanned) {
      queueMicrotask(() => {
        applyScan(scanned.hit, scanned.raw)
      })
    }
  }, [])

  const cleanTo = to.trim().replace(/^@/, "")
  const parsed = parseIcp(amount)
  const total = parsed === null ? null : parsed + ICP_FEE
  const { price } = useIcpPrice()
  const sendUsd =
    parsed !== null && price ? (Number(parsed) / Number(E8S)) * price.usd : null
  const sendFiat = useFiatValue(sendUsd)
  const debouncedTo = useDebounced(mode === "username" ? cleanTo : "")
  const { principal: resolved, isLoading: resolving } = useResolvedUsername(debouncedTo)
  const recipientProfile = useRecipientProfile(cleanTo, resolved ?? null)
  const unknownRecipient =
    mode === "username" &&
    cleanTo.length >= USERNAME_MIN_LENGTH &&
    debouncedTo === cleanTo &&
    !resolving &&
    resolved === null

  const sendable = balance === undefined ? undefined : balance > ICP_FEE ? balance - ICP_FEE : 0n
  const insufficient =
    total !== null && balance !== undefined && total > balance
  const memoTooLong = memoByteLength(memo.trim()) > MEMO_MAX_BYTES
  const canReview =
    parsed !== null &&
    isValidFor(mode, cleanTo) &&
    !insufficient &&
    !unknownRecipient &&
    !memoTooLong

  const handleConfirm = async () => {
    if (parsed === null) return
    primeSuccessChime()
    setLoading(true)
    setError(null)
    const target = mode === "username" ? cleanTo : to.trim()
    const err = await onTransfer(mode, target, parsed, memo.trim() || undefined, subaccount ?? undefined)
    setLoading(false)
    if (err) {
      setError(err)
      setConfirmOpen(false)
      return
    }
    setConfirmOpen(false)
    setTo("")
    setSubaccount(null)
    setAmount("")
    setMemo("")
  }

  const placeholderText = `${t("placeholderUsername")}, ${t("tabPrincipal").toLowerCase()}, ${t("tabAccount").toLowerCase()}`

  return (
    <FieldGroup className="gap-5">
      <Field className="gap-2">
        <div className="flex min-h-6 items-center justify-between gap-2">
          <FieldLabel htmlFor="to" className="shrink-0">{t("rowTo")}</FieldLabel>
          {to.trim() && mode !== "username" ? (
            <Badge variant="secondary" className="shrink-0 font-mono text-[10px] tracking-wider uppercase">
              {mode === "principal" ? t("tabPrincipal") : t("tabAccount")}
            </Badge>
          ) : null}
        </div>
        <div className="relative">
          <Input
            id="to"
            size="lg"
            placeholder={placeholderText}
            autoComplete="off"
            spellCheck={false}
            value={to}
            onChange={(e) => handleRecipientChange(e.target.value)}
            className={cn(
              "pr-20 text-sm",
              mode !== "username" && "font-mono text-xs"
            )}
          />
          <div className="absolute top-1/2 right-2 flex -translate-y-1/2 items-center gap-0.5">
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() => setBookmarkOpen(true)}
              aria-label={t("bookmarks")}
              className="size-8 rounded-lg text-muted-foreground hover:text-foreground"
            >
              <Icon icon={BookmarkGlassIcon} className="size-4" strokeWidth={1.75} />
            </Button>
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() => setScanOpen(true)}
              aria-label={t("scanQr")}
              className="size-8 rounded-lg text-muted-foreground hover:text-foreground"
            >
              <Icon icon={QrCodeGlassIcon} className="size-4" strokeWidth={1.75} />
            </Button>
          </div>
        </div>
        {mode === "username" ? (
          <RecipientLookup
            username={cleanTo}
            principal={resolved}
            isLoading={resolving || debouncedTo !== cleanTo}
          />
        ) : null}
      </Field>

      <AmountInput
        id="amount"
        label={tc("amount")}
        value={amount}
        onChange={(v) => {
          setAmount(v)
          setError(null)
        }}
        balance={balance}
        maxE8s={sendable}
        size="default"
        description={
          sendable !== undefined
            ? t("maxSendable", { amount: hidden ? "••••••" : formatAmount(sendable), fee: formatAmount(ICP_FEE) })
            : undefined
        }
      />

      <QrScanner open={scanOpen} onOpenChange={setScanOpen} onScan={applyScan} />
      <BookmarkDrawer
        open={bookmarkOpen}
        onOpenChange={setBookmarkOpen}
        onSelect={(username) => {
          setMode("username")
          setTo(username)
          setSubaccount(null)
          setError(null)
        }}
      />

      <Field className="gap-2">
        <div className="flex min-h-6 items-center justify-between gap-2">
          <FieldLabel htmlFor="memo" className="shrink-0">{t("memoLabel")}</FieldLabel>
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
          id="memo"
          placeholder={t("memoPlaceholder")}
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
        />
        {memoTooLong ? (
          <FieldError>
            {t("memoTooLong", { max: MEMO_MAX_BYTES })}
          </FieldError>
        ) : null}
      </Field>

      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <Button
        className="w-full"
        disabled={!canReview}
        onClick={() => setConfirmOpen(true)}
      >
        <span>{insufficient ? t("insufficientShort") : t("review")}</span>
      </Button>

      <Drawer open={confirmOpen} onOpenChange={setConfirmOpen} showSwipeHandle>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>{t("confirmTitle")}</DrawerTitle>
            <DrawerDescription>{t("confirmBody")}</DrawerDescription>
          </DrawerHeader>

          <div className="space-y-4 px-4">
            <div className="rounded-2xl bg-muted/40 p-4 text-center">
              <p className="text-3xl font-bold tabular-nums">
                {parsed === null ? "—" : formatAmount(parsed)}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">ICP</p>
              {sendFiat.formatted !== null ? (
                <p className="mt-1 text-xs tabular-nums text-muted-foreground">
                  ≈ {sendFiat.symbol}
                  {sendFiat.formatted} {sendFiat.currency}
                </p>
              ) : null}
            </div>

            {mode === "username" && resolved && recipientProfile ? (
              <div className="flex items-center gap-2">
                <RecipientCard
                  username={cleanTo}
                  principal={resolved}
                  className="min-w-0 flex-1"
                />
                <BookmarkButton
                  targetUserId={recipientProfile.id}
                  username={cleanTo}
                />
              </div>
            ) : null}
            {mode === "username" && resolved && !recipientProfile ? (
              <RecipientCard username={cleanTo} principal={resolved} />
            ) : null}

            <div className="space-y-2 rounded-2xl border border-border p-4">
              {!(mode === "username" && resolved) ? (
                <Row label={t("rowTo")} value={to.trim()} mono />
              ) : null}
              {subaccount ? <Row label={t("rowSubaccount")} value={toHex(subaccount)} mono /> : null}
              <Row label={t("rowNetworkFee")} value={`${formatAmount(ICP_FEE)} ICP`} />
              <Row
                label={t("rowTotalDeducted")}
                value={total === null ? "—" : `${formatAmount(total)} ICP`}
                emphasis
              />
              {memo.trim() ? <Row label={t("rowMemo")} value={memo.trim()} /> : null}
            </div>
          </div>

          <DrawerFooter className="mt-3">
            <Button onClick={handleConfirm} disabled={loading}>
              {loading ? <Spinner data-icon="inline-start" /> : null}
              <span>{loading ? t("sending") : t("confirmSend")}</span>
            </Button>
            <DrawerClose
              render={
                <Button variant="outline" disabled={loading}>
                  {tc("cancel")}
                </Button>
              }
            />
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </FieldGroup>
  )
}

function Row({
  label,
  value,
  mono,
  emphasis,
}: {
  label: string
  value: string
  mono?: boolean
  emphasis?: boolean
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="shrink-0 text-xs text-muted-foreground">{label}</span>
      <span
        className={cn(
          "min-w-0 break-all text-right text-sm",
          mono && "font-mono text-xs",
          emphasis && "font-semibold tabular-nums"
        )}
      >
        {value}
      </span>
    </div>
  )
}
