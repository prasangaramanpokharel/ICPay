"use client"

import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion"

const FAQS = [
  {
    q: "How is icCron different from Linux cron or node-cron on a VPS?",
    a: "Linux cron and node-cron run on a single host. If that machine runs out of memory, reboots for a kernel update, or experiences a network partition, jobs fail silently. icCron runs as a replicated state machine on the Internet Computer blockchain across independent node providers worldwide, providing 100% uptime with zero server maintenance.",
  },
  {
    q: "Can icCron make HTTPS requests to any public endpoint on the web?",
    a: "Yes. Using Internet Computer HTTPS outcalls, icCron reaches any publicly addressable URL (Vercel, AWS, Cloudflare, Supabase, Fly.io, or private APIs). The HTTP requests are cryptographically threshold-signed by subnet consensus. For local development, use tools like ngrok or Cloudflare Tunnels.",
  },
  {
    q: "What happens if my target endpoint is down or returns a 500 error?",
    a: "icCron features configurable exponential backoff retries. If the target endpoint fails repeatedly beyond the configured maximum retry count, the job is transitioned to a Dead Letter Queue (DLQ) with status TargetUnavailable or AutoPausedDormant. You receive full response latency and status code logs so you never waste credits indefinitely on broken targets.",
  },
  {
    q: "Do I need to hold cryptocurrency or ICP tokens to use icCron?",
    a: "No. Every user receives 60 free execution runs every month simply by signing in with Internet Identity. For higher volume, you can purchase prepaid credit packs using ICP or standard payment methods right within the ICPay dashboard.",
  },
  {
    q: "How accurate is the execution timing?",
    a: "icCron leverages native Internet Computer Canister Timers with 64-bit nanosecond scheduling. Unlike AWS Lambda cold starts or serverless cron jobs that experience unpredictable wake-up drift of minutes, icCron ticks with deterministic 1-second consensus precision.",
  },
  {
    q: "How does my backend verify that an incoming webhook was really sent by icCron?",
    a: "You can configure custom secret headers (such as Authorization: Bearer <your_secret>) when creating your job. Additionally, icCron outbound requests carry the authentic canister principal caller identity, enabling verifiable trustless authentication.",
  },
]

export function FaqSection() {
  return (
    <section className="border-b border-border/60 bg-background py-16 md:py-24">
      <div className="mx-auto max-w-4xl px-4 md:px-6">
        <div className="max-w-3xl space-y-2">
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-foreground">
            Frequently asked questions
          </h2>
          <p className="text-base text-muted-foreground leading-relaxed">
            Technical answers regarding consensus precision, HTTPS outcalls, failure handling, and developer economics.
          </p>
        </div>

        <div className="mt-12">
          <Accordion defaultValue={["item-0"]} className="rounded-2xl border border-border/80 bg-card/60">
            {FAQS.map((faq, idx) => (
              <AccordionItem key={idx} value={`item-${idx}`}>
                <AccordionTrigger className="text-sm font-bold text-foreground hover:no-underline">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-xs leading-relaxed text-muted-foreground">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  )
}
