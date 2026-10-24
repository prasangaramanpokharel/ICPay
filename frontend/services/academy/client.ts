import type { Identity } from "@icp-sdk/core/agent"
import { getAcademyActor } from "./actor"
import type {
  RemoteAcademyStats,
  RemoteAuditLogEntry,
  RemoteCertificate,
  RemoteCourse,
  RemoteCourseDetail,
  RemoteCourseStats,
  RemoteUserEnrollment,
  RemoteUserProgress,
} from "./types"
import { transfer } from "@/services/transfer/transfer"
import { ICP_LEDGER_ID } from "@/services/tokens"

const AUDIT_LOG_KEY = "icpay_academy_audit_log"
const TREASURY_PAYOUTS_KEY = "icpay_academy_treasury_payouts"
const ENROLLED_COURSES_KEY_PREFIX = "icpay_academy_enrolled_"

export interface ClientAuditLog {
  id: string
  timestamp: number
  action: string
  admin: string
  targetId: string
  details: string
}

export interface TreasuryPayoutRecord {
  id: string
  timestamp: number
  toAccount: string
  amountE8s: string
  blockIndex?: string
  admin: string
  status: "completed" | "failed"
}

export function getStoredAuditLogs(): ClientAuditLog[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(AUDIT_LOG_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function recordAuditLog(
  action: string,
  admin: string,
  targetId: string,
  details: string
): void {
  if (typeof window === "undefined") return
  try {
    const logs = getStoredAuditLogs()
    const newEntry: ClientAuditLog = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: Date.now(),
      action,
      admin,
      targetId,
      details,
    }
    logs.unshift(newEntry)
    localStorage.setItem(AUDIT_LOG_KEY, JSON.stringify(logs.slice(0, 100)))
  } catch {}
}

export async function fetchAcademyStats(): Promise<RemoteAcademyStats> {
  try {
    const actor = await getAcademyActor()
    if (actor) {
      return await actor.get_academy_stats()
    }
  } catch {}

  return {
    total_courses: 0,
    total_modules: 0,
    total_lessons: 0,
    total_students: BigInt(0),
    total_enrollments: BigInt(0),
    today_enrollments: BigInt(0),
    total_completed_lessons: BigInt(0),
    total_certificates_issued: BigInt(0),
    total_revenue_e8s: BigInt(0),
  }
}

export async function fetchCourseStats(
  courseId: string
): Promise<RemoteCourseStats | null> {
  try {
    const actor = await getAcademyActor()
    if (actor) {
      const res = await actor.get_course_stats(courseId)
      return res.length > 0 && res[0] ? res[0] : null
    }
  } catch {}
  return null
}

export async function fetchCourses(
  includeDrafts = false,
  identity?: Identity
): Promise<RemoteCourse[]> {
  try {
    const actor = await getAcademyActor(identity)
    if (actor) {
      if (includeDrafts) {
        try {
          const adminCourses = await actor.get_all_courses_admin()
          if (adminCourses && adminCourses.length > 0) {
            return adminCourses
          }
        } catch {}
      }
      const courses = await actor.get_courses()
      return courses.filter((c) => includeDrafts || c.is_published)
    }
  } catch {}

  return []
}

export async function fetchCourseDetail(
  courseId: string,
  identity?: Identity
): Promise<RemoteCourseDetail | null> {
  try {
    const actor = await getAcademyActor(identity)
    if (actor) {
      const res = await actor.get_course_detail(courseId)
      if (res.length > 0 && res[0]) return res[0]

      const bySlug = await actor.get_course_by_slug(courseId)
      if (bySlug.length > 0 && bySlug[0]) {
        const resSlug = await actor.get_course_detail(bySlug[0].id)
        if (resSlug.length > 0 && resSlug[0]) return resSlug[0]
      }
    }
  } catch {}

  return null
}

export async function isCallerAdmin(identity?: Identity): Promise<boolean> {
  try {
    const actor = await getAcademyActor(identity)
    if (actor) {
      return await actor.is_caller_admin()
    }
  } catch {}
  return false
}

export async function enrollFree(
  courseId: string,
  identity: Identity
): Promise<RemoteUserProgress> {
  const actor = await getAcademyActor(identity)
  if (actor) {
    const res = await actor.enroll_free(courseId)
    if ("Ok" in res) return res.Ok
    throw new Error(res.Err)
  }
  throw new Error("Unable to connect to Academy canister")
}

export async function enrollWithPayment(
  courseId: string,
  blockIndex: bigint,
  identity: Identity
): Promise<RemoteUserProgress> {
  const actor = await getAcademyActor(identity)
  if (actor) {
    const res = await actor.enroll_with_payment(courseId, blockIndex)
    if ("Ok" in res) return res.Ok
    throw new Error(res.Err)
  }
  throw new Error("Unable to connect to Academy canister")
}

export async function completeLesson(
  courseId: string,
  lessonId: string,
  identity: Identity
): Promise<RemoteUserProgress> {
  const actor = await getAcademyActor(identity)
  if (actor) {
    const res = await actor.complete_lesson(courseId, lessonId)
    if ("Ok" in res) return res.Ok
    throw new Error(res.Err)
  }
  throw new Error("Unable to connect to Academy canister")
}

export async function claimCertificate(
  courseId: string,
  identity: Identity
): Promise<RemoteCertificate> {
  const actor = await getAcademyActor(identity)
  if (actor) {
    const res = await actor.claim_certificate(courseId)
    if ("Ok" in res) return res.Ok
    throw new Error(res.Err)
  }
  throw new Error("Unable to connect to Academy canister")
}

export async function verifyCertificate(
  certificateId: string
): Promise<RemoteCertificate | null> {
  const actor = await getAcademyActor()
  if (!actor) return null
  try {
    const res = await actor.verify_certificate(certificateId)
    return res.length > 0 && res[0] ? res[0] : null
  } catch {
    return null
  }
}

export function getLocalCertificate(
  courseId: string,
  principalText?: string
): RemoteCertificate | null {
  if (typeof window === "undefined") return null
  try {
    const key = principalText
      ? `icpay_academy_cert_${courseId}_${principalText}`
      : `icpay_academy_cert_${courseId}_guest`
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function saveLocalCertificate(
  courseId: string,
  certificate: RemoteCertificate,
  principalText?: string
): void {
  if (typeof window === "undefined") return
  try {
    const key = principalText
      ? `icpay_academy_cert_${courseId}_${principalText}`
      : `icpay_academy_cert_${courseId}_guest`
    localStorage.setItem(key, JSON.stringify(certificate))
    window.dispatchEvent(new Event("icpay_academy_certificate_claimed"))
  } catch {}
}

export async function fetchMyEnrollments(
  identity: Identity
): Promise<RemoteUserEnrollment[]> {
  const actor = await getAcademyActor(identity)
  if (!actor) return []
  try {
    return await actor.get_my_enrollments()
  } catch {
    return []
  }
}

export async function fetchMyProgress(
  courseId: string,
  identity: Identity
): Promise<RemoteUserProgress | null> {
  const actor = await getAcademyActor(identity)
  if (!actor) return null
  try {
    const res = await actor.get_my_progress(courseId)
    return res.length > 0 && res[0] ? res[0] : null
  } catch {
    return null
  }
}

export function getLocalUserEnrollments(principalText?: string): string[] {
  if (typeof window === "undefined") return []
  const key = principalText
    ? `${ENROLLED_COURSES_KEY_PREFIX}${principalText}`
    : "icpay_academy_enrolled_guest"
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function getLocalLessonProgress(
  courseId: string,
  principalText?: string
): Record<string, boolean> {
  if (typeof window === "undefined") return {}
  try {
    if (principalText) {
      const userRaw = localStorage.getItem(`icpay_academy_progress_${courseId}_${principalText}`)
      if (userRaw) return JSON.parse(userRaw)
    }
    const guestRaw = localStorage.getItem(`icpay_academy_progress_${courseId}_guest`)
    return guestRaw ? JSON.parse(guestRaw) : {}
  } catch {
    return {}
  }
}

export function saveLocalLessonProgress(
  courseId: string,
  progress: Record<string, boolean>,
  principalText?: string
): void {
  if (typeof window === "undefined") return
  try {
    const key = principalText
      ? `icpay_academy_progress_${courseId}_${principalText}`
      : `icpay_academy_progress_${courseId}_guest`
    localStorage.setItem(key, JSON.stringify(progress))
    window.dispatchEvent(new Event("icpay_academy_progress_changed"))
  } catch {}
}

export function getLocalCourseProgressPercent(
  courseId: string,
  totalLessons: number,
  principalText?: string
): number {
  if (typeof window === "undefined") return 0
  try {
    if (principalText) {
      const cached = localStorage.getItem(`icpay_academy_percent_${courseId}_${principalText}`)
      if (cached !== null) {
        const val = parseInt(cached, 10)
        if (!isNaN(val)) return Math.min(100, Math.max(0, val))
      }
    }
    const guestCached = localStorage.getItem(`icpay_academy_percent_${courseId}_guest`)
    if (guestCached !== null) {
      const val = parseInt(guestCached, 10)
      if (!isNaN(val)) return Math.min(100, Math.max(0, val))
    }

    const map = getLocalLessonProgress(courseId, principalText)
    const completedCount = Object.values(map).filter(Boolean).length
    if (totalLessons > 0) {
      return Math.min(100, Math.round((completedCount / totalLessons) * 100))
    }
    return 0
  } catch {
    return 0
  }
}

export function saveLocalCourseProgressPercent(
  courseId: string,
  percent: number,
  principalText?: string
): void {
  if (typeof window === "undefined") return
  try {
    const clamped = Math.min(100, Math.max(0, percent))
    const key = principalText
      ? `icpay_academy_percent_${courseId}_${principalText}`
      : `icpay_academy_percent_${courseId}_guest`
    localStorage.setItem(key, clamped.toString())
    window.dispatchEvent(new Event("icpay_academy_progress_changed"))
  } catch {}
}

export async function syncCourseProgress(
  courseId: string,
  identity?: Identity
): Promise<{ percent: number; completedLessonIds: string[] } | null> {
  if (!identity) return null
  try {
    const remote = await fetchMyProgress(courseId, identity)
    if (remote) {
      const principalText = identity.getPrincipal().toText()
      const map = getLocalLessonProgress(courseId, principalText)
      for (const id of remote.completed_lesson_ids) {
        map[id] = true
      }

      const remoteSet = new Set(remote.completed_lesson_ids)
      for (const [id, completed] of Object.entries(map)) {
        if (completed && !remoteSet.has(id)) {
          try {
            await completeLesson(courseId, id, identity)
            remote.completed_lesson_ids.push(id)
            remoteSet.add(id)
          } catch {}
        }
      }

      saveLocalLessonProgress(courseId, map, principalText)
      const pct = Math.max(
        remote.percent_complete,
        getLocalCourseProgressPercent(courseId, remote.completed_lesson_ids.length, principalText)
      )
      saveLocalCourseProgressPercent(courseId, pct, principalText)

      if (remote.certificate_id && remote.certificate_id.length > 0 && remote.certificate_id[0]) {
        const certId = remote.certificate_id[0]
        void verifyCertificate(certId).then((cert) => {
          if (cert) {
            saveLocalCertificate(courseId, cert, principalText)
          }
        })
      }

      return {
        percent: pct,
        completedLessonIds: remote.completed_lesson_ids,
      }
    }
  } catch {}
  return null
}

export function saveLocalUserEnrollment(courseId: string, principalText?: string): void {
  if (typeof window === "undefined") return
  const key = principalText
    ? `${ENROLLED_COURSES_KEY_PREFIX}${principalText}`
    : "icpay_academy_enrolled_guest"
  try {
    const list = getLocalUserEnrollments(principalText)
    if (!list.includes(courseId)) {
      list.push(courseId)
      localStorage.setItem(key, JSON.stringify(list))
    }
  } catch {}
}

export async function isUserEnrolledInCourse(
  courseId: string,
  identity?: Identity
): Promise<boolean> {
  const principalText = identity?.getPrincipal().toText()
  const localList = getLocalUserEnrollments(principalText)
  if (localList.includes(courseId)) return true

  if (identity) {
    try {
      const remote = await fetchMyEnrollments(identity)
      if (remote.some((e) => e.course_id === courseId)) {
        saveLocalUserEnrollment(courseId, principalText)
        return true
      }
    } catch {}
  }
  return false
}

export async function purchaseCourse(
  courseId: string,
  priceE8s: bigint,
  identity: Identity
): Promise<{ blockIndex: bigint }> {
  const treasuryAddress = await fetchTreasuryAddress()
  let blockIndex = BigInt(0)

  const outcome = await transfer(
    identity,
    ICP_LEDGER_ID,
    "account",
    treasuryAddress,
    priceE8s,
    `academy:${courseId}`
  )

  if ("ok" in outcome) {
    blockIndex = outcome.ok.blockIndex
  } else {
    throw new Error(outcome.err || "Payment transfer failed on ICP ledger")
  }

  await enrollWithPayment(courseId, blockIndex, identity)
  saveLocalUserEnrollment(courseId, identity.getPrincipal().toText())
  return { blockIndex }
}

export interface AdminCreateCoursePayload {
  id: string
  slug: string
  title: string
  headline: string
  description: string
  level: string
  badge: string
  price_e8s: bigint
  total_hours: number
  cover_image: string
  instructor_name: string
  instructor_role: string
  is_published: boolean
}

export async function adminCreateCourse(
  payload: AdminCreateCoursePayload,
  adminEmail: string,
  identity?: Identity
): Promise<string> {
  const actor = await getAcademyActor(identity)
  if (!actor) throw new Error("Canister client unavailable")

  const res = await actor.create_course({
    id: payload.id,
    slug: payload.slug,
    title: payload.title,
    headline: payload.headline,
    description: payload.description,
    level: payload.level,
    badge: payload.badge,
    price_e8s: payload.price_e8s,
    total_hours: payload.total_hours,
    cover_image: payload.cover_image,
    instructor_name: payload.instructor_name,
    instructor_role: payload.instructor_role,
    is_published: payload.is_published,
  })

  if ("Ok" in res) {
    recordAuditLog("create_course", adminEmail, payload.id, `Created course "${payload.title}"`)
    return res.Ok
  }
  throw new Error(res.Err)
}

export async function adminUpdateCourse(
  courseId: string,
  updates: Partial<RemoteCourse>,
  adminEmail: string,
  identity?: Identity
): Promise<void> {
  const actor = await getAcademyActor(identity)
  if (!actor) throw new Error("Canister client unavailable")

  const res = await actor.update_course({
    id: courseId,
    slug: updates.slug !== undefined ? [updates.slug] : [],
    title: updates.title !== undefined ? [updates.title] : [],
    headline: updates.headline !== undefined ? [updates.headline] : [],
    description: updates.description !== undefined ? [updates.description] : [],
    level: updates.level !== undefined ? [updates.level] : [],
    badge: updates.badge !== undefined ? [updates.badge] : [],
    price_e8s: updates.price_e8s !== undefined ? [updates.price_e8s] : [],
    total_hours: updates.total_hours !== undefined ? [updates.total_hours] : [],
    cover_image: updates.cover_image !== undefined ? [updates.cover_image] : [],
    instructor_name: updates.instructor_name !== undefined ? [updates.instructor_name] : [],
    instructor_role: updates.instructor_role !== undefined ? [updates.instructor_role] : [],
    is_published: updates.is_published !== undefined ? [updates.is_published] : [],
  })

  if ("Ok" in res) {
    recordAuditLog(
      "update_course",
      adminEmail,
      courseId,
      `Updated fields: ${Object.keys(updates).join(", ")}`
    )
    return
  }
  throw new Error(res.Err)
}

export async function adminDeleteCourse(
  courseId: string,
  adminEmail: string,
  identity?: Identity
): Promise<void> {
  const actor = await getAcademyActor(identity)
  if (!actor) throw new Error("Canister client unavailable")

  const res = await actor.delete_course(courseId)
  if ("Ok" in res) {
    recordAuditLog(
      "delete_course",
      adminEmail,
      courseId,
      "Cascading deletion of course, modules, and lessons"
    )
    return
  }
  throw new Error(res.Err)
}

export async function adminDuplicateCourse(
  courseId: string,
  adminEmail: string,
  identity?: Identity
): Promise<string> {
  const actor = await getAcademyActor(identity)
  if (!actor) throw new Error("Canister client unavailable")

  const res = await actor.duplicate_course(courseId)
  if ("Ok" in res) {
    recordAuditLog("duplicate_course", adminEmail, res.Ok, `Cloned from ${courseId}`)
    return res.Ok
  }
  throw new Error(res.Err)
}

export async function adminTogglePublish(
  courseId: string,
  isPublished: boolean,
  adminEmail: string,
  identity?: Identity
): Promise<void> {
  const actor = await getAcademyActor(identity)
  if (!actor) throw new Error("Canister client unavailable")

  const res = await actor.publish_course(courseId, isPublished)
  if ("Ok" in res) {
    recordAuditLog(
      isPublished ? "publish_course" : "unpublish_course",
      adminEmail,
      courseId,
      `Status set to ${isPublished ? "Published" : "Draft"}`
    )
    return
  }
  throw new Error(res.Err)
}

export async function adminSetPrice(
  courseId: string,
  priceE8s: bigint,
  adminEmail: string,
  identity?: Identity
): Promise<void> {
  const actor = await getAcademyActor(identity)
  if (!actor) throw new Error("Canister client unavailable")

  const res = await actor.set_course_price(courseId, priceE8s)
  if ("Ok" in res) {
    recordAuditLog(
      "set_price",
      adminEmail,
      courseId,
      `Price updated to ${priceE8s === BigInt(0) ? "Free" : `${Number(priceE8s) / 100_000_000} ICP`}`
    )
    return
  }
  throw new Error(res.Err)
}

export interface AdminAddModulePayload {
  id?: string
  title: string
  slug?: string
  description: string
  order?: number
  estimated_hours?: number
}

export type AdminLessonTypeKey = "Video" | "CodeLab" | "Reading" | "Quiz"

export interface AdminAddLessonPayload {
  id?: string
  title: string
  slug?: string
  description: string
  durationMinutes: number
  lessonType?: AdminLessonTypeKey
  videoUrl: string
  thumbnailUrl: string
  previewAvailable: boolean
  order?: number
  keyTakeaways?: string[]
}

export async function adminAddModule(
  courseId: string,
  payload: AdminAddModulePayload,
  adminEmail: string,
  identity?: Identity
): Promise<string> {
  const actor = await getAcademyActor(identity)
  if (!actor) throw new Error("Canister client unavailable")

  const newModId = payload.id?.trim() || `mod-${Date.now()}`
  const slug = payload.slug?.trim() || payload.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")

  const res = await actor.add_module(courseId, {
    id: newModId,
    title: payload.title,
    slug,
    description: payload.description,
    order: payload.order ?? 1,
    estimated_hours: payload.estimated_hours ?? 2,
  })

  if ("Ok" in res) {
    recordAuditLog("add_module", adminEmail, res.Ok, `Added module "${payload.title}" to ${courseId}`)
    return res.Ok
  }
  throw new Error(res.Err)
}

export async function adminDeleteModule(
  courseId: string,
  moduleId: string,
  adminEmail: string,
  identity?: Identity
): Promise<void> {
  const actor = await getAcademyActor(identity)
  if (!actor) throw new Error("Canister client unavailable")

  const res = await actor.delete_module(courseId, moduleId)
  if ("Ok" in res) {
    recordAuditLog("delete_module", adminEmail, moduleId, `Deleted module from ${courseId}`)
    return
  }
  throw new Error(res.Err)
}

export async function adminAddLesson(
  courseId: string,
  moduleId: string,
  payload: AdminAddLessonPayload,
  adminEmail: string,
  identity?: Identity
): Promise<string> {
  const actor = await getAcademyActor(identity)
  if (!actor) throw new Error("Canister client unavailable")

  const newLessonId = payload.id?.trim() || `les-${Date.now()}`
  const slug = payload.slug?.trim() || payload.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")

  let lessonTypeVariant: { Video: null } | { CodeLab: null } | { Reading: null } | { Quiz: null } = { Video: null }
  if (payload.lessonType === "CodeLab") lessonTypeVariant = { CodeLab: null }
  else if (payload.lessonType === "Reading") lessonTypeVariant = { Reading: null }
  else if (payload.lessonType === "Quiz") lessonTypeVariant = { Quiz: null }

  const res = await actor.add_lesson(courseId, moduleId, {
    id: newLessonId,
    title: payload.title,
    slug,
    description: payload.description,
    duration_minutes: payload.durationMinutes,
    lesson_type: lessonTypeVariant,
    video_url: payload.videoUrl,
    thumbnail_url: payload.thumbnailUrl,
    preview_available: payload.previewAvailable,
    order: payload.order ?? 1,
    key_takeaways: payload.keyTakeaways && payload.keyTakeaways.length > 0
      ? payload.keyTakeaways
      : ["Web3 Architecture", "On-Chain Verification"],
  })

  if ("Ok" in res) {
    recordAuditLog("add_lesson", adminEmail, res.Ok, `Added lesson "${payload.title}"`)
    return res.Ok
  }
  throw new Error(res.Err)
}

export async function adminDeleteLesson(
  courseId: string,
  moduleId: string,
  lessonId: string,
  adminEmail: string,
  identity?: Identity
): Promise<void> {
  const actor = await getAcademyActor(identity)
  if (!actor) throw new Error("Canister client unavailable")

  const res = await actor.delete_lesson(courseId, moduleId, lessonId)
  if ("Ok" in res) {
    recordAuditLog("delete_lesson", adminEmail, lessonId, `Deleted lesson from ${courseId}`)
    return
  }
  throw new Error(res.Err)
}

export async function fetchAuditLogs(
  limit = 50,
  identity?: Identity
): Promise<ClientAuditLog[]> {
  try {
    const actor = await getAcademyActor(identity)
    if (actor) {
      const logs = await actor.get_audit_log(limit)
      if (logs && logs.length > 0) {
        return logs.map((l: RemoteAuditLogEntry) => ({
          id: l.id.toString(),
          timestamp: Number(l.timestamp / BigInt(1_000_000)),
          action: l.action,
          admin: l.admin.toText(),
          targetId: l.target_id,
          details: l.details,
        }))
      }
    }
  } catch {}
  return getStoredAuditLogs()
}

export function getStoredPayoutRecords(): TreasuryPayoutRecord[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(TREASURY_PAYOUTS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function setStoredPayoutRecords(records: TreasuryPayoutRecord[]): void {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(TREASURY_PAYOUTS_KEY, JSON.stringify(records))
  } catch {}
}

export async function fetchTreasuryAddress(): Promise<string> {
  try {
    const actor = await getAcademyActor()
    if (actor) {
      const addr = await actor.get_treasury_address()
      if (addr) return addr
    }
  } catch {}
  return "wkdfn-yqaaa-aaaan-q6vyq-cai"
}

export async function fetchTreasuryBalance(): Promise<bigint> {
  try {
    const actor = await getAcademyActor()
    if (actor) {
      const res = await actor.get_treasury_balance()
      if ("Ok" in res) return res.Ok
    }
  } catch {}

  return BigInt(0)
}

export async function adminWithdrawTreasury(
  toAccount: string,
  amountE8s: bigint,
  adminEmail: string,
  identity?: Identity
): Promise<bigint> {
  if (amountE8s <= BigInt(10_000)) {
    throw new Error("Withdrawal amount must be greater than ledger fee (0.0001 ICP)")
  }

  const actor = await getAcademyActor(identity)
  if (!actor) throw new Error("Canister client unavailable")

  const res = await actor.withdraw_treasury(toAccount, amountE8s)
  if ("Ok" in res) {
    const blockIndex = res.Ok
    const record: TreasuryPayoutRecord = {
      id: `payout-${Date.now()}`,
      timestamp: Date.now(),
      toAccount,
      amountE8s: amountE8s.toString(),
      blockIndex: blockIndex.toString(),
      admin: adminEmail,
      status: "completed",
    }
    const existing = getStoredPayoutRecords()
    existing.unshift(record)
    setStoredPayoutRecords(existing)

    const icpFormatted = (Number(amountE8s) / 100_000_000).toFixed(4)
    recordAuditLog(
      "treasury_withdraw",
      adminEmail,
      `block-${blockIndex}`,
      `Withdrew ${icpFormatted} ICP to ${toAccount.slice(0, 8)}...${toAccount.slice(-6)}`
    )
    return blockIndex
  }

  const failRecord: TreasuryPayoutRecord = {
    id: `payout-${Date.now()}`,
    timestamp: Date.now(),
    toAccount,
    amountE8s: amountE8s.toString(),
    admin: adminEmail,
    status: "failed",
  }
  const existing = getStoredPayoutRecords()
  existing.unshift(failRecord)
  setStoredPayoutRecords(existing)
  throw new Error(res.Err)
}
