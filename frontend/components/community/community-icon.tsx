import { Icon } from "@/components/ui/icon"
import { ArrowDownGlassIcon, ArrowLeftGlassIcon, CopyGlassIcon, LayoutGridGlassIcon, DeleteGlassIcon, ForwardGlassIcon, BookOpenGlassIcon, GiftGlassIcon, MessageSquareGlassIcon, EllipsisVerticalGlassIcon, PinGlassIcon, SearchGlassIcon, SendGlassIcon, SettingsGlassIcon, Share2GlassIcon, CheckGlassOutlineIcon, UploadGlassIcon } from "@thesvg/ui-react"
import { cn } from "@/lib/ui/utils"

const ICONS = {
  back: ArrowLeftGlassIcon,
  more: EllipsisVerticalGlassIcon,
  pin: PinGlassIcon,
  copy: CopyGlassIcon,
  forward: ForwardGlassIcon,
  guide: BookOpenGlassIcon,
  delete: DeleteGlassIcon,
  share: Share2GlassIcon,
  send: SendGlassIcon,
  arrowDown: ArrowDownGlassIcon,
  community: MessageSquareGlassIcon,
  gift: GiftGlassIcon,
  home: LayoutGridGlassIcon,
  search: SearchGlassIcon,
  upload: UploadGlassIcon,
  settings: SettingsGlassIcon,
  check: CheckGlassOutlineIcon,
} as const

export type CommunityIconName = keyof typeof ICONS

export function CommunityIcon({
  name,
  size = 20,
  className,
}: {
  name: CommunityIconName
  size?: number
  className?: string
}) {
  return (
    <Icon
      icon={ICONS[name]}
      className={cn("shrink-0", className)}
      style={{ width: size, height: size }}
      strokeWidth={1.75}
    />
  )
}
