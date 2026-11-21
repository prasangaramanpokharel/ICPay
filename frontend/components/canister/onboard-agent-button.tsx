"use client"

import { useState, useSyncExternalStore } from "react"
import { useTranslations } from "next-intl"
import { HugeiconsIcon } from "@hugeicons/react"
import { Cancel01Icon } from "@hugeicons/core-free-icons"
import { toast } from "@/components/ui/sonner"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Button } from "@/components/ui/button"

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback)
  return () => window.removeEventListener("storage", callback)
}

function getSnapshot() {
  try {
    return localStorage.getItem("icpay_agent_onboard_dismissed") === "1"
  } catch {
    return false
  }
}

function getServerSnapshot() {
  return false
}

function ClaudeCodeIcon({ className = "size-3.5" }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 600 600" className={className} aria-hidden="true">
      <path
        fill="#D97757"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M525 273.7h75v77.6h-75V427h-37.2v73H450v-73h-37.2v73H375v-73H225v73h-37.8v-73H150v73h-37.8v-73H75v-75.7H0v-77.6h75V125h450zm-375 0h37.2v-71.1H150zm262.8 0H450v-71.1h-37.2z"
      />
    </svg>
  )
}

function CursorIcon({ className = "size-3.5" }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 600 600" className={className} aria-hidden="true">
      <mask id="cursor-mask-onboard" width="525" height="600" x="37" y="0" maskUnits="userSpaceOnUse" style={{ maskType: "luminance" }}>
        <path fill="#fff" d="M37 0h525v600H37z" />
      </mask>
      <g mask="url(#cursor-mask-onboard)">
        <path fill="#72716d" d="m299.5 300 260 150.1a19 19 0 0 1-6.8 6.8l-243 140.4a20 20 0 0 1-20.4 0l-243-140.4a19 19 0 0 1-6.8-6.8z" />
        <path fill="#55544f" d="M299.5 0v300l-260 150.1A19 19 0 0 1 37 441V159a19 19 0 0 1 9.3-16l243-140.4A20 20 0 0 1 299.5 0" />
        <path fill="#43413c" d="M559.5 149.9a19 19 0 0 0-6.8-6.8L309.7 2.7A20 20 0 0 0 299.5 0v300l260 150.1a19 19 0 0 0 2.5-9.2V159q0-5-2.5-9.2z" />
        <path fill="#d6d5d2" d="M541.3 160.4a9 9 0 0 1 0 8.7l-236 408.8c-1.6 2.8-5.8 1.7-5.8-1.5V307a12 12 0 0 0-1.6-6z" />
        <path fill="#fff" d="M541.3 160.4 298 300.9a12 12 0 0 0-4.4-4.4L60.2 161.8c-2.8-1.6-1.6-5.8 1.5-5.8h472c3.4 0 6.2 1.8 7.6 4.4" />
      </g>
    </svg>
  )
}

function OpenCodeIcon({ className = "size-3.5" }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 600 600" className={className} aria-hidden="true">
      <g fillRule="evenodd">
        <path fill="#CFCECD" d="M420 480H180V240h240z" />
        <path fill="#211E1E" d="M420 120H180v360h240zm120 480H60V0h480z" />
      </g>
    </svg>
  )
}

function WindsurfIcon({ className = "size-3.5" }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" className={className} fill="currentColor" aria-hidden="true">
      <path
        clipRule="evenodd"
        d="M594.5 125.1h-5.7a54.7 54.7 0 0 0-54.5 54.9v122.8a44.5 44.5 0 0 1-44 44.4 46 46 0 0 1-36.8-19.3L329.2 148.8A55 55 0 0 0 284 125a55 55 0 0 0-53.9 54.3v123.5a44.3 44.3 0 0 1-80.8 25L10.2 127.5A5.6 5.6 0 0 0 0 130.8v107.1q.1 8.2 4.7 15.1l136.9 197.2a54.2 54.2 0 0 0 99.9-29.5V297.3a44 44 0 0 1 44-44.3c14.7 0 28.4 7.2 36.8 19.3l124.3 179A54 54 0 0 0 492 475c29 0 53.8-24.3 53.8-54.3V297.2a44 44 0 0 1 44-44.3h4.8c3 0 5.5-2.5 5.5-5.6V130.6a5.5 5.5 0 0 0-5.5-5.5z"
      />
    </svg>
  )
}

