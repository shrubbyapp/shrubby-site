/**
 * almanac-bug.ts — Pip's calendar brain. Pure functions, zero dependencies.
 *
 * The footer is Pip's audition — this module is built portable (no DOM, no React)
 * so the same almanac can later drive in-app companion moments.
 *
 * Weather is SYNTHETIC by design: a date-seeded daily mood, identical for every
 * visitor that day. The artifact host blocks all network requests, so real
 * weather is impossible there; a seeded mood never breaks and needs no location.
 *
 *   date ──▶ seasonFor ──▶ meteorological season
 *        ──▶ holidayFor ─▶ national holiday table (computus + nth-weekday math)
 *        ──▶ weatherFor ─▶ mulberry32(yyyymmdd) daily mood
 *        ──▶ almanacFor ─▶ { season, weather, holiday, prop, antics }
 *   Prop precedence: Remembrance > holiday > season (winter toque) > none.
 */

export type Season = 'spring' | 'summer' | 'fall' | 'winter'
export type Weather = 'sunny' | 'breezy' | 'drizzle' | 'flurry'
export type PipProp =
  | 'party-hat' | 'heart' | 'shamrock' | 'egg' | 'sprout' | 'crown' | 'fleur'
  | 'canada-flag' | 'sun-hat' | 'work-cap' | 'autumn-leaf' | 'pumpkin'
  | 'poppy' | 'santa-hat' | 'toque' | 'broom'

export interface Holiday {
  key: string
  name: string
  prop: PipProp
  /** false = dignified day, Pip stays calm (Remembrance Day) */
  antics: boolean
  particles?: 'confetti' | 'hearts' | 'snow' | 'maple'
}

export interface Almanac {
  season: Season
  weather: Weather
  holiday: Holiday | null
  /** what Pip wears/carries today, after precedence rules */
  prop: PipProp | null
  antics: boolean
  particles: 'confetti' | 'hearts' | 'snow' | 'maple' | 'petals' | 'leaves' | null
}

/** Deterministic PRNG — same date, same weather, every visitor. */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Parse 'YYYY-MM-DD' as a LOCAL date. `new Date('2026-07-01')` is UTC midnight —
 *  June 30 in every Canadian timezone. This is the QA-matrix off-by-one killer. */
export function parseLocalDate(iso: string): Date {
  const [y, m, d] = iso.slice(0, 10).split('-').map(Number)
  return new Date(y, (m || 1) - 1, d || 1)
}

/** Meteorological seasons: Mar–May / Jun–Aug / Sep–Nov / Dec–Feb. */
export function seasonFor(date: Date): Season {
  const m = date.getMonth() // 0-11
  if (m >= 2 && m <= 4) return 'spring'
  if (m >= 5 && m <= 7) return 'summer'
  if (m >= 8 && m <= 10) return 'fall'
  return 'winter'
}

/** Gregorian Easter Sunday (Anonymous computus). Returns {month 1-12, day}. */
export function easterFor(year: number): { month: number; day: number } {
  const a = year % 19
  const b = Math.floor(year / 100), c = year % 100
  const d = Math.floor(b / 4), e = b % 4
  const f = Math.floor((b + 8) / 25)
  const g = Math.floor((b - f + 1) / 3)
  const h = (19 * a + b - d - g + 15) % 30
  const i = Math.floor(c / 4), k = c % 4
  const l = (32 + 2 * e + 2 * i - h - k) % 7
  const m = Math.floor((a + 11 * h + 22 * l) / 451)
  const month = Math.floor((h + l - 7 * m + 114) / 31)
  const day = ((h + l - 7 * m + 114) % 31) + 1
  return { month, day }
}

/** Day-of-month of the Nth weekday (0=Sun..6=Sat) in a month (1-12). */
export function nthWeekday(year: number, month: number, weekday: number, n: number): number {
  const first = new Date(year, month - 1, 1).getDay()
  return 1 + ((weekday - first + 7) % 7) + (n - 1) * 7
}

