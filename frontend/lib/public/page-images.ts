const page = (segment: string) => `/images/pages/${segment}` as const

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://icpay.app"

export function pageImageUrl(path: string): string {
  return path.startsWith("http") ? path : `${siteUrl}${path}`
}

export const PAGE_IMAGES = {
  landing: {
    heroPhone: page("landing/hero-phone.webp"),
    heroDesktop: page("landing/desktop.webp"),
    laptopMockup: page("landing/laptop-mockup.webp"),
    paymentFlow: page("landing/payment-flow.webp"),
  },
  icbucket: {
    hero: page("icbucket/hero.gif"),
    heroPng: page("icbucket/hero.png"),
    og: "/images/logo/icbucket/icbucket.png",
    logo: "/images/logo/icbucket/icbucket.png",
    videoPoster: page("icbucket/video-poster.webp"),
  },
  icfalcon: {
    hero: "/images/logo/icfalcon/icfalcon.png",
    og: "/images/logo/icfalcon/icfalcon.png",
    logo: "/images/logo/icfalcon/icfalcon.png",
  },
  iccron: {
    hero: page("iccron/hero-automation.jpg"),
    og: "/images/logo/iccron/iccron.png",
    logo: "/images/logo/iccron/iccron.png",
    cloudNetwork: page("iccron/cloud-network.jpg"),
    defiFinance: page("iccron/defi-finance.jpg"),
    workflow: page("iccron/workflow-automation.jpg"),
    security: page("iccron/security-shield.jpg"),
    developerCode: page("iccron/developer-code.jpg"),
    precisionTimer: page("iccron/precision-timer.jpg"),
    globalNodes: page("iccron/global-nodes.jpg"),
    executionMetrics: page("iccron/execution-metrics.jpg"),
    autonomousDispatch: page("iccron/autonomous-dispatch.jpg"),
    instantWebhooks: page("iccron/instant-webhooks.jpg"),
    decentralizedCloud: page("iccron/decentralized-cloud.jpg"),
  },
  icacademy: {
    hero: page("icacademy/hero.png"),
  },
  login: {
    bg: page("login/bg.webp"),
  },
  presale: {
    cardBg: page("presale/bg.svg"),
  },
  downloads: {
    windows: page("downloads/microsoft-windows-icon.svg"),
    linux: page("downloads/linux-tux.svg"),
    fedora: page("downloads/fedora.svg"),
    macos: page("downloads/apple.svg"),
  },
} as const