function AntigravityIcon({ className = "size-3.5" }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 600 600" className={className} aria-hidden="true">
      <mask id="antigravity-mask-onboard" width="618" height="579.4" x="0" y="23.6" maskUnits="userSpaceOnUse">
        <path fill="#fff" d="M543.8 563.8c33.5 25.1 83.7 8.4 37.7-37.7-138.2-134-108.9-502.5-280.6-502.5S158.5 392.1 20.4 526.1C-30 576.4 24.6 589 58 563.8c129.8-88 121.4-242.9 242.8-242.9s113 155 242.9 242.9" />
      </mask>
      <g mask="url(#antigravity-mask-onboard)">
        <g filter="url(#ag-filter-1-onboard)">
          <path fill="#FFE432" d="M-25.5-101.2C-35.6-11.4 41.7 71.1 147.3 83.1S346.8 32 357-57.7 289.8-230 184.2-242-15.3-191-25.5-101.2" />
        </g>
        <g filter="url(#ag-filter-2-onboard)">
          <path fill="#FC413D" d="M381.7 192.3c26.5 114 142.3 184.4 258.7 157.3 116.5-27 189.4-141.3 163-255.2C776.8-19.6 661-90 544.5-63S355.3 78.4 381.7 192.3" />
        </g>
        <g filter="url(#ag-filter-3-onboard)">
          <path fill="#00B95C" d="M-311 268.7c33.4 117.6 184 177.8 336.3 134.5s248.6-173.7 215.2-291.3S56.5-66-95.8-22.6s-248.7 173.8-215.3 291.3" />
        </g>
        <g filter="url(#ag-filter-4-onboard)">
          <path fill="#3186FF" d="M248.3 689c26 112.1 134.6 182.6 242.5 157.6 108-25.1 174.3-136.3 148.3-248.3S504.5 415.7 396.6 440.8 222.3 577 248.3 689" />
        </g>
        <g filter="url(#ag-filter-5-onboard)">
          <path fill="#FBBC04" d="M64.3-206C9.8-84.6 69.4 60.4 197.5 117.9S473.5 123.5 528 2s-5-266.3-133.2-323.7-276-5.7-330.5 115.7" />
        </g>
        <g filter="url(#ag-filter-6-onboard)">
          <path fill="#749BFF" d="M717.7 435.4c-35.3 41.2-127.5 20.2-205.8-47-78.4-67.1-113.3-155-78-196.2s127.5-20.2 205.9 47c78.4 67.1 113.3 155 78 196.2" />
        </g>
      </g>
      <defs>
        <filter id="ag-filter-1-onboard" width="495.9" height="439.7" x="-82.2" y="-299.3" colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse">
          <feGaussianBlur stdDeviation="27.9" />
        </filter>
        <filter id="ag-filter-2-onboard" width="972.5" height="964.1" x="106.3" y="-338.7" colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse">
          <feGaussianBlur stdDeviation="135" />
        </filter>
        <filter id="ag-filter-3-onboard" width="1023.9" height="912.9" x="-547.2" y="-266.1" colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse">
          <feGaussianBlur stdDeviation="114.8" />
        </filter>
        <filter id="ag-filter-4-onboard" width="838.3" height="852.2" x="24.5" y="217.6" colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse">
          <feGaussianBlur stdDeviation="109.1" />
        </filter>
        <filter id="ag-filter-5-onboard" width="899.5" height="881.9" x="-153.6" y="-542.9" colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse">
          <feGaussianBlur stdDeviation="98.8" />
        </filter>
        <filter id="ag-filter-6-onboard" width="627.4" height="601.4" x="262.1" y="13.1" colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse">
          <feGaussianBlur stdDeviation="79" />
        </filter>
      </defs>
    </svg>
  )
}

function CopilotIcon({ className = "size-3.5" }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
    </svg>
  )
}

export function OnboardAgentButton({ principal }: { principal: string | null }) {
  const t = useTranslations("myCanisters")
  const [copied, setCopied] = useState(false)
  const isDismissed = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  if (isDismissed) return null

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      localStorage.setItem("icpay_agent_onboard_dismissed", "1")
      window.dispatchEvent(new Event("storage"))
    } catch {}
  }

  const handleCopyPrompt = async () => {
    const targetPrincipal = principal || "<YOUR_INTERNET_IDENTITY_PRINCIPAL>"
    const prompt = `I want to connect my Internet Computer canister to ICPay (https://icpay.app).

My Internet Identity (controller) principal is:
${targetPrincipal}

Please help me configure my canister so I can manage it from ICPay:

1. In dfx.json:
Add my principal to the "controllers" array of the canister definition:
{
  "canisters": {
    "<canister_name>": {
      "controllers": [
        "${targetPrincipal}"
      ]
    }
  }
}

2. For an existing canister already on mainnet:
Run this terminal command:
export DFX_WARNING=-mainnet_plaintext_identity
dfx canister --network ic update-settings <CANISTER_NAME_OR_ID> --add-controller ${targetPrincipal}

3. When creating a new canister on mainnet:
dfx canister --network ic create <CANISTER_NAME> --controller ${targetPrincipal}

Once added as a controller, the canister will automatically appear and be manageable in ICPay at https://icpay.app/canister with live cycles monitoring, resource management, snapshots, logs, and asset explorer.`

    try {
      await navigator.clipboard.writeText(prompt)
      setCopied(true)
      toast.success(t("onboardAgentCopied"))
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error("Failed to copy prompt")
    }
  }

  return (
    <div className="inline-flex items-center gap-1">
      <Tooltip>
        <TooltipTrigger
          render={
            <button
              type="button"
              onClick={handleCopyPrompt}
              className="inline-flex h-8 items-center gap-2 rounded-full border border-border/70 bg-card hover:bg-accent/60 px-3 py-1 text-xs font-medium text-foreground transition-all cursor-pointer shadow-xs"
            />
          }
        >
          <span>{copied ? t("onboardAgentCopied") : t("onboardAgentTitle")}</span>
          <div className="flex items-center gap-1.5 shrink-0">
            <ClaudeCodeIcon className="size-3.5 shrink-0" />
            <CursorIcon className="size-3.5 shrink-0" />
            <OpenCodeIcon className="size-3.5 shrink-0" />
            <WindsurfIcon className="size-3.5 shrink-0 text-foreground" />
            <AntigravityIcon className="size-3.5 shrink-0" />
            <CopilotIcon className="size-3.5 shrink-0 text-foreground" />
          </div>
        </TooltipTrigger>
        <TooltipContent side="top">
          {t("onboardAgentTooltip")}
        </TooltipContent>
      </Tooltip>

      <Button
        type="button"
        variant="ghost"
        size="icon-xs"
        onClick={handleDismiss}
        className="size-7 rounded-full text-muted-foreground hover:text-foreground cursor-pointer"
        aria-label="Dismiss"
      >
        <HugeiconsIcon icon={Cancel01Icon} className="size-3" />
      </Button>
    </div>
  )
}
