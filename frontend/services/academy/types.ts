import type { Principal } from "@icp-sdk/core/principal"

export type RemoteLessonType = { Video: null } | { CodeLab: null } | { Reading: null } | { Quiz: null }

export interface RemoteLesson {
  id: string
  course_id: string
  module_id: string
  title: string
  slug: string
  description: string
  duration_minutes: number
  lesson_type: RemoteLessonType
  video_url: string
  thumbnail_url: string
  preview_available: boolean
  order: number
  key_takeaways: string[]
  created_at: bigint
}

export interface RemoteCourseModule {
  id: string
  course_id: string
  title: string
  slug: string
  description: string
  order: number
  estimated_hours: number
  created_at: bigint
}

export interface RemoteCourse {
  id: string
  slug: string
  title: string
  headline: string
  description: string
  level: string
  badge: string
  price_e8s: bigint
  total_hours: number
  total_lessons: number
  cover_image: string
  instructor_name: string
  instructor_role: string
  is_published: boolean
  created_at: bigint
  updated_at: bigint
}

export interface RemoteModuleDetail {
  id: string
  title: string
  slug: string
  description: string
  order: number
  estimated_hours: number
  lessons: RemoteLesson[]
}

export interface RemoteUserProgress {
  user: Principal
  course_id: string
  completed_lesson_ids: string[]
  percent_complete: number
  started_at: bigint
  last_active_at: bigint
  is_completed: boolean
  certificate_id: [] | [string]
}

export interface RemoteCourseDetail {
  course: RemoteCourse
  modules: RemoteModuleDetail[]
  is_enrolled: boolean
  user_progress: [] | [RemoteUserProgress]
}

export interface RemoteUserEnrollment {
  user: Principal
  course_id: string
  enrolled_at: bigint
  payment_block_index: [] | [bigint]
  amount_paid_e8s: bigint
}

export interface RemoteCertificate {
  id: string
  user: Principal
  course_id: string
  course_title: string
  issued_at: bigint
  verification_hash: string
}

export interface RemoteAcademyStats {
  total_courses: number
  total_modules: number
  total_lessons: number
  total_students: bigint
  total_enrollments: bigint
  today_enrollments: bigint
  total_completed_lessons: bigint
  total_certificates_issued: bigint
  total_revenue_e8s: bigint
}

export interface RemoteCourseStats {
  total_enrolled: bigint
  today_enrolled: bigint
  total_completed: bigint
  completion_rate_percent: number
}

export interface RemoteAuditLogEntry {
  id: bigint
  timestamp: bigint
  action: string
  admin: Principal
  target_id: string
  details: string
}

