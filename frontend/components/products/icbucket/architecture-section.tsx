"use client"

import { useRef } from "react"
import Image from "next/image"
import { useTranslations } from "next-intl"
import { Icon } from "@/components/ui/icon"
import { ArrowDownRightGlassIcon, ArrowUpRightGlassIcon, CloudGlassIcon, TerminalGlassIcon, DatabaseGlassIcon, GlobeGlassIcon, NetworkGlassIcon, LockGlassIcon, CodeGlassIcon } from "@thesvg/ui-react"
import { Card, CardContent } from "@/components/ui/card"
import { AnimatedBeam } from "@/components/ui/animated-beam"

const UPLOAD_STEP_IDS = ["0", "1", "2"] as const
const READ_STEP_IDS = ["0", "1", "2"] as const

export function ArchitectureSection() {
  const t = useTranslations("publicSite.icbucket.architecture")

  const containerRef = useRef<HTMLDivElement>(null)
  const browserRef = useRef<HTMLDivElement>(null)
  const sdkRef = useRef<HTMLDivElement>(null)
  const ciRef = useRef<HTMLDivElement>(null)
  const canisterRef = useRef<HTMLDivElement>(null)
  const uploadRef = useRef<HTMLDivElement>(null)
  const memoryRef = useRef<HTMLDivElement>(null)
  const httpRef = useRef<HTMLDivElement>(null)

  return (
    <section className="border-b border-border/60 bg-background">
      <div className="mx-auto max-w-7xl px-4 py-16 md:px-6 md:py-20 space-y-12">
        <div className="space-y-3 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-muted/50 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur-xs">
            <Icon icon={NetworkGlassIcon} className="size-3.5 text-primary" strokeWidth={1.75} />
            <span>Storage Topography & Lifecycle</span>
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl bg-linear-to-b from-foreground via-foreground/90 to-foreground/45 bg-clip-text text-transparent md:text-5xl">
            {t("title")}
          </h2>
          <p className="mx-auto max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">
            {t("subtitle")}
          </p>
        </div>

        <Card className="relative overflow-hidden border-0 bg-transparent shadow-none">
          <CardContent className="p-0">
            <div className="w-full overflow-x-auto">
              <div
                ref={containerRef}
                className="relative mx-auto flex min-w-[720px] max-w-4xl items-center justify-between gap-6 px-8 py-16 md:py-20"
              >
                <AnimatedBeam
                  containerRef={containerRef}
                  fromRef={browserRef}
                  toRef={canisterRef}
                  curvature={-32}
                  duration={4}
                  delay={0}
                  gradientStartColor="var(--primary)"
                  gradientStopColor="var(--primary)"
                  pathColor="var(--border)"
                  pathOpacity={0.7}
                  pathWidth={1.5}
                />
                <AnimatedBeam
                  containerRef={containerRef}
                  fromRef={sdkRef}
                  toRef={canisterRef}
                  curvature={0}
                  duration={4}
                  delay={0.8}
                  gradientStartColor="var(--primary)"
                  gradientStopColor="var(--primary)"
                  pathColor="var(--border)"
                  pathOpacity={0.7}
                  pathWidth={1.5}
                />
                <AnimatedBeam
                  containerRef={containerRef}
                  fromRef={ciRef}
                  toRef={canisterRef}
                  curvature={32}
                  duration={4}
                  delay={1.6}
                  gradientStartColor="var(--primary)"
                  gradientStopColor="var(--primary)"
                  pathColor="var(--border)"
                  pathOpacity={0.7}
                  pathWidth={1.5}
                />

                <AnimatedBeam
                  containerRef={containerRef}
                  fromRef={canisterRef}
                  toRef={uploadRef}
                  curvature={-32}
                  duration={4}
                  delay={0.4}
                  gradientStartColor="var(--primary)"
                  gradientStopColor="var(--primary)"
                  pathColor="var(--border)"
                  pathOpacity={0.7}
                  pathWidth={1.5}
                />
                <AnimatedBeam
                  containerRef={containerRef}
                  fromRef={canisterRef}
                  toRef={memoryRef}
                  curvature={0}
                  duration={4}
                  delay={1.2}
                  gradientStartColor="var(--primary)"
                  gradientStopColor="var(--primary)"
                  pathColor="var(--border)"
                  pathOpacity={0.7}
                  pathWidth={1.5}
                />
                <AnimatedBeam
                  containerRef={containerRef}
                  fromRef={canisterRef}
                  toRef={httpRef}
                  curvature={32}
                  duration={4}
                  delay={2}
                  gradientStartColor="var(--primary)"
                  gradientStopColor="var(--primary)"
                  pathColor="var(--border)"
                  pathOpacity={0.7}
                  pathWidth={1.5}
                />

                <div className="flex flex-col items-center gap-8">
                  <span className="inline-flex items-center rounded-full border border-border/80 bg-background/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground shadow-2xs backdrop-blur-xs">
                    Your Application
                  </span>

                  <div className="flex flex-col items-center gap-7">
                    <div className="flex flex-col items-center gap-2 text-center">
                      <div
                        ref={browserRef}
                        className="z-10 flex size-12 items-center justify-center rounded-(--radius) border border-border/70 bg-card shadow-xs transition-all duration-200 hover:border-primary/50 hover:shadow-sm"
                      >
                        <Icon icon={GlobeGlassIcon} className="size-5 text-foreground" strokeWidth={1.75} />
                      </div>
                      <p className="text-xs font-semibold tracking-tight text-foreground">Browser App</p>
                    </div>

                    <div className="flex flex-col items-center gap-2 text-center">
                      <div
                        ref={sdkRef}
                        className="z-10 flex size-12 items-center justify-center rounded-(--radius) border border-border/70 bg-card shadow-xs transition-all duration-200 hover:border-primary/50 hover:shadow-sm"
                      >
                        <Icon icon={CodeGlassIcon} className="size-5 text-foreground" strokeWidth={1.75} />
                      </div>
                      <p className="text-xs font-semibold tracking-tight text-foreground">Client SDKs</p>
                    </div>

                    <div className="flex flex-col items-center gap-2 text-center">
                      <div
                        ref={ciRef}
                        className="z-10 flex size-12 items-center justify-center rounded-(--radius) border border-border/70 bg-card shadow-xs transition-all duration-200 hover:border-primary/50 hover:shadow-sm"
                      >
                        <Icon icon={TerminalGlassIcon} className="size-5 text-foreground" strokeWidth={1.75} />
                      </div>
                      <p className="text-xs font-semibold tracking-tight text-foreground">CI & Automation</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-center justify-center pt-10">
                  <div className="relative flex flex-col items-center gap-3 text-center">
                    <div
                      ref={canisterRef}
                      className="z-10 relative flex size-24 items-center justify-center rounded-(--radius) border-2 border-primary/50 bg-card p-3 shadow-xl backdrop-blur-md transition-all duration-300 hover:scale-105 hover:border-primary"
                    >
                      <Image
                        src="/images/logo/icbucket/icbucket.png"
                        alt="ICBucket Canister"
                        width={72}
                        height={72}
                        className="size-16 sm:size-18 rounded-(--radius) object-contain drop-shadow-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-bold tracking-tight text-foreground">
                        ICBucket Canister
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-center gap-8">
                  <span className="inline-flex items-center rounded-full border border-border/80 bg-background/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground shadow-2xs backdrop-blur-xs">
                    Storage & Delivery
                  </span>

                  <div className="flex flex-col items-center gap-7">
                    <div className="flex flex-col items-center gap-2 text-center">
                      <div
                        ref={uploadRef}
                        className="z-10 flex size-12 items-center justify-center rounded-(--radius) border border-border/70 bg-card shadow-xs transition-all duration-200 hover:border-primary/50 hover:shadow-sm"
                      >
                        <Icon icon={LockGlassIcon} className="size-5 text-foreground" strokeWidth={1.75} />
                      </div>
                      <p className="text-xs font-semibold tracking-tight text-foreground">Upload Session</p>
                    </div>

                    <div className="flex flex-col items-center gap-2 text-center">
                      <div
                        ref={memoryRef}
                        className="z-10 flex size-12 items-center justify-center rounded-(--radius) border border-border/70 bg-card shadow-xs transition-all duration-200 hover:border-primary/50 hover:shadow-sm"
                      >
                        <Icon icon={DatabaseGlassIcon} className="size-5 text-foreground" strokeWidth={1.75} />
                      </div>
                      <p className="text-xs font-semibold tracking-tight text-foreground">Stable Memory</p>
                    </div>

                    <div className="flex flex-col items-center gap-2 text-center">
                      <div
                        ref={httpRef}
                        className="z-10 flex size-12 items-center justify-center rounded-(--radius) border border-border/70 bg-card shadow-xs transition-all duration-200 hover:border-primary/50 hover:shadow-sm"
                      >
                        <Icon icon={CloudGlassIcon} className="size-5 text-foreground" strokeWidth={1.75} />
                      </div>
                      <p className="text-xs font-semibold tracking-tight text-foreground">HTTPS Gateway</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="rounded-(--radius) border border-border/70 bg-card/60 p-6 shadow-xs transition-colors">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-border/60 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="flex size-7 items-center justify-center rounded-lg border border-border bg-muted/50 text-primary">
                    <Icon icon={ArrowUpRightGlassIcon} className="size-4" strokeWidth={1.75} />
                  </div>
                  <h3 className="text-sm font-semibold tracking-tight text-foreground">
                    {t("writePath")}
                  </h3>
                </div>
                <span className="rounded-md border border-border/60 bg-muted/40 px-2 py-0.5 font-mono text-[10px] text-muted-foreground">
                  Upload & Encryption
                </span>
              </div>
              <div className="space-y-3">
                {UPLOAD_STEP_IDS.map((id, index) => (
                  <div key={id} className="flex items-start gap-3 text-sm">
                    <span className="flex size-5 shrink-0 items-center justify-center rounded-full border border-primary/20 bg-primary/10 text-[11px] font-semibold text-primary">
                      {index + 1}
                    </span>
                    <p className="leading-relaxed text-muted-foreground">
                      {t(`uploadSteps.${id}`)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          <Card className="rounded-(--radius) border border-border/70 bg-card/60 p-6 shadow-xs transition-colors">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-border/60 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="flex size-7 items-center justify-center rounded-lg border border-border bg-muted/50 text-primary">
                    <Icon icon={ArrowDownRightGlassIcon} className="size-4" strokeWidth={1.75} />
                  </div>
                  <h3 className="text-sm font-semibold tracking-tight text-foreground">
                    {t("readPath")}
                  </h3>
                </div>
                <span className="rounded-md border border-border/60 bg-muted/40 px-2 py-0.5 font-mono text-[10px] text-muted-foreground">
                  Decryption & Edge CDN
                </span>
              </div>
              <div className="space-y-3">
                {READ_STEP_IDS.map((id, index) => (
                  <div key={id} className="flex items-start gap-3 text-sm">
                    <span className="flex size-5 shrink-0 items-center justify-center rounded-full border border-primary/20 bg-primary/10 text-[11px] font-semibold text-primary">
                      {index + 1}
                    </span>
                    <p className="leading-relaxed text-muted-foreground">
                      {t(`readSteps.${id}`)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          <Card className="rounded-(--radius) border border-border/70 bg-card/60 p-6 shadow-xs transition-colors">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-border/60 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="flex size-7 items-center justify-center rounded-lg border border-border bg-muted/50 text-primary">
                    <Icon icon={ArrowDownRightGlassIcon} className="size-4" strokeWidth={1.75} />
                  </div>
                  <h3 className="text-sm font-semibold tracking-tight text-foreground">
                    {t("readPath")}
                  </h3>
                </div>
                <span className="rounded-md border border-border/60 bg-muted/40 px-2 py-0.5 font-mono text-[10px] text-muted-foreground">
                  Decryption & Edge CDN
                </span>
              </div>
              <div className="space-y-3">
                {READ_STEP_IDS.map((id, index) => (
                  <div key={id} className="flex items-start gap-3 text-sm">
                    <span className="flex size-5 shrink-0 items-center justify-center rounded-full border border-primary/20 bg-primary/10 text-[11px] font-semibold text-primary">
                      {index + 1}
                    </span>
                    <p className="leading-relaxed text-muted-foreground">
                      {t(`readSteps.${id}`)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  )
}
