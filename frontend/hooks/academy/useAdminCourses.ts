"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"
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
} from "@/services/academy/client"
import { getAdminSession } from "@/services/academy/admin-auth"
import { useAuth } from "@/components/auth/auth-provider"
import type { RemoteCourse, RemoteCourseDetail } from "@/services/academy/types"
import {
  DEFAULT_NEW_COURSE,
  SAMPLE_CURRICULUM_CSV,
  parseCurriculumCsv,
  slugifyText,
  type NewCourseDraft,
  type ParsedCsvLesson,
} from "@/lib/academy/csv"
import type { NewModulePayload } from "@/components/products/icacademy/admin/courses/curriculum-module-form"
import type { NewLessonPayload } from "@/components/products/icacademy/admin/courses/curriculum-lesson-form"

export function useAdminCourses() {
  const { identity, isAuthenticated, login } = useAuth()
  const [courses, setCourses] = useState<RemoteCourse[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [createStep, setCreateStep] = useState<1 | 2>(1)
  const [isSubmittingCreate, setIsSubmittingCreate] = useState(false)
  const [newCourse, setNewCourse] = useState<NewCourseDraft>(DEFAULT_NEW_COURSE)

  const [curriculumCourse, setCurriculumCourse] = useState<RemoteCourseDetail | null>(null)
  const [curriculumDialogOpen, setCurriculumDialogOpen] = useState(false)
  const [isLoadingCurriculum, setIsLoadingCurriculum] = useState(false)
  const [isSubmittingModule, setIsSubmittingModule] = useState(false)
  const [isSubmittingLesson, setIsSubmittingLesson] = useState(false)

  const [csvImportOpen, setCsvImportOpen] = useState(false)
  const [csvRawText, setCsvRawText] = useState("")
  const [parsedCsvItems, setParsedCsvItems] = useState<ParsedCsvLesson[]>([])
  const [isImportingCsv, setIsImportingCsv] = useState(false)

  const [deleteCourseTarget, setDeleteCourseTarget] = useState<{
    id: string
    title: string
  } | null>(null)
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

  const getActiveAdminEmail = () => getAdminSession()?.email || "admin@icpay.app"

  const requireAdminSigner = () => {
    if (!isAuthenticated) {
      toast.error("Please connect your admin wallet signer")
      void login()
      return false
    }
    return true
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

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!requireAdminSigner()) return
    if (!newCourse.title.trim()) {
      toast.error("Course title is required")
      return
    }

    setIsSubmittingCreate(true)
    try {
      const priceE8s = BigInt(Math.round(parseFloat(newCourse.priceIcp || "0") * 100_000_000))
      const autoId = newCourse.id.trim() || slugifyText(newCourse.title)
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
      setNewCourse(DEFAULT_NEW_COURSE)
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
    } finally {
      setIsLoadingCurriculum(false)
    }
  }

  const handleAddModule = async (payload: NewModulePayload, reset: () => void) => {
    if (!curriculumCourse || !requireAdminSigner()) return
    setIsSubmittingModule(true)
    try {
      await adminAddModule(curriculumCourse.course.id, payload, getActiveAdminEmail(), identity)
      toast.success(`Module "${payload.title}" added on-chain`)
      reset()
      const updated = await fetchCourseDetail(curriculumCourse.course.id, identity)
      setCurriculumCourse(updated)
      await loadAllCourses()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to add module")
    } finally {
      setIsSubmittingModule(false)
    }
  }

  const handleAddLesson = async (
    moduleId: string,
    payload: NewLessonPayload,
    onDone: () => void
  ) => {
    if (!curriculumCourse || !requireAdminSigner()) return
    setIsSubmittingLesson(true)
    try {
      await adminAddLesson(
        curriculumCourse.course.id,
        moduleId,
        {
          ...payload,
          thumbnailUrl: curriculumCourse.course.cover_image,
        },
        getActiveAdminEmail(),
        identity
      )
      toast.success(`Lesson "${payload.title}" added on-chain`)
      onDone()
      const updated = await fetchCourseDetail(curriculumCourse.course.id, identity)
      setCurriculumCourse(updated)
      await loadAllCourses()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to add lesson")
    } finally {
      setIsSubmittingLesson(false)
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
    if (!requireAdminSigner()) return
    try {
      const newId = await adminDuplicateCourse(courseId, getActiveAdminEmail(), identity)
      toast.success(`Course cloned successfully with ID: ${newId}`)
      await loadAllCourses()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to duplicate course")
    }
  }

  const handleTogglePublish = async (course: RemoteCourse) => {
    if (!requireAdminSigner()) return
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

  const handleSavePrice = async () => {
    if (!priceCourseId || !requireAdminSigner()) return
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

  const handleDownloadSampleCsv = () => {
    const blob = new Blob([SAMPLE_CURRICULUM_CSV], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.setAttribute("download", "sample-curriculum.csv")
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success("Sample curriculum CSV downloaded")
  }

  const handleCsvRawTextChange = (text: string) => {
    setCsvRawText(text)
    setParsedCsvItems(parseCurriculumCsv(text))
  }

  const handleExecuteCsvImport = async () => {
    if (!curriculumCourse || parsedCsvItems.length === 0 || !requireAdminSigner()) return
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
              slug: slugifyText(item.moduleTitle),
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
            slug: slugifyText(item.lessonTitle),
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

  return {
    courses,
    isLoading,
    createDialogOpen,
    setCreateDialogOpen,
    createStep,
    setCreateStep,
    isSubmittingCreate,
    newCourse,
    setNewCourse,
    curriculumCourse,
    curriculumDialogOpen,
    setCurriculumDialogOpen,
    isLoadingCurriculum,
    isSubmittingModule,
    isSubmittingLesson,
    csvImportOpen,
    setCsvImportOpen,
    csvRawText,
    parsedCsvItems,
    isImportingCsv,
    deleteCourseTarget,
    setDeleteCourseTarget,
    isDeletingCourse,
    deleteModuleTarget,
    setDeleteModuleTarget,
    isDeletingModule,
    deleteLessonTarget,
    setDeleteLessonTarget,
    isDeletingLesson,
    priceCourseId,
    setPriceCourseId,
    newPriceIcp,
    setNewPriceIcp,
    isSubmittingPrice,
    handleCreateCourse,
    handleOpenCurriculum,
    handleAddModule,
    handleAddLesson,
    handleConfirmDeleteCourse,
    handleConfirmDeleteModule,
    handleConfirmDeleteLesson,
    handleDuplicate,
    handleTogglePublish,
    handleSavePrice,
    handleDownloadSampleCsv,
    handleCsvRawTextChange,
    handleExecuteCsvImport,
  }
}