/** Victoria Day: the Monday strictly before May 25 (range May 18–24). */
export function victoriaDay(year: number): number {
  for (let d = 24; d >= 18; d--) if (new Date(year, 4, d).getDay() === 1) return d
  return 24 // unreachable
}

export function holidayFor(date: Date): Holiday | null {
  const y = date.getFullYear()
  const m = date.getMonth() + 1 // 1-12
  const d = date.getDate()
  const easter = easterFor(y)

  // Remembrance Day first — it also wins all precedence downstream.
  if (m === 11 && d === 11) return { key: 'remembrance', name: 'Remembrance Day', prop: 'poppy', antics: false }

  if (m === 1 && d === 1) return { key: 'new-year', name: 'New Year', prop: 'party-hat', antics: true, particles: 'confetti' }
  if (m === 2 && d === 14) return { key: 'valentines', name: "Valentine's Day", prop: 'heart', antics: true, particles: 'hearts' }
  if (m === 3 && d === 17) return { key: 'st-patricks', name: "St. Patrick's Day", prop: 'shamrock', antics: true }
  if (m === easter.month && d === easter.day) return { key: 'easter', name: 'Easter', prop: 'egg', antics: true }
  if (m === 4 && d === 22) return { key: 'earth-day', name: 'Earth Day', prop: 'sprout', antics: true }
  if (m === 5 && d === victoriaDay(y)) return { key: 'victoria', name: 'Victoria Day', prop: 'crown', antics: true }
  if (m === 6 && d === 24) return { key: 'st-jean', name: 'Saint-Jean-Baptiste', prop: 'fleur', antics: true }
  if (m === 7 && d === 1) return { key: 'canada-day', name: 'Canada Day', prop: 'canada-flag', antics: true, particles: 'maple' }
  if (m === 8 && d === nthWeekday(y, 8, 1, 1)) return { key: 'civic', name: 'Civic Holiday', prop: 'sun-hat', antics: true }
  if (m === 9 && d === nthWeekday(y, 9, 1, 1)) return { key: 'labour', name: 'Labour Day', prop: 'work-cap', antics: true }
  if (m === 10 && d === nthWeekday(y, 10, 1, 2)) return { key: 'thanksgiving', name: 'Thanksgiving', prop: 'autumn-leaf', antics: true }
  if (m === 10 && d === 31) return { key: 'halloween', name: 'Halloween', prop: 'pumpkin', antics: true }
  if (m === 12 && (d === 24 || d === 25)) return { key: 'christmas', name: 'Christmas', prop: 'santa-hat', antics: true, particles: 'snow' }
  if (m === 12 && d === 31) return { key: 'nye', name: "New Year's Eve", prop: 'party-hat', antics: true, particles: 'confetti' }
  return null
}

/** Date-seeded daily weather mood. Flurries only in winter; drizzle otherwise wet. */
export function weatherFor(date: Date): Weather {
  const seed = date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate()
  const r = mulberry32(seed)()
  if (seasonFor(date) === 'winter') {
    return r < 0.38 ? 'sunny' : r < 0.62 ? 'breezy' : 'flurry'
  }
  return r < 0.52 ? 'sunny' : r < 0.82 ? 'breezy' : 'drizzle'
}

/** Everything Pip needs to know about today, precedence applied. */
export function almanacFor(date: Date): Almanac {
  const season = seasonFor(date)
  const weather = weatherFor(date)
  const holiday = holidayFor(date)
  // Prop precedence: Remembrance > holiday > season (winter toque) > none.
  const prop: PipProp | null = holiday ? holiday.prop : season === 'winter' ? 'toque' : null
  const antics = holiday ? holiday.antics : true
  const particles: Almanac['particles'] = holiday?.particles
    ?? (weather === 'flurry' ? 'snow'
      : season === 'spring' ? 'petals'
      : season === 'fall' ? 'leaves'
      : null)
  return { season, weather, holiday, prop, antics, particles }
}

/** Pip's bedtime. 23:00–05:59 local. */
export function isNightTime(date: Date): boolean {
  const h = date.getHours()
  return h >= 23 || h < 6
}
