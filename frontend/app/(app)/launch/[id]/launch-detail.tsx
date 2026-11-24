"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { LaunchStatus } from "@/components/launch/launch-status"
import { useToken } from "@/hooks/token/useLaunchData"
import { useRewrittenLastSegment } from "@/lib/routing/rewrittenRoute"

export function LaunchDetail({ id: propId }: { id?: string } = {}) {
  const t = useTranslations("launch")
  const router = useRouter()
  const searchParams = useSearchParams()

  const rewrittenId = useRewrittenLastSegment()
  const id = propId || searchParams.get("id") || searchParams.get("token") || rewrittenId

  const { token, isLoading } = useToken(id || null)

  const back = (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => router.push("/launch")}
      className="-ml-2 h-auto px-2 py-1 text-muted-foreground"
    >
      {t("back")}
    </Button>
  )

  if (isLoading || !id) {
    return (
      <div className="space-y-4 pt-2">
        {back}
        <Skeleton className="h-16 w-full rounded-(--radius)" />
        <Skeleton className="h-40 w-full rounded-(--radius)" />
      </div>
    )
  }

  if (!token) {
    return (
      <div className="space-y-4 pt-2">
        {back}
        <Alert variant="destructive">
          <AlertDescription>{t("notFound")}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-4 pt-2">
      {back}
      <LaunchStatus token={token} />
    </div>
  )
}
