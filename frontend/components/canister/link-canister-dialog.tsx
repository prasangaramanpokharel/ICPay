"use client"

import { useMemo, useState } from "react"
import { AnimatePresence, motion } from "motion/react"
import { Icon } from "@/components/ui/icon"
import { XGlassIcon, LinkGlassIcon, CheckGlassOutlineIcon } from "@thesvg/ui-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { CopyIconIndicator } from "@/components/ui/copy-button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Separator } from "@/components/ui/separator"
import { Spinner } from "@/components/ui/spinner"
import { CodeBlock } from "@/components/ui/code-block"
import { toast } from "@/components/ui/toast"
import { useAuth } from "@/components/auth/auth-provider"
import { parseCanisterId } from "@/services/cycles/topUp"
import { rememberCanister } from "@/lib/canister/savedCanisters"
import { syncCanisterToCloud } from "@/services/canister/cnsClient"
import { fetchCanisterStatus, isControllerDenied } from "@/services/canister/management"
import { playSuccessChime } from "@/lib/ui/successChime"
import { cn } from "@/lib/ui/utils"

interface StepDef {
  title: string
  subtitle: string
}

const STEPS: StepDef[] = [
  { title: "Canister", subtitle: "Target ID & name" },
  { title: "Connect", subtitle: "CLI & verify" },
  { title: "Linked", subtitle: "Ready to use" },
]

const segmentWidth = 100 / STEPS.length

function tryParseCanisterId(raw: string): string | null {
  const text = raw.trim()
  if (!text) return null
  try {
    return parseCanisterId(text).toText()
  } catch {
    return null
  }
}

export interface LinkCanisterDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: (canister: { id: string; name: string; verified: boolean }) => void
}

