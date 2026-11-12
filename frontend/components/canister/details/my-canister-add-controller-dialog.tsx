"use client"

import { useEffect, useMemo, useState } from "react"
import { useTranslations } from "next-intl"
import { toast } from "@/components/ui/toast"
import { HugeiconsIcon } from "@hugeicons/react"
import { UserAdd01Icon, InformationCircleIcon } from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { CanisterSuccessDialog } from "@/components/canister/canister-success-dialog"
import { useAuth } from "@/components/auth/auth-provider"
import { addController, Principal } from "@/services/canister/management"
import { formatManageError } from "@/services/canister/management"

export function MyCanisterAddControllerDialog({
  open,
  onOpenChange,
  canisterId,
  onDone,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  canisterId: string
  onDone?: () => void
}) {
  const t = useTranslations("myCanisters")
  const { identity, isAuthenticated } = useAuth()
  const [principalText, setPrincipalText] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState<{ principal: string } | null>(null)

  useEffect(() => {
    if (!open) return
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPrincipalText("")
    setSuccess(null)
  }, [open])

  const principalError = useMemo(() => {
    const text = principalText.trim()
    if (!text) return null
    try {
      const p = Principal.fromText(text)
      if (p.isAnonymous()) return t("invalidPrincipal")
      return null
    } catch {
      return t("invalidPrincipal")
    }
  }, [principalText, t])

  const onConfirm = async () => {
    if (!identity || !principalText.trim() || principalError) return
    setSubmitting(true)
    try {
      await addController(identity, canisterId, principalText.trim())
      setSuccess({ principal: principalText.trim() })
      onDone?.()
    } catch (e) {
      toast.error(formatManageError(e))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <Dialog
        open={open && success == null}
        onOpenChange={(next) => {
          if (!submitting) onOpenChange(next)
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="gap-1.5">
            <DialogTitle className="flex items-center gap-2">
              <HugeiconsIcon icon={UserAdd01Icon} className="size-5 text-primary shrink-0" strokeWidth={1.75} />
              <span>{t("addControllerTitle")}</span>
            </DialogTitle>
            <DialogDescription>
              {t("addControllerHint")}
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={(e) => {
              e.preventDefault()
              void onConfirm()
            }}
          >
            <FieldGroup className="gap-4 py-2">
              {/* Guide Callout */}
              <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 text-xs space-y-1">
                <div className="flex items-center gap-1.5 font-medium text-foreground">
                  <HugeiconsIcon icon={InformationCircleIcon} className="size-3.5 text-primary" />
                  <span>Controller Permissions on Internet Computer</span>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  Controllers hold full administrative authority over this canister. They can install WASM code, start or stop execution, modify resource limits, and add or remove other controllers.
                </p>
              </div>

              <p className="text-xs text-muted-foreground">
                {t("transferFromContext")}:{" "}
                <span className="break-all font-mono text-foreground/80">{canisterId}</span>
              </p>

              <Field className="gap-2">
                <FieldLabel htmlFor="add-controller-principal">{t("addControllerLabel")}</FieldLabel>
                <Input
                  id="add-controller-principal"
                  value={principalText}
                  onChange={(e) => setPrincipalText(e.target.value)}
                  placeholder={t("addControllerPlaceholder")}
                  spellCheck={false}
                  autoComplete="off"
                  disabled={submitting}
                  aria-invalid={Boolean(principalError)}
                  className="font-mono text-sm"
                />
                {principalError ? (
                  <FieldError className="text-xs">{principalError}</FieldError>
                ) : (
                  <FieldDescription className="text-[11px] text-muted-foreground">{t("addControllerFullListHint")}</FieldDescription>
                )}
              </Field>
            </FieldGroup>

            <DialogFooter className="mt-4 gap-2 sm:gap-2">
              <DialogClose
                render={
                  <Button variant="outline" disabled={submitting}>
                    {t("topUpCancel")}
                  </Button>
                }
              />
              <Button
                type="submit"
                disabled={
                  !isAuthenticated ||
                  submitting ||
                  !principalText.trim() ||
                  principalError != null
                }
              >
                {submitting && <Spinner data-icon="inline-start" />}
                <span>{submitting ? t("addControllerSubmitting") : t("addControllerConfirm")}</span>
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <CanisterSuccessDialog
        open={success != null}
        onClose={() => {
          setSuccess(null)
          onOpenChange(false)
        }}
        title={t("addControllerSuccessTitle")}
        monoId={success?.principal}
        detail={
          success ? (
            <p className="text-sm text-muted-foreground">{t("addControllerSuccessBody")}</p>
          ) : null
        }
      />
    </>
  )
}
