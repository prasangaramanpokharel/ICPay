import { Pressable, View } from 'react-native'
import { useRouter } from 'expo-router'
import {
  ArrowUp01Icon,
  ArrowDown01Icon,
  Exchange01Icon,
  ArrowDataTransferHorizontalIcon,
} from '@hugeicons/core-free-icons'
import { useTranslations } from '@/components/i18n/locale-provider'
import { Icon } from '@/components/ui/icon'
import { Text } from '@/components/ui/text'

const actions = [
  { href: '/transfer', label: 'common.send', icon: ArrowUp01Icon },
  { href: '/deposit', label: 'common.receive', icon: ArrowDown01Icon },
  { href: '/swap', label: 'common.swap', icon: Exchange01Icon },
  { href: '/withdraw', label: 'transactions.type.transfer', icon: ArrowDataTransferHorizontalIcon },
] as const

export function DashboardActions() {
  const t = useTranslations()
  const router = useRouter()

  return (
    <View className="flex-row justify-around px-4 pt-1">
      {actions.map((item) => (
        <Pressable
          key={item.href}
          accessibilityRole="button"
          accessibilityLabel={t(item.label)}
          onPress={() => router.push(item.href as never)}
          className="items-center gap-1.5 active:opacity-75 active:scale-95"
        >
          <View className="size-11 items-center justify-center rounded-full bg-muted border border-border/70 shadow-xs">
            <Icon icon={item.icon} size={20} strokeWidth={1.75} />
          </View>
          <Text className="text-[11px] font-medium text-foreground">{t(item.label)}</Text>
        </Pressable>
      ))}
    </View>
  )
}

