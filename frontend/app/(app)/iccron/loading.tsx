import { AppPage } from "@/components/layout/dashboard/app-page"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"

export default function AppIcCronLoading() {
  return (
    <AppPage className="mx-auto max-w-6xl w-full space-y-6">
      <Skeleton className="h-8 w-48 rounded-md" />
      <Card className="rounded-lg border border-border/80 p-4">
        <CardContent className="space-y-3 p-0">
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded-lg" />
          ))}
        </CardContent>
      </Card>
    </AppPage>
  )
}
