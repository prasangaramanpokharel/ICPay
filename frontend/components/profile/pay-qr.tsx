"use client"

import { QRCode } from "@ttsalpha/qrcode"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/ui/utils"
import { ICP_LOGO } from "@/lib/token/icon"

export function PayQr({
  value,
  className,
  qrClassName,
  skeletonClassName,
}: {
  value: string
  className?: string
  qrClassName?: string
  skeletonClassName?: string
}) {
  if (!value) {
    return <Skeleton className={cn("size-44 rounded-(--radius)", skeletonClassName)} />
  }

  return (
    <div className={className}>
      <div className="relative flex items-center justify-center rounded-(--radius) bg-white p-3">
        <QRCode
          value={value}
          size={176}
          margin={1}
          dotStyle="circle"
          dotColor="#000000"
          backgroundColor="#ffffff"
          corner={{
            square: { style: "extra-rounded", color: "#000000" },
            dot: { style: "circle", color: "#000000" },
          }}
          logo={{
            src: ICP_LOGO,
            size: 0.38,
            margin: 1,
            radius: 1,
            aspectRatio: 1,
          }}
          className={cn("size-44", qrClassName)}
        />
      </div>
    </div>
  )
}
