import fallbackData from "@/services/products/falcon/packages-fallback.json"

export type FalconPackage = {
  slug: string
  version: string
  description: string
  path: string
  import: string
}

export type PackageIndex = {
  version: number
  registry: string
  packages: Record<string, Omit<FalconPackage, "slug">>
}

function parsePackagesFromIndex(data: PackageIndex): FalconPackage[] {
  if (!data?.packages) return []
  return Object.entries(data.packages).map(([slug, pkg]) => ({
    slug,
    ...pkg,
  }))
}

export async function fetchFalconPackages(): Promise<FalconPackage[]> {
  try {
    const isBrowser = typeof window !== "undefined"
    const targetUrl = isBrowser
      ? "/api/products/falcon/packages"
      : "https://gitlab.com/prasangapokharel/falconpkg/-/raw/main/index.json"

    const response = await fetch(targetUrl, {
      cache: "force-cache",
    })

    if (response.ok) {
      const data: PackageIndex = await response.json()
      const parsed = parsePackagesFromIndex(data)
      if (parsed.length > 0) return parsed
    }
  } catch {}

  return parsePackagesFromIndex(fallbackData as unknown as PackageIndex)
}
