import test from "node:test"
import assert from "node:assert/strict"
import { formatProjectId, parseProjectId } from "../../components/cron/cron-types"

test("formatProjectId produces non-guessable alphanumeric IDs with minimum 8 chars", () => {
  const formatted3 = formatProjectId(3n)
  assert.equal(formatted3, "cr_1t6m9g4tyi")
  assert.ok(formatted3.startsWith("cr_"))
  assert.ok(formatted3.slice(3).length >= 8)
  assert.match(formatted3, /^cr_[0-9a-z]{8,}$/)

  const formatted1 = formatProjectId(1n)
  assert.ok(formatted1.slice(3).length >= 8)
  assert.match(formatted1, /^cr_[0-9a-z]{8,}$/)
})

test("parseProjectId seamlessly parses formatted and legacy project IDs", () => {
  assert.equal(parseProjectId("cr_1t6m9g4tyi"), 3n)
  assert.equal(parseProjectId(formatProjectId(3n)), 3n)
  assert.equal(parseProjectId("3"), 3n)
  assert.equal(parseProjectId(3), 3n)
  assert.equal(parseProjectId(3n), 3n)
})

test("round-trips multiple project IDs accurately", () => {
  const ids = [1n, 2n, 3n, 4n, 5n, 10n, 100n, 1337n, 99999n]
  for (const id of ids) {
    const formatted = formatProjectId(id)
    assert.ok(formatted.slice(3).length >= 8)
    const parsed = parseProjectId(formatted)
    assert.equal(parsed, id)
  }
})

test("handles edge cases gracefully", () => {
  assert.equal(parseProjectId(""), 0n)
  assert.equal(parseProjectId(undefined), 0n)
  assert.equal(parseProjectId(null), 0n)
  assert.equal(formatProjectId(undefined), "cr_00000000")
  assert.equal(formatProjectId(null), "cr_00000000")
})
