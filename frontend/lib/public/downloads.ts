const RELEASE_BASE =
  "https://gitlab.com/prasangapokharel/icpay/-/releases/permalink/latest/downloads"

export const DESKTOP_DOWNLOADS = {
  windows: `${RELEASE_BASE}/icpay-wallet-setup.exe`,
  linuxRpm: `${RELEASE_BASE}/icpay-wallet-linux.rpm`,
  linuxDeb: `${RELEASE_BASE}/icpay-wallet-linux.deb`,
} as const
