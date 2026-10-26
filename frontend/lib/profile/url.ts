export function profileUrlFor(username: string): string {
  const origin =
    typeof window !== "undefined"
      ? window.location.origin
      : process.env.NEXT_PUBLIC_SITE_URL ?? "https://icpay.app"
  return `${origin}/${username}`
}
