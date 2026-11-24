"use client"

import { useState, useEffect } from "react"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldDescription,
  FieldError,
} from "@/components/ui/field"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"
import { Icon } from "@/components/ui/icon"
import { ShieldCheckGlassIcon, EyeGlassIcon, EyeClosedGlassIcon, ArrowRightGlassIcon } from "@thesvg/ui-react"
import {
  getAdminSession,
  verifyAdminCredentials,
  type AcademyAdminSession,
} from "@/services/academy/admin-auth"
import { cn } from "@/lib/ui/utils"

interface AcademyAdminGateProps {
  children: React.ReactNode
  className?: string
}

export function AcademyAdminGate({ children, className }: AcademyAdminGateProps) {
  const [session, setSession] = useState<AcademyAdminSession | null>(null)
  const [isInitializing, setIsInitializing] = useState(true)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setSession(getAdminSession())
      setIsInitializing(false)
    }, 0)
    return () => clearTimeout(timer)
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)
    setIsSubmitting(true)

    try {
      const active = await verifyAdminCredentials(email, password)
      if (active) {
        setSession(active)
      } else {
        setErrorMessage("Invalid administrative credentials. Please verify your email and password.")
      }
    } catch {
      setErrorMessage("An unexpected error occurred during authentication. Please retry.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isInitializing) {
    return (
      <div className="flex min-h-[60vh] w-full items-center justify-center p-6">
        <Spinner className="size-8 text-primary" />
      </div>
    )
  }

  if (session) {
    return <>{children}</>
  }

  return (
    <div className={cn("flex min-h-[75vh] w-full items-center justify-center p-4", className)}>
      <Card className="w-full max-w-md border-border bg-card shadow-lg">
        <CardHeader className="space-y-2 pb-4 text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Icon icon={ShieldCheckGlassIcon} className="size-6" />
          </div>
          <div className="flex items-center justify-center gap-2">
            <Badge variant="outline" className="border-primary/20 bg-primary/5 text-primary">
              Management Suite
            </Badge>
          </div>
          <CardTitle className="text-xl font-bold tracking-tight text-card-foreground">
            ICAcademy Admin Portal
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            Enter your authorized administrative credentials to access platform controls.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleLogin}>
            <FieldGroup>
              {errorMessage && (
                <FieldError className="rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-xs font-medium text-destructive">
                  {errorMessage}
                </FieldError>
              )}

              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@icpay.app"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-input border-input text-foreground"
                />
              </Field>

              <Field>
                <div className="flex min-h-6 items-center justify-between gap-2">
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <Button
                    type="button"
                    variant="ghost"
                    size="xs"
                    onClick={() => setShowPassword(!showPassword)}
                    className="h-6 gap-1 text-xs text-muted-foreground hover:text-foreground"
                  >
                    <Icon icon={showPassword ? EyeClosedGlassIcon : EyeGlassIcon} className="size-3.5" />
                    <span>{showPassword ? "Hide" : "Show"}</span>
                  </Button>
                </div>
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••••••"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-input border-input text-foreground"
                />
              </Field>

              <Field>
                <Button
                  type="submit"
                  disabled={isSubmitting || !email || !password}
                  className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  {isSubmitting ? (
                    <>
                      <Spinner data-icon="inline-start" />
                      <span>Authenticating...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In to Academy Admin</span>
                      <Icon icon={ArrowRightGlassIcon} className="size-4" />
                    </>
                  )}
                </Button>
                <FieldDescription className="text-center text-xs text-muted-foreground">
                  Secured via SHA-256 hash validation and session-bound local verification.
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
