/**
 * companion-sky.tsx — the Meet-Shrubby box knows its sky, quietly.
 *
 * 2026-07-11 (giba): all in-frame animation removed (sky tint, night stars,
 * sun + sunglasses gag, falling weather/season particles) — the film stays
 * clean. What remains is the CALM layer: the status chip (season · place ·
 * weather · time-of-day) and the two consent chips. The animated version is
 * preserved in the artifact history (label `living-mascot-box`).
 *
 * Time-of-day runs on ONTARIO CLOCK (America/Toronto) by default with an
 * opt-in "my clock" toggle. Weather is the date-seeded synthetic Ontario mood
 * shared with Pip; "use my sky" asks for location and tries open-meteo, and
 * falls back gracefully wherever CSP or the user says no.
 */
import { useEffect, useRef, useState } from 'react'
import { almanacFor, seasonFor } from './almanac-bug'
import type { Season, Weather } from './almanac-bug'

type Phase = 'dawn' | 'day' | 'dusk' | 'night'

/* Ontario-ish daylight table by season (minutes since midnight). */
const SUN_TABLE: Record<Season, { dawn: [number, number]; dusk: [number, number] }> = {
  winter: { dawn: [7 * 60 + 15, 8 * 60], dusk: [16 * 60 + 45, 17 * 60 + 30] },
  spring: { dawn: [6 * 60, 6 * 60 + 45], dusk: [19 * 60 + 30, 20 * 60 + 15] },
  summer: { dawn: [5 * 60 + 40, 6 * 60 + 20], dusk: [20 * 60 + 30, 21 * 60 + 15] },
  fall: { dawn: [6 * 60 + 45, 7 * 60 + 25], dusk: [18 * 60 + 30, 19 * 60 + 15] },
}

function phaseFor(minutes: number, season: Season): Phase {
  const t = SUN_TABLE[season]
  if (minutes >= t.dawn[0] && minutes < t.dawn[1]) return 'dawn'
  if (minutes >= t.dawn[1] && minutes < t.dusk[0]) return 'day'
  if (minutes >= t.dusk[0] && minutes < t.dusk[1]) return 'dusk'
  return 'night'
}

/** Current wall-clock pieces in a named timezone (default: Shrubby's Ontario). */
function clockIn(tz: string | null, at: Date): { minutes: number; date: Date } {
  if (!tz) return { minutes: at.getHours() * 60 + at.getMinutes(), date: at }
  try {
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone: tz, hour: '2-digit', minute: '2-digit',
      year: 'numeric', month: '2-digit', day: '2-digit', hour12: false,
    }).formatToParts(at)
    const get = (k: string) => Number(parts.find(p => p.type === k)?.value ?? 0)
    return {
      minutes: (get('hour') % 24) * 60 + get('minute'),
      date: new Date(get('year'), get('month') - 1, get('day'), get('hour') % 24, get('minute')),
    }
  } catch {
    return { minutes: at.getHours() * 60 + at.getMinutes(), date: at }
  }
}

/* WMO weather codes → our four moods. */
function moodFromWmo(code: number): Weather {
  if ([71, 73, 75, 77, 85, 86].includes(code)) return 'flurry'
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82) || code >= 95) return 'drizzle'
  if (code >= 1 && code <= 3) return 'breezy'
  return 'sunny'
}

type SkyPrefs = { myClock?: boolean; realWx?: { w: Weather; label: string; ts: number } }
const loadPrefs = (): SkyPrefs => { try { return JSON.parse(localStorage.getItem('shrubby-sky') || '{}') } catch { return {} } }
const savePrefs = (p: SkyPrefs) => { try { localStorage.setItem('shrubby-sky', JSON.stringify(p)) } catch { /* private mode */ } }

