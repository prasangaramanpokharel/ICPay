import type {
  RemoteCourse,
  RemoteCourseDetail,
} from "@/services/academy/types"

export type LessonType = "video" | "code_lab" | "reading" | "quiz"

export interface Lesson {
  id: string
  title: string
  slug: string
  description: string
  durationMinutes: number
  type: LessonType
  youtubeVideoId: string
  videoUrl?: string
  posterUrl?: string
  previewAvailable: boolean
  order: number
  keyTakeaways: string[]
}

export interface CourseModule {
  id: string
  title: string
  slug: string
  description: string
  order: number
  estimatedHours: number
  lessons: Lesson[]
}

export interface Course {
  id: string
  slug: string
  title: string
  headline: string
  description: string
  level: "Beginner" | "Intermediate" | "Advanced"
  badge: string
  price: string
  totalHours: number
  totalLessons: number
  featuredYoutubeId: string
  videoUrl?: string
  posterUrl?: string
  coverImage: string
  author: {
    name: string
    role: string
    avatar: string
  }
  modules: CourseModule[]
}

export interface LearningPath {
  id: string
  title: string
  description: string
  level: string
  duration: string
  coursesCount: number
  skills: string[]
  recommendedCourseId: string
}

export interface AcademyFaq {
  question: string
  answer: string
}

export function remoteCourseToCourse(
  remote: RemoteCourse,
  modules: CourseModule[] = []
): Course {
  const priceIcp = Number(remote.price_e8s) / 100_000_000
  const priceStr = remote.price_e8s === BigInt(0) ? "Free" : `${priceIcp} ICP`
  const firstVideo = modules[0]?.lessons[0]?.videoUrl || ""
  const firstPoster = modules[0]?.lessons[0]?.posterUrl || remote.cover_image

  return {
    id: remote.id,
    slug: remote.slug,
    title: remote.title,
    headline: remote.headline,
    description: remote.description,
    level: (["Beginner", "Intermediate", "Advanced"].includes(remote.level)
      ? remote.level
      : "Intermediate") as "Beginner" | "Intermediate" | "Advanced",
    badge: remote.badge,
    price: priceStr,
    totalHours: remote.total_hours,
    totalLessons: remote.total_lessons,
    featuredYoutubeId: "SxdOUGdseq4",
    videoUrl: firstVideo,
    posterUrl: firstPoster,
    coverImage: remote.cover_image,
    author: {
      name: remote.instructor_name || "ICPay",
      role: remote.instructor_role || "Core Protocol Engineering",
      avatar: "/images/logo/logo-256.webp",
    },
    modules,
  }
}

export function parseLessonType(
  rawType: unknown,
  title?: string,
  slug?: string
): LessonType {
  if (rawType && typeof rawType === "object") {
    if ("Quiz" in rawType || "quiz" in rawType) return "quiz"
    if ("CodeLab" in rawType || "code_lab" in rawType || "codeLab" in rawType) return "code_lab"
    if ("Reading" in rawType || "reading" in rawType) return "reading"
    if ("Video" in rawType || "video" in rawType) return "video"
  }
  if (typeof rawType === "string") {
    const lower = rawType.toLowerCase()
    if (lower === "quiz") return "quiz"
    if (lower === "codelab" || lower === "code_lab") return "code_lab"
    if (lower === "reading") return "reading"
    if (lower === "video") return "video"
  }
  const text = `${title || ""} ${slug || ""}`.toLowerCase()
  if (text.includes("quiz") || text.includes("exam") || text.includes("test")) return "quiz"
  if (text.includes("lab") || text.includes("hands-on") || text.includes("coding")) return "code_lab"
  if (text.includes("reading") || text.includes("deep dive") || text.includes("article")) return "reading"
  return "video"
}

export function remoteCourseDetailToCourse(detail: RemoteCourseDetail): Course {
  const modules: CourseModule[] = detail.modules.map((m) => ({
    id: m.id,
    title: m.title,
    slug: m.slug,
    description: m.description,
    order: m.order,
    estimatedHours: m.estimated_hours,
    lessons: m.lessons.map((l) => ({
      id: l.id,
      title: l.title,
      slug: l.slug,
      description: l.description,
      durationMinutes: l.duration_minutes,
      type: parseLessonType(l.lesson_type, l.title, l.slug),
      youtubeVideoId: "SxdOUGdseq4",
      videoUrl: l.video_url,
      posterUrl: l.thumbnail_url || detail.course.cover_image,
      previewAvailable: l.preview_available,
      order: l.order,
      keyTakeaways: l.key_takeaways,
    })),
  }))

  return remoteCourseToCourse(detail.course, modules)
}

export const ACADEMY_COURSES: Course[] = []

export const LEARNING_PATHS: LearningPath[] = [
  {
    id: "smart-contract-engineer",
    title: "Canister & Smart Contract Engineer",
    description:
      "Master the Motoko language, the actor model, persistent memory architecture, and multi-canister orchestration.",
    level: "Intermediate to Advanced",
    duration: "18 Hours",
    coursesCount: 1,
    skills: ["Motoko", "Actor Model", "Orthogonal Persistence", "PocketIC", "Cycle Economics"],
    recommendedCourseId: "icp-crash-course",
  },
]

export const ACADEMY_FAQS: AcademyFaq[] = [
  {
    question: "Do I need prior blockchain or Web3 experience to start?",
    answer:
      "No. The Internet Identity & Fintech track begins with basic web development concepts (TypeScript, REST, Next.js) and guides you through WebAuthn and passkey integration. Prior familiarity with JavaScript or TypeScript is recommended.",
  },
  {
    question: "How does Motoko differ from Solidity or Rust?",
    answer:
      "Motoko is designed from the ground up for the Internet Computer's actor model and orthogonal persistence. Unlike Solidity, memory is persistent across upgrades without manual databases, and async messaging operates with deterministic concurrency.",
  },
  {
    question: "Are the course lessons free to access?",
    answer:
      "Yes, foundational lessons and architecture breakdowns in every module are open-access. Hands-on capstones, interactive code labs, and verifiable on-chain completion credentials are unlocked upon connecting your Internet Identity.",
  },
  {
    question: "How do verifiable on-chain certificates work?",
    answer:
      "Upon completing all modules and capstone projects in a course track, an on-chain soulbound credential is automatically minted to your caller-derived subaccount, provable via any block explorer.",
  },
  {
    question: "Can I run code examples locally without spending real ICP?",
    answer:
      "Yes. All code labs include PocketIC configurations and local mock replica instructions, allowing you to run full integration test suites in milliseconds without deploying to mainnet or spending cycles.",
  },
]
