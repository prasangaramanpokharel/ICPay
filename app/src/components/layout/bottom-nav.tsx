import { Pressable, View } from 'react-native'
import { usePathname, useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTranslations } from '@/components/i18n/locale-provider'
import { AppIcon, type AppIconName } from '@/components/ui/app-icon'
import { Text } from '@/components/ui/text'
import { cn } from '@/lib/utils'

const navItems: {
  href: string
  labelKey: 'home' | 'icpverse' | 'history' | 'menu' | 'presale'
  icon: AppIconName
}[] = [
  { href: '/', labelKey: 'home', icon: 'home' },
  { href: '/icpverse', labelKey: 'icpverse', icon: 'icpverse' },
  { href: '/icpay/presale', labelKey: 'presale', icon: 'icpay' },
  { href: '/transactions', labelKey: 'history', icon: 'history' },
  { href: '/settings', labelKey: 'menu', icon: 'menu' },
]

export function BottomNav() {
  const pathname = usePathname()
  const t = useTranslations('nav')
  const insets = useSafeAreaInsets()
  const isActive = (href: string) => (href === '/' ? pathname === '/' : pathname.startsWith(href))

  return (
    <View className="absolute right-0 bottom-0 left-0 px-4 pt-2" style={{ paddingBottom: Math.max(insets.bottom, 10) }}>
      <View className="h-[4.25rem] flex-row items-stretch rounded-3xl border border-border/60 bg-background/95 px-1 shadow-lg">
        {navItems.map((item) => (
          <NavTab
            key={item.href}
            href={item.href}
            label={t(item.labelKey)}
            active={isActive(item.href)}
            icon={item.icon}
          />
        ))}
      </View>
    </View>
  )
}

function NavTab({
  href,
  label,
  icon,
  active,
}: {
  href: string
  label: string
  icon: AppIconName
  active: boolean
}) {
  const router = useRouter()
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: active }}
      onPress={() => router.push(href as never)}
      className="flex-1 items-center justify-center py-1 active:opacity-70"
    >
      <View
        className={cn(
          'size-9 items-center justify-center rounded-full',
          active ? 'bg-primary/10' : 'bg-transparent',
        )}
      >
        <AppIcon name={icon} size={22} />
      </View>
      <Text
        numberOfLines={1}
        className={cn(
          'mt-0.5 max-w-full px-0.5 text-[10px]',
          active ? 'font-semibold text-foreground' : 'font-medium text-muted-foreground',
        )}
      >
        {label}
      </Text>
    </Pressable>
  )
}
