"use client"

import * as React from "react"
import { Toast as ToastPrimitive } from "@base-ui/react/toast"

import { HugeiconsIcon } from "@hugeicons/react"
import {
  Cancel01Icon,
  InformationCircleIcon,
  Alert02Icon,
  Loading01Icon,
} from "@hugeicons/core-free-icons"

import { cn } from "@/lib/ui/utils"
import { Button } from "@/components/ui/button"

export type ToastType = "success" | "error" | "info" | "warning" | "loading"

export interface ToastOptions {
  description?: React.ReactNode
  type?: ToastType
  duration?: number
  action?: React.ReactNode
  id?: string
}

const baseToast = ToastPrimitive.createToastManager()

const toastCallable = (title: React.ReactNode, options?: ToastOptions) =>
  baseToast.add({ title, ...options })

const toast = Object.assign(toastCallable, baseToast, {
  add: (options: ToastOptions & { title?: React.ReactNode }) => baseToast.add(options),
  success: (title: React.ReactNode, options?: ToastOptions) =>
    baseToast.add({ title, type: "success", ...options }),
  error: (title: React.ReactNode, options?: ToastOptions) =>
    baseToast.add({ title, type: "error", ...options }),
  info: (title: React.ReactNode, options?: ToastOptions) =>
    baseToast.add({ title, type: "info", ...options }),
  warning: (title: React.ReactNode, options?: ToastOptions) =>
    baseToast.add({ title, type: "warning", ...options }),
  message: (title: React.ReactNode, options?: ToastOptions) =>
    baseToast.add({ title, ...options }),
  loading: (title: React.ReactNode, options?: ToastOptions) =>
    baseToast.add({ title, type: "loading", ...options }),
})

function ToastProvider({ ...props }: ToastPrimitive.Provider.Props) {
  return <ToastPrimitive.Provider {...props} />
}

function ToastPortal({ ...props }: ToastPrimitive.Portal.Props) {
  return <ToastPrimitive.Portal data-slot="toast-portal" {...props} />
}

function ToastViewport({ className, ...props }: ToastPrimitive.Viewport.Props) {
  return (
    <ToastPrimitive.Viewport
      data-slot="toast-viewport"
      className={cn(
        "pointer-events-none fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-[100] flex flex-col items-center w-full max-w-md px-4 outline-none",
        className
      )}
      {...props}
    />
  )
}

function Toast({ className, ...props }: ToastPrimitive.Root.Props) {
  return (
    <ToastPrimitive.Root
      data-slot="toast"
      className={cn(
        "group/toast pointer-events-auto absolute bottom-0 z-[calc(1000-var(--toast-index))] w-auto min-w-[220px] max-w-[calc(100vw-2rem)] sm:max-w-md origin-bottom rounded-2xl border border-border/80 bg-card/95 text-card-foreground shadow-xl shadow-black/25 backdrop-blur-md will-change-transform outline-none select-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
        "[--gap:0.75rem] [--height:var(--toast-frontmost-height,var(--toast-height))] [--offset-y:calc(-1*var(--toast-offset-y)-calc(var(--toast-index)*var(--gap))+var(--toast-swipe-movement-y))] [--peek:0.75rem] [--scale:calc(max(0,1-(var(--toast-index)*0.08)))]",
        "h-(--height) [transform:translateX(var(--toast-swipe-movement-x))_translateY(calc(var(--toast-swipe-movement-y)-(var(--toast-index)*var(--peek))))_scale(var(--scale))] [transition:transform_400ms_cubic-bezier(0.16,1,0.3,1),opacity_400ms,height_150ms]",
        "after:absolute after:top-full after:left-0 after:h-[calc(var(--gap)+1px)] after:w-full after:content-['']",
        "data-expanded:h-(--toast-height) data-expanded:[transform:translateX(var(--toast-swipe-movement-x))_translateY(var(--offset-y))]",
        "data-limited:opacity-0 data-starting-style:[transform:translateY(150%)]",
        "[&[data-ending-style]:not([data-limited]):not([data-swipe-direction])]:[transform:translateY(150%)]",
        "data-ending-style:data-[swipe-direction=down]:[transform:translateY(calc(var(--toast-swipe-movement-y)+150%))]",
        "data-ending-style:data-[swipe-direction=up]:[transform:translateY(calc(var(--toast-swipe-movement-y)-150%))]",
        "data-ending-style:data-[swipe-direction=left]:[transform:translateX(calc(var(--toast-swipe-movement-x)-150%))_translateY(var(--offset-y))]",
        "data-ending-style:data-[swipe-direction=right]:[transform:translateX(calc(var(--toast-swipe-movement-x)+150%))_translateY(var(--offset-y))]",
        className
      )}
      {...props}
    />
  )
}

function ToastContent({ className, ...props }: ToastPrimitive.Content.Props) {
  return (
    <ToastPrimitive.Content
      data-slot="toast-content"
      className={cn(
        "flex h-full items-center justify-between gap-3 overflow-hidden px-4 py-2.5 sm:py-3 transition-opacity duration-250 ease-[cubic-bezier(0.22,1,0.36,1)] data-behind:opacity-0 data-expanded:opacity-100",
        className
      )}
      {...props}
    />
  )
}

