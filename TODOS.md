# TODOS — Shrubby landing site

## From /autoplan review of the Pip footer-ladybug plan (2026-07-11)

- [x] **Sync Pip to the Base44 copy** (P2, M) — DONE 2026-07-11 (checkpoint 6a523ab2b4578b03280953f3, text-only-bubble bundle, md5 cf4b5379…; synced via bsdiff delta through the MCP sandbox, no external upload)
  - What: After the footer ladybug ships on the artifact site, rebuild and re-upload `public/shrubby.html` in the Base44 app (litterbox → sandbox curl recipe in memory).
  - Why: The Base44 app serves the same bundle at `/` to logged-out visitors; it goes stale the moment the artifact updates.
  - Context: Recipe proven 2026-07-10 (checkpoint 6a517866…). Blocked by: Pip shipped.

- [ ] **Real-weather progressive enhancement** (P3, M)
  - What: On hosts whose CSP allows fetch (Base44), try open-meteo once per session; fall back to the synthetic daily mood. Keep one code path with a `getWeather()` seam.
  - Why: Pip reacting to the visitor's actual rain is a level-up; impossible on the artifact host (all external requests blocked).
  - Depends on: Pip shipped; Base44 sync.

- [ ] **Pip cameo on the #/guide colophon page** (P3, S)
  - What: A perched Pip near the colophon title, one look-around act, no almanac.
  - Why: Rewards the readers who care most about the craft; reuses the portable module as its first reuse test.

- [ ] **In-app Pip (the real job)** (P3, L)
  - What: Port `almanac-bug.ts` + Pip into the Base44 product app — watering-streak celebrations, seasonal cameos on the dashboard.
  - Why: CEO-voice finding: the footer is Pip's audition; daily-return behavior lives in the app, where the holiday almanac is actually seen repeatedly.
  - Depends on: footer Pip validated; portability constraint held (dependency-free modules).

- [ ] **Provincial holiday variants** (P3, S)
  - What: Family Day (differs by province), Louis Riel Day, Islander Day etc., behind a region toggle.
  - Why: v1 ships the national set only; provincial accuracy is a nice deepening for Canadian audiences.
