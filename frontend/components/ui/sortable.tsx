"use client"

import * as React from "react"
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type CollisionDetection,
  type DragEndEvent,
  type Modifier,
  type UniqueIdentifier,
  type DropAnimation,
  defaultDropAnimationSideEffects,
} from "@dnd-kit/core"
import {
  SortableContext,
  arrayMove,
  horizontalListSortingStrategy,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { cn } from "@/lib/ui/utils"
import { Spinner } from "@/components/ui/spinner"

type UseSortableReturn = ReturnType<typeof useSortable>

interface SortableItemContextValue {
  attributes: UseSortableReturn["attributes"]
  listeners: UseSortableReturn["listeners"]
  setActivatorNodeRef: UseSortableReturn["setActivatorNodeRef"]
  isDragging: boolean
  isMoving?: boolean
}

const SortableItemContext = React.createContext<SortableItemContextValue | null>(null)

function useSortableItem() {
  const context = React.useContext(SortableItemContext)
  if (!context) {
    throw new Error("useSortableItem must be used within SortableItem")
  }
  return context
}

type SortableStrategy = "vertical" | "horizontal" | "grid"

interface SortableProps<T> extends Omit<React.ComponentProps<"div">, "value"> {
  value: T[]
  onValueChange?: (value: T[]) => void
  onMove?: (event: { activeIndex: number; overIndex: number }) => void
  strategy?: SortableStrategy
  collisionDetection?: CollisionDetection
  getItemValue?: (item: T) => UniqueIdentifier
  sensors?: ReturnType<typeof useSensors>
  modifiers?: Modifier[]
}

function Sortable<T>({
  value,
  onValueChange,
  onMove,
  strategy = "vertical",
  collisionDetection = closestCenter,
  getItemValue,
  sensors,
  modifiers,
  className,
  children,
  ...props
}: SortableProps<T>) {
  const defaultSensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const itemIds = React.useMemo(() => {
    return value.map((item) =>
      getItemValue
        ? getItemValue(item)
        : ((item as unknown as { id: UniqueIdentifier }).id ?? (item as unknown as UniqueIdentifier))
    )
  }, [value, getItemValue])

  const resolvedStrategy = React.useMemo(() => {
    switch (strategy) {
      case "horizontal":
        return horizontalListSortingStrategy
      case "grid":
        return rectSortingStrategy
      case "vertical":
      default:
        return verticalListSortingStrategy
    }
  }, [strategy])

  const handleDragEnd = React.useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event
      if (!over || active.id === over.id) return

      const activeIndex = itemIds.indexOf(active.id)
      const overIndex = itemIds.indexOf(over.id)

      if (activeIndex !== -1 && overIndex !== -1) {
        const nextItems = arrayMove(value, activeIndex, overIndex)
        onValueChange?.(nextItems)
        onMove?.({ activeIndex, overIndex })
      }
    },
    [itemIds, onMove, onValueChange, value]
  )

  return (
    <DndContext
      sensors={sensors ?? defaultSensors}
      collisionDetection={collisionDetection}
      modifiers={modifiers}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={itemIds} strategy={resolvedStrategy}>
        <div data-slot="sortable" className={className} {...props}>
          {children}
        </div>
      </SortableContext>
    </DndContext>
  )
}

interface SortableItemProps extends React.ComponentProps<"div"> {
  value: UniqueIdentifier
  asHandle?: boolean
  isMoving?: boolean
  isDropTarget?: boolean
}

function SortableItem({
  value,
  className,
  style,
  asHandle = false,
  isMoving = false,
  isDropTarget = false,
  children,
  ...props
}: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: value })

  const itemStyle: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    transition,
    zIndex: isDragging ? 10 : undefined,
    opacity: isDragging ? 0.6 : 1,
    ...style,
  }

  const handleProps = asHandle
    ? {
        ...attributes,
        ...listeners,
      }
    : {}

  return (
    <SortableItemContext.Provider
      value={{
        attributes,
        listeners,
        setActivatorNodeRef,
        isDragging,
        isMoving,
      }}
    >
      <div
        ref={setNodeRef}
        style={itemStyle}
        data-slot="sortable-item"
        data-dragging={isDragging ? "" : undefined}
        className={cn(
          "group relative transition-all duration-200",
          isDragging && "shadow-md",
          isDropTarget && "border-2 border-dashed border-primary/90 bg-primary/10 shadow-xs",
          className
        )}
        {...handleProps}
        {...props}
      >
        {children}
        {isMoving ? (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-[inherit] bg-background/50 backdrop-blur-xs">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-card px-2.5 py-1 text-xs font-medium text-primary shadow-xs animate-pulse">
              <Spinner className="size-3.5 text-primary" />
              <span>Moving...</span>
            </span>
          </div>
        ) : null}
      </div>
    </SortableItemContext.Provider>
  )
}

interface SortableItemHandleProps extends React.ComponentProps<"button"> {
  hoverOnly?: boolean
}

function SortableItemHandle({
  className,
  hoverOnly = true,
  children,
  ...props
}: SortableItemHandleProps) {
  const { attributes, listeners, setActivatorNodeRef, isDragging } = useSortableItem()

  return (
    <button
      type="button"
      ref={setActivatorNodeRef}
      data-slot="sortable-item-handle"
      data-dragging={isDragging ? "" : undefined}
      className={cn(
        "inline-flex shrink-0 cursor-grab items-center justify-center border-0 bg-transparent p-0 text-muted-foreground select-none transition-all hover:text-foreground active:cursor-grabbing focus-visible:outline-hidden touch-none",
        hoverOnly && "opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100 group-data-dragging:opacity-100",
        className
      )}
      {...attributes}
      {...listeners}
      {...props}
    >
      {children}
    </button>
  )
}

const defaultDropAnimation: DropAnimation = {
  sideEffects: defaultDropAnimationSideEffects({
    styles: {
      active: {
        opacity: "0.5",
      },
    },
  }),
}

function SortableOverlay({
  dropAnimation = defaultDropAnimation,
  className,
  children,
  ...props
}: React.ComponentProps<typeof DragOverlay>) {
  return (
    <DragOverlay
      dropAnimation={dropAnimation}
      className={cn("cursor-grabbing shadow-xl scale-[1.02] transition-transform", className)}
      {...props}
    >
      {children}
    </DragOverlay>
  )
}

export {
  Sortable,
  SortableItem,
  SortableItemHandle,
  SortableOverlay,
  useSortableItem,
  arrayMove,
}
export { Pattern } from "@/components/shared/sortable-pattern"
export type {
  SortableProps,
  SortableItemProps,
  SortableItemHandleProps,
  SortableStrategy,
}
