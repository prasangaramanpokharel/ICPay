import { Actor, type Identity } from "@icp-sdk/core/agent"
import { Principal } from "@icp-sdk/core/principal"
import { IDL } from "@icp-sdk/core/candid"
import type { IcManagementDid } from "@icp-sdk/canisters/ic-management"
import { createAgent } from "@/services/icp"
import { parseCanisterId } from "@/services/cycles/topUp"
import { formatNsTimestamp, formatModuleHash } from "@/lib/canister/format"
import { fetchCanisterStatus } from "@/services/canister/management"

export type CanisterChangeKind =
  | "code_deployment"
  | "creation"
  | "load_snapshot"
  | "controllers_change"
  | "code_uninstall"
  | "rename_canister"
  | "unknown"

export type CanisterChangeRecord = {
  timestampNanos: bigint
  canisterVersion: string
  origin: string
  kind: CanisterChangeKind
  summary: string
  timeFormatted: string
  detailsRaw: string
}

export type CanisterAuditInfo = {
  canisterId: string
  totalNumChanges: number
  controllers: string[]
  moduleHash: string
  recentChanges: CanisterChangeRecord[]
  restrictedByReplica?: boolean
}

const canisterInfoIdl: IDL.InterfaceFactory = ({ IDL: idl }) => {
  const canister_id = idl.Principal
  const canister_info_args = idl.Record({
    canister_id: canister_id,
    num_requested_changes: idl.Opt(idl.Nat64),
  })
  const change_origin = idl.Variant({
    from_user: idl.Record({ user_id: idl.Principal }),
    from_canister: idl.Record({
      canister_version: idl.Opt(idl.Nat64),
      canister_id: canister_id,
    }),
  })
  const change_details = idl.Variant({
    creation: idl.Record({
      controllers: idl.Vec(idl.Principal),
      environment_variables_hash: idl.Opt(idl.Vec(idl.Nat8)),
    }),
    code_deployment: idl.Record({
      mode: idl.Variant({
        reinstall: idl.Null,
        upgrade: idl.Null,
        install: idl.Null,
      }),
      module_hash: idl.Vec(idl.Nat8),
    }),
    load_snapshot: idl.Record({
      canister_version: idl.Nat64,
      source: idl.Variant({
        metadata_upload: idl.Record({}),
        taken_from_canister: idl.Record({}),
      }),
      from_canister_id: idl.Opt(idl.Principal),
      taken_at_timestamp: idl.Nat64,
      snapshot_id: idl.Vec(idl.Nat8),
    }),
    rename_canister: idl.Record({
      rename_to: idl.Record({
        canister_id: canister_id,
        version: idl.Nat64,
        total_num_changes: idl.Nat64,
      }),
      canister_id: canister_id,
      requested_by: idl.Principal,
      total_num_changes: idl.Nat64,
    }),
    controllers_change: idl.Record({
      controllers: idl.Vec(idl.Principal),
    }),
    code_uninstall: idl.Null,
  })
  const change = idl.Record({
    timestamp_nanos: idl.Nat64,
    canister_version: idl.Nat64,
    origin: change_origin,
    details: change_details,
  })
  const canister_info_result = idl.Record({
    controllers: idl.Vec(idl.Principal),
    module_hash: idl.Opt(idl.Vec(idl.Nat8)),
    recent_changes: idl.Vec(change),
    total_num_changes: idl.Nat64,
  })
  return idl.Service({
    canister_info: idl.Func([canister_info_args], [canister_info_result], []),
  })
}

function parseOrigin(origin: IcManagementDid.change["origin"]): string {
  if ("from_user" in origin) {
    return origin.from_user.user_id.toText()
  }
  if ("from_canister" in origin) {
    return origin.from_canister.canister_id.toText()
  }
  return "Unknown"
}

