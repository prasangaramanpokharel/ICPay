import * as React from "react"
import { Icon } from "@/components/ui/icon"
import { ArrowLeftGlassIcon, ArrowRightGlassIcon, EllipsisGlassIcon } from "@thesvg/ui-react"
import { cn } from "@/lib/ui/utils"
import { Button } from "@/components/ui/button"

function Pagination({ className, ...props }: React.ComponentProps<"nav">) {
  return (
    <nav
      role="navigation"
      aria-label="pagination"
      data-slot="pagination"
      className={cn("mx-auto flex w-full justify-center", className)}
      {...props}
    />
  )
}

function PaginationContent({
  className,
  ...props
}: React.ComponentProps<"ul">) {
  return (
    <ul
      data-slot="pagination-content"
      className={cn("flex items-center gap-1", className)}
      {...props}
    />
  )
}

function PaginationItem({ ...props }: React.ComponentProps<"li">) {
  return <li data-slot="pagination-item" {...props} />
}

type PaginationLinkProps = {
  isActive?: boolean
  disabled?: boolean
} & Pick<React.ComponentProps<typeof Button>, "size"> &
  React.ComponentProps<"a"> &
  React.ComponentProps<"button">

function PaginationLink({
  className,
  isActive,
  size = "icon",
  disabled,
  href,
  children,
  ...props
}: PaginationLinkProps) {
  if (href) {
    return (
      <Button
        variant={isActive ? "outline" : "ghost"}
        size={size}
        disabled={disabled}
        className={cn(className)}
        nativeButton={false}
        render={
          <a
            href={href}
            aria-current={isActive ? "page" : undefined}
            data-slot="pagination-link"
            data-active={isActive}
            {...(props as React.ComponentProps<"a">)}
          >
            {children}
          </a>
        }
      />
    )
  }

  return (
    <Button
      type="button"
      variant={isActive ? "outline" : "ghost"}
      size={size}
      disabled={disabled}
      aria-current={isActive ? "page" : undefined}
      data-slot="pagination-link"
      data-active={isActive}
      className={cn(className)}
      {...(props as React.ComponentProps<typeof Button>)}
    >
      {children}
    </Button>
  )
}

function PaginationPrevious({
  className,
  text = "Previous",
  disabled,
  ...props
}: React.ComponentProps<typeof PaginationLink> & { text?: string }) {
  return (
    <PaginationLink
      aria-label="Go to previous page"
      size="default"
      disabled={disabled}
      className={cn("gap-1 px-2.5 sm:pl-2.5", className)}
      {...props}
    >
      <Icon icon={ArrowLeftGlassIcon} className="size-4" data-icon="inline-start" />
      <span className="hidden sm:inline-block">{text}</span>
    </PaginationLink>
  )
}

function PaginationNext({
  className,
  text = "Next",
  disabled,
  ...props
}: React.ComponentProps<typeof PaginationLink> & { text?: string }) {
  return (
    <PaginationLink
      aria-label="Go to next page"
      size="default"
      disabled={disabled}
      className={cn("gap-1 px-2.5 sm:pr-2.5", className)}
      {...props}
    >
      <span className="hidden sm:inline-block">{text}</span>
      <Icon icon={ArrowRightGlassIcon} className="size-4" data-icon="inline-end" />
    </PaginationLink>
  )
}

function PaginationEllipsis({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      aria-hidden
      data-slot="pagination-ellipsis"
      className={cn(
        "flex size-9 items-center justify-center [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      <Icon icon={EllipsisGlassIcon} className="size-4" />
      <span className="sr-only">More pages</span>
    </span>
  )
}

export {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
}
