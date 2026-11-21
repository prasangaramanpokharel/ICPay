"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  AppWindowIcon,
  ArrowDown01Icon,
  LinkSquare01Icon,
} from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import { ICP_LOGO } from "@/lib/token/icon"

export function CanisterVisitMenu({ canisterId }: { canisterId: string }) {
  const dAppUrl = `https://${canisterId}.icp0.io`
  const [qrSrc, setQrSrc] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    import("qrcode")
      .then((mod) =>
        mod.toDataURL(dAppUrl, {
          errorCorrectionLevel: "H",
          margin: 1,
          width: 480,
          color: { dark: "#ffffff", light: "#00000000" },
        }),
      )
      .then((src) => {
        if (active) setQrSrc(src)
      })
      .catch(() => {})
    return () => {
      active = false
    }
  }, [dAppUrl])

  return (
    <div className="flex items-center">
      <DropdownMenu>
        <div className="inline-flex items-center -space-x-px rounded-xl border border-border/40 shadow-xs">
          <Button
            variant="outline"
            size="sm"
            nativeButton={false}
            render={
              <a href={dAppUrl} target="_blank" rel="noopener noreferrer">
                <span>Visit</span>
                <HugeiconsIcon icon={LinkSquare01Icon} className="size-3.5" />
              </a>
            }
            className="h-9 gap-1.5 rounded-r-none border-0 px-3 text-xs font-semibold cursor-pointer"
          />

          <DropdownMenuTrigger
            render={
              <Button
                variant="outline"
                size="sm"
                className="h-9 rounded-l-none border-0 border-l border-border/30 px-2 text-xs cursor-pointer"
                aria-label="Visit options and on-chain QR code"
              >
                <HugeiconsIcon icon={ArrowDown01Icon} className="size-3" />
              </Button>
            }
          />
        </div>

        <DropdownMenuContent align="end" className="w-64 p-3.5 space-y-2.5">
          <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
            <HugeiconsIcon icon={AppWindowIcon} className="size-4 text-foreground" />
            <span>Visit on Chain</span>
          </div>

          <p className="text-xs text-muted-foreground leading-snug">
            Scan this QR code to open your onchain endpoint
          </p>

          <div className="relative aspect-square w-full rounded-xl bg-black p-2.5 flex items-center justify-center overflow-hidden border border-border/40">
            {qrSrc ? (
              <>
                <Image
                  src={qrSrc}
                  alt="Canister QR Code"
                  width={480}
                  height={480}
                  unoptimized
                  className="size-full object-contain"
                />
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex size-8 items-center justify-center rounded-full bg-black shadow-md ring-1 ring-white/10 p-0.5">
                  <Image
                    src={ICP_LOGO}
                    alt="ICP"
                    width={32}
                    height={32}
                    unoptimized
                    className="size-full object-contain"
                  />
                </div>
              </>
            ) : (
              <Skeleton className="size-full rounded-lg" />
            )}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}