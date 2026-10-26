import Link from "next/link"

const HUB_CARDS = [
  {
    href: "/bucket/docs/overview/introduction",
    title: "Introduction",
    description: "Decentralized on-chain storage, architecture, and comparison with AWS S3 & IPFS.",
  },
  {
    href: "/bucket/docs/overview/quick-start",
    title: "Quick Start",
    description: "Install icpay-bucket and upload your first decentralized file in under 5 minutes.",
  },
  {
    href: "/bucket/docs/overview/installation",
    title: "Installation & CLI",
    description: "Ecosystem package managers (npm, pip, cargo, go) and developer CLI installer.",
  },
  {
    href: "/bucket/docs/guides/configuration",
    title: "Configuration",
    description: "Client options, environment variables, timeout parameters, and Edge CDN routing.",
  },
  {
    href: "/bucket/docs/guides/basic-usage",
    title: "Basic Usage",
    description: "File uploads, chunking, folder listings, pagination, and deletion.",
  },
  {
    href: "/bucket/docs/api/endpoints",
    title: "API Endpoints",
    description: "Comprehensive REST endpoints and Canister RPC actor methods with interactive examples.",
  },
  {
    href: "/bucket/docs/errors/error-handling",
    title: "Error Handling",
    description: "Status codes, retry mechanisms, exponential backoff, and network error resolution.",
  },
  {
    href: "/bucket/docs/faq",
    title: "Frequently Asked Questions",
    description: "Pricing, cycles billing, file durability, security, and custom domains.",
  },
] as const

export function DocHubCards() {
  return (
    <div className="my-8 grid gap-4 sm:grid-cols-2">
      {HUB_CARDS.map((item) => (
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
