/* 'The Making' page — pulled from the public bundle 2026-07-11 per giba.
 * Kept here (unimported) so it can be restored by pasting back into App.tsx
 * and re-adding the '#/guide' route, nav link, and footer link. */
/* ---------------- guide route ---------------- */

const SWATCHES: Array<[string, string]> = [
  ['#6E8649', 'Reseda'], ['#477023', 'Fern'], ['#2D531A', 'Dark Moss'],
  ['#0D330E', 'Pakistan'], ['#071E07', 'Dark Green'], ['#EAEF9D', 'Bud'], ['#C8875F', 'Terracotta'],
]

function Guide() {
  return (
    <main className="guide">
      <div className="wrap">
        <span className="chip chip--forest rev"><span className="dot" />The making — a studio colophon</span>
        <h1 className="guide__title rev" data-d="1">How Shrubby<br />was grown.</h1>
        <p className="guide__lead rev" data-d="2">
          The honest record of how this site was designed and built — the tools, the source material,
          and the visual techniques. No black boxes.
        </p>
        <div className="guide__steps">
          <div className="gstep rev">
            <div className="gstep__num">01</div>
            <div>
              <h3>A living stage</h3>
              <p>
                The hero is a filmed stage: a mossy stone podium in a wildflower thicket, looping gently,
                with the ask box floating just above the rock — casting its own soft shadow onto it.
                Below, every section rests on the same warm paper as the Shrubby dashboard — soft
                daylight washes over clay-white — and the flower-field painting rises again as the footer.
              </p>
              <div className="gswatches">
                {SWATCHES.map(([hex, name]) => (
                  <div className="gsw" style={{ background: hex }} key={hex}><span>{name}</span></div>
                ))}
              </div>
            </div>
          </div>
          <div className="gstep rev">
            <div className="gstep__num">02</div>
            <div>
              <h3>The character, given a stage</h3>
              <p>
                Shrubby stars in its own looping film — standing on the same stone that carries the hero —
                inside a liquid-glass frame that tilts with your cursor, catches a moving glare, and answers
                with a word when you tap it. It dozes again under the fireflies after dark. Everything is
                embedded as data URIs, so the site remains one self-contained file.
              </p>
              <div className="gstep__tags">
                <span className="gtag">Clay 3D render</span>
                <span className="gtag">Transparent PNG</span>
                <span className="gtag gtag--warm">Single-file build</span>
              </div>
            </div>
          </div>
          <div className="gstep rev">
            <div className="gstep__num">03</div>
            <div>
              <h3>Built like an app</h3>
              <p>
                React + TypeScript, compiled with Vite and bundled by Parcel into a single HTML artifact.
                Sections are components; the reveal system is one <code>IntersectionObserver</code> hook;
                routing is a tiny hash router (<code>#/</code> and <code>#/guide</code> — this page).
              </p>
              <div className="gstep__tags">
                <span className="gtag">React 18</span><span className="gtag">TypeScript</span>
                <span className="gtag">Vite + Parcel</span><span className="gtag gtag--warm">Runs from one file</span>
              </div>
            </div>
          </div>
          <div className="gstep rev">
            <div className="gstep__num">04</div>
            <div>
              <h3>Drawn, not stocked</h3>
              <p>
                Every species in the almanac is real photography — Wikimedia Commons plates, normalized
                to one field-report format and embedded whole. The night sky's fireflies are a Canvas
                particle system, both card collections ride swipe-first frost carousels, and the footer
                meadow moves in a hand-tuned breeze.
              </p>
              <div className="gstep__tags">
                <span className="gtag">Hand-drawn SVG botanicals</span>
                <span className="gtag">Canvas fireflies</span>
                <span className="gtag gtag--warm">Native Canadian plants</span>
              </div>
            </div>
          </div>
          <div className="gstep rev">
            <div className="gstep__num">05</div>
            <div>
              <h3>Type &amp; motion, with restraint</h3>
              <p>
                Bricolage Grotesque carries the display voice at poster sizes — quirky and hand-shaped, like the mascot; Figtree does the quiet reading work. Both are
                embedded as font files — no CDN, no fallback flash. The headline rises letter-by-letter,
                headline words squash like clay and sprout leaves under your cursor, and a little clay
                sprout in the corner grows as you read — tap it to ride back to the top. Every animation
                honours <code>prefers-reduced-motion</code>.
              </p>
              <div className="gstep__tags">
                <span className="gtag">Bricolage Grotesque 200–800</span><span className="gtag">Figtree 300–700</span>
                <span className="gtag">Sprout compass</span>
                <span className="gtag gtag--warm">Reduced-motion safe</span>
              </div>
            </div>
          </div>
        </div>
        <div style={{ marginTop: 54 }} className="rev">
          <a className="btn-ink" href="#/" style={{ textDecoration: 'none' }}>
            <Leaf size={20} /> Back to the garden
          </a>
        </div>
      </div>
    </main>
  )
}

