"use client"

import { useState } from "react"
import Link from "next/link"
import { useTranslations } from "next-intl"
import { HugeiconsIcon } from "@hugeicons/react"
import { Cancel01Icon } from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"
import { Spinner } from "@/components/ui/spinner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Drawer,
  DrawerContent,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer"
import { TokenLogo } from "@/components/token/token-logo"
import { TokenFiatHint } from "@/components/token/token-fiat-hint"
import { TokenStandardsBadge } from "@/components/token/token-standards-badge"
import { useIsMobile } from "@/hooks/use-mobile"
import { formatTokenAmount, copyText } from "@/lib/wallet/utils"
import { icrc1Account } from "@/lib/wallet/accountId"
import {
  useDepositAddress,
  useSelfCustodyBalance,
  useRefreshWallet,
} from "@/hooks/wallet/useWalletData"
import { useChainKeyDeposit } from "@/hooks/wallet/useChainKeyDeposit"
import { useTokenRegistry } from "@/lib/token/registry"
import { resolveTokenIcon } from "@/lib/token/icon"
import { isChainKeyLedger } from "@/services/chainkey/deposits"
import { CKBTC_LEDGER_ID } from "@/services/chainkey/constants"
import { ICP_LEDGER_ID, type TokenHolding } from "@/services/tokens"
import { transfer, type TransferMode } from "@/services/transfer/transfer"
import { useAuth } from "@/components/auth/auth-provider"
import { SelfCustodyCard } from "@/components/wallet/self-custody-card"
import { SendTokenDrawer } from "@/components/wallet/send-token-drawer"
import { SendSuccess } from "@/components/wallet/send-success"
import { TokenHistoryList } from "@/components/token/token-history-list"
import { BtcWithdrawalList } from "@/components/chainkey/btc-withdrawal-list"
import {
  DepositAddressCard,
  DepositQrBlock,
} from "@/components/deposit/deposit-address-card"
import { ChainKeyDepositPanel } from "@/components/chainkey/chain-key-deposit-panel"

type Sent = {
  amount: bigint
  recipient: string
  blockIndex: bigint
  memo?: string
}

type TokenDetailDrawerProps = {
  token: TokenHolding | null
  open: boolean
  onOpenChange: (open: boolean) => void
  initialTab?: "activity" | "deposit"
}

