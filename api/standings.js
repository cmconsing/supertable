// Frontend-facing proxy. Lazy-refresh strategy: visitors themselves trigger
// upstream fetches when the cached entry is older than a match-day-aware
// freshness window. Cached fresh entries are served instantly from KV.
//
// Throughput math: worst case is one upstream call per league per refresh
// window. During match windows (5 min) that's 12 calls/hour/league = 1/min.
// Outside match windows (2 hr) it's basically zero. Both well under the
// football-data.org 10-calls/minute limit.

import { fetchLeagueStandings, isAllowedCode } from './_lib/footballData.js';
import { kvGet, kvSet, kvAvailable } from './_lib/kv.js';

// Returns the max age (ms) we'll serve from cache before triggering a fresh
// upstream fetch. Tightened during the typical European match windows so
// in-game tables stay live; relaxed otherwise so quiet days don't burn API
// budget.
function freshnessMs() {
  const d = new Date();
  const day = d.getUTCDay();      // 0=Sun ... 6=Sat
  const hr = d.getUTCHours();
  const isMatchWindow =
    ((day === 2 || day === 3) && hr >= 18 && hr < 23) ||  // Tue/Wed 18-23 UTC
    ((day === 0 || day === 6) && hr >= 11 && hr < 22);    // Sat/Sun 11-22 UTC
  return isMatchWindow ? 5 * 60_000 : 2 * 60 * 60_000;
}

export default async function handler(req, res) {
  const league = req.query?.league;
  if (!league || !isAllowedCode(league)) {
    return send(res, 400, {
      error: 'Missing or invalid league. Allowed: PL, PD, BL1, SA, FL1',
    });
  }

  const key = `standings:${league}`;
  let entry = await kvGet(key);
  const now = Date.now();
  const ageMs = entry?.fetchedAt
    ? now - new Date(entry.fetchedAt).getTime()
    : Infinity;
  const threshold = freshnessMs();

  let stale = false;

  if (!entry || ageMs > threshold) {
    // Cache miss or beyond freshness window — refresh just this league.
    try {
      const fresh = await fetchLeagueStandings(league);
      entry = { ...fresh, fetchedAt: new Date().toISOString() };
      if (kvAvailable) await kvSet(key, entry);
    } catch (e) {
      console.error(`[standings] refresh failed for ${league}:`, e);
      if (!entry) {
        return send(res, 502, { error: e.message || String(e) });
      }
      // Upstream failed — serve the stale cached entry silently and let the
      // client surface a "stale" indicator.
      stale = true;
    }
  }

  return send(res, 200, { ...entry, stale });
}

function send(res, status, body) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(body));
}
