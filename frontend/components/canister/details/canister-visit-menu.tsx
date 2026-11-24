"use client"

import { Icon } from "@/components/ui/icon"
import { AppWindowGlassIcon, ChevronDownGlassIcon, ExternalLinkGlassIcon } from "@thesvg/ui-react"
import { QRCode } from "@ttsalpha/qrcode"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ICP_LOGO } from "@/lib/token/icon"

export function CanisterVisitMenu({ canisterId }: { canisterId: string }) {
  const dAppUrl = `https://${canisterId}.icp0.io`

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
                <Icon icon={ExternalLinkGlassIcon} className="size-3.5" />
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
                <Icon icon={ChevronDownGlassIcon} className="size-3" />
              </Button>
            }
          />
        </div>

        <DropdownMenuContent align="end" className="w-64 p-3.5 space-y-2.5">
          <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
            <Icon icon={AppWindowGlassIcon} className="size-4 text-foreground" />
            <span>Visit on Chain</span>
          </div>

          <p className="text-xs text-muted-foreground leading-snug">
            Scan this QR code to open your onchain endpoint
          </p>

          <div className="relative aspect-square w-full rounded-xl bg-black p-2.5 flex items-center justify-center overflow-hidden border border-border/40">
            <QRCode
              value={dAppUrl}
              size={240}
              margin={1}
              dotStyle="circle"
              dotColor="#ffffff"
              backgroundColor="transparent"
              corner={{
                square: { style: "extra-rounded", color: "#ffffff" },
                dot: { style: "circle", color: "#ffffff" },
              }}
              logo={{
                src: ICP_LOGO,
                size: 0.38,
                margin: 1,
                radius: 1,
                aspectRatio: 1,
              }}
              className="size-full object-contain"
              ariaLabel="Canister QR Code"
            />
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
