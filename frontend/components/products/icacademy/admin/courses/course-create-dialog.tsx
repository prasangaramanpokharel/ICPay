"use client"

import Image from "next/image"
import { toast } from "sonner"
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
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Spinner } from "@/components/ui/spinner"
import { Icon } from "@/components/ui/icon"
import { ArrowLeftGlassIcon, ArrowRightGlassIcon } from "@thesvg/ui-react"
import { slugifyText, type NewCourseDraft } from "@/lib/academy/csv"

export function CourseCreateDialog({
  open,
  onOpenChange,
  step,
  onStepChange,
  draft,
  onDraftChange,
  isSubmitting,
  onSubmit,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  step: 1 | 2
  onStepChange: (step: 1 | 2) => void
  draft: NewCourseDraft
  onDraftChange: (draft: NewCourseDraft) => void
  isSubmitting: boolean
  onSubmit: (e: React.FormEvent) => void
}) {
  const handleTitleChange = (val: string) => {
    const slugified = slugifyText(val)
    const shouldUpdateSlug = !draft.id || draft.id === slugifyText(draft.title)
    onDraftChange({
      ...draft,
      title: val,
      id: shouldUpdateSlug ? slugified : draft.id,
      slug: shouldUpdateSlug ? slugified : draft.slug,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] w-[95vw] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <div className="flex items-center justify-between pr-6">
            <div>
              <DialogTitle>
                {step === 1
                  ? "Create Course Track — Overview & Identity"
                  : "Course Media, Instructor & Settings"}
              </DialogTitle>
              <DialogDescription>
                Step {step} of 2:{" "}
                {step === 1
                  ? "Metadata, categorization, and on-chain pricing"
                  : "Cover asset, instructor bio, and publication"}
              </DialogDescription>
            </div>
            <Badge variant="outline" className="text-[10px]">
              Step {step} / 2
            </Badge>
          </div>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4 pt-1">
          {step === 1 ? (
            <FieldGroup className="gap-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="course-title">Course Title *</FieldLabel>
                  <Input
                    id="course-title"
                    required
                    placeholder="e.g. ICP Crash Course"
                    value={draft.title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="course-price">Price in ICP (0 for Free)</FieldLabel>
                  <Input
                    id="course-price"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0 for Free, or e.g. 2"
                    value={draft.priceIcp}
                    onChange={(e) => onDraftChange({ ...draft, priceIcp: e.target.value })}
                  />
                </Field>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="course-id">Unique Identifier (ID)</FieldLabel>
                  <Input
                    id="course-id"
                    required
                    placeholder="e.g. icp-crash-course"
                    value={draft.id}
                    onChange={(e) => onDraftChange({ ...draft, id: e.target.value })}
                    className="font-mono text-xs"
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="course-slug">URL Slug</FieldLabel>
                  <Input
                    id="course-slug"
                    required
                    placeholder="e.g. icp-crash-course"
                    value={draft.slug}
                    onChange={(e) => onDraftChange({ ...draft, slug: e.target.value })}
                    className="font-mono text-xs"
                  />
                </Field>
              </div>

              <Field>
                <FieldLabel htmlFor="course-headline">Headline Subtitle</FieldLabel>
                <Input
                  id="course-headline"
                  placeholder="Brief high-impact subtitle describing what students will build"
                  value={draft.headline}
                  onChange={(e) => onDraftChange({ ...draft, headline: e.target.value })}
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="course-description">Detailed Description</FieldLabel>
                <Textarea
                  id="course-description"
                  rows={3}
                  placeholder="Comprehensive overview covering prerequisites, target audience, and engineering skills"
                  value={draft.description}
                  onChange={(e) => onDraftChange({ ...draft, description: e.target.value })}
                />
              </Field>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="course-level">Difficulty Level</FieldLabel>
                  <NativeSelect
                    id="course-level"
                    value={draft.level}
                    onChange={(e) => onDraftChange({ ...draft, level: e.target.value })}
                    className="w-full"
                  >
                    <NativeSelectOption value="Beginner">Beginner</NativeSelectOption>
                    <NativeSelectOption value="Intermediate">Intermediate</NativeSelectOption>
                    <NativeSelectOption value="Advanced">Advanced</NativeSelectOption>
                  </NativeSelect>
                </Field>
                <Field>
                  <FieldLabel htmlFor="course-badge">Badge Label</FieldLabel>
                  <Input
                    id="course-badge"
                    placeholder="e.g. Flagship Masterclass"
                    value={draft.badge}
                    onChange={(e) => onDraftChange({ ...draft, badge: e.target.value })}
                  />
                </Field>
              </div>
            </FieldGroup>
          ) : (
            <FieldGroup className="gap-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="instructor-name">Instructor Name</FieldLabel>
                  <Input
                    id="instructor-name"
                    placeholder="e.g. ICPay Engineering Core"
                    value={draft.instructorName}
                    onChange={(e) => onDraftChange({ ...draft, instructorName: e.target.value })}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="instructor-role">Instructor Role / Title</FieldLabel>
                  <Input
                    id="instructor-role"
                    placeholder="e.g. Core Protocol Engineers"
                    value={draft.instructorRole}
                    onChange={(e) => onDraftChange({ ...draft, instructorRole: e.target.value })}
                  />
                </Field>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="course-hours">Total Estimated Hours</FieldLabel>
                  <Input
                    id="course-hours"
                    type="number"
                    min="1"
                    value={draft.totalHours}
                    onChange={(e) =>
                      onDraftChange({ ...draft, totalHours: parseInt(e.target.value) || 1 })
                    }
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="course-cover">Cover Image URL</FieldLabel>
                  <Input
                    id="course-cover"
                    placeholder="https://..."
                    value={draft.coverImage}
                    onChange={(e) => onDraftChange({ ...draft, coverImage: e.target.value })}
                    className="text-xs"
                  />
                </Field>
              </div>

              <div className="space-y-2 rounded-xl border border-border bg-muted/20 p-3">
                <span className="text-xs font-semibold text-foreground">
                  Cover Thumbnail Preview
                </span>
                <div className="relative mx-auto aspect-video w-full max-w-sm overflow-hidden rounded-lg border border-border bg-card">
                  {draft.coverImage ? (
                    <Image
                      src={draft.coverImage}
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
                  <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-background/90 via-background/20 to-transparent p-3">
                    <div className="flex items-center gap-1.5">
                      <Badge variant="default" className="px-1.5 py-0 text-[10px]">
                        {draft.priceIcp === "0" ? "Free" : `${draft.priceIcp} ICP`}
                      </Badge>
                      <Badge variant="secondary" className="px-1.5 py-0 text-[10px]">
                        {draft.badge || "Course"}
                      </Badge>
                    </div>
                    <span className="mt-1 truncate text-xs font-bold text-foreground">
                      {draft.title || "Course Title Preview"}
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
                  checked={draft.isPublished}
                  onCheckedChange={(val) => onDraftChange({ ...draft, isPublished: val })}
                />
              </div>
            </FieldGroup>
          )}

          <DialogFooter className="pt-2">
            {step === 1 ? (
              <>
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    if (!draft.title.trim()) {
                      toast.error("Please enter a course title before proceeding")
                      return
                    }
                    onStepChange(2)
                  }}
                  className="gap-1.5"
                >
                  Next: Media & Instructor
                  <Icon icon={ArrowRightGlassIcon} className="size-3.5" strokeWidth={1.75} />
                </Button>
              </>
            ) : (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onStepChange(1)}
                  className="gap-1.5"
                >
                  <Icon icon={ArrowLeftGlassIcon} className="size-3.5" strokeWidth={1.75} />
                  Back to Overview
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || !draft.title.trim()}
                  className="gap-2"
                >
                  {isSubmitting ? <Spinner data-icon="inline-start" /> : null}
                  <span>Create Course On-Chain</span>
                </Button>
              </>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
