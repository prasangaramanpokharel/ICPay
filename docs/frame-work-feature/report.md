# ICPay — Framework Feature & React 19 Modernization Audit

**Document Path**: `docs/frame-work-feature/report.md`  
**Target Environment**: Next.js 16.4.6, React 19.2.4, TypeScript 5.8  
**Architecture Context**: Static Export (`output: "export"`), Internet Computer Custodial Canister (`icp_wallet_backend`), SWR Client Data Layer  

---

## 1. Executive Summary

ICPay operates under a unique, high-security architecture: a decentralized custodial wallet on the Internet Computer where real assets are secured via Internet Identity. The frontend is compiled via Next.js static export (`output: "export"`) and served through Vercel and IC asset canisters.

While the project has already upgraded its foundation to **React 19.2.4** and **Next.js 16.4.6**, our codebase audit reveals that **ICPay is currently operating React 19 primarily as a backward-compatible React 18 runtime**. Key modern features that eliminate boilerplate, prevent UI locking during on-chain consensus, and deliver instantaneous user feedback are currently under-utilized.

### Audit Empirical Snapshot

| Metric | Codebase Count | Modern React 19 Target | Opportunity |
|---|---|---|---|
| Manual `useState(false)` for loading/saving | **122 components** | Replaced by `useTransition` / `useActionState` | Eliminates ~300+ lines of redundant state declarations and try/finally boilerplate. |
| Imperative `e.preventDefault()` form handlers | **24 components** | React 19 `<form action={...}>` | Native form lifecycle, automatic error capture, zero event boilerplate. |
| `useTransition` (Async Transitions) | **0 components** | Core action handler | Native non-blocking UI during IC update consensus (~1.5s - 2.5s). |
| `useOptimistic` (Instant Optimistic UI) | **0 components** | Canisters, Wallet, Bookmarks | Instant UI feedback before IC on-chain update completes. |
| `useFormStatus` in Action Buttons | **0 components** | Primary UI buttons | Submit buttons automatically display `<Spinner />` without prop drilling `disabled={loading}`. |
| `forwardRef` in `components/ui/` | **0 components** | Modern prop-based ref | Already fully modernized (clean shadcn primitives). |

---

## 2. Architectural Boundary & Invariants

```
┌────────────────────────────────────────────────────────┐
│             Next.js Static Export Constraint           │
│   • output: "export" in next.config.ts                 │
│   • Zero Node.js runtime at request time               │
│   • No server-side cookies, headers, or Server Actions │
└──────────────────────────┬─────────────────────────────┘
                           │ Static Assets served from CDN / Canister
                           ▼
┌────────────────────────────────────────────────────────┐
│             React 19 Client Action Runtime             │
│   • Async Client Actions with useTransition            │
│   • useOptimistic for immediate local state delta      │
│   • SWR for Orthogonal Canister Cache Management       │
└──────────────────────────┬─────────────────────────────┘
                           │ IC Agent calls (Update / Query)
                           ▼
┌────────────────────────────────────────────────────────┐
│             Internet Computer Canisters (Rust/Motoko)  │
│   • icp_wallet_backend (Custodial Ledger Subaccounts)  │
│   • IC Management Canister (canister_status, settings) │
│   • icp_blob_store (Binary Payload Storage)            │
└────────────────────────────────────────────────────────┘
```

> [!IMPORTANT]
> **Client Actions vs Server Actions in ICPay**:
> Because ICPay builds to a purely static export (`output: "export"`), Node.js `"use server"` Server Actions cannot run at request time. However, React 19's `useTransition`, `useActionState`, and `<form action={...}>` work **natively with async Client Actions** (`async (formData) => { await agentCall(); }`). This gives ICPay all the ergonomic and performance benefits of modern actions without requiring a Node.js server.

---

## 3. High-Performance Feature Audit & Use Cases

### A. Async Transitions (`useTransition`)
* **Current Pattern**: 122 components manually declare `const [loading, setLoading] = useState(false)`, set `setLoading(true)` in a `try` block, and reset it in `finally`.
* **Problem**: The UI thread is forced to manage synchronous state updates, causing input lag and potential race conditions if multiple actions trigger.
* **Modern Pattern**:
  ```tsx
  const [isPending, startTransition] = useTransition();

  const handleTopUp = () => {
    startTransition(async () => {
      await topUpCanister(identity, canisterId, amount);
      toast.success("Top up successful");
      status.refresh();
    });
  };
  ```
* **Benefits**:
  - Automatically manages `isPending` without manual boolean flags.
  - Keeps the browser responsive and non-blocking during 1.5–2.5 second Internet Computer update consensus.
  - Automatically batches subsequent state updates upon transaction completion.

### B. Optimistic UI (`useOptimistic`)
* **Current Pattern**: When renaming a canister, linking a new canister ID, adding a controller, or creating a bookmark, the user waits ~2 seconds looking at a spinner before the list updates.
* **Modern Pattern**:
  ```tsx
  const [optimisticEntries, setOptimisticEntry] = useOptimistic(
    savedEntries,
    (state, newEntry: SavedCanister) => [...state, newEntry]
  );
  ```
* **Best Use Cases in ICPay**:
  1. **Canister Renaming & Linking**: Display the new canister name / card immediately; settle or revert if rejected.
  2. **Controller Add / Remove**: Render the principal tag or removal immediately with an `optimistic` badge.
  3. **Wallet Bookmarks**: Instantly pin or remove contacts without waiting for on-chain canister persistence.
  4. **Log Visibility Toggle**: Flip the public/controller toggle instantly while the IC management call runs in the background.

