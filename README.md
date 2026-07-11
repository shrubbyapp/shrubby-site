# Shrubby Site Backup
Updated: 2026-07-11

## What's here
| File | What it is | MD5 |
|---|---|---|
| `shrubby-website-2026-07-10-original.html` | The complete site, one self-contained file (frozen original) | `1c64ecae8499b6b02a1f9d65432747c5` |
| `shrubby-website-2026-07-10-refined.html` | Same site + refreshed metadata (title/description/theme-color) | `39f300d83159c87b4435e50004572862` |
| `shrubby-website-2026-07-11-pip.html` | Site + Pip the footer ladybug (interactive, holiday/season/weather-aware) | `ff1d359bca99c8ab9a81942b302721a7` |
| `shrubby-website-2026-07-11-living-box.html` | Site + living mascot box (sky/seasons/weather/night, sunglasses gag, real chat) + Pip | `9295f50dfd9362dc8ced65f1fb45a9c3` |
| `shrubby-website-2026-07-11-calm-box.html` | Site + calm mascot box (chips + chat, in-frame animation removed) + Pip | `35088a7fa8ea7846c97ecfe67bdda570` |
| `shrubby-website-2026-07-11-pip-3d.html` | Site + Pip 3D flight fix (perspective/banking/pitch, monotonic paths) | `2b9eb0bddf8a0c0a78d88117be4de65f` |
| `shrubby-website-2026-07-11-pip-v2.html` | Site + Pip v2 bar-resident (3/4 clay sculpt, 14 bar acts, cursor-aware antennae) | `b45a5a86794ea4fd277abe1816c04f85` |
| `shrubby-website-2026-07-11-pip-film.html` | Site + footer ladybug as keyed reference film on the bar (code model removed; NOTE: 4 embedded videos now) | `7275c2f2a36a1567c8490d70edfc249d` |
| `shrubby-website-2026-07-11-no-ladybug.html` | Site with the footer ladybug fully removed (3 videos again; ladybug.tsx = null export) | `27623fb1a048c6d5aa71bee13f5db3b6` |
| `shrubby-website-2026-07-11-nav-almanac-fix.html` | Site + nav Almanac/Practice scroll fix (subpage-to-section retry) | `72fb10df24a580c099e33291838cc29e` |
| `patient-bloom.html` | "Patient Bloom" interactive generative meadow (p5.js inlined, runs offline) | `a54fbd6ea82bec63287d706e062b0158` |
| `patient-bloom-philosophy.md` | The artwork's design manifesto | — |
| `source/shrubby-app/` | Full editable React/TypeScript source of the site (28MB) | — |

Any `.html` here opens directly in a browser and can be hosted anywhere as-is.

## Rebuild the site from source
    cd source/shrubby-app
    npm install
    npx parcel build index.html --dist-dir dist --no-source-maps
    npx html-inline dist/index.html > bundle.html

## All other copies (recovery map)
- Living site artifact: https://claude.ai/code/artifact/c6e6a74d-565b-47f1-8ffa-d5e1fcfe220c (full version history)
- Frozen clone artifact: https://claude.ai/code/artifact/3834b288-800d-4f15-b47f-c9bced3cb6a8
- Patient Bloom artifact: https://claude.ai/code/artifact/04f8cae1-10a7-4306-8330-d52fe92e09a7
- Base44 app: file lives at public/shrubby.html (git-checkpointed; `/` route serves it to logged-out visitors)
