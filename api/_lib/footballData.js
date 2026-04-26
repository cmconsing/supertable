// Server-side football-data.org client. Single function fetches one league's
// standings with exponential backoff (1s → 2s → 4s) and normalizes to the
// internal shape the rest of the app expects.

const BASE = 'https://api.football-data.org/v4';
const ATTEMPT_DELAYS_MS = [1000, 2000, 4000];

const ALLOWED_CODES = new Set(['PL', 'PD', 'BL1', 'SA', 'FL1']);

export function isAllowedCode(code) {
  return ALLOWED_CODES.has(code);
}

export async function fetchLeagueStandings(code) {
  if (!isAllowedCode(code)) throw new Error(`Disallowed competition code: ${code}`);
  const apiKey = process.env.FOOTBALL_DATA_API_KEY;
  if (!apiKey) throw new Error('FOOTBALL_DATA_API_KEY not configured');

  let lastErr;
  for (let i = 0; i <= ATTEMPT_DELAYS_MS.length; i++) {
    try {
      const res = await fetch(`${BASE}/competitions/${code}/standings`, {
        headers: { 'X-Auth-Token': apiKey },
      });
      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(`football-data ${res.status}: ${text || res.statusText}`);
      }
      return normalize(code, await res.json());
    } catch (e) {
      lastErr = e;
      const delay = ATTEMPT_DELAYS_MS[i];
      if (delay !== undefined) {
        console.warn(`[football-data] ${code} attempt ${i + 1} failed (${e.message}); retrying in ${delay}ms`);
        await sleep(delay);
      }
    }
  }
  throw lastErr;
}

function normalize(code, json) {
  const totalGroup = (json.standings || []).find((s) => s.type === 'TOTAL');
  const table = totalGroup?.table ?? [];

  const teams = table.map((row) => ({
    rank: row.position,
    name: row.team?.name ?? row.team?.shortName ?? 'Unknown',
    teamId: row.team?.id,
    logo: row.team?.crest,
    played: row.playedGames ?? 0,
    won: row.won ?? 0,
    drawn: row.draw ?? 0,
    lost: row.lost ?? 0,
    gf: row.goalsFor ?? 0,
    ga: row.goalsAgainst ?? 0,
    gd: row.goalDifference ?? 0,
    points: row.points ?? 0,
    form: parseForm(row.form),
    nextFixture: null,
  }));

  const currentMatchday =
    json.season?.currentMatchday ??
    teams.reduce((m, t) => Math.max(m, t.played), 0);

  return {
    leagueCode: code,
    currentMatchday,
    updatedAt: new Date().toISOString(),
    teams,
  };
}

function parseForm(s) {
  if (!s || typeof s !== 'string') return [];
  return s
    .split(',')
    .map((c) => c.trim().toUpperCase())
    .filter(Boolean)
    .slice(-5);
}

export function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}
