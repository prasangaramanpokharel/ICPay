"use client"

import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Icon } from "@/components/ui/icon"
import { EyeGlassIcon, EyeOffGlassIcon } from "@thesvg/ui-react"
import { useBalanceVisibility } from "@/components/wallet/balance-visibility-provider"
import { cn } from "@/lib/ui/utils"

export function BalanceVisibilityToggle({
  className,
  size = "icon-xs",
}: {
  className?: string
  size?: "icon-xs" | "icon-sm" | "xs" | "sm"
}) {
  const t = useTranslations("dashboard")
  const { hidden, toggleVisibility } = useBalanceVisibility()

  return (
    <Button
      variant="ghost"
      size={size}
      aria-label={hidden ? t("showBalance") : t("hideBalance")}
      onClick={toggleVisibility}
      className={cn(
        "size-7 shrink-0 rounded-full text-muted-foreground/60 hover:bg-transparent hover:text-muted-foreground transition-colors",
        className
      )}
    >
      <Icon icon={hidden ? EyeOffGlassIcon : EyeGlassIcon} className="size-4" strokeWidth={1.75} />
    </Button>
  )
}
