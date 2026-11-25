"use client"

import { Icon } from "@/components/ui/icon"
import { BellGlassIcon } from "@thesvg/ui-react"
import { Switch } from "@/components/ui/switch"
import { useNotificationConsent } from "@/hooks/auth/useNotificationConsent"

export function NotificationSelector() {
  const { isSupported, isGranted, isLoading, enableNotifications, disableNotifications } =
    useNotificationConsent()

  if (!isSupported) return null

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border/60 px-4 py-3.5">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-foreground">
        <Icon icon={BellGlassIcon} className="size-4.5" strokeWidth={1.75} />
      </span>
      <div className="flex-1">
        <p className="text-sm font-medium text-foreground">Device Notifications</p>
        <p className="text-xs text-muted-foreground">
          Push alerts for payments and automation
        </p>
      </div>
      <Switch
        checked={isGranted}
        disabled={isLoading}
        onCheckedChange={(checked) => {
          if (checked) {
            void enableNotifications()
          } else {
            void disableNotifications()
          }
        }}
        aria-label="Device Notifications"
        className="shrink-0"
      />
    </div>
  )
}
