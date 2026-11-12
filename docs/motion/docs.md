# ICPay Motion & Animation Architecture (`docs/motion/docs.md`)

**Package**: `motion` (`^13.4.2` / `framer-motion`)  
**Modern Import**: `import { ... } from "motion/react"`  
**React Version**: React 19 (`19.2.4`)  
**Deployment Target**: Next.js Static Export (`output: "export"`) on Vercel & Internet Computer Asset Canister (`63dke-waaaa-aaaan-q6mvq-cai`)  

---

## 1. Overview & Motion Philosophy

Motion in ICPay delivers high-fidelity micro-interactions, layout transitions, and page dynamics while adhering to strict crypto-wallet performance, cycle economics, and accessibility requirements.

### 1.1 Non-Negotiable Invariants
1. **Accessibility First (`prefers-reduced-motion`)**: Every animation must respect user preferences. The root `MotionProvider` sets `reducedMotion="user"` so all springs and tweens automatically fold down to instant opacity transitions or zero movement when reduced motion is requested in the OS.
2. **GPU Acceleration & Zero Layout Shifts**: Animate `transform` (`x`, `y`, `scale`) and `opacity` whenever possible. Never animate layout-triggering properties (`width`, `height`, `top`, `left`, `margin`) directly with raw frame polling; use `layout` / `layoutId` projection for morphing geometry.
3. **Semantic Token Integration**: Motion indicator pills and overlays must strictly consume `globals.css` tokens (`bg-muted`, `bg-primary`, `bg-card`, `border-border`). Never use hardcoded color values.
4. **Clean Code Hygiene**: UI components that consume Motion must obey the workspace **ZERO comments in UI files** rule. Keep animation variants declarative and self-documenting.

---

## 2. Complete Framer Motion Exports Reference

Every export available in the `motion` (`framer-motion`) package is cataloged below, organized by engine domain.

### 2.1 Core Components & Layout Primitives

| Export | Category | Description & Usage |
|---|---|---|
| `motion` | Core Component | The primary factory for creating animated HTML and SVG DOM elements (`motion.div`, `motion.button`, `motion.span`, `motion.svg`, `motion.path`). Supports `initial`, `animate`, `exit`, `variants`, `transition`, `whileHover`, `whileTap`, `whileFocus`, and `layout`. |
| `AnimatePresence` | Component | Mounts/unmounts children with exit animations. Enables components to animate *out* when removed from the React component tree (`exit` prop). Supports `mode="sync"`, `mode="wait"`, and `mode="popLayout"`. |
| `MotionConfig` | Context Component | Configures global defaults across all child `motion` components, including `reducedMotion`, `transition`, and global feature flags. |
| `LazyMotion` | Performance Component | Reduces bundle size by dynamically or lazily loading animation features (`domAnimation` or `domMax`) via the `features` prop. Paired with the lightweight `m` component. |
| `LayoutGroup` | Layout Component | Groups components to coordinate layout animations or shared layout indicators (`layoutId`) across different component trees or independent sibling branches. |
| `Reorder` | Component Group | Composed of `Reorder.Group` and `Reorder.Item`. Enables fluid, touch-friendly, physics-based drag-to-reorder lists. |
| `PresenceChild` | Internal Component | Wraps individual children inside `AnimatePresence` to track enter/exit lifecycle signals and safe-to-remove deferrals. |
| `PopChild` | Internal Component | Internal component that manages `mode="popLayout"` for `AnimatePresence`, instantly popping exiting elements out of the document flow so siblings reflow smoothly. |
| `AnimateSharedLayout` | Deprecated Component | Legacy API for shared layout transitions. Modern code uses `LayoutGroup` and `layoutId` directly on `motion` elements. |

---

### 2.2 Animation & Control Hooks

| Export | Type | Description & Usage |
|---|---|---|
| `useAnimation` | Hook | Alias for `useAnimationControls`. Creates a controller to manually orchestrate animations with imperative `.start()`, `.stop()`, and `.set()` methods. |
| `useAnimationControls` | Hook | Returns an imperative `AnimationControls` object to chain sequences, trigger animations in response to asynchronous events (e.g., canister responses), or bind across multiple elements. |
| `useAnimate` | Hook | Scoped, micro-animation hook for imperative DOM manipulation without needing `motion` component wrappers. Returns `[scope, animate]`. |
| `useAnimateMini` | Hook | Stripped-down internal variant of `useAnimate` optimized for low-overhead, small-footprint transitions. |
| `useAnimationFrame` | Hook | Subscribes a callback to the browser's `requestAnimationFrame` loop, passing elapsed time and delta since the last frame. Ideal for continuous ambient canvas or SVG effects. |
| `useCycle` | Hook | Toggles through an array of visual states or animation variant names with each call. |

