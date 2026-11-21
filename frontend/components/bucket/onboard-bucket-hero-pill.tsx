"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { toast } from "@/components/ui/sonner"
import { CopyIconIndicator } from "@/components/ui/copy-button"
import { WALLET_CANISTER_ID } from "@/services/icp"
import {
  AntigravityIcon,
  ClaudeCodeIcon,
  CopilotIcon,
  CursorIcon,
  OpenCodeIcon,
  WindsurfIcon,
} from "@/components/bucket/onboard-bucket-agent-button"

export function OnboardBucketHeroPill() {
  const t = useTranslations("bucket")
  const [copied, setCopied] = useState(false)

  const handleCopyPrompt = async () => {
    const prompt = `I want to connect my project to my ICPay Cloud storage bucket (ICBucket).

ICBucket Overview:
- Service: On-chain encrypted file storage on the Internet Computer (S3-compatible)
- Base URL: https://cloud.icpay.app
- Canister ID: ${WALLET_CANISTER_ID}

How to integrate ICBucket:

1. TypeScript / JavaScript (Node.js, Next.js, React):
Install:
npm install icpay-bucket

Usage:
import { BucketClient } from "icpay-bucket";

const client = new BucketClient({
  apiKey: process.env.IC_API_KEY,
});

const upload = await client.uploadFile({
  bucketId: "my-bucket",
  path: "/uploads/file.png",
  data: fileBuffer,
  contentType: "image/png",
});

const fileBytes = await client.downloadFile("my-bucket", "/uploads/file.png");

Public CDN URL:
https://cloud.icpay.app/cloud/my-bucket/uploads/file.png

2. Python:
Install:
pip install icpay-bucket ic-py

Usage:
from icpay_bucket import BucketClient
client = BucketClient(api_key=os.environ["IC_API_KEY"])
client.upload_file(bucket_id="my-bucket", path="/uploads/file.png", data=data, content_type="image/png")

3. AI Coding Agent MCP Server:
Run:
claude mcp add icbucket -- npx -y @icpay/icbucket-mcp

Or configure in claude_desktop_config.json, cursor, or windsurf:
{
  "mcpServers": {
    "icbucket": {
      "command": "npx",
      "args": ["-y", "@icpay/icbucket-mcp"]
    }
  }
}

Please help me implement file upload/download operations with ICBucket in my project.`

    try {
      await navigator.clipboard.writeText(prompt)
      setCopied(true)
      toast.success(t("onboardAgentCopied"))
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error("Failed to copy prompt")
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopyPrompt}
      className="group inline-flex items-center gap-2.5 sm:gap-3.5 rounded-full border border-border/80 bg-card/80 hover:bg-card px-4 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-medium text-foreground transition-all duration-200 cursor-pointer shadow-xs backdrop-blur-xs hover:border-border hover:shadow-md"
      title={t("onboardAgentTooltip")}
    >
      <span className="font-semibold tracking-tight">{copied ? t("onboardAgentCopied") : t("onboardAgentTitle")}</span>
      <div className="flex items-center gap-2 sm:gap-2.5 shrink-0 pl-1">
        <ClaudeCodeIcon className="size-4 sm:size-5 shrink-0" />
        <CursorIcon className="size-4 sm:size-5 shrink-0" />
        <OpenCodeIcon className="size-4 sm:size-5 shrink-0" />
        <WindsurfIcon className="size-4 sm:size-5 shrink-0 text-foreground" />
        <AntigravityIcon className="size-4 sm:size-5 shrink-0" />
        <CopilotIcon className="size-4 sm:size-5 shrink-0 text-foreground" />
      </div>
      <CopyIconIndicator copied={copied} iconClassName="size-3.5 sm:size-4 text-muted-foreground ml-1" />
    </button>
  )
}
