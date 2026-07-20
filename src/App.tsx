import React, { useEffect, useRef, useState, useCallback } from 'react'
import { flushSync } from 'react-dom'
import {
  Camera, BookOpen, BellRing, Droplets, Sun, Plus,
  Sparkles, MessageCircle, MapPin, CalendarHeart, Leaf, ArrowRight, ArrowUpRight,
  Moon, CloudRain, Mic, Send, ArrowUp,
  Search, X, ShieldCheck, Snowflake, Sprout, Heart, Download, Share2,
  Home, CalendarDays, LogOut, Flame, Check,
} from 'lucide-react'
import { FIELD_JPG, SHRUB_MP4, FIELD_MP4, HERO2_MP4, HERO2_JPG, CLOUDS_MP4, CLOUDS_JPG } from './media'
import { PHOTO_DAYLILY, PHOTO_FERN, PHOTO_SUSAN, PHOTO_COLUMBINE, PHOTO_CONEFLOWER, PHOTO_SERVICEBERRY } from './photos'
import { CompanionSky } from './companion-sky'
import { DASH_HTML } from './dashboard'
import { MASCOT_PNG } from './brand'
import { SPECIES } from './library-data'

/* ---------------- helpers ---------------- */

const REDUCE = typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

/** Scroll-reveal: adds .in when .rev elements enter the viewport */
function useReveal(deps: unknown[] = []) {
  useEffect(() => {
    const els = Array.from(document.querySelectorAll('.rev:not(.in)'))
    if (REDUCE) { els.forEach(el => el.classList.add('in')); return }
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target) }
      })
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' })
    els.forEach(el => io.observe(el))
    return () => io.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}

/** Autoplaying looped video that retries on first pointer gesture (iframe autoplay policy) */
function AmbientVideo({ src, poster, className, rate = 0.75 }: { src: string; poster?: string; className?: string; rate?: number }) {
  const ref = useRef<HTMLVideoElement>(null)
  useEffect(() => {
    const v = ref.current
    if (!v) return
    if (REDUCE) { v.pause(); return }
    const tryPlay = () => { v.playbackRate = rate; v.play().catch(() => {}) }
    tryPlay()
    v.addEventListener('loadeddata', tryPlay)
    window.addEventListener('pointerdown', tryPlay, { once: true })
    return () => {
      v.removeEventListener('loadeddata', tryPlay)
      window.removeEventListener('pointerdown', tryPlay)
    }
  }, [])
  return (
    <video
      ref={ref} className={className} src={src} poster={poster}
      muted loop playsInline autoPlay preload="auto"
      aria-hidden="true"
    />
  )
}

/** Back to top — quiet glass button, same language as the cards */
function TopButton() {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const on = () => setVisible(window.scrollY > window.innerHeight * 0.7)
    on()
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])
  return (
    <button
      className={`sprout-top${visible ? ' show' : ''}`}
      onClick={() => window.scrollTo({ top: 0, behavior: REDUCE ? 'auto' : 'smooth' })}
      aria-label="Back to top"
      tabIndex={visible ? 0 : -1}
    >
      <ArrowUp size={22} strokeWidth={2.4} />
    </button>
  )
}

/* ---------------- floating zigzag deck ----------------
 * Two rolls of small closed cards, column-staggered into a zigzag. The
 * night deck keeps its idle bob + pointer-camera parallax; `still` decks
 * (the plant plates) are fully static per design. */

const DECK_DEPTHS = [0.9, 0.45, 0.7, 0.55, 1, 0.6]

function FloatDeck({ items, className, ariaLabel, still }: {
  items: React.ReactNode[]; className?: string; ariaLabel: string; still?: boolean
}) {
  const ref = useRef<HTMLUListElement>(null)
  const move = (e: React.PointerEvent) => {
    if (still || REDUCE || e.pointerType !== 'mouse') return
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    el.style.setProperty('--px', (((e.clientX - r.left) / r.width - 0.5) * 2).toFixed(3))
    el.style.setProperty('--py', (((e.clientY - r.top) / r.height - 0.5) * 2).toFixed(3))
  }
  const leave = () => {
    const el = ref.current
    if (!el) return
    el.style.setProperty('--px', '0')
    el.style.setProperty('--py', '0')
  }
  return (
    <ul
      className={`deck ${still ? 'deck--still ' : ''}${className ?? ''}`} aria-label={ariaLabel} ref={ref}
      onPointerMove={move} onPointerLeave={leave}
    >
      {items.map((c, i) => (
        <li
          className="deck__cell"
          style={{ '--i': i, '--z': DECK_DEPTHS[i % DECK_DEPTHS.length] } as React.CSSProperties}
          key={i}
        >
          <div className="deck__bob">{c}</div>
        </li>
      ))}
    </ul>
  )
}

/* ---------------- clay text play ---------------- */

/** Words that squash-and-stretch like clay on hover, sprouting a tiny leaf */
function SproutWords({ lines }: { lines: string[] }) {
  return (
    <>
      {lines.map((line, li) => (
        <span key={li}>
          {li > 0 && <br />}
          {line.split(' ').map((w, wi) => (
            <React.Fragment key={wi}>
              {wi > 0 && ' '}
              <span className="sw" tabIndex={-1}>
                <svg className="sw__leaf" viewBox="0 0 20 20" aria-hidden="true">
                  <path d="M10 18 C9 12 9 8 10 4" stroke="#4E7D35" strokeWidth="1.6" fill="none" strokeLinecap="round" />
                  <path d="M10 9 C5 8 3 5 3 1.5 C8 2 10 5 10 9Z" fill="#6FA14E" />
                  <path d="M10 7 C14 6 16 3.4 16 .8 C11.6 1.4 10 4 10 7Z" fill="#8FBE6E" />
                </svg>
                {w}
              </span>
            </React.Fragment>
          ))}
        </span>
      ))}
    </>
  )
}

/** Keyword in card copy — touching it wakes the card's icon */
function Kw({ children }: { children: React.ReactNode }) {
  return <em className="kw">{children}</em>
}

