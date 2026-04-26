// Thin client over the /api/standings serverless proxy.
//
// The proxy reads from Vercel KV (populated by the cron) and falls through
// to a fresh upstream fetch only when the cached entry is missing or older
// than 3 hours. So the typical request is a single Redis lookup — fast and
// well within rate limits.

export async function fetchStandings({ league, signal }) {
  const url = `/api/standings?league=${encodeURIComponent(league)}`;
  const res = await fetch(url, { signal });
  if (!res.ok) {
    let detail = res.statusText;
    try {
      const body = await res.json();
      if (body?.error) detail = body.error;
    } catch {}
    throw new Error(`Standings ${res.status}: ${detail}`);
  }
  // Shape: { teams, currentMatchday, fetchedAt, stale, ... }
  return res.json();
}

// POST /api/cron/fetch-standings to refresh KV for every league. Wired to the
// dev panel's "Force refresh all" button.
export async function triggerRefresh() {
  const res = await fetch('/api/cron/fetch-standings', { method: 'POST' });
  if (!res.ok) {
    let detail = res.statusText;
    try {
      const body = await res.json();
      if (body?.error) detail = body.error;
    } catch {}
    throw new Error(`Refresh ${res.status}: ${detail}`);
  }
  return res.json();
}
