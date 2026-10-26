"use client"

import { useTranslations } from "next-intl"
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
            <svg viewBox="0 0 24 24" className="size-4 shrink-0 fill-none stroke-current stroke-2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
            </svg>
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
