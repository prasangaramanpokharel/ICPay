"use client"

import Image from "next/image"
import Link from "next/link"
import { useTranslations } from "next-intl"
import { motion } from "motion/react"
import { Icon } from "@/components/ui/icon"
import { ArrowRightGlassIcon } from "@thesvg/ui-react"
import {
  CutoutCard,
  CutoutCardAction,
  CutoutCardContent,
  CutoutCardFooter,
  CutoutCardImage,
  CutoutCardInsetLabel,
  CutoutCardMedia,
  CutoutCardOverlay,
  CutoutCardPin,
  cutoutCardSurfaceClassName,
  CutoutCorner,
  useCutoutContentStaggerVariants,
} from "@/components/ui/cutout-card"
import { LANDING_MEDIA } from "@/lib/public/landing-media"
import { cn } from "@/lib/ui/utils"

export function LandingProducts() {
  const t = useTranslations("publicSite.landing.products")
  const stagger = useCutoutContentStaggerVariants()

  const products = [
    {
      id: "wallet",
      href: "/login",
      image: LANDING_MEDIA.heroBanner,
      avatar: "/images/logo/logo-256.webp",
      avatarClassName: "object-cover",
      badge: "Wallet",
      pin: "Official",
      footerTitle: "Internet Computer",
      footerSubtitle: "Custodial Subaccounts",
      footerTag: "Gasless",
    },
    {
      id: "icbucket",
      href: "/icbucket",
      image: LANDING_MEDIA.icbucket,
      avatar: "/images/logo/icbucket/icbucket.png",
      avatarClassName: "object-contain rounded-xl p-0.5",
      badge: "Cloud Storage",
      pin: "On-Chain",
      footerTitle: "Decentralized S3",
      footerSubtitle: "Canister Storage",
      footerTag: "Pay in ICP",
    },
    {
      id: "icfalcon",
      href: "/icfalcon",
      image: LANDING_MEDIA.icfalcon,
      avatar: "/images/logo/icfalcon/icfalcon.png",
      avatarClassName: "object-contain rounded-xl p-0.5",
      badge: "Framework",
      pin: "Developer",
      footerTitle: "Motoko Stack",
      footerSubtitle: "CLI & Templates",
      footerTag: "v1.0",
    },
  ] as const

  return (
    <section className="border-b border-border/60 bg-background">
      <div className="mx-auto max-w-7xl px-4 py-16 md:px-6 md:py-20">
        <div className="mb-10 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
              {t("eyebrow")}
            </p>
            <h2 className="text-3xl font-extrabold tracking-tight bg-linear-to-b from-foreground via-foreground/90 to-foreground/50 bg-clip-text text-transparent md:text-4xl">
              {t("title")}
            </h2>
          </div>
          <p className="max-w-xl text-sm leading-relaxed text-muted-foreground md:text-base">
            {t("subtitle")}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => {
            const imageLabel = t(`items.${product.id}.title`)

            return (
              <CutoutCard
                key={product.id}
                className={cn(cutoutCardSurfaceClassName, "flex flex-col")}
              >
                <CutoutCardMedia className="relative h-60 sm:h-64 w-full">
                  <CutoutCardImage
                    alt={imageLabel}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    src={product.image}
                  />
                  <CutoutCardOverlay />
                  <CutoutCardInsetLabel className="bg-card bottom-0 left-0 rounded-tr-[20px] px-5 py-3">
                    <span className="text-muted-foreground text-[11px] font-semibold tracking-widest uppercase">
                      {product.badge}
                    </span>
                    <CutoutCorner className="text-card absolute -right-[31px] -bottom-px rotate-90" />
                    <CutoutCorner className="text-card absolute -top-[31px] -left-px rotate-90" />
                  </CutoutCardInsetLabel>
                  <CutoutCardPin className="bg-primary text-primary-foreground shadow-foreground/10 ring-border/30 top-0 right-0 rounded-bl-[16px] px-4 py-2 text-xs font-semibold shadow-md ring-1">
                    {product.pin}
                    <CutoutCorner
                      className="text-primary absolute top-0 -left-[23px] -rotate-90"
                      size={24}
                    />
                    <CutoutCorner
                      className="text-primary absolute right-0 -bottom-[23px] -rotate-90"
                      size={24}
                    />
                  </CutoutCardPin>
                </CutoutCardMedia>

                <CutoutCardContent className="flex flex-1 flex-col justify-between">
                  <motion.div
                    animate="show"
                    className="contents"
                    initial="hidden"
                    variants={stagger.container}
                  >
                    <div>
                      <motion.h3
                        className="text-card-foreground mb-2 text-xl font-bold leading-snug tracking-tight text-balance"
                        variants={stagger.item}
                      >
                        <Link href={product.href} className="hover:underline">
                          {t(`items.${product.id}.title`)}
                        </Link>
                      </motion.h3>
                      <motion.p
                        className="text-muted-foreground mb-6 text-sm leading-relaxed text-pretty"
                        variants={stagger.item}
                      >
                        {t(`items.${product.id}.description`)}
                      </motion.p>
                    </div>

                    <motion.div variants={stagger.item}>
                      <CutoutCardFooter className="border-border/80 border-t pt-4">
                        <div className="flex items-center gap-3">
                          <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full bg-muted/80 ring-2 ring-card shadow-sm">
                            <Image
                              src={product.avatar}
                              alt={product.footerTitle}
                              fill
                              sizes="32px"
                              className={cn(
                                "h-full w-full",
                                product.avatarClassName
                              )}
                            />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-card-foreground text-xs font-semibold leading-none mb-1">
                              {product.footerTitle}
                            </span>
                            <span className="text-muted-foreground text-[11px] leading-none">
                              {product.footerSubtitle}
                            </span>
                          </div>
                        </div>
                        <span className="text-muted-foreground rounded-full border border-border/60 bg-muted/40 px-2.5 py-0.5 text-[11px] font-mono transition-opacity duration-200 group-hover/cutout:opacity-0">
                          {product.footerTag}
                        </span>
                      </CutoutCardFooter>
                    </motion.div>
                  </motion.div>
                </CutoutCardContent>

                <CutoutCardAction className="right-5 bottom-4">
                  <Link
                    href={product.href}
                    className="bg-primary text-primary-foreground rounded-full px-4 py-2 text-xs font-semibold shadow-md transition-transform duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] hover:bg-primary/90 active:scale-[0.97] inline-flex items-center gap-1.5"
                  >
                    <span>{t(`items.${product.id}.cta`)}</span>
                    <Icon icon={ArrowRightGlassIcon} className="size-3.5" strokeWidth={2} />
                  </Link>
                </CutoutCardAction>
              </CutoutCard>
            )
          })}
        </div>
      </div>
    </section>
  )
}


