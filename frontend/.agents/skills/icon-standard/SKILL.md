---
name: icpay-icon-standard
description: ICPay formal fintech icon and visual standards — @hugeicons/react only, semantic CSS tokens, zero background clutter, zero hardcoded colors.
---

# Icon & Visual Element Standard

> **Status:** Required  
> **Target:** ICPay Design System (`frontend/`)  
> **Principle:** Formal, clean, minimal fintech. Semantic color tokens only, zero hardcoded colors, zero decorative background clutter.

---

## 1. Core Philosophy: Formal & Minimal Fintech

In institutional financial applications, UI elements must convey trust, precision, and clarity. Avoid trendy consumer decorative clutter:

1. **Clean Icon Presentation (No Unnecessary Backgrounds)**:
   - Use clean, bare icons with semantic colors directly (e.g. `<HugeiconsIcon icon={ArrowUp02Icon} className="size-3.5 text-primary" strokeWidth={1.75} />`).
   - **Do NOT** wrap standard action icons in arbitrary colored background circles/squares (e.g. avoid `p-2 rounded-full bg-primary/10`, `bg-emerald-500/10`, `bg-green-100`).
   - Keep actions and buttons clean, lightweight, and formal.

2. **Zero Hardcoded Colors**:
   - **Forbidden**: Hex colors (`#10b981`, `#3b82f6`, `#ef4444`), raw color names (`text-emerald-500`, `text-green-500`, `bg-blue-600`).
   - **Mandatory**: Theme tokens defined in `globals.css`:
     - `text-primary` / `bg-primary` / `text-primary-foreground`
     - `text-success` / `bg-success` / `text-success-foreground`
     - `text-destructive` / `bg-destructive`
     - `text-muted-foreground` / `text-foreground`
     - `border-border` / `bg-muted` / `bg-card` / `bg-popover`

3. **No Gimmicky Status Animations**:
   - **Forbidden**: Pulsing animated dots (e.g. `size-1.5 rounded-full bg-success animate-pulse`) next to status text.
   - **Mandatory**: Crisp, formal text badges:
     ```tsx
     // Correct: Formal, clean status badge
     <span className="inline-flex items-center rounded-lg border border-border/50 bg-muted/30 px-2.5 py-1 text-xs font-medium text-success">
       Running
     </span>
     ```

---

## 2. Icon Library & Sizing Matrix

ICPay standardizes exclusively on **Hugeicons** (`@hugeicons/react` and `@hugeicons/core-free-icons`).

| Context | Icon Size Class | Pixel Dimensions | Recommended Stroke Width |
| :--- | :--- | :--- | :--- |
| **Micro Inline** (tooltips, small badges) | `size-3` | 12 × 12 px | `strokeWidth={2}` |
| **Buttons & Field Addons** (sm/xs buttons) | `size-3.5` | 14 × 14 px | `strokeWidth={1.75}` |
| **Standard Navigation** (tabs, menus, list items) | `size-4` | 16 × 16 px | `strokeWidth={1.75}` |
| **Dialog / Section Headers** | `size-5` | 20 × 20 px | `strokeWidth={1.75}` |
| **Feature / Empty State Hero** | `size-6` to `size-8` | 24–32 px | `strokeWidth={1.5}` |

### Sizing & Stroke Consistency Rule
When rendering icons inside small buttons (`size="sm"` or `size="xs"`), always specify explicit sizes:
```tsx
// Good: Explicit, crisp stroke
<HugeiconsIcon icon={ArrowUp02Icon} className="size-3.5 text-primary" strokeWidth={1.75} />

// Bad: Default 24px icon with heavy stroke
<HugeiconsIcon icon={ArrowUp02Icon} />
```

---

## 3. Copy & Clipboard Button Pattern

All copy actions across ICPay **must** adhere to the standardized copy indicator pattern:

### Rule:
1. Always import from `@/components/ui/copy-button`.
2. Use `<CopyButton>` for standalone copy buttons.
3. Use `<CopyIconIndicator>` for custom triggers or input addons.
4. Always notify with `toast.success("Successfully copied")`.

```tsx
import { CopyButton, CopyIconIndicator } from "@/components/ui/copy-button"

// Pattern A: Reusable CopyButton
<CopyButton
  value={canisterId}
  aria-label="Copy Canister ID"
  className="size-6 text-muted-foreground hover:text-foreground"
  iconClassName="size-3.5"
/>

// Pattern B: Custom Trigger with CopyIconIndicator
<button
  type="button"
  onClick={handleCopy}
  className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
>
  <CopyIconIndicator copied={copied} iconClassName="size-3.5" />
  <span>{copied ? "Copied" : "Copy"}</span>
</button>
```

---

## 4. Action Groups & Header Controls Pattern

