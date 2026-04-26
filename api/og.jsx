// Dynamic Open Graph image. Renders a 1200×630 snapshot of the current
// SuperTable: wordmark + tagline + 5 league cards with the current leader.
// Falls back to a data-less teaser if KV isn't populated yet.
//
// Hosted as a Vercel Edge function (faster cold-start, lighter resvg-wasm
// loading). Cache-Control set so social platforms don't hammer the endpoint.

import { ImageResponse } from '@vercel/og';
import { kvGet } from './_lib/kv.js';

export const config = { runtime: 'edge' };

const LEAGUES = [
  { id: 'EPL', code: 'PL',  name: 'Premier League', flag: '🏴' },
  { id: 'LAL', code: 'PD',  name: 'La Liga',        flag: '🇪🇸' },
  { id: 'BUN', code: 'BL1', name: 'Bundesliga',     flag: '🇩🇪' },
  { id: 'SEA', code: 'SA',  name: 'Serie A',        flag: '🇮🇹' },
  { id: 'LI1', code: 'FL1', name: 'Ligue 1',        flag: '🇫🇷' },
];

// Pull leader (rank 1) from each league's KV entry. Best-effort — if KV is
// missing or a league hasn't been cached yet, returns null and the card
// renders without team data.
async function loadLeaders() {
  const out = {};
  await Promise.all(
    LEAGUES.map(async (l) => {
      try {
        const entry = await kvGet(`standings:${l.code}`);
        const leader = entry?.teams?.find((t) => t.rank === 1) ?? entry?.teams?.[0];
        out[l.id] = leader ? { name: leader.name, points: leader.points } : null;
      } catch {
        out[l.id] = null;
      }
    })
  );
  return out;
}

export default async function handler() {
  const leaders = await loadLeaders();

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: '#0c0c0e',
          color: '#e2e2ea',
          display: 'flex',
          flexDirection: 'column',
          padding: '60px 72px',
          fontFamily: 'system-ui, -apple-system, "Segoe UI", sans-serif',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 18 }}>
          <span style={{ fontSize: 92, fontWeight: 700, letterSpacing: -3 }}>SuperTable</span>
          <span style={{ fontSize: 30, color: '#8a8a96', letterSpacing: 1 }}>2025–26</span>
        </div>
        <div style={{ fontSize: 28, color: '#8a8a96', marginTop: 4 }}>
          Five top European leagues, one view
        </div>

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Five leader cards */}
        <div style={{ display: 'flex', gap: 16 }}>
          {LEAGUES.map((l) => {
            const leader = leaders[l.id];
            return (
              <div
                key={l.id}
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  background: '#111114',
                  border: '1px solid #22222a',
                  borderLeft: '3px solid #1d6fa4', // UCL accent for the leader
                  borderRadius: 8,
                  padding: '18px 18px 16px',
                  gap: 8,
                  minHeight: 180,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 20 }}>
                  <span style={{ fontSize: 28 }}>{l.flag}</span>
                  <span style={{ color: '#8a8a96', letterSpacing: 0.5 }}>{l.name}</span>
                </div>
                <div
                  style={{
                    fontSize: leader ? 24 : 18,
                    fontWeight: 600,
                    marginTop: 4,
                    color: leader ? '#e2e2ea' : '#5a5a66',
                    lineHeight: 1.15,
                    display: 'flex',
                  }}
                >
                  {leader ? leader.name : '—'}
                </div>
                {leader && (
                  <div
                    style={{
                      fontFamily: 'ui-monospace, "SFMono-Regular", monospace',
                      fontSize: 36,
                      fontWeight: 600,
                      color: '#1d6fa4',
                      marginTop: 'auto',
                      display: 'flex',
                    }}
                  >
                    {leader.points} pts
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer line */}
        <div
          style={{
            marginTop: 28,
            fontSize: 18,
            color: '#5a5a66',
            fontFamily: 'ui-monospace, "SFMono-Regular", monospace',
            letterSpacing: 1,
            textTransform: 'uppercase',
          }}
        >
          live standings · color-coded · updated continuously
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      headers: {
        // Social platforms cache OG images; tell our edge to do the same so
        // hits don't fan out to KV. 10 min serve-fresh, 1 hr stale-while-revalidate.
        'Cache-Control': 'public, max-age=600, s-maxage=600, stale-while-revalidate=3600',
      },
    }
  );
}
