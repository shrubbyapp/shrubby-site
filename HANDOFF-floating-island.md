# Handoff Spec: The Isle — interactive floating island on the CTA→footer seam

**Feature**: A photoreal floating wildflower island (source: giba's provided render, 2026-07-11) that hovers on the boundary between the download CTA section (`.band--honey .cta`) and the meadow-video footer (`.field`), stitching them into one continuous scene. Users can grab it and spin it a full 360°.

**Why this element**: The CTA copy is "Your garden already has a lot to say" and the footer is a real meadow. The island is the garden — lifted out of the footer's meadow and offered to the visitor's hands. It is the page's one bold object; everything around it stays quiet. Spinning it is the same invitation as the CTA button: touch the garden.

---

## Overview

- The island renders as a **pre-rendered 360° turntable frame sequence** drawn to a `<canvas>` — NOT live 3D. The artifact's CSP blocks all network requests and every asset ships as a data URI in the Parcel bundle; a WebGL/GLB pipeline would add ~600KB of three.js plus an unbounded mesh. Turntable frames match the site's existing "embed pre-rendered video/frames" convention (`media.ts`).
- New self-contained module `src/islet.tsx` exporting `<Islet />`, mounted as the **last child of `.cta__inner`'s parent section** (a sibling of `.cta__inner`, inside `<section className="band band--honey cta">`). Follows the Pip/CompanionSky convention: self-contained, behind an `ISLE_ENABLED` const, QA hook on `window.__isle`.
- Frames live in `src/islet-frames.ts` (base64 WebP array), same pattern as `media.ts` / `photos.ts`.

## Seam integration (the "seamless join")

This is the load-bearing part of the brief.

| Layer | Change |
|---|---|
| `.cta` | Gets `position:relative; z-index:2` so its bottom edge can overlap the footer. |
| `.isle` (island wrapper) | In-flow flex child (`flex:0 0 auto` — this site's bands silently flex-crush overflowing children), height `clamp(240px, 34vh, 420px)`, then pulled across the seam with `margin-bottom: clamp(-150px, -16vh, -90px)`. Net effect: the rock's underside and root tendrils hang over the footer's meadow video. |
| `.field::before` | Unchanged (sage-050 → transparent fade). The island straddles it; the fade reads as atmospheric haze behind the rock. |
| `.band--honey::after` (sun-breathe glow) | Reposition from behind the headline to behind the island crown: `top:auto; bottom:clamp(-40px,-4vh,-10px)` (keep `left:50%`, keep the 9s `sun-breathe` animation). It becomes the island's warm backlight — the photo's own golden-hour sun, now sourced from the page. |
| `.isle__shadow` | New: soft radial ellipse (`radial-gradient(closest-side, rgba(20,35,18,.32), transparent 70%)`) rendered *below the seam*, on top of the footer video, width 62% of island, `filter:blur(10px)`. Breathes with the bob (see Motion). This shadow falling on the *live video meadow* is what fuses the sections. |
| CTA vertical budget | Bands are hard 100svh. To make room: `.cta__inner` gap `clamp(24px,5.5vh,52px)` → `clamp(16px,3.2vh,32px)`; `.cta h2` cap `13vh` → `10.5vh`; `.cta__trust` `margin-top:8px` → `0`. Verify all 7 sections still measure 100.0svh at 1280×800 (project invariant). |
| Pip (footer ladybug) | **Do not touch.** Island overlap must stay within the top ~22% of `.field`. Pip's perch anchors are the bar rims + ground band y92–96% and the `.sprout-top` exclusion — the island never reaches them. Before publishing run the standing check: `grep -c 'PIP_ENABLED' src/App.tsx && grep -c 'pip--air' src/index.css`. |
| Existing critters | `Bee` (`.bee--cta`) and `Butterfly` (`.cta__bfly`) already live in this section — retarget their waypoint loops to orbit the island (see Immersive elements) instead of adding new fauna. Census stays 3 butterflies / 2 bees / 1 ladybug. |

## Design tokens used

All tokens already exist in `:root` of `src/index.css` — no new colors.

| Token | Value | Usage |
|---|---|---|
| `--lime-ink` | #33512C | CTA text (unchanged), hint label |
| `--sage-050` | #F7F7F1 | `.field::before` haze the island floats through |
| `--leaf` | #6FA14E | Focus-visible ring (3px, offset 6px — matches Pip) |
| `--terra` | #C4744A | Spin-hint arrow accent (single warm accent rule) |
| `--forest-950` | #22371D | Shadow ellipse tint base |
| Type | Bricolage Grotesque 800 / Figtree | Hint label uses Figtree .74rem 700, letter-spacing .08em — same register as `.cta__trust` chips |
| Easing | `cubic-bezier(.34,1.56,.64,1)` | Settle-after-release overshoot — the intentional clay easing (impeccable's hook flags it; leave it, per DESIGN.md) |

## Asset production pipeline

Source: the provided island render (single frontal photo, golden-hour sky background).

1. **Cut out** the island (rock + flora, keep dangling grass tendrils) → transparent PNG. The sky must go: the page supplies its own atmosphere (paper + sun glow + footer haze).
2. **Turntable**: image → 3D via an image-to-3D generator (e.g. Higgsfield `generate_3d` → GLB), then render a 60-frame orbit (6°/step), camera elevation ≈ 8° above horizon to match the source photo, neutral lighting baked warm to match golden hour. Alternative route if mesh quality disappoints: image-to-video "orbit the object 360°" generation → extract 60 frames → per-frame background removal. Either way, **frame 0 must match the source photo's angle** (that's the poster and the resting pose).
3. **Encode**: 60 × WebP-with-alpha, 1080px wide, quality ~70. **Budget: ≤3.5MB total** (bundle is already ~12.2MB). If over budget, drop to 36 frames (10°/step) before dropping resolution — at photoreal quality, resolution reads more than step count once inertia is smoothing the scrub.
4. Emit `src/islet-frames.ts`: `export const ISLE_FRAMES: string[]` (data URIs) + `export const ISLE_POSTER` (frame 0). No ffmpeg exists locally or in the sandbox — extract frames via `qlmanage`/`sips` or in-browser canvas capture, both proven in this project.

## Components

| Component | Where | Props/API | Notes |
|---|---|---|---|
| `Islet` | `src/islet.tsx`, mounted in `CTA()` | none (self-contained) | Renders `.isle` wrapper > `<canvas className="isle__stage">` + `.isle__shadow` + `.isle__hint`. Gated by `ISLE_ENABLED` const. |
| Canvas renderer | inside `Islet` | — | Decode frames to `ImageBitmap`s lazily; draw current frame with `drawImage`. Never stack 60 `<img>` elements. |
| `window.__isle` | debug/QA | `.set(deg)`, `.state()`, `.spin(degPerSec)` | Required — hidden preview tabs freeze rAF, so QA drives rotation via `.set()` (same lesson as `__pip`/`__sky`). |
| Loader | inside `Islet` | — | `IntersectionObserver` on the CTA section: when within 1 viewport, `createImageBitmap` the frames in idle-time chunks (8/frame batch). Until decoded: draw `ISLE_POSTER` only; drag is a no-op that still shows grabbing cursor (frames arrive within ~1s). |

## States and interactions

| Element | State | Behavior |
|---|---|---|
| Island | Idle (default) | Gentle bob (see Motion) + auto-spin 360°/90s. This is the "it's alive" cue — no tooltip needed at rest. |
| Island | Hover | Cursor `grab`; auto-spin eases to a stop over 600ms; hint label fades in below: **"drag to turn the island"** (Figtree .74rem, `--lime-ink` at .7). |
| Island | Pointer down / drag | Cursor `grabbing`; hint fades out permanently for the session (sessionStorage `shrubby-isle-hinted`). Rotation follows pointer: **0.5° per px** of horizontal travel (one full turn ≈ 720px). Pointer capture on the canvas. |
| Island | Release with velocity | Inertia: carry angular velocity, exponential friction ×0.94 per frame (timestamp-delta based, not frame-count — background tabs throttle rAF), stop below 0.05°/frame, then a single settle overshoot of ~2° using the clay easing. No snap-to-angle — a garden has no front. |
| Island | Idle 5s after interaction | Auto-spin resumes, easing in over 2s. |
| Island | Keyboard focus | Focus ring 3px `--leaf` offset 6px on the wrapper. ← / → rotate 15° per press with a 240ms eased tween; holding repeats. |
| Island | Frames still decoding | Poster frame shown static (with bob); drag buffers the angle and applies when decoded. |
| Island | Decode failure / very old engine | Fallback: static poster `<img>` with bob only; no cursor affordance, no hint. Never an empty hole in the layout. |
| Island | Reduced motion | No bob, no auto-spin, no inertia, no settle overshoot. Drag and arrow keys still work (user-initiated motion is permitted) but apply rotation directly with no tween. |
| Page scroll (mobile) | Vertical pan starting on the island | Do **not** hijack: claim the gesture only when `|dx| > |dy|` and `|dx| > 12px`; otherwise release pointer capture and let the page scroll. `touch-action: pan-y` on the canvas. |

## Immersive elements (restrained — the island is the signature; these support it)

1. **Orbiting fauna**: retarget the existing `.bee--cta` waypoints so the bee's loop passes in front of the island (lower third) and behind the sun glow; `.cta__bfly` keeps its arc but its resting waypoint lands on the island's flower crown for ~2s per cycle. Reuse the existing `bfly-fly`/`bee-fly` keyframe technique (transform-only, negative-x rule for right-anchored critters). No new components.
2. **Pollen fall**: 8 tiny drifting motes (4px radial-gradient dots, `rgba(227,169,60,.5)` honey) falling from the island's underside into the footer video, staggered 6–11s linear loops, index-seeded positions (no `Math.random` — project convention). They cross the section seam, which is the point. Hidden < 760px and under `REDUCE`.
3. **Parallax settle**: on scroll into view, the island rises 24px and its shadow contracts (`.rev`-style IO trigger, one-shot, 900ms clay easing) — it "arrives" as you reach the end of the page. Under `REDUCE`, render in final position.
4. **Sun backlight** (already specced above): the repositioned `sun-breathe` glow rims the island every 9s.

Nothing else. No sparkles, no floating text, no extra critters.

## Responsive behavior

| Breakpoint | Changes |
|---|---|
| Desktop (>1024px) | Island width `clamp(420px, 44vw, 640px)`, centered; overlap `-16vh`. |
| Tablet (760–1024px) | Width `min(72vw, 520px)`; overlap `-12vh`; pollen count 8→5. |
| Mobile (<760px) | Width `88vw`; height `clamp(200px, 26vh, 300px)`; overlap `-10vh`; pollen + orbit retargets off (existing critters keep their current mobile rules); hint copy shortens to "drag to turn". Verify against the footer bar (241px tall on mobile) — island must clear it. |
| Short viewports (<700px tall) | Island `max-height:24vh`; if the CTA exceeds 100svh, the island is the element that shrinks (flex-shrink stays 0 — shrink via the clamp, not flex-crush, or the canvas letterboxes). |

## Edge cases

- **Empty/loading**: poster frame is always available synchronously (it ships in the same chunk) — there is no skeleton state.
- **Hidden tab / throttled rAF**: inertia and auto-spin compute from `performance.now()` deltas; a tab returning from background must not "jump" — cap any single frame delta at 64ms.
- **Double input**: ignore new pointers while one is captured (first-pointer-wins; no two-finger rotate).
- **Session with hint dismissed**: hint never reappears (sessionStorage, not localStorage — next visit gets it again).
- **`ISLE_ENABLED = false`**: CTA renders exactly as today (spacing changes are inside a `.cta--isle` modifier class applied only when enabled).
- **Concurrent-session hazard** (project-specific): another session has repeatedly stripped App.tsx wiring on this tree. Keep all island CSS in one clearly-fenced block (`/* ---- islet ---- */`) and re-check `grep -c 'ISLE_ENABLED' src/App.tsx` plus the Pip/CompanionSky greps before any publish. Check `ls "Desktop/Shrubby Site Backup"` mtimes + the artifact version picker first.

## Animation / motion

| Element | Trigger | Animation | Duration | Easing |
|---|---|---|---|---|
| `.isle` | Ambient | Bob: `translateY(0 → -10px → 0)` | 6.5s loop | ease-in-out (reuse `ask-float` values) |
| `.isle__shadow` | Synced to bob | `scale(1 → .93 → 1)`, `opacity(.32 → .24 → .32)` | 6.5s loop | ease-in-out |
| Canvas rotation | Ambient idle | +4°/s auto-spin | continuous | linear |
| Canvas rotation | Drag release | Inertia decay ×0.94/frame → settle +~2° overshoot | velocity-dependent + 350ms settle | linear decay, then `cubic-bezier(.34,1.56,.64,1)` |
| `.isle` | Enters viewport (IO ≥ .35, one-shot) | rise 24px + shadow contract | 900ms | `cubic-bezier(.34,1.56,.64,1)` |
| `.isle__hint` | First hover | fade + 4px rise in; fade out on first drag | 300ms / 200ms | ease-out |
| Pollen motes | Ambient | fall + drift across the seam | 6–11s staggered | linear |
| All of the above except drag/keys | `prefers-reduced-motion` | disabled; final poses rendered | — | — |

## Accessibility

- Wrapper is focusable (`tabindex=0`) with `role="slider"`, `aria-label="Rotate the floating island"`, `aria-valuemin=0`, `aria-valuemax=359`, `aria-valuenow` = current degrees, `aria-valuetext="Island rotated 135 degrees"`. Update at most every 45° while spinning (don't flood the live region).
- Focus order: CTA button → trust chips (not focusable, skip) → island → footer links → Pip. The island must not trap focus; Esc does nothing (nothing to dismiss).
- Arrow keys as specced; Home/End optional (0°/180°) — nice-to-have.
- The canvas itself is `aria-hidden`; the wrapper carries all semantics. Decorative layers (`.isle__shadow`, pollen, hint) are `aria-hidden` / `pointer-events:none`.
- Contrast: hint label `--lime-ink` on paper ≥ 7:1. Focus ring matches Pip's (3px `--leaf`, offset 6px).

## QA notes (this project's harness)

- Hidden preview tab: rAF never fires and IO never triggers — drive with `__isle.set(deg)` and screenshot at scrollY=0 only (QA lower sections by `display:none`-ing prior ones; scrolled screenshots render blank in this harness).
- React state doesn't flush within one eval — query DOM in a second eval or `setTimeout`.
- Verify after build: all 7 sections 100.0svh at 1280×800; no overflow-x; bundle size delta ≈ frame payload (a silently-smaller bundle means a slice replace ate a component — count `data:image/webp` occurrences); Pip greps pass; footer `CrossfadeLoop` still 2 videos, dur 10.01.
- Never run a 30s polling eval (kills the tab). One eval with internal `setTimeout` beats racing across evals.
