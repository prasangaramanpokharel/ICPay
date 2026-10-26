import { WALLET_CANISTER_ID } from "@/services/icp"

export function rawCloudBase(): string {
  return `https://${WALLET_CANISTER_ID}.raw.icp0.io/cloud`
}

export function rawCloudFileUrl(bucketName: string, path: string): string {
  const filePath = path.startsWith("/") ? path : `/${path}`
  return `${rawCloudBase()}/${bucketName}${filePath}`
}

export function rawCloudExample(bucketName = "my-bucket", path = "/logo.webp"): string {
  return rawCloudFileUrl(bucketName, path)
}
