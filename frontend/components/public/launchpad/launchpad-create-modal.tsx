"use client"

import * as React from "react"
import Link from "next/link"
import useSWR from "swr"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldDescription,
} from "@/components/ui/field"
import { toast } from "sonner"
import { useAuth } from "@/components/auth/auth-provider"
import { getMyTokens } from "@/services/launch/launch"
import type { TokenPublic } from "@/services/types"
import { Sparkles, CheckCircle2, ShieldCheck } from "lucide-react"

interface LaunchpadCreateModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function LaunchpadCreateModal({
  open,
  onOpenChange,
  onSuccess,
}: LaunchpadCreateModalProps) {
  const { identity, isAuthenticated, login } = useAuth()

  // Fetch tokens created by this user on ICPay
  const { data: userTokens = [] } = useSWR(
    identity ? ["my-created-tokens", identity.getPrincipal().toText()] : null,
    async () => {
      try {
        return await getMyTokens(identity, 50, 0)
      } catch {
        return []
      }
    }
  )

  const activeTokens = React.useMemo(() => {
    return userTokens.filter(
      (t): t is TokenPublic => "active" in t.status && Boolean(t.ledgerId?.[0])
    )
  }, [userTokens])

  const [selectedTokenId, setSelectedTokenId] = React.useState<string>("")
  const [customMode, setCustomMode] = React.useState<boolean>(false)

  const [tokenLedger, setTokenLedger] = React.useState("")
  const [tokenSymbol, setTokenSymbol] = React.useState("")
  const [tokenName, setTokenName] = React.useState("")
  const [totalTokens, setTotalTokens] = React.useState("1000000")
  const [softCap, setSoftCap] = React.useState("50")
  const [hardCap, setHardCap] = React.useState("200")
  const [minUserIcp, setMinUserIcp] = React.useState("1")
  const [maxUserIcp, setMaxUserIcp] = React.useState("25")
  const [durationDays, setDurationDays] = React.useState("7")
  const [dexLiquidity, setDexLiquidity] = React.useState("30")
  const [description, setDescription] = React.useState("")
  const [website, setWebsite] = React.useState("")
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  // When a user selects a token from their created tokens list, auto-fill all details
  const handleTokenSelect = (tokenId: string) => {
    setSelectedTokenId(tokenId)
    const token = activeTokens.find((t) => t.id === tokenId)
    if (token) {
      const ledger = token.ledgerId?.[0] ?? ""
      setTokenLedger(ledger)
      setTokenSymbol(token.symbol)
      setTokenName(token.name)
      setDescription(token.description || "")
      setWebsite(token.website?.[0] || "")
      if (token.totalSupply > BigInt(0)) {
        const readableSupply = Number(token.totalSupply / BigInt(10 ** token.decimals))
        // Default sale allocation to 50% of supply if feasible
        setTotalTokens(Math.floor(readableSupply * 0.5).toString())
      }
    }
  }

  const selectedToken = activeTokens.find((t) => t.id === selectedTokenId)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!tokenLedger.trim() || !tokenSymbol.trim() || !tokenName.trim()) {
      toast.error("Please fill in or select a token")
      return
    }

    const sCap = parseFloat(softCap)
    const hCap = parseFloat(hardCap)
    if (isNaN(sCap) || isNaN(hCap) || hCap < sCap) {
      toast.error("Hard Cap must be greater than or equal to Soft Cap")
      return
    }

    setIsSubmitting(true)
    try {
      // Simulate creation
      await new Promise((r) => setTimeout(r, 1500))
      toast.success(`Launchpad for $${tokenSymbol.toUpperCase()} created successfully!`)
      onOpenChange(false)
      onSuccess?.()
    } catch {
      toast.error("Failed to create launchpad campaign.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto overflow-x-hidden rounded-2xl border-border/70 p-6">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-foreground">
            Start Token Launchpad
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Launch a verified public presale for your token with 100% smart contract escrow protection.
          </DialogDescription>
        </DialogHeader>

        {!isAuthenticated ? (
          <div className="flex flex-col items-center justify-center p-8 text-center space-y-4 rounded-2xl border border-border/60 bg-muted/20 mt-3">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-card border border-border text-foreground">
              <ShieldCheck className="size-6 text-foreground" />
            </div>
            <div className="space-y-1.5 max-w-sm">
              <h3 className="text-base font-bold text-foreground">Sign In to Launch</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Connect your Internet Identity wallet to view your created tokens and deploy a verified presale.
              </p>
            </div>
            <Button onClick={() => void login()} className="font-medium mt-2">
              Sign In with Internet Identity
            </Button>
          </div>
        ) : activeTokens.length === 0 && !customMode ? (
          <div className="flex flex-col items-center justify-center p-8 text-center space-y-4 rounded-2xl border border-border/60 bg-muted/20 mt-3">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 text-primary">
              <Sparkles className="size-6 text-primary" />
            </div>
            <div className="space-y-1.5 max-w-md">
              <h3 className="text-base font-bold text-foreground">Create Your Token First</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                To prevent scams and guarantee genuine token delivery, launchpad presales are linked directly to tokens minted on ICPay. You do not have any active tokens yet.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 pt-2 w-full max-w-xs">
              <Link
                href="/token/create"
                className="w-full"
                onClick={() => onOpenChange(false)}
              >
                <Button className="w-full font-medium">
                  Create ICRC-1 Token
                </Button>
              </Link>
            </div>
            <button
              type="button"
              onClick={() => setCustomMode(true)}
              className="text-[11px] text-muted-foreground hover:text-foreground underline pt-2"
            >
              Developer Mode: Or enter custom Ledger ID
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5 pt-2">
            <FieldGroup className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Token Selection Mode */}
              {!customMode ? (
                <Field className="sm:col-span-2">
                  <div className="flex items-center justify-between pb-1">
                    <FieldLabel htmlFor="token-select">Select Your Created Token *</FieldLabel>
                    <Link
                      href="/token/create"
                      onClick={() => onOpenChange(false)}
                      className="text-[11px] text-primary hover:underline font-medium"
                    >
                      + Create New Token
                    </Link>
                  </div>

                  <select
                    id="token-select"
                    value={selectedTokenId}
                    onChange={(e) => handleTokenSelect(e.target.value)}
                    required
                    className="h-10 w-full rounded-xl border border-input bg-background px-3 py-1 text-xs text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    <option value="">-- Select from your ICPay created tokens --</option>
                    {activeTokens.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} (${t.symbol}) — {t.ledgerId?.[0] ? `${t.ledgerId[0].slice(0, 10)}...` : ""}
                      </option>
                    ))}
                  </select>

                  {selectedToken && (
                    <div className="mt-2.5 flex items-center gap-2 rounded-xl border border-border bg-card p-3 text-xs">
                      <CheckCircle2 className="size-4 text-primary shrink-0" />
                      <div className="flex-1 truncate">
                        <span className="font-semibold text-foreground">
                          {selectedToken.name} (${selectedToken.symbol})
                        </span>
                        <p className="font-mono text-[11px] text-muted-foreground truncate">
                          {selectedToken.ledgerId?.[0]}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="pt-1.5 flex justify-end">
                    <button
                      type="button"
                      onClick={() => setCustomMode(true)}
                      className="text-[11px] text-muted-foreground hover:text-foreground underline"
                    >
                      Or enter custom Ledger Principal
                    </button>
                  </div>
                </Field>
              ) : (
                <>
                  <Field className="sm:col-span-2">
                    <div className="flex items-center justify-between pb-1">
                      <FieldLabel htmlFor="token-ledger">Custom Token Ledger Principal *</FieldLabel>
                      {activeTokens.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setCustomMode(false)}
                          className="text-[11px] text-primary hover:underline font-medium"
                        >
                          ← Select from My Tokens
                        </button>
                      )}
                    </div>
                    <Input
                      id="token-ledger"
                      placeholder="e.g. ryjl3-tyaaa-aaaaa-aaaba-cai"
                      value={tokenLedger}
                      onChange={(e) => setTokenLedger(e.target.value)}
                      required
                      className="h-9 font-mono text-xs"
                    />
                    <FieldDescription>
                      The canister principal of your ICRC-1/ICRC-2 token
                    </FieldDescription>
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="token-symbol">Token Symbol *</FieldLabel>
                    <Input
                      id="token-symbol"
                      placeholder="e.g. DOGE"
                      value={tokenSymbol}
                      onChange={(e) => setTokenSymbol(e.target.value.toUpperCase())}
                      required
                      className="h-9 text-xs"
                    />
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="token-name">Token Name *</FieldLabel>
                    <Input
                      id="token-name"
                      placeholder="e.g. Doge ICP"
                      value={tokenName}
                      onChange={(e) => setTokenName(e.target.value)}
                      required
                      className="h-9 text-xs"
                    />
                  </Field>
                </>
              )}

              <Field className="sm:col-span-2">
                <FieldLabel htmlFor="total-tokens">Total Tokens for Sale *</FieldLabel>
                <Input
                  id="total-tokens"
                  type="number"
                  placeholder="1000000"
                  value={totalTokens}
                  onChange={(e) => setTotalTokens(e.target.value)}
                  required
                  className="h-9 font-mono text-xs"
                />
                <FieldDescription>
                  Amount of tokens to deposit into the launchpad escrow
                </FieldDescription>
              </Field>

              <Field>
                <FieldLabel htmlFor="soft-cap">Soft Cap (ICP) *</FieldLabel>
                <Input
                  id="soft-cap"
                  type="number"
                  step="1"
                  value={softCap}
                  onChange={(e) => setSoftCap(e.target.value)}
                  required
                  className="h-9 font-mono text-xs"
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="hard-cap">Hard Cap (ICP) *</FieldLabel>
                <Input
                  id="hard-cap"
                  type="number"
                  step="1"
                  value={hardCap}
                  onChange={(e) => setHardCap(e.target.value)}
                  required
                  className="h-9 font-mono text-xs"
                />
              </Field>

              <Field>
                <FieldLabel>Min / Max Per User (ICP)</FieldLabel>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={minUserIcp}
                    onChange={(e) => setMinUserIcp(e.target.value)}
                    className="h-9 font-mono text-xs"
                  />
                  <Input
                    type="number"
                    placeholder="Max"
                    value={maxUserIcp}
                    onChange={(e) => setMaxUserIcp(e.target.value)}
                    className="h-9 font-mono text-xs"
                  />
                </div>
              </Field>

              <Field>
                <FieldLabel htmlFor="duration-days">Duration (Days)</FieldLabel>
                <Input
                  id="duration-days"
                  type="number"
                  min="1"
                  max="30"
                  value={durationDays}
                  onChange={(e) => setDurationDays(e.target.value)}
                  className="h-9 font-mono text-xs"
                />
              </Field>

              <Field className="sm:col-span-2">
                <FieldLabel htmlFor="dex-liquidity">DEX Liquidity Paired (%)</FieldLabel>
                <Input
                  id="dex-liquidity"
                  type="number"
                  min="10"
                  max="80"
                  value={dexLiquidity}
                  onChange={(e) => setDexLiquidity(e.target.value)}
                  className="h-9 font-mono text-xs"
                />
                <FieldDescription>
                  Percentage of raised ICP automatically paired for DEX liquidity
                </FieldDescription>
              </Field>

              <Field className="sm:col-span-2">
                <FieldLabel htmlFor="description">Project Description</FieldLabel>
                <Textarea
                  id="description"
                  placeholder="Explain project utility, roadmap, and tokenomics..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="text-xs resize-none"
                />
              </Field>

              <Field className="sm:col-span-2">
                <FieldLabel htmlFor="website">Website (Optional)</FieldLabel>
                <Input
                  id="website"
                  placeholder="https://yourproject.io"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className="h-9 text-xs"
                />
              </Field>
            </FieldGroup>

            <div className="pt-2">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-11 font-medium"
              >
                {isSubmitting ? "Creating Campaign..." : "Pay 1.99 ICP & Launch"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
