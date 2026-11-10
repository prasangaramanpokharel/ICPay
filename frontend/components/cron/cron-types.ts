export interface CronOption {
  value: string
  label: string
}

export const COMMON_PRESETS: CronOption[] = [
  { value: "", label: "--- Common Settings ---" },
  { value: "* * * * *", label: "Every minute (* * * * *)" },
  { value: "*/2 * * * *", label: "Every 2 minutes (*/2 * * * *)" },
  { value: "*/5 * * * *", label: "Every 5 minutes (*/5 * * * *)" },
  { value: "*/10 * * * *", label: "Every 10 minutes (*/10 * * * *)" },
  { value: "*/15 * * * *", label: "Every 15 minutes (*/15 * * * *)" },
  { value: "*/30 * * * *", label: "Every 30 minutes (*/30 * * * *)" },
  { value: "0 * * * *", label: "Once an hour at :00 (0 * * * *)" },
  { value: "0,30 * * * *", label: "Twice an hour at :00, :30 (0,30 * * * *)" },
  { value: "0 0 * * *", label: "Once a day at midnight (0 0 * * *)" },
  { value: "0 12 * * *", label: "Once a day at noon (0 12 * * *)" },
  { value: "0 0,12 * * *", label: "Twice a day at 00:00, 12:00 (0 0,12 * * *)" },
  { value: "0 0 * * 0", label: "Once a week on Sunday (0 0 * * 0)" },
  { value: "0 0 * * 1-5", label: "Weekdays Monday to Friday (0 0 * * 1-5)" },
  { value: "0 0 1 * *", label: "Once a month on the 1st (0 0 1 * *)" },
  { value: "0 0 1 1 *", label: "Once a year on Jan 1st (0 0 1 1 *)" },
]

export const MINUTE_OPTIONS: CronOption[] = [
  { value: "*", label: "Every minute (*)" },
  { value: "*/2", label: "Every 2 minutes (*/2)" },
  { value: "*/5", label: "Every 5 minutes (*/5)" },
  { value: "*/10", label: "Every 10 minutes (*/10)" },
  { value: "*/15", label: "Every 15 minutes (*/15)" },
  { value: "*/30", label: "Every 30 minutes (*/30)" },
  { value: "0", label: ":00" },
  { value: "5", label: ":05" },
  { value: "10", label: ":10" },
  { value: "15", label: ":15" },
  { value: "20", label: ":20" },
  { value: "25", label: ":25" },
  { value: "30", label: ":30" },
  { value: "35", label: ":35" },
  { value: "40", label: ":40" },
  { value: "45", label: ":45" },
  { value: "50", label: ":50" },
  { value: "55", label: ":55" },
]

export const HOUR_OPTIONS: CronOption[] = [
  { value: "*", label: "Every hour (*)" },
  { value: "*/2", label: "Every 2 hours (*/2)" },
  { value: "*/4", label: "Every 4 hours (*/4)" },
  { value: "*/6", label: "Every 6 hours (*/6)" },
  { value: "*/12", label: "Every 12 hours (*/12)" },
  { value: "0", label: "12:00 AM (00:00)" },
  { value: "1", label: "01:00 AM (01:00)" },
  { value: "2", label: "02:00 AM (02:00)" },
  { value: "3", label: "03:00 AM (03:00)" },
  { value: "4", label: "04:00 AM (04:00)" },
  { value: "5", label: "05:00 AM (05:00)" },
  { value: "6", label: "06:00 AM (06:00)" },
  { value: "7", label: "07:00 AM (07:00)" },
  { value: "8", label: "08:00 AM (08:00)" },
  { value: "9", label: "09:00 AM (09:00)" },
  { value: "10", label: "10:00 AM (10:00)" },
  { value: "11", label: "11:00 AM (11:00)" },
  { value: "12", label: "12:00 PM (12:00)" },
  { value: "13", label: "01:00 PM (13:00)" },
  { value: "14", label: "02:00 PM (14:00)" },
  { value: "15", label: "03:00 PM (15:00)" },
  { value: "16", label: "04:00 PM (16:00)" },
  { value: "17", label: "05:00 PM (17:00)" },
  { value: "18", label: "06:00 PM (18:00)" },
  { value: "19", label: "07:00 PM (19:00)" },
  { value: "20", label: "08:00 PM (20:00)" },
  { value: "21", label: "09:00 PM (21:00)" },
  { value: "22", label: "10:00 PM (22:00)" },
  { value: "23", label: "11:00 PM (23:00)" },
]

