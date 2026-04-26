// Manual full-refresh of all 5 leagues. Wired to the dev-panel "Force
// refresh" button — also reachable as a plain POST to the URL.
//
// (Still lives under /api/cron/ in case you upgrade to Vercel Pro later
// and want to add a crons array to vercel.json. For now /api/standings
// handles refresh lazily on user requests, so this is opt-in only.)
//
// Sequential with 6s spacing so even worst-case retry chains stay under
// the 10 req/min ceiling. A 30-second min-interval guard (stored in KV)
// prevents button-mashing from blasting the upstream API.

import { fetchLeagueStandings, sleep } from '../_lib/footballData.js';
import { kvGet, kvSet, kvAvailable } from '../_lib/kv.js';

const CODES = ['PL', 'PD', 'BL1', 'SA', 'FL1'];
const SPACING_MS = 6000;
const MIN_INTERVAL_MS = 30 * 1000; // throttle manual force-refresh
const LAST_RUN_KEY = 'standings:meta:lastRunAt';

export default async function handler(req, res) {
  // Min-interval guard. Skip when KV isn't configured (local dev fallback).
  if (kvAvailable) {
    const lastRunAt = await kvGet(LAST_RUN_KEY);
    if (lastRunAt && Date.now() - new Date(lastRunAt).getTime() < MIN_INTERVAL_MS) {
      return send(res, 429, {
        error: 'Refresh throttled — last run was less than 30s ago',
        lastRunAt,
      });
    }
    await kvSet(LAST_RUN_KEY, new Date().toISOString());
  }

  const results = [];
  for (let i = 0; i < CODES.length; i++) {
    const code = CODES[i];
    if (i > 0) await sleep(SPACING_MS);
    try {
      const data = await fetchLeagueStandings(code);
      const entry = { ...data, fetchedAt: new Date().toISOString() };
      const stored = await kvSet(`standings:${code}`, entry);
      results.push({ code, ok: true, stored });
    } catch (e) {
      console.error(`[cron] ${code} failed after retries:`, e);
      results.push({ code, ok: false, error: e.message || String(e) });
    }
  }

  return send(res, 200, {
    results,
    refreshedAt: new Date().toISOString(),
    kvAvailable,
  });
}

function send(res, status, body) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(body));
}
