"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export function SettingsSection({
  title,
  description,
  children,
  footer,
}: {
  title: string
  description: string
  children: React.ReactNode
  footer?: React.ReactNode
}) {
  return (
    <Card className="rounded-xl border border-border/40 bg-card p-6 gap-4">
      <CardHeader className="p-0 border-b border-border/40 pb-4">
        <CardTitle className="text-base font-semibold text-foreground">
          {title}
        </CardTitle>
        <CardDescription className="text-xs">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0 flex flex-col gap-4">
        {children}
      </CardContent>
      {footer ? (
        <CardFooter className="p-0 pt-4 border-t border-border/40 flex justify-end">
          {footer}
        </CardFooter>
      ) : null}
    </Card>
  )
}
