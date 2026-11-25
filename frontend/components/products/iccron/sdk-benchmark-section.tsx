import Image from "next/image"
import { Badge } from "@/components/ui/badge"
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
  isFastestWarm?: boolean
}

const BENCHMARK_ROWS: SdkBenchmarkRow[] = [
  {
    sdk: "npm (Node.js)",
    runtime: "icpay-cron",
    iconUrl: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nodejs/nodejs-original.svg",
    call1: "1010.9 ms",
    call2: "243.6 ms",
    call3: "254.2 ms",
    average: "502.9 ms",
    warmest: "243.6 ms",
    transport: "fetch (keep-alive)",
  },
  {
    sdk: "Rust",
    runtime: "icpay-cron",
    iconUrl: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/rust/rust-original.svg",
    invertInDark: true,
    call1: "1195.6 ms",
    call2: "322.3 ms",
    call3: "229.2 ms",
    average: "582.4 ms",
    warmest: "229.2 ms",
    transport: "reqwest::Client (pooled)",
  },
  {
    sdk: "Go",
    runtime: "icpay-cron-go",
    iconUrl: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/go/go-original.svg",
    call1: "1122.2 ms",
    call2: "512.1 ms",
    call3: "161.4 ms",
    average: "598.6 ms",
    warmest: "161.4 ms",
    transport: "http.Client (pooled)",
    isFastestWarm: true,
  },
  {
    sdk: "PHP",
    runtime: "icpay/cron",
    iconUrl: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/php/php-original.svg",
    call1: "600.2 ms",
    call2: "788.8 ms",
    call3: "499.7 ms",
    average: "629.6 ms",
    warmest: "499.7 ms",
    transport: "curl_init per request",
  },
  {
    sdk: "Python",
    runtime: "icpay-cron",
    iconUrl: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/python/python-original.svg",
    call1: "1333.4 ms",
    call2: "1223.2 ms",
    call3: "782.8 ms",
    average: "1113.1 ms",
    warmest: "782.8 ms",
    transport: "urllib.request (new socket)",
  },
]

export function SdkBenchmarkSection() {
  return (
    <section className="border-b border-border/60 bg-background py-14 md:py-20">
      <div className="mx-auto max-w-7xl px-4 md:px-6 space-y-8">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary">
              Live Mainnet SDK Benchmarks
            </Badge>
            <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Official SDK Performance Across 5 Languages
            </h2>
            <p className="max-w-2xl text-sm text-muted-foreground">
              Measured against <span className="font-mono text-foreground">w2fxo-5qaaa-aaaan-q6zxq-cai.raw.icp0.io</span> across 3 sequential{" "}
              <span className="font-mono text-foreground">listJobs</span> query calls per SDK with zero cycle burn.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="font-mono text-xs">
              0 Cycles / Query
            </Badge>
            <Badge variant="secondary" className="font-mono text-xs">
              Warmest: 161.4 ms
            </Badge>
          </div>
        </div>

        <Card className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm">
          <CardContent className="p-0">
            <div className="w-full overflow-x-auto">
              <Table className="w-full min-w-[860px]">
                <TableHeader>
                  <TableRow className="border-b border-border/70 bg-muted/40 hover:bg-muted/40">
                    <TableHead className="w-60 min-w-[220px] py-4 pl-6 pr-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      SDK &amp; Runtime
                    </TableHead>
                    <TableHead className="w-28 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Call 1 (Cold)
                    </TableHead>
                    <TableHead className="w-28 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Call 2 (Warm)
                    </TableHead>
                    <TableHead className="w-28 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Call 3 (Warm)
                    </TableHead>
                    <TableHead className="w-28 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Average
                    </TableHead>
                    <TableHead className="w-28 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Warmest
                    </TableHead>
                    <TableHead className="min-w-[190px] py-4 pl-4 pr-6 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Transport Mechanism
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {BENCHMARK_ROWS.map((row) => (
                    <TableRow
                      key={row.sdk}
                      className="border-b border-border/50 transition-colors hover:bg-muted/30 last:border-b-0"
                    >
                      <TableCell className="py-4 pl-6 pr-4">
                        <div className="flex items-center gap-3">
                          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border/70 bg-background p-1.5 shadow-2xs">
                            <Image
                              src={row.iconUrl}
                              alt={row.sdk}
                              width={20}
                              height={20}
                              unoptimized
                              className={row.invertInDark ? "size-5 object-contain dark:invert" : "size-5 object-contain"}
                              style={{ width: "auto", height: "auto" }}
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold leading-tight text-foreground">{row.sdk}</p>
                            <p className="font-mono text-[11px] text-muted-foreground">{row.runtime}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="w-28 text-center font-mono text-xs text-muted-foreground">
                        {row.call1}
                      </TableCell>
                      <TableCell className="w-28 text-center font-mono text-xs text-muted-foreground">
                        {row.call2}
                      </TableCell>
                      <TableCell className="w-28 text-center font-mono text-xs text-muted-foreground">
                        {row.call3}
                      </TableCell>
                      <TableCell className="w-28 text-center font-mono text-xs font-bold text-foreground">
                        {row.average}
                      </TableCell>
                      <TableCell className="w-28 text-center font-mono text-xs">
                        {row.isFastestWarm ? (
                          <span className="inline-flex items-center rounded-full border border-success/30 bg-success/15 px-2.5 py-0.5 font-mono text-xs font-semibold text-success shadow-2xs">
                            {row.warmest}
                          </span>
                        ) : (
                          <span className="text-foreground/90 font-medium">{row.warmest}</span>
                        )}
                      </TableCell>
                      <TableCell className="py-4 pl-4 pr-6 text-right font-mono text-xs text-muted-foreground">
                        {row.transport}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
