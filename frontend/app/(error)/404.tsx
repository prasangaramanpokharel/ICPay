import { PublicLayout } from "@/components/public/layout"
import { NotFoundView } from "@/components/error/not-found-view"

export function Custom404Page() {
  return (
    <>
      <head>
        <meta name="robots" content="noindex, nofollow" />
      </head>
      <PublicLayout variant="content">
        <NotFoundView />
      </PublicLayout>
    </>
  )
}

export default Custom404Page
