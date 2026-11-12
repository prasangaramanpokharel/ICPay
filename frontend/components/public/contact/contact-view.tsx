"use client"

import { useState } from "react"
import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Copy01Icon,
  HeadphonesIcon,
  HelpCircleIcon,
  LinkSquare02Icon,
  LockPasswordIcon,
  Mail01Icon,
  Message01Icon,
  SentIcon,
  Shield01Icon,
  SourceCodeIcon,
  SparklesIcon,
  Tick02Icon,
} from "@hugeicons/core-free-icons"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/toast"
import { copyText } from "@/lib/wallet/utils"

const CONTACT_EMAIL = "contact@icpay.cloud"

const TOPICS = [
  { id: "support", label: "Technical Support", subjectPrefix: "[Support]" },
  { id: "bucket", label: "icBucket Storage & CDN", subjectPrefix: "[icBucket]" },
  { id: "tokens", label: "Token Launch & Listing", subjectPrefix: "[Token Launch]" },
  { id: "partnership", label: "Partnership & Ecosystem", subjectPrefix: "[Partnership]" },
  { id: "security", label: "Security & Bug Bounty", subjectPrefix: "[SECURITY]" },
  { id: "other", label: "General Inquiry", subjectPrefix: "[Inquiry]" },
]

const CONTACT_CHANNELS = [
  {
    icon: HeadphonesIcon,
    title: "General & Technical Support",
    description: "Account help, custodial wallet inquiries, transaction verification, or feature questions.",
    actionText: "contact@icpay.cloud",
    mailtoSubject: "[Support] Inquiry",
    badge: "24h Response",
    badgeVariant: "secondary" as const,
  },
  {
    icon: SparklesIcon,
    title: "icBucket Cloud Storage",
    description: "Assistance with custom capacity tiers, edge CDN reverse proxies, API keys, or SDK integrations.",
    actionText: "contact@icpay.cloud",
    mailtoSubject: "[icBucket] Storage Inquiry",
    badge: "Developer Support",
    badgeVariant: "outline" as const,
  },
  {
    icon: Shield01Icon,
    title: "Security & Vulnerability Disclosure",
    description: "Responsible vulnerability disclosures, smart contract audit feedback, and infrastructure issues.",
    actionText: "contact@icpay.cloud",
    mailtoSubject: "[SECURITY] Responsible Disclosure",
    badge: "High Priority",
    badgeVariant: "destructive" as const,
  },
  {
    icon: Message01Icon,
    title: "Community & Ecosystem",
    description: "Join community discussions, propose token listings, or follow official engineering announcements.",
    actionText: "Community Channels",
    href: "/channels",
    badge: "On-Chain",
    badgeVariant: "secondary" as const,
  },
]

const QUICK_LINKS = [
  { title: "Transparency & Canister IDs", href: "/transparency", icon: LockPasswordIcon, desc: "Verify on-chain Motoko wasm and live subnets" },
  { title: "icBucket Developer Docs", href: "/bucket/docs", icon: SourceCodeIcon, desc: "API methods, Python/TypeScript SDKs, and tutorials" },
  { title: "Frequently Asked Questions", href: "/faq", icon: HelpCircleIcon, desc: "Internet Identity, self-custody model, and gas fees" },
]

