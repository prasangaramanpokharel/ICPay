import { Actor, type Identity } from "@icp-sdk/core/agent"
import { Principal } from "@icp-sdk/core/principal"
import { createAgent } from "@/services/icp"
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

export const ACADEMY_CANISTER_ID =
  process.env.NEXT_PUBLIC_ACADEMY_CANISTER_ID?.trim() || "wkdfn-yqaaa-aaaan-q6vyq-cai"

export type AcademyService = {
  get_academy_stats: () => Promise<RemoteAcademyStats>
  get_course_stats: (courseId: string) => Promise<[] | [RemoteCourseStats]>
  get_courses: () => Promise<RemoteCourse[]>
  get_course_by_slug: (slug: string) => Promise<[] | [RemoteCourse]>
  get_course_detail: (courseId: string) => Promise<[] | [RemoteCourseDetail]>
  get_lesson_video: (
    courseId: string,
    moduleId: string,
    lessonId: string
  ) => Promise<{ Ok: string } | { Err: string }>
  verify_certificate: (certificateId: string) => Promise<[] | [RemoteCertificate]>
  enroll_free: (courseId: string) => Promise<{ Ok: RemoteUserProgress } | { Err: string }>
  enroll_with_payment: (
    courseId: string,
    blockIndex: bigint
  ) => Promise<{ Ok: RemoteUserProgress } | { Err: string }>
  get_my_enrollments: () => Promise<RemoteUserEnrollment[]>
  get_my_progress: (courseId: string) => Promise<[] | [RemoteUserProgress]>
  complete_lesson: (
    courseId: string,
    lessonId: string
  ) => Promise<{ Ok: RemoteUserProgress } | { Err: string }>
  claim_certificate: (
    courseId: string
  ) => Promise<{ Ok: RemoteCertificate } | { Err: string }>
  is_caller_admin: () => Promise<boolean>
  get_treasury_address: () => Promise<string>
  get_treasury_balance: () => Promise<{ Ok: bigint } | { Err: string }>
  withdraw_treasury: (
    toAccount: string,
    amountE8s: bigint
  ) => Promise<{ Ok: bigint } | { Err: string }>
  create_course: (args: {
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
  }) => Promise<{ Ok: string } | { Err: string }>
  update_course: (args: {
    id: string
    slug: [] | [string]
    title: [] | [string]
    headline: [] | [string]
    description: [] | [string]
    level: [] | [string]
    badge: [] | [string]
    price_e8s: [] | [bigint]
    total_hours: [] | [number]
    cover_image: [] | [string]
    instructor_name: [] | [string]
    instructor_role: [] | [string]
    is_published: [] | [boolean]
  }) => Promise<{ Ok: null } | { Err: string }>
  delete_course: (courseId: string) => Promise<{ Ok: null } | { Err: string }>
  duplicate_course: (courseId: string) => Promise<{ Ok: string } | { Err: string }>
  publish_course: (courseId: string, isPublished: boolean) => Promise<{ Ok: null } | { Err: string }>
  set_course_price: (courseId: string, priceE8s: bigint) => Promise<{ Ok: null } | { Err: string }>
  add_module: (
    courseId: string,
    args: {
      id: string
      title: string
      slug: string
      description: string
      order: number
      estimated_hours: number
    }
  ) => Promise<{ Ok: string } | { Err: string }>
  update_module: (
    courseId: string,
    moduleId: string,
    args: {
      title: [] | [string]
      slug: [] | [string]
      description: [] | [string]
      order: [] | [number]
      estimated_hours: [] | [number]
    }
  ) => Promise<{ Ok: null } | { Err: string }>
  delete_module: (courseId: string, moduleId: string) => Promise<{ Ok: null } | { Err: string }>
  add_lesson: (
    courseId: string,
    moduleId: string,
    args: {
      id: string
      title: string
      slug: string
      description: string
      duration_minutes: number
      lesson_type: { Video: null } | { CodeLab: null } | { Reading: null } | { Quiz: null }
      video_url: string
      thumbnail_url: string
      preview_available: boolean
      order: number
      key_takeaways: string[]
    }
  ) => Promise<{ Ok: string } | { Err: string }>
  update_lesson: (
    courseId: string,
    moduleId: string,
    lessonId: string,
    args: {
      title: [] | [string]
      slug: [] | [string]
      description: [] | [string]
      duration_minutes: [] | [number]
      lesson_type: [] | [{ Video: null } | { CodeLab: null } | { Reading: null } | { Quiz: null }]
      video_url: [] | [string]
      thumbnail_url: [] | [string]
      preview_available: [] | [boolean]
      order: [] | [number]
      key_takeaways: [] | [string[]]
    }
  ) => Promise<{ Ok: null } | { Err: string }>
  delete_lesson: (
    courseId: string,
    moduleId: string,
    lessonId: string
  ) => Promise<{ Ok: null } | { Err: string }>
  add_admin: (admin: Principal, role: string) => Promise<{ Ok: null } | { Err: string }>
  remove_admin: (admin: Principal) => Promise<{ Ok: null } | { Err: string }>
  get_admins: () => Promise<[Principal, string][]>
  get_audit_log: (limit: number) => Promise<RemoteAuditLogEntry[]>
  get_all_courses_admin: () => Promise<RemoteCourse[]>
}

