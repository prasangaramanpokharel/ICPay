"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { toast } from "sonner"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Spinner } from "@/components/ui/spinner"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Layers01Icon,
  Delete01Icon,
  Copy01Icon,
  Coins01Icon,
  ArrowRight01Icon,
  ArrowLeft01Icon,
  Add01Icon,
  Upload01Icon,
  Download01Icon,
} from "@hugeicons/core-free-icons"
import {
  fetchCourses,
  fetchCourseDetail,
  adminCreateCourse,
  adminDeleteCourse,
  adminDuplicateCourse,
  adminTogglePublish,
  adminSetPrice,
  adminAddModule,
  adminDeleteModule,
  adminAddLesson,
  adminDeleteLesson,
  type AdminLessonTypeKey,
} from "@/services/academy/client"
import { getAdminSession } from "@/services/academy/admin-auth"
import { useAuth } from "@/components/auth/auth-provider"
import type { RemoteCourse, RemoteCourseDetail } from "@/services/academy/types"

interface ParsedCsvLesson {
  moduleTitle: string
  moduleDesc: string
  lessonTitle: string
  lessonType: AdminLessonTypeKey
  duration: number
  resourceUrl: string
  preview: boolean
  takeaways: string[]
}

export default function AcademyAdminCoursesPage() {
  const { identity, isAuthenticated, login } = useAuth()
  const [courses, setCourses] = useState<RemoteCourse[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [createStep, setCreateStep] = useState<1 | 2>(1)
  const [isSubmittingCreate, setIsSubmittingCreate] = useState(false)
  const [newCourse, setNewCourse] = useState({
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
  })

  const [curriculumCourse, setCurriculumCourse] = useState<RemoteCourseDetail | null>(null)
  const [curriculumDialogOpen, setCurriculumDialogOpen] = useState(false)
  const [isLoadingCurriculum, setIsLoadingCurriculum] = useState(false)

  const [newModuleTitle, setNewModuleTitle] = useState("")
  const [newModuleSlug, setNewModuleSlug] = useState("")
  const [newModuleDesc, setNewModuleDesc] = useState("")
  const [newModuleOrder, setNewModuleOrder] = useState(1)
  const [newModuleHours, setNewModuleHours] = useState(2)
  const [isSubmittingModule, setIsSubmittingModule] = useState(false)

  const [activeModuleForLesson, setActiveModuleForLesson] = useState<string | null>(null)
  const [newLessonTitle, setNewLessonTitle] = useState("")
  const [newLessonSlug, setNewLessonSlug] = useState("")
  const [newLessonDesc, setNewLessonDesc] = useState("")
  const [newLessonDuration, setNewLessonDuration] = useState(20)
  const [newLessonType, setNewLessonType] = useState<AdminLessonTypeKey>("Video")
  const [newLessonVideoUrl, setNewLessonVideoUrl] = useState("")
  const [newLessonThumbnail, setNewLessonThumbnail] = useState("")
  const [newLessonPreview, setNewLessonPreview] = useState(false)
  const [newLessonOrder, setNewLessonOrder] = useState(1)
  const [newLessonKeyTakeaways, setNewLessonKeyTakeaways] = useState("")
  const [isSubmittingLesson, setIsSubmittingLesson] = useState(false)

  const [csvImportOpen, setCsvImportOpen] = useState(false)
  const [csvRawText, setCsvRawText] = useState("")
  const [parsedCsvItems, setParsedCsvItems] = useState<ParsedCsvLesson[]>([])
  const [isImportingCsv, setIsImportingCsv] = useState(false)

  const [deleteCourseTarget, setDeleteCourseTarget] = useState<{ id: string; title: string } | null>(null)
  const [isDeletingCourse, setIsDeletingCourse] = useState(false)

  const [deleteModuleTarget, setDeleteModuleTarget] = useState<{
    courseId: string
    moduleId: string
    title: string
  } | null>(null)
  const [isDeletingModule, setIsDeletingModule] = useState(false)

  const [deleteLessonTarget, setDeleteLessonTarget] = useState<{
    courseId: string
    moduleId: string
    lessonId: string
    title: string
  } | null>(null)
  const [isDeletingLesson, setIsDeletingLesson] = useState(false)

  const [priceCourseId, setPriceCourseId] = useState<string | null>(null)
  const [newPriceIcp, setNewPriceIcp] = useState("0")
  const [isSubmittingPrice, setIsSubmittingPrice] = useState(false)

  const getActiveAdminEmail = () => {
    return getAdminSession()?.email || "admin@icpay.app"
  }

  const loadAllCourses = async () => {
    try {
      const data = await fetchCourses(true, identity)
      setCourses(data)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    let active = true
    fetchCourses(true, identity).then((data) => {
      if (active) {
        setCourses(data)
        setIsLoading(false)
      }
    })
    return () => {
      active = false
    }
  }, [identity])

  const handleTitleChange = (val: string) => {
    const slugified = val
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
    setNewCourse((prev) => {
      const shouldUpdateSlug =
        !prev.id ||
        prev.id === prev.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
      return {
        ...prev,
        title: val,
        id: shouldUpdateSlug ? slugified : prev.id,
        slug: shouldUpdateSlug ? slugified : prev.slug,
      }
    })
  }

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isAuthenticated) {
      toast.error("Please connect your admin wallet signer before creating courses")
      void login()
      return
    }

    if (!newCourse.title.trim()) {
      toast.error("Course title is required")
      return
    }

    setIsSubmittingCreate(true)
    try {
      const priceE8s = BigInt(Math.round(parseFloat(newCourse.priceIcp || "0") * 100_000_000))
      const autoId =
        newCourse.id.trim() ||
        newCourse.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
      const autoSlug = newCourse.slug.trim() || autoId

      await adminCreateCourse(
        {
          id: autoId,
          slug: autoSlug,
          title: newCourse.title.trim(),
          headline: newCourse.headline.trim(),
          description: newCourse.description.trim(),
          level: newCourse.level,
          badge: newCourse.badge.trim() || "Flagship Masterclass",
          price_e8s: priceE8s,
          total_hours: Number(newCourse.totalHours) || 4,
          cover_image: newCourse.coverImage.trim(),
          instructor_name: newCourse.instructorName.trim() || "ICPay Engineering Core",
          instructor_role: newCourse.instructorRole.trim() || "Core Protocol Engineers",
          is_published: newCourse.isPublished,
        },
        getActiveAdminEmail(),
        identity
      )

      toast.success(`Course "${newCourse.title}" created on-chain`)
      setCreateDialogOpen(false)
      setCreateStep(1)
      setNewCourse({
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
      })
      await loadAllCourses()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to create course on-chain")
    } finally {
      setIsSubmittingCreate(false)
    }
  }

  const handleOpenCurriculum = async (courseId: string) => {
    setIsLoadingCurriculum(true)
    setCurriculumDialogOpen(true)
    try {
      const detail = await fetchCourseDetail(courseId, identity)
      setCurriculumCourse(detail)
      if (detail) {
        setNewModuleOrder(detail.modules.length + 1)
      }
    } finally {
      setIsLoadingCurriculum(false)
    }
  }

  const handleAddModule = async () => {
    if (!curriculumCourse || !newModuleTitle.trim()) {
      toast.error("Module title is required")
      return
    }
    if (!isAuthenticated) {
      toast.error("Please connect your admin wallet signer")
      void login()
      return
    }

    setIsSubmittingModule(true)
    try {
      const autoSlug =
        newModuleSlug.trim() ||
        newModuleTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
      await adminAddModule(
        curriculumCourse.course.id,
        {
          title: newModuleTitle.trim(),
          slug: autoSlug,
          description: newModuleDesc.trim(),
          order: Number(newModuleOrder) || curriculumCourse.modules.length + 1,
          estimated_hours: Number(newModuleHours) || 2,
        },
        getActiveAdminEmail(),
        identity
      )
      toast.success(`Module "${newModuleTitle}" added on-chain`)
      setNewModuleTitle("")
      setNewModuleSlug("")
      setNewModuleDesc("")
      const updated = await fetchCourseDetail(curriculumCourse.course.id, identity)
      setCurriculumCourse(updated)
      if (updated) {
        setNewModuleOrder(updated.modules.length + 1)
      }
      await loadAllCourses()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to add module")
    } finally {
      setIsSubmittingModule(false)
    }
  }

  const handleConfirmDeleteModule = async () => {
    if (!deleteModuleTarget) return
    setIsDeletingModule(true)
    try {
      await adminDeleteModule(
        deleteModuleTarget.courseId,
        deleteModuleTarget.moduleId,
        getActiveAdminEmail(),
        identity
      )
      toast.success(`Module "${deleteModuleTarget.title}" deleted`)
      setDeleteModuleTarget(null)
      const updated = await fetchCourseDetail(deleteModuleTarget.courseId, identity)
      setCurriculumCourse(updated)
      await loadAllCourses()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to delete module")
    } finally {
      setIsDeletingModule(false)
    }
  }

  const handleOpenAddLesson = (module: { id: string; lessons: unknown[] }) => {
    setActiveModuleForLesson(activeModuleForLesson === module.id ? null : module.id)
    setNewLessonTitle("")
    setNewLessonSlug("")
    setNewLessonDesc("")
    setNewLessonDuration(20)
    setNewLessonType("Video")
    setNewLessonVideoUrl("")
    setNewLessonThumbnail("")
    setNewLessonPreview(false)
    setNewLessonOrder(module.lessons.length + 1)
    setNewLessonKeyTakeaways("")
  }

  const handleAddLesson = async (moduleId: string) => {
    if (!curriculumCourse || !newLessonTitle.trim()) {
      toast.error("Lesson title is required")
      return
    }
    if (!isAuthenticated) {
      toast.error("Please connect your admin wallet signer")
      void login()
      return
    }

    setIsSubmittingLesson(true)
    try {
      const autoSlug =
        newLessonSlug.trim() ||
        newLessonTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
      const takeawaysList = newLessonKeyTakeaways
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean)

      await adminAddLesson(
        curriculumCourse.course.id,
        moduleId,
        {
          title: newLessonTitle.trim(),
          slug: autoSlug,
          description: newLessonDesc.trim(),
          durationMinutes: Number(newLessonDuration) || 15,
          lessonType: newLessonType,
          videoUrl: newLessonVideoUrl.trim(),
          thumbnailUrl: newLessonThumbnail.trim() || curriculumCourse.course.cover_image,
          previewAvailable: newLessonPreview,
          order: Number(newLessonOrder) || 1,
          keyTakeaways: takeawaysList,
        },
        getActiveAdminEmail(),
        identity
      )
      toast.success(`Lesson "${newLessonTitle}" added on-chain`)
      setNewLessonTitle("")
      setNewLessonSlug("")
      setNewLessonDesc("")
      setNewLessonVideoUrl("")
      setNewLessonThumbnail("")
      setNewLessonPreview(false)
      setNewLessonKeyTakeaways("")
      setActiveModuleForLesson(null)
      const updated = await fetchCourseDetail(curriculumCourse.course.id, identity)
      setCurriculumCourse(updated)
      await loadAllCourses()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to add lesson")
    } finally {
      setIsSubmittingLesson(false)
    }
  }

  const handleConfirmDeleteLesson = async () => {
    if (!deleteLessonTarget) return
    setIsDeletingLesson(true)
    try {
      await adminDeleteLesson(
        deleteLessonTarget.courseId,
        deleteLessonTarget.moduleId,
        deleteLessonTarget.lessonId,
        getActiveAdminEmail(),
        identity
      )
      toast.success(`Lesson "${deleteLessonTarget.title}" deleted`)
      setDeleteLessonTarget(null)
      const updated = await fetchCourseDetail(deleteLessonTarget.courseId, identity)
      setCurriculumCourse(updated)
      await loadAllCourses()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to delete lesson")
    } finally {
      setIsDeletingLesson(false)
    }
  }

  const handleDuplicate = async (courseId: string) => {
    if (!isAuthenticated) {
      toast.error("Please connect your admin wallet signer")
      void login()
      return
    }
    try {
      const newId = await adminDuplicateCourse(courseId, getActiveAdminEmail(), identity)
      toast.success(`Course cloned successfully with ID: ${newId}`)
      await loadAllCourses()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to duplicate course")
    }
  }

  const handleTogglePublish = async (course: RemoteCourse) => {
    if (!isAuthenticated) {
      toast.error("Please connect your admin wallet signer")
      void login()
      return
    }
    try {
      const targetState = !course.is_published
      await adminTogglePublish(course.id, targetState, getActiveAdminEmail(), identity)
      toast.success(
        targetState ? `Published "${course.title}"` : `Unpublished "${course.title}" (draft)`
      )
      await loadAllCourses()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to toggle status")
    }
  }

  const handleConfirmDeleteCourse = async () => {
    if (!deleteCourseTarget) return
    setIsDeletingCourse(true)
    try {
      await adminDeleteCourse(deleteCourseTarget.id, getActiveAdminEmail(), identity)
      toast.success(`Course "${deleteCourseTarget.title}" permanently deleted`)
      setDeleteCourseTarget(null)
      await loadAllCourses()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to delete course")
    } finally {
      setIsDeletingCourse(false)
    }
  }

  const handleSavePrice = async () => {
    if (!priceCourseId) return
    if (!isAuthenticated) {
      toast.error("Please connect your admin wallet signer")
      void login()
      return
    }
    setIsSubmittingPrice(true)
    try {
      const e8s = BigInt(Math.round(parseFloat(newPriceIcp || "0") * 100_000_000))
      await adminSetPrice(priceCourseId, e8s, getActiveAdminEmail(), identity)
      toast.success(`Price set to ${newPriceIcp === "0" ? "Free" : `${newPriceIcp} ICP`}`)
      setPriceCourseId(null)
      await loadAllCourses()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to update price")
    } finally {
      setIsSubmittingPrice(false)
    }
  }

  const handleParseCsv = (raw: string) => {
    const lines = raw
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean)
    if (lines.length === 0) {
      setParsedCsvItems([])
      return
    }

    const items: ParsedCsvLesson[] = []
    const isFirstLineHeader =
      lines[0].toLowerCase().includes("module") && lines[0].toLowerCase().includes("lesson")
    const startIndex = isFirstLineHeader ? 1 : 0

    const parseCsvRow = (rowStr: string): string[] => {
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

    for (let i = startIndex; i < lines.length; i++) {
      const line = lines[i]
      const parts = parseCsvRow(line)
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

    setParsedCsvItems(items)
  }

  const handleDownloadSampleCsv = () => {
    const sample = [
      "Module,Module Description,Lesson Title,Type,Duration,Resource URL,Free Preview,Takeaways",
      "Module 01: Architecture & Actor Model,Foundations of the Internet Computer and actor messaging,Welcome & Canister Environment,Video,24,https://res.cloudinary.com/dn2ycbmrc/video/upload/v1792379282/howtocreatebucket_bdhzzv.mp4,true,WebAssembly runtime vs traditional EVM;Query vs update call mechanics;Cycle execution budgeting",
      "Module 01: Architecture & Actor Model,Foundations of the Internet Computer and actor messaging,Actor Concurrency & Asynchronous Messaging,Video,30,https://res.cloudinary.com/dn2ycbmrc/video/upload/v1792379282/howtocreatebucket_bdhzzv.mp4,false,Actor Model deterministic concurrency;Inter-canister call flow;Trap boundaries and rollback guarantees",
      "Module 01: Architecture & Actor Model,Foundations of the Internet Computer and actor messaging,Architecture & Concurrency Knowledge Check,Quiz,15,https://icpay.app/academy/quiz/module-01-architecture,true,10 questions on query vs update calls;Actor messaging guarantees;Passing threshold: 80%",
      "Module 02: Storage & Orthogonal Persistence,Canister memory layout stable structures and state management,Orthogonal Persistence & Memory Architecture Guide,Reading,25,https://internetcomputer.org/docs/current/motoko/main/base/,false,Orthogonal persistence vs SQL/NoSQL databases;Stable memory 64-bit address space;Memory high-water mark mechanics",
      "Module 02: Storage & Orthogonal Persistence,Canister memory layout stable structures and state management,Stable B-Tree & Memory Structures Lab,CodeLab,45,https://github.com/icpay/starter-motoko-stable-structures,true,Hands-on stable memory indexing;Upgradability without memory spikes;Zero-copy serialization",
      "Module 02: Storage & Orthogonal Persistence,Canister memory layout stable structures and state management,Production Storage & State Mastery Quiz,Quiz,20,https://icpay.app/academy/quiz/module-02-storage-mastery,false,Comprehensive 12-question quiz;Storage limits and cycle burn tests;Passing score 85% to qualify for certification",
    ].join("\n")

    const blob = new Blob([sample], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.setAttribute("download", "sample-curriculum.csv")
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success("Sample curriculum CSV downloaded")
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => {
      const content = event.target?.result as string
      setCsvRawText(content)
      handleParseCsv(content)
    }
    reader.readAsText(file)
  }

  const handleExecuteCsvImport = async () => {
    if (!curriculumCourse || parsedCsvItems.length === 0) return
    if (!isAuthenticated) {
      toast.error("Please connect your admin wallet signer")
      void login()
      return
    }

    setIsImportingCsv(true)
    const toastId = toast.loading(`Starting batch import (${parsedCsvItems.length} items)...`)

    try {
      const moduleMap: Record<string, string> = {}
      for (const m of curriculumCourse.modules) {
        moduleMap[m.title.toLowerCase()] = m.id
      }

      let importedLessonsCount = 0
      let importedModulesCount = 0

      for (let i = 0; i < parsedCsvItems.length; i++) {
        const item = parsedCsvItems[i]
        const key = item.moduleTitle.toLowerCase()

        let modId = moduleMap[key]
        if (!modId) {
          toast.loading(`Creating module: ${item.moduleTitle}...`, { id: toastId })
          const createdModId = await adminAddModule(
            curriculumCourse.course.id,
            {
              title: item.moduleTitle,
              slug: item.moduleTitle
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/^-|-$/g, ""),
              description: item.moduleDesc || "Module curriculum track",
              order: Object.keys(moduleMap).length + 1,
              estimated_hours: 2,
            },
            getActiveAdminEmail(),
            identity
          )
          moduleMap[key] = createdModId
          modId = createdModId
          importedModulesCount++
        }

        toast.loading(`Adding lesson ${i + 1}/${parsedCsvItems.length}: ${item.lessonTitle}...`, {
          id: toastId,
        })

        await adminAddLesson(
          curriculumCourse.course.id,
          modId,
          {
            title: item.lessonTitle,
            slug: item.lessonTitle
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, "-")
              .replace(/^-|-$/g, ""),
            description: `${item.lessonTitle} - Curriculum Session`,
            durationMinutes: item.duration,
            lessonType: item.lessonType,
            videoUrl: item.resourceUrl,
            thumbnailUrl: curriculumCourse.course.cover_image,
            previewAvailable: item.preview,
            order: i + 1,
            keyTakeaways:
              item.takeaways.length > 0
                ? item.takeaways
                : ["Curriculum Session", "On-Chain Verification"],
          },
          getActiveAdminEmail(),
          identity
        )
        importedLessonsCount++
      }

      toast.success(
        `Successfully imported ${importedModulesCount} modules and ${importedLessonsCount} lessons on-chain!`,
        { id: toastId }
      )
      setCsvImportOpen(false)
      setCsvRawText("")
      setParsedCsvItems([])

      const updated = await fetchCourseDetail(curriculumCourse.course.id, identity)
      setCurriculumCourse(updated)
      await loadAllCourses()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed batch import on-chain", {
        id: toastId,
      })
    } finally {
      setIsImportingCsv(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/acadamey/dashboard">Admin</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Course Management</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Course Tracks & Curriculums
          </h1>
          <p className="text-sm text-muted-foreground">
            Create, price, edit, and organize developer masterclasses with cascade lifecycle control.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => {
              setCreateStep(1)
              setCreateDialogOpen(true)
            }}
            className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <HugeiconsIcon icon={Layers01Icon} className="size-4" />
            Create New Course
          </Button>
        </div>
      </div>

      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bold text-foreground">
            Active Catalog ({courses.length})
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Courses stored in on-chain persistent stable memory on canister wkdfn-yqaaa-aaaan-q6vyq-cai.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex min-h-48 items-center justify-center">
              <Spinner className="size-6 text-primary" />
            </div>
          ) : courses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <HugeiconsIcon icon={Layers01Icon} className="size-10 text-muted-foreground/60 mb-2" />
              <p className="text-sm font-semibold text-foreground">No courses launched yet</p>
              <p className="text-xs text-muted-foreground mt-0.5 max-w-sm">
                Get started by creating your first on-chain course track with modules and video lessons.
              </p>
              <Button
                size="sm"
                onClick={() => {
                  setCreateStep(1)
                  setCreateDialogOpen(true)
                }}
                className="mt-4 gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <HugeiconsIcon icon={Add01Icon} className="size-3.5" />
                Create Course Track
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-border">
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="w-16">Cover</TableHead>
                    <TableHead>Course Title & Subtitle</TableHead>
                    <TableHead>Classification</TableHead>
                    <TableHead>Pricing</TableHead>
                    <TableHead>Curriculum</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {courses.map((c) => (
                    <TableRow key={c.id} className="border-border hover:bg-muted/40">
                      <TableCell>
                        <div className="relative size-12 overflow-hidden rounded-md border border-border bg-muted">
                          <Image
                            src={c.cover_image || "/images/pages/icacademy/cover.png"}
                            alt={c.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-semibold text-sm text-foreground">{c.title}</span>
                          <span className="text-xs text-muted-foreground line-clamp-1">{c.headline}</span>
                          <span className="text-[10px] text-muted-foreground/70 font-mono mt-0.5">
                            ID: {c.id}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          <Badge variant="outline" className="border-primary/20 bg-primary/5 text-primary text-[10px]">
                            {c.badge}
                          </Badge>
                          <Badge variant="outline" className="text-[10px]">
                            {c.level}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setPriceCourseId(c.id)
                            setNewPriceIcp(
                              c.price_e8s === BigInt(0)
                                ? "0"
                                : (Number(c.price_e8s) / 100_000_000).toString()
                            )
                          }}
                          className="h-7 gap-1 px-2 text-xs font-semibold hover:bg-muted"
                        >
                          <HugeiconsIcon icon={Coins01Icon} className="size-3 text-warning" />
                          {c.price_e8s === BigInt(0)
                            ? "Free"
                            : `${Number(c.price_e8s) / 100_000_000} ICP`}
                        </Button>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenCurriculum(c.id)}
                          className="h-7 gap-1 border-border bg-card text-xs font-medium text-foreground hover:bg-accent"
                        >
                          <HugeiconsIcon icon={Layers01Icon} className="size-3" />
                          {c.total_lessons} Lessons
                        </Button>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleTogglePublish(c)}
                          className="h-7 px-2"
                        >
                          <Badge
                            variant="outline"
                            className={
                              c.is_published
                                ? "border-success/30 bg-success/10 text-success text-[10px]"
                                : "border-warning/30 bg-warning/10 text-warning text-[10px]"
                            }
                          >
                            {c.is_published ? "Published" : "Draft"}
                          </Badge>
                        </Button>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDuplicate(c.id)}
                            title="Duplicate course"
                            className="size-7 text-muted-foreground hover:text-foreground"
                          >
                            <HugeiconsIcon icon={Copy01Icon} className="size-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setDeleteCourseTarget({ id: c.id, title: c.title })
                            }}
                            title="Delete course"
                            className="size-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                          >
                            <HugeiconsIcon icon={Delete01Icon} className="size-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="w-[95vw] sm:max-w-4xl lg:max-w-5xl max-h-[90vh] overflow-y-auto border-border bg-card text-foreground">
          <DialogHeader>
            <div className="flex items-center justify-between pr-6">
              <div>
                <DialogTitle className="text-lg font-bold">
                  {createStep === 1
                    ? "Create Course Track — Overview & Identity"
                    : "Course Media, Instructor & Settings"}
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Step {createStep} of 2:{" "}
                  {createStep === 1
                    ? "Metadata, categorization, and on-chain pricing"
                    : "Cover asset, instructor bio, and publication"}
                </DialogDescription>
              </div>
              <div className="flex items-center gap-1.5">
                <span className={`size-2 rounded-full ${createStep === 1 ? "bg-primary" : "bg-muted"}`} />
                <span className={`size-2 rounded-full ${createStep === 2 ? "bg-primary" : "bg-muted"}`} />
              </div>
            </div>
          </DialogHeader>

          <form onSubmit={handleCreateCourse} className="space-y-4 pt-1">
            {createStep === 1 ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">Course Title *</label>
                    <Input
                      required
                      placeholder="e.g. ICP Crash Course"
                      value={newCourse.title}
                      onChange={(e) => handleTitleChange(e.target.value)}
                      className="bg-input border-input text-foreground"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">Price in ICP (0 for Free)</label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0 for Free, or e.g. 2"
                      value={newCourse.priceIcp}
                      onChange={(e) => setNewCourse({ ...newCourse, priceIcp: e.target.value })}
                      className="bg-input border-input text-foreground"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">Unique Identifier (ID)</label>
                    <Input
                      required
                      placeholder="e.g. icp-crash-course"
                      value={newCourse.id}
                      onChange={(e) => setNewCourse({ ...newCourse, id: e.target.value })}
                      className="bg-input border-input font-mono text-xs text-foreground"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">URL Slug</label>
                    <Input
                      required
                      placeholder="e.g. icp-crash-course"
                      value={newCourse.slug}
                      onChange={(e) => setNewCourse({ ...newCourse, slug: e.target.value })}
                      className="bg-input border-input font-mono text-xs text-foreground"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Headline Subtitle</label>
                  <Input
                    placeholder="Brief high-impact subtitle describing what students will build"
                    value={newCourse.headline}
                    onChange={(e) => setNewCourse({ ...newCourse, headline: e.target.value })}
                    className="bg-input border-input text-foreground"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Detailed Description</label>
                  <Textarea
                    rows={3}
                    placeholder="Comprehensive overview covering prerequisites, target audience, and engineering skills"
                    value={newCourse.description}
                    onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
                    className="bg-input border-input text-foreground"
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">Difficulty Level</label>
                    <NativeSelect
                      value={newCourse.level}
                      onChange={(e) => setNewCourse({ ...newCourse, level: e.target.value })}
                      className="w-full bg-input border-input text-foreground"
                    >
                      <NativeSelectOption value="Beginner">Beginner</NativeSelectOption>
                      <NativeSelectOption value="Intermediate">Intermediate</NativeSelectOption>
                      <NativeSelectOption value="Advanced">Advanced</NativeSelectOption>
                    </NativeSelect>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">Badge Label</label>
                    <Input
                      placeholder="e.g. Flagship Masterclass"
                      value={newCourse.badge}
                      onChange={(e) => setNewCourse({ ...newCourse, badge: e.target.value })}
                      className="bg-input border-input text-foreground"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">Instructor Name</label>
                    <Input
                      placeholder="e.g. ICPay Engineering Core"
                      value={newCourse.instructorName}
                      onChange={(e) => setNewCourse({ ...newCourse, instructorName: e.target.value })}
                      className="bg-input border-input text-foreground"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">Instructor Role / Title</label>
                    <Input
                      placeholder="e.g. Core Protocol Engineers"
                      value={newCourse.instructorRole}
                      onChange={(e) => setNewCourse({ ...newCourse, instructorRole: e.target.value })}
                      className="bg-input border-input text-foreground"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">Total Estimated Hours</label>
                    <Input
                      type="number"
                      min="1"
                      placeholder="e.g. 6"
                      value={newCourse.totalHours}
                      onChange={(e) => setNewCourse({ ...newCourse, totalHours: parseInt(e.target.value) || 1 })}
                      className="bg-input border-input text-foreground"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">Cover Image URL</label>
                    <Input
                      placeholder="https://..."
                      value={newCourse.coverImage}
                      onChange={(e) => setNewCourse({ ...newCourse, coverImage: e.target.value })}
                      className="bg-input border-input text-foreground text-xs"
                    />
                  </div>
                </div>

                <div className="rounded-xl border border-border bg-muted/20 p-3 space-y-2">
                  <span className="text-xs font-semibold text-foreground">Cover Thumbnail Preview</span>
                  <div className="relative aspect-video w-full max-w-sm mx-auto overflow-hidden rounded-lg border border-border bg-card">
                    {newCourse.coverImage ? (
                      <Image
                        src={newCourse.coverImage}
                        alt="Preview"
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="flex size-full items-center justify-center text-xs text-muted-foreground">
                        No cover image specified
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent p-3 flex flex-col justify-end">
                      <div className="flex items-center gap-1.5">
                        <Badge variant="default" className="text-[10px] py-0 px-1.5">
                          {newCourse.priceIcp === "0" ? "Free" : `${newCourse.priceIcp} ICP`}
                        </Badge>
                        <Badge variant="secondary" className="text-[10px] py-0 px-1.5">
                          {newCourse.badge || "Course"}
                        </Badge>
                      </div>
                      <span className="text-xs font-bold text-foreground mt-1 truncate">
                        {newCourse.title || "Course Title Preview"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-lg border border-border bg-card p-3">
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-foreground">Publish Immediately</span>
                    <span className="text-[11px] text-muted-foreground">
                      Make this course visible to enrolled and visiting students right away.
                    </span>
                  </div>
                  <Switch
                    checked={newCourse.isPublished}
                    onCheckedChange={(val) => setNewCourse({ ...newCourse, isPublished: val })}
                  />
                </div>
              </div>
            )}

            <DialogFooter className="pt-2">
              {createStep === 1 ? (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCreateDialogOpen(false)}
                    className="border-border text-foreground hover:bg-accent"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={() => {
                      if (!newCourse.title.trim()) {
                        toast.error("Please enter a course title before proceeding")
                        return
                      }
                      setCreateStep(2)
                    }}
                    className="gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    Next: Media & Instructor
                    <HugeiconsIcon icon={ArrowRight01Icon} className="size-3.5" />
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCreateStep(1)}
                    className="gap-1.5 border-border text-foreground hover:bg-accent"
                  >
                    <HugeiconsIcon icon={ArrowLeft01Icon} className="size-3.5" />
                    Back to Overview
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmittingCreate || !newCourse.title.trim()}
                    className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    {isSubmittingCreate ? <Spinner className="size-4" /> : null}
                    Create Course On-Chain
                  </Button>
                </>
              )}
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={curriculumDialogOpen} onOpenChange={setCurriculumDialogOpen}>
        <DialogContent className="w-[95vw] sm:max-w-5xl lg:max-w-6xl max-h-[90vh] overflow-y-auto border-border bg-card text-foreground">
          <DialogHeader>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between pr-6">
              <div>
                <DialogTitle className="text-xl font-bold">
                  Curriculum Builder — {curriculumCourse?.course.title}
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  Manage modules and lessons. Set up lesson types, video streams, and free preview accessibility.
                </DialogDescription>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCsvImportOpen(true)}
                  className="h-8 gap-1.5 border-border bg-card text-xs font-semibold hover:bg-accent"
                >
                  <HugeiconsIcon icon={Upload01Icon} className="size-3.5 text-primary" />
                  Import CSV
                </Button>
              </div>
            </div>
          </DialogHeader>

          {isLoadingCurriculum ? (
            <div className="flex min-h-48 items-center justify-center">
              <Spinner className="size-6 text-primary" />
            </div>
          ) : (
            <div className="space-y-6">
              <div className="space-y-4">
                {curriculumCourse?.modules.length === 0 && (
                  <div className="rounded-lg border border-dashed border-border p-6 text-center text-xs text-muted-foreground">
                    No modules defined yet. Use the form below to create Module 01 or import via CSV.
                  </div>
                )}

                {curriculumCourse?.modules.map((m, mIdx) => (
                  <div key={m.id} className="rounded-xl border border-border bg-muted/20 p-4 space-y-3.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary text-xs font-bold">
                          {m.order || mIdx + 1}
                        </span>
                        <div className="flex flex-col">
                          <span className="font-semibold text-sm text-foreground">{m.title}</span>
                          <span className="text-[11px] text-muted-foreground">{m.description}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenAddLesson(m)}
                          className="h-7 text-xs font-medium border-primary/30 text-primary hover:bg-primary/10"
                        >
                          <HugeiconsIcon icon={Add01Icon} className="size-3 mr-1" />
                          Add Lesson
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setDeleteModuleTarget({
                              courseId: curriculumCourse.course.id,
                              moduleId: m.id,
                              title: m.title,
                            })
                          }}
                          className="size-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        >
                          <HugeiconsIcon icon={Delete01Icon} className="size-3.5" />
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-1.5 pl-9">
                      {m.lessons.map((l, lIdx) => (
                        <div
                          key={l.id}
                          className="flex items-center justify-between rounded-lg border border-border/70 bg-card px-3 py-2 text-xs"
                        >
                          <div className="flex items-center gap-2.5 flex-wrap">
                            <span className="text-muted-foreground font-mono">{lIdx + 1}.</span>
                            <span className="font-semibold text-foreground">{l.title}</span>
                            <span className="text-muted-foreground font-mono">({l.duration_minutes}m)</span>
                            <Badge variant="outline" className="text-[9px] px-1 py-0 border-border">
                              {"Video" in l.lesson_type
                                ? "Video"
                                : "CodeLab" in l.lesson_type
                                ? "CodeLab"
                                : "Reading" in l.lesson_type
                                ? "Reading"
                                : "Quiz"}
                            </Badge>
                            {l.preview_available && (
                              <Badge variant="outline" className="border-success/30 bg-success/10 text-success text-[9px] px-1.5 py-0 font-medium">
                                Free Preview
                              </Badge>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setDeleteLessonTarget({
                                courseId: curriculumCourse.course.id,
                                moduleId: m.id,
                                lessonId: l.id,
                                title: l.title,
                              })
                            }}
                            className="size-6 text-muted-foreground hover:text-destructive"
                          >
                            <HugeiconsIcon icon={Delete01Icon} className="size-3" />
                          </Button>
                        </div>
                      ))}
                    </div>

                    {activeModuleForLesson === m.id && (
                      <div className="rounded-xl border border-primary/20 bg-card p-4 space-y-3.5 ml-9">
                        <div className="flex items-center justify-between border-b border-border/60 pb-2">
                          <span className="text-xs font-bold text-primary">
                            Add New Lesson to {m.title}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                          <div className="space-y-1">
                            <label className="text-[11px] font-semibold text-foreground">Lesson Title *</label>
                            <Input
                              placeholder="e.g. Canister Execution Environment"
                              value={newLessonTitle}
                              onChange={(e) => {
                                setNewLessonTitle(e.target.value)
                                if (
                                  !newLessonSlug ||
                                  newLessonSlug ===
                                    newLessonTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-")
                                ) {
                                  setNewLessonSlug(
                                    e.target.value
                                      .toLowerCase()
                                      .replace(/[^a-z0-9]+/g, "-")
                                      .replace(/^-|-$/g, "")
                                  )
                                }
                              }}
                              className="h-8 text-xs bg-input border-input"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[11px] font-semibold text-foreground">Lesson Slug</label>
                            <Input
                              placeholder="e.g. canister-execution-environment"
                              value={newLessonSlug}
                              onChange={(e) => setNewLessonSlug(e.target.value)}
                              className="h-8 text-xs bg-input border-input font-mono"
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[11px] font-semibold text-foreground">Short Description</label>
                          <Input
                            placeholder="Brief summary of lesson objectives"
                            value={newLessonDesc}
                            onChange={(e) => setNewLessonDesc(e.target.value)}
                            className="h-8 text-xs bg-input border-input"
                          />
                        </div>

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                          <div className="space-y-1">
                            <label className="text-[11px] font-semibold text-foreground">Lesson Type</label>
                            <NativeSelect
                              value={newLessonType}
                              onChange={(e) => setNewLessonType(e.target.value as AdminLessonTypeKey)}
                              className="w-full h-8 text-xs bg-input border-input"
                            >
                              <NativeSelectOption value="Video">Video Masterclass</NativeSelectOption>
                              <NativeSelectOption value="CodeLab">Hands-on CodeLab</NativeSelectOption>
                              <NativeSelectOption value="Reading">Technical Guide</NativeSelectOption>
                              <NativeSelectOption value="Quiz">Knowledge Quiz</NativeSelectOption>
                            </NativeSelect>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[11px] font-semibold text-foreground">Duration (Minutes)</label>
                            <Input
                              type="number"
                              min="1"
                              placeholder="Minutes"
                              value={newLessonDuration}
                              onChange={(e) => setNewLessonDuration(parseInt(e.target.value) || 10)}
                              className="h-8 text-xs bg-input border-input"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[11px] font-semibold text-foreground">Order Position</label>
                            <Input
                              type="number"
                              min="1"
                              value={newLessonOrder}
                              onChange={(e) => setNewLessonOrder(parseInt(e.target.value) || 1)}
                              className="h-8 text-xs bg-input border-input"
                            />
                          </div>
                        </div>

                        {newLessonType === "Video" && (
                          <div className="space-y-3">
                            <div className="space-y-1">
                              <label className="text-[11px] font-semibold text-foreground">
                                Video Stream URL *
                              </label>
                              <Input
                                placeholder="Direct Cloudinary, YouTube, Vimeo, or MP4 URL"
                                value={newLessonVideoUrl}
                                onChange={(e) => setNewLessonVideoUrl(e.target.value)}
                                className="h-8 text-xs bg-input border-input font-mono"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[11px] font-semibold text-foreground">
                                Key Video Takeaways (one per line)
                              </label>
                              <Textarea
                                rows={3}
                                placeholder="Enter takeaways, each on a new line&#10;e.g.&#10;WebAssembly runtime vs traditional EVM&#10;Query vs update call mechanics"
                                value={newLessonKeyTakeaways}
                                onChange={(e) => setNewLessonKeyTakeaways(e.target.value)}
                                className="text-xs bg-input border-input"
                              />
                            </div>
                          </div>
                        )}

                        {newLessonType === "CodeLab" && (
                          <div className="space-y-3">
                            <div className="space-y-1">
                              <label className="text-[11px] font-semibold text-foreground">
                                CodeLab Repository / Workspace Starter URL *
                              </label>
                              <Input
                                placeholder="e.g. https://github.com/icpay/starter-motoko-canister"
                                value={newLessonVideoUrl}
                                onChange={(e) => setNewLessonVideoUrl(e.target.value)}
                                className="h-8 text-xs bg-input border-input font-mono"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[11px] font-semibold text-foreground">
                                Hands-on CodeLab Objectives & Tasks (one per line)
                              </label>
                              <Textarea
                                rows={3}
                                placeholder="Enter tasks, each on a new line&#10;e.g.&#10;1. Clone repository & install Motoko compiler&#10;2. Implement ICRC-1 balance query function&#10;3. Deploy to local replica & verify with dfx"
                                value={newLessonKeyTakeaways}
                                onChange={(e) => setNewLessonKeyTakeaways(e.target.value)}
                                className="text-xs bg-input border-input"
                              />
                            </div>
                          </div>
                        )}

                        {newLessonType === "Reading" && (
                          <div className="space-y-3">
                            <div className="space-y-1">
                              <label className="text-[11px] font-semibold text-foreground">
                                Technical Guide / Documentation URL *
                              </label>
                              <Input
                                placeholder="e.g. https://internetcomputer.org/docs/current/motoko/main/base/"
                                value={newLessonVideoUrl}
                                onChange={(e) => setNewLessonVideoUrl(e.target.value)}
                                className="h-8 text-xs bg-input border-input font-mono"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[11px] font-semibold text-foreground">
                                Key Concepts & Reading Highlights (one per line)
                              </label>
                              <Textarea
                                rows={3}
                                placeholder="Enter key concepts, each on a new line&#10;e.g.&#10;Canister state isolation principles&#10;Heap memory limits vs 64-bit stable memory"
                                value={newLessonKeyTakeaways}
                                onChange={(e) => setNewLessonKeyTakeaways(e.target.value)}
                                className="text-xs bg-input border-input"
                              />
                            </div>
                          </div>
                        )}

                        {newLessonType === "Quiz" && (
                          <div className="space-y-3">
                            <div className="space-y-1">
                              <label className="text-[11px] font-semibold text-foreground">
                                Quiz Reference / Form URL (optional)
                              </label>
                              <Input
                                placeholder="e.g. https://... or leave blank for embedded knowledge check"
                                value={newLessonVideoUrl}
                                onChange={(e) => setNewLessonVideoUrl(e.target.value)}
                                className="h-8 text-xs bg-input border-input font-mono"
                              />
                            </div>
                            <div className="space-y-1">
                              <div className="flex items-center justify-between">
                                <label className="text-[11px] font-semibold text-foreground">
                                  Quiz Questions (Format: Question? | Correct Option | Option B | Option C | Option D)
                                </label>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="xs"
                                  onClick={() => {
                                    setNewLessonKeyTakeaways(
                                      `What is the primary advantage of stable memory? | *Persists across canister upgrades scaling to 400+ GB | Wiped during upgrades | Limited to 4 GB | Stored off-chain\nWhy use stable B-Tree structures? | *Eliminates pre_upgrade heap serialization traps | Converts data into JSON | Disables message queues | Requires no Internet Identity\nWhat determines ongoing storage cycle costs? | *High-water mark of allocated memory pages | Number of query calls only | Billed only when canister stops | Zero cycles charged on mainnet`
                                    )
                                  }}
                                  className="h-6 text-[10px] text-primary hover:underline px-1"
                                >
                                  Insert Sample Questions
                                </Button>
                              </div>
                              <Textarea
                                rows={4}
                                placeholder="Enter questions with options (prefix * on correct option, or first option is correct):&#10;What is orthogonal persistence? | *Automatic persistence across upgrades | Stored on AWS | Volatile memory only | Manual SQL migrations&#10;What is the heap limit? | *4 GiB ceiling | 400 GB | 500 MB | Unlimited"
                                value={newLessonKeyTakeaways}
                                onChange={(e) => setNewLessonKeyTakeaways(e.target.value)}
                                className="text-xs bg-input border-input font-mono"
                              />
                              <p className="text-[10px] text-muted-foreground">
                                Each line forms one question. Separate options with &quot;|&quot;. Prefix the correct answer with &quot;*&quot; or list it first.
                              </p>
                            </div>
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-1">
                          <label className="flex items-center gap-2 text-xs text-foreground cursor-pointer">
                            <Switch
                              checked={newLessonPreview}
                              onCheckedChange={setNewLessonPreview}
                            />
                            <span>Available as Free Preview</span>
                          </label>

                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setActiveModuleForLesson(null)}
                              className="h-8 text-xs text-muted-foreground hover:text-foreground"
                            >
                              Cancel
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleAddLesson(m.id)}
                              disabled={isSubmittingLesson || !newLessonTitle.trim()}
                              className="h-8 text-xs gap-1.5 bg-primary text-primary-foreground"
                            >
                              {isSubmittingLesson ? <Spinner className="size-3.5" /> : null}
                              Save Lesson On-Chain
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="rounded-xl border border-dashed border-border bg-card p-4 space-y-3.5">
                <div className="flex items-center gap-2">
                  <HugeiconsIcon icon={Add01Icon} className="size-4 text-primary" />
                  <span className="text-xs font-bold text-foreground">Add New Curriculum Module</span>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-foreground">Module Title *</label>
                    <Input
                      placeholder="e.g. Module 02: Storage & Stable Structures"
                      value={newModuleTitle}
                      onChange={(e) => {
                        setNewModuleTitle(e.target.value)
                        if (
                          !newModuleSlug ||
                          newModuleSlug ===
                            newModuleTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-")
                        ) {
                          setNewModuleSlug(
                            e.target.value
                              .toLowerCase()
                              .replace(/[^a-z0-9]+/g, "-")
                              .replace(/^-|-$/g, "")
                          )
                        }
                      }}
                      className="h-8 text-xs bg-input border-input"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-foreground">Module Slug</label>
                    <Input
                      placeholder="e.g. storage-and-stable-structures"
                      value={newModuleSlug}
                      onChange={(e) => setNewModuleSlug(e.target.value)}
                      className="h-8 text-xs bg-input border-input font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-foreground">Description</label>
                  <Input
                    placeholder="Short summary of topics covered in this module"
                    value={newModuleDesc}
                    onChange={(e) => setNewModuleDesc(e.target.value)}
                    className="h-8 text-xs bg-input border-input"
                  />
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-foreground">Order Position</label>
                    <Input
                      type="number"
                      min="1"
                      value={newModuleOrder}
                      onChange={(e) => setNewModuleOrder(parseInt(e.target.value) || 1)}
                      className="h-8 text-xs bg-input border-input"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-foreground">Estimated Hours</label>
                    <Input
                      type="number"
                      min="1"
                      value={newModuleHours}
                      onChange={(e) => setNewModuleHours(parseInt(e.target.value) || 1)}
                      className="h-8 text-xs bg-input border-input"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <Button
                    size="sm"
                    onClick={handleAddModule}
                    disabled={isSubmittingModule || !newModuleTitle.trim()}
                    className="h-8 text-xs gap-1.5 bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  >
                    {isSubmittingModule ? <Spinner className="size-3.5" /> : null}
                    Add Module On-Chain
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={csvImportOpen} onOpenChange={setCsvImportOpen}>
        <DialogContent className="w-[95vw] sm:max-w-4xl lg:max-w-5xl max-h-[90vh] overflow-y-auto border-border bg-card text-foreground">
          <DialogHeader>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between pr-6">
              <div>
                <DialogTitle className="text-xl font-bold">
                  Batch Import Curriculum via CSV
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  Import modules and lessons in bulk for &ldquo;{curriculumCourse?.course.title}&rdquo;.
                </DialogDescription>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadSampleCsv}
                className="h-8 gap-1.5 border-border bg-card text-xs font-semibold hover:bg-accent"
              >
                <HugeiconsIcon icon={Download01Icon} className="size-3.5 text-primary" />
                Download Sample CSV
              </Button>
            </div>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-foreground">Upload CSV File</label>
                <div className="flex items-center gap-2">
                  <Input
                    type="file"
                    accept=".csv,.txt"
                    onChange={handleFileUpload}
                    className="bg-input border-input text-xs"
                  />
                </div>
                <span className="text-[11px] text-muted-foreground">
                  Select a UTF-8 encoded .csv or .txt file.
                </span>
              </div>

              <div className="flex flex-col justify-end space-y-2">
                <span className="text-xs font-semibold text-foreground">Template Format Columns</span>
                <span className="rounded-md border border-border bg-muted/20 p-2 font-mono text-[10px] text-muted-foreground">
                  Module, Module Description, Lesson Title, Type, Duration, Resource URL, Free Preview, Takeaways
                </span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Or Paste Raw CSV Data Directly</label>
              <Textarea
                rows={6}
                placeholder="Paste CSV rows here...&#10;e.g.&#10;Module 01: Architecture,Actor foundations,Welcome Lesson,Video,24,https://...,true,WebAssembly;Actor model&#10;Module 01: Architecture,Actor foundations,Actor Concurrency Check,Quiz,15,https://icpay.app/quiz/...,true,10 questions;80% passing&#10;Module 02: Storage,Storage foundations,Stable Structures Lab,CodeLab,45,https://github.com/...,true,Stable Memory&#10;Module 02: Storage,Storage foundations,Memory Architecture Guide,Reading,20,https://docs....,false,Orthogonal persistence"
                value={csvRawText}
                onChange={(e) => {
                  setCsvRawText(e.target.value)
                  handleParseCsv(e.target.value)
                }}
                className="font-mono text-xs bg-input border-input"
              />
            </div>

            {parsedCsvItems.length > 0 && (
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground">
                    Parsed Preview ({parsedCsvItems.length} Lessons Detected)
                  </span>
                  <Badge variant="outline" className="border-primary/20 bg-primary/10 text-primary text-[10px]">
                    Ready to Import
                  </Badge>
                </div>

                <div className="max-h-60 overflow-y-auto rounded-lg border border-border">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border">
                        <TableHead className="text-xs">Module</TableHead>
                        <TableHead className="text-xs">Lesson Title</TableHead>
                        <TableHead className="text-xs">Type</TableHead>
                        <TableHead className="text-xs">Duration</TableHead>
                        <TableHead className="text-xs">Preview</TableHead>
                        <TableHead className="text-xs">Resource Link</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {parsedCsvItems.map((item, idx) => (
                        <TableRow key={idx} className="border-border text-xs">
                          <TableCell className="font-semibold text-foreground max-w-[150px] truncate">
                            {item.moduleTitle}
                          </TableCell>
                          <TableCell className="text-foreground max-w-[180px] truncate">
                            {item.lessonTitle}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-[9px] px-1.5 py-0 border-border">
                              {item.lessonType}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-mono text-muted-foreground">
                            {item.duration}m
                          </TableCell>
                          <TableCell>
                            {item.preview ? (
                              <Badge variant="outline" className="border-success/30 bg-success/10 text-success text-[9px] px-1 py-0">
                                Free
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground text-[11px]">Paid</span>
                            )}
                          </TableCell>
                          <TableCell className="font-mono text-[11px] text-muted-foreground max-w-[160px] truncate">
                            {item.resourceUrl || "—"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}

            <DialogFooter className="pt-3">
              <Button
                variant="outline"
                onClick={() => setCsvImportOpen(false)}
                className="border-border text-foreground hover:bg-accent"
              >
                Cancel
              </Button>
              <Button
                onClick={handleExecuteCsvImport}
                disabled={isImportingCsv || parsedCsvItems.length === 0}
                className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {isImportingCsv ? <Spinner className="size-4" /> : <HugeiconsIcon icon={Upload01Icon} className="size-4" />}
                Execute Batch On-Chain Import ({parsedCsvItems.length})
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteCourseTarget !== null} onOpenChange={() => setDeleteCourseTarget(null)}>
        <DialogContent className="w-[95vw] sm:max-w-md border-border bg-card text-foreground">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-destructive">
              Delete Course Track
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Are you sure you want to delete &ldquo;{deleteCourseTarget?.title}&rdquo;?
              This action will cascade and remove all associated modules, lessons, and video references permanently.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-2">
            <Button
              variant="outline"
              onClick={() => setDeleteCourseTarget(null)}
              className="border-border text-foreground hover:bg-accent"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDeleteCourse}
              disabled={isDeletingCourse}
              className="gap-2 bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeletingCourse ? <Spinner className="size-4" /> : null}
              Confirm Cascade Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteModuleTarget !== null} onOpenChange={() => setDeleteModuleTarget(null)}>
        <DialogContent className="w-[95vw] sm:max-w-md border-border bg-card text-foreground">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-destructive">
              Delete Curriculum Module
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Are you sure you want to delete module &ldquo;{deleteModuleTarget?.title}&rdquo;?
              All lessons nested inside this module will be permanently removed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-2">
            <Button
              variant="outline"
              onClick={() => setDeleteModuleTarget(null)}
              className="border-border text-foreground hover:bg-accent"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDeleteModule}
              disabled={isDeletingModule}
              className="gap-2 bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeletingModule ? <Spinner className="size-4" /> : null}
              Delete Module
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteLessonTarget !== null} onOpenChange={() => setDeleteLessonTarget(null)}>
        <DialogContent className="w-[95vw] sm:max-w-md border-border bg-card text-foreground">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-destructive">
              Delete Lesson
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Are you sure you want to delete &ldquo;{deleteLessonTarget?.title}&rdquo;?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-2">
            <Button
              variant="outline"
              onClick={() => setDeleteLessonTarget(null)}
              className="border-border text-foreground hover:bg-accent"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDeleteLesson}
              disabled={isDeletingLesson}
              className="gap-2 bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeletingLesson ? <Spinner className="size-4" /> : null}
              Delete Lesson
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={priceCourseId !== null} onOpenChange={() => setPriceCourseId(null)}>
        <DialogContent className="w-[95vw] sm:max-w-sm border-border bg-card text-foreground">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">Update Course Pricing</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Set required payment in ICP (enter 0 for Free enrollment).
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <label className="text-xs font-semibold text-foreground">Price in ICP</label>
            <Input
              type="number"
              step="0.01"
              min="0"
              value={newPriceIcp}
              onChange={(e) => setNewPriceIcp(e.target.value)}
              className="bg-input border-input text-foreground"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setPriceCourseId(null)}
              className="border-border text-foreground hover:bg-accent"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSavePrice}
              disabled={isSubmittingPrice}
              className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {isSubmittingPrice ? <Spinner className="size-4" /> : null}
              Save Price
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
