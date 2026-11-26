import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface SdkBenchmarkRow {
  sdk: string
  runtime: string
  iconUrl: string
  invertInDark?: boolean
  call1: string
  call2: string
  call3: string
  average: string
  warmest: string
  transport: string
}

const BENCHMARK_ROWS: SdkBenchmarkRow[] = [
  {
    sdk: "npm (Node.js)",
    runtime: "icpay-cron",
    iconUrl: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nodejs/nodejs-original.svg",
    call1: "1,010.9",
    call2: "243.6",
    call3: "254.2",
    average: "502.9",
    warmest: "243.6",
    transport: "fetch (keep-alive)",
  },
  {
    sdk: "Rust",
    runtime: "icpay-cron",
    iconUrl: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/rust/rust-original.svg",
    invertInDark: true,
    call1: "1,195.6",
    call2: "322.3",
    call3: "229.2",
    average: "582.4",
    warmest: "229.2",
    transport: "reqwest::Client (pooled)",
  },
  {
    sdk: "Go",
    runtime: "icpay-cron-go",
    iconUrl: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/go/go-original.svg",
    call1: "1,122.2",
    call2: "512.1",
    call3: "161.4",
    average: "598.6",
    warmest: "161.4",
    transport: "http.Client (pooled)",
  },
  {
    sdk: "PHP",
    runtime: "icpay/cron",
    iconUrl: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/php/php-original.svg",
    call1: "600.2",
    call2: "788.8",
    call3: "499.7",
    average: "629.6",
    warmest: "499.7",
    transport: "curl_init per request",
  },
  {
    sdk: "Python",
    runtime: "icpay-cron",
    iconUrl: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/python/python-original.svg",
    call1: "1,333.4",
    call2: "1,223.2",
    call3: "782.8",
    average: "1,113.1",
    warmest: "782.8",
    transport: "urllib.request (new socket)",
  },
]

export function SdkBenchmarkSection() {
  return (
    <section className="border-b border-border/60 bg-background py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="max-w-3xl space-y-2">
          <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            SDK query latency
          </h2>
          <p className="text-base text-muted-foreground leading-relaxed">
            Three listJobs query calls per SDK, measured from US East on November 2026.
          </p>
        </div>

        <div className="mt-8">
          <Card className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm">
            <CardContent className="p-0">
              <div className="w-full overflow-x-auto">
                <Table className="w-full min-w-[760px]">
                  <TableHeader>
                    <TableRow className="border-b border-border/70 bg-muted/40 hover:bg-muted/40">
                      <TableHead className="py-3.5 pl-6 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        SDK
                      </TableHead>
                      <TableHead className="text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Transport
                      </TableHead>
                      <TableHead className="text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground tabular-nums">
                        Call 1 (ms)
                      </TableHead>
                      <TableHead className="text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground tabular-nums">
                        Call 2 (ms)
                      </TableHead>
                      <TableHead className="text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground tabular-nums">
                        Call 3 (ms)
                      </TableHead>
                      <TableHead className="text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground tabular-nums">
                        Average (ms)
                      </TableHead>
                      <TableHead className="pr-6 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground tabular-nums">
                        Warmest (ms)
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {BENCHMARK_ROWS.map((row) => (
                      <TableRow
                        key={row.sdk}
                        className="border-b border-border/50 transition-colors hover:bg-muted/30 last:border-b-0"
                      >
                        <TableCell className="py-3.5 pl-6">
                          <div className="flex items-center gap-3">
                            <div className="flex size-7 shrink-0 items-center justify-center rounded-md border border-border/70 bg-background p-1">
                              <Image
                                src={row.iconUrl}
                                alt={row.sdk}
                                width={16}
                                height={16}
                                unoptimized
                                className={row.invertInDark ? "size-4 object-contain dark:invert" : "size-4 object-contain"}
                              />
                            </div>
                            <span className="text-xs font-semibold text-foreground">
                              {row.sdk}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs font-mono text-muted-foreground">
                          {row.transport}
                        </TableCell>
                        <TableCell className="text-right font-mono text-xs tabular-nums text-muted-foreground">
                          {row.call1}
                        </TableCell>
                        <TableCell className="text-right font-mono text-xs tabular-nums text-muted-foreground">
                          {row.call2}
                        </TableCell>
                        <TableCell className="text-right font-mono text-xs tabular-nums text-muted-foreground">
                          {row.call3}
                        </TableCell>
                        <TableCell className="text-right font-mono text-xs font-semibold tabular-nums text-foreground">
                          {row.average}
                        </TableCell>
                        <TableCell className="pr-6 text-right font-mono text-xs font-semibold tabular-nums text-foreground">
                          {row.warmest}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
