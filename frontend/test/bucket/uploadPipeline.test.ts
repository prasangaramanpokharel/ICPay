import test from "node:test"
import assert from "node:assert/strict"
import { isIgnoredSystemEntry } from "../../hooks/bucket/useBucketUpload"
import { uploadChunkCount, chunkByteRange, BUCKET_UPLOAD_MIN_CHUNK_BYTES } from "../../lib/bucket/uploadChunk"

test("isIgnoredSystemEntry filters macOS, Windows, and system directories correctly", () => {
  const dsStore = new File([""], ".DS_Store")
  assert.equal(isIgnoredSystemEntry(dsStore), true)

  const thumbsDb = new File([""], "Thumbs.db")
  assert.equal(isIgnoredSystemEntry(thumbsDb), true)

  const normalFile = new File(["hello"], "document.pdf")
  assert.equal(isIgnoredSystemEntry(normalFile), false)

  const gitFile = new File(["ref: refs/heads/main"], "HEAD")
  assert.equal(isIgnoredSystemEntry(gitFile, ".git/HEAD"), true)

  const nodeModulesFile = new File(["module"], "index.js")
  assert.equal(isIgnoredSystemEntry(nodeModulesFile, "my-app/node_modules/pkg/index.js"), true)

  const validNestedFile = new File(["content"], "report.txt")
  assert.equal(isIgnoredSystemEntry(validNestedFile, "projects/2026/q1/report.txt"), false)
})

test("uploadChunkCount and chunkByteRange partition large uploads within safety bounds", () => {
  const smallSize = 500_000
  assert.equal(uploadChunkCount(smallSize), 1)

  const largeSize = 5_000_000
  const chunks = uploadChunkCount(largeSize)
  assert(chunks > 1)

  let coveredBytes = 0
  for (let i = 0; i < chunks; i++) {
    const { start, end } = chunkByteRange(largeSize, i, chunks)
    assert(start === coveredBytes)
    assert(end > start)
    assert(end - start <= BUCKET_UPLOAD_MIN_CHUNK_BYTES * 2)
    coveredBytes = end
  }
  assert.equal(coveredBytes, largeSize)
})
