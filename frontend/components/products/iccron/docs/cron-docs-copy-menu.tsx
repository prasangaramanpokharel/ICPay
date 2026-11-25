"use client"

import { useState } from "react"
import { Icon } from "@/components/ui/icon"
import { ChevronDownGlassIcon } from "@thesvg/ui-react"
import { Markdown, Openai, Claude } from "@dev.icons/react"
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

type CronDocsCopyMenuProps = {
  markdown: string
}

export function CronDocsCopyMenu({ markdown }: CronDocsCopyMenuProps) {
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
      const mdUrl = currentPath ? `${currentPath}.md` : "/cron/docs.md"
      window.open(mdUrl, "_blank", "noopener,noreferrer")
    } catch {
      const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" })
      window.open(URL.createObjectURL(blob), "_blank", "noopener,noreferrer")
    }
  }

  const handleOpenChatGPT = async () => {
    await copyText(markdown)
    toast.success("Context copied. Opening ChatGPT...")
    window.open("https://chatgpt.com/?hints=search&q=" + encodeURIComponent("I have copied the official icCron documentation to my clipboard. Please analyze it:"), "_blank")
  }

  const handleOpenClaude = async () => {
    await copyText(markdown)
    toast.success("Context copied. Opening Claude...")
    window.open("https://claude.ai/new", "_blank")
  }

  return (
    <div className="flex items-center gap-1.5">
      <button
        type="button"
        onClick={handleCopyPage}
        className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border/60 bg-muted/30 px-2.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground cursor-pointer"
      >
        <CopyIconIndicator copied={copied} className="size-3.5" />
        <span>{copied ? "Copied" : "Copy page"}</span>
      </button>

      <DropdownMenu>
        <DropdownMenuTrigger className="inline-flex size-8 items-center justify-center rounded-lg border border-border/60 bg-muted/30 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground cursor-pointer">
          <Icon icon={ChevronDownGlassIcon} className="size-3.5" />
          <span className="sr-only">More options</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48">
          <DropdownMenuItem onClick={handleViewMarkdown} className="cursor-pointer gap-2 text-xs">
            <Markdown className="size-3.5" />
            <span>View raw markdown</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleOpenChatGPT} className="cursor-pointer gap-2 text-xs">
            <Openai className="size-3.5" />
            <span>Open in ChatGPT</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleOpenClaude} className="cursor-pointer gap-2 text-xs">
            <Claude className="size-3.5" />
            <span>Open in Claude</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
