/**
 * ladybug.tsx — Pip v3: the film itself.
 *
 * Per giba (2026-07-11): the code-animated model is REMOVED. The footer bug is
 * now the reference video (`animate_this_ladybug_for_a_web.mp4`, 10s clay
 * render) with its studio background stripped live on a canvas, placed with
 * its feet on the footer glass bar. No behavior brain, no extra animation —
 * the clip IS the animation. (v1/v2 CSS+WAAPI implementations survive in the
 * artifact version history: `pip-3d-flight`, `pip-v2-bar-resident`.)
 *
 * The export keeps the `Pip` name on purpose — FieldFooter mounts <Pip /> and
 * this file may be rebuilt by more than one session; the mount stays stable.
 *
 * Keying: the clip's background is near-white, low-saturation studio gray.
 * Pixels with min(r,g,b) > 200 and (max-min) < 30 go transparent, with an
 * alpha ramp from 170 so the bug's soft contact shadow survives faintly
 * (same recipe family as the v10 KeyedShrub mascot).
 */
import React, { useEffect, useRef } from 'react'
import { LBUG_MP4 } from './media'

const REDUCE_MQ = '(prefers-reduced-motion: reduce)'

export function Pip() {
  const wrapRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const wrap = wrapRef.current
    const cv = canvasRef.current
    const video = videoRef.current
    const field = wrap?.closest('.field') as HTMLElement | null
    if (!wrap || !cv || !video || !field) return

    const REDUCE = window.matchMedia(REDUCE_MQ).matches
    const ctx = cv.getContext('2d', { willReadFrequently: true })
    if (!ctx) return

    let raf = 0
    let visible = false
    let disposed = false

    /* place the bug's feet on the bar's top rim, left third of the pill */
    function position() {
      const bar = field!.querySelector('.field__bar') as HTMLElement | null
      const f = field!.getBoundingClientRect()
      const w = window.innerWidth <= 640 ? 110 : 150
      wrap!.style.width = `${w}px`
      if (bar) {
        const b = bar.getBoundingClientRect()
        if (b.width > 50) {
          const left = (b.left - f.left) + b.width * 0.3 - w / 2
          const top = (b.top - f.top) - w * (720 / 1280) + 14 // feet overlap the rim
          wrap!.style.transform = `translate3d(${left}px, ${top}px, 0)`
          return
        }
      }
      wrap!.style.transform = `translate3d(${f.width * 0.3}px, ${f.height * 0.86 - w * (720 / 1280)}px, 0)`
    }

    /* chroma-key the studio background out, frame by frame */
    function draw() {
      raf = 0
      if (disposed || !visible || document.hidden) return
      if (video!.readyState >= 2) {
        const w = cv!.width, h = cv!.height
        ctx!.drawImage(video!, 0, 0, w, h)
        const img = ctx!.getImageData(0, 0, w, h)
        const d = img.data
        for (let i = 0; i < d.length; i += 4) {
          const r = d[i], g = d[i + 1], b = d[i + 2]
          const mx = r > g ? (r > b ? r : b) : (g > b ? g : b)
          const mn = r < g ? (r < b ? r : b) : (g < b ? g : b)
          if (mx - mn < 30) { // low saturation = floor/background
            if (mn > 185) d[i + 3] = 0 // corners vignette to ~191 — key them fully
            else if (mn > 158) d[i + 3] = Math.min(255, (185 - mn) * 4) // shadow survives faintly
          }
        }
        ctx!.putImageData(img, 0, 0)
      }
      raf = requestAnimationFrame(draw)
    }
    const start = () => { if (!raf && visible && !document.hidden && !disposed) raf = requestAnimationFrame(draw) }
    const stop = () => { if (raf) { cancelAnimationFrame(raf); raf = 0 } }

    const tryPlay = () => { video!.play().catch(() => { /* autoplay policy; retried on gesture */ }) }

    if (REDUCE) {
      // a single keyed still — the bug stands on the bar, no motion
      const still = () => {
        video!.currentTime = 2.5
        const once = () => { visible = true; draw(); visible = false }
        video!.addEventListener('seeked', once, { once: true })
      }
      if (video.readyState >= 1) still()
      else video.addEventListener('loadedmetadata', still, { once: true })
    } else {
      tryPlay()
      video.addEventListener('loadeddata', tryPlay)
      window.addEventListener('pointerdown', tryPlay, { once: true })
    }

    const io = new IntersectionObserver(es => {
      es.forEach(e => {
        visible = e.isIntersecting
        if (visible && !REDUCE) { position(); tryPlay(); start() }
        else if (!REDUCE) { video!.pause(); stop() }
      })
    }, { threshold: [0, 0.1] })
    io.observe(field)

    const onVis = () => { if (document.hidden) { video!.pause(); stop() } else if (visible && !REDUCE) { tryPlay(); start() } }
    document.addEventListener('visibilitychange', onVis)

    const ro = new ResizeObserver(position)
    ro.observe(field)
    const bar = field.querySelector('.field__bar')
    if (bar) ro.observe(bar)
    position()

    return () => {
      disposed = true
      stop()
      io.disconnect(); ro.disconnect()
      document.removeEventListener('visibilitychange', onVis)
      video.removeEventListener('loadeddata', tryPlay)
      window.removeEventListener('pointerdown', tryPlay)
    }
  }, [])

  return (
    <div ref={wrapRef} className="lbugfilm" aria-hidden="true">
      <canvas ref={canvasRef} width={640} height={360} className="lbugfilm__cv" />
      <video
        ref={videoRef} className="lbugfilm__src" src={LBUG_MP4}
        muted loop playsInline preload="auto" crossOrigin="anonymous"
      />
    </div>
  )
}