export function ContactView() {
  const [copiedEmail, setCopiedEmail] = useState(false)
  const [selectedTopic, setSelectedTopic] = useState("support")
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")
  const [name, setName] = useState("")
  const [copiedDraft, setCopiedDraft] = useState(false)

  const handleCopyEmail = async () => {
    await copyText(CONTACT_EMAIL)
    setCopiedEmail(true)
    toast.success("Successfully copied")
    setTimeout(() => setCopiedEmail(false), 2000)
  }

  const currentTopic = TOPICS.find((t) => t.id === selectedTopic) ?? TOPICS[0]
  const fullSubject = `${currentTopic.subjectPrefix} ${subject || "Inquiry"}`

  const generateMailto = () => {
    const bodyLines = [
      name ? `From: ${name}` : "",
      `Topic: ${currentTopic.label}`,
      "",
      message || "Hello ICPay team,\n\nI would like to inquire about...",
    ].filter(Boolean)

    const encodedSubject = encodeURIComponent(fullSubject)
    const encodedBody = encodeURIComponent(bodyLines.join("\n"))
    return `mailto:${CONTACT_EMAIL}?subject=${encodedSubject}&body=${encodedBody}`
  }

  const handleCopyDraft = async () => {
    const draftText = `To: ${CONTACT_EMAIL}\nSubject: ${fullSubject}\n\n${name ? `From: ${name}\n` : ""}Topic: ${currentTopic.label}\n\n${message || "Hello ICPay team,"}`
    await copyText(draftText)
    setCopiedDraft(true)
    toast.success("Successfully copied")
    setTimeout(() => setCopiedDraft(false), 2000)
  }

  return (
    <div className="space-y-12">
      <div className="text-center space-y-4 max-w-2xl mx-auto pt-4">
        <div className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-muted/40 px-3 py-1 text-xs font-medium text-foreground">
          <HugeiconsIcon icon={Mail01Icon} className="size-3.5 text-primary" strokeWidth={1.75} />
          <span>Official Communications</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
          Contact the ICPay Team
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
          Have a question about on-chain custodial wallets, icBucket storage quotas, developer APIs, or security disclosures? We are here to help.
        </p>

        <div className="pt-2 flex flex-wrap items-center justify-center gap-2">
          <div className="inline-flex items-center gap-2 rounded-xl border border-border/70 bg-card/70 px-3.5 py-2 shadow-xs backdrop-blur-xs">
            <span className="font-mono text-sm font-semibold text-foreground">{CONTACT_EMAIL}</span>
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={handleCopyEmail}
              aria-label="Copy email address"
              title={copiedEmail ? "Copied!" : "Copy email address"}
              className="size-7 rounded-lg text-muted-foreground hover:text-foreground"
            >
              {copiedEmail ? (
                <HugeiconsIcon icon={Tick02Icon} className="size-3.5 text-success" strokeWidth={1.75} />
              ) : (
                <HugeiconsIcon icon={Copy01Icon} className="size-3.5" strokeWidth={1.75} />
              )}
            </Button>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="inline-flex size-7 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              title="Open email client"
            >
              <HugeiconsIcon icon={LinkSquare02Icon} className="size-3.5" strokeWidth={1.75} />
            </a>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {CONTACT_CHANNELS.map((channel) => (
          <Card
            key={channel.title}
            className="relative overflow-hidden border border-border/70 bg-card/60 transition-all duration-200 hover:border-primary/40 hover:bg-card/90"
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between gap-2">
                <HugeiconsIcon icon={channel.icon} className="size-5 text-primary" strokeWidth={1.75} />
                <Badge variant={channel.badgeVariant} className="text-[10px] font-medium h-5">
                  {channel.badge}
                </Badge>
              </div>
              <CardTitle className="text-base font-semibold pt-2 text-foreground">{channel.title}</CardTitle>
              <CardDescription className="text-xs leading-relaxed text-muted-foreground">
                {channel.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              {channel.href ? (
                <Link
                  href={channel.href}
                  className={buttonVariants({ variant: "outline", size: "sm", className: "h-8 gap-1.5 text-xs" })}
                >
                  <span>{channel.actionText}</span>
                  <HugeiconsIcon icon={LinkSquare02Icon} className="size-3.5 opacity-70" strokeWidth={1.75} />
                </Link>
              ) : (
                <a
                  href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(channel.mailtoSubject || "Inquiry")}`}
                  className={buttonVariants({ variant: "outline", size: "sm", className: "h-8 gap-1.5 text-xs font-mono" })}
                >
                  <HugeiconsIcon icon={Mail01Icon} className="size-3.5" strokeWidth={1.75} />
                  <span>{channel.actionText}</span>
                </a>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border border-border/70 bg-card shadow-sm overflow-hidden">
        <CardHeader className="pb-4 border-b border-border/50">
          <div className="flex items-center gap-2.5">
            <HugeiconsIcon icon={SentIcon} className="size-5 text-primary shrink-0" strokeWidth={1.75} />
            <div>
              <CardTitle className="text-base font-semibold">Direct Email Composer</CardTitle>
              <CardDescription className="text-xs">
                Draft a message to get connected with the appropriate ICPay engineer or coordinator.
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4 sm:p-6 space-y-4">
          <FieldGroup className="gap-4">
            <Field className="gap-1.5">
              <FieldLabel className="text-xs font-medium text-foreground">Select Inquiring Topic</FieldLabel>
              <div className="flex flex-wrap gap-1.5">
                {TOPICS.map((topic) => (
                  <Button
                    key={topic.id}
                    type="button"
                    size="sm"
                    variant={selectedTopic === topic.id ? "default" : "outline"}
                    onClick={() => setSelectedTopic(topic.id)}
                    className="h-7 rounded-lg px-2.5 text-xs font-medium cursor-pointer"
                  >
                    {topic.label}
                  </Button>
                ))}
              </div>
            </Field>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <Field className="gap-1.5">
                <FieldLabel htmlFor="name-input" className="text-xs font-medium text-foreground">
                  Your Name / Handle (Optional)
                </FieldLabel>
                <Input
                  id="name-input"
                  placeholder="e.g. Satoshi or @alice"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-9 text-xs"
                />
              </Field>
              <Field className="gap-1.5">
                <FieldLabel htmlFor="subject-input" className="text-xs font-medium text-foreground">
                  Subject Line
                </FieldLabel>
                <Input
                  id="subject-input"
                  placeholder="Brief summary of your question"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="h-9 text-xs"
                />
              </Field>
            </div>

            <Field className="gap-1.5">
              <FieldLabel htmlFor="message-input" className="text-xs font-medium text-foreground">
                Message Details
              </FieldLabel>
              <Textarea
                id="message-input"
                rows={4}
                placeholder="Describe your question, project, or issue in detail..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="text-xs resize-y"
              />
            </Field>
          </FieldGroup>

          <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2 border-t border-border/50">
            <p className="text-[11px] text-muted-foreground font-mono">
              Destination: <span className="text-foreground">{CONTACT_EMAIL}</span>
            </p>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCopyDraft}
                className="h-8 gap-1.5 text-xs"
              >
                {copiedDraft ? (
                  <HugeiconsIcon icon={Tick02Icon} className="size-3.5 text-success" strokeWidth={1.75} />
                ) : (
                  <HugeiconsIcon icon={Copy01Icon} className="size-3.5" strokeWidth={1.75} />
                )}
                <span>{copiedDraft ? "Copied" : "Copy Draft"}</span>
              </Button>
              <a
                href={generateMailto()}
                className={buttonVariants({ variant: "default", size: "sm", className: "h-8 gap-1.5 text-xs" })}
              >
                <HugeiconsIcon icon={SentIcon} className="size-3.5" strokeWidth={1.75} />
                <span>Send via Email</span>
              </a>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3 pt-2">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Self-Service Resources & Verification
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {QUICK_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="group flex flex-col justify-between rounded-xl border border-border/60 bg-card/40 p-3.5 transition-all hover:border-primary/40 hover:bg-card/80"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <HugeiconsIcon icon={link.icon} className="size-4 text-primary shrink-0" strokeWidth={1.75} />
                  <span className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">
                    {link.title}
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-normal">{link.desc}</p>
              </div>
              <div className="pt-2 flex items-center gap-1 text-[10px] font-medium text-primary">
                <span>Explore</span>
                <HugeiconsIcon icon={LinkSquare02Icon} className="size-3" strokeWidth={1.75} />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
