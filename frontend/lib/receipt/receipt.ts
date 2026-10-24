import { formatTokenAmount, explorerTxUrl } from "@/lib/wallet/utils"
import { ICP_LOGO } from "@/lib/token/icon"
import { createAvatar } from "@dicebear/core"
import { adventurer } from "@dicebear/collection"

export type Receipt = {
  amount: bigint
  recipient: string
  blockIndex: bigint
  memo?: string
  symbol?: string
  decimals?: number
  usdPrice?: number
}

const WIDTH = 1080
const HEIGHT = 1480

const BRAND = "#c6005c"
const BRAND_BRIGHT = "#f43b80"

function escapeXml(s: string): string {
  return s.replace(/[<>&"']/g, (c) => {
    switch (c) {
      case "<": return "&lt;"
      case ">": return "&gt;"
      case "&": return "&amp;"
      case '"': return "&quot;"
      default: return "&apos;"
    }
  })
}

function shortenRecipient(recipient: string): string {
  if (recipient.startsWith("@")) {
    return recipient.length > 20 ? `${recipient.slice(0, 19)}…` : recipient
  }
  return recipient.length > 18 ? `${recipient.slice(0, 7)}…${recipient.slice(-5)}` : recipient
}

function truncate(s: string, max: number): string {
  return s.length > max ? `${s.slice(0, max - 1)}…` : s
}

function formatUsd(n: number): string {
  return `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function stamp(d: Date): string {
  const p = (n: number) => String(n).padStart(2, "0")
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`
}

let logoPromise: Promise<string> | null = null
function logoDataUri(): Promise<string> {
  logoPromise ??= fetch(ICP_LOGO)
    .then((r) => r.blob())
    .then(
      (blob) =>
        new Promise<string>((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => resolve(reader.result as string)
          reader.onerror = () => reject(new Error("Failed to load logo"))
          reader.readAsDataURL(blob)
        })
    )
  return logoPromise
}

