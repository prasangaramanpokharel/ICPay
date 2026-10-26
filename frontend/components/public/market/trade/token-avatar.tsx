"use client"

import { cn } from "@/lib/ui/utils"
import { rememberedTokenLogo, usableTokenLogo } from "@/lib/market/tokenLogo"
import { resolveTokenIcon } from "@/lib/token/icon"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function TokenAvatar({
  symbol,
  ledgerId,
  logoUrl,
  className,
}: {
  symbol: string
  ledgerId?: string
  logoUrl?: string | null
  className?: string
}) {
  const src =
    usableTokenLogo(logoUrl) ??
    (ledgerId ? rememberedTokenLogo(ledgerId) : null) ??
    (ledgerId ? resolveTokenIcon(ledgerId) : undefined) ??
    undefined

  return (
    <Avatar className={cn("size-8 shrink-0 bg-muted after:hidden", className)}>
      {src ? (
        <AvatarImage src={src} alt={symbol} className="size-full object-contain p-[7%]" />
      ) : null}
      <AvatarFallback className="bg-muted text-xs font-bold text-foreground">
        {symbol.slice(0, 1).toUpperCase()}
      </AvatarFallback>
    </Avatar>
  )
}
