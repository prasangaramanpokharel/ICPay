## Description
<!-- Provide a brief summary of what changes are introduced and WHY. -->

## Changes
- 

## Invariants Checklist
- [ ] Authentication: Uses Internet Identity only. No private keys, seed phrases, or passwords committed.
- [ ] Pinned Origin: `NEXT_PUBLIC_DERIVATION_ORIGIN` is untouched.
- [ ] Quality: Zero runtime comments in frontend UI files (`@/components/ui/*`, `globals.css` semantic tokens only).
- [ ] Verified statically: `tsc --noEmit` and tests pass without errors.
- [ ] ESLint baseline: Error count does not exceed baseline ($\le 5$).
