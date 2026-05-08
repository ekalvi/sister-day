# Sister Day

**Live:** https://sisterday.q5m.ai — single-page calendar tool that finds the *sister day* of any date: the mirror date equidistant from the coldest day of the year. Auto-deploys on push to `main` (Cloudflare Workers static assets, project `sister-day`).

For a given location, let *C* denote the calendar date with the lowest long-term average daily temperature. The *sister day* of a date *D* is the unique date *D′* equidistant from *C* on the opposite side of the annual temperature cycle — if *D* falls *n* days after *C*, then *D′* falls *n* days before *C*, and vice versa.

## Features

- 40+ cities, both hemispheres
- Orbital SVG visualization of the annual temperature cycle, with the warming and cooling arcs drawn from the coldest day
- Thermal-lag explainer: why the coldest day isn't the winter solstice
- URL-safe single-page app, no backend

## Run locally

```sh
npm install
npm run dev      # http://localhost:5xxx (port hashed from project name)
npm run test     # vitest watch mode
npm run test:run # vitest one-shot
npm run build    # production bundle
npm run lint     # eslint
npm run deploy   # vite build + wrangler deploy
```

## Layout

- `src/components/SisterDayCalculator.jsx` — the full UI, state, and SVG orbital
- `src/lib/sister-day.js` — pure date math (sister mirror, day-of-year, thermal lag)
- `src/lib/sister-day.test.js` — vitest seed coverage for the date math
- `src/lib/locations.js` — coldest/warmest day data per city

## Stack

- React 19 + Vite 8
- Tailwind CSS 3
- Vitest 3 for unit tests
- Geist Sans / Geist Mono (loaded from Google Fonts at runtime)
- shadcn-style aesthetic: zinc neutrals, emerald = warming, rose = cooling, sky = cold, amber = hot, violet = solstice
- Cloudflare Workers static assets, custom domain `sisterday.q5m.ai`

## License

MIT
