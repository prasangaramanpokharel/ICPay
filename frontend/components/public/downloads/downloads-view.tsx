"use client"

import { useState, useSyncExternalStore } from "react"
import Image from "next/image"
import { motion } from "motion/react"
import { useTranslations } from "next-intl"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Download01Icon,
  ArrowDown01Icon,
  SecurityCheckIcon,
  CpuIcon,
  File01Icon,
  LinkSquare02Icon,
  ArrowRight01Icon,
} from "@hugeicons/core-free-icons"
import { AnimatedShinyText } from "@/components/ui/animated-shiny-text"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/toast"
import { CopyIconIndicator } from "@/components/ui/copy-button"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import { DESKTOP_DOWNLOADS } from "@/lib/public/downloads"
import { PAGE_IMAGES } from "@/lib/public/page-images"
import { cn } from "@/lib/ui/utils"

interface ChecksumItem {
  id: string
  name: string
  osKey: "dropdown.macArm64" | "dropdown.macX64" | "dropdown.windowsX64" | "dropdown.linuxX64"
  hash: string
}

const CHECKSUMS: ChecksumItem[] = [
  {
    id: "mac-arm64",
    name: "ICPay-1.0.0-mac-arm64.dmg",
    osKey: "dropdown.macArm64",
    hash: "41cd9b9b10707b1385e6fbe099cf8b8cf055d593c98ac545868fbd49bf0559e8",
  },
  {
    id: "mac-x64",
    name: "ICPay-1.0.0-mac-x64.dmg",
    osKey: "dropdown.macX64",
    hash: "c880a003212b62749c3dc8917c3f9cdbdb974b480f1810eb0275d365be147025",
  },
  {
    id: "windows-x64",
    name: "ICPay-1.0.0-windows-x64.exe",
    osKey: "dropdown.windowsX64",
    hash: "bee6bd06b90c4b01b44af238e71e0b357800b46a07d6e6da2f117a20d63ec664",
  },
  {
    id: "linux-x64",
    name: "ICPay-1.0.0-linux-x64.tar.gz",
    osKey: "dropdown.linuxX64",
    hash: "5a30cdd36528c23f6b892d5c63d037fe5633c1f99f8ae832f76ed63be7503d0c",
  },
]

const emptySubscribe = () => () => {}

function getDetectedOs(): "mac" | "windows" | "linux" {
  if (typeof window === "undefined") return "mac"
  const ua = window.navigator.userAgent.toLowerCase()
  if (ua.includes("win")) return "windows"
  if (ua.includes("linux")) return "linux"
  return "mac"
}

