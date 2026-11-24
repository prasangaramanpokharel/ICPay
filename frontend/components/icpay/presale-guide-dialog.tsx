"use client"

import { useState } from "react"
import Image from "next/image"
import { useTranslations } from "next-intl"
import { Icon } from "@/components/ui/icon"
import { ReplaceGlassIcon, XGlassIcon, CoinsGlassIcon, ShoppingBagGlassIcon, UserGlassIcon } from "@thesvg/ui-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { markPresaleGuideSeen } from "@/lib/icpay/presaleGuide"
import { ICPAY_TOKEN_ICON } from "@/lib/ui/brand-images"

const STEPS = [
  { titleKey: "guideStep1Title", bodyKey: "guideStep1Body", icon: ShoppingBagGlassIcon },
  { titleKey: "guideStep2Title", bodyKey: "guideStep2Body", icon: ReplaceGlassIcon },
  { titleKey: "guideStep3Title", bodyKey: "guideStep3Body", icon: UserGlassIcon },
  { titleKey: "guideStep4Title", bodyKey: "guideStep4Body", icon: CoinsGlassIcon },
] as const

export function PresaleGuideDialog({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const t = useTranslations("buyIcpay")
  const [step, setStep] = useState(0)

  const dismiss = () => {
    markPresaleGuideSeen()
    setStep(0)
    onClose()
  }

  const current = STEPS[step]
  const last = step === STEPS.length - 1
  const first = step === 0

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) dismiss()
      }}
    >
      <DialogContent showCloseButton={false} className="gap-0 overflow-hidden p-0 sm:max-w-md">
        <div className="relative bg-gradient-to-br from-primary via-primary to-primary/80 px-6 pb-8 pt-6 text-primary-foreground">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="absolute top-3 right-3 z-10 text-primary-foreground/80 hover:bg-primary-foreground/10 hover:text-primary-foreground"
            onClick={dismiss}
            aria-label={t("guideClose")}
          >
            <Icon icon={XGlassIcon} className="size-4" strokeWidth={1.75} />
          </Button>
          <div className="flex items-center gap-3 pr-8">
            <span className="relative flex size-12 shrink-0 overflow-hidden rounded-full ring-2 ring-primary-foreground/30">
              <Image
                src={ICPAY_TOKEN_ICON}
                alt=""
                width={48}
                height={48}
                unoptimized
                className="size-full object-cover"
              />
            </span>
            <div>
              <DialogHeader className="text-left">
                <DialogTitle className="text-primary-foreground">{t("heroTitle")}</DialogTitle>
                <DialogDescription className="text-primary-foreground/80">
                  {t("heroSubtitle")}
                </DialogDescription>
              </DialogHeader>
            </div>
          </div>
        </div>

        <div className="space-y-4 px-6 py-5">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Icon icon={current.icon} className="size-5 text-primary shrink-0" strokeWidth={1.75} />
              <p className="text-base font-semibold">{t(current.titleKey)}</p>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">{t(current.bodyKey)}</p>
          </div>
          <div className="flex justify-center gap-1.5 pt-1">
            {STEPS.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 rounded-full transition-all ${
                  i === step ? "w-6 bg-primary" : "w-1.5 bg-muted-foreground/30"
                }`}
              />
            ))}
          </div>
        </div>

        <DialogFooter className="border-t border-border/60 px-6 py-4">
          <div className="flex w-full gap-2">
            <Button
              variant="outline"
              className="flex-1"
              disabled={first}
              onClick={() => setStep((s) => Math.max(0, s - 1))}
            >
              {t("guidePrevious")}
            </Button>
            {last ? (
              <Button className="flex-1" onClick={dismiss}>
                {t("guideStart")}
              </Button>
            ) : (
              <Button className="flex-1" onClick={() => setStep((s) => s + 1)}>
                {t("guideNext")}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