/** Film on a seamless loop — the clip's tail crossfades into its head */
function CrossfadeLoop({ className, src, poster, end = 9.5, fade = 1.2, rate = 0.75 }: {
  className?: string; src: string; poster?: string; end?: number; fade?: number; rate?: number
}) {
  const aRef = useRef<HTMLVideoElement>(null)
  const bRef = useRef<HTMLVideoElement>(null)
  useEffect(() => {
    const A = aRef.current, B = bRef.current
    if (!A || !B) return
    const END = end, FADE = fade
    let act = A, sby = B, raf = 0
    const tryPlay = (v: HTMLVideoElement) => { v.playbackRate = rate; v.play().catch(() => {}) }
    if (REDUCE) {
      const still = () => { A.currentTime = 2.6; A.pause() }
      A.addEventListener('loadeddata', still, { once: true })
      A.style.opacity = '1'; B.style.opacity = '0'
      return
    }
    A.style.opacity = '1'; A.style.zIndex = '1'
    B.style.opacity = '0'; B.style.zIndex = '2'
    tryPlay(A)
    const onGesture = () => tryPlay(act)
    window.addEventListener('pointerdown', onGesture)
    const guard = (e: Event) => {
      const v = e.target as HTMLVideoElement
      if (!v.paused && v.currentTime > END + 0.3) v.currentTime = 0
    }
    A.addEventListener('timeupdate', guard)
    B.addEventListener('timeupdate', guard)
    const tick = () => {
      const t = act.currentTime
      if (t >= END - FADE) {
        if (sby.paused) { sby.currentTime = 0; tryPlay(sby) }
        const k = Math.min(1, (t - (END - FADE)) / FADE)
        sby.style.opacity = String(k * k * (3 - 2 * k))
        if (k >= 1 || t >= END) {
          act.pause(); act.style.opacity = '0'
          const tmp = act; act = sby; sby = tmp
          act.style.zIndex = '1'; act.style.opacity = '1'
          sby.style.zIndex = '2'; sby.style.opacity = '0'
        }
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('pointerdown', onGesture)
      A.removeEventListener('timeupdate', guard)
      B.removeEventListener('timeupdate', guard)
    }
  }, [end, fade, rate])
  return (
    <>
      <video ref={aRef} className={className} src={src} poster={poster} muted playsInline autoPlay preload="auto" aria-hidden="true" />
      <video ref={bRef} className={className} src={src} muted playsInline preload="auto" aria-hidden="true" />
    </>
  )
}

/* ---------------- floating meadow graphics ---------------- */

/** Soft clouds drifting across a section */
function Clouds({ n = 3, seed = 0 }: { n?: number; seed?: number }) {
  return (
    <div className="clouds" aria-hidden="true">
      {Array.from({ length: n }, (_, i) => {
        const k = (i * 37 + seed * 17) % 100
        return (
          <div
            key={i}
            className="cloud"
            style={{
              top: `${7 + (k % 3) * 13 + i * 11}%`,
              width: `${170 + (k % 45) * 2}px`,
              animationDuration: `${85 + k}s`,
              animationDelay: `${-(k * 1.3)}s`,
            }}
          />
        )
      })}
    </div>
  )
}

/** A clay butterfly with flapping wings */
function Butterfly({ className }: { className?: string }) {
  return (
    <svg className={`bfly ${className ?? ''}`} viewBox="0 0 40 30" aria-hidden="true">
      <g className="bfly__wl"><ellipse cx="14" cy="13" rx="9.5" ry="7.5" fill="#C4744A" opacity=".9" /></g>
      <g className="bfly__wr"><ellipse cx="26" cy="13" rx="9.5" ry="7.5" fill="#C4744A" opacity=".9" /></g>
      <rect x="18.8" y="6.5" width="2.4" height="14" rx="1.2" fill="#33512C" />
    </svg>
  )
}

/** A round clay bee with buzzing wings */
function Bee({ className }: { className?: string }) {
  return (
    <svg className={`bee ${className ?? ''}`} viewBox="0 0 34 30" aria-hidden="true">
      <g className="bee__wl"><ellipse cx="11.5" cy="8" rx="6" ry="4.4" fill="#FFFFFF" opacity=".82" /></g>
      <g className="bee__wr"><ellipse cx="22.5" cy="8" rx="6" ry="4.4" fill="#FFFFFF" opacity=".82" /></g>
      <clipPath id="beebody"><ellipse cx="17" cy="17.5" rx="10" ry="7.6" /></clipPath>
      <ellipse cx="17" cy="17.5" rx="10" ry="7.6" fill="#E3A93C" />
      <g clipPath="url(#beebody)">
        <rect x="11.6" y="8" width="3.4" height="20" rx="1.7" fill="#33512C" />
        <rect x="18.8" y="8" width="3.4" height="20" rx="1.7" fill="#33512C" />
      </g>
    </svg>
  )
}

/** A clay ladybug */
function Ladybug({ className }: { className?: string }) {
  return (
    <svg className={`lbug ${className ?? ''}`} viewBox="0 0 30 32" aria-hidden="true">
      <circle cx="15" cy="8" r="4.4" fill="#22371D" />
      <ellipse cx="15" cy="18" rx="10" ry="9.4" fill="#B9502F" />
      <rect x="14.2" y="9" width="1.6" height="18.4" rx=".8" fill="#22371D" />
      <circle cx="10.2" cy="14.5" r="1.7" fill="#22371D" />
      <circle cx="19.8" cy="14.5" r="1.7" fill="#22371D" />
      <circle cx="9.6" cy="21.5" r="1.7" fill="#22371D" />
      <circle cx="20.4" cy="21.5" r="1.7" fill="#22371D" />
    </svg>
  )
}

/* ---------------- fireflies canvas ---------------- */

function Fireflies() {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const cv = ref.current
    if (!cv || REDUCE) return
    const ctx = cv.getContext('2d')
    if (!ctx) return
    let raf = 0
    const dpr = Math.min(window.devicePixelRatio || 1, 2)

    type P = { x: number; y: number; r: number; vx: number; vy: number; tw: number; leaf: boolean; rot: number; vr: number }
    let parts: P[] = []

    const seed = () => {
      const n = Math.min(60, Math.round(cv.width / 30))
      parts = Array.from({ length: n }, (_, i) => ({
        x: Math.random() * cv.width,
        y: Math.random() * cv.height,
        r: (Math.random() * 2.4 + 0.8) * dpr,
        vx: (Math.random() * 0.4 - 0.2) * dpr,
        vy: (Math.random() * 0.35 - 0.05) * dpr,
        tw: Math.random() * Math.PI * 2,
        leaf: i % 6 === 0,
        rot: Math.random() * Math.PI * 2,
        vr: (Math.random() - 0.5) * 0.01,
      }))
    }
    const size = () => {
      const rect = cv.getBoundingClientRect()
      cv.width = rect.width * dpr
      cv.height = rect.height * dpr
      seed()
    }
    const leafShape = (p: P) => {
      ctx.save()
      ctx.translate(p.x, p.y)
      ctx.rotate(p.rot)
      const s = p.r * 4
      ctx.beginPath()
      ctx.moveTo(0, -s)
      ctx.quadraticCurveTo(s, 0, 0, s)
      ctx.quadraticCurveTo(-s, 0, 0, -s)
      ctx.fillStyle = 'rgba(111,161,78,.28)'
      ctx.fill()
      ctx.restore()
    }
    const tick = () => {
      ctx.clearRect(0, 0, cv.width, cv.height)
      for (const p of parts) {
        p.x += p.vx + Math.sin(p.tw) * 0.14 * dpr
        p.y += p.vy
        p.tw += 0.012
        p.rot += p.vr
        if (p.y > cv.height + 12) { p.y = -12; p.x = Math.random() * cv.width }
        if (p.y < -12) { p.y = cv.height + 12 }
        if (p.x > cv.width + 12) p.x = -12
        if (p.x < -12) p.x = cv.width + 12
        if (p.leaf) { leafShape(p); continue }
        const glow = 0.35 + Math.abs(Math.sin(p.tw * 1.8)) * 0.5
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(85,130,58,${glow * 0.5})`
        ctx.shadowColor = 'rgba(111,161,78,.45)'
        ctx.shadowBlur = 8 * dpr
        ctx.fill()
        ctx.shadowBlur = 0
      }
      raf = requestAnimationFrame(tick)
    }
    size()
    tick()
    window.addEventListener('resize', size)
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', size) }
  }, [])
  return <canvas ref={ref} className="night__canvas" aria-hidden="true" />
}

/* ---------------- ask loop: question typed, answer in the blue bubble ---------------- */

const DEMO_QA: Array<{ q: string; a: string }> = [
  { q: 'When can I plant outside?', a: 'After the May two-four' },
  { q: 'Best tree for fall colour?', a: 'Sugar maple. Not close' },
  { q: 'Hydrangeas in zone 3?', a: '‘Annabelle’ — prairie tough' },
  { q: 'How do I get monarchs?', a: 'Swamp milkweed, skip the spray' },
  { q: 'Natives for shade?', a: 'Wild Ginger and Foamflower' },
  { q: 'Plants for rainy Vancouver?', a: 'Sword ferns love the drizzle' },
  { q: 'Toughest prairie perennial?', a: 'Daylilies. Nearly unkillable' },
]

function useAskLoop() {
  const [q, setQ] = useState('')
  const [answer, setAnswer] = useState<string | null>(null)
  const skipRef = useRef<(() => void) | null>(null)
  const fastRef = useRef(false)
  const waitTimer = useRef<number | undefined>(undefined)
  useEffect(() => {
    if (REDUCE) { setQ(DEMO_QA[0].q); setAnswer(DEMO_QA[0].a); return }
    let alive = true
    const wait = (ms: number) => new Promise<void>(r => {
      const t = window.setTimeout(done, ms)
      waitTimer.current = t
      function done() {
        clearTimeout(t)
        if (skipRef.current === done) skipRef.current = null
        r()
      }
      skipRef.current = done
    })
    ;(async () => {
      let idx = 0
      while (alive) {
        const { q: question, a: reply } = DEMO_QA[idx % DEMO_QA.length]
        fastRef.current = false
        for (let i = 1; i <= question.length && alive; i++) {
          if (fastRef.current) { setQ(question); break }
          setQ(question.slice(0, i)); await wait(42 + Math.random() * 46)
        }
        await wait(fastRef.current ? 220 : 500)
        if (!alive) break
        setAnswer(reply)
        await wait(3600) /* a tap cuts this short */
        setAnswer(null)
        await wait(300)
        for (let i = question.length; i >= 0 && alive; i--) {
          if (fastRef.current) { setQ(''); break }
          setQ(question.slice(0, i)); await wait(20)
        }
        await wait(fastRef.current ? 160 : 420)
        idx++
      }
    })()
    return () => { alive = false; clearTimeout(waitTimer.current); skipRef.current = null }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return { q, answer }
}

/* ---------------- Shrubby's brain — the real ask engine ----------------
 * The artifact host blocks every network request, so this is a fully local
 * search engine: keyword-scored entries, prefix-boundary matching, ranked
 * suggestions. Small, honest, Canadian. */

type BrainEntry = { q: string; keys: string[]; a: string }

/* Answers are written to fit ONE bubble line (~45 chars) — Shrubby stays visible. */
const BRAIN: BrainEntry[] = [
  { q: 'When should I plant tomatoes?', keys: ['tomato'],
    a: 'Start inside April, out after last frost.' },
  { q: 'When is it safe to plant outside?', keys: ['when plant', 'plant outside', 'last frost', 'safe to plant', 'may long', 'planting time'],
    a: 'After the May long weekend, coast to coast.' },
  { q: 'What zone am I in?', keys: ['zone', 'hardiness'],
    a: 'Zones 0–9. Victoria 9, Winnipeg 3. Your city?' },
  { q: 'What grows in shade?', keys: ['shade', 'shady', 'north side', 'dark corner'],
    a: 'Wild Ginger, Foamflower, Ostrich Fern' },
  { q: 'How do I attract monarchs?', keys: ['monarch', 'butterfly', 'butterflies', 'milkweed'],
    a: 'Swamp milkweed, skip the spray' },
  { q: 'How do I help the bees?', keys: ['bee', 'pollinator'],
    a: 'Coneflower, bee balm, asters — natives' },
  { q: 'Best tree for fall colour?', keys: ['fall', 'autumn', 'maple'],
    a: 'Sugar maple. It’s on the flag' },
  { q: 'Why are the leaves turning yellow?', keys: ['yellow'],
    a: 'Kindness overdone — ease off the water.' },
  { q: 'Why is my plant drooping?', keys: ['droop', 'wilt', 'sad', 'floppy'],
    a: 'Let the top inch dry, then water deep.' },
  { q: 'How often should I water?', keys: ['water', 'how often'],
    a: 'Deep and rarely — once a week, at roots.' },
  { q: 'When should I fertilize?', keys: ['fertiliz', 'feed', 'fertilis'],
    a: 'Feed through spring, stop by late summer.' },
  { q: 'When do I prune?', keys: ['prune', 'pruning', 'trim'],
    a: 'Right after bloom — or in late winter.' },
  { q: 'Do I need mulch?', keys: ['mulch'],
    a: '5–8 cm of bark, kept off the stems.' },
  { q: 'Something is eating my hostas!', keys: ['hosta', 'slug', 'holes in the leaves', 'eating my'],
    a: 'Slugs. Beer traps and copper tape.' },
  { q: 'How do I deal with aphids?', keys: ['aphid', 'bugs on'],
    a: 'Hose blast, then ladybugs finish the job.' },
  { q: 'What do deer leave alone?', keys: ['deer'],
    a: 'Daffodils, lavender, sage. Never tulips.' },
  { q: 'Is it safe for my dog?', keys: ['dog', 'cat', 'pet', 'toxic', 'poison'],
    a: 'Serviceberry is safe. Lilies aren’t — cats!' },
  { q: 'Will hydrangeas survive here?', keys: ['hydrangea', 'annabelle'],
    a: '‘Annabelle’ shrugs at zone 3' },
  { q: 'Frost tonight — what do I do?', keys: ['frost', 'freez', 'cold snap'],
    a: 'Bedsheets tonight, off at dawn. No plastic.' },
  { q: 'How do I winterize the garden?', keys: ['winter', 'overwinter'],
    a: 'Mulch after freeze-up; leave the seed heads.' },
  { q: 'What natives should I plant?', keys: ['native', 'indigenous'],
    a: 'Coneflower, columbine, serviceberry, ginger.' },
  { q: 'A tree for a small yard?', keys: ['small tree', 'small yard', 'front yard'],
    a: 'Serviceberry — four seasons, one small tree.' },
  { q: 'Best plant for a beginner?', keys: ['beginner', 'easy', 'first plant', 'unkillable', 'low maintenance'],
    a: 'Stella d’Oro daylily. Nearly unkillable.' },
  { q: 'What grows on a balcony?', keys: ['balcony', 'container', 'pot', 'condo', 'patio'],
    a: 'Daylilies, herbs, coneflower — in pots.' },
  { q: 'How do I invite hummingbirds?', keys: ['hummingbird', 'columbine'],
    a: 'Wild columbine — built for their beaks.' },
  { q: 'My basil is struggling.', keys: ['basil', 'herb'],
    a: 'Warmth plus a weekly pinch of the tops.' },
  { q: 'My lawn is a mess.', keys: ['lawn', 'grass'],
    a: 'Overseed white clover — feeds the bees.' },
  { q: 'How do I start compost?', keys: ['compost'],
    a: 'Browns + greens, turned monthly. Black gold.' },
  { q: 'What soil for a raised bed?', keys: ['raised bed', 'soil mix', 'what soil'],
    a: 'Thirds: topsoil, compost, coir.' },
  { q: 'What thrives on the wet coast?', keys: ['vancouver', 'victoria', 'rainy', 'wet coast', 'bc '],
    a: 'Sword ferns, salal, huckleberry' },
  { q: 'What survives the prairies?', keys: ['prairie', 'winnipeg', 'saskat', 'regina', 'manitoba', 'alberta', 'edmonton', 'calgary'],
    a: 'Daylily, coneflower, Karl Foerster grass.' },
  { q: 'Who are you?', keys: ['who are you', 'what are you', 'shrubby'],
    a: 'A little green heart with serious botany' },
  { q: 'Say hi', keys: ['hello', 'hi', 'hey', 'bonjour'],
    a: 'Hello! Ask me anything green.' },
  { q: 'Thanks, Shrubby', keys: ['thank', 'merci'],
    a: 'Anytime — that’s what garden friends do' },
]

const BRAIN_FALLBACKS = [
  'Outside my pot! Try natives or plant care.',
  'Ask me zones, natives, or a plant rescue.',
  'Try “what grows in shade?”',
]

const brainNorm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')

/* prefix-boundary match: "water" hits "watering", "hi" doesn't hit "this" */
function brainScore(nq: string, e: BrainEntry): number {
  let s = 0
  for (const k of e.keys) {
    const nk = brainNorm(k)
    const re = new RegExp(`(^|[^a-z])${nk.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`)
    if (re.test(nq)) s += nk.length
  }
  return s
}

/* When the ask names a species, answer straight from the baked Base44 library
 * (light + safety, one bubble line). Runs after the curated BRAIN so hand-written
 * garden advice still wins for the questions it covers. */
function speciesAnswer(nq: string): string | null {
  let best: typeof SPECIES[number] | null = null
  for (const s of SPECIES) {
    const name = s.name.toLowerCase()
    const latin = s.latin.toLowerCase()
    const hit =
      (name.length >= 4 && nq.includes(name)) ||
      (latin.length >= 5 && nq.includes(latin)) ||
      (nq.length >= 4 && name.includes(nq))
    if (hit && (!best || s.name.length > best.name.length)) best = s
  }
  if (!best) return null
  const light = best.light.replace(/[.\s]+$/, '')
  return `${best.name} — ${light}, ${best.toxShort.toLowerCase()}.`
}

function answerQuery(raw: string, fbCounter: { current: number }): string {
  const nq = brainNorm(raw)
  let best: BrainEntry | null = null
  let bs = 0
  for (const e of BRAIN) {
    const s = brainScore(nq, e)
    if (s > bs) { bs = s; best = e }
  }
  if (best) return best.a
  const species = speciesAnswer(nq)
  if (species) return species
  return BRAIN_FALLBACKS[fbCounter.current++ % BRAIN_FALLBACKS.length]
}

/* ---------------- sections ---------------- */

function Nav({ route }: { route: string }) {
  const [hidden, setHidden] = useState(false)
  const lastY = useRef(0)
  useEffect(() => {
    const on = () => {
      const y = window.scrollY
      if (y > lastY.current + 6 && y > 140) setHidden(true)
      else if (y < lastY.current - 6 || y < 140) setHidden(false)
      lastY.current = y
    }
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])
  const goHomeSection = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault()
    if (route !== 'home') { window.location.hash = '#/' }
    requestAnimationFrame(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: REDUCE ? 'auto' : 'smooth' })
    })
  }
  return (
    <nav className={`nav${hidden ? ' nav--hidden' : ''}`} aria-label="Primary">
      <div className="nav__pill">
        <a className="nav__brand" href="#/" aria-label="Shrubby home">Shrubby</a>
        <a className="nav__link" data-sec href="#practice" onClick={goHomeSection('practice')}>Practice</a>
        <a className="nav__link" data-sec href="#almanac" onClick={goHomeSection('almanac')}>Almanac</a>
        <a className={`nav__link ${route === 'library' ? 'is-on' : ''}`} href="#/library">Library</a>
        <a className={`nav__link ${route === 'app' ? 'is-on' : ''}`} href="#/app">The App</a>
        <button
          className="nav__cta"
          onClick={() => {
            window.location.hash = '#/'
            requestAnimationFrame(() => document.getElementById('ask')?.focus())
          }}
        >
          Ask Shrubby
        </button>
      </div>
    </nav>
  )
}

function Hero() {
  const [reply, setReply] = useState<string | null>(null)
  const fbCounter = useRef(0)
  const onAsk = (e: React.FormEvent) => {
    e.preventDefault()
    const inp = document.getElementById('ask') as HTMLInputElement | null
    const text = (inp?.value ?? '').trim()
    if (!text) return
    /* same engine as the mascot box: BRAIN entries, then the 956-species library */
    setReply(answerQuery(text, fbCounter))
    if (inp) inp.value = ''
  }
  useEffect(() => {
    if (REDUCE) return
    let raf = 0
    const px = { x: 0, y: 0 }
    const apply = () => {
      raf = 0
      const y = window.scrollY, vh = window.innerHeight
      const flow = document.getElementById('heroFlow')
      const layer = document.getElementById('heroVidLayer')
      if (layer && y <= vh * 1.3) {
        const zoom = 1.045 + Math.min(0.08, (y / vh) * 0.1)
        layer.style.transform = `translate(${px.x * 16}px, ${px.y * 10 + y * 0.12}px) scale(${zoom})`
      }
      if (flow && y <= vh * 1.2) {
        flow.style.transform = `translateY(${y * -0.28}px) scale(${Math.max(0.9, 1 - y / (vh * 4))})`
        flow.style.opacity = String(Math.max(0, 1 - y / (vh * 0.7)))
      }
    }
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(apply) }
    const onPointer = (e: PointerEvent) => {
      px.x = e.clientX / window.innerWidth - 0.5
      px.y = e.clientY / window.innerHeight - 0.5
      if (!raf) raf = requestAnimationFrame(apply)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('pointermove', onPointer, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('pointermove', onPointer)
      cancelAnimationFrame(raf)
    }
  }, [])
  return (
    <header className="hero">
      <div className="hero__vidlayer" id="heroVidLayer">
        <CrossfadeLoop className="hero__vid" src={HERO2_MP4} poster={HERO2_JPG} end={9.82} fade={0.3} />
      </div>
      <div className="hero__grade" />
      <div className="hero__content wrap">
        <div className="hero__kicker rev">
          <span className="chip chip--lime"><span className="dot" />AI garden companion · Canadian native intelligence</span>
        </div>
        <h1 className="hero__title" aria-label="Grow anything. Ask everything.">
          {'Grow anything.'.split('').map((c, i) => (
            c === ' ' ? ' ' : <span className="lt" style={{ '--i': i } as React.CSSProperties} key={`a${i}`}>{c}</span>
          ))}
          <br />
          <span className="leafy">
            {'Ask everything.'.split('').map((c, i) => (
              c === ' ' ? ' ' : <span className="lt" style={{ '--i': i + 15 } as React.CSSProperties} key={`b${i}`}>{c}</span>
            ))}
          </span>
        </h1>
        <p className="hero__lede rev" data-d="2">
          Your companion for the whole garden — identify, plan, and save plants
          that actually belong in Canadian soil.
        </p>
        <div className="hero__stage">
          <div className="hero__flow" id="heroFlow">
            <div className="hero__float rev" data-d="3">
              <form className="ask2" onSubmit={onAsk}>
                <div className="ask2__field">
                  <input id="ask" type="text" placeholder="Ask anything about your garden…" aria-label="Ask Shrubby" />
                  <button
                    type="button" className="ask2__ico" aria-label="Speak to Shrubby"
                    onClick={e => {
                      const b = e.currentTarget
                      b.classList.remove('pulse'); void b.offsetWidth; b.classList.add('pulse')
                      document.getElementById('ask')?.focus()
                    }}
                  >
                    <Mic size={19} strokeWidth={2.1} />
                  </button>
                  <button type="submit" className="ask2__send" aria-label="Send question">
                    <Send size={18} strokeWidth={2.2} />
                  </button>
                </div>
                <div className="ask2__row">
                  <button
                    type="button" className="ask2__chip"
                    onClick={() => {
                      const i = document.getElementById('ask') as HTMLInputElement
                      if (i) { i.value = "Here\u2019s a photo of my monstera \u2014 "; i.focus() }
                    }}
                  >
                    <Camera size={14} strokeWidth={2.2} /> Add a photo
                  </button>
                  <button
                    type="button" className="ask2__chip ask2__chip--hint"
                    onClick={() => {
                      const i = document.getElementById('ask') as HTMLInputElement
                      if (i) { i.value = 'My basil looks droopy'; i.form?.requestSubmit() }
                    }}
                  >
                    “My basil looks droopy”
                  </button>
                  <span className="ask2__auto">Zone-aware · Auto</span>
                </div>
              </form>
              {reply !== null && (
                <div className="hero__reply" role="status" aria-live="polite">
                  <MessageCircle size={15} style={{ display: 'inline', verticalAlign: '-2px', marginRight: 7 }} />
                  {reply}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}


function Companion() {
  const frameRef = useRef<HTMLDivElement>(null)
  const glareRef = useRef<HTMLDivElement>(null)
  const { q, answer } = useAskLoop()
  const [live, setLive] = useState(false)
  const [qv, setQv] = useState('')
  const [reply, setReply] = useState<string | null>(null)
  const liveInput = useRef<HTMLInputElement>(null)
  const fbCounter = useRef(0)
  /* text-only bubble: no close button — the answer clears itself */
  useEffect(() => {
    if (reply === null) return
    const t = window.setTimeout(() => setReply(null), 5200)
    return () => clearTimeout(t)
  }, [reply])
  const engage = () => {
    /* flushSync keeps the focus() inside the tap gesture — iOS Safari only
       opens the keyboard for focus caused directly by a user gesture */
    flushSync(() => { setLive(true); setReply(null); setQv('') })
    liveInput.current?.focus()
  }
  const disengage = () => { setLive(false); setReply(null); setQv('') }
  const submit = (raw?: string) => {
    const text = (raw ?? qv).trim()
    if (!text) return
    setReply(answerQuery(text, fbCounter))
    setQv('')
    liveInput.current?.focus()
  }
  useEffect(() => {
    const el = frameRef.current
    if (!el || REDUCE) return
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect()
      const x = (e.clientX - r.left) / r.width - 0.5
      const y = (e.clientY - r.top) / r.height - 0.5
      el.style.transform = `perspective(900px) rotateY(${x * 9}deg) rotateX(${-y * 7}deg)`
      if (glareRef.current) {
        glareRef.current.style.background =
          `radial-gradient(420px circle at ${(x + 0.5) * 100}% ${(y + 0.5) * 100}%, rgba(255,255,255,.3), transparent 55%)`
      }
    }
    const onLeave = () => {
      el.style.transform = 'perspective(900px)'
      if (glareRef.current) glareRef.current.style.background = 'none'
    }
    el.addEventListener('pointermove', onMove)
    el.addEventListener('pointerleave', onLeave)
    return () => { el.removeEventListener('pointermove', onMove); el.removeEventListener('pointerleave', onLeave) }
  }, [])
  const poke = () => {
    const el = frameRef.current
    if (el && !REDUCE) { el.classList.remove('pop'); void el.offsetWidth; el.classList.add('pop') }
  }
  return (
    <section className="band band--companion" id="companion">
      <Clouds n={3} seed={1} />
      <Ladybug className="lbug--companion" />
      <div className="wrap">
        <div className="companion__head">
          <span className="chip chip--lime rev"><span className="dot" />Your companion</span>
          <h2 className="companion__title rev" data-d="1">Meet <em>Shrubby</em>.</h2>
          <p className="companion__lede rev" data-d="2">
            A little green heart with serious botany — grown for Canadian gardens,
            from Carolinian backyards to zone-3 balconies.
          </p>
        </div>
        <div className="companion__stage2">
          <div className="companion__left rev" data-d="1">
            <div className="companion__card">
              <div className="companion__framewrap">
                <div
                  className="companion__frame" ref={frameRef} onClick={poke}
                  role="button" tabIndex={0} aria-label="Say hi to Shrubby"
                  onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); poke() } }}
                >
                  <AmbientVideo src={SHRUB_MP4} className="companion__vid" />
                  <CompanionSky />
                  <div className="companion__glare" ref={glareRef} aria-hidden="true" />
                  {live
                    ? reply !== null && (
                        <div className="companion__say companion__say--live" key={reply} role="status" aria-live="polite">
                          {reply}
                        </div>
                      )
                    : answer !== null && <div className="companion__say" key={answer}>{answer}</div>}
                </div>
                <Butterfly className="companion__bfly" />
              </div>
              <div className="companion__cardrow">
                <b>Shrubby</b>
                <span className="askdemo__zone">{live ? '● listening' : '● knows your zone'}</span>
              </div>
              {live ? (
                <form className="askdemo__wrap" onSubmit={e => { e.preventDefault(); submit() }}>
                  <div className="askdemo__input askdemo__input--live">
                    <input
                      ref={liveInput} className="askdemo__real" type="text"
                      value={qv} onChange={e => setQv(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Escape') disengage() }}
                      placeholder="Type a question…" aria-label="Ask Shrubby"
                      maxLength={80} autoComplete="off" spellCheck={false}
                    />
                    <button type="button" className="askdemo__x" onClick={disengage} aria-label="Back to the demo">✕</button>
                    <button type="submit" className="askdemo__send askdemo__send--btn" aria-label="Ask">
                      <ArrowRight size={15} strokeWidth={2.6} />
                    </button>
                  </div>
                </form>
              ) : (
                <button
                  type="button" className="askdemo__input" onClick={engage}
                  aria-label="Ask your own question" title="Ask Shrubby for real"
                >
                  <span className="askdemo__q">{q}<i className="askdemo__caret" /></span>
                  <span className="askdemo__send"><ArrowRight size={15} strokeWidth={2.6} /></span>
                </button>
              )}
            </div>
            <p className="companion__hint">
              {live ? 'shrubby is listening — esc brings back the daydream' : 'tap the question — ask Shrubby anything'}
            </p>
          </div>
          <div className="companion__feats">
            <article className="feat feat--talk rev" data-d="1">
              <div className="feat__blob"><MessageCircle size={22} strokeWidth={2.2} /></div>
              <div>
                <h3>Ask everything</h3>
                <p>What is eating the hostas? Why is the basil sulking? Plain questions, plain answers — from a friend who happens to know botany.</p>
              </div>
            </article>
            <article className="feat feat--id rev" data-d="1">
              <div className="feat__blob"><Camera size={22} strokeWidth={2.2} /></div>
              <div>
                <h3>Identify at a glance</h3>
                <p>Point the camera at a leaf, a bloom, a mystery weed. Shrubby names it and hands you the care plan.</p>
              </div>
            </article>
            <article className="feat feat--native rev" data-d="2">
              <div className="feat__blob"><MapPin size={22} strokeWidth={2.2} /></div>
              <div>
                <h3>Plant what belongs</h3>
                <p>Native-first picks tuned to your hardiness zone, frost dates and the soil you actually have.</p>
              </div>
            </article>
            <article className="feat feat--plan rev" data-d="2">
              <div className="feat__blob"><CalendarHeart size={22} strokeWidth={2.2} /></div>
              <div>
                <h3>Save and plan the season</h3>
                <p>Every plant you keep is named, mapped and minded — watering, feeding and pruning laid out through the year.</p>
              </div>
            </article>
          </div>
        </div>
        <div className="companion__stats2 rev" data-d="2">
          <span className="stat"><b>1,400+</b> species understood</span>
          <span className="stat"><b>Zones 0–9</b> coast to coast</span>
          <span className="stat"><b>Native-first</b> plant picks</span>
        </div>
      </div>
    </section>
  )
}

/* pointer 3D tilt + travelling glare — same hand as the plant cards */
function pcardMove(e: React.PointerEvent) {
  if (REDUCE || e.pointerType === 'touch' || e.buttons !== 0) return
  const el = e.currentTarget as HTMLElement
  const r = el.getBoundingClientRect()
  const x = (e.clientX - r.left) / r.width - 0.5
  const y = (e.clientY - r.top) / r.height - 0.5
  el.style.transform = `perspective(900px) rotateY(${x * 6}deg) rotateX(${-y * 4.5}deg) translateY(-8px)`
  const glare = el.querySelector('.pcard__glare') as HTMLElement | null
  if (glare) glare.style.background =
    `radial-gradient(360px circle at ${(x + 0.5) * 100}% ${(y + 0.5) * 100}%, rgba(255,255,255,.5), transparent 60%)`
}
function pcardLeave(e: React.PointerEvent) {
  const el = e.currentTarget as HTMLElement
  el.style.transform = ''
  const glare = el.querySelector('.pcard__glare') as HTMLElement | null
  if (glare) glare.style.background = 'none'
}

const PRACTICE_CARDS = [
  {
    cls: 'pcard--sage', step: '01', icon: <Camera size={28} strokeWidth={2.2} />, title: 'Observation',
    body: 'Photograph a leaf, a whole bed, a worried patch of lawn. Shrubby reads colour, posture and light — and names what it sees.',
  },
  {
    cls: 'pcard--lime', step: '02', icon: <BookOpen size={28} strokeWidth={2.2} />, title: 'Understanding',
    body: 'Every plant carries a history — native range, zone, habits. Shrubby holds that context so advice fits your soil, not a generic average.',
  },
  {
    cls: 'pcard--deep', step: '03', icon: <BellRing size={28} strokeWidth={2.2} />, title: 'Tending',
    body: 'Water, feed and prune arrive as gentle nudges timed to the season and the weather outside your window.',
  },
]

function Practice() {
  return (
    <section className="band band--practice" id="practice">
      <Clouds n={2} seed={3} />
      <Bee className="bee--practice" />
      <div className="wrap">
        <span className="chip chip--lime rev"><span className="dot" />The practice</span>
        <h2 className="practice__giant rev" data-d="1">
          Care, in three<br /><em>unhurried</em> movements.
        </h2>
        <p className="practice__intro rev" data-d="2">
          No dashboards, no jargon. Shrubby works the way a good gardener does — patiently, by paying attention.
        </p>
        <div className="practice__grid">
          {PRACTICE_CARDS.map((c, i) => (
            <article
              className={`pcard ${c.cls} rev rev--tilt`} data-d={i + 1} key={c.step}
              onPointerMove={pcardMove} onPointerLeave={pcardLeave}
            >
              <div className="pcard__glare" aria-hidden="true" />
              <span className="pcard__step">{c.step}</span>
              <div className="pcard__blob">{c.icon}</div>
              <h3>{c.title}</h3>
              <p>{c.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

const PLANTS = [
  {
    name: "Stella d'Oro Daylily",
    latin: 'Hemerocallis',
    season: 'High summer · Zones 3–9',
    blurb: <>The tireless golden rebloomer — <Kw>drought-easy</Kw>, deer-shrugging, forgiving. Shrubby's pick for a first perennial.</>,
    photo: PHOTO_DAYLILY,
    water: 'Low water', light: 'Full sun',
    tag: 'Perennial', badge: 'Nearly unkillable',
    desc: 'The tireless golden rebloomer — flushes of bloom from June until frost on a plant that forgives nearly everything.',
    toxShort: 'Toxic to cats',
    care: 'Deadhead spent scapes and divide crowded clumps every three or four years in early spring.',
    hardiness: 'Bulletproof to zone 3, coast to coast.',
    note: 'One of the few perennials that blooms straight through a prairie heat wave without complaint.',
  },
  {
    name: 'Ostrich Fern',
    latin: 'Matteuccia struthiopteris',
    season: 'Spring emergence · Native',
    blurb: <>For Canadian <Kw>shade</Kw>: native fiddleheads and woodland texture — habitat that feeds pollinators and asks little back.</>,
    photo: PHOTO_FERN,
    water: 'Moist soil', light: 'Shade',
    tag: 'Native shade', badge: 'Canadian native',
    desc: 'Vase-shaped fronds to shoulder height — instant woodland for the dark side of the house.',
    toxShort: 'Pet safe',
    care: 'Rich, moist soil and shelter from wind. Never let the crown bake dry in July.',
    hardiness: 'Native through zone 3 — thrives where winters are honest.',
    note: 'Spreads politely by runners; share the extras at the neighbourhood plant swap.',
  },
  {
    name: 'Black-Eyed Susan',
    latin: 'Rudbeckia hirta',
    season: 'Late season · Pollinator',
    blurb: <>A prairie native that carries the border into autumn and leaves <Kw>seed heads</Kw> for the finches. Plan the year, not just the bloom.</>,
    photo: PHOTO_SUSAN,
    water: 'Low water', light: 'Full sun',
    tag: 'Prairie native', badge: 'Pollinator favourite',
    desc: 'Gold daisies that carry the border from July into October, then feed the finches all winter.',
    toxShort: 'Non-toxic',
    care: 'Deadhead for more bloom — or stop in September and leave the seed heads standing.',
    hardiness: 'Hardy to zone 3; self-sows gently where it is happy.',
    note: 'The seed heads are a goldfinch buffet. Resist the fall tidy-up.',
  },
  {
    name: 'Wild Columbine',
    latin: 'Aquilegia canadensis',
    season: 'Late spring · Native',
    blurb: <>Nodding scarlet bells built for <Kw>hummingbirds</Kw>. Self-sows politely into the gaps you didn't know you had.</>,
    photo: PHOTO_COLUMBINE,
    water: 'Average', light: 'Part shade',
    tag: 'Native', badge: 'Hummingbird magnet',
    desc: 'Nodding scarlet-and-yellow bells in late spring, timed to the hummingbirds coming home.',
    toxShort: 'Mild caution',
    care: 'Part shade and average soil. Let a few seed pods ripen and it plants itself.',
    hardiness: 'Native to zone 3 — happiest at the woodland edge.',
    note: 'Blooms exactly when the ruby-throats return from the south. Not a coincidence.',
  },
  {
    name: 'Purple Coneflower',
    latin: 'Echinacea purpurea',
    season: 'High summer · Pollinator',
    blurb: <>The prairie workhorse — <Kw>bees</Kw> all summer, goldfinches all winter. Happiest when you ignore it a little.</>,
    photo: PHOTO_CONEFLOWER,
    water: 'Drought-ok', light: 'Full sun',
    tag: 'Prairie native', badge: 'Bee favourite',
    desc: 'The prairie workhorse — purple daisies all summer, standing seed heads all winter.',
    toxShort: 'Non-toxic',
    care: 'Full sun and lean soil. Skip the fertilizer and it stands up straighter.',
    hardiness: 'Hardy to zone 3 with no fuss at all.',
    note: 'Happiest when you ignore it a little.',
  },
  {
    name: 'Serviceberry',
    latin: 'Amelanchier',
    season: 'Four seasons · Native shrub',
    blurb: <>Blossom, <Kw>berry</Kw>, blaze, bark — one small tree that performs in every season and feeds half the neighbourhood's birds.</>,
    photo: PHOTO_SERVICEBERRY,
    water: 'Average', light: 'Sun to part',
    tag: 'Native shrub', badge: 'Pet & kid safe',
    desc: 'Blossom, berry, blaze and bark — one small tree that performs in every season.',
    toxShort: 'Pet & kid safe',
    care: 'Sun to part shade in any decent soil. Prune only to shape, right after fruiting.',
    hardiness: 'Native varieties hardy to zone 2 — coast to coast to coast.',
    note: 'June berries taste of blueberry and almond. You will race the cedar waxwings for them.',
  },
]

function Almanac() {
  return (
    <section className="band band--almanac" id="almanac">
      <Butterfly className="bfly--almanac" />
      <div className="wrap">
        <div className="almanac__head">
          <div>
            <span className="chip chip--forest rev"><span className="dot" />The living almanac</span>
            <h2 className="rev sprout-title" data-d="1">
              <SproutWords lines={['Rooted in what', 'you actually grow.']} />
            </h2>
          </div>
          <p className="rev" data-d="2">
            Six of Shrubby's favourites — native species, resilient perennials, and the low-fuss
            classics that reward a beginner — lined up along the path.
          </p>
        </div>
        <div className="rev" data-d="2">
          <div className="skyfield">
            <div className="skyfield__vidwrap" aria-hidden="true">
              <CrossfadeLoop className="skyfield__vid" src={CLOUDS_MP4} poster={CLOUDS_JPG} end={9.4} fade={0.6} />
            </div>
            <FloatDeck
              className="deck--plates"
              ariaLabel="Featured plants from the almanac"
              still
              items={PLANTS.map(p => (
                <article className="plate" key={p.name}>
                  <div className="plate__photo">
                    <img src={p.photo} alt={p.name} loading="lazy" />
                    <span className="plate__chip">{p.season}</span>
                  </div>
                  <div className="plate__body">
                    <h3>{p.name}</h3>
                    <div className="plate__latin">{p.latin}</div>
                    <p>{p.desc}</p>
                    <div className="plate__meta" aria-label="Care profile">
                      <span><Droplets size={12} /> {p.water}</span>
                      <span><Sun size={12} /> {p.light}</span>
                    </div>
                    <button className="plate__cta">Add to my garden</button>
                  </div>
                </article>
              ))}
            />
          </div>
        </div>
      </div>
    </section>
  )
}

/* ---------------- plant library — look up any plant ----------------
 * The six featured PLANTS (embedded photography + hand-written copy) are
 * fronted onto the full Base44 PlantLibrary — 956 Canadian species baked into
 * library-data.ts. Featured entries win by name so their photos and richer
 * copy survive; every other species renders a botanical fallback tile. */

const LIB_TINTS = ['#E9F0D2', '#F2E2B4', '#EDD6C3', '#E3EDD7']

type LibEntry = {
  name: string; latin: string; desc: string
  light: string; water: string
  toxShort: string; toxicity: string
  care: string; hardiness: string; note: string
  tag: string; badge: string; photo?: string
  featured?: boolean
}

const FEATURED: LibEntry[] = PLANTS.map(p => ({
  name: p.name, latin: p.latin, desc: p.desc,
  light: p.light, water: p.water,
  toxShort: p.toxShort, toxicity: '',
  care: p.care, hardiness: p.hardiness, note: p.note,
  tag: p.tag, badge: p.badge, photo: p.photo, featured: true,
}))

const LIBRARY: LibEntry[] = (() => {
  const seen = new Set(FEATURED.map(p => p.name.toLowerCase()))
  const rest = SPECIES
    .filter(s => !seen.has(s.name.toLowerCase()))
    .map(s => ({
      name: s.name, latin: s.latin, desc: s.desc,
      light: s.light, water: s.water,
      toxShort: s.toxShort, toxicity: s.toxicity,
      care: s.care, hardiness: s.hardiness, note: s.note,
      tag: s.tag, badge: s.badge, photo: s.photo,
    }))
  return [...FEATURED, ...rest]
})()

/* Deep-green fallback tiles for species without embedded photography —
 * deterministic per name so a species always wears the same tile. */
const LIB_FALLBACKS: [string, string][] = [
  ['#4A7539', '#22371D'], ['#55823A', '#33512C'],
  ['#6FA14E', '#3B5B2C'], ['#3B5B2C', '#22371D'],
]
function fallbackTint(name: string): [string, string] {
  let h = 0
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0
  return LIB_FALLBACKS[h % LIB_FALLBACKS.length]
}

/* Ranked search across the whole library: exact → name-prefix → name-contains
 * → latin → tag. Featured (photographed) entries edge ties. */
function searchLibrary(raw: string): LibEntry[] {
  const n = raw.trim().toLowerCase()
  if (!n) return []
  const scored: { p: LibEntry; s: number }[] = []
  for (const p of LIBRARY) {
    const name = p.name.toLowerCase()
    const latin = p.latin.toLowerCase()
    let s = 0
    if (name === n) s = 100
    else if (name.startsWith(n)) s = 80
    else if (name.split(' ').some(w => w.startsWith(n))) s = 70
    else if (name.includes(n)) s = 60
    else if (latin.startsWith(n)) s = 50
    else if (latin.includes(n)) s = 40
    else if (p.tag.toLowerCase().includes(n)) s = 20
    if (!s) continue
    /* the six featured cards carry embedded photography and hand-written
     * copy — worth surfacing over generic prefix matches */
    if (p.featured) s += 15
    if (p.photo) s += 1
    scored.push({ p, s })
  }
  scored.sort((a, b) =>
    b.s - a.s || a.p.name.length - b.p.name.length || a.p.name.localeCompare(b.p.name))
  return scored.map(x => x.p)
}

type LibPlant = LibEntry

function Library() {
  const [q, setQ] = useState('')
  const [sugOpen, setSugOpen] = useState(false)
  const [thinking, setThinking] = useState(false)
  const [plant, setPlant] = useState<LibPlant | null>(null)
  const [photoDead, setPhotoDead] = useState(false)
  const [saved, setSaved] = useState(false)
  const [exported, setExported] = useState(false)
  const [shared, setShared] = useState(false)
  const [hi, setHi] = useState(-1)
  const runTimer = useRef<number | undefined>(undefined)
  const flashTimer = useRef<Record<string, number>>({})
  const searchRef = useRef<HTMLFormElement>(null)
  useEffect(() => () => {
    clearTimeout(runTimer.current)
    Object.values(flashTimer.current).forEach(clearTimeout)
  }, [])
  /* clicking anywhere outside the search dismisses the suggestions */
  useEffect(() => {
    const on = (e: PointerEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setSugOpen(false)
    }
    document.addEventListener('pointerdown', on)
    return () => document.removeEventListener('pointerdown', on)
  }, [])

  const sug = sugOpen ? searchLibrary(q).slice(0, 6) : []

  const run = (pick?: LibPlant) => {
    if (!pick && !q.trim()) return
    const p = pick ?? searchLibrary(q)[0] ?? LIBRARY[0]
    clearTimeout(runTimer.current)
    setQ(p.name); setSugOpen(false); setHi(-1); setThinking(true); setPlant(null); setPhotoDead(false)
    setSaved(false); setExported(false); setShared(false)
    runTimer.current = window.setTimeout(() => { setThinking(false); setPlant(p) }, REDUCE ? 120 : 950)
  }
  const clear = () => { clearTimeout(runTimer.current); setPlant(null); setThinking(false); setQ(''); setSugOpen(false) }
  const flash = (key: string, set: (v: boolean) => void) => {
    set(true)
    clearTimeout(flashTimer.current[key])
    flashTimer.current[key] = window.setTimeout(() => set(false), 1800)
  }
  const hero = !thinking && plant === null

  return (
    <main className={`lib${hero ? ' lib--hero' : ''}`}>
      <div className="lib__bg" aria-hidden="true">
        <CrossfadeLoop className="lib__vid" src={FIELD_MP4} poster={FIELD_JPG} end={9.3} fade={0.5} />
      </div>
      <div className="lib__wash" aria-hidden="true" />
      <div className="lib__content wrap">
        <header className="lib__head">
          <span className="chip chip--lime"><span className="dot" />The living library · {LIBRARY.length.toLocaleString()} Canadian species</span>
          <h1 className="lib__title">Look up <em>any</em> plant.</h1>
          {hero && (
            <p className="lib__lede">
              Every profile grown for Canadian gardens — light, water, pet safety and honest zone talk.
            </p>
          )}
        </header>

        <div className="lib__stage">
          {thinking && (
            <div className="lib__thinking" role="status">
              <i /><i /><i />
              <span>Leafing through the library…</span>
            </div>
          )}

          {plant !== null && (
            <article className="lib__card" onPointerMove={pcardMove} onPointerLeave={pcardLeave}>
              <div className="pcard__glare" aria-hidden="true" />
              <figure
                className={`lib__photo${plant.photo && !photoDead ? '' : ' lib__photo--fallback'}`}
                style={plant.photo && !photoDead ? undefined : (() => {
                  const [a, b] = fallbackTint(plant.name)
                  return { background: `linear-gradient(150deg, ${a}, ${b})` }
                })()}
              >
                {plant.photo && !photoDead
                  ? <img src={plant.photo} alt={plant.name} onError={() => setPhotoDead(true)} />
                  : <Leaf className="lib__leaf" size={92} strokeWidth={1.3} aria-hidden="true" />}
                <button className="lib__close" onClick={clear} aria-label="Clear result">
                  <X size={16} strokeWidth={2.4} />
                </button>
                <span className="lib__badge"><ShieldCheck size={13} strokeWidth={2.2} /> {plant.badge}</span>
                <div className="lib__nameplate">
                  <h2>{plant.name}</h2>
                  <span>{plant.latin}</span>
                </div>
              </figure>
              <div className="lib__body">
                <p className="lib__desc">{plant.desc}</p>
                <div className="lib__facts">
                  <div className="lib__fact lib__fact--light">
                    <b><Sun size={12} strokeWidth={2.4} /> Light</b>
                    <span>{plant.light}</span>
                  </div>
                  <div className="lib__fact lib__fact--water">
                    <b><Droplets size={12} strokeWidth={2.4} /> Water</b>
                    <span>{plant.water}</span>
                  </div>
                  <div className="lib__fact lib__fact--tox">
                    <b><ShieldCheck size={12} strokeWidth={2.4} /> Safety</b>
                    <span title={plant.toxicity || undefined}>{plant.toxShort}</span>
                  </div>
                </div>
                <div className="lib__duo">
                  <div className="lib__tip">
                    <div className="lib__tipico"><Sprout size={17} strokeWidth={2.2} /></div>
                    <div><b>Care tips</b><p>{plant.care}</p></div>
                  </div>
                  <div className="lib__tip lib__tip--cold">
                    <div className="lib__tipico"><Snowflake size={17} strokeWidth={2.2} /></div>
                    <div><b>Canadian hardiness</b><p>{plant.hardiness}</p></div>
                  </div>
                </div>
                <p className="lib__note">{plant.note}</p>
                <div className="lib__actions">
                  <button className="lib__save" onClick={() => setSaved(v => !v)}>
                    <Heart size={15} strokeWidth={2.2} fill={saved ? '#fff' : 'none'} />
                    {saved ? 'Saved to my garden' : 'Add to my garden'}
                  </button>
                  <button className="lib__ghost" onClick={() => flash('exp', setExported)}>
                    <Download size={15} strokeWidth={2.2} /> {exported ? 'Exported' : 'Export'}
                  </button>
                  <button className="lib__ghost" onClick={() => flash('share', setShared)}>
                    <Share2 size={15} strokeWidth={2.2} /> {shared ? 'Link copied' : 'Share'}
                  </button>
                </div>
              </div>
            </article>
          )}
        </div>

        <div className="lib__searchrow">
          <form
            ref={searchRef}
            className="lib__search"
            onSubmit={e => { e.preventDefault(); run(hi >= 0 ? sug[hi] : undefined) }}
          >
            <Search size={19} strokeWidth={2.1} className="lib__searchico" />
            <input
              value={q}
              onChange={e => { setQ(e.target.value); setSugOpen(true); setHi(-1) }}
              onKeyDown={e => {
                if (e.key === 'Escape') { setSugOpen(false); setHi(-1) }
                else if (e.key === 'ArrowDown' && sug.length) { e.preventDefault(); setHi(h => (h + 1) % sug.length) }
                else if (e.key === 'ArrowUp' && sug.length) { e.preventDefault(); setHi(h => (h - 1 + sug.length) % sug.length) }
              }}
              placeholder="Search a plant — try “serviceberry”"
              aria-label="Search the plant library"
              role="combobox" aria-expanded={sug.length > 0} aria-autocomplete="list"
            />
            <button type="submit" className="lib__go">Search</button>
            {sug.length > 0 && (
              <div className="lib__sug" role="listbox" aria-label="Matching plants">
                {sug.map((p, i) => (
                  <button
                    type="button" key={p.name} role="option" aria-selected={i === hi}
                    className={i === hi ? 'is-hi' : ''}
                    onPointerEnter={() => setHi(i)}
                    onClick={() => run(p)}
                  >
                    <span className="lib__sugini" style={{ background: LIB_TINTS[i % 4] }}>{p.name[0]}</span>
                    <span className="lib__sugtxt"><b>{p.name}</b><i>{p.latin}</i></span>
                    <span className="lib__sugtag">{p.tag}</span>
                  </button>
                ))}
              </div>
            )}
          </form>
          {hero && (
            <div className="lib__chips">
              {FEATURED.map(p => (
                <button key={p.name} type="button" onClick={() => run(p)}>{p.name}</button>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}

/* ---------------- the app — dashboard showcase (#/app) ----------------
 * The four phone screens are the authoritative Clay & Glass dashboard model
 * (Brain/shrubby-redesign.html), auto-ported: classes collision-renamed,
 * CSS scoped under .dash, display face swapped to Bricolage. Static, trusted,
 * local markup — injected verbatim so the model stays easy to re-sync. */
function AppShowcase() {
  return (
    <main className="appx">
      <div className="wrap">
        <header className="appx__head">
          <span className="chip chip--lime"><span className="dot" />The app · iOS · Android · Web</span>
          <h1 className="appx__title">The whole garden, <em>in your pocket</em>.</h1>
          <p className="appx__lede">
            The same clay and glass, sized for a thumb — home, plant detail, scan
            and the season's schedule, exactly as they ship.
          </p>
          <a className="btn-ink appx__demo" href="#/login">
            Try the live demo <ArrowUpRight size={18} />
          </a>
        </header>
        <div className="dash" dangerouslySetInnerHTML={{ __html: DASH_HTML }} />
      </div>
    </main>
  )
}

/* ---------------- login + user dashboard (demo of the product) ----------------
 * Ported from Brain/Shrubby Site/{Shrubby Login, Shrubby Dashboard}.html —
 * hand-translated to React (display face: Bricolage per the unify decision).
 * Demo flow only: sign-in routes to #/dashboard; the sidebar user row signs out. */

function UserLogin() {
  return (
    <main className="ul">
      <aside className="ul__brand">
        <div className="ul__logo">
          <span className="ul__mark">S</span>
          <span className="ul__word">Shr<b>u</b>bby</span>
        </div>
        <div className="ul__heroish">
          <img className="ul__mascot" src={MASCOT_PNG} alt="Shrubby, the leaf mascot, waving from its terracotta pot" />
          <h2>Your plants missed you.</h2>
          <p>Sign back in to check today's watering, chat with Shrubby and keep your care streak alive.</p>
        </div>
        <div className="ul__foot"><span className="ul__dot" />12 plants thriving under your care</div>
      </aside>
      <section className="ul__formwrap">
        <form className="ul__card" onSubmit={e => { e.preventDefault(); window.location.hash = '#/dashboard' }}>
          <div className="ul__eyebrow">Welcome back</div>
          <h1>Sign in to Shrubby</h1>
          <div className="ul__oauth">
            <a className="ul__oa ul__oa--light" href="#/dashboard">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="9" /><path d="M3.5 12h17M12 3.5c-5 5.5-5 11.5 0 17M12 3.5c5 5.5 5 11.5 0 17" /></svg>
              Continue with Google
            </a>
            <a className="ul__oa ul__oa--ink" href="#/dashboard">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 6c-1-2-3.5-2.6-5.5-1.4C4 6.1 3.2 9.6 4.6 13.4c1.3 3.5 3.6 6.1 5.4 6.1 1 0 1.2-.6 2-.6s1 .6 2 .6c1.9 0 4.1-2.6 5.4-6.1-2.2-1-3-3.4-2-5.4.6-1.2 1.6-1.9 1.6-1.9C17.5 4.3 14 4.5 12 6z" /><path d="M12 6c0-1.8 1.4-3.4 3.2-3.5C15.3 4.3 14 6 12 6z" /></svg>
              Continue with Apple
            </a>
          </div>
          <div className="ul__divider"><span /><em>or with email</em><span /></div>
          <label className="ul__field">
            <span>Email</span>
            <input type="email" placeholder="you@example.com" autoComplete="off" />
          </label>
          <label className="ul__field">
            <span>Password <a href="#/login" onClick={e => e.preventDefault()}>Forgot?</a></span>
            <input type="password" placeholder="••••••••" autoComplete="off" />
          </label>
          <button type="submit" className="ul__submit">Sign in →</button>
          <div className="ul__alt">New to Shrubby? <a href="#/login" onClick={e => e.preventDefault()}>Create an account</a></div>
        </form>
      </section>
    </main>
  )
}

const UD_PLANTS = [
  { name: 'Monstera', room: 'Living room', badge: 'Thriving', tone: 'leaf' },
  { name: 'Boston Fern', room: 'Kitchen', badge: 'Thirsty', tone: 'sky' },
  { name: 'Calathea', room: 'Bedroom', badge: 'Needs mist', tone: 'terra' },
  { name: 'Golden Pothos', room: 'Office', badge: 'Thriving', tone: 'leaf' },
]

const UD_TASKS = [
  { title: 'Water the Boston Fern', sub: 'Kitchen shelf · 250 ml', ico: <Droplets size={16} strokeWidth={1.9} />, tone: 'sky' },
  { title: 'Mist the Calathea', sub: 'Bedroom · humidity boost', ico: <CloudRain size={16} strokeWidth={1.9} />, tone: 'leaf' },
  { title: 'Fertilize the Monstera', sub: 'Living room · monthly feed', ico: <Sprout size={16} strokeWidth={1.9} />, tone: 'terra' },
]

/** Soft leaf mark used where the model ships photo placeholders */
function UdLeafSlot({ big }: { big?: boolean }) {
  return (
    <div className={`ud__slot${big ? ' ud__slot--big' : ''}`} aria-hidden="true">
      <Leaf size={big ? 44 : 34} strokeWidth={1.6} />
    </div>
  )
}

function UserDashboard() {
  const [done, setDone] = useState<Record<number, boolean>>({ 0: false, 1: false, 2: true })
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'
  const week = [['MON', 7], ['TUE', 8], ['WED', 9], ['THU', 10], ['FRI', 11], ['SAT', 12], ['SUN', 13]] as const
  return (
    <main className="ud">
      <aside className="ud__side">
        <div className="ud__logo">
          <span className="ul__mark">S</span>
          <span className="ul__word">Shr<b>u</b>bby</span>
        </div>
        <div className="ud__nav ud__nav--on"><Home size={17} strokeWidth={1.9} /> Home</div>
        <div className="ud__nav"><Leaf size={17} strokeWidth={1.9} /> My Plants</div>
        <div className="ud__nav"><CalendarDays size={17} strokeWidth={1.9} /> Schedule</div>
        <div className="ud__nav"><Camera size={17} strokeWidth={1.9} /> Scan</div>
        <div className="ud__nav"><MessageCircle size={17} strokeWidth={1.9} /> Ask Shrubby</div>
        <a className="ud__user" href="#/login" title="Sign out">
          <span className="ud__avatar">G</span>
          <span className="ud__usertxt"><b>Giba</b><small>Plant parent · 12 plants</small></span>
          <LogOut size={15} strokeWidth={1.9} />
        </a>
      </aside>
      <div className="ud__main">
        <header className="ud__top">
          <div className="ud__toptxt">
            <div className="ul__eyebrow">Dashboard</div>
            <h1>{greeting}, Giba</h1>
          </div>
          <div className="ud__search"><Search size={15} strokeWidth={2} /> Search plants, tasks…</div>
          <button type="button" className="ud__add">+ Add plant</button>
        </header>

        <section className="ud__hero">
          <div className="ud__star">
            <div className="ud__starphoto"><UdLeafSlot big /></div>
            <div className="ud__startxt">
              <span className="ud__pill">● Thriving</span>
              <h3>Monstera deliciosa</h3>
              <div className="ud__where">Living room · near east window</div>
              <div className="ud__stats">
                <div><small>Moisture</small><b>62%</b></div>
                <div><small>Light</small><b>Bright</b></div>
                <div><small>Next water</small><b>2 days</b></div>
              </div>
            </div>
          </div>
          <div className="ud__kpi ud__kpi--water">
            <div className="ud__kpihead"><Droplets size={15} strokeWidth={1.9} /> Watering due today</div>
            <div><div className="ud__big">3</div><div className="ud__kpisub">Fern, Calathea &amp; Pothos are thirsty</div></div>
          </div>
          <div className="ud__kpi ud__kpi--streak">
            <div className="ud__kpihead"><Flame size={15} strokeWidth={1.9} /> Care streak</div>
            <div><div className="ud__big">18 days</div><div className="ud__kpisub">Best streak yet — keep it up</div></div>
          </div>
        </section>

        <section className="ud__mid">
          <div className="ud__week">
            <div className="ud__cardhead"><b>This week's care</b><a href="#/dashboard" onClick={e => e.preventDefault()}>Full schedule →</a></div>
            <div className="ud__days">
              {week.map(([d, n]) => (
                <div className="ud__day" key={d}><small>{d}</small><b className={n === 9 ? 'ud__day--today' : ''}>{n}</b></div>
              ))}
            </div>
            <div className="ud__tasks">
              {UD_TASKS.map((t, i) => (
                <div className={`ud__task${done[i] ? ' ud__task--done' : ''}`} key={t.title}>
                  <span className={`ud__tico ud__tico--${t.tone}`}>{t.ico}</span>
                  <span className="ud__ttxt"><b>{t.title}</b><small>{t.sub}</small></span>
                  <button
                    type="button" className="ud__check" aria-pressed={!!done[i]}
                    aria-label={`Mark "${t.title}" ${done[i] ? 'not done' : 'done'}`}
                    onClick={() => setDone(s => ({ ...s, [i]: !s[i] }))}
                  >
                    {done[i] && <Check size={14} strokeWidth={3} />}
                  </button>
                </div>
              ))}
            </div>
          </div>
          <div className="ud__ask">
            <small className="ud__askkick">Ask Shrubby</small>
            <p>“Your Calathea's leaves are curling? That usually means it wants more humidity. Want a misting reminder?”</p>
            <div className="ud__askrow">
              <div className="ud__askpill">Ask about your plants…</div>
              <button type="button" className="ud__asksend" aria-label="Send">↑</button>
            </div>
            <img className="ud__askmascot" src={MASCOT_PNG} alt="" aria-hidden="true" />
          </div>
        </section>

        <section>
          <div className="ud__cardhead ud__cardhead--bare"><b>My plants</b><a href="#/dashboard" onClick={e => e.preventDefault()}>See all 12 →</a></div>
          <div className="ud__grid">
            {UD_PLANTS.map(p => (
              <div className="ud__plant" key={p.name}>
                <div className="ud__pphoto"><UdLeafSlot /></div>
                <div className="ud__prow">
                  <span className="ud__ptxt"><b>{p.name}</b><small>{p.room}</small></span>
                  <span className={`ud__badge ud__badge--${p.tone}`}>{p.badge}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}

const NIGHTS = [
  {
    icon: <Sparkles size={22} />,
    title: 'Overnight frost watch',
    body: <>A cold snap coming? Shrubby checks the forecast against every <Kw>tender plant</Kw> you own and warns you the evening before.</>,
  },
  {
    icon: <MapPin size={22} />,
    title: 'Knows your patch',
    body: <>Hardiness zone, first-frost dates, soil quirks — advice is grown for your <Kw>postal code</Kw>, not a generic average.</>,
  },
  {
    icon: <CalendarHeart size={22} />,
    title: 'A year of rhythm',
    body: <>Sowing, dividing, mulching, resting — the whole season laid out as a <Kw>calm calendar</Kw> you can actually keep.</>,
  },
  {
    icon: <CloudRain size={22} />,
    title: 'Rain-aware watering',
    body: <>It rained 14&nbsp;mm overnight? Shrubby counts the <Kw>sky's watering</Kw> before it ever asks for yours.</>,
  },
  {
    icon: <Moon size={22} />,
    title: 'Quiet by design',
    body: <>No 3&nbsp;a.m. pings. Notes wait for your <Kw>morning coffee</Kw> — unless frost is on its way tonight.</>,
  },
]

function Night() {
  return (
    <section className="band band--night night">
      <Fireflies />
      <div className="wrap">
        <span className="chip chip--forest rev"><span className="dot" />After dark</span>
        <h2 className="night__title rev sprout-title" data-d="1">
          <SproutWords lines={['While you sleep,', 'Shrubby keeps watch.']} />
        </h2>
        <div className="rev" data-d="2">
          <FloatDeck
            className="deck--night"
            ariaLabel="What Shrubby watches after dark"
            items={NIGHTS.map(nc => (
              <article className="gcard" key={nc.title}>
                <div className="gcard__ico">{nc.icon}</div>
                <h4>{nc.title}</h4>
                <p>{nc.body}</p>
              </article>
            ))}
          />
        </div>
      </div>
    </section>
  )
}

function CTA() {
  return (
    <section className="band band--honey cta">
      <Clouds n={2} seed={7} />
      <Bee className="bee--cta" />
      <Butterfly className="cta__bfly" />
      <div className="cta__inner wrap rev">
        <h2>Your garden already<br />has a lot to say.</h2>
        <p>Start a conversation with the plants on your windowsill. Shrubby will do the listening.</p>
        <button
          className="btn-ink"
          onClick={() => {
            window.scrollTo({ top: 0, behavior: REDUCE ? 'auto' : 'smooth' })
            setTimeout(() => document.getElementById('ask')?.focus(), REDUCE ? 0 : 650)
          }}
        >
          Plant the first seed <ArrowUpRight size={20} />
        </button>
        <div className="cta__trust" aria-label="Product facts">
          <span className="chip chip--soft">Private by design</span>
          <span className="chip chip--soft">Works offline in the garden</span>
          <span className="chip chip--soft">iOS · Android · Web</span>
        </div>
      </div>
    </section>
  )
}

/* On the library route the hero already plays the meadow — the footer drops
 * its repeated video and floats as a bare glass bar over the hero instead. */
function FieldFooter({ bare }: { bare?: boolean }) {
  return (
    <footer className={`field${bare ? ' field--bare' : ''}`}>
      {!bare && (
        <div className="field__vidwrap" aria-hidden="true">
          <CrossfadeLoop className="field__vid" src={FIELD_MP4} poster={FIELD_JPG} end={9.3} fade={0.5} />
        </div>
      )}
      <div className="field__bar">
        <span className="field__brand">Shrubby</span>
        <span className="field__note">Trained on Canadian native flora — from coast to coast to coast.</span>
        <a href="mailto:hello@shrubby.app">hello@shrubby.app</a>
        <a href="#/app">Get the app →</a>
      </div>
    </footer>
  )
}

/* ---------------- app ---------------- */

function useHashRoute() {
  const get = useCallback(() => {
    if (window.location.hash.startsWith('#/library')) return 'library'
    if (window.location.hash.startsWith('#/app')) return 'app'
    if (window.location.hash.startsWith('#/login')) return 'login'
    if (window.location.hash.startsWith('#/dashboard')) return 'dashboard'
    return 'home'
  }, [])
  const [route, setRoute] = useState(get)
  useEffect(() => {
    const on = () => {
      const r = get()
      setRoute(r)
      if (r !== 'home') window.scrollTo(0, 0)
    }
    window.addEventListener('hashchange', on)
    return () => window.removeEventListener('hashchange', on)
  }, [get])
  return route
}

export default function App() {
  const route = useHashRoute()
  useReveal([route])
  return (
    <>
      <Nav route={route} />
      <TopButton />
      {route === 'home' ? (
        <main>
          <Hero />
          <Companion />
          <Practice />
          <Almanac />
          <Night />
          <CTA />
        </main>
      ) : route === 'library' ? (
        <Library />
      ) : route === 'app' ? (
        <AppShowcase />
      ) : route === 'login' ? (
        <UserLogin />
      ) : (
        <UserDashboard />
      )}
      <FieldFooter bare={route === 'library'} />
    </>
  )
}
