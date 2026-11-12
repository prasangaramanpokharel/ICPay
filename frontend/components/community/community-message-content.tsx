"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { CommunityMessageBody } from "@/components/community/community-message-body"
import { truncateMessagePreview } from "@/lib/community/messagePreview"
import { Button } from "@/components/ui/button"

export function CommunityMessageContent({ text }: { text: string }) {
  const t = useTranslations("community")
  const [expanded, setExpanded] = useState(false)
  const { preview, truncated } = truncateMessagePreview(text)
  const collapsible = truncated

  if (!collapsible || expanded) {
    return (
      <div>
        <CommunityMessageBody text={text} />
        {collapsible && expanded ? (
          <Button
            type="button"
            variant="link"
            size="xs"
            onClick={() => setExpanded(false)}
            className="mt-1.5 block h-auto p-0 text-left"
          >
            {t("showLess")}
          </Button>
        ) : null}
      </div>
    )
  }

  return (
    <div>
      <CommunityMessageBody text={preview} />
      <span className="text-muted-foreground">{" … "}</span>
      <Button
        type="button"
        variant="link"
        size="xs"
        onClick={() => setExpanded(true)}
        className="inline h-auto p-0 align-baseline"
      >
        {t("seeMore")}
      </Button>
    </div>
  )
}
