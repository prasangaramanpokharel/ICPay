"use client"

import { useEffect, useRef } from "react"
import { useTranslations } from "next-intl"
import { toast } from "@/components/ui/toast"
import { fillNoticeDescription } from "@/lib/market/fillNoticeCopy"
import { useTradeFillNotice } from "@/hooks/market/useTradeFills"

export function TradeFillAlert() {
  const t = useTranslations("marketTrade")
  const { notice, clear } = useTradeFillNotice()
  const activeToastIds = useRef(new Set<string>())

  useEffect(() => {
    if (!notice) return
    const side = notice.isBuy ? t("swapBuy") : t("swapSell")
    const description = fillNoticeDescription({
      side,
      amount: notice.amount,
      decimals: notice.decimals,
      symbol: notice.symbol,
      at: notice.at,
    })

    if (notice.kind === "filling") {
      activeToastIds.current.add(notice.id)
      toast.add({
        id: notice.id,
        title: t("fillFilling"),
        description,
        type: "loading",
      })
    } else if (notice.kind === "filled") {
      if (activeToastIds.current.has(notice.id)) {
        toast.update(notice.id, {
          title: t("fillFilled"),
          description,
          type: "success",
        })
        activeToastIds.current.delete(notice.id)
      } else {
        toast.add({
          id: notice.id,
          title: t("fillFilled"),
          description,
          type: "success",
        })
      }
    } else {
      if (activeToastIds.current.has(notice.id)) {
        toast.update(notice.id, {
          title: t("fillFailed"),
          description,
          type: "error",
        })
        activeToastIds.current.delete(notice.id)
      } else {
        toast.add({
          id: notice.id,
          title: t("fillFailed"),
          description,
          type: "error",
        })
      }
    }
    clear()
  }, [notice, clear, t])

  return null
}
