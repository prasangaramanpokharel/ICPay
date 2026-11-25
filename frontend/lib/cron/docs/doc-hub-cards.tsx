import Link from "next/link"

const CRON_HUB_CARDS = [
  {
    href: "/cron/docs/overview/introduction",
    title: "Introduction",
    description: "Decentralized on-chain cron scheduler, sub-second timers, and comparison with AWS EventBridge & Vercel.",
  },
  {
    href: "/cron/docs/overview/quick-start",
    title: "Quick Start",
    description: "Create an API key, schedule your first hourly webhook, and verify execution in under 60 seconds.",
  },
  {
    href: "/cron/docs/overview/installation",
    title: "Installation",
    description: "Official SDK packages for npm (TypeScript), pip (Python), Go, cargo (Rust), and composer (PHP).",
  },
  {
    href: "/cron/docs/guides/integration",
    title: "Multi-Language Integration",
    description: "Side-by-side runnable code examples across all 5 programming languages with interactive tabs.",
  },
  {
    href: "/cron/docs/guides/cron-expressions",
    title: "Cron Expression Syntax",
    description: "Standard 5-field syntax, step intervals, day-of-week rules, and O(1) in-memory bitmask compilation.",
  },
  {
    href: "/cron/docs/guides/authentication",
    title: "API Keys & Authentication",
    description: "SHA-256 hashed API keys, project isolation, and Internet Identity principal access controls.",
  },
  {
    href: "/cron/docs/api/endpoints",
    title: "REST API Reference",
    description: "Complete HTTP endpoints for creating, listing, pausing, resuming, triggering, and inspecting jobs.",
  },
  {
    href: "/cron/docs/api/consensus",
    title: "Outcall Consensus Rules",
    description: "Subnet threshold signatures, deterministic response bodies, and transform_http_response mechanics.",
  },
  {
    href: "/cron/docs/errors/troubleshooting",
    title: "Errors & Dead Letter Queue",
    description: "Exponential retries, circuit breakers, AutoPausedDormant states, and consensus mismatch debugging.",
  },
  {
    href: "/cron/docs/faq",
    title: "Frequently Asked Questions",
    description: "Technical answers on pricing ($0.0005/run), free tier, precision, security, and local development.",
  },
] as const

export function CronDocHubCards() {
  return (
    <div className="my-8 grid gap-4 sm:grid-cols-2">
      {CRON_HUB_CARDS.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="group flex flex-col rounded-xl border border-border/60 bg-card p-5 transition-colors hover:border-primary/40 hover:bg-muted/20"
        >
          <h3 className="font-semibold text-foreground group-hover:text-primary">{item.title}</h3>
          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
        </Link>
      ))}
    </div>
  )
}
