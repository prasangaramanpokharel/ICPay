"use client"

import { useTranslations } from "next-intl"
import { computeRiskScore, type RiskLevel } from "@/lib/market/riskScore"
import { cn } from "@/lib/ui/utils"

function levelColor(level: RiskLevel) {
  if (level === "low") return "text-success"
  if (level === "medium") return "text-warning"
  return "text-destructive"
}

function levelTokenVar(level: RiskLevel) {
  if (level === "low") return "var(--success)"
  if (level === "medium") return "var(--warning)"
  return "var(--destructive)"
}

export function ScoreCircle({
  username,
  createdAtNs,
  txCount,
}: {
  username: string
  createdAtNs: bigint | undefined
  txCount: number | null
}) {
  const t = useTranslations("trustSignals")

  const { score, level } = computeRiskScore({
    username: username || null,
    createdAtNs: createdAtNs ?? null,
    txCount,
    reasonKeys: {
      hasUsername: "",
      badgePremium: "",
      badgeUltra: "",
      accountAge: "",
      hasTx: "",
      brandSimilar: "",
    },
  })

  const clampedScore = Math.max(0, Math.min(100, score))
  const label = t(level === "low" ? "levelLow" : level === "medium" ? "levelMedium" : "levelHigh", { score })

  return (
    <div
      className="relative flex size-10 shrink-0 items-center justify-center rounded-full p-0.75"
      style={{
        background: `conic-gradient(${levelTokenVar(level)} ${clampedScore}%, var(--muted) 0)`,
      }}
      title={label}
      aria-label={label}
    >
      <div className="flex size-full items-center justify-center rounded-full bg-card">
        <span
          className={cn(
            "text-[11px] font-bold tabular-nums",
            levelColor(level),
          )}
        >
          {score}
        </span>
      </div>
    </div>
  )
}
