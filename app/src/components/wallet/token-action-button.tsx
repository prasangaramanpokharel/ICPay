import { Pressable, View } from 'react-native'
import {
  ArrowUp01Icon,
  ArrowDown01Icon,
  Exchange01Icon,
} from '@hugeicons/core-free-icons'
import { Icon } from '@/components/ui/icon'
import { Text } from '@/components/ui/text'

const icons = {
  send: ArrowUp01Icon,
  deposit: ArrowDown01Icon,
  swap: Exchange01Icon,
}

export function TokenActionButton({
  kind,
  label,
  onPress,
}: {
  kind: 'send' | 'deposit' | 'swap'
  label: string
  onPress: () => void
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      className="items-center gap-1.5 active:opacity-75 active:scale-95"
    >
      <View className="size-11 items-center justify-center rounded-full bg-muted border border-border/70 shadow-xs">
        <Icon icon={icons[kind]} size={20} strokeWidth={1.75} />
      </View>
      <Text className="text-[11px] font-medium text-foreground">{label}</Text>
    </Pressable>
  )
}

