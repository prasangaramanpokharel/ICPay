import test from "node:test"
import assert from "node:assert/strict"
import { extractHeadings } from "../../lib/bucket/docs/headings"

test("extractHeadings extracts h2 and h3 headings with correct levels", () => {
  const md = `
# Title (ignored)
## Overview
Some text here.
### Features
More details.
`
  const headings = extractHeadings(md)
  assert.equal(headings.length, 2)
  assert.deepEqual(headings[0], { id: "overview", text: "Overview", level: 2 })
  assert.deepEqual(headings[1], { id: "features", text: "Features", level: 3 })
})

test("extractHeadings deduplicates repeated headings like 'Added'", () => {
  const md = `
## Release 1.1.0
### Added
- Item 1
## Release 1.0.0
### Added
- Item 2
### Added
- Item 3
`
  const headings = extractHeadings(md)
  const addedHeadings = headings.filter((h) => h.text === "Added")
  assert.equal(addedHeadings.length, 3)
  assert.equal(addedHeadings[0].id, "added")
  assert.equal(addedHeadings[1].id, "added-1")
  assert.equal(addedHeadings[2].id, "added-2")
})

test("extractHeadings skips headings inside fenced code blocks", () => {
  const md = `
## Real Heading
\`\`\`bash
## Not A Heading
### Also Not A Heading
\`\`\`
### Another Real Heading
`
  const headings = extractHeadings(md)
  assert.equal(headings.length, 2)
  assert.equal(headings[0].id, "real-heading")
  assert.equal(headings[1].id, "another-real-heading")
})

test("extractHeadings strips custom anchor syntax", () => {
  const md = `
## Custom Section {#custom-anchor}
`
  const headings = extractHeadings(md)
  assert.equal(headings.length, 1)
  assert.equal(headings[0].text, "Custom Section")
  assert.equal(headings[0].id, "custom-section")
})
