import fs from 'node:fs'
const [,, f1, f2, out] = process.argv
const load = f => JSON.parse(fs.readFileSync(f,'utf8')).entities
const all = [...load(f1), ...load(f2)]
const keys = ["common_name","scientific_name","summary","light","water","watering_interval_days","is_toxic","toxicity","care_tips","uses_symbolism","hardiness_notes"]
const score = e => keys.reduce((n,k)=>n+((e[k]!==undefined&&e[k]!==null&&e[k]!=="")?1:0),0)
// dedupe by scientific_name (case-insensitive), keep most complete
const byLatin = new Map()
for (const e of all) {
  const k = (e.scientific_name||e.common_name||'').trim().toLowerCase()
  if (!k) continue
  const cur = byLatin.get(k)
  if (!cur || score(e) > score(cur)) byLatin.set(k, e)
}
const clean = s => (s==null?'':String(s)).replace(/\s+/g,' ').trim()
const toxShort = e => {
  if (!e.is_toxic) return 'Non-toxic'
  const t = (e.toxicity||'').toLowerCase()
  if (/mild|caution|best left|unpicked|large (amounts|quantities)|if eaten in quantity/.test(t)) return 'Mild caution'
  return 'Toxic'
}
const native = e => /native|indigen/i.test(e.hardiness_notes||'') || /native|indigen/i.test(e.uses_symbolism||'')
const rows = [...byLatin.values()]
  .map(e => ({
    name: clean(e.common_name),
    latin: clean(e.scientific_name),
    desc: clean(e.summary),
    light: clean(e.light) || 'Adaptable',
    water: clean(e.water) || 'Average moisture',
    days: Number(e.watering_interval_days)||7,
    toxShort: toxShort(e),
    toxicity: clean(e.toxicity),
    care: clean(e.care_tips),
    hardiness: clean(e.hardiness_notes),
    note: clean(e.uses_symbolism),
    tag: native(e) ? 'Native' : 'Garden',
    badge: native(e) ? 'Canadian native' : 'Garden species',
    ...(e.image_url ? { photo: clean(e.image_url) } : {}),
  }))
  .filter(r => r.name && r.latin && r.desc)
  .sort((a,b)=>a.name.localeCompare(b.name))
const header = `// AUTO-GENERATED from the Base44 Shrubby PlantLibrary (app 6a4849d53c429026e8f65234).
// ${rows.length} Canadian species, deduped by scientific name. Do NOT edit by hand.
// Regenerate: pull PlantLibrary via the Base44 MCP, then \`node scripts/gen-library-data.mjs <p1> <p2> src/library-data.ts\`.
export type Species = {
  name: string; latin: string; desc: string
  light: string; water: string; days: number
  toxShort: string; toxicity: string
  care: string; hardiness: string; note: string
  tag: string; badge: string; photo?: string
}
export const SPECIES: Species[] = `
fs.writeFileSync(out, header + JSON.stringify(rows) + '\n')
console.log('wrote', rows.length, 'species ->', out, (fs.statSync(out).size/1024).toFixed(0)+'KB')
