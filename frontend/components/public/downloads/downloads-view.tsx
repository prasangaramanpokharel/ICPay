"use client"

import { useState, useSyncExternalStore } from "react"
import Image from "next/image"
import { motion } from "motion/react"
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
  os: string
  hash: string
}

const CHECKSUMS: ChecksumItem[] = [
  {
    id: "mac-arm64",
    name: "ICPay-1.0.0-mac-arm64.dmg",
    os: "macOS Apple Silicon",
    hash: "41cd9b9b10707b1385e6fbe099cf8b8cf055d593c98ac545868fbd49bf0559e8",
  },
  {
    id: "mac-x64",
    name: "ICPay-1.0.0-mac-x64.dmg",
    os: "macOS Intel",
    hash: "c880a003212b62749c3dc8917c3f9cdbdb974b480f1810eb0275d365be147025",
  },
  {
    id: "windows-x64",
    name: "ICPay-1.0.0-windows-x64.exe",
    os: "Windows 64-bit",
    hash: "bee6bd06b90c4b01b44af238e71e0b357800b46a07d6e6da2f117a20d63ec664",
  },
  {
    id: "linux-x64",
    name: "ICPay-1.0.0-linux-x64.tar.gz",
    os: "Linux 64-bit",
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
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const detectedOs = useSyncExternalStore(emptySubscribe, getDetectedOs, () => "mac")

  const handleCopy = async (item: ChecksumItem) => {
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(item.hash)
      }
      setCopiedId(item.id)
      toast.success("SHA-256 hash copied to clipboard", {
        description: `${item.name} (${item.os})`,
      })
      setTimeout(() => {
        setCopiedId(null)
      }, 2000)
    } catch {
      toast.error("Failed to copy hash")
    }
  }

  const primaryDownload =
    detectedOs === "windows"
      ? {
          title: "Download for Windows",
          subtitle: "Windows 10 & 11 (64-bit) · 84 MB",
          href: DESKTOP_DOWNLOADS.windows,
          icon: PAGE_IMAGES.downloads.windows,
        }
      : detectedOs === "linux"
        ? {
            title: "Download for Linux",
            subtitle: "x64 Tarball · 98 MB",
            href: DESKTOP_DOWNLOADS.linux,
            icon: PAGE_IMAGES.downloads.linux,
          }
        : {
            title: "Download for Mac",
            subtitle: "Apple Silicon (M1/M2/M3/M4) · 96 MB",
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
                New
              </span>
              <AnimatedShinyText className="inline-flex items-center gap-1.5 text-xs">
                <span className="font-medium text-foreground">
                  Desktop v1.0.0
                </span>
                <span className="hidden text-muted-foreground sm:inline">
                  · macOS, Windows & Linux
                </span>
              </AnimatedShinyText>
              <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-muted text-foreground transition-transform duration-200 group-hover:translate-x-0.5">
                <HugeiconsIcon icon={ArrowRight01Icon} className="size-3" />
              </span>
            </a>
          </motion.div>

          <h1 className="text-4xl font-extrabold tracking-tight bg-linear-to-b from-foreground via-foreground/95 to-foreground/50 bg-clip-text text-transparent sm:text-5xl md:text-6xl">
            Download ICPay Desktop
          </h1>

          <p className="text-base text-muted-foreground md:text-lg max-w-2xl mx-auto leading-relaxed">
            The custodial ICP wallet built natively for your desktop. Fast, secure, and authenticated
            exclusively via Internet Identity.
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
                      aria-label="Select desktop platform"
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
                      <span className="font-medium">Mac (Apple Silicon)</span>
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
                      <span className="font-medium">Mac (Intel)</span>
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
                      <span className="font-medium">Windows (64-bit)</span>
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
                      <span className="font-medium">Windows Portable</span>
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
                      <span className="font-medium">Linux (x64)</span>
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
              Release Hashes
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
                  <Badge variant="secondary">macOS 12.0+</Badge>
                </div>

                <div>
                  <h2 className="text-xl font-bold tracking-tight text-foreground">macOS</h2>
                  <p className="text-xs text-muted-foreground mt-1">
                    Universal package for Apple Silicon and Intel machines.
                  </p>
                </div>

                <div className="divide-y divide-border/60 pt-2 text-sm">
                  <div className="flex items-center justify-between py-2.5">
                    <div className="space-y-0.5">
                      <p className="font-medium text-foreground">Apple Silicon</p>
                      <p className="text-[11px] text-muted-foreground">M1 / M2 / M3 / M4 · DMG</p>
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
                      <p className="font-medium text-foreground">Intel Architecture</p>
                      <p className="text-[11px] text-muted-foreground">x86_64 · DMG</p>
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
                      <p className="font-medium text-foreground">Silicon Portable</p>
                      <p className="text-[11px] text-muted-foreground">ARM64 · ZIP</p>
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
                  <Badge variant="secondary">Windows 10 / 11</Badge>
                </div>

                <div>
                  <h2 className="text-xl font-bold tracking-tight text-foreground">Windows</h2>
                  <p className="text-xs text-muted-foreground mt-1">
                    64-bit setup installer and portable executable archive.
                  </p>
                </div>

                <div className="divide-y divide-border/60 pt-2 text-sm">
                  <div className="flex items-center justify-between py-2.5">
                    <div className="space-y-0.5">
                      <p className="font-medium text-foreground">Setup Installer</p>
                      <p className="text-[11px] text-muted-foreground">NSIS Package · EXE</p>
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
                      <p className="font-medium text-foreground">Portable Archive</p>
                      <p className="text-[11px] text-muted-foreground">x64 Binary · ZIP</p>
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
                      <p className="font-medium text-foreground">Architecture</p>
                      <p className="text-[11px] text-muted-foreground">x86_64 Verified</p>
                    </div>
                    <Badge variant="outline" className="text-[11px]">
                      Supported
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
                  <Badge variant="secondary">GLIBC 2.31+</Badge>
                </div>

                <div>
                  <h2 className="text-xl font-bold tracking-tight text-foreground">Linux</h2>
                  <p className="text-xs text-muted-foreground mt-1">
                    Distribution archive for Ubuntu, Debian, Fedora, Arch.
                  </p>
                </div>

                <div className="divide-y divide-border/60 pt-2 text-sm">
                  <div className="flex items-center justify-between py-2.5">
                    <div className="space-y-0.5">
                      <p className="font-medium text-foreground">Distribution Tarball</p>
                      <p className="text-[11px] text-muted-foreground">x86_64 · TAR.GZ</p>
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
                      <p className="font-medium text-foreground">Fedora / RHEL</p>
                      <p className="text-[11px] text-muted-foreground">RPM Compatible</p>
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
                      <p className="font-medium text-foreground">Debian / Ubuntu</p>
                      <p className="text-[11px] text-muted-foreground">DEB Compatible</p>
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
                  Cryptographic Integrity (SHA-256)
                </h2>
              </div>
              <p className="text-sm text-muted-foreground">
                Verify checksums directly in your terminal to ensure genuine, tamper-free binaries.
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
              <span>SHA256SUMS.txt</span>
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
                          {item.os}
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
                        <span>{isCopied ? "Copied" : "Copy"}</span>
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
                Custodial Architecture
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Authenticated exclusively via Internet Identity. No seed phrases, unencrypted keys, or passwords are ever stored locally.
              </p>
            </Card>
          </motion.div>

          <motion.div whileHover={{ y: -3 }} transition={{ type: "spring", stiffness: 350 }}>
            <Card className="border-border/60 bg-card p-6 shadow-sm space-y-2.5 h-full hover:border-primary/40 transition-colors">
              <div className="flex size-10 items-center justify-center rounded-xl border border-border/60 bg-muted/40">
                <HugeiconsIcon icon={CpuIcon} className="size-5 text-primary" />
              </div>
              <h3 className="text-base font-semibold text-foreground">
                Native Performance
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Hardware-accelerated rendering and cryptography powered by Electron 33 with minimal memory usage.
              </p>
            </Card>
          </motion.div>

          <motion.div whileHover={{ y: -3 }} transition={{ type: "spring", stiffness: 350 }} className="sm:col-span-2 lg:col-span-1">
            <Card className="border-border/60 bg-card p-6 shadow-sm space-y-2.5 h-full hover:border-primary/40 transition-colors">
              <div className="flex size-10 items-center justify-center rounded-xl border border-border/60 bg-muted/40">
                <HugeiconsIcon icon={Download01Icon} className="size-5 text-primary" />
              </div>
              <h3 className="text-base font-semibold text-foreground">
                Cloudflare Edge Delivery
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Global R2 object storage with multi-region edge caching across 330+ locations and zero egress throttling.
              </p>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
