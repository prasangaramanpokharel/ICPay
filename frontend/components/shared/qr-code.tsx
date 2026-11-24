"use client"

import { useTranslations } from "next-intl"
import { QRCode } from "@ttsalpha/qrcode"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/ui/utils"
import { ICP_LOGO } from "@/lib/token/icon"

type QrCodeProps = {
  value: string
  logo?: string
  className?: string
  dotStyle?: "rounded" | "circle" | "square"
}

export function QrCode({
  value,
  logo,
  className,
  dotStyle = "circle",
}: QrCodeProps) {
  const t = useTranslations("deposit")

  if (!value) {
    return (
      <Card
        className={cn(
          "mx-auto w-full max-w-[min(100%,18rem)] gap-0 py-0 shadow-sm sm:max-w-[min(100%,20rem)]",
          className
        )}
      >
        <div className="p-4 sm:p-5">
          <div className="aspect-square w-full rounded-xl bg-white p-3 sm:p-4">
            <Skeleton className="size-full rounded-lg" />
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card
      className={cn(
        "mx-auto w-full max-w-[min(100%,18rem)] gap-0 py-0 shadow-sm sm:max-w-[min(100%,20rem)]",
        className
      )}
    >
      <div className="p-4 sm:p-5">
        <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-white p-3 ring-1 ring-black/5 sm:p-4 flex items-center justify-center">
          <QRCode
            value={value}
            size={280}
            margin={1}
            dotStyle={dotStyle}
            dotColor="#000000"
            backgroundColor="#ffffff"
            corner={{
              square: { style: "extra-rounded", color: "#000000" },
              dot: { style: dotStyle === "circle" ? "circle" : "rounded", color: "#000000" },
            }}
            logo={{
              src: logo ?? ICP_LOGO,
              size: 0.36,
              margin: 1,
              radius: 1,
              aspectRatio: 1,
            }}
            className="size-full object-contain"
            ariaLabel={t("qrAlt")}
          />
        </div>
      </div>
    </Card>
  )
}
