import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { BlogAuthorMeta } from "@/components/blog/blog-author-meta"
import { blogArticleJsonLd, blogCanonical } from "@/lib/blog/seo"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Icon } from "@/components/ui/icon"
import { CircleCheckGlassIcon, CircleAlertGlassIcon, ArrowRightGlassIcon } from "@thesvg/ui-react"

const SLUG = "bypassing-vercel-cron-tax-decentralized-scheduler"
const TITLE = "Bypassing the Vercel $20/Month Cron Tax: How to Trigger Next.js Scheduled Jobs with Decentralized On-Chain Timers"
const DESCRIPTION =
  "A hands-on architectural guide to eliminating Vercel's $20/month per seat Pro plan requirement for sub-daily cron jobs. Discover how to trigger Next.js route handlers with sub-second precision, threshold-signed HTTPS outcalls, automated retries, and zero server maintenance using icCron on the Internet Computer for just $0.36/month."
const PUBLISHED_AT = "2026-11-12"
const READING_MINUTES = 14

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    "vercel cron pricing",
    "vercel $20 cron tax",
    "vercel free cron limit",
    "bypass vercel cron limit",
    "next.js scheduled jobs",
    "serverless cron scheduler",
    "decentralized cron",
    "iccron vs vercel cron",
    "https outcalls cron",
    "aws eventbridge nextjs alternative",
    "cheap cron job service",
    "nextjs background tasks",
  ],
  alternates: { canonical: blogCanonical(SLUG) },
  openGraph: {
    title: `${TITLE} — ICPay Blog`,
    description: DESCRIPTION,
    url: blogCanonical(SLUG),
    siteName: "ICPay",
    type: "article",
    publishedTime: `${PUBLISHED_AT}T00:00:00Z`,
    images: [
      {
        url: "/images/pages/iccron/developer-code.jpg",
        width: 1200,
        height: 630,
        alt: "Bypassing the Vercel Cron Tax with icCron",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/images/pages/iccron/developer-code.jpg"],
  },
}

const jsonLd = blogArticleJsonLd({
  slug: SLUG,
  title: TITLE,
  description: DESCRIPTION,
  publishedAt: PUBLISHED_AT,
  readingMinutes: READING_MINUTES,
})

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Why does Vercel charge $20/month for cron jobs?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "On Vercel's Hobby (Free) tier, scheduled cron expressions can only trigger once every 24 hours (e.g., 0 0 * * *). Any requirement for hourly, 15-minute, or 5-minute jobs forces teams to upgrade to Vercel Pro at $20/month per team member ($240/yr per seat minimum).",
      },
    },
    {
      "@type": "Question",
      name: "How does icCron bypass Vercel's cron limitation?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Instead of relying on Vercel's internal cron dispatcher, you configure your Next.js route as a standard protected HTTP POST handler (app/api/cron/route.ts) with a Bearer secret header. icCron then triggers this webhook via threshold-signed HTTPS outcalls on your desired schedule for just $0.0005 per run, costing only $0.36/month for hourly jobs.",
      },
    },
    {
      "@type": "Question",
      name: "Is it compliant with Vercel's Terms of Service?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Vercel allows standard incoming HTTPS requests from any external client or webhook provider to serverless route handlers within normal execution quota limits. icCron behaves like any authorized external webhook caller.",
      },
    },
  ],
}

