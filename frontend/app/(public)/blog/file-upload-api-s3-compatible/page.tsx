import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { BlogAuthorMeta } from "@/components/blog/blog-author-meta"
import { blogArticleJsonLd, blogCanonical } from "@/lib/blog/seo"

const SLUG = "file-upload-api-s3-compatible"
const TITLE = "File Upload API 2026: S3-Compatible SDK & Direct Cloudinary Alternative | ICBucket"
const DESCRIPTION =
  "Looking for a fast, reliable file upload API? Meet icpay-bucket: the S3-compatible TypeScript and Python SDK for on-chain cloud storage on the Internet Computer. Zero egress fees, chunked uploads, and instant public CDN delivery."
const PUBLISHED_AT = "2026-10-12"
const READING_MINUTES = 12

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    "file upload api",
    "s3 upload api",
    "s3 compatible api",
    "upload api",
    "image upload api",
    "icpay-bucket",
    "npm icpay-bucket",
    "pypi icpay-bucket",
    "s3 compatible sdk",
    "resumable upload api",
    "multipart upload api",
    "cloudinary alternative api",
    "decentralized file upload api",
    "icbucket",
  ],
  alternates: { canonical: blogCanonical(SLUG) },
  openGraph: {
    title: `${TITLE} — ICPay Blog`,
    description: DESCRIPTION,
    url: blogCanonical(SLUG),
    siteName: "ICPay",
    type: "article",
    publishedTime: `${PUBLISHED_AT}T00:00:00Z`,
    images: [
      {
        url: "https://res.cloudinary.com/dn2ycbmrc/image/upload/v1791780069/onchain_dfcbj6.png",
        width: 1200,
        height: 630,
        alt: "File Upload API 2026: S3-Compatible SDK and Direct Cloudinary Alternative Architecture",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["https://res.cloudinary.com/dn2ycbmrc/image/upload/v1791780069/onchain_dfcbj6.png"],
  },
}

const jsonLd = blogArticleJsonLd({
  slug: SLUG,
  title: TITLE,
  description: DESCRIPTION,
  publishedAt: PUBLISHED_AT,
  readingMinutes: READING_MINUTES,
})

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is icpay-bucket?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "icpay-bucket is the official developer SDK for ICBucket, available on npm (TypeScript/Node.js) and PyPI (Python). It provides an S3-compatible file upload API to store files directly on-chain on the Internet Computer with scoped API keys, automatic chunking, and public CDN links.",
      },
    },
    {
      "@type": "Question",
      name: "How does the ICBucket file upload API handle large files?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The SDK automatically divides files larger than 1.85 MB into indexed chunks, dispatching them through concurrent worker pools directly to boundary nodes. Chunks are reassembled in 64-bit Wasm stable memory inside the target storage canister.",
      },
    },
    {
      "@type": "Question",
      name: "Can I use icpay-bucket as an alternative to Cloudinary or AWS S3 upload APIs?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. icpay-bucket provides identical functionality: you pass an API key and a file buffer or stream. You receive a persistent CDN URL (https://cloud.icpay.app/...) with zero outbound bandwidth egress taxes and predictable 30-day ICP plans.",
      },
    },
    {
      "@type": "Question",
      name: "Where are packages published?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "icpay-bucket is published on npm for Node.js/TypeScript (npm install icpay-bucket) and on PyPI for Python (pip install icpay-bucket), with official source repositories and documentation on icpay.app.",
      },
    },
  ],
}

