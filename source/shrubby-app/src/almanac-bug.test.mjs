// Run: node src/almanac-bug.test.mjs   (Node 24 strips the .ts types natively)
import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  easterFor, victoriaDay, nthWeekday, holidayFor, seasonFor, weatherFor,
  almanacFor, parseLocalDate, isNightTime, mulberry32,
} from './almanac-bug.ts'

const D = (y, m, d, h = 12) => new Date(y, m - 1, d, h)

test('Easter computus — pinned 2026–2030', () => {
  assert.deepEqual(easterFor(2026), { month: 4, day: 5 })
  assert.deepEqual(easterFor(2027), { month: 3, day: 28 })
  assert.deepEqual(easterFor(2028), { month: 4, day: 16 })
  assert.deepEqual(easterFor(2029), { month: 4, day: 1 })
  assert.deepEqual(easterFor(2030), { month: 4, day: 21 })
})

test('Victoria Day — Monday strictly before May 25, pinned', () => {
  assert.equal(victoriaDay(2026), 18) // May 25 2026 is itself a Monday
  assert.equal(victoriaDay(2027), 24)
  assert.equal(victoriaDay(2028), 22)
  assert.equal(victoriaDay(2029), 21)
  assert.equal(victoriaDay(2030), 20)
  for (let y = 2026; y <= 2040; y++) {
    const d = victoriaDay(y)
    assert.ok(d >= 18 && d <= 24, `range ${y}`)
    assert.equal(new Date(y, 4, d).getDay(), 1, `monday ${y}`)
  }
})

test('nth-weekday holidays — pinned 2026–2030', () => {
  const civic = { 2026: 3, 2027: 2, 2028: 7, 2029: 6, 2030: 5 }
  const labour = { 2026: 7, 2027: 6, 2028: 4, 2029: 3, 2030: 2 }
  const thanks = { 2026: 12, 2027: 11, 2028: 9, 2029: 8, 2030: 14 }
  for (let y = 2026; y <= 2030; y++) {
    assert.equal(nthWeekday(y, 8, 1, 1), civic[y], `civic ${y}`)
    assert.equal(nthWeekday(y, 9, 1, 1), labour[y], `labour ${y}`)
    assert.equal(nthWeekday(y, 10, 1, 2), thanks[y], `thanksgiving ${y}`)
    assert.equal(holidayFor(D(y, 10, thanks[y]))?.key, 'thanksgiving')
  }
})

test('fixed-date holidays land, non-holidays are null', () => {
  assert.equal(holidayFor(D(2026, 7, 1))?.key, 'canada-day')
  assert.equal(holidayFor(D(2026, 10, 31))?.key, 'halloween')
  assert.equal(holidayFor(D(2026, 6, 24))?.key, 'st-jean')
  assert.equal(holidayFor(D(2026, 4, 5))?.key, 'easter')
  assert.equal(holidayFor(D(2028, 2, 29)), null) // leap day is a civilian
  assert.equal(holidayFor(D(2026, 7, 2)), null)
})

test('prop precedence: Remembrance > holiday > winter toque', () => {
  const remembrance = almanacFor(D(2026, 11, 11))
  assert.equal(remembrance.prop, 'poppy')
  assert.equal(remembrance.antics, false) // dignified, no antics
  const xmas = almanacFor(D(2026, 12, 25))
  assert.equal(xmas.prop, 'santa-hat') // holiday beats winter toque
  const xmasEve = almanacFor(D(2026, 12, 24))
  assert.equal(xmasEve.prop, 'santa-hat')
  const plainWinter = almanacFor(D(2027, 1, 15))
  assert.equal(plainWinter.prop, 'toque') // season prop when no holiday
  const plainSummer = almanacFor(D(2026, 7, 15))
  assert.equal(plainSummer.prop, null)
})

