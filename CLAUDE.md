# Notes for Claude working in this repo
<!-- preview-branch test: trivial edit to trigger Cloudflare build -->


## Project shape

Single-page calendar tool. The UI is one big component (`src/components/SisterDayCalculator.jsx`) that owns date input, location selection, and the orbital SVG rendering. Pure date math lives in `src/lib/sister-day.js` and is independently testable via `src/lib/sister-day.test.js` (vitest). City data is in `src/lib/locations.js`.

## Sister-day math — what lives there

`src/lib/sister-day.js` exports the core helpers:

- `dayOfYear(date)` — 1-based day of the year
- `winterSolsticeDoy(hemisphere)` / `summerSolsticeDoy(hemisphere)` — DOY constants per hemisphere
- `thermalLag(solDoy, coldDoy)` — short-arc distance in days between solstice and coldest day
- `sisterDay(date, coldDate)` — returns `{ sister, n, warmDate, coolDate }` where `n` is the unsigned distance to the coldest day, and `warmDate` / `coolDate` are the two sister dates assigned to the after-cold / before-cold sides of the year

None of these touch React or the DOM, so they're easy to seed-test.

## UI conventions

- Tailwind for styling — no CSS modules, no styled-components.
- shadcn-style aesthetic: zinc neutrals, white cards (`rounded-xl border border-zinc-200 shadow-sm`), Geist Sans body / Geist Mono for numbers.
- Data points have a fixed color palette in `POINT_COLORS`: emerald = warming, rose = cooling, sky = cold, amber = hot, violet = solstice. Don't introduce new accent colors without retiring one.
- The orbital SVG generates 12 month ticks, sun rays at the summer solstice, and labelled circles for every key date. Coordinates are derived from `doyToAng(dayOfYear(date))`.

## Workflow

```sh
npm run dev       # Vite, port hashed from project name
npm run test      # vitest watch
npm run test:run  # vitest one-shot (use this in CI / pre-commit)
npm run build     # production bundle
npm run lint
npm run deploy    # vite build && wrangler deploy
```

Fixed dev port is derived from the directory name (`vite.config.js`) so each q5m sibling repo lands on its own slot in 5173–5272.

## Deploy

**Production URL:** https://sister-day.q5m.io

**Hosting:** Cloudflare Workers (static assets) — project `sister-day` in the `q5m` Cloudflare account. Auto-deploys on push to `origin/main` via the Cloudflare GitHub integration. No manual deploy step.

`wrangler.jsonc` is the source of truth for project name, asset directory (`./dist`), and SPA fallback (`not_found_handling: single-page-application`). Manual deploy from CLI: `npm run deploy` (requires `wrangler login` once). Live request logs: `npm run cf:tail`.

## Version footer

The footer shows a short SHA and links to the corresponding commit on GitHub. The full SHA is injected at build time by `vite.config.js` via `import.meta.env.VITE_COMMIT_SHA`. **Do not** hardcode a SHA — leave it to the build.
