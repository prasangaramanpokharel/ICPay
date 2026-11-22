export const CANISTER_TABS = [
  "overview",
  "logs",
  "snapshots",
  "assets",
  "audit",
  "settings",
] as const

export type CanisterNavTab = (typeof CANISTER_TABS)[number]

export const SETTINGS_SECTIONS = [
  "controllers",
  "resources",
  "visibility",
  "lifecycle",
] as const

export type SettingsNavSection = (typeof SETTINGS_SECTIONS)[number]

export function isCanisterNavTab(val: string | null | undefined): val is CanisterNavTab {
  return CANISTER_TABS.includes(val as CanisterNavTab)
}

export function isSettingsNavSection(val: string | null | undefined): val is SettingsNavSection {
  return SETTINGS_SECTIONS.includes(val as SettingsNavSection)
}

export function buildCanisterHref(
  id: string,
  opts?: { tab?: string; section?: string }
): string {
  const params = new URLSearchParams()
  params.set("id", id)

  const tab = opts?.tab
  if (tab && tab !== "overview" && isCanisterNavTab(tab)) {
    params.set("tab", tab)
  }

  const section = opts?.section
  if (tab === "settings" && section && section !== "controllers" && isSettingsNavSection(section)) {
    params.set("section", section)
  }

  return `/canister?${params.toString()}`
}
