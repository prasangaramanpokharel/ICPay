import type { ReactNode } from "react"
import type { UiIcon, UiIconProps } from "@thesvg/ui-react"

export type { UiIcon, UiIconProps }

export interface IconProps extends Omit<UiIconProps, "children"> {
  icon: UiIcon
  children?: ReactNode
}

export function Icon({ icon: Component, children, ...props }: IconProps) {
  void children
  if (!Component) return null
  return <Component {...props} />
}