export function LinkCanisterDialog({
  open,
  onOpenChange,
  onSuccess,
}: LinkCanisterDialogProps) {
  const { identity } = useAuth()
  const principal = identity?.getPrincipal().toText() ?? null

  const [activeStep, setActiveStep] = useState(0)
  const [draftId, setDraftId] = useState("")
  const [draftName, setDraftName] = useState("")
  const [isVerifying, setIsVerifying] = useState(false)
  const [verifyError, setVerifyError] = useState<string | null>(null)
  const [isVerified, setIsVerified] = useState(false)
  const [copiedId, setCopiedId] = useState(false)

  const [prevOpen, setPrevOpen] = useState(open)
  if (open !== prevOpen) {
    setPrevOpen(open)
    if (open) {
      setActiveStep(0)
      setDraftId("")
      setDraftName("")
      setVerifyError(null)
      setIsVerifying(false)
      setIsVerified(false)
      setCopiedId(false)
    }
  }

  const parsedDraft = useMemo(() => tryParseCanisterId(draftId), [draftId])
  const draftTouched = draftId.trim().length > 0
  const draftValid = parsedDraft != null
  const draftInvalid = draftTouched && !draftValid

  const generatedCommand = useMemo(() => {
    const canisterId = parsedDraft || "<CANISTER_ID>"
    const safePrincipal = principal || "<YOUR_PRINCIPAL>"
    return `export DFX_WARNING=-mainnet_plaintext_identity\ndfx canister --network ic update-settings ${canisterId} --add-controller ${safePrincipal}`
  }, [parsedDraft, principal])

  const handleNextFromStep0 = (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!draftValid) return
    setVerifyError(null)
    setActiveStep(1)
  }

  const handleVerify = async () => {
    if (!parsedDraft || !principal || !identity) return
    setIsVerifying(true)
    setVerifyError(null)

    try {
      const status = await fetchCanisterStatus(identity, parsedDraft)
      if (status.isController) {
        const name = draftName.trim()
        rememberCanister(principal, parsedDraft, name)
        void syncCanisterToCloud(identity, parsedDraft, name)
        setIsVerified(true)
        playSuccessChime()
        setActiveStep(2)
        onSuccess?.({ id: parsedDraft, name, verified: true })
      } else {
        setVerifyError("Principal is not a controller yet. Run the CLI command above first.")
      }
    } catch (err) {
      if (isControllerDenied(err)) {
        setVerifyError("Principal is not a controller yet. Run the CLI command above first.")
      } else {
        setVerifyError("Could not verify controller. Ensure the canister ID is correct.")
      }
    } finally {
      setIsVerifying(false)
    }
  }

  const handleSkipVerify = () => {
    if (!parsedDraft || !principal) return
    const name = draftName.trim()
    rememberCanister(principal, parsedDraft, name)
    if (identity) {
      void syncCanisterToCloud(identity, parsedDraft, name)
    }
    setIsVerified(false)
    playSuccessChime()
    setActiveStep(2)
    onSuccess?.({ id: parsedDraft, name, verified: false })
  }

  const handleCopyId = async () => {
    if (!parsedDraft) return
    try {
      await navigator.clipboard.writeText(parsedDraft)
      setCopiedId(true)
      toast.success("Successfully copied")
      setTimeout(() => setCopiedId(false), 2000)
    } catch {}
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-w-[calc(100vw-2rem)] w-full min-w-0 overflow-hidden p-6">
        <DialogHeader className="space-y-1">
          <div className="flex items-center justify-between">
            <DialogTitle>
              Link canister
            </DialogTitle>
            <span className="text-xs text-muted-foreground">
              Step {activeStep + 1} of {STEPS.length}
            </span>
          </div>
          <DialogDescription>
            {activeStep === 0 &&
              "Attach an existing canister you created (dfx, NNS, or third-party) to manage or monitor on ICPay."}
            {activeStep === 1 &&
              "Run the CLI command in your terminal to grant management access, then click Verify."}
            {activeStep === 2 &&
              "Your canister is ready on your ICPay dashboard."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 pt-1">
          <div className="relative h-1.5 w-full rounded-full bg-muted overflow-hidden">
            <motion.div
              className="absolute inset-y-0 left-0 rounded-full bg-primary/20"
              initial={false}
              animate={{ width: `${activeStep * segmentWidth}%` }}
              transition={{ type: "spring", stiffness: 150, damping: 22 }}
            />
            <motion.div
              className="absolute inset-y-0 rounded-full bg-primary"
              initial={false}
              animate={{ x: `${activeStep * 100}%`, width: `${segmentWidth}%` }}
              transition={{ type: "spring", stiffness: 150, damping: 22 }}
            />
          </div>

          <div className="flex gap-1">
            {STEPS.map((step, index) => {
              const isActive = index === activeStep
              const isCompleted = index < activeStep
              const isVerifyingThis = isVerifying && index === 1
              return (
                <Button
                  key={step.title}
                  type="button"
                  variant="ghost"
                  size="xs"
                  disabled={index > activeStep || activeStep === 2 || isVerifying}
                  onClick={() => {
                    if (index < activeStep && activeStep !== 2) {
                      setActiveStep(index)
                    }
                  }}
                  aria-current={isActive ? "step" : undefined}
                  className={cn(
                    "flex-1 hover:bg-transparent",
                    isActive
                      ? "font-semibold text-foreground"
                      : isCompleted
                        ? "text-muted-foreground hover:text-foreground"
                        : "text-muted-foreground/40"
                  )}
                >
                  {isVerifyingThis ? (
                    <Badge variant="outline" className="h-5 px-1.5 text-[10px] font-normal gap-1">
                      <Spinner data-icon="inline-start" />
                      <span>Verifying</span>
                    </Badge>
                  ) : (
                    <span>{step.title}</span>
                  )}
                </Button>
              )
            })}
          </div>
        </div>

        <Separator className="my-1" />

        <div className="min-h-[220px] flex flex-col justify-center min-w-0 max-w-full overflow-hidden">
          <AnimatePresence mode="wait">
            {activeStep === 0 && (
              <motion.div
                key="step-0"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col gap-4"
              >
                <form onSubmit={handleNextFromStep0} className="space-y-4">
                  <FieldGroup className="gap-3.5">
                    <Field className="gap-1.5">
                      <FieldLabel htmlFor="link-canister-id">
                        Canister ID <span className="text-destructive">*</span>
                      </FieldLabel>
                      <div className="relative">
                        <Input
                          id="link-canister-id"
                          value={draftId}
                          onChange={(e) => {
                            setDraftId(e.target.value)
                            setVerifyError(null)
                          }}
                          placeholder="e.g. 6vbhm-nqaaa-aaaan-q6muq-cai"
                          spellCheck={false}
                          autoFocus
                          aria-invalid={draftInvalid}
                          className={cn(
                            "pr-9 font-mono text-xs",
                            draftValid && "border-success/60 focus-visible:ring-success/30",
                            draftInvalid && "border-destructive focus-visible:ring-destructive/30"
                          )}
                        />
                        {draftTouched && (
                          <span className="pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2">
                            <Icon
                              icon={draftValid ? CheckGlassOutlineIcon : XGlassIcon}
                              className={cn(
                                "size-3.5",
                                draftValid ? "text-success" : "text-destructive"
                              )}
                            />
                          </span>
                        )}
                      </div>
                      {draftInvalid ? (
                        <FieldError className="text-xs">
                          Please enter a valid ICP canister ID
                        </FieldError>
                      ) : (
                        <FieldDescription className="text-[11px] text-muted-foreground">
                          Enter the principal ID of the canister you wish to attach.
                        </FieldDescription>
                      )}
                    </Field>

                    <Field className="gap-1.5">
                      <FieldLabel htmlFor="link-canister-name">
                        Canister name <span className="text-muted-foreground text-xs font-normal">(optional)</span>
                      </FieldLabel>
                      <Input
                        id="link-canister-name"
                        value={draftName}
                        onChange={(e) => setDraftName(e.target.value)}
                        placeholder="e.g. Backend API, Assets"
                        maxLength={48}
                        className="text-xs"
                      />
                    </Field>
                  </FieldGroup>

                  <div className="flex items-center justify-between pt-2">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => onOpenChange(false)}
                      className="cursor-pointer"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={!draftValid}
                      className="cursor-pointer font-medium"
                    >
                      Continue
                    </Button>
                  </div>
                </form>
              </motion.div>
            )}

            {activeStep === 1 && (
              <motion.div
                key="step-1"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
                className="space-y-4 min-w-0 max-w-full overflow-hidden"
              >
                <div className="flex items-center justify-between rounded-lg border border-border/70 bg-muted/30 px-3 py-2 text-xs">
                  <div className="flex items-center gap-2 truncate">
                    <span className="text-muted-foreground">Target:</span>
                    <span className="font-mono font-medium text-foreground">{parsedDraft}</span>
                    {draftName.trim() && (
                      <Badge variant="secondary" className="text-[10px]">
                        {draftName.trim()}
                      </Badge>
                    )}
                  </div>
                  {isVerifying ? (
                    <Badge variant="outline" className="text-[11px] h-5">
                      <Spinner data-icon="inline-start" />
                      <span>Verifying</span>
                    </Badge>
                  ) : (
                    <Button
                      type="button"
                      variant="link"
                      size="xs"
                      onClick={() => setActiveStep(0)}
                      className="h-auto shrink-0 p-0"
                    >
                      Change
                    </Button>
                  )}
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-foreground flex items-center gap-1.5">
                      <Icon icon={LinkGlassIcon} className="size-3.5 text-primary" />
                      Add Controller via CLI
                    </span>
                    <span className="text-[11px] text-muted-foreground">bash</span>
                  </div>

                  <CodeBlock
                    code={generatedCommand}
                    language="bash"
                    className="text-xs"
                  />

                  <p className="text-[11px] text-muted-foreground leading-normal">
                    Run this in your terminal using your operator identity (e.g. <code>default</code>) to authorize your Internet Identity.
                  </p>
                </div>

                {verifyError && (
                  <p className="text-xs text-destructive font-medium">
                    Verification Incomplete: {verifyError}
                  </p>
                )}

                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setActiveStep(0)}
                      disabled={isVerifying}
                      className="cursor-pointer"
                    >
                      Back
                    </Button>

                    <Button
                      type="button"
                      onClick={handleVerify}
                      disabled={isVerifying}
                      className="cursor-pointer font-medium"
                    >
                      {isVerifying && <Spinner data-icon="inline-start" />}
                      <span>{isVerifying ? "Verifying..." : "Verify Controller"}</span>
                    </Button>
                  </div>

                  <div className="text-center pt-1">
                    <Button
                      type="button"
                      variant="link"
                      size="xs"
                      onClick={handleSkipVerify}
                      disabled={isVerifying}
                      className="h-auto p-0 text-muted-foreground hover:text-foreground"
                    >
                      Not a controller yet? Skip &amp; link anyway for cycles monitoring
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}

            {activeStep === 2 && (
              <motion.div
                key="step-2"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="flex flex-col items-center justify-center text-center py-2"
              >
                <div className="animate-in fade-in zoom-in-75 mb-3 flex items-center justify-center text-success duration-200">
                  <Icon icon={CheckGlassOutlineIcon} className="size-12" strokeWidth={2.5} />
                </div>

                <h3 className="text-lg font-semibold tracking-tight text-foreground">
                  {isVerified ? "Canister Connected & Linked!" : "Canister Linked Successfully!"}
                </h3>
                <p className="mt-1 max-w-sm text-xs text-muted-foreground">
                  {isVerified
                    ? "Your Internet Identity principal is verified as an active controller on-chain."
                    : "The canister has been saved to your dashboard for cycles monitoring and top-ups."}
                </p>

                <div className="mt-4 w-full rounded-xl border border-border/70 bg-muted/30 p-3.5 text-left text-xs space-y-2.5">
                  {draftName.trim() && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Name</span>
                      <span className="font-medium text-foreground">{draftName.trim()}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-muted-foreground">Canister ID</span>
                    <div className="flex items-center gap-1 font-mono text-[11px] text-foreground">
                      <span>{parsedDraft}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-xs"
                        onClick={handleCopyId}
                        className="size-6 text-muted-foreground hover:text-foreground cursor-pointer"
                        title="Copy canister ID"
                      >
                        <CopyIconIndicator copied={copiedId} iconClassName="size-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Status</span>
                    {isVerified ? (
                      <Badge variant="default" className="text-[10px]">
                        Verified Controller
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-[10px]">
                        Linked (Observer)
                      </Badge>
                    )}
                  </div>
                </div>

                <Button
                  type="button"
                  className="mt-6 w-full cursor-pointer font-medium"
                  onClick={() => onOpenChange(false)}
                >
                  Done
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  )
}
