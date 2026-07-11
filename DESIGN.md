# Shrubby — Design System
*The AI garden companion. One memorable thing: a clay creature you can actually talk to.*

## Voice & Type
- **Display: Bricolage Grotesque** (variable 200–800, embedded data-URI). Quirky organic grotesk — hand-shaped like the mascot. Used for: wordmark, section headings, buttons, chips, stats. Poster tracking −0.035em; never exceed weight 800.
- **Body: Figtree** (300–700, embedded). All reading text at .95rem token; ledes up to 1.12rem.
- Type tokens: `--fs-display` (wordmark), `--fs-h2` (all section h2s — companion/almanac/night share it), `--fs-card-title` 1.5rem, `--fs-body` .95rem.

## Palette — Clay & Glass kit (authoritative: Desktop/shrubby-redesign.html)
- Bark `#33512C` (dark grounds) · deepest `#22371D` · ink-leaf `#4A7539`
- Leaf `#6FA14E` (primary action) · leaf-deep `#55823A` · sprout `#9FC47E` · bud `#CDE4AC`
- Paper `#F7F7F1` · pale cards `#EEF2E2` / `#E3EDD7`
- CTA register: sprout-pale `#CFE4AF` → `#B9D690` (ink = bark)
- The pot: terracotta `#C4744A` / `#A85A34` · chat bubble `#4B96E0`
- Text ink `#3A4A34` · muted `#75816A` · on-dark `#F0F4E7`
The landing site and the product dashboard share these tokens exactly — change them in both places or not at all.

## Section journey (gradients, never solid seams)
Every band's last gradient stop = next band's first stop. Order: garden film hero → forest-900 companion → forest-700 practice → sage almanac → forest-950 night → **dawn-break into honeydew CTA** → meadow film footer (100svh, full-bleed cream bar). All sections min-height 100svh, band padding 7vh.

## Material
Liquid glass via `--bfN` custom-property blur tokens ONLY (minifiers strip filter-list spaces — never inline `backdrop-filter` values). Frost cards: milky white on dark grounds, ink text. Botany-glass plant cards: photo fills card, green glass panel, white text, bud latin names.

## Motion
- Films at 0.75 playbackRate, pose-matched loop cuts (scan each new clip for the frame closest to frame 0; short smoothstep crossfade).
- Hero: pointer parallax + scroll push-in on `#heroVidLayer`; ask console + mascot flow away on scroll.
- Reveals: IntersectionObserver `.rev` (+`.rev--tilt` on cards), clay squash-stretch on interactions, carousel coverflow (spread 82 plants / 108 night, dash indicators w/ 24px hit areas).
- Everything honours `prefers-reduced-motion`.

## Components
Soft ask console (`.ask2`, white layered, embossed squircles), clay carousels, sprout back-to-top (pot→sprout→leaves→mascot by scroll depth, appears past 0.7vh), auto-hiding dark pill nav.

## Rules
1. New videos: compress with `avconvert` only if it shrinks them; always pose-scan for loop cuts.
2. New photos: 760×570 cover-crop, dimension-aware two-pass sips.
3. All assets embed as data URIs — the site is one self-contained file, no external requests.
4. Verify by computed style + measured rects, never screenshots alone.