export function DownloadsView() {
  const t = useTranslations("publicSite.downloadsPage")
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const detectedOs = useSyncExternalStore(emptySubscribe, getDetectedOs, () => "mac")

  const handleCopy = async (item: ChecksumItem) => {
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(item.hash)
      }
      setCopiedId(item.id)
      toast.success(t("hashes.toastSuccess"), {
        description: `${item.name} (${t(item.osKey)})`,
      })
      setTimeout(() => {
        setCopiedId(null)
      }, 2000)
    } catch {
      toast.error(t("hashes.toastError"))
    }
  }

  const primaryDownload =
    detectedOs === "windows"
      ? {
          title: t("primary.downloadWindows"),
          subtitle: t("primary.windowsSubtitle"),
          href: DESKTOP_DOWNLOADS.windows,
          icon: PAGE_IMAGES.downloads.windows,
        }
      : detectedOs === "linux"
        ? {
            title: t("primary.downloadLinux"),
            subtitle: t("primary.linuxSubtitle"),
            href: DESKTOP_DOWNLOADS.linux,
            icon: PAGE_IMAGES.downloads.linux,
          }
        : {
            title: t("primary.downloadMac"),
            subtitle: t("primary.macSubtitle"),
            href: DESKTOP_DOWNLOADS.macosArm64,
            icon: PAGE_IMAGES.downloads.macos,
          }

  return (
    <div className="relative overflow-hidden bg-background">
      <div className="mx-auto max-w-6xl px-4 pt-14 pb-20 md:px-6 md:pt-20 md:pb-28">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="mx-auto max-w-3xl text-center space-y-5"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35, delay: 0.1 }}
            className="flex items-center justify-center"
          >
            <a
              href="#hashes"
              className="group inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/60 py-1 pl-1.5 pr-2 text-xs font-medium text-foreground shadow-xs backdrop-blur-xs transition-all duration-200 hover:border-border hover:bg-card hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span className="rounded-full bg-primary/15 px-2.5 py-0.5 text-[11px] font-semibold text-primary dark:bg-primary/20">
                {t("badge.new")}
              </span>
              <AnimatedShinyText className="inline-flex items-center gap-1.5 text-xs">
                <span className="font-medium text-foreground">
                  {t("badge.version")}
                </span>
                <span className="hidden text-muted-foreground sm:inline">
                  {t("badge.platforms")}
                </span>
              </AnimatedShinyText>
              <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-muted text-foreground transition-transform duration-200 group-hover:translate-x-0.5">
                <HugeiconsIcon icon={ArrowRight01Icon} className="size-3" />
              </span>
            </a>
          </motion.div>

          <h1 className="text-4xl font-extrabold tracking-tight bg-linear-to-b from-foreground via-foreground/95 to-foreground/50 bg-clip-text text-transparent sm:text-5xl md:text-6xl">
            {t("hero.title")}
          </h1>

          <p className="text-base text-muted-foreground md:text-lg max-w-2xl mx-auto leading-relaxed">
            {t("hero.description")}
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className="inline-flex rounded-full border border-border/80 bg-card p-1 shadow-md hover:border-primary/50 transition-colors"
            >
              <Button
                size="lg"
                className="rounded-full px-7 font-semibold shadow-sm cursor-pointer"
                nativeButton={false}
                render={
                  <a
                    href={primaryDownload.href}
                    target="_blank"
                    rel="noopener noreferrer"
                  />
                }
              >
                <div className="relative size-5 shrink-0">
                  <Image
                    src={primaryDownload.icon}
                    alt=""
                    width={20}
                    height={20}
                    className={cn(
                      "size-5 object-contain",
                      detectedOs === "mac" && "dark:invert"
                    )}
                  />
                </div>
                <span>{primaryDownload.title}</span>
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button
                      size="icon"
                      variant="ghost"
                      className="size-11 rounded-full cursor-pointer hover:bg-muted"
                      aria-label={t("dropdown.ariaLabel")}
                    >
                      <HugeiconsIcon icon={ArrowDown01Icon} className="size-4" />
                    </Button>
                  }
                />
                <DropdownMenuContent align="end" className="w-72 p-2">
                  <DropdownMenuItem
                    render={
                      <a
                        href={DESKTOP_DOWNLOADS.macosArm64}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between w-full py-2"
                      />
                    }
                  >
                    <div className="flex items-center gap-2.5">
                      <Image
                        src={PAGE_IMAGES.downloads.macos}
                        alt=""
                        width={16}
                        height={16}
                        className="size-4 object-contain dark:invert"
                      />
                      <span className="font-medium">{t("dropdown.macArm64")}</span>
                    </div>
                    <span className="text-[11px] text-muted-foreground">.dmg</span>
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    render={
                      <a
                        href={DESKTOP_DOWNLOADS.macosX64}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between w-full py-2"
                      />
                    }
                  >
                    <div className="flex items-center gap-2.5">
                      <Image
                        src={PAGE_IMAGES.downloads.macos}
                        alt=""
                        width={16}
                        height={16}
                        className="size-4 object-contain dark:invert"
                      />
                      <span className="font-medium">{t("dropdown.macX64")}</span>
                    </div>
                    <span className="text-[11px] text-muted-foreground">.dmg</span>
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    render={
                      <a
                        href={DESKTOP_DOWNLOADS.windows}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between w-full py-2"
                      />
                    }
                  >
                    <div className="flex items-center gap-2.5">
                      <Image
                        src={PAGE_IMAGES.downloads.windows}
                        alt=""
                        width={16}
                        height={16}
                        className="size-4 object-contain"
                      />
                      <span className="font-medium">{t("dropdown.windowsX64")}</span>
                    </div>
                    <span className="text-[11px] text-muted-foreground">.exe</span>
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    render={
                      <a
                        href={DESKTOP_DOWNLOADS.windowsZip}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between w-full py-2"
                      />
                    }
                  >
                    <div className="flex items-center gap-2.5">
                      <Image
                        src={PAGE_IMAGES.downloads.windows}
                        alt=""
                        width={16}
                        height={16}
                        className="size-4 object-contain"
                      />
                      <span className="font-medium">{t("dropdown.windowsPortable")}</span>
                    </div>
                    <span className="text-[11px] text-muted-foreground">.zip</span>
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    render={
                      <a
                        href={DESKTOP_DOWNLOADS.linux}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between w-full py-2"
                      />
                    }
                  >
                    <div className="flex items-center gap-2.5">
                      <Image
                        src={PAGE_IMAGES.downloads.linux}
                        alt=""
                        width={16}
                        height={16}
                        className="size-4 object-contain"
                      />
                      <span className="font-medium">{t("dropdown.linuxX64")}</span>
                    </div>
                    <span className="text-[11px] text-muted-foreground">.tar.gz</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </motion.div>
          </div>

          <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground pt-1">
            <span>{primaryDownload.subtitle}</span>
            <span>•</span>
            <a href="#hashes" className="underline hover:text-foreground transition-colors">
              {t("primary.releaseHashes")}
            </a>
          </div>
        </motion.div>

        <div className="mt-16 grid gap-6 md:grid-cols-3">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.05 }}
            whileHover={{ y: -4 }}
            className="h-full"
          >
            <Card className="flex flex-col justify-between border-border/70 bg-card p-6 shadow-sm h-full hover:border-primary/50 transition-colors">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex size-11 items-center justify-center rounded-xl border border-border/60 bg-muted/30">
                    <Image
                      src={PAGE_IMAGES.downloads.macos}
                      alt=""
                      width={22}
                      height={22}
                      className="size-5.5 object-contain dark:invert"
                    />
                  </div>
                  <Badge variant="secondary">{t("cards.macos.badge")}</Badge>
                </div>

                <div>
                  <h2 className="text-xl font-bold tracking-tight text-foreground">{t("cards.macos.title")}</h2>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t("cards.macos.description")}
                  </p>
                </div>

                <div className="divide-y divide-border/60 pt-2 text-sm">
                  <div className="flex items-center justify-between py-2.5">
                    <div className="space-y-0.5">
                      <p className="font-medium text-foreground">{t("cards.macos.arm64Title")}</p>
                      <p className="text-[11px] text-muted-foreground">{t("cards.macos.arm64Sub")}</p>
                    </div>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1.5 h-8 text-xs font-semibold cursor-pointer"
                        nativeButton={false}
                        render={
                          <a
                            href={DESKTOP_DOWNLOADS.macosArm64}
                            target="_blank"
                            rel="noopener noreferrer"
                          />
                        }
                      >
                        <HugeiconsIcon icon={Download01Icon} className="size-3.5" />
                        <span>96 MB</span>
                      </Button>
                    </motion.div>
                  </div>

                  <div className="flex items-center justify-between py-2.5">
                    <div className="space-y-0.5">
                      <p className="font-medium text-foreground">{t("cards.macos.intelTitle")}</p>
                      <p className="text-[11px] text-muted-foreground">{t("cards.macos.intelSub")}</p>
                    </div>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1.5 h-8 text-xs font-semibold cursor-pointer"
                        nativeButton={false}
                        render={
                          <a
                            href={DESKTOP_DOWNLOADS.macosX64}
                            target="_blank"
                            rel="noopener noreferrer"
                          />
                        }
                      >
                        <HugeiconsIcon icon={Download01Icon} className="size-3.5" />
                        <span>100 MB</span>
                      </Button>
                    </motion.div>
                  </div>

                  <div className="flex items-center justify-between py-2.5">
                    <div className="space-y-0.5">
                      <p className="font-medium text-foreground">{t("cards.macos.portableTitle")}</p>
                      <p className="text-[11px] text-muted-foreground">{t("cards.macos.portableSub")}</p>
                    </div>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1.5 h-8 text-xs font-semibold cursor-pointer"
                        nativeButton={false}
                        render={
                          <a
                            href={DESKTOP_DOWNLOADS.macosArm64Zip}
                            target="_blank"
                            rel="noopener noreferrer"
                          />
                        }
                      >
                        <HugeiconsIcon icon={Download01Icon} className="size-3.5" />
                        <span>92 MB</span>
                      </Button>
                    </motion.div>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.12 }}
            whileHover={{ y: -4 }}
            className="h-full"
          >
            <Card className="flex flex-col justify-between border-border/70 bg-card p-6 shadow-sm h-full hover:border-primary/50 transition-colors">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex size-11 items-center justify-center rounded-xl border border-border/60 bg-muted/30">
                    <Image
                      src={PAGE_IMAGES.downloads.windows}
                      alt=""
                      width={22}
                      height={22}
                      className="size-5.5 object-contain"
                    />
                  </div>
                  <Badge variant="secondary">{t("cards.windows.badge")}</Badge>
                </div>

                <div>
                  <h2 className="text-xl font-bold tracking-tight text-foreground">{t("cards.windows.title")}</h2>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t("cards.windows.description")}
                  </p>
                </div>

                <div className="divide-y divide-border/60 pt-2 text-sm">
                  <div className="flex items-center justify-between py-2.5">
                    <div className="space-y-0.5">
                      <p className="font-medium text-foreground">{t("cards.windows.installerTitle")}</p>
                      <p className="text-[11px] text-muted-foreground">{t("cards.windows.installerSub")}</p>
                    </div>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1.5 h-8 text-xs font-semibold cursor-pointer"
                        nativeButton={false}
                        render={
                          <a
                            href={DESKTOP_DOWNLOADS.windows}
                            target="_blank"
                            rel="noopener noreferrer"
                          />
                        }
                      >
                        <HugeiconsIcon icon={Download01Icon} className="size-3.5" />
                        <span>84 MB</span>
                      </Button>
                    </motion.div>
                  </div>

                  <div className="flex items-center justify-between py-2.5">
                    <div className="space-y-0.5">
                      <p className="font-medium text-foreground">{t("cards.windows.portableTitle")}</p>
                      <p className="text-[11px] text-muted-foreground">{t("cards.windows.portableSub")}</p>
                    </div>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1.5 h-8 text-xs font-semibold cursor-pointer"
                        nativeButton={false}
                        render={
                          <a
                            href={DESKTOP_DOWNLOADS.windowsZip}
                            target="_blank"
                            rel="noopener noreferrer"
                          />
                        }
                      >
                        <HugeiconsIcon icon={Download01Icon} className="size-3.5" />
                        <span>106 MB</span>
                      </Button>
                    </motion.div>
                  </div>

                  <div className="flex items-center justify-between py-2.5">
                    <div className="space-y-0.5">
                      <p className="font-medium text-foreground">{t("cards.windows.archTitle")}</p>
                      <p className="text-[11px] text-muted-foreground">{t("cards.windows.archSub")}</p>
                    </div>
                    <Badge variant="outline" className="text-[11px]">
                      {t("cards.windows.supportedBadge")}
                    </Badge>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.18 }}
            whileHover={{ y: -4 }}
            className="h-full"
          >
            <Card className="flex flex-col justify-between border-border/70 bg-card p-6 shadow-sm h-full hover:border-primary/50 transition-colors">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex size-11 items-center justify-center rounded-xl border border-border/60 bg-muted/30">
                    <Image
                      src={PAGE_IMAGES.downloads.linux}
                      alt=""
                      width={22}
                      height={22}
                      className="size-5.5 object-contain"
                    />
                  </div>
                  <Badge variant="secondary">{t("cards.linux.badge")}</Badge>
                </div>

                <div>
                  <h2 className="text-xl font-bold tracking-tight text-foreground">{t("cards.linux.title")}</h2>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t("cards.linux.description")}
                  </p>
                </div>

                <div className="divide-y divide-border/60 pt-2 text-sm">
                  <div className="flex items-center justify-between py-2.5">
                    <div className="space-y-0.5">
                      <p className="font-medium text-foreground">{t("cards.linux.tarballTitle")}</p>
                      <p className="text-[11px] text-muted-foreground">{t("cards.linux.tarballSub")}</p>
                    </div>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1.5 h-8 text-xs font-semibold cursor-pointer"
                        nativeButton={false}
                        render={
                          <a
                            href={DESKTOP_DOWNLOADS.linux}
                            target="_blank"
                            rel="noopener noreferrer"
                          />
                        }
                      >
                        <HugeiconsIcon icon={Download01Icon} className="size-3.5" />
                        <span>98 MB</span>
                      </Button>
                    </motion.div>
                  </div>

                  <div className="flex items-center justify-between py-2.5">
                    <div className="space-y-0.5">
                      <p className="font-medium text-foreground">{t("cards.linux.fedoraTitle")}</p>
                      <p className="text-[11px] text-muted-foreground">{t("cards.linux.fedoraSub")}</p>
                    </div>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1.5 h-8 text-xs font-semibold cursor-pointer"
                        nativeButton={false}
                        render={
                          <a
                            href={DESKTOP_DOWNLOADS.linuxRpm}
                            target="_blank"
                            rel="noopener noreferrer"
                          />
                        }
                      >
                        <HugeiconsIcon icon={Download01Icon} className="size-3.5" />
                        <span>98 MB</span>
                      </Button>
                    </motion.div>
                  </div>

                  <div className="flex items-center justify-between py-2.5">
                    <div className="space-y-0.5">
                      <p className="font-medium text-foreground">{t("cards.linux.debianTitle")}</p>
                      <p className="text-[11px] text-muted-foreground">{t("cards.linux.debianSub")}</p>
                    </div>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1.5 h-8 text-xs font-semibold cursor-pointer"
                        nativeButton={false}
                        render={
                          <a
                            href={DESKTOP_DOWNLOADS.linuxDeb}
                            target="_blank"
                            rel="noopener noreferrer"
                          />
                        }
                      >
                        <HugeiconsIcon icon={Download01Icon} className="size-3.5" />
                        <span>98 MB</span>
                      </Button>
                    </motion.div>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        <motion.div
          id="hashes"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="mt-16 space-y-4 scroll-mt-20"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <HugeiconsIcon icon={SecurityCheckIcon} className="size-5 text-primary" />
                <h2 className="text-xl font-bold tracking-tight text-foreground">
                  {t("hashes.title")}
                </h2>
              </div>
              <p className="text-sm text-muted-foreground">
                {t("hashes.description")}
              </p>
            </div>

            <Button
              size="sm"
              variant="outline"
              className="gap-2 shrink-0 self-start sm:self-auto cursor-pointer"
              nativeButton={false}
              render={
                <a
                  href={DESKTOP_DOWNLOADS.checksums}
                  target="_blank"
                  rel="noopener noreferrer"
                />
              }
            >
              <HugeiconsIcon icon={File01Icon} className="size-4" />
              <span>{t("hashes.viewAll")}</span>
              <HugeiconsIcon icon={LinkSquare02Icon} className="size-3.5 opacity-70" />
            </Button>
          </div>

          <Card className="border-border/70 bg-card shadow-sm overflow-hidden">
            <div className="divide-y divide-border/60">
              {CHECKSUMS.map((item) => {
                const isCopied = copiedId === item.id
                return (
                  <div
                    key={item.id}
                    className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between text-xs hover:bg-muted/30 transition-colors"
                  >
                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground">{item.name}</span>
                        <Badge variant="outline" className="text-[10px] py-0 px-1.5">
                          {t(item.osKey)}
                        </Badge>
                      </div>
                      <code className="block font-mono text-muted-foreground break-all text-[11px]">
                        {item.hash}
                      </code>
                    </div>

                    <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.94 }}>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCopy(item)}
                        className="gap-1.5 rounded-full px-3.5 h-8 text-xs font-medium self-start sm:self-auto shrink-0 cursor-pointer border-border/80 bg-card hover:bg-muted text-foreground transition-all duration-150"
                      >
                        <CopyIconIndicator copied={isCopied} iconClassName="size-3.5" />
                        <span>{isCopied ? t("hashes.copied") : t("hashes.copy")}</span>
                      </Button>
                    </motion.div>
                  </div>
                )
              })}
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          <motion.div whileHover={{ y: -3 }} transition={{ type: "spring", stiffness: 350 }}>
            <Card className="border-border/60 bg-card p-6 shadow-sm space-y-2.5 h-full hover:border-primary/40 transition-colors">
              <div className="flex size-10 items-center justify-center rounded-xl border border-border/60 bg-muted/40">
                <HugeiconsIcon icon={SecurityCheckIcon} className="size-5 text-primary" />
              </div>
              <h3 className="text-base font-semibold text-foreground">
                {t("features.custodyTitle")}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {t("features.custodyDesc")}
              </p>
            </Card>
          </motion.div>

          <motion.div whileHover={{ y: -3 }} transition={{ type: "spring", stiffness: 350 }}>
            <Card className="border-border/60 bg-card p-6 shadow-sm space-y-2.5 h-full hover:border-primary/40 transition-colors">
              <div className="flex size-10 items-center justify-center rounded-xl border border-border/60 bg-muted/40">
                <HugeiconsIcon icon={CpuIcon} className="size-5 text-primary" />
              </div>
              <h3 className="text-base font-semibold text-foreground">
                {t("features.perfTitle")}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {t("features.perfDesc")}
              </p>
            </Card>
          </motion.div>

          <motion.div whileHover={{ y: -3 }} transition={{ type: "spring", stiffness: 350 }} className="sm:col-span-2 lg:col-span-1">
            <Card className="border-border/60 bg-card p-6 shadow-sm space-y-2.5 h-full hover:border-primary/40 transition-colors">
              <div className="flex size-10 items-center justify-center rounded-xl border border-border/60 bg-muted/40">
                <HugeiconsIcon icon={Download01Icon} className="size-5 text-primary" />
              </div>
              <h3 className="text-base font-semibold text-foreground">
                {t("features.edgeTitle")}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {t("features.edgeDesc")}
              </p>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
