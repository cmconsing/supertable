import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { LEAGUES } from '../config/leagues.js';
import { MOCK_STANDINGS } from '../data/mockStandings.js';
import { resolveZones, annotateGamesInHand } from '../utils/resolveZones.js';
import { fetchStandings, triggerRefresh } from '../api/client.js';

const USE_MOCK = import.meta.env.VITE_USE_MOCK_DATA === 'true';
const SS_KEY = 'supertable.standings.session';
const FOCUS_REFETCH_DEBOUNCE_MS = 60_000;

// In mock mode the data is synthetic and stable, so we attach a fixed
// fetchedAt close to "now" so the time-since indicator looks right.
function mockWithFetchedAt() {
  const fetchedAt = new Date().toISOString();
  const out = {};
  for (const id of Object.keys(MOCK_STANDINGS)) {
    out[id] = { ...MOCK_STANDINGS[id], fetchedAt, stale: false };
  }
  return out;
}

function readSession() {
  try {
    const raw = sessionStorage.getItem(SS_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function writeSession(data) {
  try { sessionStorage.setItem(SS_KEY, JSON.stringify(data)); } catch {}
}

// Builds a {leagueId: {teamName: rank}} map from a raw block. Used by the
// position-change detector to compare new ranks to last-seen ranks.
function rankSnapshot(rawObj) {
  const snap = {};
  for (const [id, block] of Object.entries(rawObj)) {
    const m = {};
    for (const t of block?.teams ?? []) m[t.name] = t.rank;
    snap[id] = m;
  }
  return snap;
}

// Standings hook with sessionStorage hydration, lazy-refresh on tab focus,
// and per-team rank-change tracking for the ↑/↓ chips.
export function useStandings() {
  const [raw, setRaw] = useState(() => {
    if (USE_MOCK) return mockWithFetchedAt();
    return readSession() ?? {};
  });
  const [loading, setLoading] = useState(() =>
    !USE_MOCK && Object.keys(readSession() ?? {}).length === 0
  );
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Previous-rank snapshot (per league, per team name) so we can compute
  // delta annotations the next time data updates. Lives in a ref so it
  // persists across renders without re-triggering effects.
  const prevRanksRef = useRef(rankSnapshot(USE_MOCK ? mockWithFetchedAt() : (readSession() ?? {})));

  // rankChanges: { [leagueId]: { [teamName]: { delta, ts } } }
  const [rankChanges, setRankChanges] = useState({});

  // Tracks last successful fetch time so the visibilitychange listener can
  // debounce — flicking to another tab and back shouldn't blast refetches.
  const lastFetchAtRef = useRef(0);

  const fetchAll = useCallback(async (signal) => {
    const results = await Promise.all(
      LEAGUES.map(async (league) => {
        const data = await fetchStandings({
          league: league.footballDataCode,
          signal,
        });
        return [league.id, data];
      })
    );
    const next = Object.fromEntries(results);

    // Compute per-team rank deltas vs the last snapshot.
    const prev = prevRanksRef.current;
    const ts = Date.now();
    const changes = {};
    for (const [leagueId, block] of Object.entries(next)) {
      const prevMap = prev[leagueId] || {};
      const leagueChanges = {};
      for (const t of block.teams ?? []) {
        const before = prevMap[t.name];
        if (before != null && before !== t.rank) {
          // delta: positive = moved down (rank number went up), negative = moved up
          leagueChanges[t.name] = { delta: t.rank - before, ts };
        }
      }
      if (Object.keys(leagueChanges).length > 0) changes[leagueId] = leagueChanges;
    }

    prevRanksRef.current = rankSnapshot(next);
    lastFetchAtRef.current = ts;

    setRaw(next);
    writeSession(next);
    if (Object.keys(changes).length > 0) {
      setRankChanges((prevChanges) => ({ ...prevChanges, ...changes }));
    }
    setError(null);
    return next;
  }, []);

  // Initial fetch on mount.
  useEffect(() => {
    if (USE_MOCK) return;
    const ctrl = new AbortController();
    let cancelled = false;
    (async () => {
      try {
        await fetchAll(ctrl.signal);
      } catch (e) {
        if (cancelled || e.name === 'AbortError') return;
        setError(e.message || String(e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; ctrl.abort(); };
  }, [fetchAll]);

  // Tab-focus refetch — when the user switches back to the tab, refresh in
  // the background. Debounced so quick tab-flicks don't trigger fetches.
  useEffect(() => {
    if (USE_MOCK) return;
    const onVis = () => {
      if (document.visibilityState !== 'visible') return;
      if (Date.now() - lastFetchAtRef.current < FOCUS_REFETCH_DEBOUNCE_MS) return;
      fetchAll().catch((e) => setError(e.message || String(e)));
    };
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, [fetchAll]);

  // Force a server-side cache refresh, then refetch.
  const forceRefresh = useCallback(async () => {
    if (USE_MOCK) {
      setRaw(mockWithFetchedAt());
      return;
    }
    setRefreshing(true);
    setError(null);
    try {
      await triggerRefresh();
      await new Promise((r) => setTimeout(r, 500));
      await fetchAll();
    } catch (e) {
      setError(e.message || String(e));
    } finally {
      setRefreshing(false);
    }
  }, [fetchAll]);

  const standings = useMemo(() => {
    const out = {};
    for (const league of LEAGUES) {
      const block = raw[league.id];
      if (!block) continue;
      const zoned = resolveZones(league.id, block.teams);
      const annotated = annotateGamesInHand(zoned);
      // Attach rank-change annotations so TeamRow can render the chip.
      const leagueChanges = rankChanges[league.id] || {};
      const withChanges = annotated.map((t) =>
        leagueChanges[t.name] ? { ...t, rankChange: leagueChanges[t.name] } : t
      );
      out[league.id] = { ...block, teams: withChanges, league };
    }
    return out;
  }, [raw, rankChanges]);

  return {
    standings,
    loading,
    refreshing,
    error,
    usingMock: USE_MOCK,
    forceRefresh,
  };
}
