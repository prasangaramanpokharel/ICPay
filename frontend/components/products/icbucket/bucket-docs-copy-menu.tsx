"use client"

import { useState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowDown01Icon } from "@hugeicons/core-free-icons"
import {
  Markdown,
  Openai,
  Claude,
  Mcp,
} from "@dev.icons/react"
import { CopyIconIndicator } from "@/components/ui/copy-button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { copyText } from "@/lib/wallet/utils"
import { toast } from "@/components/ui/toast"

type BucketDocsCopyMenuProps = {
  markdown: string
  title?: string
}

export function BucketDocsCopyMenu({ markdown, title = "ICBucket Documentation" }: BucketDocsCopyMenuProps) {
  const [copied, setCopied] = useState(false)

  const handleCopyPage = async () => {
    await copyText(markdown)
    setCopied(true)
    toast.success("Page copied as Markdown")
    setTimeout(() => setCopied(false), 2000)
  }

  const handleViewMarkdown = () => {
    try {
      const currentPath = window.location.pathname.replace(/\/$/, "")
      const mdUrl = currentPath ? `${currentPath}.md` : "/bucket/docs.md"
      window.open(mdUrl, "_blank", "noopener,noreferrer")
    } catch {
      const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" })
      window.open(URL.createObjectURL(blob), "_blank", "noopener,noreferrer")
    }
  }

  const handleOpenChatGPT = async () => {
    const prompt = `Here is the documentation for ${title}:\n\n${markdown}`
    await copyText(prompt)
    toast.success("Prompt copied to clipboard! Opening ChatGPT...")
    const url = `https://chatgpt.com/?q=${encodeURIComponent(`Explain this ICBucket documentation and how to use it:\n\n` + markdown.slice(0, 3000))}`
    window.open(url, "_blank", "noopener,noreferrer")
  }

  const handleOpenClaude = async () => {
    const prompt = `Here is the documentation for ${title}:\n\n${markdown}`
    await copyText(prompt)
    toast.success("Prompt copied to clipboard! Opening Claude...")
    const url = `https://claude.ai/new?q=${encodeURIComponent(`Explain this ICBucket documentation and how to use it:\n\n` + markdown.slice(0, 3000))}`
    window.open(url, "_blank", "noopener,noreferrer")
  }

  const handleConnectMCP = async () => {
    const mcpConfig = JSON.stringify(
      {
        mcpServers: {
          icbucket: {
            command: "npx",
            args: ["-y", "@icpay/icbucket-mcp"],
          },
        },
      },
      null,
      2
    )
    await copyText(mcpConfig)
    toast.success("Successfully copied")
  }

  return (
    <div className="inline-flex items-center rounded-lg border border-border/70 bg-card text-xs font-medium text-foreground shadow-xs">
      <button
        type="button"
        onClick={handleCopyPage}
        className="inline-flex h-8 items-center gap-1.5 px-2.5 rounded-l-lg hover:bg-muted/40 cursor-pointer transition-colors"
      >
        <CopyIconIndicator copied={copied} iconClassName="size-3.5" />
        <span>{copied ? "Copied" : "Copy Page"}</span>
      </button>

      <div className="h-4 w-px bg-border/70" />

      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <button
              type="button"
              aria-label="More copy options"
              className="inline-flex h-8 w-7 items-center justify-center rounded-r-lg hover:bg-muted/40 cursor-pointer transition-colors"
            />
          }
        >
          <HugeiconsIcon icon={ArrowDown01Icon} className="size-3 text-muted-foreground" />
        </DropdownMenuTrigger>

        <DropdownMenuContent align="start" className="w-48 p-1 rounded-xl border-border/60 bg-popover/95 backdrop-blur-md shadow-xl">
          <DropdownMenuItem
            onClick={handleViewMarkdown}
            className="flex items-center gap-2.5 px-2.5 py-1.5 text-xs rounded-lg cursor-pointer hover:bg-accent transition-colors"
          >
            <Markdown size={15} className="shrink-0 text-foreground" />
            <span>View as Markdown</span>
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={handleOpenChatGPT}
            className="flex items-center gap-2.5 px-2.5 py-1.5 text-xs rounded-lg cursor-pointer hover:bg-accent transition-colors"
          >
            <Openai size={15} className="shrink-0 text-foreground" />
            <span>Open in ChatGPT</span>
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={handleOpenClaude}
            className="flex items-center gap-2.5 px-2.5 py-1.5 text-xs rounded-lg cursor-pointer hover:bg-accent transition-colors"
          >
            <Claude size={15} className="shrink-0 text-foreground" />
            <span>Open in Claude</span>
          </DropdownMenuItem>

          <DropdownMenuSeparator className="my-1 border-border/40" />

          <DropdownMenuItem
            onClick={handleConnectMCP}
            className="flex items-center gap-2.5 px-2.5 py-1.5 text-xs rounded-lg cursor-pointer hover:bg-accent transition-colors"
          >
            <Mcp size={15} className="shrink-0 text-foreground" />
            <span>Copy as MCP Config</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
