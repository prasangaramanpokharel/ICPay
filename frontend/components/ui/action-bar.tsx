"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import { motion, AnimatePresence, type HTMLMotionProps } from "motion/react"
import { cva, type VariantProps } from "class-variance-authority"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/ui/utils"

interface ActionBarPositioning {
  gutter?: string
  placement?: "bottom" | "bottom-start" | "bottom-end"
}

interface ActionBarContextValue {
  isOpen: boolean
  onClose: () => void
  onOpen: () => void
  positioning: ActionBarPositioning
}

const ActionBarContext = React.createContext<ActionBarContextValue | null>(null)

export function useActionBar() {
  const context = React.useContext(ActionBarContext)
  if (!context) {
    throw new Error("useActionBar must be used within an ActionBar")
  }
  return context
}

export interface ActionBarProps {
  children?: React.ReactNode
  closeOnEscape?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  open?: boolean
  positioning?: ActionBarPositioning
}

const defaultPositioning: ActionBarPositioning = {
  gutter: "16px",
  placement: "bottom",
}

export function ActionBar({
  children,
  closeOnEscape = true,
  defaultOpen = false,
  onOpenChange,
  open,
  positioning,
}: ActionBarProps) {
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen)
  const isControlled = open !== undefined
  const isOpen = isControlled ? open : internalOpen

  const handleClose = React.useCallback(() => {
    if (!isControlled) {
      setInternalOpen(false)
    }
    onOpenChange?.(false)
  }, [isControlled, onOpenChange])

  const handleOpen = React.useCallback(() => {
    if (!isControlled) {
      setInternalOpen(true)
    }
    onOpenChange?.(true)
  }, [isControlled, onOpenChange])

  React.useEffect(() => {
    if (!isOpen || !closeOnEscape) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || event.defaultPrevented) return
      event.preventDefault()
      handleClose()
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [closeOnEscape, handleClose, isOpen])

  const contextValue = React.useMemo<ActionBarContextValue>(
    () => ({
      isOpen,
      onClose: handleClose,
      onOpen: handleOpen,
      positioning: { ...defaultPositioning, ...positioning },
    }),
    [handleClose, handleOpen, isOpen, positioning]
  )

  return (
    <ActionBarContext.Provider value={contextValue}>
      {children}
    </ActionBarContext.Provider>
  )
}

export type ActionBarTriggerProps = React.ComponentProps<"button">

export function ActionBarTrigger({
  onClick,
  ...props
}: ActionBarTriggerProps) {
  const { onOpen, isOpen } = useActionBar()

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onOpen()
    onClick?.(event)
  }

  return (
    <button
      type="button"
      data-slot="action-bar-trigger"
      data-state={isOpen ? "open" : "closed"}
      aria-expanded={isOpen}
      onClick={handleClick}
      {...props}
    />
  )
}

const actionBarPositionerVariants = cva(
  "fixed inset-x-0 bottom-0 z-50 flex pointer-events-none px-4 pb-[calc(var(--gutter)+env(safe-area-inset-bottom,0px))]",
  {
    variants: {
      placement: {
        bottom: "justify-center",
        "bottom-start": "justify-start",
        "bottom-end": "justify-end",
      },
    },
    defaultVariants: {
      placement: "bottom",
    },
  }
)

export interface ActionBarContentProps
  extends Omit<HTMLMotionProps<"div">, "children">,
    VariantProps<typeof actionBarPositionerVariants> {
  children?: React.ReactNode
}

const emptySubscribe = () => () => {}

export function ActionBarContent({
  className,
  children,
  placement: placementProp,
  style,
  ...props
}: ActionBarContentProps) {
  const { isOpen, positioning } = useActionBar()
  const mounted = React.useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  )

  if (!mounted) return null

  const placement = placementProp ?? positioning.placement ?? "bottom"
  const gutter = positioning.gutter ?? "16px"

  return createPortal(
    <AnimatePresence>
      {isOpen ? (
        <div
          data-slot="action-bar-positioner"
          data-placement={placement}
          className={cn(actionBarPositionerVariants({ placement }))}
          style={
            {
              "--gutter": gutter,
              ...style,
            } as React.CSSProperties
          }
        >
          <motion.div
            role="toolbar"
            data-slot="action-bar-content"
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className={cn(
              "pointer-events-auto flex w-fit items-center gap-1.5 rounded-2xl border border-border bg-popover/95 px-3 py-2 text-popover-foreground shadow-2xl backdrop-blur-md",
              className
            )}
            {...props}
          >
            {children}
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>,
    document.body
  )
}

export function ActionBarSeparator({
  className,
  ...props
}: React.ComponentProps<typeof Separator>) {
  return (
    <Separator
      orientation="vertical"
      data-slot="action-bar-separator"
      className={cn("mx-1 h-4 w-px bg-border", className)}
      {...props}
    />
  )
}

export type ActionBarCloseProps = React.ComponentProps<"button">

export function ActionBarClose({
  className,
  onClick,
  ...props
}: ActionBarCloseProps) {
  const { onClose, isOpen } = useActionBar()

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onClose()
    onClick?.(event)
  }

  return (
    <button
      type="button"
      data-slot="action-bar-close"
      data-state={isOpen ? "open" : "closed"}
      aria-label="Close"
      onClick={handleClick}
      className={cn(
        "inline-flex size-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
        className
      )}
      {...props}
    />
  )
}

export interface ActionBarValueProps
  extends React.ComponentProps<typeof Badge> {
  count?: number
  label?: string
}

export function ActionBarValue({
  count,
  label,
  className,
  children,
  ...props
}: ActionBarValueProps) {
  return (
    <Badge
      variant="secondary"
      data-slot="action-bar-value"
      className={cn("shrink-0 font-medium text-xs tabular-nums rounded-full px-2 py-0.5", className)}
      {...props}
    >
      {children ?? label ?? count}
    </Badge>
  )
}

export function ActionBarBody({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="action-bar-body"
      className={cn("flex items-center gap-1.5", className)}
      {...props}
    />
  )
}