function parseDetails(details: IcManagementDid.change["details"]): {
  kind: CanisterChangeKind
  summary: string
  detailsRaw: string
} {
  if ("code_deployment" in details) {
    const deployment = details.code_deployment
    let mode = "Upgrade"
    if ("install" in deployment.mode) mode = "Install"
    else if ("reinstall" in deployment.mode) mode = "Reinstall"
    const hash = formatModuleHash(deployment.module_hash)
    return {
      kind: "code_deployment",
      summary: `${mode} (module: ${hash})`,
      detailsRaw: JSON.stringify(deployment, (_, v) => (typeof v === "bigint" ? v.toString() : v)),
    }
  }

  if ("creation" in details) {
    const creation = details.creation
    const count = creation.controllers.length
    return {
      kind: "creation",
      summary: `Created with ${count} controller${count === 1 ? "" : "s"}`,
      detailsRaw: JSON.stringify(creation, (_, v) => (typeof v === "bigint" ? v.toString() : v)),
    }
  }

  if ("controllers_change" in details) {
    const changeList = details.controllers_change
    const count = changeList.controllers.length
    return {
      kind: "controllers_change",
      summary: `Controllers updated (${count} controller${count === 1 ? "" : "s"})`,
      detailsRaw: JSON.stringify(changeList, (_, v) => (typeof v === "bigint" ? v.toString() : v)),
    }
  }

  if ("load_snapshot" in details) {
    const snap = details.load_snapshot
    return {
      kind: "load_snapshot",
      summary: `Snapshot loaded (version ${snap.canister_version.toString()})`,
      detailsRaw: JSON.stringify(snap, (_, v) => (typeof v === "bigint" ? v.toString() : v)),
    }
  }

  if ("code_uninstall" in details) {
    return {
      kind: "code_uninstall",
      summary: "Canister code uninstalled",
      detailsRaw: "{}",
    }
  }

  if ("rename_canister" in details) {
    return {
      kind: "rename_canister",
      summary: "Canister renamed",
      detailsRaw: JSON.stringify(details.rename_canister, (_, v) =>
        typeof v === "bigint" ? v.toString() : v
      ),
    }
  }

  return {
    kind: "unknown",
    summary: "Change recorded",
    detailsRaw: "{}",
  }
}

export async function fetchCanisterAuditInfo(
  identity: Identity,
  canisterIdText: string,
  numRequestedChanges = 25n
): Promise<CanisterAuditInfo> {
  const targetId = parseCanisterId(canisterIdText)
  const agent = await createAgent(identity)

  try {
    const mgmtActor = Actor.createActor<{
      canister_info: (args: {
        canister_id: Principal
        num_requested_changes: [] | [bigint]
      }) => Promise<IcManagementDid.canister_info_result>
    }>(canisterInfoIdl, {
      agent,
      canisterId: Principal.fromHex(""),
      callTransform: (_method, _args, config) => ({
        ...config,
        effectiveCanisterId: targetId,
      }),
      queryTransform: (_method, _args, config) => ({
        ...config,
        effectiveCanisterId: targetId,
      }),
    })

    const raw = await mgmtActor.canister_info({
      canister_id: targetId,
      num_requested_changes: [numRequestedChanges],
    })

    const recentChanges: CanisterChangeRecord[] = raw.recent_changes.map(
      (item: IcManagementDid.change) => {
        const { kind, summary, detailsRaw } = parseDetails(item.details)
        return {
          timestampNanos: item.timestamp_nanos,
          canisterVersion: item.canister_version.toString(),
          origin: parseOrigin(item.origin),
          kind,
          summary,
          timeFormatted: formatNsTimestamp(item.timestamp_nanos),
          detailsRaw,
        }
      }
    )

    recentChanges.sort((a, b) => Number(b.timestampNanos - a.timestampNanos))

    return {
      canisterId: targetId.toText(),
      totalNumChanges: Number(raw.total_num_changes),
      controllers: raw.controllers.map((c: Principal) => c.toText()),
      moduleHash: formatModuleHash(raw.module_hash[0] ?? null),
      recentChanges,
      restrictedByReplica: false,
    }
  } catch (err) {
    const errStr = String(err)
    if (
      errStr.includes("Only canisters can call ic00 method canister_info") ||
      errStr.includes("IC0406")
    ) {
      const status = await fetchCanisterStatus(identity, canisterIdText)
      return {
        canisterId: targetId.toText(),
        totalNumChanges: 0,
        controllers: status.controllers,
        moduleHash: status.moduleHash,
        recentChanges: [],
        restrictedByReplica: true,
      }
    }
    throw err
  }
}