test('seasons — meteorological boundaries', () => {
  assert.equal(seasonFor(D(2026, 2, 28)), 'winter')
  assert.equal(seasonFor(D(2026, 3, 1)), 'spring')
  assert.equal(seasonFor(D(2026, 5, 31)), 'spring')
  assert.equal(seasonFor(D(2026, 6, 1)), 'summer')
  assert.equal(seasonFor(D(2026, 8, 31)), 'summer')
  assert.equal(seasonFor(D(2026, 9, 1)), 'fall')
  assert.equal(seasonFor(D(2026, 11, 30)), 'fall')
  assert.equal(seasonFor(D(2026, 12, 1)), 'winter')
})

test('year rollover: Dec 31 NYE, Jan 1 New Year — distinct almanacs', () => {
  const nye = almanacFor(D(2026, 12, 31))
  const ny = almanacFor(D(2027, 1, 1))
  assert.equal(nye.holiday?.key, 'nye')
  assert.equal(ny.holiday?.key, 'new-year')
})

test('weather — deterministic, season-correct, all moods reachable', () => {
  for (const [y, m, d] of [[2026, 7, 11], [2026, 1, 5], [2027, 3, 3]]) {
    assert.equal(weatherFor(D(y, m, d)), weatherFor(D(y, m, d)))
  }
  const winterMoods = new Set(), warmMoods = new Set()
  for (let d = 0; d < 90; d++) winterMoods.add(weatherFor(new Date(2026, 11, 1 + d)))
  for (let d = 0; d < 90; d++) warmMoods.add(weatherFor(new Date(2026, 5, 1 + d)))
  assert.ok(winterMoods.has('flurry'), 'flurry reachable in winter')
  assert.ok(!warmMoods.has('flurry'), 'no flurries in summer')
  assert.ok(!winterMoods.has('drizzle'), 'no drizzle in winter')
  for (const mood of ['sunny', 'breezy']) {
    assert.ok(winterMoods.has(mood) && warmMoods.has(mood), `${mood} reachable`)
  }
  assert.ok(warmMoods.has('drizzle'), 'drizzle reachable')
})

test('parseLocalDate — Canada Day stays July 1 in any timezone', () => {
  const d = parseLocalDate('2026-07-01')
  assert.equal(d.getFullYear(), 2026)
  assert.equal(d.getMonth(), 6)
  assert.equal(d.getDate(), 1) // UTC parse would say June 30 in Canadian zones
  assert.equal(holidayFor(d)?.key, 'canada-day')
})

test('night window 23:00–05:59', () => {
  assert.ok(isNightTime(D(2026, 7, 11, 23)))
  assert.ok(isNightTime(new Date(2026, 6, 11, 5, 59)))
  assert.ok(!isNightTime(new Date(2026, 6, 11, 6, 0)))
  assert.ok(!isNightTime(D(2026, 7, 11, 12)))
})

test('mulberry32 — stable stream in [0,1)', () => {
  const r = mulberry32(20260711)
  const seq = [r(), r(), r()]
  const r2 = mulberry32(20260711)
  assert.deepEqual([r2(), r2(), r2()], seq)
  seq.forEach(v => assert.ok(v >= 0 && v < 1))
})

test('every holiday 2026–2030 fires exactly once per year (except christmas ×2)', () => {
  for (let y = 2026; y <= 2030; y++) {
    const counts = {}
    for (let t = new Date(y, 0, 1); t.getFullYear() === y; t.setDate(t.getDate() + 1)) {
      const h = holidayFor(t)
      if (h) counts[h.key] = (counts[h.key] || 0) + 1
    }
    const expected = {
      'new-year': 1, valentines: 1, 'st-patricks': 1, easter: 1, 'earth-day': 1,
      victoria: 1, 'st-jean': 1, 'canada-day': 1, civic: 1, labour: 1,
      thanksgiving: 1, halloween: 1, remembrance: 1, christmas: 2, nye: 1,
    }
    assert.deepEqual(counts, expected, `year ${y}`)
  }
})
