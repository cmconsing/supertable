# SuperTable

The fastest way to follow the European football season. Five top leagues
side-by-side, color-coded by what actually matters: Champions League, Europa
League, Conference League, and relegation zones.

## What's in here

- Live standings for England, Spain, Germany, Italy, France
- Trophy badges (`UCL`, `UEL`, `CUP`) for teams that earned European
  qualification by winning a tournament
- Cup-winner cascade logic — when a cup winner has already qualified via
  league position, the cup's European spot shifts to the next eligible team,
  with the affected row visually marked
- A "UCL Race" page that aggregates current Champions League contenders
  across all five leagues
- Light + dark themes
- A dynamic Open Graph image at `/api/og` that snapshots the current top of
  each league

## Stack

- React + Vite
- React Router
- Vercel serverless functions (`/api/*`)
- Vercel KV (Upstash Redis) for the standings cache
- football-data.org for live standings
- @vercel/og for the dynamic OG image

## Local development

```bash
npm install
cp .env.example .env
# fill in your football-data.org key (see below)
npm run dev
```

App runs at http://localhost:5173. Vite serves the React app and a small
middleware in `vite.config.js` handles `/api/*` requests so the proxy + OG
endpoints work locally without `vercel dev`.

## Environment variables

```
FOOTBALL_DATA_API_KEY=...     # server only — get one at football-data.org
KV_REST_API_URL=              # provisioned by Vercel; leave blank in dev
KV_REST_API_TOKEN=            # ditto
CRON_SECRET=...               # server only — protects manual refresh endpoint
VITE_USE_MOCK_DATA=false      # "true" to bypass the API and use src/data/mockStandings.js
```

Without KV credentials the app still works — every request hits
football-data directly, so it's slower and uses more API budget. KV
caching is recommended for production.

## How the data pipeline works

1. Browser hits `/api/standings?league=PL`
2. The serverless proxy reads `standings:PL` from Vercel KV
3. If the cached entry is younger than the freshness window — 5 minutes
   during typical match-day windows (Tue/Wed evenings, weekend afternoons),
   2 hours otherwise — it's served as-is.
4. If older, the proxy fetches fresh from football-data.org with
   exponential-backoff retry, writes back to KV, and returns the new data.
5. The frontend displays the response, hydrates a sessionStorage cache for
   instant tab-switch reloads, and re-fetches automatically when the tab
   regains focus.

This means visitors trigger refreshes lazily — there's no cron, no queue,
and no API budget burned when nobody's looking. See `api/standings.js`.

## Manual maintenance

A few things have to be kept in sync by hand because they're not in
football-data.org's free tier:

- **Domestic cup winners** (`src/config/cupWinners.js`) — flip
  `qualified: true` and set `teamName` after each cup final is played.
- **UCL / Europa League title holders** (`TITLE_HOLDERS` in the same file)
  — same drill after the May/June finals.
- **`SEASON_LABEL`** in `src/config/leagues.js` — bump each August when the
  new season starts.

When you flip a flag and reload, the badge appears, the cascade fires if
applicable, and the cascade target is automatically marked. No code changes
needed.

## Project layout

```
src/
  components/      # presentational components
  pages/           # route components (SuperTable, UCL Race, About, 404)
  hooks/           # useStandings, useTheme, useDocumentTitle, etc.
  config/          # leagues, qualification rules, cup winners
  data/            # mock standings for offline / demo mode
  utils/           # zone resolver, formatters, timeAgo
  api/             # client-side wrapper around /api/standings

api/
  standings.js     # KV-backed proxy with lazy refresh
  og.jsx           # @vercel/og dynamic Open Graph image
  cron/            # manual full-refresh handler (powers the dev panel)
  _lib/            # shared helpers (KV, football-data fetch)

public/
  favicon.svg
```

## Deployment

Connect the repo to Vercel. Build settings auto-detected. Under
Settings → Environment Variables, add `FOOTBALL_DATA_API_KEY` and
`CRON_SECRET`, plus `VITE_USE_MOCK_DATA=false`. Provision a KV database under
Storage → Create Database → KV; Vercel auto-injects `KV_REST_API_URL` and
`KV_REST_API_TOKEN`. Push to `main` and Vercel handles the rest.

## Credits

- Standings via [football-data.org](https://www.football-data.org/)
- Built with [Claude Code](https://claude.com/claude-code)
