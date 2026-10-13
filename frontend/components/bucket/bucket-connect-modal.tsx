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

  const icpSdkInstall = "npm i @icp-sdk/core"
  const s3Install = "npm i @aws-sdk/client-s3 dotenv"

  const icpSdkCode = `import { HttpAgent, Actor } from "@icp-sdk/core/agent";
import { IDL } from "@icp-sdk/core/candid";
import { Principal } from "@icp-sdk/core/principal";

const CANISTER_ID = "${WALLET_CANISTER_ID}";
const BUCKET_NAME = "${bucketName}";
const API_KEY = process.env.IC_API_KEY || "YOUR_API_KEY"; // Generate in API Keys

// 1. Initialize IC HTTP Agent
const agent = await HttpAgent.create({ host: "https://icp0.io" });

// 2. Direct public file URL via global CDN:
// https://cloud.icpay.app/${bucketName}/uploads/example.png

console.log("Connected to bucket:", BUCKET_NAME);`

  const s3ClientCode = `import "dotenv/config";
import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";

// Initialize S3 client pointing to ICPay Cloud Gateway
const s3 = new S3Client({
  endpoint: "https://cloud.icpay.app/s3",
  region: "auto",
  credentials: {
    accessKeyId: "${bucketName}",
    secretAccessKey: process.env.IC_API_KEY || "YOUR_API_KEY",
  },
});

// Upload an object
await s3.send(
  new PutObjectCommand({
    Bucket: "${bucketName}",
    Key: "uploads/hello.txt",
    Body: "Hello from ICPay Cloud on Internet Computer!",
    ContentType: "text/plain",
  })
);

console.log("File uploaded successfully.");`

  const envCode = `# ICPay Cloud Storage Configuration
IC_CANISTER_ID="${WALLET_CANISTER_ID}"
IC_BUCKET_ID="${bucketId}"
IC_BUCKET_NAME="${bucketName}"
IC_HOST="https://icp0.io"
IC_CDN_URL="https://cloud.icpay.app"

# S3 Compatibility (AWS SDK / MinIO / rclone)
AWS_ENDPOINT_URL_S3="https://cloud.icpay.app/s3"
AWS_ACCESS_KEY_ID="${bucketName}"
AWS_SECRET_ACCESS_KEY="YOUR_API_KEY" # Generate in API Keys
AWS_REGION="auto"`

  const curlCode = `# 1. Upload a file via HTTP API
curl -X PUT "https://cloud.icpay.app/${bucketName}/sample.txt" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: text/plain" \\
  --data-binary @sample.txt

# 2. Download / View public file directly from CDN
curl -O "https://cloud.icpay.app/${bucketName}/sample.txt"`

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
          <Tabs defaultValue="sdk" className="w-full min-w-0">
            <TabsList className="grid w-full grid-cols-4 min-w-0">
              <TabsTrigger value="sdk" className="text-xs truncate">@icp-sdk</TabsTrigger>
              <TabsTrigger value="s3" className="text-xs truncate">S3 client</TabsTrigger>
              <TabsTrigger value="env" className="text-xs truncate">.env</TabsTrigger>
              <TabsTrigger value="curl" className="text-xs truncate">cURL</TabsTrigger>
            </TabsList>

            {/* TAB 1: @icp-sdk/core */}
            <TabsContent value="sdk" className="space-y-3.5 pt-3 min-w-0 w-full">
              <div className="space-y-1.5 min-w-0 w-full">
                <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <HugeiconsIcon icon={TerminalIcon} className="size-3.5" />
                  <span>Install client library</span>
                </div>
                <BucketCodeBlock code={icpSdkInstall} language="bash" />
              </div>

              <div className="space-y-1.5 min-w-0 w-full">
                <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
                  <span>Client initialization</span>
                  <span className="font-mono text-[11px] text-muted-foreground/75">client.ts</span>
                </div>
                <BucketCodeBlock code={icpSdkCode} language="typescript" />
              </div>
            </TabsContent>

            {/* TAB 2: S3 Client */}
            <TabsContent value="s3" className="space-y-3.5 pt-3 min-w-0 w-full">
              <div className="space-y-1.5 min-w-0 w-full">
                <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <HugeiconsIcon icon={TerminalIcon} className="size-3.5" />
                  <span>Install S3 client</span>
                </div>
                <BucketCodeBlock code={s3Install} language="bash" />
              </div>

              <div className="space-y-1.5 min-w-0 w-full">
                <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
                  <span>S3 integration</span>
                  <span className="font-mono text-[11px] text-muted-foreground/75">s3-client.ts</span>
                </div>
                <BucketCodeBlock code={s3ClientCode} language="typescript" />
              </div>
            </TabsContent>

            {/* TAB 3: .env */}
            <TabsContent value="env" className="space-y-3 pt-3 min-w-0 w-full">
              <p className="text-xs text-muted-foreground">
                Copy and paste these environment variables into your project’s{" "}
                <code className="rounded bg-muted px-1 py-0.5 font-mono text-foreground">.env</code> file.
              </p>
              <BucketCodeBlock code={envCode} language="bash" />
            </TabsContent>

            {/* TAB 4: cURL */}
            <TabsContent value="curl" className="space-y-3 pt-3 min-w-0 w-full">
              <p className="text-xs text-muted-foreground">
                Interact with the bucket directly from your terminal or CI/CD pipelines via standard HTTP.
              </p>
              <BucketCodeBlock code={curlCode} language="bash" />
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
