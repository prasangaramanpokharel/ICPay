"use client"

import Link from "next/link"
import { useTranslations } from "next-intl"
import {
  Book02Icon,
  Key01Icon,
  Plug01Icon,
  TerminalIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { BucketCodeBlock } from "@/components/bucket/bucket-code-block"
import { WALLET_CANISTER_ID } from "@/services/icp"
import type { BucketStats } from "@/services/bucket/types"

export function BucketConnectModal({
  bucketId,
  stats,
  open,
  onOpenChange,
  onOpenApiKeys,
}: {
  bucketId: string
  stats?: BucketStats | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onOpenApiKeys?: () => void
}) {
  const tc = useTranslations("common")

  const bucketName = stats?.name || bucketId
  const isPublic = Boolean(stats?.visibility && "open" in stats.visibility)

  const nodeInstall = "npm i icpay-bucket"
  const pythonInstall = "pip install icpay-bucket ic-py"

  const nodeCode = `import { BucketClient } from "icpay-bucket";

// 1. Initialize client with your API key
const client = new BucketClient({
  apiKey: process.env.IC_API_KEY || "YOUR_API_KEY", // e.g. icp_cloud_...
});

// 2. Upload file to your bucket
const upload = await client.uploadFile({
  bucketId: "${bucketName}",
  path: "/uploads/hello.txt",
  data: new TextEncoder().encode("Hello from ICPay Cloud!"),
  contentType: "text/plain",
});
console.log("Upload result:", upload);

// 3. List files in your bucket
const files = await client.listFiles("${bucketName}", 0, 20);
console.log("Files:", files);

// 4. Download file bytes
const fileBytes = await client.downloadFile("${bucketName}", "/uploads/hello.txt");`

  const pythonCode = `import os
from icpay_bucket import BucketClient

# 1. Initialize client with your API key
client = BucketClient(api_key=os.environ.get("IC_API_KEY", "YOUR_API_KEY"))

# 2. Upload file to your bucket
res = client.upload_file(
    bucket_id="${bucketName}",
    path="/uploads/hello.txt",
    data=b"Hello from ICPay Cloud on Internet Computer!",
    content_type="text/plain",
)
print("Upload result:", res)

# 3. List files in bucket
files = client.list_files("${bucketName}", page=0, page_size=20)
print("Files:", files)

# 4. Download file bytes
content = client.download_file("${bucketName}", "/uploads/hello.txt")`

  const envCode = `# ICPay Cloud Storage Configuration
IC_CANISTER_ID="${WALLET_CANISTER_ID}"
IC_BUCKET_ID="${bucketId}"
IC_BUCKET_NAME="${bucketName}"
IC_API_KEY="YOUR_API_KEY" # Generate in API Keys (e.g. icp_cloud_...)
IC_HOST="https://icp0.io"
IC_CDN_URL="https://cloud.icpay.app"`

  const curlCode = `# 1. Download / View file directly from global CDN
curl -O "https://cloud.icpay.app/${bucketName}/uploads/hello.txt"

# 2. Direct on-chain Canister gateway download
curl -O "https://${WALLET_CANISTER_ID}.raw.icp0.io/cloud/${bucketName}/uploads/hello.txt"`

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] w-full max-w-[calc(100vw-2rem)] sm:max-w-2xl overflow-y-auto overflow-x-hidden p-5 sm:p-6 min-w-0">
        <DialogHeader className="gap-2 min-w-0 w-full">
          <div className="flex items-center gap-2 min-w-0">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <HugeiconsIcon icon={Plug01Icon} className="size-4.5" strokeWidth={1.75} />
            </span>
            <DialogTitle className="text-lg truncate">Connect to your bucket</DialogTitle>
          </div>
          <DialogDescription className="text-xs">
            Minimal, production-ready code snippets and credentials to integrate this bucket into
            your application or backend services.
          </DialogDescription>

          {/* Quick Context Bar */}
          <div className="mt-1 flex flex-wrap items-center gap-2 rounded-xl border border-border/60 bg-muted/30 px-3 py-2 text-xs min-w-0 w-full">
            <span className="text-muted-foreground">Bucket:</span>
            <span className="font-mono font-semibold text-foreground">{bucketName}</span>
            <span className="text-border">·</span>
            <Badge variant={isPublic ? "default" : "secondary"} className="text-[10px]">
              {isPublic ? "Public (CDN Enabled)" : "Private (Owner Only)"}
            </Badge>
            <span className="text-border">·</span>
            <span className="text-muted-foreground">Canister:</span>
            <span className="font-mono text-muted-foreground">{WALLET_CANISTER_ID.slice(0, 8)}…</span>
          </div>
        </DialogHeader>

        <div className="space-y-4 pt-1 min-w-0 w-full">
          <Tabs defaultValue="node" className="w-full min-w-0">
            <TabsList className="grid w-full grid-cols-4 min-w-0">
              <TabsTrigger value="node" className="text-xs truncate">Node (NPM)</TabsTrigger>
              <TabsTrigger value="python" className="text-xs truncate">Python (PIP)</TabsTrigger>
              <TabsTrigger value="curl" className="text-xs truncate">cURL</TabsTrigger>
              <TabsTrigger value="env" className="text-xs truncate">.env</TabsTrigger>
            </TabsList>

            {/* TAB 1: Node.js (icpay-bucket) */}
            <TabsContent value="node" className="space-y-3.5 pt-3 min-w-0 w-full">
              <div className="space-y-1.5 min-w-0 w-full">
                <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <HugeiconsIcon icon={TerminalIcon} className="size-3.5" />
                  <span>Install client library (npm)</span>
                </div>
                <BucketCodeBlock code={nodeInstall} language="bash" />
              </div>

              <div className="space-y-1.5 min-w-0 w-full">
                <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
                  <span>Client initialization & upload</span>
                  <span className="font-mono text-[11px] text-muted-foreground/75">client.ts</span>
                </div>
                <BucketCodeBlock code={nodeCode} language="typescript" />
              </div>
            </TabsContent>

            {/* TAB 2: Python (icpay-bucket / ic-py) */}
            <TabsContent value="python" className="space-y-3.5 pt-3 min-w-0 w-full">
              <div className="space-y-1.5 min-w-0 w-full">
                <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <HugeiconsIcon icon={TerminalIcon} className="size-3.5" />
                  <span>Install Python client (pip)</span>
                </div>
                <BucketCodeBlock code={pythonInstall} language="bash" />
              </div>

              <div className="space-y-1.5 min-w-0 w-full">
                <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
                  <span>Client initialization & upload</span>
                  <span className="font-mono text-[11px] text-muted-foreground/75">client.py</span>
                </div>
                <BucketCodeBlock code={pythonCode} language="python" />
              </div>
            </TabsContent>

            {/* TAB 3: cURL */}
            <TabsContent value="curl" className="space-y-3 pt-3 min-w-0 w-full">
              <p className="text-xs text-muted-foreground">
                Download or inspect public files directly from the global CDN or on-chain canister HTTP gateway.
              </p>
              <BucketCodeBlock code={curlCode} language="bash" />
            </TabsContent>

            {/* TAB 4: .env */}
            <TabsContent value="env" className="space-y-3 pt-3 min-w-0 w-full">
              <p className="text-xs text-muted-foreground">
                Copy and paste these environment variables into your project’s{" "}
                <code className="rounded bg-muted px-1 py-0.5 font-mono text-foreground">.env</code> file.
              </p>
              <BucketCodeBlock code={envCode} language="bash" />
            </TabsContent>
          </Tabs>
        </div>

        <DialogFooter className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between border-t border-border/50 pt-3 min-w-0 w-full">
          <div className="flex flex-wrap items-center gap-2">
            {onOpenApiKeys ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  onOpenChange(false)
                  onOpenApiKeys()
                }}
                className="gap-1.5"
              >
                <HugeiconsIcon icon={Key01Icon} className="size-4" strokeWidth={1.75} />
                <span>Manage API Keys</span>
              </Button>
            ) : null}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              render={<Link href="/bucket/docs" />}
              className="gap-1.5 text-muted-foreground hover:text-foreground"
            >
              <HugeiconsIcon icon={Book02Icon} className="size-4" strokeWidth={1.75} />
              <span>Full Docs</span>
            </Button>
          </div>

          <Button type="button" variant="secondary" size="sm" onClick={() => onOpenChange(false)}>
            {tc("close") || "Close"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