---

### 2.3 Motion Values & Reactive Transformers

| Export | Type | Description & Usage |
|---|---|---|
| `MotionValue` | Class | Trackable reactive state holder that updates styles outside the React render loop. Allows high-performance 60/120 FPS animations without re-rendering parent components. |
| `MotionValueState` | Enum/Type | Internal state representing the lifecycle and attachment status of a `MotionValue`. |
| `useMotionValue` | Hook | Instantiates a persistent `MotionValue` within a React component that updates styles directly on the DOM layer without triggering component re-renders. |
| `useMotionTemplate` | Hook | Combines multiple `MotionValue` instances into a single string template (e.g. `radial-gradient(...)`, `transform(...)`, `translate3d(...)`). |
| `useMotionValueEvent` | Hook | Subscribes to events on a `MotionValue` (`"change"`, `"animationStart"`, `"animationComplete"`) with automatic cleanup on unmount. |
| `useTransform` | Hook | Maps one or more `MotionValue` inputs through an interpolation curve, function, or range mapping (e.g., map scroll `[0, 1]` to opacity `[1, 0]`). |
| `useSpring` | Hook | Creates a `MotionValue` driven by spring physics (`stiffness`, `damping`, `mass`, `restDelta`). Can animate values smoothly toward a target `MotionValue`. |
| `useVelocity` | Hook | Creates a reactive `MotionValue` reflecting the current rate of change (velocity in pixels/second) of another `MotionValue`. |
| `useTime` | Hook | Returns a `MotionValue` continuously updated with elapsed milliseconds since the component mounted. |
| `useFollowValue` | Hook | Internal utility hook that drives one `MotionValue` smoothly behind another target `MotionValue`. |
| `WillChangeMotionValue` | Class | Specialized `MotionValue` managing the CSS `will-change` property to optimize hardware compositing layers right before animations begin. |
| `useWillChange` | Hook | Hook that dynamically allocates and manages `will-change` CSS hints on demand during active gestures and animations. |

---

### 2.4 Viewport, Scroll & Intersection Hooks

| Export | Type | Description & Usage |
|---|---|---|
| `useScroll` | Hook | Returns reactive `scrollX`, `scrollY`, `scrollXProgress`, and `scrollYProgress` MotionValues for either the full window or a targeted container `ref`. |
| `useInView` | Hook | Detects when a DOM element enters or leaves the browser viewport using `IntersectionObserver`. Supports `once`, `margin`, and `amount` thresholds. |
| `usePageInView` | Hook | Internal or specialized variant of `useInView` tuned for full-page root tracking. |
| `useElementScroll` | Deprecated Hook | Legacy scroll hook for container elements. Deprecated in favor of `useScroll({ container: ref })`. |
| `useViewportScroll` | Deprecated Hook | Legacy window scroll hook. Deprecated in favor of `useScroll()`. |

---

### 2.5 Accessibility, Presence & Lifecycle Hooks

| Export | Type | Description & Usage |
|---|---|---|
| `useReducedMotion` | Hook | Returns a boolean indicating whether the user has enabled "Reduce Motion" in their system settings (`prefers-reduced-motion`). |
| `useReducedMotionConfig` | Hook | Returns the resolved reduced motion configuration applied through `MotionConfigContext`. |
| `usePresence` | Hook | Used inside components rendered within `AnimatePresence`. Returns `[isPresent, safeToRemove]`. Allows custom manual cleanup or unmount deferral. |
| `useIsPresent` | Hook | Similar to `usePresence`, but returns only a boolean indicating whether the element is actively present or currently animating out. |
| `usePresenceData` | Hook | Accesses the `custom` prop passed down through `AnimatePresence` to coordinate exit animations based on external context. |

---

### 2.6 Drag & Gesture Controls

| Export | Type | Description & Usage |
|---|---|---|
| `DragControls` | Class | Controller instance that manages drag sessions programmatically (e.g. initiating drag on a card when clicking a dedicated handle). |
| `useDragControls` | Hook | Returns a `DragControls` instance to attach to drag handles via `dragControls.start(event)`. |
| `useDomEvent` | Hook | Attaches DOM event listeners with automatic passive listener optimization and cleanup on unmount. |

---

### 2.7 Layout Projection & Context Architecture