export async function getAcademyActor(
  identity?: Identity,
  canisterIdText = ACADEMY_CANISTER_ID
): Promise<AcademyService | null> {
  if (!canisterIdText) return null

  const agent = await createAgent(identity)
  return Actor.createActor<AcademyService>(
    ({ IDL }) => {
      const LessonType = IDL.Variant({
        Video: IDL.Null,
        CodeLab: IDL.Null,
        Reading: IDL.Null,
        Quiz: IDL.Null,
      })

      const Lesson = IDL.Record({
        id: IDL.Text,
        course_id: IDL.Text,
        module_id: IDL.Text,
        title: IDL.Text,
        slug: IDL.Text,
        description: IDL.Text,
        duration_minutes: IDL.Nat32,
        lesson_type: LessonType,
        video_url: IDL.Text,
        thumbnail_url: IDL.Text,
        preview_available: IDL.Bool,
        order: IDL.Nat32,
        key_takeaways: IDL.Vec(IDL.Text),
        created_at: IDL.Nat64,
      })

      const Course = IDL.Record({
        id: IDL.Text,
        slug: IDL.Text,
        title: IDL.Text,
        headline: IDL.Text,
        description: IDL.Text,
        level: IDL.Text,
        badge: IDL.Text,
        price_e8s: IDL.Nat64,
        total_hours: IDL.Nat32,
        total_lessons: IDL.Nat32,
        cover_image: IDL.Text,
        instructor_name: IDL.Text,
        instructor_role: IDL.Text,
        is_published: IDL.Bool,
        created_at: IDL.Nat64,
        updated_at: IDL.Nat64,
      })

      const ModuleDetail = IDL.Record({
        id: IDL.Text,
        title: IDL.Text,
        slug: IDL.Text,
        description: IDL.Text,
        order: IDL.Nat32,
        estimated_hours: IDL.Nat32,
        lessons: IDL.Vec(Lesson),
      })

      const UserProgress = IDL.Record({
        user: IDL.Principal,
        course_id: IDL.Text,
        completed_lesson_ids: IDL.Vec(IDL.Text),
        percent_complete: IDL.Nat8,
        started_at: IDL.Nat64,
        last_active_at: IDL.Nat64,
        is_completed: IDL.Bool,
        certificate_id: IDL.Opt(IDL.Text),
      })

      const CourseDetail = IDL.Record({
        course: Course,
        modules: IDL.Vec(ModuleDetail),
        is_enrolled: IDL.Bool,
        user_progress: IDL.Opt(UserProgress),
      })

      const UserEnrollment = IDL.Record({
        user: IDL.Principal,
        course_id: IDL.Text,
        enrolled_at: IDL.Nat64,
        payment_block_index: IDL.Opt(IDL.Nat64),
        amount_paid_e8s: IDL.Nat64,
      })

      const Certificate = IDL.Record({
        id: IDL.Text,
        user: IDL.Principal,
        course_id: IDL.Text,
        course_title: IDL.Text,
        issued_at: IDL.Nat64,
        verification_hash: IDL.Text,
      })

      const AcademyStats = IDL.Record({
        total_courses: IDL.Nat32,
        total_modules: IDL.Nat32,
        total_lessons: IDL.Nat32,
        total_students: IDL.Nat64,
        total_enrollments: IDL.Nat64,
        today_enrollments: IDL.Nat64,
        total_completed_lessons: IDL.Nat64,
        total_certificates_issued: IDL.Nat64,
        total_revenue_e8s: IDL.Nat64,
      })

      const CourseStats = IDL.Record({
        total_enrolled: IDL.Nat64,
        today_enrolled: IDL.Nat64,
        total_completed: IDL.Nat64,
        completion_rate_percent: IDL.Nat8,
      })

      const AuditLogEntry = IDL.Record({
        id: IDL.Nat64,
        timestamp: IDL.Nat64,
        action: IDL.Text,
        admin: IDL.Principal,
        target_id: IDL.Text,
        details: IDL.Text,
      })

      const CreateCourseArgs = IDL.Record({
        id: IDL.Text,
        slug: IDL.Text,
        title: IDL.Text,
        headline: IDL.Text,
        description: IDL.Text,
        level: IDL.Text,
        badge: IDL.Text,
        price_e8s: IDL.Nat64,
        total_hours: IDL.Nat32,
        cover_image: IDL.Text,
        instructor_name: IDL.Text,
        instructor_role: IDL.Text,
        is_published: IDL.Bool,
      })

      const UpdateCourseArgs = IDL.Record({
        id: IDL.Text,
        slug: IDL.Opt(IDL.Text),
        title: IDL.Opt(IDL.Text),
        headline: IDL.Opt(IDL.Text),
        description: IDL.Opt(IDL.Text),
        level: IDL.Opt(IDL.Text),
        badge: IDL.Opt(IDL.Text),
        price_e8s: IDL.Opt(IDL.Nat64),
        total_hours: IDL.Opt(IDL.Nat32),
        cover_image: IDL.Opt(IDL.Text),
        instructor_name: IDL.Opt(IDL.Text),
        instructor_role: IDL.Opt(IDL.Text),
        is_published: IDL.Opt(IDL.Bool),
      })

      const CreateModuleArgs = IDL.Record({
        id: IDL.Text,
        title: IDL.Text,
        slug: IDL.Text,
        description: IDL.Text,
        order: IDL.Nat32,
        estimated_hours: IDL.Nat32,
      })

      const UpdateModuleArgs = IDL.Record({
        title: IDL.Opt(IDL.Text),
        slug: IDL.Opt(IDL.Text),
        description: IDL.Opt(IDL.Text),
        order: IDL.Opt(IDL.Nat32),
        estimated_hours: IDL.Opt(IDL.Nat32),
      })

      const CreateLessonArgs = IDL.Record({
        id: IDL.Text,
        title: IDL.Text,
        slug: IDL.Text,
        description: IDL.Text,
        duration_minutes: IDL.Nat32,
        lesson_type: LessonType,
        video_url: IDL.Text,
        thumbnail_url: IDL.Text,
        preview_available: IDL.Bool,
        order: IDL.Nat32,
        key_takeaways: IDL.Vec(IDL.Text),
      })

      const UpdateLessonArgs = IDL.Record({
        title: IDL.Opt(IDL.Text),
        slug: IDL.Opt(IDL.Text),
        description: IDL.Opt(IDL.Text),
        duration_minutes: IDL.Opt(IDL.Nat32),
        lesson_type: IDL.Opt(LessonType),
        video_url: IDL.Opt(IDL.Text),
        thumbnail_url: IDL.Opt(IDL.Text),
        preview_available: IDL.Opt(IDL.Bool),
        order: IDL.Opt(IDL.Nat32),
        key_takeaways: IDL.Opt(IDL.Vec(IDL.Text)),
      })

      const Result = IDL.Variant({ Ok: IDL.Null, Err: IDL.Text })
      const ResultProgress = IDL.Variant({ Ok: UserProgress, Err: IDL.Text })
      const ResultCertificate = IDL.Variant({ Ok: Certificate, Err: IDL.Text })
      const ResultId = IDL.Variant({ Ok: IDL.Text, Err: IDL.Text })
      const ResultNat = IDL.Variant({ Ok: IDL.Nat64, Err: IDL.Text })

      return IDL.Service({
        get_academy_stats: IDL.Func([], [AcademyStats], ["query"]),
        get_course_stats: IDL.Func([IDL.Text], [IDL.Opt(CourseStats)], ["query"]),
        get_courses: IDL.Func([], [IDL.Vec(Course)], ["query"]),
        get_course_by_slug: IDL.Func([IDL.Text], [IDL.Opt(Course)], ["query"]),
        get_course_detail: IDL.Func([IDL.Text], [IDL.Opt(CourseDetail)], ["query"]),
        get_lesson_video: IDL.Func([IDL.Text, IDL.Text, IDL.Text], [ResultId], ["query"]),
        verify_certificate: IDL.Func([IDL.Text], [IDL.Opt(Certificate)], ["query"]),
        enroll_free: IDL.Func([IDL.Text], [ResultProgress], []),
        enroll_with_payment: IDL.Func([IDL.Text, IDL.Nat64], [ResultProgress], []),
        get_my_enrollments: IDL.Func([], [IDL.Vec(UserEnrollment)], ["query"]),
        get_my_progress: IDL.Func([IDL.Text], [IDL.Opt(UserProgress)], ["query"]),
        complete_lesson: IDL.Func([IDL.Text, IDL.Text], [ResultProgress], []),
        claim_certificate: IDL.Func([IDL.Text], [ResultCertificate], []),
        is_caller_admin: IDL.Func([], [IDL.Bool], ["query"]),
        get_treasury_address: IDL.Func([], [IDL.Text], ["query"]),
        get_treasury_balance: IDL.Func([], [ResultNat], []),
        withdraw_treasury: IDL.Func([IDL.Text, IDL.Nat64], [ResultNat], []),
        create_course: IDL.Func([CreateCourseArgs], [ResultId], []),
        update_course: IDL.Func([UpdateCourseArgs], [Result], []),
        delete_course: IDL.Func([IDL.Text], [Result], []),
        duplicate_course: IDL.Func([IDL.Text], [ResultId], []),
        publish_course: IDL.Func([IDL.Text, IDL.Bool], [Result], []),
        set_course_price: IDL.Func([IDL.Text, IDL.Nat64], [Result], []),
        add_module: IDL.Func([IDL.Text, CreateModuleArgs], [ResultId], []),
        update_module: IDL.Func([IDL.Text, IDL.Text, UpdateModuleArgs], [Result], []),
        delete_module: IDL.Func([IDL.Text, IDL.Text], [Result], []),
        add_lesson: IDL.Func([IDL.Text, IDL.Text, CreateLessonArgs], [ResultId], []),
        update_lesson: IDL.Func([IDL.Text, IDL.Text, IDL.Text, UpdateLessonArgs], [Result], []),
        delete_lesson: IDL.Func([IDL.Text, IDL.Text, IDL.Text], [Result], []),
        add_admin: IDL.Func([IDL.Principal, IDL.Text], [Result], []),
        remove_admin: IDL.Func([IDL.Principal], [Result], []),
        get_admins: IDL.Func([], [IDL.Vec(IDL.Tuple(IDL.Principal, IDL.Text))], ["query"]),
        get_audit_log: IDL.Func([IDL.Nat32], [IDL.Vec(AuditLogEntry)], ["query"]),
        get_all_courses_admin: IDL.Func([], [IDL.Vec(Course)], ["query"]),
      })
    },
    {
      agent,
      canisterId: Principal.fromText(canisterIdText),
    }
  )
}
