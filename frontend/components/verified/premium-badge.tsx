import { useTranslations } from "next-intl"
import { premiumTier, type BadgeTier } from "@/lib/verified/premiumTick"
import { cn } from "@/lib/ui/utils"
import { VerifiedBadgeFillIcon } from "@thesvg/ui-react"

const TONE: Record<BadgeTier, string> = {
  gold: "text-amber-500 dark:text-amber-400",
  blue: "text-blue-600 dark:text-blue-400",
}

export function PremiumBadge({
  name,
  className,
}: {
  name: string | null | undefined
  className?: string
}) {
  return <BadgeMark tier={premiumTier(name)} className={className} />
}

export function BadgeMark({
  tier,
  className,
}: {
  tier: BadgeTier | null
  className?: string
}) {
  const t = useTranslations("profileView")
  if (!tier) return null

  return (
    <VerifiedBadgeFillIcon
      aria-label={t(tier === "gold" ? "premiumGold" : "premium")}
      className={cn("size-4 shrink-0", TONE[tier], className)}
    />
  )
}