| Export | Type | Description & Usage |
|---|---|---|
| `LayoutGroupContext` | React Context | Context provided by `LayoutGroup` to synchronize layout animations across related components. |
| `DeprecatedLayoutGroupContext` | React Context | Backward-compatibility layer for legacy layout synchronization groups. |
| `SwitchLayoutGroupContext` | React Context | Coordinates layout switches between distinct layout groups. |
| `PresenceContext` | React Context | Provides exit lifecycle signals and safe-to-remove callbacks to child components inside `AnimatePresence`. |
| `MotionContext` | React Context | Internal context carrying visual element tree references and parent animation states. |
| `MotionConfigContext` | React Context | Distributes configuration from `MotionConfig` (reduced motion, global transition rules, layout flags). |
| `MotionGlobalConfig` | Object | Global configuration singleton allowing library-wide defaults (such as custom frame timing or test environment overrides). |
| `DocumentProjectionNode` | Class | Root node in the layout projection graph representing the document root. |
| `HTMLProjectionNode` | Class | Node in the layout projection graph representing an HTML DOM element, computing relative bounding boxes and scale corrections. |
| `NodeStack` | Class | Internal stack data structure that orders layout projection nodes according to z-index and DOM hierarchy. |
| `FlatTree` | Class | Data structure maintaining a flattened hierarchy of projection nodes for linear layout computation loops. |
| `LayoutAnimationBuilder` | Class | Constructs and configures transition keyframes for layout morphs and cross-fades. |
| `useInstantLayoutTransition` | Hook | Executes a state change that affects layout without animating the transition (bypassing layout smoothing for instant snaps). |
| `useInstantTransition` | Hook | Hook allowing instantaneous visual updates across motion values without tweening or spring physics. |
| `useResetProjection` | Hook | Resets projection measurements on elements whose bounding box underwent external mutation without layout notice. |
| `useDeprecatedInvertedScale` | Deprecated Hook | Counteracts parent distortion by calculating inverse scale factors. Replaced by automatic projection layout in modern Motion. |

---

### 2.8 Low-Level Animation Engines & Resolvers

| Export | Type | Description & Usage |
|---|---|---|
| `animate` | Function | Standalone imperative animation function. Animates raw numbers, strings, CSS properties, or `MotionValue` instances with spring/tween physics. |
| `VisualElement` | Class | Abstract base class that wraps a DOM or canvas node, synchronizing visual state, motion values, and projection nodes. |
| `DOMVisualElement` | Class | Base class for all DOM-based visual element representations. |
| `HTMLVisualElement` | Class | Visual element implementation specialized for HTML elements (`<div>`, `<span>`, etc.). |
| `SVGVisualElement` | Class | Visual element implementation specialized for SVG tags (`<path>`, `<circle>`), managing path morphing and attribute bindings. |
| `ObjectVisualElement` | Class | Visual element implementation for generic JavaScript objects (used in Three.js / Canvas integrations). |
| `KeyframeResolver` | Class | Resolves and formats keyframe arrays from inputs, CSS variables, and computed DOM properties. |
| `DOMKeyframesResolver` | Class | DOM-specialized keyframe resolver that extracts initial computed styles from live DOM nodes before tweening. |
| `GroupAnimation` | Class | Coordinates and drives multiple sub-animations simultaneously under a single completion lifecycle. |
| `GroupAnimationWithThen` | Class | Promise-compatible extension of `GroupAnimation` supporting async `.then()` chaining. |
| `JSAnimation` | Class | JavaScript-driven frame animation engine running on `requestAnimationFrame` for springs and custom easings. |
| `NativeAnimation` | Class | Hardware-accelerated browser animation driver utilizing the Web Animations API (WAAPI). |
| `NativeAnimationExtended` | Class | Extended WAAPI driver handling complex transforms and pseudo-elements. |
| `NativeAnimationWrapper` | Class | Wrapper unifying the interface between WAAPI and JavaScript animation instances. |
| `AsyncMotionValueAnimation`| Class | Coordinates asynchronous value updates for long-running or stepped transitions. |
| `ViewTransitionBuilder` | Class | Integrates with the browser's native Document View Transitions API. |
| `Feature` | Class | Modular plugin class used by `LazyMotion` to conditionally inject capabilities (e.g., Gestures, Layout, Animation). |
| `SubscriptionManager` | Class | Lightweight pub/sub subscription manager used by `MotionValue` for high-frequency value listener dispatch. |

---

### 2.9 Internal Utilities & Legacy Helpers

