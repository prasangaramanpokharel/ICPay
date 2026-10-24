export interface AcademyAdminSession {
  email: string
  name: string
  role: "super_admin" | "admin"
  authenticatedAt: number
  expiresAt: number
}

const SESSION_STORAGE_KEY = "icpay_academy_admin_session"
const DEFAULT_SALT = "icpay-academy-sec-salt-2026"
const SESSION_DURATION_MS = 8 * 60 * 60 * 1000

function getAuthSalt(): string {
  return process.env.NEXT_PUBLIC_ACADEMY_AUTH_SALT || DEFAULT_SALT
}

function hexString(buffer: ArrayBuffer): string {
  const byteArray = new Uint8Array(buffer)
  return Array.from(byteArray)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
}

export async function hashAdminPassword(password: string): Promise<string> {
  const salt = getAuthSalt()
  const enc = new TextEncoder()
  const data = enc.encode(`${salt}:${password}`)
  const hashBuffer = await crypto.subtle.digest("SHA-256", data)
  return hexString(hashBuffer)
}

function parseAdminEntry(envVal?: string): { email: string; hash: string } | null {
  if (!envVal || !envVal.includes(":")) return null
  const [email, hash] = envVal.split(":")
  return { email: email.trim().toLowerCase(), hash: hash.trim() }
}

export async function verifyAdminCredentials(
  emailInput: string,
  passwordInput: string
): Promise<AcademyAdminSession | null> {
  const trimmedEmail = emailInput.trim().toLowerCase()
  const trimmedPassword = passwordInput.trim()

  if (!trimmedEmail || !trimmedPassword) return null

  const admin1 = parseAdminEntry(process.env.NEXT_PUBLIC_ACADEMY_ADMIN_1)
  const admin2 = parseAdminEntry(process.env.NEXT_PUBLIC_ACADEMY_ADMIN_2)

  const allowedAdmins = [admin1, admin2].filter(
    (a): a is { email: string; hash: string } => a !== null
  )

  const matched = allowedAdmins.find((a) => a.email === trimmedEmail)
  if (!matched) return null

  const computedHash = await hashAdminPassword(trimmedPassword)
  if (computedHash !== matched.hash) return null

  const now = Date.now()
  const sessionName = trimmedEmail.split("@")[0].replace(/\./g, " ")
  const formattedName = sessionName
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ")

  const session: AcademyAdminSession = {
    email: trimmedEmail,
    name: formattedName,
    role: trimmedEmail.startsWith("prasanga") ? "super_admin" : "admin",
    authenticatedAt: now,
    expiresAt: now + SESSION_DURATION_MS,
  }

  setAdminSession(session)
  return session
}

export function getAdminSession(): AcademyAdminSession | null {
  if (typeof window === "undefined") return null
  try {
    const raw = sessionStorage.getItem(SESSION_STORAGE_KEY)
    if (!raw) return null
    const session: AcademyAdminSession = JSON.parse(raw)
    if (Date.now() > session.expiresAt) {
      clearAdminSession()
      return null
    }
    return session
  } catch {
    return null
  }
}

export function setAdminSession(session: AcademyAdminSession): void {
  if (typeof window === "undefined") return
  try {
    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session))
  } catch {}
}

export function clearAdminSession(): void {
  if (typeof window === "undefined") return
  try {
    sessionStorage.removeItem(SESSION_STORAGE_KEY)
  } catch {}
}

export function isAdminAuthenticated(): boolean {
  return getAdminSession() !== null
}
