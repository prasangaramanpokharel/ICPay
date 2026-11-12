---
name: swr-official
description: SWR data fetching, client caching, mutations, conditional queries, and pagination patterns. Use when designing, creating, or debugging SWR hooks and cache interactions.
---

# SWR Official Standards & Patterns

This skill serves as the comprehensive index and guide for SWR data-fetching patterns across the ICPay frontend.

---

## Topic Guides & API References

- [`api.md`](api.md) — SWR Core API reference (`useSWR`, `useSWRMutation`, `mutate`, configuration options)
- [`arguments.md`](arguments.md) — Key arguments, serialized keys, function keys, and conditional `null` keys
- [`cache.md`](cache.md) — Global cache providers, custom cache maps, and persistence
- [`conditional-fetching.md`](conditional-fetching.md) — Dependent queries, conditional execution, and window focus revalidation
- [`middleware.md`](middleware.md) — SWR middleware plugins, logging, and request transformations
- [`nextjs.md`](nextjs.md) — Next.js App Router client-side fetching and static-export constraints
- [`pagination.md`](pagination.md) — `useSWRInfinite` for pagination, load-more, and cursor-based feeds
- [`performance.md`](performance.md) — Re-render prevention, deduplication intervals, and request batching
- [`prefetching.md`](prefetching.md) — Programmatic prefetching with `preload` and fallback caches
- [`suspense.md`](suspense.md) — React Suspense boundaries and streaming patterns with SWR
- [`typescript.md`](typescript.md) — Generic data and error typing for SWR hooks