export function TokenDetailDrawer({
  token,
  open,
  onOpenChange,
  initialTab = "activity",
}: TokenDetailDrawerProps) {
  const t = useTranslations("token")
  const isMobile = useIsMobile()
  const { identity } = useAuth()
  const refreshWallet = useRefreshWallet()
  const registry = useTokenRegistry()

  const [activeTab, setActiveTab] = useState<"activity" | "deposit">(initialTab)
  const [sendOpen, setSendOpen] = useState(false)
  const [sent, setSent] = useState<Sent | null>(null)

  const selfCustody = useSelfCustodyBalance(token?.ledgerId || null)
  const { data: deposit, isLoading: depositLoading } = useDepositAddress()
  const { deposit: chainKeyDeposit } = useChainKeyDeposit(token?.ledgerId || null)

  if (!token) return null

  const tokenIcon = resolveTokenIcon(token.ledgerId, token.logo, registry)
  const icrcAddress = deposit
    ? icrc1Account(deposit.address.owner, deposit.address.subaccount[0])
    : ""
  const isIcp = token.ledgerId === ICP_LEDGER_ID

  const handleSend = async (
    mode: TransferMode,
    to: string,
    amount: bigint,
    memo?: string,
    subaccount?: Uint8Array
  ) => {
    const result = await transfer(identity, token.ledgerId, mode, to, amount, memo, subaccount)
    if ("err" in result) return result.err
    refreshWallet()
    setSent({
      amount,
      recipient: mode === "username" ? `@${to}` : to,
      blockIndex: result.ok.blockIndex,
      memo,
    })
    return null
  }

  const handleClose = () => {
    setSent(null)
    setSendOpen(false)
    onOpenChange(false)
  }

  return (
    <>
      <Drawer
        open={open}
        onOpenChange={(next) => {
          if (!next) handleClose()
          else onOpenChange(next)
        }}
        showSwipeHandle={isMobile}
        swipeDirection={isMobile ? "down" : "right"}
      >
        <DrawerContent className="max-h-[min(100dvh,720px)] sm:max-h-none sm:max-w-md md:max-w-lg border-border/60 bg-card p-0 focus:outline-none">
          <div className="flex shrink-0 items-center justify-between border-b border-border/60 px-5 py-3.5">
            <div className="flex items-center gap-2.5 min-w-0">
              <TokenLogo token={token} className="size-6 shrink-0" />
              <div className="min-w-0">
                <DrawerTitle className="truncate text-sm font-semibold text-foreground">
                  {token.name && token.name !== token.symbol
                    ? `${token.name} (${token.symbol})`
                    : token.symbol}
                </DrawerTitle>
                <DrawerDescription className="sr-only">
                  {token.symbol} on-chain token drawer
                </DrawerDescription>
              </div>
            </div>

            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="size-8 shrink-0 rounded-full text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer"
              onClick={handleClose}
              aria-label="Close drawer"
            >
              <HugeiconsIcon icon={Cancel01Icon} className="size-4" strokeWidth={2} />
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6 space-y-6">
            {sent ? (
              <SendSuccess
                amount={sent.amount}
                recipient={sent.recipient}
                blockIndex={sent.blockIndex}
                memo={sent.memo}
                symbol={token.symbol}
                decimals={token.decimals}
                onDone={() => setSent(null)}
              />
            ) : (
              <>
                <div className="flex flex-col items-center gap-2 text-center pt-1">
                  <TokenLogo token={token} className="size-16 shadow-xs" />
                  <div className="space-y-0.5">
                    <p className="text-3xl font-extrabold tracking-tight tabular-nums text-foreground sm:text-4xl">
                      {formatTokenAmount(token.balance, token.decimals, token.decimals)}
                    </p>
                    <p className="text-xs font-medium text-muted-foreground">
                      {token.name} · {token.symbol}
                    </p>
                  </div>
                  <TokenFiatHint
                    ledgerId={token.ledgerId}
                    amount={token.balance}
                    decimals={token.decimals}
                    className="text-sm font-medium text-muted-foreground tabular-nums"
                  />
                  <div className="pt-0.5">
                    <TokenStandardsBadge ledgerId={token.ledgerId} />
                  </div>
                </div>

                <div className="pt-1">
                  <ButtonGroup className="w-full">
                    <Button
                      variant="default"
                      size="sm"
                      type="button"
                      onClick={() => setSendOpen(true)}
                      className="flex-1 h-9 text-xs font-semibold cursor-pointer"
                    >
                      {t("send")}
                    </Button>

                    <Button
                      variant={activeTab === "deposit" ? "secondary" : "outline"}
                      size="sm"
                      type="button"
                      onClick={() => setActiveTab(activeTab === "deposit" ? "activity" : "deposit")}
                      className="flex-1 h-9 text-xs font-semibold cursor-pointer border-border/80"
                    >
                      {t("deposit")}
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      nativeButton={false}
                      render={<Link href={`/trade?from=${token.ledgerId}`} prefetch />}
                      className="flex-1 h-9 text-xs font-semibold cursor-pointer border-border/80"
                    >
                      {t("swap")}
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      nativeButton={false}
                      render={
                        <a
                          href={`https://app.icpswap.com/swap?input=ryjl3-tyaaa-aaaaa-aaaba-cai&output=${token.ledgerId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        />
                      }
                      className="flex-1 h-9 text-xs font-semibold cursor-pointer border-border/80"
                    >
                      Market
                    </Button>
                  </ButtonGroup>
                </div>

                <Tabs
                  value={activeTab}
                  onValueChange={(val) => setActiveTab(val as "activity" | "deposit")}
                  className="w-full pt-1"
                >
                  <TabsList className="grid w-full grid-cols-2 rounded-xl bg-muted/50 p-1">
                    <TabsTrigger
                      value="activity"
                      className="rounded-lg py-1.5 text-xs font-semibold cursor-pointer"
                    >
                      {t("historyTitle")}
                    </TabsTrigger>
                    <TabsTrigger
                      value="deposit"
                      className="rounded-lg py-1.5 text-xs font-semibold cursor-pointer"
                    >
                      {t("depositTitle")}
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="activity" className="mt-4 space-y-4">
                    {selfCustody !== undefined && selfCustody > 0n && (
                      <SelfCustodyCard token={token} balance={selfCustody} />
                    )}

                    {token.ledgerId === CKBTC_LEDGER_ID ? (
                      <BtcWithdrawalList ledgerId={token.ledgerId} />
                    ) : null}

                    <div className="rounded-2xl border border-border/60 bg-muted/15 p-4">
                      <TokenHistoryList key={token.ledgerId} token={token} />
                    </div>
                  </TabsContent>

                  <TabsContent value="deposit" className="mt-4 space-y-4">
                    {depositLoading || !icrcAddress ? (
                      <div className="flex justify-center py-12">
                        <Spinner className="size-5 text-muted-foreground" />
                      </div>
                    ) : chainKeyDeposit ? (
                      <Tabs defaultValue="icpay" className="w-full gap-0">
                        <TabsList variant="line" className="w-full justify-center border-b border-border">
                          <TabsTrigger value="icpay" className="flex-1 text-xs">
                            {t("depositIcpayTab")}
                          </TabsTrigger>
                          <TabsTrigger value="native" className="flex-1 text-xs">
                            {chainKeyDeposit.asset}
                          </TabsTrigger>
                        </TabsList>
                        <TabsContent value="icpay" className="mt-4 space-y-3">
                          <DepositAddressCard
                            accountId={isIcp ? deposit?.accountId : undefined}
                            icrcAddress={icrcAddress}
                            principal={identity?.getPrincipal().toText()}
                            logo={tokenIcon}
                            onCopy={copyText}
                          />
                        </TabsContent>
                        <TabsContent value="native" className="mt-4 space-y-3">
                          <p className="text-center text-xs leading-relaxed text-muted-foreground">
                            {t("depositNativeNote", {
                              asset: chainKeyDeposit.asset,
                              network: chainKeyDeposit.asset === "BTC" ? "Bitcoin" : "Ethereum",
                              symbol: token.symbol,
                            })}
                          </p>
                          <DepositQrBlock
                            value={chainKeyDeposit.address}
                            logo={tokenIcon}
                            onCopy={copyText}
                          />
                          {isChainKeyLedger(token.ledgerId) ? (
                            <ChainKeyDepositPanel ledgerId={token.ledgerId} />
                          ) : null}
                        </TabsContent>
                      </Tabs>
                    ) : (
                      <div className="space-y-3">
                        <DepositAddressCard
                          accountId={isIcp ? deposit?.accountId : undefined}
                          icrcAddress={icrcAddress}
                          principal={identity?.getPrincipal().toText()}
                          logo={tokenIcon}
                          onCopy={copyText}
                        />
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </>
            )}
          </div>
        </DrawerContent>
      </Drawer>

      <SendTokenDrawer
        open={sendOpen}
        onOpenChange={setSendOpen}
        token={token}
        onSend={handleSend}
      />
    </>
  )
}
