import assert from "node:assert/strict"
import {
  blobHasJpegHeader,
  blobHasPngHeader,
  blobHasWebpHeader,
  validateJpegHeader,
  validatePngHeader,
  validateWebpHeader,
} from "@/lib/bucket/imageBytes"
import { buildUploadPath } from "@/lib/bucket/uploadPath"
import {
  formatCompressionSummary,
  resolveTargetFormat,
} from "@/lib/bucket/compressImage"

// 1. WebP magic header checks (RIFF .... WEBP)
const validWebp = new Uint8Array([
  0x52, 0x49, 0x46, 0x46, 0x00, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42, 0x50,
])
const invalidWebp = new Uint8Array([0x52, 0x49, 0x46, 0x46, 0x00, 0x00])
assert.equal(validateWebpHeader(validWebp), true)
assert.equal(validateWebpHeader(invalidWebp), false)

// 2. JPEG magic header checks (0xFF, 0xD8, 0xFF)
const validJpeg = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10])
const invalidJpeg = new Uint8Array([0xff, 0xd8, 0x00])
assert.equal(validateJpegHeader(validJpeg), true)
assert.equal(validateJpegHeader(invalidJpeg), false)

// 3. PNG magic header checks (0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A)
const validPng = new Uint8Array([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00,
])
const invalidPng = new Uint8Array([0x89, 0x50, 0x4e, 0x47])
assert.equal(validatePngHeader(validPng), true)
assert.equal(validatePngHeader(invalidPng), false)

// 4. Blob header async validators
const jpegBlob = new Blob([validJpeg])
const pngBlob = new Blob([validPng])
const webpBlob = new Blob([validWebp])

assert.equal(await blobHasJpegHeader(jpegBlob), true)
assert.equal(await blobHasJpegHeader(pngBlob), false)
assert.equal(await blobHasPngHeader(pngBlob), true)
assert.equal(await blobHasPngHeader(jpegBlob), false)
assert.equal(await blobHasWebpHeader(webpBlob), true)
assert.equal(await blobHasWebpHeader(jpegBlob), false)

// 5. Dynamic upload path builder
const dummyFile = new File(["test"], "my photo.png", { type: "image/png" })
assert.equal(buildUploadPath(dummyFile, true), "/my_photo.webp")
assert.equal(buildUploadPath(dummyFile, false), "/my_photo.png")
assert.equal(buildUploadPath(dummyFile, ".jpg"), "/my_photo.jpg")
assert.equal(buildUploadPath(dummyFile, ".png"), "/my_photo.png")

// 6. Format compression summary
const summary = formatCompressionSummary(1_000_000, 400_000, "JPEG")
assert.ok(summary.includes("JPEG"))
assert.ok(summary.includes("−60%"))

// 7. Resolve target format does not throw and returns valid mime + ext
const target = resolveTargetFormat(dummyFile)
assert.ok(["image/webp", "image/jpeg", "image/png"].includes(target.mime))
assert.ok(["webp", "jpg", "png"].includes(target.ext))

console.log("PASS: bucket image processing & cross-browser header validation")