export const DAY_OPTIONS: CronOption[] = [
  { value: "*", label: "Every day (*)" },
  ...Array.from({ length: 31 }, (_, i) => ({
    value: String(i + 1),
    label: `${i + 1}`,
  })),
]

export const MONTH_OPTIONS: CronOption[] = [
  { value: "*", label: "Every month (*)" },
  { value: "1", label: "January (1)" },
  { value: "2", label: "February (2)" },
  { value: "3", label: "March (3)" },
  { value: "4", label: "April (4)" },
  { value: "5", label: "May (5)" },
  { value: "6", label: "June (6)" },
  { value: "7", label: "July (7)" },
  { value: "8", label: "August (8)" },
  { value: "9", label: "September (9)" },
  { value: "10", label: "October (10)" },
  { value: "11", label: "November (11)" },
  { value: "12", label: "December (12)" },
]

export const WEEKDAY_OPTIONS: CronOption[] = [
  { value: "*", label: "Every weekday (*)" },
  { value: "1-5", label: "Monday to Friday (1-5)" },
  { value: "0,6", label: "Weekends (Sat, Sun)" },
  { value: "0", label: "Sunday (0)" },
  { value: "1", label: "Monday (1)" },
  { value: "2", label: "Tuesday (2)" },
  { value: "3", label: "Wednesday (3)" },
  { value: "4", label: "Thursday (4)" },
  { value: "5", label: "Friday (5)" },
  { value: "6", label: "Saturday (6)" },
]

export function formatHumanSchedule(expr: string): string {
  const match = COMMON_PRESETS.find((p) => p.value === expr)
  if (match && match.value) {
    return match.label.replace(/\s*\(.*\)$/, "")
  }
  const parts = expr.trim().split(/\s+/)
  if (parts.length === 5) {
    const [min, hour, dom, mon, dow] = parts
    if (min.startsWith("*/") && hour === "*" && dom === "*" && mon === "*" && dow === "*") {
      return `Every ${min.slice(2)} minutes`
    }
    if (min === "0" && hour.startsWith("*/") && dom === "*" && mon === "*" && dow === "*") {
      return `Every ${hour.slice(2)} hours`
    }
    if (min === "0" && hour !== "*" && dom === "*" && mon === "*" && dow === "*") {
      const h = Number(hour)
      if (!Number.isNaN(h)) {
        const period = h >= 12 ? "PM" : "AM"
        const displayHour = h % 12 === 0 ? 12 : h % 12
        return `Daily at ${displayHour}:00 ${period}`
      }
    }
  }
  return "Recurring schedule"
}

export function formatRelativeTime(timestampNs: bigint | [] | [bigint] | undefined): string {
  let ns: bigint | undefined
  if (Array.isArray(timestampNs)) {
    if (timestampNs.length === 0) return "Never"
    ns = timestampNs[0]
  } else {
    ns = timestampNs
  }
  if (!ns) return "Never"
  const ms = Number(ns / 1_000_000n)
  if (!ms || Number.isNaN(ms) || ms <= 0) return "Never"
  const now = Date.now()
  const diffSec = Math.floor((now - ms) / 1000)
  if (diffSec < 60) return "Just now"
  const diffMin = Math.floor(diffSec / 60)
  if (diffMin < 60) return `${diffMin}m ago`
  const diffHour = Math.floor(diffMin / 60)
  if (diffHour < 24) return `${diffHour}h ago`
  const diffDay = Math.floor(diffHour / 24)
  if (diffDay < 30) return `${diffDay}d ago`
  return new Date(ms).toLocaleDateString()
}
