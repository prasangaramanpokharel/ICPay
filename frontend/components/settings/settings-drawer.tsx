"use client"

import { useTranslations } from "next-intl"
import { HugeiconsIcon } from "@hugeicons/react"
import { Mail01Icon } from "@hugeicons/core-free-icons"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"
import { LanguageSelect } from "@/components/i18n/language-select"
import { FiatSelector } from "@/components/fiat/fiat-selector"
import { ThemeSelector } from "@/components/settings/theme-selector"
import { SoundSelector } from "@/components/settings/sound-selector"
import { useAuth } from "@/components/auth/auth-provider"

export function SettingsDrawer({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { logout } = useAuth()
  const t = useTranslations("settings")

  return (
    <Drawer
      open={open}
      onOpenChange={onOpenChange}
      swipeDirection="right"
      showSwipeHandle
    >
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{t("sections.preferences")}</DrawerTitle>
          <DrawerDescription>{t("preferencesDescription")}</DrawerDescription>
        </DrawerHeader>

        <div className="space-y-3 overflow-y-auto p-4">
          <LanguageSelect />
          <FiatSelector />
          <ThemeSelector />
          <SoundSelector />

          <a
            href="mailto:contact@icpay.cloud"
            className="flex items-center justify-center gap-2 rounded-2xl border border-border/60 bg-muted/20 px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/40 hover:text-foreground"
          >
            <HugeiconsIcon icon={Mail01Icon} className="size-4 shrink-0" strokeWidth={1.75} />
            <span>contact@icpay.cloud</span>
          </a>

          <Button
            variant="destructive"
            size="sm"
            onClick={() => {
              onOpenChange(false)
              logout()
            }}
            className="h-auto w-full rounded-2xl border bg-transparent px-4 py-2.5 text-sm"
          >
            {t("signOut")}
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
