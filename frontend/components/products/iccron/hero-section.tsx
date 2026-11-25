import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { AnimatedShinyText } from "@/components/ui/animated-shiny-text"
import { Icon } from "@/components/ui/icon"
import {
  ArrowRightGlassIcon,
  ExternalLinkGlassIcon,
} from "@thesvg/ui-react"

export function HeroSection() {

  return (
    <section className="relative overflow-hidden border-b border-border/60 bg-background py-16 md:py-24">
      <div className="absolute inset-0 -z-10 opacity-15">
        <Image
          src="/images/pages/iccron/hero-automation.jpg"
          alt="Autonomous Cron Engine"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/80 to-background" />
      </div>

      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
          <div className="space-y-6 lg:col-span-7">
            <Link
              href="/cron"
              className="group inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/60 py-1 pl-1.5 pr-2 text-xs font-medium text-foreground shadow-xs backdrop-blur-xs transition-all duration-200 hover:border-border hover:bg-card hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span className="rounded-full bg-primary/15 px-2.5 py-0.5 text-[11px] font-semibold text-primary dark:bg-primary/20">
                Live
              </span>
              <AnimatedShinyText className="inline-flex items-center gap-1.5 text-xs">
                <span className="font-medium text-foreground">Decentralized Job Orchestration</span>
                <span className="hidden text-muted-foreground sm:inline">· icCron Engine</span>
              </AnimatedShinyText>
              <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-muted text-foreground transition-transform duration-200 group-hover:translate-x-0.5">
                <ArrowRightGlassIcon className="size-3" />
              </span>
            </Link>

            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
              Autonomous On-Chain{" "}
              <span className="bg-gradient-to-r from-primary via-accent-foreground to-primary bg-clip-text text-transparent">
                Cron & Webhook
              </span>{" "}
              Dispatcher
            </h1>

            <p className="max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              Trigger HTTP webhooks and inter-canister smart contracts with sub-second precision.
              Zero keeper bots, zero plaintext private keys, and no Vercel Pro $20/month tax.
              Powered directly by the Internet Computer blockchain.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button
                size="lg"
                className="gap-2 rounded-xl px-7 font-semibold shadow-sm"
                nativeButton={false}
                render={<Link href="/login" />}
              >
                Start
                <ArrowRightGlassIcon className="size-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="gap-2 rounded-xl px-6 font-medium"
                nativeButton={false}
                render={
                  <Link
                    href="https://dashboard.internetcomputer.org/canister/uzt4z-lp777-77774-qaabq-cai"
                    target="_blank"
                    rel="noopener noreferrer"
                  />
                }
              >
                <Icon icon={ExternalLinkGlassIcon} className="size-4" />
                Explorer
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border/50 text-left">
              <div>
                <p className="text-2xl font-bold tracking-tight text-foreground">99.4%</p>
                <p className="text-xs text-muted-foreground">Cycle Reduction vs Heartbeat</p>
              </div>
              <div>
                <p className="text-2xl font-bold tracking-tight text-foreground">$0.0005</p>
                <p className="text-xs text-muted-foreground">Per Execution Run</p>
              </div>
              <div>
                <p className="text-2xl font-bold tracking-tight text-foreground">0 Servers</p>
                <p className="text-xs text-muted-foreground">Zero Devops Overhead</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center lg:col-span-5">
            <Image
              src="/images/logo/iccron/iccron.png"
              alt="icCron"
              width={440}
              height={440}
              priority
              className="w-full max-w-[380px] rounded-3xl object-contain"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
