import { Icon } from "@/components/ui/icon"
import { SocialGithubGlassIcon, SocialLinkedinGlassIcon, GlobeGlassIcon } from "@thesvg/ui-react"
import type { SocialLink, SocialPlatform } from "@/services/types"

function platformKey(p: SocialPlatform): "github" | "linkedin" | "website" {
  if ("github" in p) return "github"
  if ("linkedin" in p) return "linkedin"
  return "website"
}

const ICONS = {
  github:   SocialGithubGlassIcon,
  linkedin: SocialLinkedinGlassIcon,
  website:  GlobeGlassIcon,
}

// Shows social link icons (with href) for public profiles — no editing.
export function SocialLinkIcons({
  links,
  size = "md",
}: {
  links: SocialLink[]
  size?: "sm" | "md"
}) {
  if (!links.length) return null
  const box = size === "sm" ? "size-7" : "size-8"
  const icon = size === "sm" ? "size-3.5" : "size-4"
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {links.map((l) => {
        const key = platformKey(l.platform)
        return (
          <a
            key={key}
            href={l.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={key}
            className={`flex ${box} items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors hover:bg-accent hover:text-foreground`}
          >
            <Icon icon={ICONS[key]} className={icon} />
          </a>
        )
      })}
    </div>
  )
}