When multiple actions appear together (e.g. Canister Header, Bucket Controls, Token Actions):

1. **Always use `<ButtonGroup>`**:
   Wrap related actions and dropdown triggers in `<ButtonGroup>` from `@/components/ui/button-group`.
2. **Unified Styling**:
   Keep heights consistent (`h-7.5` or `h-8`), subtle borders (`border-border/50`), and muted backgrounds (`bg-muted/30` hover `bg-muted/60`).

```tsx
// Pattern: Formal Action ButtonGroup
<ButtonGroup className="rounded-lg shadow-2xs">
  <Button
    type="button"
    variant="outline"
    size="sm"
    onClick={() => setTopupOpen(true)}
    className="h-7.5 gap-1.5 px-2.5 text-xs font-medium border-border/50 bg-muted/30 text-foreground hover:bg-muted/60 hover:text-foreground cursor-pointer"
  >
    <HugeiconsIcon icon={ArrowUp02Icon} className="size-3.5 text-primary" strokeWidth={1.75} />
    <span>Top up</span>
  </Button>

  <Button
    type="button"
    variant="outline"
    size="sm"
    onClick={() => setAddControllerOpen(true)}
    className="h-7.5 gap-1.5 px-2.5 text-xs font-medium border-border/50 bg-muted/30 text-foreground hover:bg-muted/60 hover:text-foreground cursor-pointer"
  >
    <HugeiconsIcon icon={UserAdd01Icon} className="size-3.5 text-muted-foreground" strokeWidth={1.75} />
    <span>Add controller</span>
  </Button>

  <DropdownMenu>
    <DropdownMenuTrigger
      render={
        <Button
          type="button"
          size="icon-xs"
          variant="outline"
          className="size-7.5 border-border/50 bg-muted/30 text-muted-foreground hover:bg-muted/60 hover:text-foreground cursor-pointer"
          aria-label="More actions"
        />
      }
    >
      <HugeiconsIcon icon={MoreVerticalIcon} className="size-3.5" />
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" className="w-52">
      {/* Dropdown items */}
    </DropdownMenuContent>
  </DropdownMenu>
</ButtonGroup>
```

---

## 5. Anti-Patterns Checklist

| ❌ Never Do | ✅ Always Do | Rationale |
| :--- | :--- | :--- |
| `className="text-emerald-500 bg-emerald-500/10"` | `className="text-success bg-muted/30 border border-border/50"` | Respects dark/light OKLCH theme tokens; avoids neon toy-like look. |
| Pulse dots on status: `<span className="animate-pulse bg-success" />` | Clean text status: `<span className="text-success font-medium">Running</span>` | Professional, high-density institutional appearance. |
| Heavy background bubble behind icons: `<div className="bg-primary/10 rounded-full p-2"><HugeiconsIcon ... /></div>` | Clean bare icon with semantic class: `<HugeiconsIcon className="size-4 text-primary" />` | Eliminates visual noise and keeps layout lightweight. |
| Custom raw SVG for checkmarks | Use `<CopyIconIndicator>` from `@/components/ui/copy-button` | Maintains global motion animation and token consistency. |
| Hardcoded copy alert messages or missing toasts | `toast.success("Successfully copied")` | User gets instant tactile feedback across all 15+ copy points in the system. |
| Button or action without spinner when processing | `{busy && <Spinner data-icon="inline-start" />}` inside `<Button>` | User gets deterministic visual feedback when async flows (topup, mint, transfer, verify) are in progress. |

---

## 6. Processing States, Spinners & SpinnerBadges

For any async submission or live synchronization state:

1. **Button Processing**: Always use `<Spinner data-icon="inline-start" />` from `@/components/ui/spinner`:
   ```tsx
   <Button
     type="submit"
     disabled={submitting}
   >
     {submitting && <Spinner data-icon="inline-start" />}
     {submitting ? "Processing…" : "Confirm"}
   </Button>
   ```

2. **Processing Badges**: Use `<SpinnerBadge>` or `<Badge>` with `<Spinner data-icon="inline-start" />`:
   ```tsx
   import { Badge } from "@/components/ui/badge"
   import { Spinner } from "@/components/ui/spinner"
   import { SpinnerBadge } from "@/components/ui/spinner-badge"

   export function SpinnerBadge() {
     return (
       <div className="flex items-center gap-4 [--radius:1.2rem]">
         <Badge>
           <Spinner data-icon="inline-start" />
           Syncing
         </Badge>
         <Badge variant="secondary">
           <Spinner data-icon="inline-start" />
           Updating
         </Badge>
         <Badge variant="outline">
           <Spinner data-icon="inline-start" />
           Processing
         </Badge>
       </div>
     )
   }
   ```

