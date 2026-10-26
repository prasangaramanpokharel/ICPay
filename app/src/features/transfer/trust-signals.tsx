import { View } from 'react-native'
import Svg, { Circle } from 'react-native-svg'
import { computeRiskScore, type RiskLevel } from '@/lib/market/risk-score'
import { Text } from '@/components/ui/text'
import { useTheme } from '@/components/theme/theme-provider'

const SIZE = 36
const STROKE_WIDTH = 3
const R = (SIZE - STROKE_WIDTH) / 2
const CIRC = 2 * Math.PI * R

function levelColor(level: RiskLevel): string {
  if (level === 'low') return '#22c55e'
  if (level === 'medium') return '#f59e0b'
  return '#ef4444'
}

export function ScoreCircle({
  username,
  createdAtNs,
  txCount,
}: {
  username: string
  createdAtNs?: bigint | null
  txCount?: number | null
}) {
  const { resolved } = useTheme()
  const { score, level } = computeRiskScore({
    username: username || null,
    createdAtNs: createdAtNs ?? null,
    txCount: txCount ?? null,
  })

  const strokeColor = levelColor(level)
  const trackColor = resolved === 'dark' ? '#262626' : '#e5e5e5'
  const dash = (score / 100) * CIRC
  const gap = Math.max(0, CIRC - dash)

  return (
    <View
      style={{ width: SIZE, height: SIZE }}
      className="relative items-center justify-center shrink-0"
    >
      <Svg
        width={SIZE}
        height={SIZE}
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        style={{ transform: [{ rotate: '-90deg' }] }}
      >
        <Circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={R}
          fill="none"
          stroke={trackColor}
          strokeWidth={STROKE_WIDTH}
        />
        <Circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={R}
          fill="none"
          stroke={strokeColor}
          strokeWidth={STROKE_WIDTH}
          strokeDasharray={`${dash} ${gap}`}
          strokeLinecap="round"
        />
      </Svg>
      <View className="absolute inset-0 items-center justify-center">
        <Text
          style={{ color: strokeColor }}
          className="text-[10px] font-bold tabular-nums"
        >
          {score}
        </Text>
      </View>
    </View>
  )
}
