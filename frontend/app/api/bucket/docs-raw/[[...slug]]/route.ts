import { loadBucketDoc } from "@/lib/bucket/docs/load"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug?: string[] }> }
) {
  const { slug = [] } = await params

  // Strip trailing .md if present in the last slug segment
  const cleanedSlug = slug.map((segment, index) => {
    if (index === slug.length - 1 && segment.endsWith(".md")) {
      return segment.slice(0, -3)
    }
    return segment
  })

  const doc = await loadBucketDoc(cleanedSlug)
  if (!doc) {
    return new Response("Documentation section not found", {
      status: 404,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    })
  }

  return new Response(doc.fullMarkdown, {
    status: 200,
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      "Access-Control-Allow-Origin": "*",
    },
  })
}
