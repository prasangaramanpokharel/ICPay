"use client"

import { useState } from "react"
import Link from "next/link"
import {
  Mail,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  Headphones,
  Sparkles,
  Send,
  MessageSquare,
  HelpCircle,
  FileCode2,
  Lock,
} from "lucide-react"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
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
    icon: Headphones,
    title: "General & Technical Support",
    description: "Account help, custodial wallet inquiries, transaction verification, or feature questions.",
    actionText: "contact@icpay.cloud",
    mailtoSubject: "[Support] Inquiry",
    badge: "24h Response",
    badgeVariant: "secondary" as const,
  },
  {
    icon: Sparkles,
    title: "icBucket Cloud Storage",
    description: "Assistance with custom capacity tiers, edge CDN reverse proxies, API keys, or SDK integrations.",
    actionText: "contact@icpay.cloud",
    mailtoSubject: "[icBucket] Storage Inquiry",
    badge: "Developer Support",
    badgeVariant: "outline" as const,
  },
  {
    icon: ShieldCheck,
    title: "Security & Vulnerability Disclosure",
    description: "Responsible vulnerability disclosures, smart contract audit feedback, and infrastructure issues.",
    actionText: "contact@icpay.cloud",
    mailtoSubject: "[SECURITY] Responsible Disclosure",
    badge: "High Priority",
    badgeVariant: "destructive" as const,
  },
  {
    icon: MessageSquare,
    title: "Community & Ecosystem",
    description: "Join community discussions, propose token listings, or follow official engineering announcements.",
    actionText: "Community Channels",
    href: "/channels",
    badge: "On-Chain",
    badgeVariant: "secondary" as const,
  },
]

const QUICK_LINKS = [
  { title: "Transparency & Canister IDs", href: "/transparency", icon: Lock, desc: "Verify on-chain Motoko wasm and live subnets" },
  { title: "icBucket Developer Docs", href: "/bucket/docs", icon: FileCode2, desc: "API methods, Python/TypeScript SDKs, and tutorials" },
  { title: "Frequently Asked Questions", href: "/faq", icon: HelpCircle, desc: "Internet Identity, self-custody model, and gas fees" },
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
    toast.success("Email address copied to clipboard!")
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
    toast.success("Draft message copied to clipboard!")
    setTimeout(() => setCopiedDraft(false), 2000)
  }

  return (
    <div className="space-y-12">
      {/* Hero Header */}
      <div className="text-center space-y-4 max-w-2xl mx-auto pt-4">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          <Mail className="size-3.5" />
          <span>Official Communications</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
          Contact the ICPay Team
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
          Have a question about on-chain custodial wallets, icBucket storage quotas, developer APIs, or security disclosures? We are here to help.
        </p>

        {/* Highlighted Email Badge */}
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
              {copiedEmail ? <Check className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}
            </Button>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="inline-flex size-7 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              title="Open email client"
            >
              <ExternalLink className="size-3.5" />
            </a>
          </div>
        </div>
      </div>

      {/* 4 Primary Channels Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {CONTACT_CHANNELS.map((channel) => {
          const Icon = channel.icon
          return (
            <Card
              key={channel.title}
              className="relative overflow-hidden border border-border/70 bg-card/60 transition-all duration-200 hover:border-primary/40 hover:bg-card/90"
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20">
                    <Icon className="size-4.5" />
                  </div>
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
                    <ExternalLink className="size-3 opacity-70" />
                  </Link>
                ) : (
                  <a
                    href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(channel.mailtoSubject || "Inquiry")}`}
                    className={buttonVariants({ variant: "outline", size: "sm", className: "h-8 gap-1.5 text-xs font-mono" })}
                  >
                    <Mail className="size-3" />
                    <span>{channel.actionText}</span>
                  </a>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Interactive Message Composer */}
      <Card className="border border-border/70 bg-gradient-to-b from-card/90 to-card/50 shadow-sm overflow-hidden">
        <CardHeader className="pb-4 border-b border-border/50">
          <div className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Send className="size-3.5" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold">Direct Email Composer</CardTitle>
              <CardDescription className="text-xs">
                Draft a message to get connected with the appropriate ICPay engineer or coordinator.
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4 sm:p-6 space-y-4">
          {/* Topic Selectors */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">Select Inquiring Topic</label>
            <div className="flex flex-wrap gap-1.5">
              {TOPICS.map((topic) => (
                <button
                  key={topic.id}
                  type="button"
                  onClick={() => setSelectedTopic(topic.id)}
                  className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-all cursor-pointer border ${
                    selectedTopic === topic.id
                      ? "bg-primary text-primary-foreground border-primary shadow-xs"
                      : "bg-muted/50 text-muted-foreground border-border/60 hover:bg-muted hover:text-foreground"
                  }`}
                >
                  {topic.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="space-y-1.5">
              <label htmlFor="name-input" className="text-xs font-medium text-foreground">Your Name / Handle (Optional)</label>
              <Input
                id="name-input"
                placeholder="e.g. Satoshi or @alice"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-9 text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="subject-input" className="text-xs font-medium text-foreground">Subject Line</label>
              <Input
                id="subject-input"
                placeholder="Brief summary of your question"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="h-9 text-xs"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="message-input" className="text-xs font-medium text-foreground">Message Details</label>
            <Textarea
              id="message-input"
              rows={4}
              placeholder="Describe your question, project, or issue in detail..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="text-xs resize-y"
            />
          </div>

          {/* Actions */}
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
                {copiedDraft ? <Check className="size-3 text-emerald-500" /> : <Copy className="size-3" />}
                <span>{copiedDraft ? "Copied" : "Copy Draft"}</span>
              </Button>
              <a
                href={generateMailto()}
                className={buttonVariants({ variant: "default", size: "sm", className: "h-8 gap-1.5 text-xs" })}
              >
                <Send className="size-3" />
                <span>Send via Email</span>
              </a>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Help / Self-service Shortcuts */}
      <div className="space-y-3 pt-2">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Self-Service Resources & Verification
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {QUICK_LINKS.map((link) => {
            const Icon = link.icon
            return (
              <Link
                key={link.href}
                href={link.href}
                className="group flex flex-col justify-between rounded-xl border border-border/60 bg-card/40 p-3.5 transition-all hover:border-primary/40 hover:bg-card/80"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Icon className="size-4 text-primary shrink-0" />
                    <span className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">
                      {link.title}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-normal">{link.desc}</p>
                </div>
                <div className="pt-2 flex items-center gap-1 text-[10px] font-medium text-primary">
                  <span>Explore</span>
                  <ExternalLink className="size-2.5" />
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
