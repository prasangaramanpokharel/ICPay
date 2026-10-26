"use client"

import { useState } from "react"
import useSWR from "swr"
import {
  BellIcon,
  Mail01Icon,
  CheckmarkCircle01Icon,
  Delete02Icon,
  Clock01Icon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"
import { useAuth } from "@/components/auth/auth-provider"
import {
  getBucketEmail,
  registerBucketEmail,
  unregisterBucketEmail,
} from "@/services/notifier/notifier"

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
}

export function BucketNotificationModal({
  bucketId,
  bucketName,
  open,
  onOpenChange,
}: {
  bucketId: string
  bucketName?: string
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { identity } = useAuth()
  const [customInput, setCustomInput] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [removing, setRemoving] = useState(false)

  const principal = identity?.getPrincipal().toText() ?? "anon"
  const swrKey = open && bucketId ? ["bucket-notif-email", bucketId, principal] : null

  const { data: currentEmail, isLoading, mutate } = useSWR(
    swrKey,
    async () => {
      const email = await getBucketEmail(identity, bucketId)
      return email ?? null
    },
    { dedupingInterval: 10_000, revalidateOnFocus: false }
  )

  const emailInput = customInput ?? (currentEmail ?? "")

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setCustomInput(null)
    }
    onOpenChange(nextOpen)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = emailInput.trim()
    if (!trimmed) {
      toast.error("Please enter a valid email address")
      return
    }
    if (!isValidEmail(trimmed)) {
      toast.error("Please enter a valid email address (e.g. name@example.com)")
      return
    }

    setSaving(true)
    try {
      const err = await registerBucketEmail(identity, bucketId, trimmed)
      if (!err) {
        await mutate(trimmed, false)
        setCustomInput(null)
        toast.success("Expiry notification email configured successfully!")
        handleOpenChange(false)
      } else {
        toast.error(err)
      }
    } catch {
      toast.error("An error occurred while saving notification settings")
    } finally {
      setSaving(false)
    }
  }

  const handleRemove = async () => {
    setRemoving(true)
    try {
      const err = await unregisterBucketEmail(identity, bucketId)
      if (!err) {
        await mutate(null, false)
        setCustomInput("")
        toast.success("Notification email removed")
      } else {
        toast.error(err)
      }
    } catch {
      toast.error("An error occurred while removing email")
    } finally {
      setRemoving(false)
    }
  }

  const displayName = bucketName || bucketId

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md gap-4 sm:max-w-lg">
        <DialogHeader className="gap-1.5">
          <DialogTitle className="flex items-center gap-2 text-lg">
            <HugeiconsIcon icon={BellIcon} className="size-5 text-primary shrink-0" strokeWidth={1.75} />
            <span>Expiry Alerts</span>
          </DialogTitle>
          <DialogDescription className="text-xs">
            Email notifications for <span className="font-semibold text-foreground">{displayName}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-1 text-sm">
          {/* Status banner */}
          {isLoading ? (
            <div className="flex items-center justify-center py-6 text-xs text-muted-foreground">
              Loading notification status...
            </div>
          ) : currentEmail ? (
            <div className="flex items-center justify-between rounded-lg border border-success/30 bg-success/5 p-3 text-xs">
              <div className="flex items-center gap-2">
                <HugeiconsIcon
                  icon={CheckmarkCircle01Icon}
                  className="size-4 text-success"
                  strokeWidth={2}
                />
                <div>
                  <div className="font-medium text-success">
                    Alerts Active
                  </div>
                  <div className="text-muted-foreground">{currentEmail}</div>
                </div>
              </div>
              <Badge variant="outline" className="border-success/30 text-success">
                Monitored
              </Badge>
            </div>
          ) : (
            <div className="rounded-lg border border-border/50 bg-muted/20 p-3 text-xs text-muted-foreground">
              Never get caught unaware. Enter your email to receive automated alerts before your
              storage plan expires or enters the read-only grace period.
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSave} className="space-y-3">
            <div className="space-y-1.5">
              <label htmlFor="bucket-notif-email" className="text-xs font-medium text-foreground">
                Email Address
              </label>
              <div className="relative">
                <Input
                  id="bucket-notif-email"
                  type="email"
                  placeholder="alerts@company.com"
                  value={emailInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  disabled={isLoading || saving || removing}
                  className="pr-9 font-mono text-xs"
                />
                <HugeiconsIcon
                  icon={Mail01Icon}
                  className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                />
              </div>
            </div>

            {/* Lifecycle Stages Card */}
            <div className="rounded-lg border border-border/40 bg-muted/10 p-3 text-[11px] space-y-2">
              <div className="font-medium text-foreground/90 flex items-center gap-1.5">
                <HugeiconsIcon icon={Clock01Icon} className="size-3.5 text-muted-foreground" />
                <span>Automated Alert Schedule</span>
              </div>
              <ul className="space-y-1 text-muted-foreground list-disc list-inside">
                <li><strong className="text-foreground/80">3 Days Before Expiry:</strong> Early renewal reminder.</li>
                <li><strong className="text-foreground/80">Day 0 (Expiry):</strong> Notifies that the 7-day read-only grace period has started (CDN remains active).</li>
                <li><strong className="text-foreground/80">Day 7 (Frozen):</strong> Critical notice before public access is paused.</li>
              </ul>
            </div>

            <DialogFooter className="gap-2 sm:gap-0 pt-2">
              {currentEmail ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleRemove}
                  disabled={removing || saving}
                  className="text-destructive hover:bg-destructive/10 hover:text-destructive gap-1.5 text-xs mr-auto"
                >
                  {removing ? (
                    <Spinner data-icon="inline-start" />
                  ) : (
                    <HugeiconsIcon icon={Delete02Icon} className="size-3.5" />
                  )}
                  {removing ? "Removing..." : "Remove Email"}
                </Button>
              ) : null}
              <Button
                type="submit"
                size="sm"
                disabled={saving || removing || !emailInput.trim()}
                className="gap-1.5 text-xs"
              >
                {saving && <Spinner data-icon="inline-start" />}
                {saving ? "Saving..." : currentEmail ? "Update Email" : "Enable Alerts"}
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