export function CompanionSky() {
  const [prefs, setPrefs] = useState<SkyPrefs>(loadPrefs)
  const [tick, setTick] = useState(0)
  const [note, setNote] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const debugDate = useRef<Date | null>(null)
  const debugWx = useRef<Weather | null>(null)

  // re-evaluate every minute (phase boundaries), cheap
  useEffect(() => {
    const iv = setInterval(() => setTick(t => t + 1), 60_000)
    return () => clearInterval(iv)
  }, [])

  const now = debugDate.current ?? new Date()
  const tz = prefs.myClock ? null : 'America/Toronto'
  const { minutes, date } = clockIn(tz, now)
  const season = seasonFor(date)
  const alm = almanacFor(date)
  const phase = phaseFor(minutes, season)
  const realFresh = prefs.realWx && Date.now() - prefs.realWx.ts < 30 * 60_000
  const weather: Weather = debugWx.current ?? (realFresh ? prefs.realWx!.w : alm.weather)
  const holiday = alm.holiday

  /* "use my sky" — geolocation + open-meteo, both strictly on this click.
   * Artifact host CSP blocks the fetch: we say so and keep Ontario weather. */
  const askRealSky = async () => {
    if (busy) return
    setBusy(true); setNote(null)
    try {
      const pos = await new Promise<GeolocationPosition>((res, rej) => {
        if (!navigator.geolocation) { rej(new Error('no-geo')); return }
        navigator.geolocation.getCurrentPosition(res, rej, { timeout: 8000, maximumAge: 600_000 })
      })
      const { latitude, longitude } = pos.coords
      const ctl = new AbortController()
      const kill = setTimeout(() => ctl.abort(), 6000)
      const r = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude.toFixed(2)}&longitude=${longitude.toFixed(2)}&current=weather_code`,
        { signal: ctl.signal },
      )
      clearTimeout(kill)
      const j = await r.json()
      const code = Number(j?.current?.weather_code ?? 0)
      const w = moodFromWmo(code)
      const next = { ...prefs, realWx: { w, label: 'your sky', ts: Date.now() } }
      setPrefs(next); savePrefs(next)
      setNote('now speaking for your sky')
    } catch (e) {
      const name = (e as { name?: string; message?: string })
      setNote(
        name?.message === 'no-geo' || name?.name === 'GeolocationPositionError' || String(e).includes('denied')
          ? 'no worries — staying with Ontario skies'
          : 'this host keeps the internet out — Ontario skies it is',
      )
    } finally { setBusy(false) }
  }

  const toggleClock = () => {
    const next = { ...prefs, myClock: !prefs.myClock }
    setPrefs(next); savePrefs(next)
  }

  /* QA hook — drive the clock/weather directly. */
  useEffect(() => {
    const api = {
      set: (iso: string, wx?: Weather) => {
        debugDate.current = iso ? (() => {
          const [d, t] = iso.split('T')
          const [y, m, dd] = d.split('-').map(Number)
          const [h, mi] = (t || '12:00').split(':').map(Number)
          return new Date(y, (m || 1) - 1, dd || 1, h || 12, mi || 0)
        })() : null
        debugWx.current = wx ?? null
        setTick(t => t + 1)
      },
      clear: () => { debugDate.current = null; debugWx.current = null; setTick(t => t + 1) },
      state: () => ({ phase, weather, season, holiday: holiday?.key ?? null, myClock: !!prefs.myClock }),
    }
    ;(window as unknown as { __sky?: typeof api }).__sky = api
    return () => { if ((window as unknown as { __sky?: unknown }).__sky === api) delete (window as unknown as { __sky?: unknown }).__sky }
  })

  return (
    <div className="csky csky--calm" data-tick={tick} aria-hidden="true">
      <div className="csky__bar">
        <span className="csky__chip csky__chip--status">
          {holiday ? holiday.name : season} · {realFresh ? prefs.realWx!.label : 'Ontario'} · {weather} · {phase}
        </span>
        <button type="button" className="csky__chip" onClick={e => { e.stopPropagation(); void askRealSky() }} disabled={busy}>
          {busy ? 'looking up…' : realFresh ? '↻ my sky' : 'use my sky'}
        </button>
        <button type="button" className="csky__chip" onClick={e => { e.stopPropagation(); toggleClock() }}>
          {prefs.myClock ? 'my clock ✓' : 'Ontario clock'}
        </button>
      </div>
      {note && <div className="csky__note" role="status">{note}</div>}
    </div>
  )
}
