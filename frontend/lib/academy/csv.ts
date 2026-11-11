import type { AdminLessonTypeKey } from "@/services/academy/client"

export interface ParsedCsvLesson {
  moduleTitle: string
  moduleDesc: string
  lessonTitle: string
  lessonType: AdminLessonTypeKey
  duration: number
  resourceUrl: string
  preview: boolean
  takeaways: string[]
}

export interface NewCourseDraft {
  id: string
  slug: string
  title: string
  headline: string
  description: string
  level: string
  badge: string
  priceIcp: string
  totalHours: number
  coverImage: string
  instructorName: string
  instructorRole: string
  isPublished: boolean
}

export const DEFAULT_NEW_COURSE: NewCourseDraft = {
  id: "",
  slug: "",
  title: "",
  headline: "",
  description: "",
  level: "Intermediate",
  badge: "Flagship Masterclass",
  priceIcp: "0",
  totalHours: 6,
  coverImage: "https://res.cloudinary.com/dn2ycbmrc/image/upload/v1791780069/onchain_dfcbj6.png",
  instructorName: "ICPay Engineering Core",
  instructorRole: "Core Protocol Engineers",
  isPublished: true,
}

export function slugifyText(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
}

function parseCsvRow(rowStr: string): string[] {
  const result: string[] = []
  let cur = ""
  let inQuotes = false
  for (let j = 0; j < rowStr.length; j++) {
    const char = rowStr[j]
    if (char === '"') {
      inQuotes = !inQuotes
    } else if (char === "," && !inQuotes) {
      result.push(cur.trim())
      cur = ""
    } else {
      cur += char
    }
  }
  result.push(cur.trim())
  return result
}

export function parseCurriculumCsv(raw: string): ParsedCsvLesson[] {
  const lines = raw
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
  if (lines.length === 0) return []

  const items: ParsedCsvLesson[] = []
  const isFirstLineHeader =
    lines[0].toLowerCase().includes("module") && lines[0].toLowerCase().includes("lesson")
  const startIndex = isFirstLineHeader ? 1 : 0

  for (let i = startIndex; i < lines.length; i++) {
    const parts = parseCsvRow(lines[i])
    if (parts.length >= 3) {
      const moduleTitle = parts[0] || "Module 01"
      const moduleDesc = parts[1] || ""
      const lessonTitle = parts[2] || "Lesson"
      const rawType = (parts[3] || "Video").toLowerCase()
      const lessonType: AdminLessonTypeKey = rawType.includes("quiz")
        ? "Quiz"
        : rawType.includes("code") || rawType.includes("lab")
          ? "CodeLab"
          : rawType.includes("read") || rawType.includes("guide")
            ? "Reading"
            : "Video"
      const duration = parseInt(parts[4]) || 20
      const resourceUrl = parts[5] || ""
      const preview = parts[6]?.toLowerCase() === "true" || parts[6] === "1"
      const takeaways = (parts[7] || "")
        .split(";")
        .map((t) => t.trim())
        .filter(Boolean)

      items.push({
        moduleTitle,
        moduleDesc,
        lessonTitle,
        lessonType,
        duration,
        resourceUrl,
        preview,
        takeaways,
      })
    }
  }

  return items
}

export const SAMPLE_CURRICULUM_CSV = [
  "Module,Module Description,Lesson Title,Type,Duration,Resource URL,Free Preview,Takeaways",
  "Module 01: Architecture & Actor Model,Foundations of the Internet Computer and actor messaging,Welcome & Canister Environment,Video,24,https://res.cloudinary.com/dn2ycbmrc/video/upload/v1792379282/howtocreatebucket_bdhzzv.mp4,true,WebAssembly runtime vs traditional EVM;Query vs update call mechanics;Cycle execution budgeting",
  "Module 01: Architecture & Actor Model,Foundations of the Internet Computer and actor messaging,Actor Concurrency & Asynchronous Messaging,Video,30,https://res.cloudinary.com/dn2ycbmrc/video/upload/v1792379282/howtocreatebucket_bdhzzv.mp4,false,Actor Model deterministic concurrency;Inter-canister call flow;Trap boundaries and rollback guarantees",
  "Module 01: Architecture & Actor Model,Foundations of the Internet Computer and actor messaging,Architecture & Concurrency Knowledge Check,Quiz,15,https://icpay.app/academy/quiz/module-01-architecture,true,10 questions on query vs update calls;Actor messaging guarantees;Passing threshold: 80%",
  "Module 02: Storage & Orthogonal Persistence,Canister memory layout stable structures and state management,Orthogonal Persistence & Memory Architecture Guide,Reading,25,https://internetcomputer.org/docs/current/motoko/main/base/,false,Orthogonal persistence vs SQL/NoSQL databases;Stable memory 64-bit address space;Memory high-water mark mechanics",
  "Module 02: Storage & Orthogonal Persistence,Canister memory layout stable structures and state management,Stable B-Tree & Memory Structures Lab,CodeLab,45,https://github.com/icpay/starter-motoko-stable-structures,true,Hands-on stable memory indexing;Upgradability without memory spikes;Zero-copy serialization",
  "Module 02: Storage & Orthogonal Persistence,Canister memory layout stable structures and state management,Production Storage & State Mastery Quiz,Quiz,20,https://icpay.app/academy/quiz/module-02-storage-mastery,false,Comprehensive 12-question quiz;Storage limits and cycle burn tests;Passing score 85% to qualify for certification",
].join("\n")
