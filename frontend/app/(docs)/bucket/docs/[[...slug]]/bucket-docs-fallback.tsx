import { Skeleton } from "@/components/ui/skeleton"

export function BucketDocsPageFallback() {
  return (
    <div className="min-h-screen bg-background">
      <div className="h-14 border-b border-border/40 px-4 flex items-center gap-4">
        <Skeleton className="size-8 rounded-lg" />
        <Skeleton className="h-4 w-48" />
      </div>
      <div className="mx-auto max-w-4xl px-4 py-10 md:px-8 space-y-6">
        <Skeleton className="h-10 w-2/3 max-w-md" />
        <Skeleton className="h-5 w-full max-w-xl" />
        <Skeleton className="h-4 w-32" />
        <div className="space-y-3 pt-6">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/6" />
        </div>
      </div>
    </div>
  )
}
