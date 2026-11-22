"use client"

import { useCallback, useMemo, useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { APP_LOGO, APP_LOGO_ALT } from "@/lib/ui/brand-images"
import { getDerivationOrigin, getIdentityProvider } from "@/services/icp"
import {
  NATIVE_AUTH_POPUP_H,
  NATIVE_AUTH_POPUP_W,
  NATIVE_AUTH_TTL,
  chainFromIiSuccess,
  parseHexKey,
  redirectToNativeCallback,
  getNativeAuthTargets,
  type IiSuccess,
} from "@/lib/auth/nativeDelegation"

export function NativeAuthView() {
  const [status, setStatus] = useState<"ready" | "authenticating" | "redirecting" | "error">(
    "ready"
  )
  const [error, setError] = useState<string | null>(null)
  const [returnUrl, setReturnUrl] = useState<string | null>(null)

  const params = useMemo(() => {
    if (typeof window === "undefined") return { appKey: null, redirect: null, provider: null }
    const hash = window.location.hash.startsWith("#")
      ? window.location.hash.slice(1)
      : window.location.hash
    const sp = new URLSearchParams(hash)
    return {
      appKey: sp.get("appKey"),
      redirect: sp.get("redirect") || "icpay://ii-callback",
      provider: sp.get("provider"),
      openIdProvider: sp.get("openIdProvider"),
    }
  }, [])

  const startAuth = useCallback(() => {
    setError(null)
    if (!params.appKey) {
      setStatus("error")
      setError("Missing mobile app session key. Please return to the ICPay app and try again.")
      return
    }

    let sessionKeyBytes: Uint8Array
    try {
      sessionKeyBytes = parseHexKey(params.appKey)
    } catch {
      setStatus("error")
      setError("Invalid session key format from mobile app.")
      return
    }

    setStatus("authenticating")

    const identityProvider = params.provider ?? getIdentityProvider()
    const authorizeUrl = identityProvider.includes("#")
      ? identityProvider
      : `${identityProvider}/#authorize`
    const derivationOrigin = getDerivationOrigin()

    const left = Math.round(window.screenX + (window.outerWidth - NATIVE_AUTH_POPUP_W) / 2)
    const top = Math.round(window.screenY + (window.outerHeight - NATIVE_AUTH_POPUP_H) / 2)
    const popup = window.open(
      authorizeUrl,
      "icpay-native-auth",
      `popup=yes,width=${NATIVE_AUTH_POPUP_W},height=${NATIVE_AUTH_POPUP_H},left=${left},top=${top}`
    )

    if (!popup) {
      setStatus("ready")
      setError(
        "Popup was blocked by your browser. Please tap 'Connect with Internet Identity' below to continue."
      )
      return
    }

    let settled = false

    const cleanup = () => {
      window.removeEventListener("message", onMessage)
      clearInterval(checkClosed)
    }

    const onMessage = (event: MessageEvent) => {
      try {
        const data = event.data as IiSuccess | null
        if (!data || typeof data !== "object") return

        if (data.kind === "authorize-ready") {
          popup.postMessage(
            {
              kind: "authorize-client",
              sessionPublicKey: sessionKeyBytes,
              maxTimeToLive: NATIVE_AUTH_TTL,
              targets: getNativeAuthTargets(),
              ...(derivationOrigin ? { derivationOrigin } : {}),
            },
            event.origin
          )
          return
        }

        if (data.kind === "authorize-client-failure") {
          if (settled) return
          settled = true
          cleanup()
          popup.close()
          setStatus("ready")
          setError("Internet Identity authorization was cancelled. Please try again.")
          return
        }

        if (data.kind === "authorize-client-success" && data.delegations) {
          if (settled) return
          settled = true
          cleanup()
          popup.close()

          setStatus("redirecting")
          const chain = chainFromIiSuccess(data)
          const chainJson = JSON.stringify(chain.toJSON())
          const callbackUrl = `${params.redirect}#delegation=${encodeURIComponent(chainJson)}`
          setReturnUrl(callbackUrl)
          redirectToNativeCallback(callbackUrl)
        }
      } catch (err) {
        if (settled) return
        settled = true
        cleanup()
        setStatus("error")
        setError(
          err instanceof Error ? err.message : "Failed to process Internet Identity session."
        )
      }
    }

    window.addEventListener("message", onMessage)

    const checkClosed = setInterval(() => {
      if (popup.closed) {
        if (!settled) {
          settled = true
          cleanup()
          setStatus("ready")
        }
      }
    }, 500)
  }, [params])

  return (
    <div className="mx-auto flex w-full max-w-sm flex-col items-center justify-center px-4 py-12 text-center">
      <div className="relative mb-6 flex size-16 items-center justify-center rounded-2xl bg-primary/10 ring-1 ring-primary/20">
        <Image
          src={APP_LOGO}
          alt={APP_LOGO_ALT}
          width={40}
          height={40}
          priority
          loading="eager"
          className="size-10 object-contain"
        />
      </div>

      <h1 className="text-xl font-semibold tracking-tight text-foreground">
        {status === "redirecting" ? "Connecting to ICPay..." : "Internet Identity"}
      </h1>

      <p className="mt-2 text-sm text-muted-foreground">
        {status === "redirecting"
          ? "Returning to the mobile app with your secure session."
          : status === "authenticating"
            ? "Complete sign-in in the Internet Identity window..."
            : "Sign in with your passkey or Internet Identity to access your mobile wallet."}
      </p>

      {error ? (
        <Alert variant="destructive" className="mt-6 text-left">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <div className="mt-8 flex w-full flex-col gap-3">
        {status === "authenticating" ? (
          <div className="flex items-center justify-center gap-2 py-4">
            <Spinner className="size-5 text-primary" />
            <span className="text-sm font-medium text-muted-foreground">Authenticating...</span>
          </div>
        ) : null}

        {status === "redirecting" ? (
          <div className="flex flex-col items-center gap-3">
            <Spinner className="size-5 text-primary" />
            {returnUrl ? (
              <a
                href={returnUrl}
                className="mt-2 inline-flex h-10 w-full items-center justify-center rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
              >
                Open ICPay App
              </a>
            ) : null}
          </div>
        ) : null}

        {status === "ready" || status === "error" ? (
          <Button size="lg" className="w-full" onClick={startAuth}>
            Connect with Internet Identity
          </Button>
        ) : null}
      </div>
    </div>
  )
}
