const SUCCESS_SRC = "/audio/sucess/sucess.mp3"
const LOGIN_SRC = "/audio/sucess/login.mp3"

export const SOUND_PREF_KEY = "icpay:sound"

const elements = new Map<string, HTMLAudioElement>()
const unlocked = new Set<string>()

export function soundEnabled(): boolean {
  if (typeof window === "undefined") return true
  return localStorage.getItem(SOUND_PREF_KEY) !== "off"
}

export function setSoundEnabled(on: boolean) {
  localStorage.setItem(SOUND_PREF_KEY, on ? "on" : "off")
  listeners.forEach((l) => l())
}

const listeners = new Set<() => void>()

export function subscribeSound(listener: () => void): () => void {
  listeners.add(listener)
  window.addEventListener("storage", listener)
  return () => {
    listeners.delete(listener)
    window.removeEventListener("storage", listener)
  }
}

function audio(src: string): HTMLAudioElement {
  let element = elements.get(src)
  if (!element) {
    element = new Audio(src)
    element.volume = 0.5
    element.preload = "auto"
    elements.set(src, element)
  }
  return element
}

function prime(src: string) {
  if (unlocked.has(src) || !soundEnabled()) return
  const a = audio(src)
  a.muted = true
  a.play()
    .then(() => {
      a.pause()
      a.currentTime = 0
      unlocked.add(src)
    })
    .catch(() => {
    })
}

function play(src: string) {
  if (!soundEnabled()) return
  const a = audio(src)
  a.pause()
  a.muted = false
  a.currentTime = 0
  void a.play().catch(() => {})
}

export function primeSuccessChime() {
  prime(SUCCESS_SRC)
}

export function playSuccessChime() {
  play(SUCCESS_SRC)
}

export function primeLoginChime() {
  prime(LOGIN_SRC)
}

export function playLoginChime() {
  play(LOGIN_SRC)
}
