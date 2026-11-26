"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Icon } from "@/components/ui/icon"
import { Ascii } from "@/components/ui/ascii"
import {
  ArrowRightGlassIcon,
  BookOpenGlassIcon,
} from "@thesvg/ui-react"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden border-b border-border/60 bg-background">
      <Ascii
        fade="bottom"
        className="py-12 md:py-20"
        colors={["var(--muted-foreground)", "var(--foreground)"]}
        glyphs=" .:;+*x%#@"
        clearing={0.65}
        contrast={1.0}
        intensity={0.4}
        opacity={0.35}
        size={13}
        speed={0.5}
      >
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
            <div className="space-y-6 lg:col-span-7">
              <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                On-chain cron and webhook scheduler
              </h1>

              <p className="max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                Schedule HTTP webhooks and canister calls on the Internet Computer. No servers to run and no private keys to store.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Button
                  size="lg"
                  className="gap-2 rounded-xl px-7 font-semibold shadow-sm cursor-pointer"
                  nativeButton={false}
                  render={<Link href="/cron" />}
                >
                  <span>Start free</span>
                  <ArrowRightGlassIcon className="size-4" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="gap-2 rounded-xl px-6 font-medium cursor-pointer"
                  nativeButton={false}
                  render={<Link href="/cron/docs" />}
                >
                  <Icon icon={BookOpenGlassIcon} className="size-4" />
                  <span>Docs</span>
                </Button>
              </div>

              <div className="grid grid-cols-3 gap-6 pt-6 border-t border-border/60 text-left">
                <div>
                  <p className="text-2xl font-bold tracking-tight text-foreground">$0.0005</p>
                  <p className="text-xs text-muted-foreground">Per run</p>
                </div>
                <div>
                  <p className="text-2xl font-bold tracking-tight text-foreground">60 free runs</p>
                  <p className="text-xs text-muted-foreground">A month</p>
                </div>
                <div>
                  <p className="text-2xl font-bold tracking-tight text-foreground">No servers</p>
                  <p className="text-xs text-muted-foreground">Fully on-chain</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center lg:col-span-5">
              <Image
                src="/images/logo/iccron/iccron.png"
                alt="icCron"
                width={400}
                height={400}
                priority
                className="w-full max-w-[340px] rounded-3xl object-contain drop-shadow-lg"
              />
            </div>
          </div>
        </div>
      </Ascii>
    </section>
  )
}
