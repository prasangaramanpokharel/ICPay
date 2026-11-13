"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Badge } from "@/components/ui/badge"
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
  memoByteLength,
  MEMO_MAX_BYTES,
  parseIcp,
  formatAmount,
  E8S,
  ICP_FEE,
} from "@/lib/wallet/utils"
import { AmountInput } from "@/components/shared/amount-input"
import { primeSuccessChime } from "@/lib/ui/successChime"
import { cn } from "@/lib/ui/utils"

const PRESETS = [1n, 5n, 10n] as const

function tipPrefix(sender: string): string {
  return `Tip by @${sender}`
}

export function TipDrawer({
  open,
  onOpenChange,
  username,
  senderUsername,
  balance,
  onTip,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  username: string
  senderUsername?: string
  balance?: bigint
  onTip: (amount: bigint, message?: string) => Promise<string | null>
}) {
  const t = useTranslations("tip")
  const tc = useTranslations("common")
  const [selected, setSelected] = useState<bigint | null>(E8S)
  const [custom, setCustom] = useState("")
  const [message, setMessage] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const amount = selected ?? parseIcp(custom)
  const total = amount === null ? null : amount + ICP_FEE
  const sendable = balance === undefined ? undefined : balance > ICP_FEE ? balance - ICP_FEE : 0n
  const insufficient = total !== null && balance !== undefined && total > balance
  const prefix = senderUsername ? tipPrefix(senderUsername) : ""
  const prefixBytes = prefix ? memoByteLength(`${prefix}: `) : 0
  const messageBudget = MEMO_MAX_BYTES - prefixBytes
  const memoTooLong = memoByteLength(message.trim()) > messageBudget
  const canSend =
    amount !== null && amount > 0n && !insufficient && !memoTooLong && !loading

  const handleSend = async () => {
    if (amount === null) return
    primeSuccessChime()
    setLoading(true)
    setError(null)
    const note = message.trim()
    const memo = prefix ? (note ? `${prefix}: ${note}` : prefix) : note || undefined
    const err = await onTip(amount, memo)
    setLoading(false)
    if (err) {
      setError(err)
      return
    }
    setMessage("")
    setCustom("")
    setSelected(E8S)
    onOpenChange(false)
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange} showSwipeHandle>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle className="text-center">@{username}</DrawerTitle>
          <DrawerDescription className="text-center">
            {t("subtitle")}
          </DrawerDescription>
        </DrawerHeader>

        <FieldGroup className="gap-4 px-4">
          <Field className="gap-2">
            <div className="flex min-h-6 items-center justify-between gap-2">
              <FieldLabel className="shrink-0">{tc("amount")}</FieldLabel>
              {balance !== undefined && (
                <Badge variant="secondary" className="shrink-0 max-w-[65%] truncate font-normal tabular-nums">
                  {tc("balance")}{" "}
                  <span className="font-semibold text-foreground">
                    {formatAmount(balance)} ICP
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
                      active && "bg-primary/10 text-primary ring-1 ring-primary hover:bg-primary/15"
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
              id="tip-amount"
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
            <div className="flex min-h-6 items-center justify-between gap-2">
              <FieldLabel htmlFor="tip-message">{t("messageLabel")}</FieldLabel>
              <span
                className={cn(
                  "text-xs tabular-nums",
                  memoTooLong ? "font-medium text-destructive" : "text-muted-foreground"
                )}
              >
                {memoByteLength(message.trim())}/{messageBudget}
              </span>
            </div>
            <Textarea
              id="tip-message"
              placeholder={t("messagePlaceholder")}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="rounded-2xl"
            />
            {memoTooLong && (
              <p className="text-xs text-destructive">
                {t("memoTooLong", { max: messageBudget })}
              </p>
            )}
          </Field>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </FieldGroup>

        <DrawerFooter>
          <Button disabled={!canSend} onClick={handleSend}>
            {loading && <Spinner data-icon="inline-start" />}
            <span>{loading ? t("sending") : insufficient ? t("insufficient") : t("send")}</span>
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
