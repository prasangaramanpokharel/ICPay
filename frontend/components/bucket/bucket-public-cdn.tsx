"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Icon } from "@/components/ui/icon"
import { CdnCacheGlassIcon } from "@thesvg/ui-react"
import { Button } from "@/components/ui/button"
import { CopyIconIndicator } from "@/components/ui/copy-button"
import { ButtonGroup } from "@/components/ui/button-group"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group"
import { copyText } from "@/lib/wallet/utils"
import { toast } from "@/components/ui/toast"
import {
  getBucketCdnBase,
  resolvePublicFileUrl,
  type BucketUrlMode,
} from "@/lib/bucket/cdn"

export function BucketPublicCdn({ publicBaseUrl }: { publicBaseUrl: string }) {
  const t = useTranslations("bucket")
  const tc = useTranslations("common")
  const [open, setOpen] = useState(false)
  const [urlMode, setUrlMode] = useState<BucketUrlMode>("raw")
  const [copied, setCopied] = useState(false)
  const cdnEnabled = getBucketCdnBase() !== null
  const displayBase = resolvePublicFileUrl(publicBaseUrl, urlMode)

  const handleCopy = async () => {
    await copyText(displayBase)
    setCopied(true)
    toast.success("Successfully copied")
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger
        render={
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-between text-muted-foreground"
          >
            <span className="flex items-center gap-1.5">
              <Icon icon={CdnCacheGlassIcon} className="size-4 text-muted-foreground" />
              <span>{t("publicCdn")}</span>
            </span>
          </Button>
        }
      />
      <CollapsibleContent
        keepMounted
        className="overflow-hidden data-open:animate-accordion-down data-closed:animate-accordion-up"
      >
        <div className="space-y-2 pt-1.5">
          {cdnEnabled ? (
            <ButtonGroup className="w-full">
              <Button
                type="button"
                variant={urlMode === "raw" ? "default" : "outline"}
                size="sm"
                className="flex-1"
                onClick={() => setUrlMode("raw")}
              >
                {t("urlModeRaw")}
              </Button>
              <Button
                type="button"
                variant={urlMode === "cdn" ? "default" : "outline"}
                size="sm"
                className="flex-1"
                onClick={() => setUrlMode("cdn")}
              >
                {t("urlModeCdn")}
              </Button>
            </ButtonGroup>
          ) : null}

          <InputGroup>
            {!cdnEnabled && (
              <InputGroupAddon align="inline-start">
                <InputGroupText className="text-xs">{t("urlModeRaw")}</InputGroupText>
              </InputGroupAddon>
            )}
            <InputGroupInput
              readOnly
              value={displayBase}
              className="font-mono text-xs"
              onFocus={(e) => e.target.select()}
            />
            <InputGroupAddon align="inline-end">
              <InputGroupButton
                size="icon-xs"
                aria-label={copied ? tc("copied") : tc("copy")}
                onClick={handleCopy}
              >
                <CopyIconIndicator copied={copied} iconClassName="size-3.5" />
              </InputGroupButton>
            </InputGroupAddon>
          </InputGroup>
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}