export default function FileUploadApiS3CompatiblePage() {
  return (
    <article className="space-y-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      {/* Header */}
      <header className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider text-primary">
            Developer Tutorials & SDKs
          </span>
          <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
            SDK v1.2+
          </span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl text-foreground">
          File Upload API 2026: S3-Compatible SDK & Direct Cloudinary Alternative | ICBucket
        </h1>
        <p className="text-base text-muted-foreground leading-relaxed sm:text-lg">
          Building a media upload pipeline in 2026 should not require complex AWS IAM roles, expensive Cloudinary credit
          packs, or fragile IPFS pinning gateways. Meet <strong className="text-foreground">icpay-bucket</strong>:
          the open-source, S3-compatible <strong className="text-foreground">file upload API</strong> for the Internet
          Computer that gives you high-speed uploads and instant CDN delivery with zero egress fees.
        </p>
        <BlogAuthorMeta publishedAt={PUBLISHED_AT} readingMinutes={READING_MINUTES} />
      </header>

      {/* Hero Visual Card */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="relative w-full overflow-hidden bg-muted/40">
          <Image
            src="https://res.cloudinary.com/dn2ycbmrc/image/upload/v1791780069/onchain_dfcbj6.png"
            alt="File Upload API 2026: S3-Compatible SDK and Direct Cloudinary Alternative Architecture"
            width={1200}
            height={630}
            className="w-full h-auto object-cover max-h-[500px]"
            unoptimized
            priority
          />
        </div>
        <div className="p-4 bg-muted/20 border-t border-border/60 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
          <span>Official SDKs: npm install icpay-bucket | pip install icpay-bucket</span>
          <div className="flex items-center gap-3">
            <Link
              href="https://www.npmjs.com/package/icpay-bucket"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-primary hover:underline"
            >
              NPM Package &rarr;
            </Link>
            <Link
              href="https://libraries.io/pypi/icpay-bucket"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-primary hover:underline"
            >
              PyPI Package &rarr;
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Install Bar */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-primary">
          Quick Installation
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg bg-muted p-3 font-mono text-xs text-foreground flex items-center justify-between">
            <span>npm install icpay-bucket</span>
            <span className="text-muted-foreground text-[10px]">TypeScript / Node</span>
          </div>
          <div className="rounded-lg bg-muted p-3 font-mono text-xs text-foreground flex items-center justify-between">
            <span>pip install icpay-bucket</span>
            <span className="text-muted-foreground text-[10px]">Python 3.9+</span>
          </div>
        </div>
      </div>

      {/* Section 1: The Problem with Traditional Upload APIs */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          1. Why Modern Developers Need an S3 Upload API Alternative
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          When developers need to add user avatars, PDF invoice generation, or video uploads to their web apps, they
          typically choose between two frustrating extremes:
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border bg-card p-4 space-y-2">
            <h3 className="text-sm font-semibold text-foreground">Extreme A: AWS S3 + Pre-Signed URLs</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Requires configuring IAM users, bucket policies, CORS headers, STS token generation, and backend servers
              to sign PUT requests. Once running, you face $0.09/GB egress bills whenever users download files.
            </p>
          </div>
          <div className="rounded-xl border bg-card p-4 space-y-2">
            <h3 className="text-sm font-semibold text-foreground">Extreme B: Cloudinary / Uploadcare</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Easy to set up initially, but triggers aggressive pricing cliffs ($89 to $499/month) once your application
              exceeds modest free-tier credit allowances.
            </p>
          </div>
        </div>

        <p className="text-sm leading-relaxed text-muted-foreground">
          <strong className="text-foreground">icpay-bucket</strong> bridges the gap: a clean, unified file upload API
          with the simplicity of Cloudinary, the S3 standard compatibility, and the cost efficiency of the Internet Computer.
        </p>
      </section>

      {/* Section 2: TypeScript / Node.js Code Tutorial */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          2. Complete TypeScript & Next.js Upload Tutorial
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Here is how to set up an end-to-end file upload API route in Next.js or Node.js using{" "}
          <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">icpay-bucket</code>:
        </p>

        <div className="rounded-xl border border-border bg-muted/60 p-5 font-mono text-xs overflow-x-auto text-foreground">
          <pre>{`// app/api/upload/route.ts
import { BucketClient } from "icpay-bucket"

const client = new BucketClient({
  apiKey: process.env.ICBUCKET_API_KEY, // Scoped API Key from icpay.app
})

export async function POST(req: Request) {
  const formData = await req.formData()
  const file = formData.get("file") as File

  if (!file) {
    return Response.json({ error: "No file provided" }, { status: 400 })
  }

  const bytes = new Uint8Array(await file.arrayBuffer())

  // Upload to on-chain ICBucket
  const result = await client.uploadFile({
    bucketId: "production-uploads",
    path: \`/documents/\${Date.now()}-\${file.name}\`,
    data: bytes,
    contentType: file.type || "application/octet-stream",
  })

  if ("err" in result) {
    return Response.json({ error: result.err }, { status: 500 })
  }

  // Instant public CDN delivery URL:
  const publicUrl = client.publicUrl("production-uploads", result.ok.path)

  return Response.json({
    success: true,
    path: result.ok.path,
    url: publicUrl, // https://cloud.icpay.app/production-uploads/documents/...
  })
}`}</pre>
        </div>
      </section>

      {/* Section 3: Python SDK Example */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          3. Python File Upload API (FastAPI & Django)
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          For Python backend engineers, the package is published on PyPI as{" "}
          <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">icpay-bucket</code>:
        </p>

        <div className="rounded-xl border border-border bg-muted/60 p-5 font-mono text-xs overflow-x-auto text-foreground">
          <pre>{`import os
from icpay_bucket import BucketClient

client = BucketClient(api_key=os.environ["ICBUCKET_API_KEY"])

# Uploading a document
with open("contract.pdf", "rb") as f:
    data = f.read()

result = client.upload_file(
    bucket_id="legal-docs",
    path="/contracts/2026/nda.pdf",
    data=data,
    content_type="application/pdf",
)

if "ok" in result:
    print("Uploaded successfully:", result["ok"])
    print("Public CDN URL:", client.public_url("legal-docs", "/contracts/2026/nda.pdf"))
else:
    print("Upload failed:", result["err"])`}</pre>
        </div>
      </section>

      {/* Section 4: Key Features of icpay-bucket */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          4. Enterprise Features Built into the SDK
        </h2>
        <div className="space-y-3">
          <div className="rounded-lg border bg-card p-4 space-y-1">
            <h3 className="text-sm font-semibold text-foreground">Automatic Indexed Chunking</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Files larger than 1.85 MB are automatically sliced and uploaded using concurrent worker pools, guaranteeing
              resilient transmission even over unstable mobile network connections.
            </p>
          </div>
          <div className="rounded-lg border bg-card p-4 space-y-1">
            <h3 className="text-sm font-semibold text-foreground">Scoped Security & Permissions</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Generate API keys with granular Read, Write, and Delete permissions. You can issue write-only keys to client
              upload forms without exposing delete capabilities.
            </p>
          </div>
          <div className="rounded-lg border bg-card p-4 space-y-1">
            <h3 className="text-sm font-semibold text-foreground">Zero Egress Bandwidth Fees</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Unlike AWS S3 or Cloudinary, public downloads and edge CDN views carry zero bandwidth charges. You pay a
              flat, predictable rate of ~$5 per gigabyte per year.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Box */}
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-6 space-y-3">
        <h3 className="text-base font-semibold text-primary">Start Building with icpay-bucket Today</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Create an on-chain bucket in 60 seconds, generate your API key, and install the package from npm or PyPI.
        </p>
        <div className="flex flex-wrap gap-3 pt-2">
          <Link
            href="/icbucket"
            className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 transition-colors"
          >
            Create Your Bucket on ICPay &rarr;
          </Link>
          <Link
            href="/bucket/docs"
            className="inline-flex items-center justify-center rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors"
          >
            Read Full SDK Docs &rarr;
          </Link>
        </div>
      </div>

      {/* FAQ Accordion Section */}
      <section className="space-y-4 pt-6 border-t border-border">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          Frequently Asked Questions (FAQ)
        </h2>
        <div className="space-y-3">
          {faqJsonLd.mainEntity.map((faq, i) => (
            <div key={i} className="rounded-lg border bg-card p-4 space-y-2">
              <h3 className="text-sm font-semibold text-foreground">{faq.name}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{faq.acceptedAnswer.text}</p>
            </div>
          ))}
        </div>
      </section>
    </article>
  )
}