function ToastTitle({ className, ...props }: ToastPrimitive.Title.Props) {
  return (
    <ToastPrimitive.Title
      data-slot="toast-title"
      className={cn("text-sm font-medium tracking-tight text-foreground select-none", className)}
      {...props}
    />
  )
}

function ToastDescription({
  className,
  ...props
}: ToastPrimitive.Description.Props) {
  return (
    <ToastPrimitive.Description
      data-slot="toast-description"
      className={cn("text-xs text-muted-foreground leading-normal select-none", className)}
      {...props}
    />
  )
}

function ToastAction({
  className,
  render = <Button variant="outline" size="xs" />,
  ...props
}: ToastPrimitive.Action.Props) {
  return (
    <ToastPrimitive.Action
      data-slot="toast-action"
      render={render}
      className={cn("shrink-0", className)}
      {...props}
    />
  )
}

function ToastClose({
  className,
  children,
  ...props
}: ToastPrimitive.Close.Props) {
  return (
    <div className="flex items-center shrink-0 pl-1">
      <div className="h-4 sm:h-5 w-px bg-border/80 shrink-0 mr-2.5" />
      <ToastPrimitive.Close
        data-slot="toast-close"
        aria-label="Close toast"
        className={cn(
          "inline-flex size-6 sm:size-7 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors cursor-pointer",
          className
        )}
        {...props}
      >
        {children ?? (
          <HugeiconsIcon icon={Cancel01Icon} className="size-3.5" aria-hidden="true" strokeWidth={2.5} />
        )}
      </ToastPrimitive.Close>
    </div>
  )
}

export function ToastSuccessIcon({ className }: { className?: string } = {}) {
  return (
    <span
      className={cn(
        "flex size-6 items-center justify-center rounded-full bg-success text-success-foreground shrink-0 shadow-xs ring-2 ring-success/20",
        className
      )}
    >
      <svg
        className="size-3.5"
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3.5 8.5L6.5 11.5L12.5 5" />
      </svg>
    </span>
  )
}

function ToastIcon({ type, title }: { type: string | undefined; title?: React.ReactNode }) {
  const isSuccess =
    type === "success" ||
    (typeof title === "string" && /copied|success|saved|created|updated/i.test(title))

  if (isSuccess) {
    return <ToastSuccessIcon />
  }

  if (type === "info") {
    return (
      <span className="flex size-6 items-center justify-center rounded-full bg-info/15 text-info shrink-0 ring-2 ring-info/20">
        <HugeiconsIcon icon={InformationCircleIcon} className="size-3.5" aria-hidden="true" strokeWidth={2.5} />
      </span>
    )
  }

  if (type === "warning") {
    return (
      <span className="flex size-6 items-center justify-center rounded-full bg-warning/20 text-warning shrink-0 ring-2 ring-warning/20">
        <HugeiconsIcon icon={Alert02Icon} className="size-3.5" aria-hidden="true" strokeWidth={2.5} />
      </span>
    )
  }

  if (type === "error") {
    return (
      <span className="flex size-6 items-center justify-center rounded-full bg-destructive/15 text-destructive shrink-0 ring-2 ring-destructive/20">
        <HugeiconsIcon icon={Cancel01Icon} className="size-3.5" aria-hidden="true" strokeWidth={2.5} />
      </span>
    )
  }

  if (type === "loading") {
    return (
      <HugeiconsIcon icon={Loading01Icon} className="size-4.5 animate-spin text-primary shrink-0" aria-hidden="true" strokeWidth={2.5} />
    )
  }

  return null
}

function ToastList() {
  const { toasts } = ToastPrimitive.useToastManager()

  return toasts.map((toastItem) => (
    <Toast key={toastItem.id} toast={toastItem}>
      <ToastContent>
        <ToastIcon type={toastItem.type} title={toastItem.title} />
        <div className="flex min-w-0 flex-1 flex-col gap-0.5 justify-center">
          <ToastTitle />
          <ToastDescription />
        </div>
        <ToastAction />
        <ToastClose />
      </ToastContent>
    </Toast>
  ))
}

function Toaster({
  children,
  toastManager = toast,
  ...props
}: ToastPrimitive.Provider.Props) {
  return (
    <ToastProvider toastManager={toastManager} {...props}>
      {children}
      <ToastPortal>
        <ToastViewport>
          <ToastList />
        </ToastViewport>
      </ToastPortal>
    </ToastProvider>
  )
}

const createToastManager = ToastPrimitive.createToastManager
const useToastManager = ToastPrimitive.useToastManager

export {
  Toaster,
  Toast,
  ToastAction,
  ToastClose,
  ToastContent,
  ToastDescription,
  ToastPortal,
  ToastProvider,
  ToastTitle,
  ToastViewport,
  createToastManager,
  toast,
  useToastManager,
}