function avatarDataUri(seed: string): string {
  const svg = createAvatar(adventurer, { seed }).toString()
  return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`
}

async function qrDataUri(blockIndex: bigint): Promise<string> {
  const mod = await import("qrcode")
  return mod.toDataURL(explorerTxUrl(blockIndex), {
    errorCorrectionLevel: "M",
    margin: 0,
    width: 512,
    color: { dark: "#000000", light: "#ffffff" },
  })
}

export async function receiptSvg(receipt: Receipt): Promise<string> {
  const { amount, recipient, blockIndex, memo, usdPrice, symbol = "ICP", decimals = 8 } = receipt
  const [logo, qr] = await Promise.all([logoDataUri(), qrDataUri(blockIndex)])
  const avatar = avatarDataUri(recipient)

  const to = escapeXml(shortenRecipient(recipient))
  const value = escapeXml(formatTokenAmount(amount, decimals, 4))
  const ticker = escapeXml(symbol)
  const block = escapeXml(blockIndex.toString())
  const note = memo?.trim() ? escapeXml(truncate(memo.trim(), 38)) : null
  const heading = recipient.startsWith("@") ? "Tip Sent" : "Sent"
  const date = escapeXml(stamp(new Date()))

  const usd = usdPrice
    ? `  <text x="66" y="880" font-family="system-ui, -apple-system, sans-serif" font-size="36" fill="#8a8a8a">Value</text>
  <text x="66" y="946" font-family="system-ui, -apple-system, sans-serif" font-size="48" font-weight="600" fill="#ffffff">${escapeXml(formatUsd((Number(amount) / 10 ** decimals) * usdPrice))}</text>
  <text x="560" y="880" font-family="system-ui, -apple-system, sans-serif" font-size="36" fill="#8a8a8a">${ticker} Price</text>
  <text x="560" y="946" font-family="system-ui, -apple-system, sans-serif" font-size="48" font-weight="600" fill="#ffffff">${escapeXml(formatUsd(usdPrice))}</text>`
    : ""

  const valueSize = value.length > 13 ? 86 : value.length > 9 ? 108 : 132

  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0.4" y2="1">
      <stop offset="0%" stop-color="#121212"/>
      <stop offset="100%" stop-color="#050505"/>
    </linearGradient>
    <clipPath id="avatarClip"><circle cx="118" cy="152" r="54"/></clipPath>
    <clipPath id="markClip"><rect x="0" y="0" width="${WIDTH}" height="1215"/></clipPath>
  </defs>

  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#bg)"/>

  <g clip-path="url(#markClip)" opacity="0.07">
    <image xlink:href="${logo}" x="600" y="60" width="700" height="700" preserveAspectRatio="xMidYMid meet"/>
    <image xlink:href="${logo}" x="330" y="470" width="420" height="420" preserveAspectRatio="xMidYMid meet"/>
  </g>

  <circle cx="118" cy="152" r="55" fill="#1c1c1c" stroke="${BRAND}" stroke-width="3"/>
  <image xlink:href="${avatar}" x="64" y="98" width="108" height="108" clip-path="url(#avatarClip)"/>
  <text x="204" y="140" font-family="system-ui, -apple-system, sans-serif" font-size="50" font-weight="700" fill="#ffffff">${to}</text>
  <text x="204" y="200" font-family="system-ui, -apple-system, sans-serif" font-size="38" font-weight="500" fill="#d4d4d4">${date}</text>

  <text x="66" y="500" font-family="system-ui, -apple-system, sans-serif" font-size="66" font-weight="700" fill="#ffffff">${heading}</text>
  <text x="66" y="566" font-family="system-ui, -apple-system, sans-serif" font-size="40" font-weight="500" fill="#8a8a8a"><tspan fill="${BRAND_BRIGHT}">${ticker}</tspan>  |  Block ${block}</text>

  <text x="66" y="730" font-family="system-ui, -apple-system, sans-serif" font-weight="700"><tspan font-size="${valueSize}" fill="${BRAND_BRIGHT}">${value}</tspan><tspan font-size="58" fill="#ffffff" dx="10">${ticker}</tspan></text>

${usd}
${note ? `  <text x="66" y="1090" font-family="system-ui, -apple-system, sans-serif" font-size="40" font-style="italic" fill="#9a9a9a">&#8220;${note}&#8221;</text>` : ""}

  <line x1="0" y1="1215" x2="${WIDTH}" y2="1215" stroke="#242424" stroke-width="2"/>

  <image xlink:href="${logo}" x="56" y="1268" width="60" height="60" preserveAspectRatio="xMidYMid meet"/>
  <text x="132" y="1316" font-family="system-ui, -apple-system, sans-serif" font-size="44" font-weight="700" fill="${BRAND_BRIGHT}" letter-spacing="1">ICPay</text>
  <text x="56" y="1388" font-family="system-ui, -apple-system, sans-serif" font-size="56" font-weight="700" fill="#ffffff" letter-spacing="1">WALLET</text>
  <text x="56" y="1444" font-family="system-ui, -apple-system, sans-serif" font-size="34" fill="#8a8a8a">Send ICP by username</text>

  <rect x="836" y="1264" width="188" height="188" rx="14" fill="#ffffff"/>
  <image xlink:href="${qr}" x="850" y="1278" width="160" height="160"/>
</svg>`
}

export async function receiptPng(receipt: Receipt): Promise<Blob> {
  const svg = await receiptSvg(receipt)
  const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }))

  try {
    const img = new Image()
    img.decoding = "sync"
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve()
      img.onerror = () => reject(new Error("Failed to render receipt"))
      img.src = url
    })

    const canvas = document.createElement("canvas")
    canvas.width = WIDTH
    canvas.height = HEIGHT
    const ctx = canvas.getContext("2d")
    if (!ctx) throw new Error("Canvas unavailable")
    ctx.drawImage(img, 0, 0, WIDTH, HEIGHT)

    return await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error("Failed to encode receipt"))),
        "image/png"
      )
    })
  } finally {
    URL.revokeObjectURL(url)
  }
}

export function receiptFilename(blockIndex: bigint): string {
  return `icpay-receipt-${blockIndex}.png`
}

function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export type ShareOutcome = "shared" | "downloaded" | "cancelled"

export async function shareReceipt(blob: Blob, blockIndex: bigint): Promise<ShareOutcome> {
  const filename = receiptFilename(blockIndex)
  const file = new File([blob], filename, { type: "image/png" })

  if (typeof navigator !== "undefined" && navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file] })
      return "shared"
    } catch (e) {
      if (e instanceof Error && e.name === "AbortError") return "cancelled"
      triggerDownload(blob, filename)
      return "downloaded"
    }
  }

  triggerDownload(blob, filename)
  return "downloaded"
}
