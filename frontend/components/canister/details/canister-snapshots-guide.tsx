"use client"

import { useState } from "react"
import { Icon } from "@/components/ui/icon"
import { CircleQuestionMarkGlassIcon, ArrowDownGlassIcon, CameraGlassIcon, ClockGlassIcon, TriangleAlertGlassIcon, CoinsGlassIcon } from "@thesvg/ui-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { cn } from "@/lib/ui/utils"

export function CanisterSnapshotsGuide() {
  const [open, setOpen] = useState(false)

  return (
    <Card className="border-border/60 bg-gradient-to-br from-card/80 to-muted/20 backdrop-blur-xs transition-all">
      <Collapsible open={open} onOpenChange={setOpen}>
        <div className="flex items-center justify-between p-4 sm:p-5">
          <div className="flex items-center gap-3">
            <Icon icon={CircleQuestionMarkGlassIcon} className="size-5 text-primary shrink-0" strokeWidth={1.75} />
            <div>
              <h3 className="text-sm font-semibold tracking-tight text-foreground">
                Canister Snapshots Guide
              </h3>
              <p className="text-xs text-muted-foreground">
                Understand point-in-time state backups, restore procedures, and memory impacts on the Internet Computer.
              </p>
            </div>
          </div>
          <CollapsibleTrigger
            render={
              <Button
                variant="ghost"
                size="sm"
                className="h-8 gap-1 px-2.5 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <span>{open ? "Hide guide" : "Learn more"}</span>
                <Icon
                  icon={ArrowDownGlassIcon}
                  className={cn("size-3.5 transition-transform duration-200", open && "rotate-180")}
                />
              </Button>
            }
          />
        </div>

        <CollapsibleContent>
          <CardContent className="border-t border-border/40 pt-4 pb-5">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-border/40 bg-card/40 p-3.5 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                  <Icon icon={CameraGlassIcon} className="size-4 text-info" strokeWidth={1.75} />
                  <span>Point-in-Time State</span>
                </div>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  A snapshot freezes the exact state of your canister, capturing the compiled WASM binary, heap memory, and 64-bit stable memory at a specific execution round.
                </p>
              </div>

              <div className="rounded-xl border border-border/40 bg-card/40 p-3.5 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                  <Icon icon={ClockGlassIcon} className="size-4 text-success" strokeWidth={1.75} />
                  <span>Pre-Upgrade Safety</span>
                </div>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  Best practice is to take a snapshot immediately prior to deploying code upgrades or running data migrations. If anything goes wrong, you can restore to this exact point.
                </p>
              </div>

              <div className="rounded-xl border border-border/40 bg-card/40 p-3.5 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                  <Icon icon={TriangleAlertGlassIcon} className="size-4 text-destructive" strokeWidth={1.75} />
                  <span>Restore Considerations</span>
                </div>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  Restoring a snapshot overwrites the canister&apos;s current memory and replaces the active WASM module with the snapshot&apos;s state. Any state written after the snapshot was taken will be lost.
                </p>
              </div>

              <div className="rounded-xl border border-border/40 bg-card/40 p-3.5 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                  <Icon icon={CoinsGlassIcon} className="size-4 text-primary" strokeWidth={1.75} />
                  <span>Storage & Cycles Cost</span>
                </div>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  Snapshots are stored on the subnet and consume canister memory allocation. Delete old or unneeded snapshots to minimize recurring storage cycle burn.
                </p>
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}
