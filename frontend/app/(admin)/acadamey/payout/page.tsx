"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldDescription,
  FieldError,
} from "@/components/ui/field"
import { Spinner } from "@/components/ui/spinner"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Coins01Icon,
  ArrowRight01Icon,
  Copy01Icon,
  Tick01Icon,
  AlertCircleIcon,
  SecurityCheckIcon,
  RefreshIcon,
  CheckmarkCircle02Icon,
  Download01Icon,
} from "@hugeicons/core-free-icons"
import {
  fetchTreasuryAddress,
  fetchTreasuryBalance,
  adminWithdrawTreasury,
  getStoredPayoutRecords,
  type TreasuryPayoutRecord,
} from "@/services/academy/client"
import { getAdminSession } from "@/services/academy/admin-auth"
import { useAuth } from "@/components/auth/auth-provider"

export default function AcademyAdminPayoutPage() {
  const { identity } = useAuth()
  const [treasuryAddress, setTreasuryAddress] = useState<string>("")
  const [balanceE8s, setBalanceE8s] = useState<bigint>(BigInt(0))
  const [payouts, setPayouts] = useState<TreasuryPayoutRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [copiedAddress, setCopiedAddress] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const [toAccount, setToAccount] = useState("")
  const [amountIcp, setAmountIcp] = useState("")
  const [formError, setFormError] = useState<string | null>(null)
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    try {
      const [addr, bal] = await Promise.all([
        fetchTreasuryAddress(),
        fetchTreasuryBalance(),
      ])
      setTreasuryAddress(addr)
      setBalanceE8s(bal)
      setPayouts(getStoredPayoutRecords())
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await loadData()
  }

  const handleCopy = (text: string, isTreasury = false) => {
    navigator.clipboard.writeText(text)
    if (isTreasury) {
      setCopiedAddress(true)
      setTimeout(() => setCopiedAddress(false), 2000)
    } else {
      setCopiedId(text)
      setTimeout(() => setCopiedId(null), 2000)
    }
  }

  const handleSetMax = () => {
    const totalIcp = Number(balanceE8s) / 100_000_000
    const maxAvailable = Math.max(0, totalIcp - 0.0001)
    setAmountIcp(maxAvailable > 0 ? maxAvailable.toFixed(4) : "0")
  }

  const handleValidateForm = (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)
    setSuccessMessage(null)

    const trimmedAddress = toAccount.trim()
    if (!trimmedAddress) {
      setFormError("Recipient address or principal is required.")
      return
    }

    const parsedAmount = parseFloat(amountIcp)
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setFormError("Please enter a valid positive withdrawal amount.")
      return
    }

    const amountE8sValue = BigInt(Math.floor(parsedAmount * 100_000_000))
    if (amountE8sValue <= BigInt(10_000)) {
      setFormError("Amount must be greater than the 0.0001 ICP network ledger fee.")
      return
    }

    if (amountE8sValue > balanceE8s) {
      setFormError("Withdrawal amount exceeds the current available treasury balance.")
      return
    }

    setConfirmDialogOpen(true)
  }

  const handleExecutePayout = async () => {
    setIsSubmitting(true)
    setFormError(null)

    try {
      const session = getAdminSession()
      const adminEmail = session?.email || "admin@icpay.app"
      const parsedAmount = parseFloat(amountIcp)
      const amountE8sValue = BigInt(Math.floor(parsedAmount * 100_000_000))

      const blockIndex = await adminWithdrawTreasury(
        toAccount.trim(),
        amountE8sValue,
        adminEmail,
        identity
      )

      setConfirmDialogOpen(false)
      setToAccount("")
      setAmountIcp("")
      setSuccessMessage(
        `Withdrawal of ${parsedAmount.toFixed(4)} ICP successfully finalized on-chain at Block Index #${blockIndex.toString()}.`
      )
      await loadData()
    } catch (err: unknown) {
      setFormError(
        err instanceof Error ? err.message : "Failed to execute payout. Please verify parameters and retry."
      )
      setConfirmDialogOpen(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  const balanceNumber = Number(balanceE8s) / 100_000_000
  const approximateUsd = (balanceNumber * 6.2).toFixed(2)
  const totalWithdrawnE8s = payouts
    .filter((p) => p.status === "completed")
    .reduce((acc, p) => acc + BigInt(p.amountE8s), BigInt(0))
  const totalWithdrawnNumber = (Number(totalWithdrawnE8s) / 100_000_000).toFixed(4)

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] w-full items-center justify-center p-6">
        <Spinner className="size-8 text-primary" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8 p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/acadamey/dashboard">ICAcademy Admin</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Treasury & Payouts</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Treasury & On-Chain Payouts
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage student course revenue, monitor on-chain vault reserves, and execute instant ICRC-1 ledger withdrawals.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="gap-2 border-border bg-card text-foreground hover:bg-accent"
          >
            <HugeiconsIcon
              icon={RefreshIcon}
              className={`size-4 ${isRefreshing ? "animate-spin" : ""}`}
            />
            Refresh Balance
          </Button>
          <Link href="/acadamey/audit">
            <Button variant="secondary" size="sm" className="gap-2">
              <HugeiconsIcon icon={CheckmarkCircle02Icon} className="size-4" />
              View Audit Logs
            </Button>
          </Link>
        </div>
      </div>

      {successMessage && (
        <Alert className="border-emerald-500/30 bg-emerald-500/10 text-foreground">
          <HugeiconsIcon icon={CheckmarkCircle02Icon} className="size-4 text-emerald-500" />
          <AlertTitle className="text-sm font-semibold text-foreground">Payout Finalized</AlertTitle>
          <AlertDescription className="text-xs text-muted-foreground">
            {successMessage}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-border bg-card shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Live Treasury Reserve
            </CardTitle>
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <HugeiconsIcon icon={Coins01Icon} className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold tracking-tight text-card-foreground">
              {balanceNumber.toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 4 })} ICP
            </div>
            <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
              <span>≈ ${approximateUsd} USD</span>
              <Badge variant="outline" className="border-primary/20 bg-primary/5 text-[10px] text-primary">
                Canister Ledger Vault
              </Badge>
            </div>
            <p className="mt-3 text-[11px] font-mono text-muted-foreground">
              {balanceE8s.toString()} e8s raw balance
            </p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Treasury Ledger Address
            </CardTitle>
            <div className="flex size-8 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
              <HugeiconsIcon icon={SecurityCheckIcon} className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 rounded-lg border border-border bg-background p-2.5 font-mono text-xs text-foreground">
              <span className="truncate">{treasuryAddress}</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleCopy(treasuryAddress, true)}
                className="size-7 shrink-0 text-muted-foreground hover:text-foreground"
              >
                <HugeiconsIcon
                  icon={copiedAddress ? Tick01Icon : Copy01Icon}
                  className="size-3.5"
                />
              </Button>
            </div>
            <div className="mt-2 flex items-center justify-between text-xs">
              <span className="text-[11px] text-muted-foreground">ICRC-1 Default Subaccount</span>
              <Badge variant="secondary" className="text-[10px]">
                {copiedAddress ? "Copied to Clipboard" : "Direct Inflow"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Total Payouts Settled
            </CardTitle>
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <HugeiconsIcon icon={Download01Icon} className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold tracking-tight text-card-foreground">
              {totalWithdrawnNumber} ICP
            </div>
            <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
              <span>{payouts.filter((p) => p.status === "completed").length} payouts completed</span>
              <Badge variant="outline" className="border-border bg-muted/50 text-[10px]">
                Zero Protocol Fee
              </Badge>
            </div>
            <p className="mt-3 text-[11px] text-muted-foreground">
              Standard 0.0001 ICP network burn per transfer
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <Card className="border-border bg-card shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-card-foreground">
                Withdraw From Treasury
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Transfer accrued course revenue from the canister treasury to any external ICP address or wallet.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleValidateForm}>
                <FieldGroup>
                  {formError && (
                    <FieldError className="rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-xs font-medium text-destructive">
                      {formError}
                    </FieldError>
                  )}

                  <Field>
                    <FieldLabel htmlFor="payout-to">Recipient Account Identifier / Principal</FieldLabel>
                    <Input
                      id="payout-to"
                      placeholder="e.g. e1a90c4bf491... or rwlgt-iiaaa-..."
                      value={toAccount}
                      onChange={(e) => setToAccount(e.target.value)}
                      required
                      className="bg-input border-input font-mono text-xs text-foreground"
                    />
                    <FieldDescription className="text-[11px] text-muted-foreground">
                      Destination ICP Ledger 64-hex account or ICRC-1 principal.
                    </FieldDescription>
                  </Field>

                  <Field>
                    <div className="flex items-center justify-between">
                      <FieldLabel htmlFor="payout-amount">Withdrawal Amount (ICP)</FieldLabel>
                      <button
                        type="button"
                        onClick={handleSetMax}
                        className="text-xs font-semibold text-primary hover:underline"
                      >
                        Set Max
                      </button>
                    </div>
                    <div className="relative">
                      <Input
                        id="payout-amount"
                        type="number"
                        step="0.0001"
                        min="0.0001"
                        placeholder="0.0000"
                        value={amountIcp}
                        onChange={(e) => setAmountIcp(e.target.value)}
                        required
                        className="bg-input border-input font-mono text-sm text-foreground pr-14"
                      />
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 font-semibold text-xs text-muted-foreground">
                        ICP
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                      <span>Network Ledger Fee: 0.0001 ICP</span>
                      <span>Available: {balanceNumber.toFixed(4)} ICP</span>
                    </div>
                  </Field>

                  <Alert className="border-border bg-muted/40 p-3">
                    <HugeiconsIcon icon={AlertCircleIcon} className="size-4 text-muted-foreground" />
                    <AlertDescription className="text-[11px] leading-relaxed text-muted-foreground">
                      Payout transactions are signed by the academy canister directly to the ICP Ledger. This action is irreversible once confirmed.
                    </AlertDescription>
                  </Alert>

                  <Field>
                    <Button
                      type="submit"
                      disabled={balanceE8s <= BigInt(10_000) || !amountIcp || !toAccount}
                      className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      Continue to Confirmation
                      <HugeiconsIcon icon={ArrowRight01Icon} className="size-4" />
                    </Button>
                  </Field>
                </FieldGroup>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-3">
          <Card className="border-border bg-card shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg font-bold text-card-foreground">
                  Payout Transaction History
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Recent on-chain disbursements and treasury withdrawal records.
                </CardDescription>
              </div>
              <Badge variant="outline" className="border-border text-xs">
                {payouts.length} Recorded
              </Badge>
            </CardHeader>
            <CardContent>
              {payouts.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-12 text-center">
                  <div className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
                    <HugeiconsIcon icon={Coins01Icon} className="size-6" />
                  </div>
                  <h3 className="mt-3 text-sm font-semibold text-foreground">
                    No Payouts Executed Yet
                  </h3>
                  <p className="mt-1 max-w-sm text-xs text-muted-foreground">
                    Treasury funds are preserved inside the canister ledger account until an authorized admin initiates a payout.
                  </p>
                </div>
              ) : (
                <div className="rounded-lg border border-border overflow-hidden">
                  <Table>
                    <TableHeader className="bg-muted/50">
                      <TableRow className="border-border">
                        <TableHead className="text-xs font-semibold text-foreground">Date</TableHead>
                        <TableHead className="text-xs font-semibold text-foreground">Recipient</TableHead>
                        <TableHead className="text-xs font-semibold text-foreground">Amount</TableHead>
                        <TableHead className="text-xs font-semibold text-foreground">Block Index</TableHead>
                        <TableHead className="text-xs font-semibold text-foreground">Admin</TableHead>
                        <TableHead className="text-xs font-semibold text-foreground">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {payouts.map((record) => {
                        const icp = (Number(record.amountE8s) / 100_000_000).toFixed(4)
                        const isCopied = copiedId === record.toAccount
                        return (
                          <TableRow key={record.id} className="border-border hover:bg-muted/40">
                            <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                              {new Date(record.timestamp).toLocaleDateString(undefined, {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </TableCell>
                            <TableCell className="font-mono text-xs text-foreground">
                              <div className="flex items-center gap-1.5">
                                <span>
                                  {record.toAccount.length > 16
                                    ? `${record.toAccount.slice(0, 6)}...${record.toAccount.slice(-4)}`
                                    : record.toAccount}
                                </span>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleCopy(record.toAccount)}
                                  className="size-5 text-muted-foreground hover:text-foreground"
                                >
                                  <HugeiconsIcon
                                    icon={isCopied ? Tick01Icon : Copy01Icon}
                                    className="size-3"
                                  />
                                </Button>
                              </div>
                            </TableCell>
                            <TableCell className="font-mono text-xs font-bold text-foreground whitespace-nowrap">
                              {icp} ICP
                            </TableCell>
                            <TableCell className="font-mono text-xs text-muted-foreground">
                              {record.blockIndex ? (
                                <Badge variant="secondary" className="font-mono text-[10px]">
                                  #{record.blockIndex}
                                </Badge>
                              ) : (
                                "—"
                              )}
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground truncate max-w-[120px]">
                              {record.admin.split("@")[0]}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={record.status === "completed" ? "outline" : "destructive"}
                                className={
                                  record.status === "completed"
                                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 text-[10px]"
                                    : "text-[10px]"
                                }
                              >
                                {record.status === "completed" ? "Settled" : "Failed"}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent className="max-w-md border-border bg-card">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-card-foreground">
              Confirm Treasury Payout
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Please review the transaction details carefully before broadcasting to the Internet Computer ICP Ledger.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 rounded-lg border border-border bg-background p-4 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Destination Account:</span>
              <span className="font-mono font-medium text-foreground truncate max-w-[200px]">
                {toAccount}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Gross Withdrawal:</span>
              <span className="font-mono font-bold text-foreground">
                {parseFloat(amountIcp || "0").toFixed(4)} ICP
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Network Ledger Fee:</span>
              <span className="font-mono text-muted-foreground">0.0001 ICP</span>
            </div>
            <div className="border-t border-border pt-2 flex items-center justify-between font-semibold">
              <span className="text-foreground">Net Deducted from Vault:</span>
              <span className="font-mono text-primary">
                {parseFloat(amountIcp || "0").toFixed(4)} ICP
              </span>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setConfirmDialogOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleExecutePayout}
              disabled={isSubmitting}
              className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {isSubmitting ? (
                <>
                  <Spinner className="size-4" />
                  Broadcasting Transfer...
                </>
              ) : (
                <>
                  Authorize & Send
                  <HugeiconsIcon icon={ArrowRight01Icon} className="size-4" />
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
