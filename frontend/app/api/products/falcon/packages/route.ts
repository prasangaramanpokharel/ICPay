import { NextResponse } from "next/server"
import fallbackData from "@/services/products/falcon/packages-fallback.json"

const PACKAGE_INDEX_URL =
  "https://gitlab.com/prasangapokharel/falconpkg/-/raw/main/index.json"

export async function GET() {
  try {
    const response = await fetch(PACKAGE_INDEX_URL, {
      next: { revalidate: 3600 },
      headers: {
        Accept: "application/json",
      },
    })

    if (response.ok) {
      const data = await response.json()
      return NextResponse.json(data, {
        headers: {
          "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
        },
      })
    }
  } catch {
    // If upstream fetch fails or times out, smoothly return bundled fallback
  }

  return NextResponse.json(fallbackData, {
    headers: {
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  })
}