### C. Self-Managed Form Actions (`useActionState` & `useFormStatus`)
* **Current Pattern**: 24 forms use `<form onSubmit={e => { e.preventDefault(); ... }}>` with manual state validation and error propagation. Submit buttons require manual prop drilling: `<Button disabled={saving}>{saving && <Spinner />} Save</Button>`.
* **Modern Pattern**:
  ```tsx
  // Child Submit Button (auto-detects pending parent form)
  function SubmitActionButton({ label }: { label: string }) {
    const { pending } = useFormStatus();
    return (
      <Button type="submit" disabled={pending} size="sm">
        {pending && <Spinner className="size-4" />}
        <span>{label}</span>
      </Button>
    );
  }

  // Parent Action Form
  export function RenameCanisterForm({ canisterId }: { canisterId: string }) {
    const [state, formAction, isPending] = useActionState(
      async (prevState, formData: FormData) => {
        const name = formData.get("name") as string;
        await renameCanister(canisterId, name);
        return { success: true };
      },
      null
    );

    return (
      <form action={formAction} className="space-y-4">
        <Input name="name" required />
        <SubmitActionButton label="Save Name" />
      </form>
    );
  }
  ```
* **Benefits**:
  - Eliminates form boilerplate and `e.preventDefault()`.
  - Child submit buttons automatically show loading spinners via `useFormStatus` with zero prop drilling.
  - Natural progressive enhancement and clean error encapsulation.

### D. The Resource Reading API (`use(Promise | Context)`)
* **Current Pattern**: Data fetching from promises outside SWR requires `useEffect` + local state or top-level blocking await.
* **Modern Pattern**: In client components wrapped in `<Suspense>`, promises can be read directly via `use(promise)`.
* **Use Cases in ICPay**:
  - Reading asynchronously prepared IC identity delegations or asset thumbnails.
  - Reading context values conditionally inside loops or helper functions without violating hook rules (since `use()` is permitted inside conditionals).

### E. Document Head Hoisting & Resource Hints
* **Current Pattern**: Relying exclusively on root layout metadata.
* **Modern Pattern**: React 19 natively hoists `<title>`, `<meta>`, and `<link rel="stylesheet">` elements placed anywhere within component trees directly into the document `<head>`.
* **Use Cases in ICPay**:
  - Dynamic page-specific title updates inside deeply nested canister or bucket views without breaking static export boundaries.
  - Resource prefetching (`<link rel="preconnect" href="https://icp0.io" />`) loaded dynamically on canister management pages.

### F. Hydration Discrepancy Prevention (`suppressHydrationWarning`)
* **Current Pattern**: Dynamic values computed from local browser state (e.g. system time, cycle burn clocks, local fiat currency conversion) can trigger React hydration warnings when server pre-rendered HTML differs from the client render.
* **Modern Pattern**: Add `suppressHydrationWarning` strictly to the leaf container displaying the dynamic time or live fiat conversion value:
  ```tsx
  <span suppressHydrationWarning className="tabular-nums">
    {formatLocalTimestamp(timestamp)}
  </span>
  ```

---

## 4. What ICPay Must Deliberately Refuse (Non-Negotiable Invariants)

1. **No Node.js Server Actions**: Do not add `"use server"` for backend Node execution. ICPay is deployed statically to Vercel and Internet Computer asset canisters; there is no Node.js runtime in production.
2. **No Dynamic Cookies or Request-Time Headers**: All authentication is Internet Identity via browser-side WebAuthn / `@dfinity/auth-client`. Never attempt to set server-side session cookies.
3. **Never Change `NEXT_PUBLIC_DERIVATION_ORIGIN`**: Permanently pinned to `https://63dke-waaaa-aaaan-q6mvq-cai.icp0.io`. Changing this locks all existing users out of their funds forever.
4. **Zero Comments in UI Code**: Strict adherence to the repository comment policy: declarative self-documenting React components with 0 line or JSX comments.
5. **Semantic Color Tokens Only**: All UI elements strictly consume semantic tokens from `frontend/app/globals.css` (`bg-card`, `text-foreground`, `bg-muted/20`, etc.). No hardcoded `#hex` or literal color names.

---

## 5. Prioritized Implementation Recommendations

| Priority | Area | Action | Impact |
|---|---|---|---|
| **Phase 1 (Immediate)** | Canister Management & Dialogs | Adopt `useTransition` for async settings saves (resources, controllers, lifecycle) | Eliminates manual `saving` booleans, prevents UI freezes, ensures smooth non-blocking execution during IC consensus. |
| **Phase 2 (UX Performance)** | Canister List & Bookmarks | Implement `useOptimistic` for renaming, linking, and bookmarking | Eliminates ~2s waiting delay; list updates instantly with automatic rollback on rejection. |
| **Phase 3 (Form Standardization)** | Forms & Modals | Implement `useActionState` and `useFormStatus` on Top-up and Transfer dialogs | Standardizes form submission across 24 forms; removes manual `disabled={saving}` prop drilling. |
| **Phase 4 (SWR Synergy)** | Data Hooks (`frontend/hooks/`) | Enforce `keepPreviousData: true` and standardized cache key tuples across all hooks | Completely eliminates skeleton flashing and layout jumping across all dashboard modules. |
