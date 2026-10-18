# ICBucket - S3 Compatible On-Chain Storage (AWS S3 & Cloudinary Alternative)

Official TypeScript & JavaScript SDK (`icpay-bucket`) for [ICBucket](https://icpay.app/icbucket) on the Internet Computer. High-performance, S3-compatible cloud storage with zero egress fees and direct CDN delivery.

- 🌐 **Homepage:** [https://icpay.app/icbucket](https://icpay.app/icbucket)
- 📖 **Documentation:** [https://icpay.app/bucket/docs](https://icpay.app/bucket/docs)
- 📦 **NPM Package:** [https://www.npmjs.com/package/icpay-bucket](https://www.npmjs.com/package/icpay-bucket)

```bash
npm install icpay-bucket
```

## Setup

```ts
import { BucketClient } from "icpay-bucket"

const client = new BucketClient({
  apiKey: process.env.BUCKET_API_KEY,
})
```

Use an Internet Identity `identity` instead of `apiKey` for owner calls (`createBucket`, `listBuckets`, API key management).

## Upload

```ts
const data = new TextEncoder().encode("file content")

const result = await client.uploadFile({
  bucketId: "icp",
  path: "/file.txt",
  data: new TextEncoder().encode("file content"),
  contentType: "text/plain",
})

if ("ok" in result) {
  console.log("Uploaded:", result.ok.path)
  console.log(client.publicUrl("icp", result.ok.path))
} else {
  console.error(result.err.code, result.err.message)
}
```

## Download

```ts
const result = await client.downloadFile("my-app", "/docs/file.txt")
if ("ok" in result) {
  console.log(new TextDecoder().decode(result.ok))
}
```

## List & Search

```ts
await client.listFiles("my-app", 0, 50)
await client.listFolder("my-app", "/docs", 0, 50)
await client.searchFiles("my-app", "file.txt", 0, 20)
await client.fileExists("my-app", "/docs/file.txt")
```

## Move, Copy, Delete

```ts
await client.copyFile("my-app", "/a.txt", "/b.txt")
await client.moveFile("my-app", "/b.txt", "/archive/b.txt")
await client.deleteFile("my-app", "/archive/b.txt")

await client.bulkCopyFiles("my-app", [{ source: "/a.txt", destination: "/copy.txt" }])
await client.bulkDeleteFiles("my-app", ["/copy.txt"])
```

## Responses

Every method returns `ApiResult<T>`:

```ts
type ApiResult<T> = { ok: T } | { err: string }
```

Check `"ok" in result` before using the value.

## Limits

- Single upload max: **1.85 MB** (`SINGLE_MAX_BYTES`) — use chunked upload for larger files
- Path: absolute (`/folder/file.ext`), lowercase bucket names: `a-z`, `0-9`, `-`

## Run Tests

```bash
cd ../test
BUCKET_API_KEY=… BUCKET_ID=my-app node typescript.mjs
```
