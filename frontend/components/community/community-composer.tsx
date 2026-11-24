"use client"

import { useLayoutEffect, useRef, useState } from "react"
import { useTranslations } from "next-intl"
import { Icon } from "@/components/ui/icon"
import { CodeGlassIcon, LinkGlassIcon, QuoteGlassIcon, SendGlassIcon, EmojiReactGlassIcon, TypeGlassIcon, TypeOutlineGlassIcon, EyeOffGlassIcon } from "@thesvg/ui-react"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  applyTextEdit,
  clearFormatting,
  insertDateStamp,
  insertLink,
  prefixQuoteLines,
  wrapMarkers,
} from "@/lib/community/composeFormat"
import { cn } from "@/lib/ui/utils"

const EMOJI_PALETTE = ["❤️", "🔥", "🎉", "🚀", "👍", "👏", "💡", "💎", "📈", "📢", "⚠️", "✅"] as const

export function CommunityComposer({
  onPost,
}: {
  onPost: (text: string) => Promise<string | null>
}) {
  const t = useTranslations("community")
  const [text, setText] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const canSend = !submitting && !!text.trim()

  useLayoutEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = "auto"
    const max = Math.min(window.innerHeight * 0.45, 360)
    el.style.height = `${Math.min(el.scrollHeight, max)}px`
  }, [text])

  const applyEdit = (edit: ReturnType<typeof wrapMarkers>) => {
    const el = textareaRef.current
    if (!el) return
    applyTextEdit(el, edit)
    setText(el.value)
    el.focus()
  }

  const withSelection = (fn: (value: string, start: number, end: number) => ReturnType<typeof wrapMarkers>) => {
    const el = textareaRef.current
    if (!el) return
    applyEdit(fn(el.value, el.selectionStart, el.selectionEnd))
  }

  const insertEmoji = (emoji: string) => {
    const el = textareaRef.current
    if (!el) {
      setText((prev) => prev + emoji)
      return
    }
    const { selectionStart, selectionEnd, value } = el
    const next = `${value.slice(0, selectionStart)}${emoji}${value.slice(selectionEnd)}`
    const pos = selectionStart + emoji.length
    applyEdit({ value: next, selectionStart: pos, selectionEnd: pos })
  }

  const submit = async () => {
    const trimmed = text.trim()
    if (!trimmed || submitting) return
    setSubmitting(true)
    setError(null)
    try {
      const err = await onPost(trimmed)
      if (err) {
        setError(err)
      } else {
        setText("")
      }
    } finally {
      setSubmitting(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const mod = e.ctrlKey || e.metaKey
    if (!mod) {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault()
        void submit()
      }
      return
    }

    const shift = e.shiftKey
    const key = e.key.toLowerCase()

    const formatMap: Record<string, () => void> = {
      b: () => withSelection((v, s, e2) => wrapMarkers(v, s, e2, "*", "*")),
      i: () => withSelection((v, s, e2) => wrapMarkers(v, s, e2, "_", "_")),
      u: () => withSelection((v, s, e2) => wrapMarkers(v, s, e2, "__", "__")),
      k: () => withSelection(insertLink),
    }

    if (!shift && formatMap[key]) {
      e.preventDefault()
      formatMap[key]()
      return
    }

    if (shift && key === "x") {
      e.preventDefault()
      withSelection((v, s, e2) => wrapMarkers(v, s, e2, "~", "~"))
      return
    }
    if (shift && key === "m") {
      e.preventDefault()
      withSelection((v, s, e2) => wrapMarkers(v, s, e2, "`", "`"))
      return
    }
    if (shift && key === "p") {
      e.preventDefault()
      withSelection((v, s, e2) => wrapMarkers(v, s, e2, "||", "||"))
      return
    }
    if (shift && key === "d") {
      e.preventDefault()
      withSelection(insertDateStamp)
      return
    }
    if (shift && key === "n") {
      e.preventDefault()
      withSelection(clearFormatting)
      return
    }
    if (shift && (key === "." || key === ">")) {
      e.preventDefault()
      withSelection(prefixQuoteLines)
    }
  }

  const remaining = 2000 - text.length

  return (
    <div className="shrink-0 m-2 rounded-3xl border border-border/60 bg-card/85 p-2 shadow-lg backdrop-blur-xl transition-all">
      <div className="flex items-center justify-between border-b border-border/40 pb-1.5 px-2 mb-1.5">
        <div className="flex items-center gap-0.5">
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => withSelection((v, s, e) => wrapMarkers(v, s, e, "*", "*"))}
                  className="size-7 rounded-lg text-muted-foreground hover:text-foreground"
                >
                  <Icon icon={TypeGlassIcon} className="size-3.5" />
                </Button>
              }
            />
            <TooltipContent side="top">{t("formatBold")}</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => withSelection((v, s, e) => wrapMarkers(v, s, e, "_", "_"))}
                  className="size-7 rounded-lg text-muted-foreground hover:text-foreground"
                >
                  <Icon icon={TypeOutlineGlassIcon} className="size-3.5" />
                </Button>
              }
            />
            <TooltipContent side="top">{t("formatItalic")}</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => withSelection(insertLink)}
                  className="size-7 rounded-lg text-muted-foreground hover:text-foreground"
                >
                  <Icon icon={LinkGlassIcon} className="size-3.5" />
                </Button>
              }
            />
            <TooltipContent side="top">{t("formatLink")}</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => withSelection(prefixQuoteLines)}
                  className="size-7 rounded-lg text-muted-foreground hover:text-foreground"
                >
                  <Icon icon={QuoteGlassIcon} className="size-3.5" />
                </Button>
              }
            />
            <TooltipContent side="top">{t("formatQuote")}</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => withSelection((v, s, e) => wrapMarkers(v, s, e, "`", "`"))}
                  className="size-7 rounded-lg text-muted-foreground hover:text-foreground"
                >
                  <Icon icon={CodeGlassIcon} className="size-3.5" />
                </Button>
              }
            />
            <TooltipContent side="top">{t("formatMono")}</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => withSelection((v, s, e) => wrapMarkers(v, s, e, "||", "||"))}
                  className="size-7 rounded-lg text-muted-foreground hover:text-foreground"
                >
                  <Icon icon={EyeOffGlassIcon} className="size-3.5" />
                </Button>
              }
            />
            <TooltipContent side="top">{t("formatSpoiler")}</TooltipContent>
          </Tooltip>

          <Popover>
            <PopoverTrigger
              render={
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  className="size-7 rounded-lg text-muted-foreground hover:text-foreground ml-1"
                >
                  <Icon icon={EmojiReactGlassIcon} className="size-3.5" />
                </Button>
              }
            />
            <PopoverContent
              side="top"
              align="start"
              className="w-auto p-1.5 grid grid-cols-6 gap-1 rounded-2xl border-border/80 bg-popover/95 shadow-xl backdrop-blur-md"
            >
              {EMOJI_PALETTE.map((emoji) => (
                <Button
                  key={emoji}
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => insertEmoji(emoji)}
                  className="size-7 text-sm rounded-lg hover:scale-125 transition-transform"
                >
                  <span>{emoji}</span>
                </Button>
              ))}
            </PopoverContent>
          </Popover>
        </div>

        {text.length > 0 && (
          <span
            className={cn(
              "text-[10px] font-mono",
              remaining < 100
                ? "text-destructive font-semibold"
                : remaining < 300
                  ? "text-warning"
                  : "text-muted-foreground"
            )}
          >
            {text.length} / 2000
          </span>
        )}
      </div>

      <div className="flex items-end gap-2 px-1">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t("postPlaceholder")}
          maxLength={2000}
          rows={1}
          className={cn(
            "min-h-[40px] max-h-[min(45vh,360px)] min-w-0 flex-1 resize-none overflow-y-auto bg-transparent px-2.5 py-2 text-sm outline-none",
            "placeholder:text-muted-foreground focus-visible:outline-none"
          )}
        />
        <Button
          type="button"
          size="icon-sm"
          disabled={!canSend || submitting}
          className={cn(
            "size-9 shrink-0 rounded-full transition-all active:scale-95",
            !canSend || submitting ? "opacity-40" : "shadow-md"
          )}
          aria-label={t("sendAria")}
          onClick={() => void submit()}
        >
          {submitting ? (
            <Spinner className="size-4" />
          ) : (
            <Icon icon={SendGlassIcon} className="size-4" strokeWidth={2} />
          )}
        </Button>
      </div>

      {error && <p className="mt-1 px-2 text-xs text-destructive">{error}</p>}
    </div>
  )
}
