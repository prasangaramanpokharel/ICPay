import Link from "next/link"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { HugeiconsIcon } from "@hugeicons/react"
import { Package01Icon } from "@hugeicons/core-free-icons"
import { PublicFooter } from "@/components/public/footer"
import { ICPAY_TOKEN_ICON } from "@/lib/ui/brand-images"
import { Npm, Python, Go } from "@dev.icons/react"

export type ProductPackageLink = {
  label: string
  href: string
}

export const ICBUCKET_PACKAGE_LINKS: ProductPackageLink[] = [
  { label: "npm", href: "https://www.npmjs.com/package/icpay-bucket" },
  { label: "PyPI", href: "https://pypi.org/project/icpay-bucket/" },
  { label: "Go", href: "https://gitlab.com/prasangapokharel/icpay-bucket-go" },
]

type ProductOpenSourceBannerProps = {
  packageLinks?: ProductPackageLink[]
  openSourceDescription?: string
}

export function ProductOpenSourceBanner({
  packageLinks,
  openSourceDescription = "All ICPay products are open source and available on GitLab",
}: ProductOpenSourceBannerProps) {
  return (
    <section className="border-t bg-muted/30 py-12">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-6xl">
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="flex flex-col items-center gap-4 py-6 text-center md:flex-row md:justify-between md:text-left">
              <div className="flex items-center gap-3">
                <div className="relative size-12 overflow-hidden rounded-full bg-primary/10">
                  <Image
                    src={ICPAY_TOKEN_ICON}
                    alt="ICPay"
                    width={48}
                    height={48}
                    className="object-contain"
                  />
                </div>
                <div>
                  <h4 className="font-semibold">Open Source</h4>
                  <p className="text-sm text-muted-foreground">{openSourceDescription}</p>
                </div>
              </div>
              {packageLinks ? (
                <div className="flex flex-wrap items-center justify-center gap-2 md:justify-end">
                  {packageLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                    >
                      {link.label.toLowerCase().includes("npm") ? (
                        <Npm size={16} />
                      ) : link.label.toLowerCase().includes("pypi") || link.label.toLowerCase().includes("python") ? (
                        <Python size={16} />
                      ) : link.label.toLowerCase().includes("go") ? (
                        <Go size={16} />
                      ) : (
                        <HugeiconsIcon icon={Package01Icon} className="size-4" />
                      )}
                      {link.label}
                    </Link>
                  ))}
                </div>
              ) : (
                <Link
                  href="https://gitlab.com/prasangapokharel/icpay"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  <svg viewBox="0 0 24 24" className="size-4 shrink-0 fill-current">
                    <path d="m23.6 9.58-1.02-3.14a.8.8 0 0 0-.3-.39.84.84 0 0 0-.49-.14.86.86 0 0 0-.5.15.82.82 0 0 0-.29.4L19.2 11.9H4.8L3 6.46a.82.82 0 0 0-.29-.4.86.86 0 0 0-.5-.15.84.84 0 0 0-.49.14.8.8 0 0 0-.3.39L.4 9.58a.9.9 0 0 0 .33 1l11.08 8.06a.37.37 0 0 0 .38 0L23.27 10.6a.9.9 0 0 0 .33-1.02Z"/>
                  </svg>
                  View on GitLab
                </Link>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}

/** @deprecated Prefer PublicLayout + ProductOpenSourceBanner */
export function ProductFooter(props: ProductOpenSourceBannerProps) {
  return (
    <>
      <ProductOpenSourceBanner {...props} />
      <PublicFooter />
    </>
  )
}
