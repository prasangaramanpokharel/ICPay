import type { Identity } from "@icp-sdk/core/agent"
import { call, query, type Outcome } from "@/services/client"
import type { SettingsPublic } from "@/services/types"

export function getSettings(identity: Identity | undefined): Promise<SettingsPublic> {
  return query(identity, async (actor) => {
    const result = await actor.getSettings()
    if ("err" in result) throw new Error(result.err)
    return result.ok
  })
}

export function updateSettings(
  identity: Identity | undefined,
  settings: SettingsPublic
): Promise<Outcome<SettingsPublic>> {
  return call(identity, "Failed to save settings", (actor) =>
    actor.updateSettings(settings.theme, settings.language, settings.notifications)
  )
}
