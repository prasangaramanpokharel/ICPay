"use client"

import { useTranslations } from "next-intl"
import { LANDING_MEDIA } from "@/lib/public/landing-media"
import { HeroVideoDialog } from "@/components/ui/hero-video-dialog"
import { ShineBorder } from "@/components/ui/shine-border"
import { CodeBlock } from "@/components/ui/code-block"

export function IntegrateSection() {
  const t = useTranslations("publicSite.icbucket.integrate")

  return (
    <section className="border-b border-border/60 bg-background">
      <div className="mx-auto max-w-7xl px-4 py-16 md:px-6 md:py-20">
        <div className="mb-10 max-w-2xl space-y-2 md:mb-12">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
            {t("eyebrow")}
          </p>
          <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            {t("title")}
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground md:text-base">
            {t("subtitle")}
          </p>
        </div>

        {/* Video demonstration */}
        <div className="relative mx-auto max-w-5xl rounded-2xl mb-14">
          <ShineBorder
            className="rounded-2xl z-20"
            borderWidth={1.5}
            duration={12}
            shineColor={["#A07CFE", "#FE8FB5", "#FFBE7B"]}
          />
          <HeroVideoDialog
            animationStyle="from-center"
            videoSrc={LANDING_MEDIA.icbucketIntegrateVideo}
            thumbnailSrc={LANDING_MEDIA.icbucketIntegratePoster}
            thumbnailAlt={t("videoAriaLabel")}
            className="w-full drop-shadow-xl"
          />
        </div>

        {/* Interactive Developer Code Blocks */}
        <div className="mx-auto max-w-5xl space-y-8">
          {/* Multi-tab Package Manager Installation */}
          <div className="space-y-3">
            <div>
              <h3 className="text-lg font-semibold tracking-tight text-foreground sm:text-xl">
                Package Manager Installation
              </h3>
              <p className="text-xs text-muted-foreground sm:text-sm">
                Install the official icBucket client for your favorite package manager or language.
              </p>
            </div>
            <CodeBlock
              tabs={[
                {
                  label: "npm",
                  code: "npm install icpay-bucket",
                  language: "bash",
                },
                {
                  label: "pnpm",
                  code: "pnpm add icpay-bucket",
                  language: "bash",
                },
                {
                  label: "yarn",
                  code: "yarn add icpay-bucket",
                  language: "bash",
                },
                {
                  label: "bun",
                  code: "bun add icpay-bucket",
                  language: "bash",
                },
                {
                  label: "cargo",
                  code: "cargo add icpay-bucket",
                  language: "bash",
                },
                {
                  label: "pip",
                  code: "pip install icpay-bucket",
                  language: "bash",
                },
              ]}
            />
          </div>

          {/* Quickstart Single Code Block */}
          <div className="space-y-3">
            <div>
              <h3 className="text-lg font-semibold tracking-tight text-foreground sm:text-xl">
                Quickstart Integration
              </h3>
              <p className="text-xs text-muted-foreground sm:text-sm">
                Upload files directly to decentralized on-chain canisters with automatic edge CDN routing.
              </p>
            </div>
            <CodeBlock
              code={`import { ICBucket } from "icpay-bucket"

// Initialize on-chain storage client
const bucket = new ICBucket({
  bucketId: "my-app-assets",
  apiKey: process.env.ICBUCKET_API_KEY,
})

// Upload asset directly to the IC canister
const { publicUrl } = await bucket.uploadFile("banner.webp", fileBuffer, {
  contentType: "image/webp",
  visibility: "public",
})

console.log("Edge CDN URL:", publicUrl)
// Output: https://cdn.icpay.app/cloud/my-app-assets/banner.webp`}
              language="tsx"
            />
          </div>

          {/* API & Environment Configuration */}
          <div className="space-y-3">
            <div>
              <h3 className="text-lg font-semibold tracking-tight text-foreground sm:text-xl">
                API & Environment Configuration
              </h3>
              <p className="text-xs text-muted-foreground sm:text-sm">
                Configure your environment variables and client options for production deployment.
              </p>
            </div>
            <CodeBlock
              tabs={[
                {
                  label: ".env.local",
                  code: `NEXT_PUBLIC_ICBUCKET_API_URL=https://cdn.icpay.app
ICBUCKET_API_KEY=icp_live_sec_994a8e2b
NEXT_PUBLIC_DEFAULT_BUCKET=my-app-assets`,
                  language: "bash",
                },
                {
                  label: "icbucket.config.ts",
                  code: `export const icBucketConfig = {
  cdnBase: "https://cdn.icpay.app",
  defaultBucket: "my-app-assets",
  maxUploadSizeBytes: 50 * 1024 * 1024, // 50MB
  cacheControl: "public, max-age=31536000, immutable",
}`,
                  language: "typescript",
                },
              ]}
            />
          </div>
        </div>
      </div>
    </section>
  )
}
