"use client"

import { useState } from "react"
import Image from "next/image"
import { toast } from "@/components/ui/toast"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Tick02Icon,
  Copy01Icon,
  NewTwitterIcon,
  TelegramIcon,
  SecurityCheckIcon,
  Download01Icon,
  LinkSquare01Icon,
  Edit01Icon,
} from "@hugeicons/core-free-icons"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ButtonGroup } from "@/components/ui/button-group"
import { ShineBorder } from "@/components/ui/shine-border"
import { Particles } from "@/components/ui/particles"
import type { RemoteCertificate } from "@/services/academy/types"

interface AcademyCertificateModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  certificate: RemoteCertificate | null
  courseTitle: string
  recipientPrincipal?: string
}

function getInitialRecipientName(principalStr: string): string {
  if (typeof window === "undefined" || !principalStr) return ""
  try {
    const stored = localStorage.getItem(`icpay_academy_cert_name_${principalStr}`)
    if (stored) return stored
    const authUser = localStorage.getItem("icpay_auth_user")
    if (authUser) {
      const parsed = JSON.parse(authUser)
      if (parsed?.username) return `@${parsed.username}`
    }
  } catch {}
  return ""
}

export function AcademyCertificateModal({
  open,
  onOpenChange,
  certificate,
  courseTitle,
  recipientPrincipal,
}: AcademyCertificateModalProps) {
  const [copiedLink, setCopiedLink] = useState(false)
  const [copiedHash, setCopiedHash] = useState(false)
  const [copiedPrincipal, setCopiedPrincipal] = useState(false)
  const [isEditingName, setIsEditingName] = useState(false)
  const [customName, setCustomName] = useState<string | null>(null)
  const [tempName, setTempName] = useState("")

  const principalStr =
    recipientPrincipal ||
    (certificate && typeof certificate.user === "object" && "toText" in certificate.user
      ? certificate.user.toText()
      : certificate
        ? String(certificate.user)
        : "")

  const storedName =
    customName !== null ? customName : getInitialRecipientName(principalStr)
  const displayName = storedName.trim() || "Internet Computer Developer"

  if (!certificate) return null

  const issuedDate = certificate.issued_at
    ? new Date(Number(certificate.issued_at) / 1_000_000).toLocaleDateString(
        undefined,
        {
          year: "numeric",
          month: "long",
          day: "numeric",
        }
      )
    : new Date().toLocaleDateString()

  const verifyUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/academy/course?id=${certificate.course_id}&cert=${certificate.id}`
      : `https://icpay.app/academy/course?id=${certificate.course_id}&cert=${certificate.id}`

  const tweetText = `I just mastered ${courseTitle} and minted my verifiable on-chain soulbound certificate on @icpay_app! 🎓\n\nVerify certificate on the Internet Computer: ${verifyUrl}`
  const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`
  const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(verifyUrl)}&text=${encodeURIComponent(`Check out my official ICPay Academy certification for ${courseTitle}!`)}`

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(verifyUrl)
      setCopiedLink(true)
      toast.success("Certificate verification link copied!")
      setTimeout(() => setCopiedLink(false), 2000)
    } catch {
      toast.error("Failed to copy link")
    }
  }

  const handleCopyHash = async () => {
    try {
      await navigator.clipboard.writeText(certificate.verification_hash)
      setCopiedHash(true)
      toast.success("Verification SHA-256 hash copied!")
      setTimeout(() => setCopiedHash(false), 2000)
    } catch {
      toast.error("Failed to copy hash")
    }
  }

  const handleCopyPrincipal = async () => {
    try {
      await navigator.clipboard.writeText(principalStr)
      setCopiedPrincipal(true)
      toast.success("Principal ID copied!")
      setTimeout(() => setCopiedPrincipal(false), 2000)
    } catch {
      toast.error("Failed to copy Principal ID")
    }
  }

  const handleSaveName = () => {
    const trimmed = tempName.trim()
    setCustomName(trimmed)
    setIsEditingName(false)
    if (typeof window !== "undefined" && principalStr) {
      try {
        if (trimmed) {
          localStorage.setItem(`icpay_academy_cert_name_${principalStr}`, trimmed)
        } else {
          localStorage.removeItem(`icpay_academy_cert_name_${principalStr}`)
        }
        toast.success("Certificate recipient name updated!")
      } catch {
        toast.error("Failed to save name")
      }
    }
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] sm:max-w-3xl overflow-hidden p-0">
        <div className="relative overflow-hidden p-6 sm:p-8">
          <Particles
            className="absolute inset-0 pointer-events-none opacity-40"
            quantity={40}
            staticity={50}
            ease={50}
          />

          <DialogHeader className="mb-4 text-center sm:text-left">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Badge
                variant="outline"
                className="gap-1.5 border-primary/40 bg-primary/10 text-primary text-xs"
              >
                <HugeiconsIcon icon={SecurityCheckIcon} className="size-3.5" />
                Soulbound Verifiable Credential
              </Badge>
              <span className="font-mono text-xs font-semibold text-muted-foreground">
                {certificate.id}
              </span>
            </div>
            <DialogTitle className="pt-2">
              Verifiable Certificate of Mastery
            </DialogTitle>
          </DialogHeader>

          <div className="relative my-4 overflow-hidden rounded-2xl border border-border/80 bg-background/95 p-6 shadow-inner sm:p-8">
            <ShineBorder
              className="rounded-[inherit]"
              borderWidth={1.5}
              duration={10}
              shineColor={["#A07CFE", "#FE8FB5", "#FFBE7B"]}
            />

            <div className="relative z-10 space-y-6 text-center">
              <div className="flex flex-col items-center justify-center gap-2">
                <div className="relative size-14 overflow-hidden rounded-full border border-border bg-card p-2 shadow-xs">
                  <Image
                    src="/images/logo/logo-256.webp"
                    alt="ICPay"
                    width={48}
                    height={48}
                    className="size-full object-contain"
                  />
                </div>
                <div className="space-y-0.5">
                  <span className="text-[11px] font-bold tracking-widest uppercase text-primary">
                    Internet Computer Protocol Academy
                  </span>
                  <h3 className="text-sm font-semibold text-muted-foreground">
                    Verifiable Developer Credential
                  </h3>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">
                  This certifies that
                </p>
                {isEditingName ? (
                  <div className="mx-auto flex max-w-sm items-center gap-2">
                    <Input
                      value={tempName}
                      onChange={(e) => setTempName(e.target.value)}
                      placeholder="Enter your full name or handle"
                      maxLength={60}
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSaveName()
                        if (e.key === "Escape") {
                          setTempName(storedName)
                          setIsEditingName(false)
                        }
                      }}
                      className="text-center font-bold text-foreground"
                    />
                    <Button
                      size="sm"
                      onClick={handleSaveName}
                      className="shrink-0 gap-1"
                    >
                      <HugeiconsIcon icon={Tick02Icon} className="size-3.5" />
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setTempName(storedName)
                        setIsEditingName(false)
                      }}
                      className="shrink-0"
                    >
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <div className="group flex items-center justify-center gap-2">
                    <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                      {displayName}
                    </h2>
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => {
                        setTempName(storedName)
                        setIsEditingName(true)
                      }}
                      className="text-muted-foreground hover:text-foreground print:hidden"
                      title="Edit recipient name"
                    >
                      <HugeiconsIcon icon={Edit01Icon} className="size-3.5" />
                    </Button>
                  </div>
                )}
                <div className="flex items-center justify-center gap-1.5 pt-0.5">
                  <span className="font-mono text-[11px] text-muted-foreground break-all max-w-md bg-muted/40 px-2.5 py-1 rounded-md border border-border/60">
                    {principalStr}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={handleCopyPrincipal}
                    className="text-muted-foreground hover:text-foreground shrink-0 print:hidden"
                    title="Copy Principal ID"
                  >
                    <HugeiconsIcon
                      icon={copiedPrincipal ? Tick02Icon : Copy01Icon}
                      className="size-3"
                    />
                  </Button>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">
                  Has successfully completed all requirements and mastered
                </p>
                <h2 className="text-xl font-extrabold tracking-tight text-foreground sm:text-2xl">
                  {courseTitle}
                </h2>
                <p className="text-xs text-muted-foreground">
                  Actor concurrency, canister smart contracts, orthogonal persistence, and Web3 engineering.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 border-t border-border/60 pt-4 text-left sm:grid-cols-4">
                <div className="space-y-0.5">
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    Certificate ID
                  </span>
                  <p className="font-mono text-xs font-bold text-foreground">
                    {certificate.id}
                  </p>
                </div>

                <div className="space-y-0.5">
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    Issue Date
                  </span>
                  <p className="text-xs font-semibold text-foreground">
                    {issuedDate}
                  </p>
                </div>

                <div className="space-y-0.5">
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    Issuing Canister
                  </span>
                  <p className="font-mono text-xs font-semibold text-muted-foreground truncate" title="wkdfn-yqaaa-aaaan-q6vyq-cai">
                    wkdfn-yqaaa...-cai
                  </p>
                </div>

                <div className="space-y-0.5">
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    Proof
                  </span>
                  <Button
                    type="button"
                    variant="link"
                    size="xs"
                    onClick={handleCopyHash}
                    className="h-auto gap-1 p-0 font-mono"
                    title={certificate.verification_hash}
                  >
                    <span>{certificate.verification_hash.slice(0, 8)}...</span>
                    <HugeiconsIcon icon={copiedHash ? Tick02Icon : Copy01Icon} className="size-3" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <ButtonGroup className="border border-border/70 rounded-full bg-card/80 p-0.5">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopyLink}
                className="gap-1.5 rounded-full text-xs"
              >
                <HugeiconsIcon icon={copiedLink ? Tick02Icon : LinkSquare01Icon} className="size-3.5" />
                <span>{copiedLink ? "Copied" : "Copy Link"}</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                nativeButton={false}
                render={<a href={tweetUrl} target="_blank" rel="noopener noreferrer" />}
                className="gap-1.5 rounded-full text-xs"
              >
                <HugeiconsIcon icon={NewTwitterIcon} className="size-3.5" />
                <span>Share on X</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                nativeButton={false}
                render={<a href={telegramUrl} target="_blank" rel="noopener noreferrer" />}
                className="gap-1.5 rounded-full text-xs"
              >
                <HugeiconsIcon icon={TelegramIcon} className="size-3.5" />
                <span>Telegram</span>
              </Button>
            </ButtonGroup>

            <div className="flex items-center gap-2 justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrint}
                className="gap-1.5 rounded-full text-xs"
              >
                <HugeiconsIcon icon={Download01Icon} className="size-3.5" />
                <span>Print / Save PDF</span>
              </Button>
              <Button
                size="sm"
                onClick={() => onOpenChange(false)}
                className="rounded-full text-xs font-semibold px-4"
              >
                Done
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