| Export | Type | Description & Usage |
|---|---|---|
| `useComposedRefs` | Utility Hook | Merges multiple React `ref` callbacks into a single stable callback ref. |
| `useDomEvent` | Utility Hook | Registers DOM listeners with automatic cleanup. |
| `useFollowValue` | Internal Hook | Follows target values with spring lag. |
| `useForceUpdate` | Utility Hook | Forces a synchronous component re-render when external non-React layout shifts occur. |
| `useIsomorphicLayoutEffect`| Utility Hook | Resolves to `useLayoutEffect` in the browser and `useEffect` during SSR / static export. |
| `useUnmountEffect` | Utility Hook | Fires cleanup callbacks strictly on component unmount. |
| `useDeprecatedAnimatedState`| Deprecated Hook | Legacy state animation helper from early Framer Motion releases. |

---

## 3. How ICPay Implements Motion in Frontend

ICPay uses `"motion/react"` exclusively across feature components. Below is the blueprint of how these primitives are wired into production.

### 3.1 Global Root: `MotionProvider` (`frontend/components/motion-provider.tsx`)
Wrapped at the top of `frontend/app/layout.tsx`:
```tsx
"use client"

import type * as React from "react"
import { MotionConfig } from "motion/react"

export function MotionProvider({ children }: { children: React.ReactNode }) {
  return (
    <MotionConfig
      reducedMotion="user"
      transition={{ type: "spring", stiffness: 350, damping: 30 }}
    >
      {children}
    </MotionConfig>
  )
}
```
* **Accessibility**: Automatically honors `prefers-reduced-motion` without per-component boilerplate.
* **Physics Baseline**: Pinned spring standard (`stiffness: 350`, `damping: 30`) across the entire wallet for a consistent, crisp native-app feel.

---

### 3.2 Staggered List Dynamics: `MotionList` (`frontend/components/ui/motion-list.tsx`)
Used in `TokenList` (`components/wallet/token-list.tsx`) and card listings:
```tsx
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.04, delayChildren: 0.02 },
  },
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 400, damping: 30 },
  },
}
```
* **Performance**: Renders smooth entrances for up to hundreds of on-chain token rows with minimal frame overhead.

---

### 3.3 Magnetic Sliding Nav Highlight: `MotionHighlight` (`frontend/components/ui/motion-highlight.tsx`)
Used in desktop and mobile navigation bars (`nav-main.tsx` and `public/nav.tsx`):
* Computes bounding box offsets via `ResizeObserver` and updates CSS variables (`--motion-highlight-x`, `--motion-highlight-width`).
* Renders a floating background pill that glides smoothly under hovered and active navigation items with zero DOM layout recalculation penalties.

---

### 3.4 Shared Layout Tabs: `MotionTabs` (`frontend/components/ui/motion-tabs.tsx`)
```tsx
export function MotionTabIndicator({ layoutId = "active-tab-indicator", className, ...props }) {
  return (
    <motion.span
      layoutId={layoutId}
      transition={{ type: "spring", stiffness: 400, damping: 32 }}
      className={cn("absolute inset-0 -z-10 rounded-xl bg-background shadow-xs", className)}
      {...props}
    />
  )
}
```
* **`layoutId` Physics**: Smoothly animates the active tab background across tabs when the user switches views, preventing jarring abrupt cuts.
* **`AnimatePresence mode="wait"`**: Cross-fades content panels cleanly.

---

### 3.5 Micro-Interactions & SVG Beams
* **`CopyButton` (`frontend/components/ui/copy-button.tsx`)**: Combines `motion.span` scale animations and checkmark icon cross-fades on user click.
* **`AnimatedBeam` (`frontend/components/ui/animated-beam.tsx`)**: Animates `motion.linearGradient` along SVG curves between canister nodes, visualizing Chain Fusion data transfers.
* **`LinkCanisterDialog` (`frontend/components/canister/link-canister-dialog.tsx`)**: Orchestrates multi-step canister pairing flows with `AnimatePresence`, sliding steps left and right seamlessly.

---

## 4. Best Practices for AI Agents

1. **Import Path**: Always import from `"motion/react"`, never from `"framer-motion"` directly or `"motion"` root.
2. **Variants Definition**: Declare variants outside component render bodies to prevent unnecessary object allocation on every render frame.
3. **Hardware Acceleration**: Only animate `transform` and `opacity`. If geometry morphing is required, use `layoutId` or `layout`.
4. **No UI Comments**: Never include comment banners, inline comments, or JSX comments in `.tsx` files when implementing motion features.