export default function BypassingVercelCronTaxPage() {
  return (
    <article className="space-y-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <header className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider text-primary">
            Developer Engineering
          </span>
          <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
            Architecture Guide
          </span>
        </div>

        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl text-foreground">
          {TITLE}
        </h1>

        <p className="text-base text-muted-foreground leading-relaxed sm:text-lg">
          If you have ever built a Next.js application on Vercel, you have likely encountered the platform&apos;s most frustrating paywall: the <strong>once-per-24-hours cron limit</strong> on the Hobby tier. Here is how decentralized on-chain timers solve this for pennies per year.
        </p>

        <BlogAuthorMeta
          publishedAt={PUBLISHED_AT}
          readingMinutes={READING_MINUTES}
          title={TITLE}
          slug={SLUG}
        />
      </header>

      <div className="relative aspect-16/9 w-full overflow-hidden rounded-3xl border border-border">
        <Image
          src="/images/pages/iccron/developer-code.jpg"
          alt="Bypassing Vercel Cron Tax"
          fill
          priority
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
        <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between">
          <Badge variant="secondary" className="bg-background/80 backdrop-blur-md text-xs font-mono font-bold text-primary">
            98.2% Annual Cost Reduction
          </Badge>
          <span className="text-xs text-muted-foreground font-semibold">
            Next.js + icCron
          </span>
        </div>
      </div>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          The Problem: The Vercel Pro Paywall
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Vercel is undeniably one of the smoothest deployment experiences for modern React and Next.js applications. However, their pricing strategy heavily monetizes scheduled execution:
        </p>

        <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-5 space-y-2">
          <div className="flex items-center gap-2 text-destructive font-semibold text-sm">
            <Icon icon={CircleAlertGlassIcon} className="size-4 shrink-0" />
            Vercel Hobby Plan Cron Restriction
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            On the Hobby plan, your <code className="font-mono text-xs">vercel.json</code> crons are hard-capped to a maximum frequency of <strong>once per 24 hours</strong>. Attempting to schedule <code className="font-mono text-xs">0 * * * *</code> (hourly) will fail during deployment with an error demanding an upgrade to Vercel Pro.
          </p>
        </div>

        <p className="text-sm leading-relaxed text-muted-foreground">
          Vercel Pro costs <strong>$20/month per user</strong> ($240/yr minimum, scaling to $1,200/yr for a team of 5). For independent developers, side projects, and early-stage startups that simply need to sync Stripe invoices or refresh a database cache once an hour, paying $240/year for 8,760 HTTP triggers is economically absurd.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          The Traditional Workarounds and Why They Fail
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Developers have historically attempted several brittle workarounds to avoid this charge:
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          <Card className="rounded-2xl border border-border bg-card p-5 space-y-2">
            <p className="font-bold text-foreground text-sm">AWS EventBridge + Lambda</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Requires provisioning IAM execution roles, CloudWatch schedules, API Gateway configurations, and setting up Dead Letter Queues in Amazon SQS. The configuration sprawl often takes hours to maintain.
            </p>
          </Card>

          <Card className="rounded-2xl border border-border bg-card p-5 space-y-2">
            <p className="font-bold text-foreground text-sm">GitHub Actions Cron Schedules</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              GitHub Actions offers scheduled workflows (<code className="font-mono text-xs">on: schedule</code>), but during peak load hours, workflow triggers can be delayed by 45 to 90 minutes or dropped completely without notice.
            </p>
          </Card>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          The Solution: Autonomous Decentralized Schedulers
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Enter <strong>icCron</strong>. Built natively on the Internet Computer blockchain, icCron replaces centralized cron services with replicated, autonomous canister timers.
        </p>

        <div className="grid gap-4 sm:grid-cols-3 pt-2">
          <div className="rounded-2xl border border-border bg-card p-4 space-y-1">
            <p className="text-xs text-muted-foreground font-semibold">Vercel Pro (1 seat)</p>
            <p className="font-mono text-2xl font-black text-muted-foreground line-through">$240.00</p>
            <p className="text-[11px] text-muted-foreground">per year</p>
          </div>

          <div className="rounded-2xl border border-primary/30 bg-primary/5 p-4 space-y-1">
            <p className="text-xs text-primary font-semibold">icCron (Hourly)</p>
            <p className="font-mono text-2xl font-black text-foreground">$4.32</p>
            <p className="text-[11px] text-muted-foreground">8,760 runs × $0.0005</p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-4 space-y-1">
            <p className="text-xs text-primary font-semibold">Net Annual Savings</p>
            <p className="font-mono text-2xl font-black text-primary">$235.68</p>
            <p className="text-[11px] text-muted-foreground">98.2% cheaper</p>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          Step-by-Step Implementation Guide
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Here is how to set up an hourly cron trigger in your Next.js project using icCron in 3 easy steps:
        </p>

        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="flex size-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                1
              </span>
              <h3 className="text-base font-bold text-foreground">
                Create a Protected Route Handler in Next.js
              </h3>
            </div>
            <p className="text-xs text-muted-foreground">
              Define a secure API route at <code className="font-mono text-xs">app/api/cron/route.ts</code> that validates an incoming bearer authorization token:
            </p>
            <div className="rounded-2xl border border-border bg-card p-4 font-mono text-xs text-muted-foreground overflow-x-auto">
{`import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  
  if (authHeader !== \`Bearer \${process.env.CRON_SECRET}\`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Perform your background task
    await syncDatabaseRecords();
    return NextResponse.json({ ok: true, timestamp: Date.now() });
  } catch (error) {
    console.error("Scheduled job failed:", error);
    return NextResponse.json({ error: "Job failed" }, { status: 500 });
  }
}`}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="flex size-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                2
              </span>
              <h3 className="text-base font-bold text-foreground">
                Set Environment Variable in Vercel
              </h3>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Generate a high-entropy secret string and add it to your Vercel Project Settings under <strong>Environment Variables</strong> as <code className="font-mono text-xs">CRON_SECRET</code>.
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="flex size-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                3
              </span>
              <h3 className="text-base font-bold text-foreground">
                Register Job in icCron
              </h3>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Sign in to the icCron dashboard with Internet Identity (or use the cURL API). Specify your webhook URL, target expression <code className="font-mono text-xs">0 * * * *</code>, and add the secret header:
            </p>
            <div className="rounded-2xl border border-border bg-card p-4 font-mono text-xs text-muted-foreground overflow-x-auto">
{`curl -X POST "https://w2fxo-5qaaa-aaaan-q6zxq-cai.raw.icp0.io/api/v1/jobs" \\
  -H "Authorization: Bearer <your_iccron_key>" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Next.js Hourly Sync",
    "schedule": "0 * * * *",
    "target": {
      "type": "Webhook",
      "url": "https://my-app.vercel.app/api/cron",
      "method": "POST",
      "headers": {
        "Authorization": "Bearer <your_CRON_SECRET>"
      }
    }
  }'`}
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          Summary & Key Takeaways
        </h2>
        <ul className="space-y-2 text-sm text-muted-foreground pl-2">
          <li className="flex items-center gap-2">
            <Icon icon={CircleCheckGlassIcon} className="size-4 text-primary shrink-0" />
            <span>Eliminates the $240/yr Vercel Pro requirement for sub-daily cron jobs.</span>
          </li>
          <li className="flex items-center gap-2">
            <Icon icon={CircleCheckGlassIcon} className="size-4 text-primary shrink-0" />
            <span>Consensus-backed 1-second precision with zero cold starts or cron delays.</span>
          </li>
          <li className="flex items-center gap-2">
            <Icon icon={CircleCheckGlassIcon} className="size-4 text-primary shrink-0" />
            <span>60 free executions every month with simple $0.0005/run prepaid credits.</span>
          </li>
        </ul>
      </section>

      <section className="rounded-3xl border border-primary/20 bg-primary/5 p-6 sm:p-8 space-y-4">
        <h3 className="text-xl font-bold text-foreground">
          Ready to Automate Your Next.js Jobs?
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Set up your first scheduled webhook in under 30 seconds with icCron. 60 free runs included every month.
        </p>
        <div className="pt-2">
          <Button
            size="default"
            className="rounded-xl font-semibold gap-2"
            nativeButton={false}
            render={<Link href="/iccron" />}
          >
            Launch icCron Scheduler
            <Icon icon={ArrowRightGlassIcon} className="size-4" />
          </Button>
        </div>
      </section>
    </article>
  )
}
